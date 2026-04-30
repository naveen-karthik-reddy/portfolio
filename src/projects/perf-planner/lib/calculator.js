// Per-resource browser-physics simulator.
//
// Public API — all metric/score functions take (resources, pageMeta, profile, calibration).
// Internally we walk the request list and compute each resource's start/end on a
// timeline keyed off TCP slow-start, connection-pool reuse, and parallel cohorts.
// FCP/LCP fall out of the critical path; TBT/CLS sum per-resource contributions.

import { DEFAULT_SETTINGS } from "./defaultSettings.js";

export const PROFILES = {
  mobile:  { rtt: 150, bandwidthKBs: 200,  cpuMultiplier: 4 },
  desktop: { rtt: 40,  bandwidthKBs: 1250, cpuMultiplier: 1 },
};

export function getProfile(profileKey, settings) {
  const profiles = settings?.networkProfiles ?? DEFAULT_SETTINGS.networkProfiles;
  return profiles[profileKey] ?? PROFILES[profileKey];
}

// TCP slow-start download time. `sizeKB` is the wire bytes (already compressed
// by whatever encoding the server used); we never re-apply a compression ratio.
export function tcpDownloadTime(bytes, rttMs, bandwidthKBs) {
  if (bytes <= 0 || bandwidthKBs <= 0) return 0;
  const bandwidthBps = bandwidthKBs * 1024;
  let remaining = bytes;
  let window = 14 * 1024; // initial cwnd ~= 14 KB
  let time = 0;
  while (remaining > 0) {
    const sent = Math.min(window, remaining);
    const transferMs = (sent / bandwidthBps) * 1000;
    time += Math.max(transferMs, rttMs); // each window takes at least 1 RTT
    remaining -= sent;
    window *= 2;
  }
  return time;
}

// Effective RTT depends on where the resource lives.
function effRTT(rtt, source, cdn) {
  if (source === "third-party-cdn") return rtt * 0.8;
  if (source === "own-cdn")          return rtt * 0.4;
  if (cdn) return rtt * 0.4;
  return rtt;
}

// DNS + TCP + TLS — paid on the first request to a given host only.
function connSetup(rtt, source, cdn, isFirstToHost) {
  if (!isFirstToHost) return 0;
  if (source === "same-origin" && cdn) return 0;
  if (source === "own-cdn")              return 0;
  return rtt * 2;
}

function hostKey(r) {
  if (r.source === "third-party-cdn") return `tp:${r.id}`; // each third-party gets its own host
  if (r.source === "own-cdn")          return "own-cdn";
  return "same-origin";
}

// Run a parallel cohort: every resource starts now, bandwidth divided equally,
// each finishes at its own (setup + slow-start download) time. Returns the
// cohort's total elapsed (max finish) and a per-resource finish map.
function downloadCohort(cohort, profile, meta, hostsOpen) {
  if (cohort.length === 0) return { duration: 0, finishById: new Map() };
  const share = profile.bandwidthKBs / cohort.length;
  const finishById = new Map();
  let duration = 0;
  for (const r of cohort) {
    const eRtt = effRTT(profile.rtt, r.source, meta.cdn);
    const setup = connSetup(profile.rtt, r.source, meta.cdn, !hostsOpen.has(hostKey(r)));
    hostsOpen.add(hostKey(r));
    const bytes = (r.sizeKB ?? 0) * 1024 * (r.count ?? 1);
    const dl = tcpDownloadTime(bytes, eRtt, share);
    const total = setup + dl;
    finishById.set(r.id, total);
    if (total > duration) duration = total;
  }
  return { duration, finishById };
}

export function computeMetrics(resources, pageMeta, profile, calibration) {
  const list = resources ?? [];
  const meta = pageMeta ?? {};
  const cpuMul = profile.cpuMultiplier;

  // ── 1. HTML phase ───────────────────────────────────────────────
  // The document downloads alone, full bandwidth, after TTFB + connection setup.
  const html = list.find((r) => r.type === "html");
  const htmlSource = html?.source ?? "same-origin";
  const htmlSetup = connSetup(profile.rtt, htmlSource, meta.cdn, true);
  const htmlBytes = (html?.sizeKB ?? 0) * 1024;
  const eRttHtml = effRTT(profile.rtt, htmlSource, meta.cdn);
  const htmlDownload = tcpDownloadTime(htmlBytes, eRttHtml, profile.bandwidthKBs);
  const htmlFirstByte = (meta.ttfb ?? 0) + htmlSetup;
  const htmlDone = htmlFirstByte + htmlDownload;

  const hostsOpen = new Set();
  if (html) hostsOpen.add(hostKey(html));

  // ── 2. Render-blocking cohort ──────────────────────────────────
  // CSS/JS marked "blocking" hold up first paint. Inline CSS/JS don't.
  const blocking = list.filter(
    (r) => (r.type === "css" || r.type === "js")
      && r.loading === "blocking"
      && !r.inline
  );
  // If there's any inlined critical CSS, blocking CSS doesn't extend FCP.
  const hasInlineCss = list.some((r) => r.type === "css" && r.inline);
  const blockingForFcp = hasInlineCss
    ? blocking.filter((r) => r.type !== "css")
    : blocking;
  const blockingResult = downloadCohort(blockingForFcp, profile, meta, new Set(hostsOpen));

  // Inline JS adds parse-on-main-thread cost to FCP.
  const inlineJsKB = list
    .filter((r) => r.type === "js" && r.inline)
    .reduce((s, r) => s + (r.sizeKB ?? 0) * (r.count ?? 1), 0);

  // ── 3. FCP ─────────────────────────────────────────────────────
  let fcp = Math.max(htmlDone, htmlFirstByte + blockingResult.duration);
  fcp += inlineJsKB * 0.05 * cpuMul;
  fcp += 50 * cpuMul; // browser paint cost

  // Block-display fonts that aren't preloaded delay first paint.
  const blockFontMaxMs = list
    .filter((r) => r.type === "font" && r.fontDisplay === "block" && r.loading !== "preload")
    .reduce((m, r) => {
      const eRtt = effRTT(profile.rtt, r.source, meta.cdn);
      const dl = tcpDownloadTime((r.sizeKB ?? 0) * 1024, eRtt, profile.bandwidthKBs * 0.5);
      return Math.max(m, dl);
    }, 0);
  fcp += blockFontMaxMs;

  // ── 4. LCP ─────────────────────────────────────────────────────
  const lcpRes = list.find((r) => r.isLcp);
  let lcp;
  if (!lcpRes) {
    // Text LCP: roughly tied to FCP plus a tiny render delay.
    lcp = fcp + 20 * cpuMul;
  } else {
    // When was the LCP element discovered?
    let discovery;
    if (lcpRes.loading === "preload" && lcpRes.fetchpriority) {
      discovery = 0; // truly parallel with HTML
    } else if (lcpRes.loading === "preload") {
      discovery = htmlFirstByte;
    } else if (lcpRes.type === "image" || lcpRes.type === "video") {
      discovery = htmlFirstByte; // parser hits <img> as HTML streams in
    } else {
      // Image referenced via CSS background — wait for CSS too
      discovery = htmlDone;
    }
    const eRttLcp = effRTT(profile.rtt, lcpRes.source, meta.cdn);
    const lcpSetup = connSetup(profile.rtt, lcpRes.source, meta.cdn, !hostsOpen.has(hostKey(lcpRes)));
    const lcpBytes = (lcpRes.sizeKB ?? 0) * 1024 * (lcpRes.count ?? 1);
    // LCP shares bandwidth with whatever else is in flight; rough: half.
    const lcpDl = tcpDownloadTime(lcpBytes, eRttLcp, profile.bandwidthKBs * 0.5);
    const lcpReady = discovery + lcpSetup + lcpDl;
    const renderCost = (lcpRes.sizeKB ?? 0) * 0.02 * cpuMul;
    lcp = Math.max(fcp, lcpReady + renderCost);
  }

  // ── 5. TBT ─────────────────────────────────────────────────────
  // Imported execTimeMs / longTaskMs are observed under whatever CPU throttle
  // Lighthouse used at calibration time (4× for mobile-default, 1× for
  // desktop). For other profiles we re-scale by cpuMul / calibrationCpuMul
  // instead of multiplying through (which would double-count the throttle).
  const calibrationCpu = calibration?.cpuSlowdownMultiplier ?? 4;
  const execScale = cpuMul / calibrationCpu;
  let tbt = 0;
  for (const r of list) {
    if (r.type !== "js") continue;
    const longCount = r.longTaskCount ?? 0;
    const longAvg = (r.avgLongTaskMs ?? 0) * execScale;
    const exec = (r.execTimeMs ?? 0) * execScale;
    const perLong = Math.max(0, longAvg - 50);
    tbt += longCount * perLong;
    const declaredLong = longCount * longAvg;
    const residual = Math.max(0, exec - declaredLong);
    tbt += residual * 0.08; // observed sub-50ms clusters typically yield ~8% as TBT
  }

  // ── 6. CLS ─────────────────────────────────────────────────────
  let cls = 0;
  for (const r of list) {
    if (r.type === "image" && r.missingDimensions) cls += 0.05;
    if (r.type === "font" && r.fontDisplay === "swap" && r.loading !== "preload") cls += 0.03;
  }
  cls = Math.min(1.0, cls);

  // ── 7. SI / TTI ────────────────────────────────────────────────
  const si = fcp * 0.55 + lcp * 0.45;
  const totalJsExec = list.filter((r) => r.type === "js").reduce((s, r) => s + (r.execTimeMs ?? 0), 0) * execScale;
  const thirdPartyExec = list
    .filter((r) => r.type === "js" && r.source === "third-party-cdn")
    .reduce((s, r) => s + (r.execTimeMs ?? 0), 0) * execScale;
  const blockingThird = list.some((r) => r.source === "third-party-cdn" && r.loading === "blocking");
  const tti = Math.max(
    fcp + 500,
    fcp + totalJsExec + thirdPartyExec * (blockingThird ? 0.6 : 0.25)
  );

  return { fcp, lcp, tbt, cls, si, tti };
}

// ── Scoring ──────────────────────────────────────────────────────────

const DEFAULT_SCORE_CURVES = {
  fcp: { median: 3000, p10: 1800 },
  lcp: { median: 4000, p10: 2500 },
  tbt: { median: 600,  p10: 200  },
  cls: { median: 0.25, p10: 0.10 },
  si:  { median: 3900, p10: 3387 },
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
  const score = 100 * (1 - normalCDF(Math.log(Math.max(value, 0.0001) / median) / sigma));
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
  const overall = Math.round(
    fcp * (weights.fcp ?? 0.10) +
    lcp * (weights.lcp ?? 0.25) +
    tbt * (weights.tbt ?? 0.30) +
    cls * (weights.cls ?? 0.25) +
    si  * (weights.si  ?? 0.10)
  );
  return { fcp, lcp, tbt, cls, si, overall };
}

export function scoreColor(score) {
  if (score >= 90) return "#0cce6b";
  if (score >= 50) return "#ffa400";
  return "#ff4e42";
}

// ── Waterfall ────────────────────────────────────────────────────────

export function computeWaterfall(resources, pageMeta, profile) {
  const list = resources ?? [];
  const meta = pageMeta ?? {};
  const html = list.find((r) => r.type === "html");
  const htmlSource = html?.source ?? "same-origin";
  const htmlSetup = connSetup(profile.rtt, htmlSource, meta.cdn, true);
  const eRttHtml = effRTT(profile.rtt, htmlSource, meta.cdn);
  const htmlDownload = tcpDownloadTime((html?.sizeKB ?? 0) * 1024, eRttHtml, profile.bandwidthKBs);

  // Aggregate blocking CSS / JS / LCP downloads at half-bandwidth, just for display.
  function bulkDownload(pred, share = profile.bandwidthKBs * 0.5) {
    const subset = list.filter(pred);
    if (subset.length === 0) return 0;
    const bytes = subset.reduce((s, r) => s + (r.sizeKB ?? 0) * 1024 * (r.count ?? 1), 0);
    return tcpDownloadTime(bytes, profile.rtt, share);
  }

  const cssDownload = bulkDownload((r) => r.type === "css" && r.loading === "blocking" && !r.inline);
  const jsDownload  = bulkDownload((r) => r.type === "js"  && r.loading !== "lazy" && !r.inline);
  const lcpDownload = bulkDownload((r) => r.isLcp && (r.type === "image" || r.type === "video"));

  return [
    { label: "TTFB",    ms: Math.round((meta.ttfb ?? 0) + htmlSetup), color: "#6366f1" },
    { label: "HTML",    ms: Math.round(htmlDownload),                  color: "#3b82f6" },
    { label: "CSS",     ms: Math.round(cssDownload),                   color: "#f59e0b" },
    { label: "JS",      ms: Math.round(jsDownload),                    color: "#ef4444" },
    { label: "LCP Res", ms: Math.round(lcpDownload),                   color: "#10b981" },
    { label: "Paint",   ms: Math.round(50 * profile.cpuMultiplier),    color: "#8b5cf6" },
  ];
}

// ── Per-Resource Waterfall ───────────────────────────────────────────
//
// Returns per-resource timing rows for a DevTools-style waterfall.
// Timeline origin t=0 is navigation start.
//
// Two modes:
//   Real-timing — when resources carry Lighthouse timestamps (startTimeMs /
//     endTimeMs), use those directly for accurate bar positions.
//   Simulation  — for manually-entered resources that have no measured timing,
//     fall back to the TCP slow-start + RTT model.

function splitSetup(setupMs, rtt) {
  const requestMs = Math.max(1, rtt * 0.1);
  if (setupMs <= 0) return { dnsMs: 0, tcpMs: 0, sslMs: 0, requestMs };
  return { dnsMs: rtt * 0.5, tcpMs: rtt * 0.7, sslMs: rtt * 0.8, requestMs };
}

// True when a resource carries valid measured Lighthouse timestamps.
function hasRealTiming(r) {
  return r != null
    && typeof r.startTimeMs === "number"
    && typeof r.endTimeMs   === "number"
    && r.endTimeMs > r.startTimeMs;
}

// Build a simulated row object with all granular phases.
function makeRow(r, phase, startMs, setup, rtt, dlMs) {
  const { dnsMs, tcpMs, sslMs, requestMs } = splitSetup(setup, rtt);
  return {
    id: r.id, name: r.name || r.type, type: r.type,
    loading: r.loading, isLcp: !!r.isLcp, phase,
    startMs, stallMs: 0,
    dnsMs, tcpMs, sslMs, requestMs, ttfbMs: 0, downloadMs: dlMs,
    endMs: startMs + dnsMs + tcpMs + sslMs + requestMs + dlMs,
  };
}

// Build a real-timing row from Lighthouse-measured timestamps.
// responseReceivedMs stores networkRequestTime (when request bytes hit the wire).
// For HTTP/2 multiplexed connections this is nearly equal to startTimeMs.
// overhead (startMs→sendMs) = connection setup + request sent + TTFB; requestMs is carved out.
function makeRowFromReal(r, phase, rtt = 40) {
  const startMs   = Math.round(r.startTimeMs);
  const endMs     = Math.round(r.endTimeMs);
  const sendMs    = typeof r.responseReceivedMs === "number"
    ? Math.round(r.responseReceivedMs) : startMs;
  const overhead  = Math.max(0, sendMs - startMs);
  const requestMs = overhead > 0 ? Math.min(Math.max(1, Math.round(rtt * 0.1)), overhead) : 0;
  return {
    id: r.id, name: r.name || r.type, type: r.type,
    loading: r.loading, isLcp: !!r.isLcp, phase,
    startMs, stallMs: 0,
    dnsMs: 0, tcpMs: 0, sslMs: 0,
    requestMs,
    ttfbMs:     Math.max(0, overhead - requestMs),
    downloadMs: Math.max(0, endMs - sendMs),
    endMs,
    protocol: r.protocol ?? null,
    entity:   r.entity   ?? null,
  };
}


export function computeResourceWaterfall(resources, pageMeta, profile, calibration) {
  const list = resources ?? [];
  const meta = pageMeta ?? {};
  const rtt  = profile.rtt;

  const html = list.find((r) => r.type === "html");

  // ── Detect real-timing mode ──────────────────────────────────────
  // Use Lighthouse timestamps when the HTML row (or the majority of sub-resources)
  // carries measured timing. Manually added resources fall back to simulation.
  const subResources = list.filter((r) => r.type !== "html");
  let realCount = 0;
  for (const r of subResources) if (hasRealTiming(r)) realCount++;
  const useRealTiming = hasRealTiming(html)
    || (realCount > 0 && realCount >= Math.ceil(subResources.length * 0.5));

  // ── Simulation reference for HTML (needed for simulation-mode cohorts) ───
  const htmlSource    = html?.source ?? "same-origin";
  const htmlSetup     = connSetup(rtt, htmlSource, meta.cdn, true);
  const { dnsMs: hDns, tcpMs: hTcp, sslMs: hSsl, requestMs: hReq } = splitSetup(htmlSetup, rtt);
  const htmlTtfbVal   = meta.ttfb ?? 0;
  const htmlDlVal     = tcpDownloadTime((html?.sizeKB ?? 0) * 1024, effRTT(rtt, htmlSource, meta.cdn), profile.bandwidthKBs);
  const htmlFirstByte = hDns + hTcp + hSsl + hReq + htmlTtfbVal;
  const htmlDone      = htmlFirstByte + htmlDlVal;
  const hostsOpen     = new Set();
  if (html) hostsOpen.add(hostKey(html));

  const rows = [];

  // ── HTML row ─────────────────────────────────────────────────────
  if (html) {
    if (hasRealTiming(html)) {
      const startMs   = Math.round(html.startTimeMs);
      const sendMs    = typeof html.responseReceivedMs === "number"
        ? Math.round(html.responseReceivedMs) : startMs;
      const endMs     = Math.round(html.endTimeMs);
      const netMs     = Math.max(0, endMs - sendMs);
      const overhead  = Math.max(0, sendMs - startMs);
      const requestMs = overhead > 0 ? Math.min(Math.max(1, Math.round(rtt * 0.1)), overhead) : 0;
      const ttfbMs    = Math.max(0, overhead - requestMs);
      rows.push({
        id: html.id, name: html.name || "document", type: "html",
        loading: html.loading ?? "blocking", isLcp: false, phase: "blocking",
        startMs, endMs, stallMs: 0,
        dnsMs: 0, tcpMs: 0, sslMs: 0,
        requestMs, ttfbMs, downloadMs: netMs,
      });
    } else {
      rows.push({
        id: html.id, name: html.name || "document", type: "html",
        loading: html.loading ?? "blocking", isLcp: false, phase: "blocking",
        startMs: 0, stallMs: 0,
        dnsMs: hDns, tcpMs: hTcp, sslMs: hSsl,
        requestMs: hReq, ttfbMs: htmlTtfbVal, downloadMs: htmlDlVal,
        endMs: htmlDone,
      });
    }
  }

  if (useRealTiming) {
    // ── Real-timing mode: use Lighthouse-measured timestamps ─────────
    const htmlRefEnd = hasRealTiming(html) ? Math.round(html.endTimeMs) : htmlDone;

    for (const r of subResources) {
      if (hasRealTiming(r)) {
        const phase = r.isLcp ? "lcp"
          : r.loading === "blocking" ? "blocking"
          : r.loading === "lazy" ? "lazy" : "deferred";
        rows.push(makeRowFromReal(r, phase, rtt));
      } else {
        // Manually added resource without measured timing: simulate at end of HTML.
        const setup = connSetup(rtt, r.source, meta.cdn, false);
        const dlMs  = tcpDownloadTime((r.sizeKB ?? 0) * 1024 * (r.count ?? 1), effRTT(rtt, r.source, meta.cdn), profile.bandwidthKBs * 0.5);
        const phase = r.isLcp ? "lcp" : (r.loading ?? "deferred");
        rows.push(makeRow(r, phase, htmlRefEnd, setup, rtt, dlMs));
      }
    }
  } else {
    // ── Simulation mode: cohort-based TCP slow-start model ───────────
    const schedStep = Math.max(1, Math.round(rtt * 0.04));

    // Blocking CSS / JS
    const blockingCohort = list.filter(
      (r) => (r.type === "css" || r.type === "js") && r.loading === "blocking" && !r.inline && !r.isLcp
    );
    const blockShare = blockingCohort.length > 0 ? profile.bandwidthKBs / blockingCohort.length : profile.bandwidthKBs;

    blockingCohort.forEach((r, idx) => {
      const setup = connSetup(rtt, r.source, meta.cdn, !hostsOpen.has(hostKey(r)));
      hostsOpen.add(hostKey(r));
      const dlMs  = tcpDownloadTime((r.sizeKB ?? 0) * 1024 * (r.count ?? 1), effRTT(rtt, r.source, meta.cdn), blockShare);
      rows.push(makeRow(r, "blocking", htmlFirstByte + idx * schedStep, setup, rtt, dlMs));
    });

    // Deferred / async / module / preload
    const deferList = list.filter(
      (r) => !r.inline && !r.isLcp && r.type !== "html"
        && !(r.type === "css" && r.loading === "blocking")
        && !(r.type === "js"  && r.loading === "blocking")
        && r.loading !== "lazy"
    );
    const deferShare = deferList.length > 0 ? (profile.bandwidthKBs * 0.5) / deferList.length : profile.bandwidthKBs * 0.5;

    deferList.forEach((r, idx) => {
      const setup     = connSetup(rtt, r.source, meta.cdn, !hostsOpen.has(hostKey(r)));
      hostsOpen.add(hostKey(r));
      const dlMs      = tcpDownloadTime((r.sizeKB ?? 0) * 1024 * (r.count ?? 1), effRTT(rtt, r.source, meta.cdn), deferShare);
      const baseStart = (r.loading === "preload" && r.fetchpriority) ? 0 : htmlFirstByte;
      rows.push(makeRow(r, "deferred", baseStart + idx * schedStep, setup, rtt, dlMs));
    });

    // Lazy
    const lazyList  = list.filter((r) => r.loading === "lazy" && !r.isLcp && !r.inline);
    const lazyShare = lazyList.length > 0 ? (profile.bandwidthKBs * 0.5) / lazyList.length : profile.bandwidthKBs * 0.5;

    lazyList.forEach((r, idx) => {
      const setup = connSetup(rtt, r.source, meta.cdn, !hostsOpen.has(hostKey(r)));
      hostsOpen.add(hostKey(r));
      const dlMs  = tcpDownloadTime((r.sizeKB ?? 0) * 1024 * (r.count ?? 1), effRTT(rtt, r.source, meta.cdn), lazyShare);
      rows.push(makeRow(r, "lazy", htmlDone + idx * schedStep, setup, rtt, dlMs));
    });

    // LCP resource (hoisted above its cohort so it gets full bandwidth)
    const lcpRes = list.find((r) => r.isLcp && !r.inline);
    if (lcpRes) {
      const dupIdx = rows.findIndex((rw) => rw.id === lcpRes.id);
      if (dupIdx !== -1) rows.splice(dupIdx, 1);
      let lcpStart;
      if (lcpRes.loading === "preload" && lcpRes.fetchpriority) lcpStart = 0;
      else if (lcpRes.loading === "preload")                    lcpStart = htmlFirstByte;
      else if (lcpRes.type === "image" || lcpRes.type === "video") lcpStart = htmlFirstByte;
      else                                                         lcpStart = htmlDone;
      const setupLcp = connSetup(rtt, lcpRes.source, meta.cdn, !hostsOpen.has(hostKey(lcpRes)));
      const dlLcp    = tcpDownloadTime((lcpRes.sizeKB ?? 0) * 1024 * (lcpRes.count ?? 1), effRTT(rtt, lcpRes.source, meta.cdn), profile.bandwidthKBs * 0.5);
      rows.push(makeRow(lcpRes, "lcp", lcpStart, setupLcp, rtt, dlLcp));
    }
  }

  rows.sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);

  const { fcp: fcpMs, lcp: lcpMs } = computeMetrics(list, meta, profile, calibration);
  const totalMs = Math.max(...rows.map((r) => r.endMs), lcpMs, 1);

  return { rows, fcpMs: Math.round(fcpMs), lcpMs: Math.round(lcpMs), totalMs: Math.round(totalMs) };
}

// ── Optimization Roadmap (per-resource) ──────────────────────────────

const EFFORT = { Easy: "Easy", Medium: "Medium", Hard: "Hard" };

function shortName(name, max = 24) {
  if (!name) return "resource";
  return name.length > max ? name.slice(0, max - 1) + "…" : name;
}

function withResourcePatched(resources, id, patch) {
  return resources.map((r) => (r.id === id ? { ...r, ...patch } : r));
}

function diffMetricsImproved(curMetrics, hypMetrics) {
  const out = [];
  const KEYS = ["fcp", "lcp", "tbt", "cls", "si"];
  for (const k of KEYS) {
    if (hypMetrics[k] < curMetrics[k] * 0.97) {
      const diff = curMetrics[k] - hypMetrics[k];
      const unit = k === "cls" ? "" : "ms";
      out.push(`${k.toUpperCase()} -${k === "cls" ? diff.toFixed(2) : Math.round(Math.abs(diff))}${unit}`);
    }
  }
  return out;
}

export function computeRoadmap(resources, pageMeta, locked, profile, calibration, settings) {
  const list = resources ?? [];
  const meta = pageMeta ?? {};

  const curMetrics = computeMetrics(list, meta, profile, calibration);
  const curScore   = computeScores(curMetrics, settings).overall;

  const candidates = [];

  for (const r of list) {
    if (r.type === "image" && !["AVIF", "WebP"].includes(r.imageFormat)) {
      candidates.push({
        key: `r:${r.id}:format`, resourceId: r.id,
        label: `Convert ${shortName(r.name)} to AVIF`,
        changeDesc: `${r.imageFormat} → AVIF`, effort: EFFORT.Easy,
        patch: { resourceId: r.id, fields: { imageFormat: "AVIF" } },
      });
    }
    if (r.type === "js" && r.loading === "blocking" && !r.inline) {
      candidates.push({
        key: `r:${r.id}:loading`, resourceId: r.id,
        label: `Defer ${shortName(r.name)}`, changeDesc: "blocking → defer",
        effort: r.source === "third-party-cdn" ? EFFORT.Medium : EFFORT.Easy,
        patch: { resourceId: r.id, fields: { loading: "defer" } },
      });
    }
    if (r.isLcp && r.loading !== "preload") {
      candidates.push({
        key: `r:${r.id}:preload`, resourceId: r.id,
        label: `Preload ${shortName(r.name)}`, changeDesc: `${r.loading} → preload`,
        effort: EFFORT.Easy,
        patch: { resourceId: r.id, fields: { loading: "preload" } },
      });
    }
    if (r.isLcp && r.type === "image" && !r.fetchpriority) {
      candidates.push({
        key: `r:${r.id}:fetchpriority`, resourceId: r.id,
        label: `Add fetchpriority=high to ${shortName(r.name)}`,
        changeDesc: "fetchpriority: high", effort: EFFORT.Easy,
        patch: { resourceId: r.id, fields: { fetchpriority: true } },
      });
    }
    if (r.type === "image" && r.missingDimensions) {
      candidates.push({
        key: `r:${r.id}:dims`, resourceId: r.id,
        label: `Add dimensions to ${shortName(r.name)}`,
        changeDesc: "set width/height", effort: EFFORT.Easy,
        patch: { resourceId: r.id, fields: { missingDimensions: false } },
      });
    }
    if (r.type === "font" && (r.fontDisplay === "swap" || r.fontDisplay === "block")) {
      candidates.push({
        key: `r:${r.id}:fontdisplay`, resourceId: r.id,
        label: `Use font-display: optional on ${shortName(r.name)}`,
        changeDesc: `${r.fontDisplay} → optional`, effort: EFFORT.Easy,
        patch: { resourceId: r.id, fields: { fontDisplay: "optional" } },
      });
    }
    if (r.type === "js" && r.sizeKB > 100) {
      const target = Math.max(50, Math.round(r.sizeKB * 0.5));
      const execTarget = Math.round((r.execTimeMs ?? 0) * 0.5);
      candidates.push({
        key: `r:${r.id}:size`, resourceId: r.id,
        label: `Halve ${shortName(r.name)}`, changeDesc: `${r.sizeKB} → ${target} KB`,
        effort: EFFORT.Hard,
        patch: { resourceId: r.id, fields: { sizeKB: target, execTimeMs: execTarget } },
      });
    }
    if (r.type === "image" && r.sizeKB > 150) {
      const target = Math.round(r.sizeKB * 0.6);
      candidates.push({
        key: `r:${r.id}:size`, resourceId: r.id,
        label: `Compress ${shortName(r.name)}`, changeDesc: `${r.sizeKB} → ${target} KB`,
        effort: EFFORT.Medium,
        patch: { resourceId: r.id, fields: { sizeKB: target } },
      });
    }
    if (r.type === "css" && r.loading === "blocking" && r.sizeKB <= 30 && !r.inline) {
      candidates.push({
        key: `r:${r.id}:inline`, resourceId: r.id,
        label: `Inline critical CSS from ${shortName(r.name)}`, changeDesc: "inline true",
        effort: EFFORT.Medium,
        patch: { resourceId: r.id, fields: { inline: true } },
      });
    }
  }

  if (!meta.cdn) {
    candidates.push({
      key: "p:cdn", label: "Enable CDN", changeDesc: "off → on",
      effort: EFFORT.Easy, patch: { meta: { cdn: true } },
    });
  }

  if ((meta.ttfb ?? 0) > 200) {
    candidates.push({
      key: "p:ttfb", label: "Reduce server response time (TTFB)",
      changeDesc: `${Math.round(meta.ttfb)} → 150 ms`, effort: EFFORT.Medium,
      patch: { meta: { ttfb: 150 } },
    });
  }

  const suggestions = [];
  for (const c of candidates) {
    if (locked?.[c.key]) continue;
    let hypResources = list;
    let hypMeta = meta;
    if (c.patch.resourceId) hypResources = withResourcePatched(list, c.patch.resourceId, c.patch.fields);
    if (c.patch.meta) hypMeta = { ...meta, ...c.patch.meta };
    const hypMetrics = computeMetrics(hypResources, hypMeta, profile, calibration);
    const hypScore   = computeScores(hypMetrics, settings).overall;
    const mobileGain = hypScore - curScore;
    if (mobileGain <= 0) continue;
    const desktopProfile = settings?.networkProfiles?.desktop ?? PROFILES.desktop;
    const dCur = computeScores(computeMetrics(list, meta, desktopProfile, calibration), settings).overall;
    const dHyp = computeScores(computeMetrics(hypResources, hypMeta, desktopProfile, calibration), settings).overall;
    suggestions.push({
      key: c.key,
      resourceId: c.resourceId,
      label: c.label,
      changeDesc: c.changeDesc,
      effort: c.effort,
      mobileGain: Math.round(mobileGain),
      desktopGain: Math.round(dHyp - dCur),
      metricsImproved: diffMetricsImproved(curMetrics, hypMetrics),
    });
  }

  return suggestions.sort((a, b) => b.mobileGain - a.mobileGain);
}
