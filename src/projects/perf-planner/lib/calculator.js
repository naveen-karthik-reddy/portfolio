import { getOptimalValue } from "./defaults.js";
import { DEFAULT_SETTINGS } from "./defaultSettings.js";

export const PROFILES = {
  mobile:  { rtt: 150, bandwidthKBs: 200,  cpuMultiplier: 4 },
  desktop: { rtt: 40,  bandwidthKBs: 1250, cpuMultiplier: 1 },
};

export function getProfile(profileKey, settings) {
  const profiles = settings?.networkProfiles ?? DEFAULT_SETTINGS.networkProfiles;
  return profiles[profileKey] ?? PROFILES[profileKey];
}

const COMPRESSION_RATIOS = {
  none:   { html: 1.0,  css: 1.0,  js: 1.0,  fonts: 1.0,  images: 1.0 },
  gzip:   { html: 0.15, css: 0.15, js: 0.20, fonts: 0.70, images: 1.0 },
  brotli: { html: 0.10, css: 0.12, js: 0.15, fonts: 0.65, images: 1.0 },
};

export function compressedSize(sizeKB, resourceType, compression) {
  const ratio = COMPRESSION_RATIOS[compression]?.[resourceType] ?? 1.0;
  return sizeKB * ratio;
}

// TCP slow-start simulation — returns download time in ms
export function tcpDownloadTime(bytes, rttMs, bandwidthKBs) {
  if (bytes <= 0) return 0;
  const bandwidthBps = bandwidthKBs * 1024;
  let remaining = bytes;
  let window = 14 * 1024; // initial cwnd
  let time = 0;
  while (remaining > 0) {
    const sent = Math.min(window, remaining);
    const transferMs = (sent / bandwidthBps) * 1000;
    time += Math.max(transferMs, rttMs); // each window takes at least 1 RTT
    remaining -= sent;
    window = window * 2;
  }
  return time;
}

function connectionOverhead(rttMs, cdn) {
  return cdn ? 0 : rttMs * 2; // +2 RTTs for DNS+TCP+TLS when no CDN
}

function getEffectiveRTT(rtt, cdn) {
  return cdn ? rtt * 0.4 : rtt;
}

// ── Metric calculations ──────────────────────────────────────────────

function calcFCP(inputs, derived) {
  const { htmlDownload, cssDownload, cssParseTime, fontDownload, connCost, cpuMultiplier } = derived;

  let fcp = inputs.ttfb + connCost + htmlDownload;

  // Render-blocking CSS delays FCP — unless critical CSS is inlined (avoids the blocking wait)
  if (inputs.renderBlockingCSS && !inputs.inlineCriticalCSS) {
    fcp += cssDownload + cssParseTime;
  } else if (inputs.inlineCriticalCSS) {
    // Small parse overhead for the inlined portion only
    fcp += (inputs.cssSize * 0.05) * cpuMultiplier;
  }

  if (inputs.inlineJS > 0) {
    fcp += inputs.inlineJS * 0.05 * cpuMultiplier;
  }
  if (inputs.fontDisplay === "block" && !inputs.fontsPreloaded) {
    fcp += fontDownload;
  }
  fcp += 50 * cpuMultiplier;

  return Math.max(fcp, 0);
}

function calcLCP(inputs, derived) {
  const { fcp, htmlDownload, cssDownload, cssParseTime, lcpDownload, cpuMultiplier } = derived;

  if (inputs.lcpType === "Text") {
    return fcp + 20 * cpuMultiplier;
  }

  let discoveryOffset = 0;
  // If both preloaded AND fetchpriority, image downloads in parallel with HTML
  const parallelWithHtml = inputs.lcpPreloaded && inputs.fetchpriority;
  if (!parallelWithHtml) {
    discoveryOffset += htmlDownload;
  }
  if (inputs.lcpType === "Background Image") {
    discoveryOffset += cssDownload + cssParseTime;
  }
  if (inputs.lcpType === "Video") {
    const videoDownload = derived.lcpDownload; // already capped to 500KB by caller
    const imageReady = inputs.ttfb + htmlDownload + videoDownload;
    return Math.max(fcp, imageReady);
  }

  const imageReady = inputs.ttfb + discoveryOffset + lcpDownload + inputs.lcpImageSize * 0.02 * cpuMultiplier;
  return Math.max(fcp, imageReady);
}

function calcTBT(inputs, derived) {
  const { cpuMultiplier } = derived;

  // Long tasks: each task's blocking time = max(duration × cpuMul − 50ms, 0)
  const perTaskBlocking = Math.max(0, inputs.avgLongTask * cpuMultiplier - 50);
  const longTaskTBT = inputs.longTasks * perTaskBlocking;

  // Remaining JS execution beyond declared long tasks (script eval, smaller tasks)
  // ~15% of remaining exec time bleeds into TBT as sub-threshold task clusters
  const declaredLongTaskMs = inputs.longTasks * inputs.avgLongTask;
  const remainingExecMs = Math.max(0, inputs.jsExecTime - declaredLongTaskMs);
  const jsExecTBT = remainingExecMs * cpuMultiplier * 0.15;

  // Third-party scripts create their own blocking tasks — each script is its own task
  const tpCount = inputs.thirdPartyCount > 0 ? inputs.thirdPartyCount : 1;
  const avgThirdPartyTaskMs = inputs.thirdPartyExec / tpCount;
  const perThirdPartyBlocking = Math.max(0, avgThirdPartyTaskMs * cpuMultiplier - 50);
  const thirdPartyTBT = tpCount * perThirdPartyBlocking;

  return longTaskTBT + jsExecTBT + thirdPartyTBT;
}

// TTI: when the main thread becomes idle and the page is reliably interactive.
// Modeled as FCP + the JS execution + long-task + third-party burden after first paint.
function calcTTI(inputs, fcp, cpuMultiplier) {
  // Total JS execution burden: take the larger of declared long-task total vs jsExecTime
  // (they overlap — long tasks ARE part of JS execution)
  const totalJsMs = Math.max(inputs.jsExecTime, inputs.longTasks * inputs.avgLongTask) * cpuMultiplier;
  const thirdPartyMs = inputs.thirdPartyExec * cpuMultiplier * (inputs.thirdPartyBlocking ? 0.6 : 0.25);
  // Minimum quiet window after FCP before interactions can reliably land
  return Math.max(fcp + 500, fcp + totalJsMs + thirdPartyMs);
}

function calcCLS(inputs) {
  return Math.min(
    1.0,
    inputs.cls +
    (inputs.imagesMissingDims ? 0.05 : 0) +
    (inputs.dynamicContent ? 0.10 : 0) +
    (inputs.fontSwapShift ? 0.03 : 0)
  );
}

export function computeMetrics(inputs, profile, resourceImpact = null) {
  const { rtt, bandwidthKBs, cpuMultiplier } = profile;
  const effectiveRTT = getEffectiveRTT(rtt, inputs.cdn);
  const connCost = connectionOverhead(effectiveRTT, inputs.cdn);

  // Compressed byte sizes
  const htmlBytes  = compressedSize(inputs.htmlSize,  "html",   inputs.compression) * 1024;
  const cssBytes   = compressedSize(inputs.cssSize,   "css",    inputs.compression) * 1024;
  const fontBytes  = compressedSize(inputs.fontSize,  "fonts",  inputs.compression) * 1024;
  const lcpBytes   = inputs.lcpType === "Text"
    ? 0
    : inputs.lcpType === "Video"
    ? compressedSize(Math.min(500, inputs.lcpImageSize), "images", inputs.compression) * 1024
    : compressedSize(inputs.lcpImageSize, "images", inputs.compression) * 1024;

  const htmlDownload = tcpDownloadTime(htmlBytes,  effectiveRTT, bandwidthKBs);
  const cssDownload  = tcpDownloadTime(cssBytes,   effectiveRTT, bandwidthKBs);
  const cssParseTime = (inputs.cssSize / 100) * 10 * cpuMultiplier;
  const fontDownload = tcpDownloadTime(fontBytes,  effectiveRTT, bandwidthKBs);
  const lcpDownload  = tcpDownloadTime(lcpBytes,   effectiveRTT, bandwidthKBs);

  const derived = { effectiveRTT, htmlDownload, cssDownload, cssParseTime, fontDownload, lcpDownload, connCost, cpuMultiplier, bandwidthKBs };

  let fcp = calcFCP(inputs, derived);
  let lcp = calcLCP(inputs, { ...derived, fcp });
  let tbt = calcTBT(inputs, derived);
  let cls = calcCLS(inputs);

  // Apply resource-list impact
  if (resourceImpact) {
    fcp += resourceImpact.extraBlockingMs ?? 0;
    tbt += (resourceImpact.extraLongTaskTBT ?? 0) + (resourceImpact.extraExecMs ?? 0) * 0.15;
    cls += resourceImpact.extraCLS ?? 0;
    if (resourceImpact.hasLcpResource && resourceImpact.lcpResourceMs > 0) {
      lcp = Math.max(fcp, inputs.ttfb + resourceImpact.lcpResourceMs);
    } else {
      lcp = Math.max(lcp, fcp);
    }
  }

  const si  = fcp * 0.55 + lcp * 0.45;
  const tti = calcTTI(inputs, fcp, cpuMultiplier);

  return { fcp, lcp, tbt, cls: Math.min(cls, 1.0), si, tti };
}

// ── Scoring ──────────────────────────────────────────────────────────

const DEFAULT_SCORE_CURVES = {
  fcp: { median: 3000, p10: 1800 },
  lcp: { median: 4000, p10: 2500 },
  tbt: { median: 600,  p10: 200  },
  cls: { median: 0.25, p10: 0.10 },
  si:  { median: 3900, p10: 3387 },
  tti: { median: 7300, p10: 3785 },
};

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

function normalCDF(x) {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

export function metricScore(value, metricKey, curves = null) {
  const curveSrc = curves ?? DEFAULT_SCORE_CURVES;
  const { median, p10 } = curveSrc[metricKey] ?? DEFAULT_SCORE_CURVES[metricKey];
  const sigma = Math.log(median / p10) / 0.9061;
  const score = 100 * (1 - normalCDF(Math.log(value / median) / sigma));
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function computeScores(metrics, settings = null) {
  const curves  = settings?.scoringCurves  ?? DEFAULT_SCORE_CURVES;
  const weights = settings?.scoringWeights ?? DEFAULT_SETTINGS.scoringWeights;
  const fcp = metricScore(metrics.fcp, "fcp", curves);
  const lcp = metricScore(metrics.lcp, "lcp", curves);
  const tbt = metricScore(metrics.tbt, "tbt", curves);
  const cls = metricScore(metrics.cls, "cls", curves);
  const si  = metricScore(metrics.si,  "si",  curves);
  const tti = metrics.tti != null ? metricScore(metrics.tti, "tti", curves) : 0;
  const overall = Math.round(
    fcp * (weights.fcp ?? 0.10) +
    lcp * (weights.lcp ?? 0.25) +
    tbt * (weights.tbt ?? 0.30) +
    cls * (weights.cls ?? 0.15) +
    si  * (weights.si  ?? 0.10) +
    tti * (weights.tti ?? 0.10)
  );
  return { fcp, lcp, tbt, cls, si, tti, overall };
}

export function scoreColor(score) {
  if (score >= 90) return "#0cce6b";
  if (score >= 50) return "#ffa400";
  return "#ff4e42";
}

// ── Waterfall ────────────────────────────────────────────────────────

export function computeWaterfall(inputs, profile) {
  const { rtt, bandwidthKBs, cpuMultiplier } = profile;
  const effectiveRTT = getEffectiveRTT(rtt, inputs.cdn);
  const connCost     = connectionOverhead(effectiveRTT, inputs.cdn);

  const htmlBytes = compressedSize(inputs.htmlSize, "html", inputs.compression) * 1024;
  const cssBytes  = compressedSize(inputs.cssSize,  "css",  inputs.compression) * 1024;
  const jsBytes   = compressedSize(inputs.jsSize,   "js",   inputs.compression) * 1024;
  const lcpBytes  = inputs.lcpType === "Text" ? 0
    : compressedSize(inputs.lcpImageSize, "images", inputs.compression) * 1024;

  const htmlDownload = tcpDownloadTime(htmlBytes, effectiveRTT, bandwidthKBs);
  const cssDownload  = tcpDownloadTime(cssBytes,  effectiveRTT, bandwidthKBs);
  const jsDownload   = tcpDownloadTime(jsBytes,   effectiveRTT, bandwidthKBs);
  const lcpDownload  = tcpDownloadTime(lcpBytes,  effectiveRTT, bandwidthKBs);
  const paintTime    = 50 * cpuMultiplier;

  return [
    { label: "TTFB",    ms: Math.round(inputs.ttfb + connCost), color: "#6366f1" },
    { label: "HTML",    ms: Math.round(htmlDownload),            color: "#3b82f6" },
    { label: "CSS",     ms: Math.round(cssDownload),             color: "#f59e0b" },
    { label: "JS",      ms: Math.round(jsDownload),              color: "#ef4444" },
    { label: "LCP Res", ms: Math.round(lcpDownload),             color: "#10b981" },
    { label: "Paint",   ms: Math.round(paintTime),               color: "#8b5cf6" },
  ];
}

// ── Optimization Roadmap ─────────────────────────────────────────────

const ROADMAP_CONFIG = [
  { field: "compression",        label: "Enable brotli compression",            effort: "Easy"   },
  { field: "cdn",                label: "Enable CDN",                           effort: "Easy"   },
  { field: "ttfb",               label: "Reduce TTFB",                          effort: "Medium" },
  { field: "renderBlockingCSS",  label: "Remove render-blocking CSS",           effort: "Medium" },
  { field: "inlineCriticalCSS",  label: "Inline critical CSS",                  effort: "Medium" },
  { field: "jsLoading",          label: "Use defer/async for JS loading",       effort: "Easy"   },
  { field: "jsSize",             label: "Reduce total JS size",                 effort: "Hard"   },
  { field: "jsExecTime",         label: "Reduce JS execution time",             effort: "Hard"   },
  { field: "longTasks",          label: "Break up long tasks",                  effort: "Hard"   },
  { field: "avgLongTask",        label: "Shorten individual long tasks",        effort: "Hard"   },
  { field: "lcpPreloaded",       label: "Preload LCP resource",                 effort: "Easy"   },
  { field: "fetchpriority",      label: "Add fetchpriority=high to LCP image",  effort: "Easy"   },
  { field: "imageFormat",        label: "Use AVIF/WebP image format",           effort: "Easy"   },
  { field: "lcpImageSize",       label: "Optimize LCP image size",              effort: "Medium" },
  { field: "thirdPartyBlocking", label: "Remove render-blocking third-party",   effort: "Medium" },
  { field: "thirdPartyCount",    label: "Reduce third-party scripts",           effort: "Medium" },
  { field: "thirdPartyExec",     label: "Defer third-party execution",          effort: "Medium" },
  { field: "fontDisplay",        label: "Use font-display: optional or swap",   effort: "Easy"   },
  { field: "fontsPreloaded",     label: "Preload web fonts",                    effort: "Easy"   },
  { field: "cssSize",            label: "Reduce total CSS size",                effort: "Medium" },
  { field: "inlineJS",           label: "Remove inline JS from <head>",         effort: "Medium" },
  { field: "cls",                label: "Fix layout shift (CLS)",               effort: "Medium" },
  { field: "imagesMissingDims",  label: "Add dimensions to all images",         effort: "Easy"   },
  { field: "dynamicContent",     label: "Reserve space for dynamic content",    effort: "Medium" },
  { field: "fontSwapShift",      label: "Reduce font-swap layout shift",        effort: "Medium" },
];

// Fixed absolute targets — these represent "green zone" performance.
// Using fixed targets (not relative %) ensures the roadmap gain grows
// monotonically as the current value worsens.
const ROADMAP_TARGETS = {
  // Numeric — lower is better, target is the green-zone ceiling
  ttfb:              150,
  htmlSize:          30,
  inlineJS:          0,
  cssSize:           60,
  cssFiles:          2,
  jsSize:            150,
  largestBundle:     100,
  jsFiles:           4,
  jsExecTime:        300,
  longTasks:         1,
  avgLongTask:       80,
  lcpImageSize:      100,
  fontCount:         2,
  fontSize:          60,
  thirdPartyCount:   1,
  thirdPartySize:    60,
  thirdPartyExec:    150,
  cls:               0.05,
};

// Returns true when the current value is already at or better than the roadmap target.
function fieldIsOptimal(field, value) {
  // Special-case ordered-string fields where multiple values are "good"
  switch (field) {
    case "protocol":          return value !== "HTTP/1.1";
    case "jsLoading":         return value !== "render-blocking";
    case "compression":       return value === "brotli";
    case "imageFormat":       return value === "AVIF" || value === "WebP";
    case "fontDisplay":       return value === "optional" || value === "swap";
    // Boolean fields — target is the OPTIMAL_VALUES entry
    case "cdn":               return value === true;
    case "renderBlockingCSS": return value === false;
    case "inlineCriticalCSS": return value === true;
    case "cssPreloaded":      return value === true;
    case "lcpPreloaded":      return value === true;
    case "fetchpriority":     return value === true;
    case "fontsPreloaded":    return value === true;
    case "thirdPartyBlocking":return value === false;
    case "imagesMissingDims": return value === false;
    case "dynamicContent":    return value === false;
    case "fontSwapShift":     return value === false;
    default: {
      const target = ROADMAP_TARGETS[field];
      if (target === undefined) return true;
      return Number(value) <= Number(target);
    }
  }
}

// Returns the absolute target for a field (used in the hypothetical scenario).
function getRoadmapTarget(field, _cur) {
  switch (field) {
    case "protocol":          return "HTTP/2";
    case "jsLoading":         return "defer";
    case "compression":       return "brotli";
    case "imageFormat":       return "AVIF";
    case "fontDisplay":       return "optional";
    case "cdn":               return true;
    case "renderBlockingCSS": return false;
    case "inlineCriticalCSS": return true;
    case "cssPreloaded":      return true;
    case "lcpPreloaded":      return true;
    case "fetchpriority":     return true;
    case "fontsPreloaded":    return true;
    case "thirdPartyBlocking":return false;
    case "imagesMissingDims": return false;
    case "dynamicContent":    return false;
    case "fontSwapShift":     return false;
    default:
      return ROADMAP_TARGETS[field] ?? null;
  }
}

function describeRoadmapChange(field, cur, target) {
  if (typeof target === "boolean") return target ? "enable" : "disable";
  if (typeof target === "string")  return `${cur} → ${target}`;
  return `${typeof cur === "number" ? (Number.isInteger(cur) ? cur : cur.toFixed(2)) : cur} → ${Number.isInteger(target) ? target : target.toFixed(2)}`;
}

export function computeRoadmap(inputs, locked, mobileScores, desktopScores, settings = null) {
  const currentMobile  = mobileScores.overall;
  const currentDesktop = desktopScores.overall;

  // Compute current metrics once outside the loop (no resource impact — roadmap is input-only)
  const curMobileMet  = computeMetrics(inputs, PROFILES.mobile);
  const curDesktopMet = computeMetrics(inputs, PROFILES.desktop);

  const suggestions = [];
  const METRIC_KEYS = ["fcp", "lcp", "tbt", "cls", "si", "tti"];

  for (const { field, label, effort } of ROADMAP_CONFIG) {
    if (locked[field]) continue;
    if (fieldIsOptimal(field, inputs[field])) continue;

    const target = getRoadmapTarget(field, inputs[field]);
    if (target === null || target === undefined) continue;

    // Apply this single change hypothetically
    const hypothetical = { ...inputs, [field]: target };
    const mMet = computeMetrics(hypothetical, PROFILES.mobile);
    const dMet = computeMetrics(hypothetical, PROFILES.desktop);
    const mSc  = computeScores(mMet, settings);
    const dSc  = computeScores(dMet, settings);

    const mobileGain  = mSc.overall - currentMobile;
    const desktopGain = dSc.overall - currentDesktop;

    // Only include if mobile score strictly improves (prevents phantom suggestions)
    if (mobileGain <= 0) continue;

    // Show which metrics got better (≥3% lower value = improvement for all metrics)
    const metricsImproved = METRIC_KEYS
      .filter((k) => mMet[k] < curMobileMet[k] * 0.97)
      .map((k) => {
        const diff = curMobileMet[k] - mMet[k];
        const unit = k === "cls" ? "" : "ms";
        return `${k.toUpperCase()} -${k === "cls" ? diff.toFixed(2) : Math.round(Math.abs(diff))}${unit}`;
      });

    suggestions.push({
      field,
      label,
      currentVal: inputs[field],
      optimalVal: target,
      changeDesc: describeRoadmapChange(field, inputs[field], target),
      mobileGain: Math.round(mobileGain),
      desktopGain: Math.round(desktopGain),
      metricsImproved,
      effort,
    });
  }

  // Sort by mobile gain descending — strictly decreasing from worse inputs
  return suggestions.sort((a, b) => b.mobileGain - a.mobileGain);
}
