# Perf-Planner — Complete Technical Reference

This file is the single source of truth for understanding and modifying the perf-planner project.
**Keep it updated whenever you change any file in this directory.**

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
├── index.jsx                        ← root component; metric computation, auto-save, layout switcher
├── context/
│   ├── AppContext.jsx               ← React context provider; DB init, settings migration on mount
│   ├── contextObject.js             ← createContext() only
│   └── reducer.js                   ← all state mutations (all action types documented in §4)
├── lib/
│   ├── calculator.js                ← CORE: computeMetrics, computeScores, computeRoadmap,
│   │                                          computeResourceWaterfall, computeWaterfall, scoreColor
│   ├── resourceSimulator.js         ← computeResourceImpact (incremental per-resource impact)
│   ├── lighthouseImporter.js        ← parseLighthouseReport → resources + calibration payload
│   ├── defaultSettings.js           ← all default values (network profiles, scoring curves, resource shape)
│   ├── db.js                        ← IndexedDB schema (version 4), CRUD helpers
│   ├── curveFit.js                  ← fits log-normal curves to match Lighthouse real score
│   └── exportImport.js              ← JSON export/import for pages+variations and settings
├── hooks/
│   ├── useAutoSave.js               ← 500ms debounce; saves active variation to IndexedDB
│   └── useContextMenu.js            ← context menu position state + global close listeners
├── components/
│   ├── layout/
│   │   ├── TopBar.jsx               ← app title, page quick-switcher, calibration Δ chip,
│   │   │                              compare button, settings icon, guide link
│   │   ├── VariationTabs.jsx        ← tab strip with score badges, rename, duplicate, add-variation
│   │   └── TabContextMenu.jsx       ← right-click context menu: rename, duplicate, set baseline, delete
│   ├── input/
│   │   └── PageMetaBar.jsx          ← TTFB input + CDN toggle (affects active variation only)
│   ├── dashboard/
│   │   ├── ImpactDashboard.jsx      ← mobile/desktop toggle; computes both waterfalls; renders ScoreCard
│   │   ├── ScoreCard.jsx            ← score gauge + 5 metric rows + ResourceWaterfall
│   │   ├── ScoreGauge.jsx           ← SVG arc gauge coloured by scoreColor()
│   │   ├── MetricRow.jsx            ← single metric row: label, value, delta pill, sub-score bar, pts
│   │   ├── ResourceWaterfall.jsx    ← interactive Chrome DevTools-style waterfall (zoom/pan)
│   │   └── WaterfallBar.jsx         ← simple stacked bar (legacy; not used by ResourceWaterfall)
│   ├── resources/
│   │   ├── ResourcePanel.jsx        ← left-sidebar resource list; per-resource score impact deltas
│   │   └── ResourceDialog.jsx       ← add/edit resource modal with type-specific fields
│   ├── roadmap/
│   │   ├── OptimizationRoadmap.jsx  ← renders sorted suggestions; dispatches Apply/Lock
│   │   └── RoadmapCard.jsx          ← single suggestion card: mobile gain, effort, desktop gain, metrics
│   ├── comparison/
│   │   ├── ComparisonMode.jsx       ← full-page side-by-side layout (2–4 variations)
│   │   ├── ComparisonSelector.jsx   ← left sidebar: checkboxes to pick variations (grouped by page)
│   │   └── ComparisonColumn.jsx     ← one variation column with score + metric rows + best/worst highlight
│   ├── settings/
│   │   └── SettingsPanel.jsx        ← right drawer: network profiles, scoring weights/curves,
│   │                                   connection model, export/import/reset
│   ├── pages/
│   │   └── PageManager.jsx          ← page cards; calibrate/rename/export/delete per page; empty state
│   └── calibration/
│       └── CalibrationPanel.jsx     ← Lighthouse JSON upload+paste; fitted-curves table; create/recalibrate
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
    realMetrics: { fcp, lcp, tbt, cls, si, tti },   // all ms except cls
    realMetricScores: { fcp, lcp, tbt, cls, si, tti },
    sourceUrl: string,
    fetchTime: string,     // ISO
    lhVersion: string,
    formFactor: "mobile" | "desktop",
    cpuSlowdownMultiplier: number,   // 4 for mobile, 1 for desktop by default
    throttlingRttMs: number | null,
    throttlingThroughputKbps: number | null,
    resourceHash: string,  // fingerprint: type:sizeKB:loading:source:count joined by comma
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
    cdn: boolean,          // reduces same-origin RTT by ~60%
    isSpaRendered: boolean // detected from Lighthouse; FCP extends to include JS exec
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
  count: number,           // bundled/repeated count; wire bytes = sizeKB × count × 1024

  // JS only
  execTimeMs: number,      // measured at calibration CPU; scaled to profile CPU in calculator
  longTaskCount: number,   // tasks > 50ms (from Lighthouse long-tasks audit)
  avgLongTaskMs: number,
  evalMs: number,          // V8 script evaluation time from Lighthouse bootup-time audit
  parseMs: number,         // V8 parse/compile time from Lighthouse bootup-time audit

  // Lighthouse import snapshots (JS only) — used for proportional bar scaling
  importedExecTimeMs: number | undefined,  // execTimeMs at import time (after mainthread distribution)
  importedSizeKB: number | undefined,      // sizeKB at import time

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
  startTimeMs: number | undefined,         // navigation-relative; from rendererStartTime or startTime×1000
  endTimeMs: number | undefined,           // from networkEndTime or endTime×1000
  responseReceivedMs: number | undefined,  // networkRequestTime or responseReceivedTime×1000
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
  scoringCurves: {         // log-normal CDF parameters
    fcp: { median: 3000, p10: 1800 },
    lcp: { median: 4000, p10: 2500 },
    tbt: { median: 600,  p10: 200  },
    cls: { median: 0.25, p10: 0.10 },
    si:  { median: 5800, p10: 3387 }
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
  endMs: number,           // includes download + parse + eval for JS

  // Network phase durations (ms); ?? 0 safe in buildSegments
  stallMs: number,         // always 0 currently
  dnsMs: number,
  tcpMs: number,
  sslMs: number,
  requestMs: number,       // ≈ rtt × 0.1; carved from connection overhead
  ttfbMs: number,
  downloadMs: number,

  // CPU phase durations (ms); JS only — 0 for all other types
  parseMs: number,         // V8 parse/compile; scales with sizeKB / importedSizeKB
  evalMs: number,          // V8 evaluation; scales with execTimeMs / importedExecTimeMs

  // From Lighthouse only
  protocol: string | null,
  entity: string | null
}
```

---

## 4. State Shape & Reducer Actions

### App State
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
| `INIT_LOADED` | `{ pages, variations, activePageId, activeVariationId, settings }` | Bootstrap state from DB |
| `PAGE_CREATED` | `page` object | Append page |
| `PAGE_CREATED_FROM_LIGHTHOUSE` | `{ page, baseline }` | Add page + baseline variation; set both as active |
| `PAGE_RECALIBRATED` | `{ pageId, scoringCurves, calibration, baselinePageMeta, baselineResources, updatedAt }` | Update page curves + calibration; update baseline pageMeta + resources |
| `PAGE_RENAMED` | `{ id, name, updatedAt }` | Rename page |
| `PAGE_DELETED` | `{ id }` | Remove page + all its variations; auto-select sibling |
| `PAGE_IMPORTED` | `{ page, variations }` | Add imported page + all variations; set first as active |
| `SET_ACTIVE_PAGE` | `{ pageId, variationId }` | Switch active page + variation |
| `VARIATION_CREATED` | variation object | Append variation |
| `VARIATION_RENAMED` | `{ id, name, updatedAt }` | Rename variation |
| `VARIATION_DUPLICATED` | variation object (new id) | Append copy |
| `VARIATION_DELETED` | `{ id }` | Remove; auto-select sibling |
| `VARIATION_SET_BASELINE` | `{ pageId, variationId }` | Mark as baseline; unmark all others for that page |
| `SET_ACTIVE_VARIATION` | `{ id }` | Switch active variation |
| `PAGE_META_CHANGED` | `{ variationId, field, value }` | Mutate `pageMeta.ttfb` or `.cdn` |
| `RESOURCE_FIELD_CHANGED` | `{ variationId, resourceId, field, value }` | Mutate single field; spreads `...r` so snapshot fields survive |
| `RESOURCE_ADDED` | `{ variationId, resource }` | Append resource |
| `RESOURCE_UPDATED` | `{ variationId, resource }` | Replace resource by id (whole object) |
| `RESOURCE_DELETED` | `{ variationId, resourceId }` | Remove resource |
| `LOCK_TOGGLED` | `{ variationId, key }` | Toggle `locked[key]` |
| `SETTINGS_LOADED` | settings object | Replace settings (initial load) |
| `SETTINGS_UPDATED` | settings object | Replace settings |
| `COMPARISON_OPENED` | — | `comparisonMode = true`, clear ids |
| `COMPARISON_CLOSED` | — | `comparisonMode = false`, clear ids |
| `COMPARISON_VARIATION_TOGGLED` | `{ variationId }` | Add/remove from ids (max 4) |

---

## 5. Core Simulation — calculator.js

### 5.1 computeMetrics(resources, pageMeta, profile, calibration) → Metrics

Returns `{ fcp, lcp, tbt, cls, si, tti }` all in ms except CLS.
TTI is computed and returned but **not used in scoring**. The 5 scored metrics are fcp, lcp, tbt, cls, si.

**Internal helpers:**

- `tcpDownloadTime(bytes, rttMs, bandwidthKBs)` — TCP slow-start: each RTT doubles window until bandwidth-limited; initial cwnd = 14KB
- `effRTT(rtt, source, cdn)` — adjusts RTT: `own-cdn` → ×0.4, `third-party-cdn` → ×0.8, same-origin with CDN → ×0.4
- `connSetup(rtt, source, cdn, isFirstToHost)` — DNS+TCP+TLS overhead; 0 if CDN/own-cdn or not first to host
- `hostKey(r)` — `"same-origin"` | `"own-cdn"` | `"tp:{id}"` (each third-party gets its own key)
- `splitSetup(setupMs, rtt)` → `{ dnsMs: rtt×0.5, tcpMs: rtt×0.7, sslMs: rtt×0.8, requestMs: max(1, rtt×0.1) }`
- `downloadCohort(cohort, profile, meta, hostsOpen)` → runs a parallel cohort; each resource gets `bandwidth/n` share

**FCP computation (steps):**
1. HTML downloads alone: `htmlFirstByte = ttfb + connSetup`; `htmlDone = htmlFirstByte + htmlDownload`
2. Render-blocking CSS/JS (not inlined): download in parallel cohort starting at `htmlFirstByte`; if inline critical CSS exists, blocking CSS is excluded from FCP
3. Inline JS adds parse cost: `inlineJsKB × 0.05 × cpuMul`
4. SPA path (`pageMeta.isSpaRendered`): for own deferred JS, FCP extends to `htmlFirstByte + setup + download + execTimeMs × execScale`
5. `fcp += 50 × cpuMul` (browser paint cost)
6. Block-display fonts without preload add their download time

**LCP computation:**
- Discovery time depends on loading: `preload+fetchpriority` → 0, `preload` → htmlFirstByte, image/video → htmlFirstByte, CSS-referenced → htmlDone
- LCP download uses 50% of bandwidth; `renderCost = sizeKB × 0.02 × cpuMul`
- `lcp = max(fcp, discovery + setup + lcpDownload + renderCost)`

**Real FCP/LCP substitution (§5.1 step 7):**
After computing simulated fcp/lcp but **before** computing SI/TTI, if:
- `calibration.realMetrics.fcp` and `calibration.resourceHash` both exist
- Calibration form factor matches active profile form factor (desktop if `rtt < 100`, else mobile)
- Current resource hash equals `calibration.resourceHash`

…then `fcp` and `lcp` are replaced with the real Lighthouse values. SI and TTI are derived from these real values, making scorecard and waterfall markers consistent.

**TBT computation:**
- `execScale = profile.cpuMultiplier / calibration.cpuSlowdownMultiplier` (rescales between profiles)
- Per JS resource: `longTaskCount × max(0, avgLongTaskMs × execScale − 50)` + residual heuristic (`max(0, exec - declaredLong) × 0.08`)

**CLS computation:**
- Missing image dimensions: `+0.05` per image
- `font-display: swap/block` without preload: `+0.03` per font
- Capped at 1.0

**SI / TTI:**
- `si = fcp × 0.55 + lcp × 0.45`
- `tti = max(fcp + 500, fcp + totalJsExec + thirdPartyExec × 0.25)` (0.6 if third-party is blocking)

---

### 5.2 computeScores(metrics, settings) → { fcp, lcp, tbt, cls, si, overall }

Log-normal CDF: `score = 100 × (1 − Φ(ln(value/median) / σ))` where `σ = ln(median/p10) / 0.9061`

`overall = round(fcp×0.10 + lcp×0.25 + tbt×0.30 + cls×0.25 + si×0.10)`

Uses `page.scoringCurves` if present (from calibration), else `settings.scoringCurves`.

`scoreColor(score)`: `≥90` → `#0cce6b`, `≥50` → `#ffa400`, else `#ff4e42`

---

### 5.3 computeResourceWaterfall(resources, pageMeta, profile, calibration) → { rows, fcpMs, lcpMs, totalMs }

**Mode detection (real vs simulation):**
```
subResources = resources where type !== "html"
realCount = subResources with valid startTimeMs + endTimeMs + endMs > startMs
useRealTiming = (html has real timing) || (realCount >= ceil(subResources.length × 0.5))
```
Real timing is always preferred — it captures HTTP/2 multiplexing, connection reuse, and browser prioritization that TCP simulation cannot reproduce.

**Real-timing mode:**
- HTML row: built directly from `startTimeMs/endTimeMs/responseReceivedMs`
- Sub-resources with timestamps: `makeRowFromReal(r, phase, rtt)` — carves `requestMs = min(max(1, rtt×0.1), overhead)` from overhead; `ttfbMs = overhead − requestMs`; `downloadMs = endMs − sendMs`
- **Download adjustment** (when user changes `sizeKB`): `sizeRatio = sizeKB / importedSizeKB`; if `|sizeRatio − 1| > 0.005`, scales `downloadMs × sizeRatio` and recomputes `endMs`; start time stays anchored to real measurement
- Sub-resources without timestamps: simulate at `htmlRefEnd` (TCP model)

**Simulation mode:**
- MAX_SIM_CONCURRENT = 8 (caps bandwidth sharing)
- Blocking cohort: staggered by `rtt × 0.04` ms per resource
- Deferred/async/preload: start at `htmlFirstByte`; `fetchpriority` preloads start at 0
- Lazy: start at `htmlDone`
- LCP resource: hoisted above its cohort, 50% bandwidth share

**Parse/eval CPU extension (applied after all rows built):**
```
calibCpu = calibration.cpuSlowdownMultiplier ?? 4
cpuScale = profile.cpuMultiplier / calibCpu

for each JS row:
  sizeRatio = importedSizeKB > 0 ? sizeKB / importedSizeKB : 1
  execRatio = importedExecTimeMs > 0 ? execTimeMs / importedExecTimeMs : 1
  row.parseMs = round((res.parseMs ?? 0) × sizeRatio × cpuScale)   ← parse ∝ bytes
  row.evalMs  = round((res.evalMs  ?? 0) × execRatio × cpuScale)   ← eval ∝ code complexity
  row.endMs  += row.parseMs + row.evalMs
```

Rationale: parsing is proportional to bytes tokenised; evaluation is proportional to code complexity (execTimeMs). Both fields use their own independent ratio so changes to one don't affect the other. When resources are unmodified (ratio = 1), exact Lighthouse bootup-time values are used.

**FCP/LCP markers:**
`computeMetrics(list, meta, profile, calibration)` is called and its result used for `fcpMs`/`lcpMs`, making waterfall markers and scorecard rows identical.

---

### 5.4 computeRoadmap(resources, pageMeta, locked, profile, calibration, settings) → Suggestion[]

Each candidate applies a hypothetical patch, recomputes score, returns if `gain > 0` and not locked.
Suggestions are sorted by `mobileGain` descending.

**Per-resource candidates:**

| Key pattern | Condition | Patch | Effort |
|-------------|-----------|-------|--------|
| `r:{id}:format` | image not AVIF/WebP | `imageFormat: "AVIF"` | Easy |
| `r:{id}:loading` | JS blocking | `loading: "defer"` | Easy/Medium (3rd-party = Medium) |
| `r:{id}:preload` | LCP not preloaded | `loading: "preload"` | Easy |
| `r:{id}:fetchpriority` | LCP image without fetchpriority | `fetchpriority: true` | Easy |
| `r:{id}:dims` | image missingDimensions | `missingDimensions: false` | Easy |
| `r:{id}:fontdisplay` | font swap/block | `fontDisplay: "optional"` | Easy |
| `r:{id}:size` | JS >100KB | halve `sizeKB` + halve `execTimeMs` | Hard |
| `r:{id}:size` | image >150KB | `sizeKB × 0.6` | Medium |
| `r:{id}:inline` | critical CSS ≤30KB blocking | `inline: true` | Medium |

**Page-level candidates:**

| Key | Condition | Patch | Effort |
|-----|-----------|-------|--------|
| `p:cdn` | `!meta.cdn` | `cdn: true` | Easy |
| `p:ttfb` | `meta.ttfb > 200` | `ttfb: 150` | Medium |

Lock key stored in `variation.locked` matches suggestion key exactly.

---

## 6. Lighthouse Importer — lighthouseImporter.js

### parseLighthouseReport(jsonOrText) → CalibrationPayload

**Supports:** LH 10, 11, 12, 13+ (both field naming conventions)

**Step-by-step extraction:**

1. **Metrics** — `audit.numericValue` from: `first-contentful-paint`, `largest-contentful-paint`, `total-blocking-time`, `cumulative-layout-shift`, `speed-index`, `interactive`
2. **Profile detection** — `configSettings.formFactor` + `cpuSlowdownMultiplier` (default 4/1); throttling RTT + throughput
3. **CDN detection** — response header check (`CF-Ray`, `X-Amz-CF-Id`, `X-Vercel-Id`, `X-Cache`) + host pattern match (`cloudfront`, `fastly`, `akamai`, `cloudflare`, `vercel`, `netlify`)
4. **TTFB** — `server-response-time` audit `numericValue`
5. **Bootup times** — `buildBootupByUrl()` extracts per-URL `{ evalMs, parseMs }` from `bootup-time` audit (`scripting` / `scriptParseCompile` columns)
6. **Long tasks** — `buildLongTasksByUrl()` aggregates `long-tasks` audit by URL
7. **Blocking URLs** — `buildBlockingUrls()` from `render-blocking-resources` (LH ≤12) and `render-blocking-insight` (LH 13+)
8. **Offscreen images** — `buildOffscreenSet()` from `offscreen-images`
9. **LCP element** — `findLcpElementInfo()` walks `lcp-breakdown-insight` (LH 13+), `largest-contentful-paint-element` (older), then `prioritize-lcp-image` as fallback
10. **Resources from `network-requests`:**
    - Type mapping: Document→html, Stylesheet→css, Script→js, Font→font, Image→image, Media→video
    - Loading strategy (`classifyLoading`): CSS: blocking if in blocking set, else preload; JS: blocking if in blocking set, VeryLow priority→async, else defer; Image/Video: LCP or high priority→preload, offscreen→lazy, else blocking; Font: always preload; XHR/Fetch: lazy
    - `evalMs`/`parseMs` populated from `bootupByUrl`
    - Real timing (LH13+): `rendererStartTime`, `networkRequestTime`, `networkEndTime` (ms already); LH≤12: `startTime`/`responseReceivedTime`/`endTime` (seconds ×1000)
11. **HTML row synthesized** — aggregates all Document-type requests; uses earliest one's timing
12. **LCP fallback** — if image LCP detected but URL not matched, flags the largest image
13. **Mainthread-work distribution** — remaining mainthread work (beyond declared long tasks) distributed across JS resources proportional to `sizeKB`; this prevents simulated TBT collapsing to ~0
14. **Import snapshots** — after all distribution:
    ```js
    for each JS resource:
      r.importedExecTimeMs = r.execTimeMs  // final value after distribution
      r.importedSizeKB     = r.sizeKB
    ```
15. **SPA detection** — if own-origin deferred JS has `>200ms` total exec, `isSpaRendered = true`
16. **resourceHash fingerprint** — `resources.map(r => type:round(sizeKB):loading:source:count).join(",")` stored in calibration

**CalibrationPayload returned:**
```js
{
  name, sourceUrl, fetchTime, lhVersion,
  formFactor, cpuSlowdownMultiplier, throttlingRttMs, throttlingThroughputKbps,
  pageMeta: { ttfb, cdn, isSpaRendered },
  resources,        // Resource[] with Lighthouse timing + bootup + snapshot fields
  resourceHash,     // fingerprint string
  realScore,
  realMetrics,
  realMetricScores,
}
```

---

## 7. Curve Fitting — curveFit.js

### fitCurves(realMetrics, realMetricScores, realScore) → scoringCurves

**Pass 1 — per-metric binary search:**
For each of `[fcp, lcp, tbt, cls, si]`:
- Skip if score is 0/1 (boundary — ill-conditioned) or default curve already matches within 0.5 points
- Binary search scalar `k ∈ [0.05, 3]` to scale `median` and `p10` uniformly until `metricScore(value, scaled) ≈ targetScore` (40 iterations, tolerance 0.5)

**Pass 2 — uniform residual nudge:**
After per-metric fitting, if `|computeScores(realMetrics, fitted).overall − realScore| > 1`:
- Binary search global scale factor `k ∈ [0.5, 2]` applied to all 5 curves simultaneously (12 iterations, tolerance 1 point)

Result: scoring curves where the simulator reproduces both per-metric scores and the overall score within 1 point.

---

## 8. IndexedDB Schema — db.js

**Database:** `perf-planner`, **version 4**

| Store | Key | Indexes |
|-------|-----|---------|
| `pages` | `id` | — |
| `variations` | `id` | `pageId` (non-unique) |
| `settings` | `id` | — |

**Version history:**
- v1: created `pages` + `variations` stores
- v2: added `settings` store  
- v3: dropped + recreated `pages` + `variations` (schema change)
- v4: dropped + recreated `pages` + `variations` again (replaced `inputs` with `pageMeta` + resource-shaped `resources`); `settings` store survives all upgrades

**Exported CRUD helpers:** `openDB`, `getAllPages`, `savePage`, `deletePage`, `getAllVariations`, `saveVariation`, `deleteVariation`, `getVariationsByPageId`, `deleteVariationsByPageId`, `getSettings`, `saveSettings`

`deletePage(id)` cascades: deletes all variations for that page first.

---

## 9. Export/Import — exportImport.js

**Export version:** 4

**`downloadPageAsJSON(page, variations)`** — downloads `{page-name}-perf-profile.json`:
```json
{
  "exportVersion": 4,
  "exportedAt": "ISO",
  "page": { "name", "scoringCurves", "calibration" },
  "variations": [{ "name", "isBaseline", "locked", "pageMeta", "resources" }]
}
```

**`downloadSettingsAsJSON(settings)`** — downloads `perf-planner-settings.json`

**`parseImportFile(file)`** — validates `exportVersion === 4`; assigns new UUIDs to page + variations; returns `{ page, variations }`

**`parseSettingsFile(file)`** — merges imported settings with `DEFAULT_SETTINGS` (missing fields fall back to defaults)

---

## 10. Resource Simulator — resourceSimulator.js

`computeResourceImpact(pageMeta, resources, profileKey, settings)` — computes incremental metric impact of a resource list (used less frequently than `computeMetrics`). Protocol-aware (HTTP/1.1 uses connection-pool queue model, HTTP/2 and HTTP/3 use multiplexed bandwidth sharing with QUIC gain).

Returns `{ extraBlockingMs, extraExecMs, extraLongTaskTBT, extraCLS, lcpResourceMs, hasLcpResource }`.

**Not used in the main data flow** — `computeMetrics` in calculator.js is the authoritative metric source.

---

## 11. ResourceWaterfall.jsx — Interaction Model

Props: `{ rows, fcpMs, lcpMs, totalMs }`

**Zoom/pan state:**
- `zoom` (1–80×, default: auto-fits first ~10s on first render)
- `viewStart` (ms) — left edge of visible window

**Zoom:** wheel on ruler or Ctrl+wheel on rows. Anchor point = mouse X position.

**Pan:** mousedown+drag on timeline; document-level listeners so drag-out works. RAF-throttled.

**Touch:** `touchstart/move/end` for mobile pan.

**Phase colors:**
```js
const PHASE = {
  stall:    { color: "#aaaaaa", label: "Queueing / Stalled"  },  // diagonal hatch
  dns:      { color: "#009d57", label: "DNS Lookup"          },
  tcp:      { color: "#e58d1a", label: "Initial Connection"  },
  ssl:      { color: "#9b52b5", label: "SSL/TLS"             },
  request:  { color: "#1a6c5e", label: "Request Sent"        },  // thin stripe
  ttfb:     { color: "#c0c0c0", label: "Waiting (TTFB)"      },
  download: { color: null,      label: "Content Download"    },  // TYPE_DL_COLOR[row.type]
  parse:    { color: "#06b6d4", label: "Parse / Compile"     },  // cyan
  eval:     { color: "#d946ef", label: "Script Evaluation"   },  // magenta
};

const TYPE_DL_COLOR = {
  html: "#3b82f6", js: "#ef4444", css: "#f59e0b",
  font: "#c084fc", image: "#22c55e", video: "#38bdf8", other: "#94a3b8",
};
```

**Phase height tiers in segments:**
- `stall/dns/tcp/ssl` → `top: 32%, bottom: 32%` (narrow)
- `request` → `top: 40%, bottom: 40%` (very narrow stripe)
- `ttfb/download/parse/eval` → `top: 18%, bottom: 18%` (full height)

**Rendering:**
- Grid lines: single `backgroundImage` CSS with multiple `linear-gradient` entries (one per tick). Applied to ruler + all row timeline cells — replaces N×M DOM elements.
- Segments: `pointerEvents: none`; tooltip hit-area is a separate transparent `Box` spanning the whole bar.
- End-time label: shown right of bar when `4% < endPct < 96%`.
- Pan progress bar at bottom when `zoom > 1`.

**PHASE_ORDER:** `["stall","dns","tcp","ssl","request","ttfb","download","parse","eval"]`

---

## 12. Component Data Flow

```
index.jsx
  ├── useMemo: mobileMetrics, desktopMetrics (computeMetrics ×2)
  ├── useMemo: mobileScores, desktopScores (computeScores ×2)
  ├── useMemo: baselineMobileMetrics, baselineDesktopMetrics (computeMetrics ×2; skipped when isBaseline)
  ├── useMemo: roadmapItems (computeRoadmap; always uses PROFILES.mobile)
  ├── useMemo: tabScores (computeMetrics + computeScores per tab; always mobile)
  ├── useAutoSave(activeVariation) — 500ms debounce
  │
  ├── TopBar — props: onPagesOpen, onSettingsOpen, onCalibrationOpen, simMobileScore, simDesktopScore
  │            (calibration Δ chip reads calibration.formFactor to pick which score to compare)
  ├── VariationTabs — props: variations, activeVariationId, tabScores
  ├── PageMetaBar — reads/dispatches active variation pageMeta
  ├── ResourcePanel — reads active variation resources; per-resource score deltas via computeMetrics
  ├── ImpactDashboard — receives pre-computed metrics+scores; computes both waterfalls internally:
  │   │  computeResourceWaterfall(resources, pageMeta, PROFILES.mobile,  calibration)
  │   │  computeResourceWaterfall(resources, pageMeta, PROFILES.desktop, calibration)
  │   └── ScoreCard
  │       ├── ScoreGauge (SVG arc)
  │       ├── MetricRow ×5 (with baseline delta pills)
  │       └── ResourceWaterfall (rows, fcpMs, lcpMs, totalMs)
  ├── OptimizationRoadmap — receives pre-computed roadmapItems; dispatches RESOURCE_FIELD_CHANGED /
  │                         PAGE_META_CHANGED; patchFromSuggestionKey maps key→field/value
  ├── SettingsPanel — drawer; reads/dispatches settings
  ├── PageManager — page cards; triggers calibration dialog; file import
  └── CalibrationPanel — Lighthouse JSON upload; parseLighthouseReport → fitCurves → dispatch
                         PAGE_CREATED_FROM_LIGHTHOUSE or PAGE_RECALIBRATED

ComparisonMode (when state.comparisonMode = true)
  ├── ComparisonSelector — sidebar checkboxes; max 4 variations
  └── ComparisonColumn ×N — computeMetrics + computeScores per column (mobile only)
```

All heavy computation runs synchronously in `useMemo` in `index.jsx` or in render in `ImpactDashboard`. No background workers.

---

## 13. Auto-Save

`useAutoSave(variation)` — 500ms debounce on variation object identity change. Calls `saveVariation(variation)` to IndexedDB. The debounce cleans up on unmount or when variation changes before the timer fires.

Explicit saves also happen in:
- `VariationTabs` / `TabContextMenu` — after rename, duplicate, set-baseline
- `CalibrationPanel` — `savePage` + `saveVariation` immediately on apply
- `OptimizationRoadmap` — relies on auto-save (dispatches reducer, auto-save picks it up)

---

## 14. Settings Migration

On `AppContext.jsx` init, if `settings.scoringWeights.tti != null` (old schema that included TTI), settings are reset to `DEFAULT_SETTINGS.scoringWeights` + `DEFAULT_SETTINGS.scoringCurves` and re-saved. This handles TTI removal silently without a DB version bump.

---

## 15. Known Limitations

- **Network model:** No real bandwidth contention — parallel downloads get equal shares. No request prioritization beyond phase classification. RTT constant (no jitter). HTTP/2 multiplexing estimated via cohort share, not real stream scheduling.
- **Execution time:** CPU-only scaling via `cpuMultiplier` ratio. No memory pressure, GC pauses, layout/style recalc.
- **Calibration scope:** Curves fitted at calibration CPU throttle. Scaling to other profiles is linear CPU ratio only.
- **Stall phase:** `stallMs = 0` always. HTTP/1.1 connection-pool stall is encoded in staggered `startMs` in simulation mode, not separated into a visible stall segment.
- **Comparison mode:** Always uses mobile profile. Desktop comparison not implemented.
- **Max 4 comparisons:** Hard cap in reducer.
- **resourceHash sensitivity:** Hash uses `round(sizeKB)` — changes < 0.5KB to sizeKB won't be detected as modified. This is intentional to avoid floating-point noise.

---

## 16. Adding a New Roadmap Suggestion

1. In `calculator.js` → `computeRoadmap()`, add `candidates.push({...})` following existing pattern
2. Key format: `r:{resourceId}:{field}` for per-resource, `p:{name}` for page-level
3. `patch` shape: `{ resourceId, fields: {...} }` for resource; `{ meta: {...} }` for pageMeta
4. In `OptimizationRoadmap.jsx` → `patchFromSuggestionKey()`, add the key suffix → field mapping
5. For page-level: add to `pageMetaTargetForKey()` as well

---

## 17. Adding a New Phase to the Waterfall

1. Add duration field to `makeRow()` and `makeRowFromReal()` in `calculator.js` (initialize to 0)
2. Update `endMs` calculation if the phase extends total duration
3. Add to `PHASE` constant in `ResourceWaterfall.jsx` with color + label
4. Add to `PHASE_ORDER` array
5. Add to `buildSegments()` phases array with `durationMs: row.newPhaseMs ?? 0`
6. Add height tier in segment `sx` top/bottom condition
7. Add tooltip row in `tooltipRows` array (conditional on `> 0`)
8. Add legend swatch in the `PHASE_ORDER.map()` at bottom — set appropriate width/height for narrow vs full-height phases

---

## 18. Adding a New Resource Field

1. Add with default to `DEFAULT_RESOURCE` in `defaultSettings.js`
2. Add UI in `ResourceDialog.jsx` (guard by `type === "js"` etc. as needed)
3. Field will be preserved automatically by:
   - `RESOURCE_FIELD_CHANGED` reducer (spreads `...r`)
   - `ResourceDialog` initialising form with `{ ...resource }` → onSave(form) → `RESOURCE_UPDATED`
4. Use in `calculator.js` metric computation as needed
5. Update `lighthouseImporter.js` if the field can be detected from Lighthouse data
6. Export shape: `RESOURCE_UPDATED` / auto-save handles persistence automatically; `exportImport.js` serialises the full resource array so new fields export for free

---

## 19. File Locations for Common Tasks

| Task | File |
|------|------|
| Change how FCP/LCP is computed | `calculator.js` → `computeMetrics()` |
| Change real vs simulated FCP/LCP switching | `calculator.js` → resourceHash block in `computeMetrics()` |
| Change waterfall bar behavior | `calculator.js` → `computeResourceWaterfall()` |
| Change parse/eval bar scaling | `calculator.js` → CPU extension block in `computeResourceWaterfall()` |
| Change scoring thresholds | `defaultSettings.js` → `scoringCurves` |
| Change scoring weights | `defaultSettings.js` → `scoringWeights` |
| Change waterfall colors | `ResourceWaterfall.jsx` → `PHASE` and `TYPE_DL_COLOR` |
| Add a new roadmap suggestion | `calculator.js` → `computeRoadmap()` + `OptimizationRoadmap.jsx` → `patchFromSuggestionKey()` |
| Change calibration panel fields | `CalibrationPanel.jsx` + `lighthouseImporter.js` |
| Fix Lighthouse parsing for a new LH version | `lighthouseImporter.js` |
| Change IndexedDB schema | `db.js` → bump `DB_VERSION` + add migration block |
| Add a new page meta field | `PageMetaBar.jsx` + `defaultSettings.js` + `calculator.js` + `exportImport.js` |
| Change comparison behavior | `ComparisonMode.jsx` + `ComparisonColumn.jsx` |
| Change export/import format | `exportImport.js` → bump `EXPORT_VERSION` + update parse logic |
| Change metric scoring formula | `calculator.js` → `metricScore()` |
| Change curve fitting algorithm | `curveFit.js` → `fitMetric()` and/or `fitCurves()` |
