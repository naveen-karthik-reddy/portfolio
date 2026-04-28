import { DEFAULT_SETTINGS } from "./defaultSettings.js";
import { tcpDownloadTime } from "./calculator.js";

const COMPRESSION_RATIOS = {
  none:   { js: 1.0,  css: 1.0,  font: 1.0,  image: 1.0,  video: 1.0,  other: 1.0 },
  gzip:   { js: 0.20, css: 0.15, font: 0.70, image: 1.0,  video: 1.0,  other: 0.30 },
  brotli: { js: 0.15, css: 0.12, font: 0.65, image: 1.0,  video: 1.0,  other: 0.25 },
};

function effectiveCompression(resource, globalCompression) {
  if (resource.compression !== "auto") return resource.compression;
  if (["image", "video"].includes(resource.type)) return "none";
  return globalCompression;
}

function compressedBytes(resource, globalCompression) {
  const comp = effectiveCompression(resource, globalCompression);
  const ratio = COMPRESSION_RATIOS[comp]?.[resource.type] ?? 1.0;
  return resource.sizeKB * ratio * resource.count * 1024;
}

function getEffectiveRTT(rtt, source, inputs) {
  if (source === "same-origin") return inputs.cdn ? rtt * 0.4 : rtt;
  if (source === "own-cdn")     return rtt * 0.4;
  return rtt * 0.8; // third-party CDN — some latency benefit but further away
}

function connectionCost(source, rtt, inputs, protocol) {
  if (source === "same-origin" && inputs.cdn) return 0;
  if (source === "own-cdn")                    return 0;
  if (protocol === "HTTP/3") return 0; // QUIC 0-RTT for established origins
  return rtt * 2; // DNS + TCP + TLS
}

// Returns the additional ms delay imposed by HTTP/1.1 connection limits.
// Under HTTP/1.1 a browser opens max 6 connections per origin.
// Resources beyond 6 must queue for a free connection.
function http1QueueDelay(resources, resourceIndex, rttMs, bandwidthKBs, globalCompression) {
  const maxConn = 6;
  if (resourceIndex < maxConn) return 0;
  // Estimate average download time of the first batch of connections
  const firstBatch = resources.slice(0, maxConn);
  const avgTime = firstBatch.reduce((sum, r) => {
    const bytes = compressedBytes(r, globalCompression);
    return sum + tcpDownloadTime(bytes, rttMs, bandwidthKBs);
  }, 0) / maxConn;
  return avgTime * Math.floor(resourceIndex / maxConn);
}

// Download time per resource with protocol-awareness
function downloadTime(bytes, rttMs, bandwidthKBs, protocol, resourceIndex, allResources, globalCompression) {
  if (protocol === "HTTP/1.1") {
    const queueDelay = http1QueueDelay(allResources, resourceIndex, rttMs, bandwidthKBs, globalCompression);
    return tcpDownloadTime(bytes, rttMs, bandwidthKBs) + queueDelay;
  }
  if (protocol === "HTTP/2") {
    // All multiplexed; bandwidth split equally among concurrent resources
    const concurrent = Math.min(allResources.length, 100);
    const sharedBandwidth = bandwidthKBs / Math.max(concurrent, 1);
    return tcpDownloadTime(bytes, rttMs, sharedBandwidth);
  }
  // HTTP/3: multiplexed like H2 but with QUIC ~12% gain
  const gain = 1 - (DEFAULT_SETTINGS.connectionModel.http3QuicGain);
  const concurrent = Math.min(allResources.length, 100);
  const sharedBandwidth = bandwidthKBs / Math.max(concurrent, 1);
  return tcpDownloadTime(bytes, rttMs, sharedBandwidth) * gain;
}

// Classify loading strategies into phases
const RENDER_BLOCKING    = ["blocking"];
const ASYNC_NON_BLOCKING = ["defer", "async", "module"];
const PRELOADED          = ["preload"];

/**
 * Compute the incremental impact of the resource list on metrics.
 * Returns { extraBlockingMs, extraExecMs, extraLongTaskTBT, extraCLS, isLcpResource, lcpResourceMs }.
 */
export function computeResourceImpact(inputs, resources, profileKey, settings) {
  if (!resources || resources.length === 0) {
    return { extraBlockingMs: 0, extraExecMs: 0, extraLongTaskTBT: 0, extraCLS: 0, lcpResourceMs: 0, hasLcpResource: false };
  }

  const profiles    = settings?.networkProfiles ?? DEFAULT_SETTINGS.networkProfiles;
  const profile     = profiles[profileKey];
  const rtt         = profile.rtt;
  const bwKBs       = profile.bandwidthKBs;
  const cpuMul      = profile.cpuMultiplier;
  const protocol    = inputs.protocol ?? "HTTP/2";
  const compression = inputs.compression ?? "gzip";

  let extraBlockingMs   = 0;
  let extraExecMs       = 0;
  let extraLongTaskTBT  = 0;
  let lcpResourceMs     = 0;
  let hasLcpResource    = false;

  // Split by loading category for easier reasoning
  const blockingResources = resources.filter((r) => RENDER_BLOCKING.includes(r.loading));
  const preloadResources  = resources.filter((r) => PRELOADED.includes(r.loading));
  const asyncResources    = resources.filter((r) => ASYNC_NON_BLOCKING.includes(r.loading));
  const lazyResources     = resources.filter((r) => r.loading === "lazy");

  // Blocking resources add to FCP-critical path
  blockingResources.forEach((r, i) => {
    const effRTT  = getEffectiveRTT(rtt, r.source, inputs);
    const connCost = connectionCost(r.source, effRTT, inputs, protocol);
    const bytes   = compressedBytes(r, compression);
    const dlTime  = downloadTime(bytes, effRTT, bwKBs, protocol, i, blockingResources, compression);
    extraBlockingMs += connCost + dlTime;
    if (r.type === "js" && r.execTimeMs > 0) {
      extraExecMs += r.execTimeMs * cpuMul;
    }
    if (r.type === "js" && r.longTaskCount > 0 && r.avgLongTaskMs > 0) {
      const perTask = Math.max(0, r.avgLongTaskMs * cpuMul - 50);
      extraLongTaskTBT += r.longTaskCount * perTask;
    }
  });

  // Preloaded resources — only exec cost (download parallel with HTML/CSS)
  preloadResources.forEach((r) => {
    if (r.type === "js" && r.execTimeMs > 0) {
      extraExecMs += r.execTimeMs * cpuMul;
    }
    if (r.type === "js" && r.longTaskCount > 0 && r.avgLongTaskMs > 0) {
      const perTask = Math.max(0, r.avgLongTaskMs * cpuMul - 50);
      extraLongTaskTBT += r.longTaskCount * perTask;
    }
    // If this is the LCP resource (preloaded image), capture download time
    if (r.isLcp && ["image", "video"].includes(r.type)) {
      const effRTT = getEffectiveRTT(rtt, r.source, inputs);
      const bytes  = compressedBytes(r, compression);
      const dlTime = tcpDownloadTime(bytes, effRTT, bwKBs);
      lcpResourceMs   = dlTime;
      hasLcpResource  = true;
    }
  });

  // Async/deferred/module — exec costs after FCP, contributes to TBT
  asyncResources.forEach((r) => {
    if (r.type === "js" && r.execTimeMs > 0) {
      extraExecMs += r.execTimeMs * cpuMul;
    }
    if (r.type === "js" && r.longTaskCount > 0 && r.avgLongTaskMs > 0) {
      const perTask = Math.max(0, r.avgLongTaskMs * cpuMul - 50);
      extraLongTaskTBT += r.longTaskCount * perTask;
    }
  });

  // Lazy resources — no impact on initial metrics; ignored for now
  void lazyResources;

  return { extraBlockingMs, extraExecMs, extraLongTaskTBT, extraCLS: 0, lcpResourceMs, hasLcpResource };
}
