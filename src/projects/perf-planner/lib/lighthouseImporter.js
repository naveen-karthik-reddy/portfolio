// Parses a Lighthouse JSON report into the planner's data shape.
// Single export: parseLighthouseReport(jsonOrText) → calibration payload.

export class LighthouseImportError extends Error {
  constructor(message) {
    super(message);
    this.name = "LighthouseImportError";
  }
}

const RESOURCE_TYPE_MAP = {
  Document:   "html",
  Stylesheet: "css",
  Script:     "js",
  Font:       "font",
  Image:      "image",
  Media:      "video",
  Other:      "other",
  XHR:        "api",
  Fetch:      "api",
};

const LCP_TYPE_MAP = {
  IMG:        "Image",
  IMAGE:      "Image",
  IMG_BG:     "Background Image",
  BACKGROUND: "Background Image",
  VIDEO:      "Video",
  TEXT:       "Text",
};

function parseInput(jsonOrText) {
  if (jsonOrText && typeof jsonOrText === "object") return jsonOrText;
  if (typeof jsonOrText !== "string") {
    throw new LighthouseImportError("Expected a JSON string or object");
  }
  try {
    return JSON.parse(jsonOrText);
  } catch {
    throw new LighthouseImportError("File is not valid JSON");
  }
}

function audit(report, key) {
  return report.audits?.[key] ?? null;
}

function clampNonNegative(n, fallback = 0) {
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0) return fallback;
  return n;
}

function extByPath(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\.([a-z0-9]+)(?:$|\?)/i);
    return m ? m[1].toLowerCase() : "";
  } catch {
    return "";
  }
}

function detectImageFormat(url, mimeType) {
  const mt = (mimeType ?? "").toLowerCase();
  if (mt.includes("avif")) return "AVIF";
  if (mt.includes("webp")) return "WebP";
  if (mt.includes("jpeg") || mt.includes("jpg")) return "JPEG";
  if (mt.includes("png")) return "PNG";
  if (mt.includes("gif")) return "GIF";
  const ext = extByPath(url);
  if (ext === "avif") return "AVIF";
  if (ext === "webp") return "WebP";
  if (ext === "jpg" || ext === "jpeg") return "JPEG";
  if (ext === "png") return "PNG";
  if (ext === "gif") return "GIF";
  return "WebP";
}

function detectSource(url, finalUrl) {
  if (!url) return "same-origin";
  try {
    const u = new URL(url);
    const f = finalUrl ? new URL(finalUrl) : null;
    if (f && u.host === f.host) return "same-origin";
    const cdnHints = ["cloudfront", "akamai", "fastly", "cloudflare", "cdn.", "jsdelivr", "unpkg"];
    if (cdnHints.some((h) => u.host.includes(h))) return "own-cdn";
    return "third-party-cdn";
  } catch {
    return "same-origin";
  }
}


function shortName(url) {
  if (!url) return "Resource";
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop();
    return last || u.host;
  } catch {
    return url.slice(0, 40);
  }
}

function buildBootupByUrl(report) {
  const byUrl = {};
  for (const it of audit(report, "bootup-time")?.details?.items ?? []) {
    if (!it.url) continue;
    byUrl[it.url] = {
      evalMs:  Math.round(clampNonNegative(it.scripting          ?? 0)),
      parseMs: Math.round(clampNonNegative(it.scriptParseCompile ?? 0)),
    };
  }
  return byUrl;
}

function buildLongTasksByUrl(report) {
  const a = audit(report, "long-tasks");
  const items = a?.details?.items ?? [];
  const byUrl = {};
  for (const it of items) {
    const url = it.url;
    if (!url) continue;
    if (!byUrl[url]) byUrl[url] = { count: 0, totalMs: 0, tasks: [] };
    byUrl[url].count += 1;
    byUrl[url].totalMs += clampNonNegative(it.duration);
    byUrl[url].tasks.push({
      startMs:    clampNonNegative(it.startTime ?? 0),
      durationMs: clampNonNegative(it.duration),
    });
  }
  return byUrl;
}

function buildBlockingUrls(report) {
  const urls = new Set();
  // LH ≤ 12
  for (const it of audit(report, "render-blocking-resources")?.details?.items ?? []) {
    if (it.url) urls.add(it.url);
  }
  // LH 13+ replaces the audit above with this insight.
  for (const it of audit(report, "render-blocking-insight")?.details?.items ?? []) {
    if (it.url) urls.add(it.url);
  }
  return urls;
}

function buildOffscreenSet(report) {
  const items = audit(report, "offscreen-images")?.details?.items ?? [];
  return new Set(items.map((it) => it.url).filter(Boolean));
}

function buildPrioritizedLcpSet(report) {
  const urls = new Set();
  for (const it of audit(report, "prioritize-lcp-image")?.details?.items ?? []) {
    if (it.url) urls.add(it.url);
  }
  for (const it of audit(report, "preload-lcp-image")?.details?.items ?? []) {
    if (it.url) urls.add(it.url);
  }
  return urls;
}

// Classify a request's loading behaviour using Lighthouse's authoritative
// signals — render-blocking-insight, network priority, and offscreen-images —
// instead of a per-type heuristic.
function classifyLoading(it, type, isBlocking, isLcp, offscreenSet, prioritizedLcp) {
  const priority = it.priority;
  const inPrioritizedLcp = prioritizedLcp.has(it.url);

  if (type === "css") {
    if (isBlocking) return "blocking";
    return "preload";
  }

  if (type === "js") {
    if (isBlocking) return "blocking";
    // VeryLow priority typically indicates an async script (parser-blocking
    // off, executes whenever it arrives). Otherwise treat as defer.
    if (priority === "VeryLow") return "async";
    return "defer";
  }

  if (type === "image" || type === "video") {
    if (isLcp || inPrioritizedLcp) return "preload";
    if (offscreenSet.has(it.url)) return "lazy";
    // Eager (above-the-fold). Calculator already excludes images from FCP
    // critical path so labelling them "blocking" doesn't distort metrics.
    if (priority === "VeryHigh" || priority === "High") return "blocking";
    return "lazy";
  }

  if (type === "font") {
    return "preload";
  }

  // XHR / Fetch / Other — kicked off by JS, post-load.
  return "lazy";
}

function buildUnsizedImageUrls(report) {
  const a = audit(report, "unsized-images");
  const items = a?.details?.items ?? [];
  return new Set(items.map((it) => it.url ?? it.node?.snippet).filter(Boolean));
}

// Walks every shape Lighthouse has used for LCP info — old `largest-contentful-paint-element`
// audit (LH ≤ 12), new `lcp-breakdown-insight` (LH 13+), `prioritize-lcp-image` fallback.
function findLcpElementInfo(report) {
  // LH 13+: lcp-breakdown-insight has a "node" item describing the element
  const breakdown = audit(report, "lcp-breakdown-insight")?.details?.items ?? [];
  for (const it of breakdown) {
    if (it?.type === "node") {
      return { url: it.url ?? null, snippet: (it.snippet ?? "").toLowerCase(), nodeLabel: (it.nodeLabel ?? "").toLowerCase() };
    }
  }
  // Older LH: largest-contentful-paint-element
  const oldEl = audit(report, "largest-contentful-paint-element")?.details?.items?.[0];
  if (oldEl) {
    const node = oldEl.node ?? oldEl;
    return { url: oldEl.url ?? node?.url ?? null, snippet: (node?.snippet ?? "").toLowerCase(), nodeLabel: (node?.nodeLabel ?? "").toLowerCase() };
  }
  // Fallback: prioritize-lcp-image (image-only)
  const prio = audit(report, "prioritize-lcp-image")?.details?.items?.[0];
  if (prio) return { url: prio.url ?? null, snippet: "<img", nodeLabel: "" };
  return { url: null, snippet: "", nodeLabel: "" };
}

function determineLcpType(snippet, nodeLabel, lcpElementUrl) {
  if (snippet.includes("<video")) return "Video";
  if (snippet.includes("<img")) return "Image";
  if (snippet.includes("background-image") || snippet.includes("background:")) return "Background Image";
  if (lcpElementUrl) return "Image";
  if (nodeLabel || snippet) return "Text";
  void LCP_TYPE_MAP;
  return "Text";
}

function detectCdnFlag(items, finalUrl) {
  let host;
  try { host = finalUrl ? new URL(finalUrl).host : ""; } catch { host = ""; }
  const doc = items.find((it) => it.resourceType === "Document");
  if (!doc) return false;
  const cdnHostHints = ["cloudfront", "akamai", "fastly", "cloudflare", "cdn.", "vercel", "netlify"];
  if (cdnHostHints.some((h) => host.includes(h))) return true;
  const headers = doc.responseHeaders;
  if (Array.isArray(headers)) {
    return headers.some((h) => {
      const n = (h.name ?? "").toLowerCase();
      return n === "cf-ray" || n === "x-amz-cf-id" || n === "x-vercel-id" || n === "x-cache" || n.startsWith("x-served-by");
    });
  }
  if (headers && typeof headers === "object") {
    return ["cf-ray", "x-amz-cf-id", "x-vercel-id", "x-cache"].some((k) => headers[k]);
  }
  return false;
}

function buildResources(report, finalUrl, longTasksByUrl, bootupByUrl, blockingUrls, unsizedImageUrls, lcpElementUrl) {
  const items = audit(report, "network-requests")?.details?.items ?? [];

  const fontDisplayAudit = audit(report, "font-display");
  const fontDisplayFailUrls = new Set(
    (fontDisplayAudit?.details?.items ?? [])
      .map((it) => it.url)
      .filter(Boolean)
  );
  const offscreenSet   = buildOffscreenSet(report);
  const prioritizedLcp = buildPrioritizedLcpSet(report);

  const resources = [];

  for (const it of items) {
    const type = RESOURCE_TYPE_MAP[it.resourceType] ?? "other";
    const sizeKB = clampNonNegative((it.transferSize ?? 0) / 1024);
    if (sizeKB === 0 && (type === "other" || type === "api")) continue;
    if (type === "html") continue; // synthesized below as a single _html row

    const longTaskInfo = longTasksByUrl[it.url] ?? null;
    const isBlocking = blockingUrls.has(it.url);
    const isLcp = lcpElementUrl ? it.url === lcpElementUrl : false;

    const loading = classifyLoading(it, type, isBlocking, isLcp, offscreenSet, prioritizedLcp);
    const fetchpriority = (type === "image" || type === "video") && (isLcp || prioritizedLcp.has(it.url));

    // Real per-resource timing — two Lighthouse formats:
    //   New (LH 13+): rendererStartTime / networkEndTime / networkRequestTime — already in ms
    //   Old (LH ≤12): startTime / endTime / responseReceivedTime — in seconds, ×1000
    let lhStart, lhEnd, lhRR;
    if (typeof it.rendererStartTime === "number" && typeof it.networkEndTime === "number") {
      lhStart = Math.round(it.rendererStartTime);
      lhEnd   = Math.round(it.networkEndTime);
      // networkRequestTime ≈ end of connection setup; use as responseReceived proxy
      lhRR    = typeof it.networkRequestTime === "number" ? Math.round(it.networkRequestTime) : undefined;
    } else {
      lhStart = typeof it.startTime === "number" && it.startTime >= 0 ? Math.round(it.startTime * 1000) : undefined;
      lhEnd   = typeof it.endTime   === "number" && it.endTime   >  0 ? Math.round(it.endTime   * 1000) : undefined;
      lhRR    = typeof it.responseReceivedTime === "number" && it.responseReceivedTime > 0
        ? Math.round(it.responseReceivedTime * 1000) : undefined;
    }

    resources.push({
      id: crypto.randomUUID(),
      name: shortName(it.url),
      type,
      source: detectSource(it.url, finalUrl),
      loading,
      sizeKB: Math.round(sizeKB * 10) / 10,
      count: 1,
      execTimeMs: type === "js" && longTaskInfo ? Math.round(longTaskInfo.totalMs) : 0,
      longTaskCount: type === "js" && longTaskInfo ? longTaskInfo.count : 0,
      avgLongTaskMs: type === "js" && longTaskInfo && longTaskInfo.count > 0
        ? Math.round(longTaskInfo.totalMs / longTaskInfo.count) : 0,
      longTaskTimings: type === "js" && longTaskInfo?.tasks?.length > 0
        ? longTaskInfo.tasks : undefined,
      evalMs:  type === "js" ? (bootupByUrl[it.url]?.evalMs  ?? 0) : 0,
      parseMs: type === "js" ? (bootupByUrl[it.url]?.parseMs ?? 0) : 0,
      imageFormat: type === "image" ? detectImageFormat(it.url, it.mimeType) : "WebP",
      fetchpriority,
      missingDimensions: type === "image" ? unsizedImageUrls.has(it.url) : false,
      fontDisplay: type === "font" ? (fontDisplayFailUrls.has(it.url) ? "swap" : "swap") : "swap",
      inline: false,
      isLcp,
      protocol: it.protocol ?? null,
      entity:   it.entity   ?? null,
      // Real Lighthouse timing — used by waterfall for accurate bar positions
      startTimeMs:        lhStart,
      endTimeMs:          lhEnd,
      responseReceivedMs: lhRR,
    });
  }

  return { resources, lcpElementUrl };
}

export function parseLighthouseReport(jsonOrText) {
  const report = parseInput(jsonOrText);

  if (report.lhr) return parseLighthouseReport(report.lhr);

  if (!report.audits || !report.categories) {
    throw new LighthouseImportError("Not a Lighthouse report (missing audits/categories)");
  }
  const perfCat = report.categories.performance;
  if (!perfCat) {
    throw new LighthouseImportError("Lighthouse report does not include a 'performance' category");
  }

  const finalUrl = report.finalDisplayedUrl ?? report.finalUrl ?? report.requestedUrl ?? "";
  const lhVersion = report.lighthouseVersion ?? "";
  const fetchTime = report.fetchTime ?? new Date().toISOString();
  const realScore = Math.round((perfCat.score ?? 0) * 100);

  // Form factor + CPU throttling come from configSettings. The simulator
  // uses cpuSlowdownMultiplier as the reference for re-scaling per-resource
  // exec time onto other profiles (mobile↔desktop).
  const cfg = report.configSettings ?? {};
  const formFactor = cfg.formFactor === "desktop" ? "desktop" : "mobile";
  const cpuSlowdownMultiplier = Number.isFinite(cfg.throttling?.cpuSlowdownMultiplier)
    ? cfg.throttling.cpuSlowdownMultiplier
    : (formFactor === "desktop" ? 1 : 4);
  const throttlingRttMs = Number.isFinite(cfg.throttling?.rttMs) ? cfg.throttling.rttMs : null;
  const throttlingThroughputKbps = Number.isFinite(cfg.throttling?.throughputKbps) ? cfg.throttling.throughputKbps : null;

  const fcpAudit = audit(report, "first-contentful-paint");
  const lcpAudit = audit(report, "largest-contentful-paint");
  const tbtAudit = audit(report, "total-blocking-time");
  const clsAudit = audit(report, "cumulative-layout-shift");
  const siAudit  = audit(report, "speed-index");
  const ttiAudit = audit(report, "interactive");

  const realMetrics = {
    fcp: clampNonNegative(fcpAudit?.numericValue, 1),
    lcp: clampNonNegative(lcpAudit?.numericValue, 1),
    tbt: clampNonNegative(tbtAudit?.numericValue, 0),
    cls: clampNonNegative(clsAudit?.numericValue, 0.0001),
    si:  clampNonNegative(siAudit?.numericValue,  1),
    tti: clampNonNegative(ttiAudit?.numericValue, 1),
  };
  if (realMetrics.tbt === 0) realMetrics.tbt = 1;
  if (realMetrics.cls === 0) realMetrics.cls = 0.0001;

  const realMetricScores = {
    fcp: Math.round((fcpAudit?.score ?? 0) * 100),
    lcp: Math.round((lcpAudit?.score ?? 0) * 100),
    tbt: Math.round((tbtAudit?.score ?? 0) * 100),
    cls: Math.round((clsAudit?.score ?? 0) * 100),
    si:  Math.round((siAudit?.score  ?? 0) * 100),
    tti: Math.round((ttiAudit?.score ?? 0) * 100),
  };

  const networkItems = audit(report, "network-requests")?.details?.items ?? [];
  const longTasksByUrl   = buildLongTasksByUrl(report);
  const blockingUrls     = buildBlockingUrls(report);
  const unsizedImageUrls = buildUnsizedImageUrls(report);
  const lcpInfo = findLcpElementInfo(report);
  const bootupByUrl = buildBootupByUrl(report);
  const { resources, lcpElementUrl } = buildResources(
    report, finalUrl, longTasksByUrl, bootupByUrl, blockingUrls, unsizedImageUrls, lcpInfo.url
  );

  // Synthesize a single HTML resource for the document
  const docItems = networkItems.filter((it) => it.resourceType === "Document");
  const documentSizeKB = docItems.reduce((s, it) => s + clampNonNegative((it.transferSize ?? 0) / 1024), 0);
  // Use timing from the main document request (first by start time, either format)
  const docItem = docItems.sort((a, b) => {
    const aT = a.rendererStartTime ?? (typeof a.startTime === "number" ? a.startTime * 1000 : 0);
    const bT = b.rendererStartTime ?? (typeof b.startTime === "number" ? b.startTime * 1000 : 0);
    return aT - bT;
  })[0] ?? null;

  let docStart, docEnd, docRR;
  if (docItem && typeof docItem.rendererStartTime === "number" && typeof docItem.networkEndTime === "number") {
    docStart = Math.round(docItem.rendererStartTime);
    docEnd   = Math.round(docItem.networkEndTime);
    docRR    = typeof docItem.networkRequestTime === "number" ? Math.round(docItem.networkRequestTime) : undefined;
  } else {
    docStart = typeof docItem?.startTime === "number" && docItem.startTime >= 0 ? Math.round(docItem.startTime * 1000) : undefined;
    docEnd   = typeof docItem?.endTime   === "number" && docItem.endTime   >  0 ? Math.round(docItem.endTime   * 1000) : undefined;
    docRR    = typeof docItem?.responseReceivedTime === "number" && docItem.responseReceivedTime > 0
      ? Math.round(docItem.responseReceivedTime * 1000) : undefined;
  }

  resources.unshift({
    id: crypto.randomUUID(),
    name: "Document (HTML)",
    type: "html",
    source: "same-origin",
    loading: "blocking",
    sizeKB: Math.max(1, Math.round(documentSizeKB * 10) / 10),
    count: 1,
    execTimeMs: 0,
    longTaskCount: 0,
    avgLongTaskMs: 0,
    evalMs: 0,
    parseMs: 0,
    imageFormat: "WebP",
    fetchpriority: false,
    missingDimensions: false,
    fontDisplay: "swap",
    inline: false,
    isLcp: false,
    protocol: docItem?.protocol ?? null,
    entity:   null,
    startTimeMs:        docStart,
    endTimeMs:          docEnd,
    responseReceivedMs: docRR,
  });

  // LCP element type — Text-LCPs have no resource, leave isLcp unset on all rows.
  // Image/Video LCPs already had isLcp set during buildResources via lcpInfo.url match.
  const lcpType = determineLcpType(lcpInfo.snippet, lcpInfo.nodeLabel, lcpElementUrl);
  if (lcpType === "Image" && !resources.some((r) => r.isLcp)) {
    // We knew it was an image LCP but couldn't match the URL — flag the largest image as a fallback.
    const images = resources.filter((r) => r.type === "image");
    if (images.length > 0) {
      images.sort((a, b) => (b.sizeKB ?? 0) - (a.sizeKB ?? 0));
      images[0].isLcp = true;
    }
  }

  // Distribute JS-only main-thread work across JS resources by sizeKB.
  // Use only scriptEvaluation + scriptParseCompile categories so layout,
  // paint, GC and other non-JS work don't inflate execTimeMs.
  const breakdownItems = audit(report, "mainthread-work-breakdown")?.details?.items ?? [];
  const jsMainThreadMs = breakdownItems
    .filter((it) => it.group === "scriptEvaluation" || it.group === "scriptParseCompile")
    .reduce((s, it) => s + clampNonNegative(it.duration), 0);
  if (jsMainThreadMs > 0) {
    const jsRes = resources.filter((r) => r.type === "js");
    const totalJsKB = jsRes.reduce((s, r) => s + (r.sizeKB ?? 0) * (r.count ?? 1), 0);
    const declaredLongMs = jsRes.reduce((s, r) => s + (r.execTimeMs ?? 0), 0);
    const remaining = Math.max(0, jsMainThreadMs - declaredLongMs);
    if (remaining > 0 && totalJsKB > 0) {
      for (const r of jsRes) {
        const share = ((r.sizeKB ?? 0) * (r.count ?? 1)) / totalJsKB;
        r.execTimeMs = Math.round((r.execTimeMs ?? 0) + remaining * share);
      }
    }
  }

  // Snapshot execTimeMs after all distribution so the waterfall can scale
  // parse/eval bars proportionally when the user edits execution time.
  for (const r of resources) {
    if (r.type === "js") {
      r.importedExecTimeMs = r.execTimeMs ?? 0;
      r.importedSizeKB     = r.sizeKB     ?? 0;
    }
  }

  const ttfb = Math.round(clampNonNegative(audit(report, "server-response-time")?.numericValue, 0));

  // Detect SPA/client-rendered pattern: if own (non-third-party) deferred JS
  // has significant execution time, the page is likely React/Vue/Angular and
  // shows nothing until that JS runs — even though the browser marks it defer.
  const ownDeferExec = resources
    .filter((r) => r.type === "js" && r.loading !== "blocking" && r.source !== "third-party-cdn")
    .reduce((s, r) => s + (r.execTimeMs ?? 0), 0);
  const isSpaRendered = ownDeferExec > 200;

  const pageMeta = {
    ttfb,
    cdn: detectCdnFlag(networkItems, finalUrl),
    isSpaRendered,
  };

  let name = "Imported Page";
  try { name = new URL(finalUrl).host; } catch { /* keep default */ }

  // Fingerprint of the imported resource list — used by computeResourceWaterfall to
  // detect whether resources have been modified since import, so it can decide
  // between using real Lighthouse FCP/LCP vs. the simulation.
  const resourceHash = resources
    .map((r) => `${r.type}:${Math.round(r.sizeKB ?? 0)}:${r.loading}:${r.source}:${r.count ?? 1}`)
    .join(",");

  return {
    name,
    sourceUrl: finalUrl,
    fetchTime,
    lhVersion,
    formFactor,
    cpuSlowdownMultiplier,
    throttlingRttMs,
    throttlingThroughputKbps,
    pageMeta,
    resources,
    resourceHash,
    realScore,
    realMetrics,
    realMetricScores,
  };
}
