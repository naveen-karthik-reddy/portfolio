// Blank slate — all resources at zero/min so new pages start at ~100 performance
export const BLANK_INPUTS = {
  ttfb: 50,
  protocol: "HTTP/2",
  cdn: false,
  compression: "none",
  htmlSize: 5,
  inlineCriticalCSS: false,
  inlineJS: 0,
  cssSize: 0,
  cssFiles: 1,
  renderBlockingCSS: false,
  cssPreloaded: false,
  jsSize: 0,
  largestBundle: 0,
  jsFiles: 1,
  jsLoading: "defer",
  jsExecTime: 0,
  longTasks: 0,
  avgLongTask: 51,
  lcpType: "Image",
  lcpImageSize: 0,
  imageFormat: "WebP",
  lcpPreloaded: false,
  fetchpriority: false,
  fontCount: 0,
  fontSize: 0,
  fontDisplay: "swap",
  fontsPreloaded: false,
  thirdPartyCount: 0,
  thirdPartySize: 0,
  thirdPartyExec: 0,
  thirdPartyBlocking: false,
  cls: 0,
  imagesMissingDims: false,
  dynamicContent: false,
  fontSwapShift: false,
};

export const DEFAULT_INPUTS = {
  ttfb: 200,
  protocol: "HTTP/2",
  cdn: true,
  compression: "gzip",
  htmlSize: 50,
  inlineCriticalCSS: false,
  inlineJS: 0,
  cssSize: 80,
  cssFiles: 2,
  renderBlockingCSS: true,
  cssPreloaded: false,
  jsSize: 300,
  largestBundle: 150,
  jsFiles: 5,
  jsLoading: "defer",
  jsExecTime: 800,
  longTasks: 3,
  avgLongTask: 120,
  lcpType: "Image",
  lcpImageSize: 200,
  imageFormat: "WebP",
  lcpPreloaded: false,
  fetchpriority: false,
  fontCount: 2,
  fontSize: 80,
  fontDisplay: "swap",
  fontsPreloaded: false,
  thirdPartyCount: 2,
  thirdPartySize: 100,
  thirdPartyExec: 200,
  thirdPartyBlocking: false,
  cls: 0.05,
  imagesMissingDims: false,
  dynamicContent: false,
  fontSwapShift: false,
};

export const OPTIMAL_VALUES = {
  ttfb: 100,
  protocol: "HTTP/2",
  cdn: true,
  compression: "brotli",
  htmlSize: null, // min(current × 0.5, 30) — computed dynamically
  inlineCriticalCSS: true,
  inlineJS: 0,
  cssSize: null,  // min(current × 0.5, 50) — computed dynamically
  cssFiles: 1,
  renderBlockingCSS: false,
  cssPreloaded: true,
  jsSize: null,   // min(current × 0.5, 150) — computed dynamically
  largestBundle: null,
  jsFiles: null,
  jsLoading: "defer",
  jsExecTime: null, // current × 0.5 — computed dynamically
  longTasks: null,  // round(current × 0.5) — computed dynamically
  avgLongTask: null,
  lcpType: null,
  lcpImageSize: null, // current × 0.6 — computed dynamically
  imageFormat: "AVIF",
  lcpPreloaded: true,
  fetchpriority: true,
  fontCount: null, // min(current, 2)
  fontSize: null,
  fontDisplay: "optional",
  fontsPreloaded: true,
  thirdPartyCount: null, // max(current - 2, 0)
  thirdPartySize: null,
  thirdPartyExec: null,
  thirdPartyBlocking: false,
  cls: 0,
  imagesMissingDims: false,
  dynamicContent: false,
  fontSwapShift: false,
};

// Compute optimal value for a given field given current inputs
export function getOptimalValue(field, currentInputs) {
  const cur = currentInputs[field];
  switch (field) {
    case "htmlSize":      return Math.min(cur * 0.5, 30);
    case "cssSize":       return Math.min(cur * 0.5, 50);
    case "jsSize":        return Math.min(cur * 0.5, 150);
    case "largestBundle": return Math.min(cur * 0.5, 75);
    case "jsExecTime":    return cur * 0.5;
    case "longTasks":     return Math.round(cur * 0.5);
    case "avgLongTask":   return Math.max(51, cur * 0.5);
    case "lcpImageSize":  return cur * 0.6;
    case "fontCount":     return Math.min(cur, 2);
    case "thirdPartyCount": return Math.max(cur - 2, 0);
    default:              return OPTIMAL_VALUES[field];
  }
}

// Health thresholds: returns 'green' | 'yellow' | 'red'
const HEALTH = {
  ttfb:              (v) => v < 200 ? "green" : v < 600 ? "yellow" : "red",
  protocol:          (v) => v === "HTTP/1.1" ? "yellow" : "green",
  cdn:               (v) => v ? "green" : "red",
  compression:       (v) => v === "brotli" ? "green" : v === "gzip" ? "yellow" : "red",
  htmlSize:          (v) => v < 100 ? "green" : v < 500 ? "yellow" : "red",
  inlineCriticalCSS: (v) => v ? "green" : "yellow",
  inlineJS:          (v) => v === 0 ? "green" : v <= 50 ? "yellow" : "red",
  cssSize:           (v) => v < 100 ? "green" : v < 300 ? "yellow" : "red",
  cssFiles:          (v) => v <= 3 ? "green" : v <= 8 ? "yellow" : "red",
  renderBlockingCSS: (v) => v ? "yellow" : "green",
  cssPreloaded:      (v) => v ? "green" : "yellow",
  jsSize:            (v) => v < 200 ? "green" : v < 500 ? "yellow" : "red",
  largestBundle:     (v) => v < 150 ? "green" : v < 500 ? "yellow" : "red",
  jsFiles:           (v) => v <= 5 ? "green" : v <= 15 ? "yellow" : "red",
  jsLoading:         (v) => v === "render-blocking" ? "red" : "green",
  jsExecTime:        (v) => v < 500 ? "green" : v < 2000 ? "yellow" : "red",
  longTasks:         (v) => v <= 2 ? "green" : v <= 5 ? "yellow" : "red",
  avgLongTask:       (v) => v < 100 ? "green" : v < 250 ? "yellow" : "red",
  lcpType:           () => "green",
  lcpImageSize:      (v) => v < 150 ? "green" : v < 500 ? "yellow" : "red",
  imageFormat:       (v) => ["AVIF","WebP"].includes(v) ? "green" : v === "JPEG" ? "yellow" : "red",
  lcpPreloaded:      (v) => v ? "green" : "yellow",
  fetchpriority:     (v) => v ? "green" : "yellow",
  fontCount:         (v) => v <= 2 ? "green" : v <= 4 ? "yellow" : "red",
  fontSize:          (v) => v < 100 ? "green" : v < 250 ? "yellow" : "red",
  fontDisplay:       (v) => ["swap","optional"].includes(v) ? "green" : v === "block" ? "red" : "yellow",
  fontsPreloaded:    (v) => v ? "green" : "yellow",
  thirdPartyCount:   (v) => v <= 2 ? "green" : v <= 5 ? "yellow" : "red",
  thirdPartySize:    (v) => v < 100 ? "green" : v < 300 ? "yellow" : "red",
  thirdPartyExec:    (v) => v < 200 ? "green" : v < 500 ? "yellow" : "red",
  thirdPartyBlocking:(v) => v ? "red" : "green",
  cls:               (v) => v < 0.1 ? "green" : v < 0.25 ? "yellow" : "red",
  imagesMissingDims: (v) => v ? "red" : "green",
  dynamicContent:    (v) => v ? "red" : "green",
  fontSwapShift:     (v) => v ? "yellow" : "green",
};

export function getHealth(field, value) {
  return HEALTH[field] ? HEALTH[field](value) : "green";
}

// INPUT_META: single source of truth for all 34 input fields
export const INPUT_META = {
  // Server
  ttfb:              { label: "TTFB",                  section: "Server",        type: "slider",  min: 50,   max: 2000,  step: 10,  unit: "ms"  },
  protocol:          { label: "Protocol",               section: "Server",        type: "select",  options: ["HTTP/1.1","HTTP/2","HTTP/3"] },
  cdn:               { label: "CDN",                    section: "Server",        type: "toggle"  },
  compression:       { label: "Compression",            section: "Server",        type: "select",  options: ["none","gzip","brotli"] },
  // HTML
  htmlSize:          { label: "HTML Size",              section: "HTML",          type: "slider",  min: 5,    max: 2000,  step: 5,   unit: "KB"  },
  inlineCriticalCSS: { label: "Inline Critical CSS",    section: "HTML",          type: "toggle"  },
  inlineJS:          { label: "Inline JS in Head",      section: "HTML",          type: "slider",  min: 0,    max: 500,   step: 5,   unit: "KB"  },
  // CSS
  cssSize:           { label: "Total CSS Size",         section: "CSS",           type: "slider",  min: 0,    max: 1000,  step: 5,   unit: "KB"  },
  cssFiles:          { label: "CSS Files",              section: "CSS",           type: "slider",  min: 1,    max: 20,    step: 1,   unit: ""    },
  renderBlockingCSS: { label: "Render-Blocking CSS",    section: "CSS",           type: "toggle"  },
  cssPreloaded:      { label: "CSS Preloaded",          section: "CSS",           type: "toggle"  },
  // JavaScript
  jsSize:            { label: "Total JS Size",          section: "JavaScript",    type: "slider",  min: 0,    max: 5000,  step: 10,  unit: "KB"  },
  largestBundle:     { label: "Largest Bundle",         section: "JavaScript",    type: "slider",  min: 0,    max: 3000,  step: 10,  unit: "KB"  },
  jsFiles:           { label: "JS Files",               section: "JavaScript",    type: "slider",  min: 1,    max: 30,    step: 1,   unit: ""    },
  jsLoading:         { label: "Loading Strategy",       section: "JavaScript",    type: "select",  options: ["render-blocking","defer","async","module"] },
  jsExecTime:        { label: "Main Thread Exec Time",  section: "JavaScript",    type: "slider",  min: 0,    max: 10000, step: 50,  unit: "ms"  },
  longTasks:         { label: "Long Tasks Count",       section: "JavaScript",    type: "slider",  min: 0,    max: 20,    step: 1,   unit: ""    },
  avgLongTask:       { label: "Avg Long Task Duration", section: "JavaScript",    type: "slider",  min: 51,   max: 1000,  step: 5,   unit: "ms"  },
  // LCP Resource
  lcpType:           { label: "LCP Element Type",       section: "LCP Resource",  type: "select",  options: ["Text","Image","Background Image","Video"] },
  lcpImageSize:      { label: "LCP Image Size",         section: "LCP Resource",  type: "slider",  min: 0,    max: 5000,  step: 10,  unit: "KB"  },
  imageFormat:       { label: "Image Format",           section: "LCP Resource",  type: "select",  options: ["JPEG","PNG","WebP","AVIF","GIF"] },
  lcpPreloaded:      { label: "LCP Preloaded",          section: "LCP Resource",  type: "toggle"  },
  fetchpriority:     { label: "Fetchpriority High",     section: "LCP Resource",  type: "toggle"  },
  // Fonts
  fontCount:         { label: "Web Font Count",         section: "Fonts",         type: "slider",  min: 0,    max: 10,    step: 1,   unit: ""    },
  fontSize:          { label: "Total Font Size",        section: "Fonts",         type: "slider",  min: 0,    max: 500,   step: 5,   unit: "KB"  },
  fontDisplay:       { label: "Font Display",           section: "Fonts",         type: "select",  options: ["swap","optional","block","auto"] },
  fontsPreloaded:    { label: "Fonts Preloaded",        section: "Fonts",         type: "toggle"  },
  // Third Party
  thirdPartyCount:   { label: "Third-Party Script Count", section: "Third Party", type: "slider",  min: 0,    max: 15,    step: 1,   unit: ""    },
  thirdPartySize:    { label: "Third-Party JS Size",    section: "Third Party",   type: "slider",  min: 0,    max: 2000,  step: 10,  unit: "KB"  },
  thirdPartyExec:    { label: "Third-Party Exec Time",  section: "Third Party",   type: "slider",  min: 0,    max: 5000,  step: 10,  unit: "ms"  },
  thirdPartyBlocking:{ label: "Blocks Rendering",       section: "Third Party",   type: "toggle"  },
  // Layout Stability
  cls:               { label: "Base CLS Value",         section: "Layout Stability", type: "slider", min: 0, max: 0.5, step: 0.01, unit: "" },
  imagesMissingDims: { label: "Images Missing Dimensions", section: "Layout Stability", type: "toggle" },
  dynamicContent:    { label: "Dynamic Content Injection",  section: "Layout Stability", type: "toggle" },
  fontSwapShift:     { label: "Font Swap Layout Shift",     section: "Layout Stability", type: "toggle" },
};

export const SECTION_ORDER = [
  "Server",
  "HTML",
  "CSS",
  "JavaScript",
  "LCP Resource",
  "Fonts",
  "Third Party",
  "Layout Stability",
];
