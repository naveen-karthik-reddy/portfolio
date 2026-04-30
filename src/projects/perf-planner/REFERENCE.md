# Perf-Planner — Complete Technical Reference

This file is the single source of truth for understanding and modifying the perf-planner project. Read this before touching any file.

---

## 1. What This Tool Is

A **Core Web Vitals what-if simulator** with two modes of operation:

- **Lighthouse-calibrated mode** — user uploads a Lighthouse JSON; the tool extracts all resource timings, fits its scoring curves to match the real score, then lets the user explore hypothetical changes as calibrated predictions.
- **Manual mode** — user builds a resource list from scratch; the tool runs a TCP slow-start network model to estimate timings and scores.

The primary workflow is always Lighthouse-first. Manual mode exists as a fallback.

---

## 2. Project Structure

```
src/projects/perf-planner/
├── index.jsx                        ← root layout, metric computation, auto-save
├── context/
│   ├── AppContext.jsx               ← React context + Provider, DB init, state bootstrap
│   ├── contextObject.js             ← initial state shape
│   └── reducer.js                   ← all state mutations (action types below)
├── lib/
│   ├── calculator.js                ← CORE: computeMetrics, computeScores, computeRoadmap, computeResourceWaterfall
│   ├── resourceSimulator.js         ← computeResourceImpact (incremental impact; less used)
│   ├── lighthouseImporter.js        ← parseLighthouseReport → resources + calibration
│   ├── defaultSettings.js           ← all default values (network profiles, scoring curves, resource shape)
│   ├── db.js                        ← IndexedDB schema (version 4), CRUD helpers
│   ├── curveFit.js                  ← fits log-normal curves to match Lighthouse real score
│   └── exportImport.js              ← JSON export/import for pages+variations and settings
├── components/
│   ├── layout/
│   │   ├── TopBar.jsx               ← page picker, calibration delta chip, mode toggles, settings button
│   │   └── VariationTabs.jsx        ← variation tab strip, right-click menu, score badges
│   ├── input/
│   │   └── PageMetaBar.jsx          ← TTFB input + CDN toggle (affects active variation only)
│   ├── dashboard/
│   │   ├── ImpactDashboard.jsx      ← mobile/desktop toggle, renders ScoreCard(s)
│   │   ├── ScoreCard.jsx            ← score gauge + 5 metric rows + waterfall
│   │   └── ResourceWaterfall.jsx    ← interactive Chrome-DevTools-style waterfall
│   ├── resources/
│   │   ├── ResourcePanel.jsx        ← left sidebar resource list with inline impact deltas
│   │   └── ResourceDialog.jsx       ← modal to add/edit a resource
│   ├── roadmap/
│   │   ├── OptimizationRoadmap.jsx  ← ranked suggestion list
│   │   └── RoadmapCard.jsx          ← single suggestion card with Apply + Lock
│   ├── comparison/
│   │   ├── ComparisonMode.jsx       ← full-page side-by-side layout
│   │   ├── ComparisonSelector.jsx   ← variation checkboxes (max 4)
│   │   └── ComparisonColumn.jsx     ← one variation column with metric highlights
│   ├── settings/
│   │   └── SettingsPanel.jsx        ← drawer with all simulation parameters
│   ├── pages/
│   │   └── PageManager.jsx          ← page CRUD, import/export, calibration trigger
│   └── calibration/
│       └── CalibrationPanel.jsx     ← Lighthouse JSON upload + preview + create/recalibrate
```

---

## 3. Data Schemas

### 3.1 Page
```js
{
  id: string,              // crypto.randomUUID()
  name: string,            // hostname extracted from Lighthouse URL, or user-set
  createdAt: string,       // ISO
  updatedAt: string,       // ISO
  scoringCurves: {         // fitted per-page; null = use global settings curves
    fcp: { median, p10 },
    lcp: { median, p10 },
    tbt: { median, p10 },
    cls: { median, p10 },
    si:  { median, p10 }
  } | null,
  calibration: {           // null = manually created page (no Lighthouse run)
    realScore: number,
    realMetrics: { fcp, lcp, tbt, cls, si, tti },
    realMetricScores: { fcp, lcp, tbt, cls, si, tti },
    sourceUrl: string,
    fetchTime: string,     // ISO
    lhVersion: string,
    formFactor: "mobile" | "desktop",
    cpuSlowdownMultiplier: number,
    throttlingRttMs: number | null,
    throttlingThroughputKbps: number | null,
    importedAt: string     // ISO
  } | null
}
```

### 3.2 Variation
```js
{
  id: string,
  pageId: string,
  name: string,
  isBaseline: boolean,     // exactly one per page; all deltas compare against this
  locked: {                // { [suggestionKey]: true } — excluded from roadmap
    "r:resourceId:field": true,
    "p:cdn": true,
    "p:ttfb": true,
    ...
  },
  pageMeta: {
    ttfb: number,          // ms; server response time (0–2000)
    cdn: boolean           // reduces same-origin RTT by ~60%
  },
  resources: Resource[],
  createdAt: string,
  updatedAt: string
}
```

### 3.3 Resource
```js
{
  id: string,
  name: string,
  type: "html" | "js" | "css" | "font" | "image" | "video" | "other",
  source: "same-origin" | "own-cdn" | "third-party-cdn",
  loading: "blocking" | "defer" | "async" | "preload" | "module" | "lazy",
  sizeKB: number,
  count: number,           // bundled/repeated count; bytes = sizeKB * count * 1024

  // JS only
  execTimeMs: number,      // measured at calibration CPU; scaled to profile CPU in calculator
  longTaskCount: number,   // tasks > 50ms
  avgLongTaskMs: number,

  // Image only
  imageFormat: "WebP" | "AVIF" | "JPEG" | "PNG" | "GIF",
  fetchpriority: boolean,  // true = <img fetchpriority="high">
  missingDimensions: boolean,

  // Font only
  fontDisplay: "swap" | "optional" | "block" | "fallback" | "auto",

  // All
  inline: boolean,         // CSS/JS inlined in HTML document
  isLcp: boolean,          // marks the LCP element

  // Populated from Lighthouse (absent on manually-added resources)
  startTimeMs: number | undefined,
  endTimeMs: number | undefined,
  responseReceivedMs: number | undefined,  // networkRequestTime (request sent time)
  protocol: "HTTP/1.1" | "HTTP/2" | "HTTP/3" | null,
  entity: string | null    // e.g. "Google Analytics"
}
```

### 3.4 Settings
```js
{
  id: "global",
  networkProfiles: {
    mobile:  { label: "Mobile (Slow 4G)", rtt: 150, bandwidthKBs: 200,  cpuMultiplier: 4 },
    desktop: { label: "Desktop (Cable)",  rtt: 40,  bandwidthKBs: 1250, cpuMultiplier: 1 }
  },
  scoringWeights: {        // must sum to 1.0; TTI was removed — 5 metrics only
    fcp: 0.10, lcp: 0.25, tbt: 0.30, cls: 0.25, si: 0.10
  },
  scoringCurves: {         // log-normal CDF parameters matching Lighthouse 12-13
    fcp: { median: 3000, p10: 1800 },
    lcp: { median: 4000, p10: 2500 },
    tbt: { median: 600,  p10: 200  },
    cls: { median: 0.25, p10: 0.10 },
    si:  { median: 3900, p10: 3387 }
  },
  connectionModel: {
    http1MaxConnections: 6,
    http2MultiplexLimit: 100,
    http3QuicGain: 0.12,     // 12% latency gain over H2
    http3ZeroRtt: false,
    tcpInitialCwndKB: 14     // ~10 packets, standard for modern servers
  }
}
```

### 3.5 Waterfall Row
```js
{
  id: string,
  name: string,
  type: string,
  loading: string,
  isLcp: boolean,
  phase: "blocking" | "deferred" | "lazy" | "lcp",

  // Absolute times from navigation start (ms)
  startMs: number,
  endMs: number,

  // Phase durations (ms); all ?? 0 in buildSegments — safe to be absent
  stallMs: number,         // waiting for connection slot (always 0 currently)
  dnsMs: number,
  tcpMs: number,
  sslMs: number,
  requestMs: number,       // ≈ rtt * 0.1; carved from connection overhead
  ttfbMs: number,
  downloadMs: number,

  // From Lighthouse only
  protocol: string | null,
  entity: string | null
}
```

---

## 4. State Shape & Reducer Actions

### App State (context/AppContext.jsx)
```js
{
  dbReady: boolean,
  pages: Page[],
  variations: Variation[],
  activePageId: string | null,
  activeVariationId: string | null,
  comparisonMode: boolean,
  comparisonVariationIds: string[],  // max 4
  settings: Settings | null
}
```

### Reducer Action Types

| Action | Payload | Effect |
|--------|---------|--------|
| `INIT_LOADED` | `{ pages, variations, settings }` | Bootstrap state from DB |
| `PAGE_CREATED` | `{ page, variation }` | Add page + blank baseline |
| `PAGE_CREATED_FROM_LIGHTHOUSE` | `{ page, variation }` | Add page + calibrated baseline |
| `PAGE_RECALIBRATED` | `{ pageId, scoringCurves, calibration, pageMeta, resources }` | Update page + baseline |
| `PAGE_RENAMED` | `{ id, name, updatedAt }` | Rename page |
| `PAGE_DELETED` | `{ id }` | Remove page + all its variations |
| `PAGE_IMPORTED` | `{ page, variations }` | Add imported page + all variations |
| `SET_ACTIVE_PAGE` | `{ pageId, variationId }` | Switch active page + variation |
| `VARIATION_CREATED` | `{ variation }` | Clone baseline, add as new variation |
| `VARIATION_RENAMED` | `{ id, name }` | Rename variation |
| `VARIATION_DUPLICATED` | `{ variation }` | Deep copy with new id |
| `VARIATION_DELETED` | `{ id }` | Remove, auto-select sibling |
| `VARIATION_SET_BASELINE` | `{ id }` | Mark as baseline, unmark others |
| `SET_ACTIVE_VARIATION` | `{ id }` | Switch active variation |
| `PAGE_META_CHANGED` | `{ variationId, field, value }` | Mutate pageMeta.ttfb or .cdn |
| `RESOURCE_FIELD_CHANGED` | `{ variationId, resourceId, field, value }` | Mutate single resource field |
| `RESOURCE_ADDED` | `{ variationId, resource }` | Append resource |
| `RESOURCE_UPDATED` | `{ variationId, resource }` | Replace resource by id |
| `RESOURCE_DELETED` | `{ variationId, resourceId }` | Remove resource |
| `LOCK_TOGGLED` | `{ variationId, key }` | Toggle locked[key] |
| `SETTINGS_LOADED` | `{ settings }` | Replace settings |
| `SETTINGS_UPDATED` | `{ settings }` | Replace settings + save |
| `COMPARISON_OPENED` | — | Set comparisonMode = true |
| `COMPARISON_CLOSED` | — | Set comparisonMode = false |
| `COMPARISON_VARIATION_TOGGLED` | `{ id }` | Add/remove from comparisonVariationIds (max 4) |

---

## 5. Core Simulation — calculator.js

### 5.1 computeMetrics(resources, pageMeta, profile, calibration) → Metrics

Returns `{ fcp, lcp, tbt, cls, si, tti }` all in ms except CLS.
TTI is computed internally and returned but is **not used in scoring**. The 5 scored metrics are fcp, lcp, tbt, cls, si.

**Key sub-functions:**

- `connSetup(rtt, source, meta, isFirstConn)` — DNS+TCP+TLS overhead in ms; 0 if CDN/own-CDN
- `effRTT(rtt, source, meta)` — RTT adjusted for CDN (×0.4 for own-CDN/CDN same-origin)
- `tcpDownloadTime(bytes, rttMs, bandwidthKBs)` — slow-start model: each RTT doubles window until bandwidth-limited
- `splitSetup(setupMs, rtt)` — splits connection overhead into `{ dnsMs, tcpMs, sslMs, requestMs }` where requestMs = rtt×0.1
- `makeRow(r, phase, startMs, setup, rtt, dlMs)` — builds simulated waterfall row with stallMs:0
- `makeRowFromReal(r, phase, rtt)` — builds real-timing waterfall row; carves requestMs from overhead

**FCP computation:**
1. HTML first byte = DNS+TCP+SSL+requestMs+TTFB (simulation) OR measured startMs→responseReceivedMs (real)
2. Render-blocking cohort downloads in parallel; cohort time = max download time across blocking resources (per resource: bandwidth / concurrent × slow-start model)
3. FCP = max(HTML done, HTML first byte + blocking cohort) + inline parse + blocking-font download + 50ms paint

**LCP computation:**
- LCP resource discovery time depends on loading strategy:
  - `preload + fetchpriority` → t=0
  - `preload` → HTML first byte
  - `blocking` image → HTML first byte
  - CSS-referenced → CSS download complete
  - lazy → after FCP
- LCP download uses 50% of bandwidth (priority share)
- LCP = discovery + connection overhead + download + render cost (0.02ms/KB × cpuMul)

**TBT computation:**
- Calibration CPU → profile CPU scale factor: `calibrationCpu / profileCpu` (e.g., real run at 4× mobile, sim at 1× desktop → scale = 0.25)
- Per JS resource with longTasks: `longTaskCount × max(0, avgLongTaskMs × scale - 50)`
- Per JS resource without: `max(0, execTimeMs × scale) × 0.08` (heuristic for sub-50ms tasks)

**CLS computation:**
- Missing image dimensions: +0.05 per image
- font-display swap/block without preload: +0.03 per font
- Capped at 1.0

### 5.2 computeScores(metrics, settings) → { fcp, lcp, tbt, cls, si, overall }

Log-normal CDF: `score = 100 × (1 - Φ(ln(value/median) / σ))` where `σ = ln(median/p10) / 0.9061`

Overall = weighted sum across **5 metrics only** (fcp×0.10 + lcp×0.25 + tbt×0.30 + cls×0.25 + si×0.10). TTI is not scored. Uses page-level scoringCurves if present, else settings.scoringCurves.

`scoreColor(score)`: ≥90 → `#0cce6b`, ≥50 → `#ffa400`, else `#ff4e42`

### 5.3 computeResourceWaterfall(resources, pageMeta, profile, calibration) → { rows, fcpMs, lcpMs, totalMs }

**Real-timing mode** (activated when HTML or >50% of sub-resources have `startTimeMs`):
- Uses Lighthouse timestamps directly
- `makeRowFromReal(r, phase, rtt)`: requestMs = min(max(1, rtt×0.1), overhead); ttfbMs = overhead − requestMs; downloadMs = endMs − sendMs
- Manually-added resources (no timing) fall back to simulation at htmlRefEnd

**Simulation mode:**
- HTML first: DNS+TCP+SSL+requestMs+TTFB+download, startMs=0
- Blocking cohort: parallel download starting at htmlFirstByte, staggered by `rtt×0.04` ms
- Deferred/async/preload cohort: starts at htmlFirstByte, later stagger
- Lazy: starts at htmlDone
- LCP: hoisted above its cohort with 50% bandwidth share

Row phase field:
- `"blocking"` — render-blocking resource
- `"deferred"` — deferred/async/module/preload
- `"lazy"` — lazy-loaded
- `"lcp"` — the LCP resource

### 5.4 computeRoadmap(resources, pageMeta, locked, profile, calibration, settings) → Suggestion[]

Each candidate applies a patch, recomputes mobile score, returns if gain > 0 and not locked.

**Per-resource candidates:**

| Key pattern | Condition | Patch | Effort |
|------------|-----------|-------|--------|
| `r:{id}:format` | image not AVIF/WebP | `imageFormat: "AVIF"` + sizeKB×0.45 | Easy |
| `r:{id}:loading` | JS blocking | `loading: "defer"` | Easy/Medium |
| `r:{id}:preload` | LCP not preloaded | `loading: "preload"` | Easy |
| `r:{id}:fetchpriority` | LCP image without FP | `fetchpriority: true` | Easy |
| `r:{id}:dimensions` | image missingDimensions | `missingDimensions: false` | Easy |
| `r:{id}:fontDisplay` | font swap/block | `fontDisplay: "optional"` | Easy |
| `r:{id}:size` | JS >100KB or image >150KB | halve or ×0.6 | Medium |
| `r:{id}:inline` | critical CSS ≤30KB blocking | `inline: true` | Medium |

**Page-level candidates:**

| Key | Condition | Patch | Effort |
|-----|-----------|-------|--------|
| `p:cdn` | !meta.cdn | `cdn: true` | Easy |
| `p:ttfb` | meta.ttfb > 200 | `ttfb: 150` | Hard |

Lock key format matches suggestion key — stored in `variation.locked`.

---

## 6. Lighthouse Importer — lighthouseImporter.js

### parseLighthouseReport(jsonOrText) → CalibrationPayload

**Supports:** LH 10, 11, 12, 13+ (both field naming conventions)

**Key extraction logic:**

1. **Metrics:** `audit.numericValue` from: `first-contentful-paint`, `largest-contentful-paint`, `total-blocking-time`, `cumulative-layout-shift`, `speed-index`, `interactive`
2. **Profile detection:** `configSettings.formFactor`, `cpuSlowdownMultiplier` (default 4 mobile/1 desktop)
3. **CDN detection:** Response header check (CF-Ray, X-Amz-CF-Id, X-Vercel-Id, X-Cache) + host pattern match (cloudfront, fastly, akamai, cloudflare, vercel, netlify)
4. **TTFB:** `server-response-time` audit `numericValue`
5. **Resources from `network-requests` audit:**
   - Type mapping: Document→html, Stylesheet→css, Script→js, Font→font, Image/SVG→image, Media→video
   - Loading strategy classification:
     - CSS: blocking if in `render-blocking-resources` audit; else preload
     - JS: blocking if in `render-blocking-resources`; VeryLow priority → async; else defer
     - Image: LCP/High priority → preload; Low priority/offscreen → lazy; else blocking
     - Font: always preload
   - LCP resource: detected from `lcp-breakdown-insight` (LH13+) or `largest-contentful-paint-element` (older)
   - Long tasks: from `long-tasks` audit per URL; remaining distributed from `mainthread-work-breakdown` proportional to JS size
   - Unsized images: from `unsized-images` audit
6. **Real timing (LH13+):** `rendererStartTime`, `networkRequestTime`, `networkEndTime` (already ms)
   **LH≤12:** `startTime`, `responseReceivedTime`, `endTime` (seconds → ×1000)
7. **HTML row:** synthesized from all Document-type requests; first by startTime for timing
8. **Curve fitting:** `fitCurves(realMetrics, realMetricScores, realScore)` from curveFit.js

---

## 7. Curve Fitting — curveFit.js

Called during calibration to adjust per-metric log-normal curves so the computed overall score matches the real Lighthouse score.

**Algorithm:**
1. Start with default curves
2. For each metric, adjust median/p10 so `computeScore(realMetricValue, curve) ≈ realMetricScore`
3. Verify that overall (weighted sum) matches realScore within tolerance
4. Returns `scoringCurves` object stored on the Page

These fitted curves are used instead of global settings curves when computing scores for this page.

---

## 8. IndexedDB Schema — db.js

**Database:** `perf-planner`, version 4

| Store | Key | Indexes | Notes |
|-------|-----|---------|-------|
| `pages` | `id` | — | |
| `variations` | `id` | `pageId` | One per-page index for efficient page-scoped queries |
| `settings` | `id` | — | Always single row with id="global" |

**DB version history:** Version 4 added `variations.locked` field. Migration drops & recreates variations store.

**CRUD helpers exported:** `savePage`, `deletePage`, `saveVariation`, `deleteVariation`, `saveSettings`, `loadAll`

---

## 9. ResourceWaterfall.jsx — Interaction Model

The waterfall is fully self-contained. Props: `{ rows, fcpMs, lcpMs, totalMs }`.

**State:**
- `zoom` (1–80×) — current zoom level
- `viewStart` (ms) — left edge of visible window
- `isDragging` — cursor state

**Zoom:** wheel event on ruler area, or Ctrl+wheel anywhere. Anchor point is mouse X position.

**Pan:** mousedown + mousemove on timeline (document-level to handle drag-out). RAF-throttled.

**Touch:** touchstart/move/end on timeline for mobile pan.

**Rendering:**
- Grid lines: CSS `backgroundImage` with multiple `linear-gradient` entries (one per tick) — applied to both ruler and every row's timeline cell. Single CSS property replaces N×M DOM elements.
- Segments: absolute-positioned `Box` elements. Phase height tiers: stall/dns/tcp/ssl → 32% inset; request → 40% inset; ttfb/download → 18% inset.
- Stall segment: CSS diagonal hatch via `repeating-linear-gradient(45deg, ...)` instead of solid color.
- Tooltip: transparent hit-area Box spanning the full bar width; real segments are `pointerEvents: none`.

**Phase colors:**
```js
stall:    "#aaaaaa"  // gray hatch
dns:      "#009d57"  // green
tcp:      "#e58d1a"  // orange
ssl:      "#9b52b5"  // purple
request:  "#1a6c5e"  // dark teal (thin stripe)
ttfb:     "#c0c0c0"  // light gray
download: TYPE_DL_COLOR[row.type]  // per resource type
```

**Download colors (TYPE_DL_COLOR):**
```js
html: "#3b82f6", js: "#ef4444", css: "#f59e0b",
font: "#c084fc", image: "#22c55e", video: "#38bdf8", other: "#94a3b8"
```

---

## 10. Component Data Flow

```
index.jsx
  ├── reads: activeVariation, baselineVariation, settings, page
  ├── computes: metrics (mobile+desktop), scores, roadmap, waterfall (mobile+desktop)
  ├── passes to ImpactDashboard: { mobileMetrics, desktopMetrics, mobileScores, desktopScores,
  │                                 mobileWaterfall, desktopWaterfall, baselineMetrics,
  │                                 baselineScores, calibration, effectiveSettings }
  ├── passes to ResourcePanel: { resources, pageMeta, metrics, scores }
  └── passes to OptimizationRoadmap: { roadmap, locked, dispatch }

ImpactDashboard → ScoreCard (one per selected profile)
  └── ScoreCard → ResourceWaterfall (rows+fcpMs+lcpMs+totalMs)

ResourcePanel → ResourceDialog (modal, controlled by parent)
OptimizationRoadmap → RoadmapCard[] (Apply/Lock dispatch to reducer)
```

All heavy computation (`computeMetrics`, `computeScores`, `computeRoadmap`, `computeResourceWaterfall`) runs synchronously in `useMemo` blocks in `index.jsx`. There is no background worker. For pages with >100 resources, this could be a bottleneck — the current design is acceptable for typical pages (10–50 resources).

---

## 11. Auto-Save

`useAutoSave(variation, dispatch)` — 500ms debounce on variation identity change. Calls `saveVariation(variation)` to IndexedDB. Explicit saves also happen in ResourceDialog and VariationTabs after mutations to avoid the debounce lag on critical operations.

---

## 12. Settings Migration

On init, if `settings.scoringWeights.tti` exists (old schema), the reducer resets settings to defaults. This handles the TTI weight removal silently without a DB version bump.

---

## 13. Known Limitations

- **Network model:** No real bandwidth contention modelling — parallel downloads get equal shares. No request prioritization beyond phase classification. RTT is treated as constant (no jitter).
- **Execution time:** CPU-only scaling (`cpuMultiplier` ratio). No memory pressure, GC pauses, or layout/style recalc modelling.
- **Calibration scope:** Curves are fitted at the calibration CPU throttle level. Scaling to other profiles is an approximation (linear CPU ratio only).
- **Stall phase:** `stallMs = 0` always. HTTP/1.1 connection-pool stall is already encoded in staggered `startMs` values in the waterfall; it is not separated into a visible stall segment.
- **Comparison mode:** Always uses mobile profile. Desktop comparison not implemented.
- **Max 4 comparisons:** Hard cap in `COMPARISON_VARIATION_TOGGLED` reducer.

---

## 14. Adding a New Roadmap Suggestion

1. In `calculator.js` → `computeRoadmap()`, add a new `candidates.push({...})` block following the existing pattern
2. Key format: `r:{resourceId}:{field}` for per-resource, `p:{name}` for page-level
3. `patch` shape: `{ resourceId, fields: {...} }` for resource patch; `{ meta: {...} }` for pageMeta patch
4. The `applyPatch()` function in `OptimizationRoadmap.jsx` already handles both patch shapes via dispatch

## 15. Adding a New Phase to the Waterfall

1. Add field to row object in `makeRow()` and `makeRowFromReal()` in `calculator.js`
2. Add entry to `PHASE` constant in `ResourceWaterfall.jsx`
3. Add to `PHASE_ORDER` array
4. Add to `buildSegments()` phases array
5. Add height tier in segment `sx` condition
6. Add tooltip row in `tooltipContent` grid
7. Add legend swatch in the PHASE_ORDER map at bottom

## 16. Adding a New Resource Field

1. Add to `defaultSettings.js` resource shape defaults
2. Add UI in `ResourceDialog.jsx` (conditional by type if needed)
3. Dispatch `RESOURCE_FIELD_CHANGED` or include in `RESOURCE_UPDATED` payload
4. Use in `calculator.js` metric computation as needed
5. Update `lighthouseImporter.js` if the field can be detected from Lighthouse data

---

## 17. File Locations for Common Tasks

| Task | File |
|------|------|
| Change how FCP is computed | `calculator.js` → `computeMetrics()` |
| Change scoring thresholds | `defaultSettings.js` → `scoringCurves` |
| Add/remove a scoring metric | `calculator.js` + `defaultSettings.js` + `SettingsPanel.jsx` |
| Change waterfall colors | `ResourceWaterfall.jsx` → `PHASE` and `TYPE_DL_COLOR` |
| Add a new page meta field | `PageMetaBar.jsx` + `defaultSettings.js` + `calculator.js` + `exportImport.js` |
| Fix Lighthouse parsing for a new LH version | `lighthouseImporter.js` |
| Change IndexedDB schema | `db.js` → bump version + add migration |
| Change roadmap suggestions | `calculator.js` → `computeRoadmap()` |
| Change comparison behavior | `ComparisonMode.jsx` + `ComparisonColumn.jsx` |
