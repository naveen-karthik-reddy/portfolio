export const DEFAULT_SETTINGS = {
  networkProfiles: {
    mobile: { label: "Mobile (Slow 4G)", rtt: 150, bandwidthKBs: 200, cpuMultiplier: 4 },
    desktop: { label: "Desktop (Cable)", rtt: 40, bandwidthKBs: 1250, cpuMultiplier: 1 },
  },
  scoringWeights: {
    fcp: 0.10,
    lcp: 0.25,
    tbt: 0.30,
    cls: 0.15,
    si:  0.10,
    tti: 0.10,
  },
  scoringCurves: {
    fcp: { median: 3000, p10: 1800 },
    lcp: { median: 4000, p10: 2500 },
    tbt: { median: 600,  p10: 200  },
    cls: { median: 0.25, p10: 0.10 },
    si:  { median: 3900, p10: 3387 },
    tti: { median: 7300, p10: 3785 },
  },
  connectionModel: {
    http1MaxConnections: 6,
    http2MultiplexLimit: 100,
    http3QuicGain: 0.12,
    http3ZeroRtt: false,
    tcpInitialCwndKB: 14,
  },
};

export const DEFAULT_RESOURCE = {
  id: "",
  name: "Untitled Resource",
  type: "js",           // js | css | font | image | video | other
  source: "same-origin", // same-origin | own-cdn | third-party-cdn
  loading: "blocking",  // blocking | defer | async | preload | lazy | module
  sizeKB: 50,
  count: 1,
  execTimeMs: 0,        // JS only
  longTaskCount: 0,     // JS only
  avgLongTaskMs: 0,     // JS only
  imageFormat: "WebP",  // image only
  isLcp: false,
  compression: "auto",  // auto | gzip | brotli | none
};
