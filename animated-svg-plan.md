# Animated SVG Specification ‚Äî naveen-portfolio Articles

> **Purpose:** Production-ready animation specifications for every article in this portfolio.
> Each section defines what animates, how it animates, and exactly what SVG/CSS/JS is needed.
> This is the single source of truth for animation implementation.

---

## Table of Contents

### Shared Components
- [QueueVisualizer](#queuevisualizer)
- [PipelineSteps](#pipelinesteps)
- [StateTransitionDiagram](#statetransitiondiagram)
- [TimelineBar](#timelinebar)
- [TreeDiff](#treediff)
- [LayerStack](#layerstack)
- [WaterfallChart](#waterfallchart)
- [ScopeChain](#scopechain)
- [CallStackVisualizer](#callstackvisualizer)
- [MetricGauge](#metricgauge)
- [NetworkWaterfall](#networkwaterfall)

### Group 1 ‚Äî Critical Rendering (Articles 01‚Äì06)
- [01 ‚Äî Browser Rendering Pipeline](#article-01--browser-rendering-pipeline) ‚Äî File not found ‚Äî skipping
- [02 ‚Äî Critical Rendering Path](#article-02--critical-rendering-path)
- [03 ‚Äî Reflow, Repaint & Layout Thrashing](#article-03--reflow-repaint--layout-thrashing)
- [04 ‚Äî CSS & JS Animations](#article-04--css--js-animations)
- [05 ‚Äî CSS Containment](#article-05--css-containment)
- [06 ‚Äî Event Loop & Task Queue](#article-06--event-loop--task-queue)

### Group 2 ‚Äî Measurement & Loading (Articles 07‚Äì12)
- [07 ‚Äî DevTools Performance Profiler](#article-07--devtools-performance-profiler)
- [08 ‚Äî Core Web Vitals](#article-08--core-web-vitals)
- [09 ‚Äî Lighthouse & RUM](#article-09--lighthouse--rum)
- [10 ‚Äî Resource Loading Strategies](#article-10--resource-loading-strategies)
- [11 ‚Äî Image Optimization](#article-11--image-optimization)
- [12 ‚Äî Font Optimization](#article-12--font-optimization)

### Group 3 ‚Äî Network & Protocols (Articles 13‚Äì18)
- [13 ‚Äî Compression: Brotli & Gzip](#article-13--compression-brotli--gzip)
- [14 ‚Äî Browser Networking & Caching](#article-14--browser-networking--caching)
- [15 ‚Äî HTTP/2 and HTTP/3](#article-15--http2-and-http3)
- [16 ‚Äî Resource Hints](#article-16--resource-hints)
- [17 ‚Äî Priority Hints & Fetch Priority](#article-17--priority-hints--fetch-priority)
- [18 ‚Äî Intersection Observer, Debounce & Throttle](#article-18--intersection-observer-debounce--throttle)

### Group 4 ‚Äî JS Engine & React (Articles 19‚Äì24)
- [19 ‚Äî V8 JIT Compilation](#article-19--v8-jit-compilation)
- [20 ‚Äî Memory Leaks & Garbage Collection](#article-20--memory-leaks--garbage-collection)
- [21 ‚Äî Web Workers & OffscreenCanvas](#article-21--web-workers--offscreencanvas)
- [22 ‚Äî SSR, CSR, SSG, ISR](#article-22--ssr-csr-ssg-isr)
- [23 ‚Äî React Performance Patterns](#article-23--react-performance-patterns)
- [24 ‚Äî Virtual Scrolling & Windowing](#article-24--virtual-scrolling--windowing)

### Group 5 ‚Äî Perceived Performance & Budgets (Articles 25‚Äì30)
- [25 ‚Äî Perceived Performance](#article-25--perceived-performance)
- [26 ‚Äî Bundle Optimization](#article-26--bundle-optimization)
- [27 ‚Äî Third-Party Scripts](#article-27--third-party-scripts)
- [28 ‚Äî Service Workers & Caching](#article-28--service-workers--caching)
- [29 ‚Äî Adaptive Loading](#article-29--adaptive-loading)
- [30 ‚Äî Performance Budgets](#article-30--performance-budgets)

### Group 6 ‚Äî Deep Dives & Projects
- [React Virtual DOM Reconciliation](#article-react-virtual-dom-reconciliation)
- [Web Performance Planner](#article-web-performance-planner)
- [Holdings Analyzer](#article-holdings-analyzer)
- [Claude Figma MCP Integration](#article-claude-figma-mcp-integration)
- [Figma LLM Problem](#article-figma-llm-problem)

### Group 7 ‚Äî Glossary (What-Is Articles)
- [what-is-call-stack](#article-what-is-call-stack)
- [what-is-dom](#article-what-is-dom)
- [what-is-cssom](#article-what-is-cssom)
- [what-is-main-thread](#article-what-is-main-thread)
- [what-is-microtask-queue](#article-what-is-microtask-queue)
- [what-is-preload-scanner](#article-what-is-preload-scanner)
- [what-is-requestanimationframe](#article-what-is-requestanimationframe)
- [what-is-fcp](#article-what-is-fcp)
- [what-is-ttfb](#article-what-is-ttfb)
- [what-is-cdn](#article-what-is-cdn)
- [what-is-jit-compilation](#article-what-is-jit-compilation)
- [what-is-cache-control](#article-what-is-cache-control)
- [what-is-stale-while-revalidate](#article-what-is-stale-while-revalidate)
- [what-is-dns](#article-what-is-dns)
- [what-is-debouncing](#article-what-is-debouncing)
- [what-is-throttling](#article-what-is-throttling)
- [what-is-virtual-dom](#article-what-is-virtual-dom)
- [what-is-react-fiber](#article-what-is-react-fiber)
- [what-is-reconciliation](#article-what-is-reconciliation)
- [what-is-hydration](#article-what-is-hydration)
- [what-is-react-suspense](#article-what-is-react-suspense)
- [what-is-streaming-ssr](#article-what-is-streaming-ssr)
- [what-are-compositing-layers](#article-what-are-compositing-layers)
- [what-are-long-tasks](#article-what-are-long-tasks)
- [what-is-compositor-thread](#article-what-is-compositor-thread)
- [what-is-css-specificity](#article-what-is-css-specificity)

### Group 8‚Äì13 ‚Äî JavaScript Series
- *(see sections below)*

### Summary: No-Animation Decisions
- *(appended after all groups)*

---

## Shared Components

These reusable SVG components are referenced across multiple article animations. Implement each once and import by name.

---

### QueueVisualizer

**Usage:** Event loop queue, microtask queue, macrotask queue, task scheduling demos.

**SVG structure:**
```
<svg viewBox="0 0 600 100">
  <g class="queue-row">
    <!-- Each item: <rect width="80" height="40" rx="4"> + <text> label -->
  </g>
  <text class="queue-label">Task Queue</text>
</svg>
```

**Enqueue animation:** New `<rect>` enters from the right: `transform: translateX(100px) ‚Üí translateX(0)`, 250ms, `cubic-bezier(0.22,1,0.36,1)` (spring-like). Fill `#F59E0B` (amber) while pending.

**Dequeue animation:** Leftmost `<rect>` collapses: `width: 80 ‚Üí 0`, opacity `1 ‚Üí 0`, 200ms `ease-in`. Then remaining items slide left via `translateX` gap-fill, 150ms `ease-out`.

**Active item (currently executing):** Fill changes to `#10B981` (green), scale `1 ‚Üí 1.05 ‚Üí 1` pulse over 300ms.

**Empty state:** Dashed border `stroke-dasharray: 4 4` on the queue container rect, label "Empty" centered in `#6B7280` gray.

**JS orchestration:** Items tracked in a JS array; DOM sync happens inside `requestAnimationFrame`. No GSAP required ‚Äî pure CSS transitions on individual rects.

**prefers-reduced-motion:** Skip translate/scale transitions; items appear/disappear instantly with opacity only (100ms).

---

### PipelineSteps

**Usage:** Browser rendering pipeline stages, CRP stages, Lighthouse scoring pipeline.

**SVG structure:**
```
<svg viewBox="0 0 700 80">
  <!-- N stages as <rect> + <text>, connected by <line> or <path> arrows -->
  <!-- Arrow: <polygon points="0,0 8,5 0,10"> filled with stage color -->
</svg>
```

**Stage states:**
- Pending: fill `#374151` (dark gray), text `#9CA3AF`
- Active: fill `#3B82F6` (blue), text `#fff`, drop-shadow `filter: drop-shadow(0 2px 8px rgba(59,130,246,0.6))`
- Complete: fill `#10B981` (green), text `#fff`
- Error/Blocked: fill `#EF4444` (red), text `#fff`

**Advance animation:** Active fill `#3B82F6` pulses (`opacity 0.7 ‚Üí 1`, 400ms, ease-in-out), then transitions to `#10B981` in 300ms. Next stage simultaneously transitions from `#374151` to `#3B82F6` in 300ms. Connecting arrow between the two animates `stroke-dashoffset: 100 ‚Üí 0` in 200ms.

**Auto-play:** Steps advance every 900ms by default. A "Replay" button resets all to pending (instant fill change) and restarts.

**prefers-reduced-motion:** No pulsing; fill changes are instant 50ms cross-fade only.

---

### StateTransitionDiagram

**Usage:** Promise state machine, Service Worker lifecycle, V8 JIT tiers, module loading states.

**SVG structure:**
```
<svg viewBox="0 0 500 300">
  <!-- Nodes: <circle r="30"> + <text> -->
  <!-- Edges: <path> with arrowhead <marker> -->
  <!-- Edge labels: <text> on path midpoint -->
</svg>
```

**Node states:**
- Default: `stroke: #4B5563`, `fill: #1F2937`, text `#D1D5DB`
- Active/current: `stroke: #3B82F6` (2px ‚Üí 3px), `fill: #1E3A5F`, glow `filter: drop-shadow(0 0 6px #3B82F6)`
- Terminal/accepted: `stroke: #10B981`, `fill: #064E3B`
- Error: `stroke: #EF4444`, `fill: #450A0A`

**Transition animation:** When transitioning node A ‚Üí B:
1. Edge path animates `stroke-dashoffset: full-length ‚Üí 0`, 350ms, `ease-in-out`, stroke `#F59E0B` (amber)
2. Arrowhead appears at destination: scale `0 ‚Üí 1`, 150ms
3. Node B activates: stroke-width `1 ‚Üí 3`, fill transitions, 200ms
4. Node A deactivates: returns to default, 300ms

**Hover:** Hovering a node highlights all outgoing edges in `#F59E0B`. Tooltip shows state name.

**prefers-reduced-motion:** Dash animation replaced by instant stroke color change. Node fill transitions 100ms only.

---

### TimelineBar

**Usage:** LCP/CLS/INP timeline, browser loading phases, async/defer comparison.

**SVG structure:**
```
<svg viewBox="0 0 800 120">
  <!-- X-axis: <line> with tick marks every 500ms -->
  <!-- Bars: <rect> positioned by start/end time -->
  <!-- Labels above/below bars: <text> -->
  <!-- Milestone markers: <line class="milestone"> + <text> rotated -->
</svg>
```

**Bar colors by phase:**
- HTML parse: `#6366F1` (indigo)
- CSS parse/CSSOM: `#8B5CF6` (violet)
- JS execution: `#F59E0B` (amber)
- Layout: `#EC4899` (pink)
- Paint: `#10B981` (green)
- Composite: `#3B82F6` (blue)
- Network/blocking: `#EF4444` (red)

**Reveal animation:** Bars reveal left-to-right using `clip-path: inset(0 100% 0 0) ‚Üí inset(0 0% 0 0)`, each bar staggered 120ms after previous, duration 400ms per bar, `ease-out`.

**Milestone lines drop in:** `translateY(-20px) ‚Üí translateY(0)`, opacity `0 ‚Üí 1`, 300ms after bars.

**Hover:** Hovering a bar shows a tooltip `<foreignObject>` with exact timing + phase name.

**prefers-reduced-motion:** All bars appear simultaneously at full opacity; no clip animation.

---

### TreeDiff

**Usage:** React reconciliation, Virtual DOM diffing, prototype chain comparison.

**SVG structure:**
```
<svg viewBox="0 0 700 350">
  <!-- Left tree (before): <g class="tree-before"> -->
  <!-- Right tree (after): <g class="tree-after"> -->
  <!-- Each node: <circle r="20"> + <text> -->
  <!-- Edges: <line> connecting parent to children -->
  <!-- Changed nodes: highlighted ring <circle r="24" class="diff-ring"> -->
</svg>
```

**Node states:**
- Unchanged: fill `#1F2937`, stroke `#4B5563`
- Added: fill `#064E3B`, stroke `#10B981`, enter with scale `0 ‚Üí 1`, 300ms, `ease-out`
- Removed: fill `#450A0A`, stroke `#EF4444`, exit with scale `1 ‚Üí 0`, 250ms, `ease-in`
- Updated: fill `#1E3A5F`, stroke `#3B82F6`, pulse ring `opacity 1 ‚Üí 0`, 600ms

**Diff highlight animation:** On "Show Diff" trigger, changed nodes receive a ring `<circle>` that expands from `r: 20 ‚Üí 28` and fades `opacity: 1 ‚Üí 0` over 800ms (`ease-out`). Runs once per node, staggered 100ms.

**prefers-reduced-motion:** Only color changes; no scale/ring animations.

---

### LayerStack

**Usage:** Compositing layers, browser thread model, CSS stacking contexts, `will-change` demo.

**SVG structure:**
```
<svg viewBox="0 0 500 320">
  <!-- Layers as <rect> with isometric-style offset: each layer shifted +15px X, -15px Y relative to prev -->
  <!-- Layer label: <text> on left edge -->
  <!-- Thread label: <text> above group -->
</svg>
```

**Layer colors:**
- DOM layer: `#6366F1`
- Style layer: `#8B5CF6`
- Layout layer: `#EC4899`
- Paint layer: `#F59E0B`
- Compositor layer: `#10B981`
- GPU layer: `#3B82F6`

**Build animation:** Layers drop in from above one at a time. Each `<rect>` starts `translateY(-30px), opacity: 0` ‚Üí `translateY(0), opacity: 1`, 350ms per layer, staggered 200ms, `ease-out`. Total build time: ~1.4s for 6 layers.

**Highlight specific layer:** On click/hover, target layer brightens (fill lightens 20%), others dim to `opacity: 0.4`. Adjacent connecting lines between layers animate `stroke-dashoffset: 40 ‚Üí 0`, 200ms.

**prefers-reduced-motion:** All layers appear at once; no translate animation.

---

### WaterfallChart

**Usage:** Network request waterfall, CRP waterfall, DevTools waterfall simulation.

**SVG structure:**
```
<svg viewBox="0 0 800 300">
  <!-- Row per resource: <text> filename, <rect> timing bar -->
  <!-- Bar subdivisions: DNS (teal), Connect (orange), TTFB (amber), Download (blue) -->
  <!-- Vertical "blocking" marker line: <line stroke-dasharray="4 4"> -->
</svg>
```

**Bar colors by phase:**
- DNS: `#14B8A6` (teal)
- TCP connect: `#F97316` (orange)
- TTFB: `#F59E0B` (amber)
- Download: `#3B82F6` (blue)
- Queued/blocked: `#6B7280` (gray)

**Reveal animation:** Rows appear top-to-bottom, staggered 80ms. Each bar segment expands from left: `scaleX(0) ‚Üí scaleX(1)`, `transform-origin: left center`, 300ms `ease-out`.

**Blocking line:** Red vertical line `stroke: #EF4444` drops in `translateY(-100%) ‚Üí translateY(0)`, 250ms, to mark render-blocking boundary.

**Hover:** Row highlights with background `fill: rgba(255,255,255,0.05)`, tooltip shows exact timing breakdown.

**prefers-reduced-motion:** All bars appear fully rendered; no scaleX animation.

---

### ScopeChain

**Usage:** Lexical scope, closures, variable hoisting, `this` binding context chains.

**SVG structure:**
```
<svg viewBox="0 0 500 400">
  <!-- Nested rects representing scopes: global (outermost), module, function, block -->
  <!-- Variable labels: <text> inside each rect -->
  <!-- Lookup arrows: <path> with arrowhead traversing outward through parent rects -->
</svg>
```

**Scope colors (from outer to inner):**
- Global scope: `#1F2937` border `#4B5563`
- Module scope: `#1E3A5F` border `#3B82F6`
- Function scope: `#064E3B` border `#10B981`
- Block scope: `#3B0764` border `#A855F7`

**Lookup animation:** When a variable is resolved, an arrow traces the lookup path outward through scopes. Arrow `stroke-dashoffset: path-length ‚Üí 0`, 400ms per scope level crossed, `ease-in-out`. If found: destination scope flashes `opacity 1 ‚Üí 0.6 ‚Üí 1`, 300ms. If not found (ReferenceError): red border flash on global scope.

**Variable highlight:** Target variable `<text>` gets a highlight rect `opacity 0 ‚Üí 0.3 ‚Üí 0` pulse, 500ms.

**prefers-reduced-motion:** Arrow appears instantly; only color changes.

---

### CallStackVisualizer

**Usage:** Call stack execution, recursion depth, stack overflow visualization.

**SVG structure:**
```
<svg viewBox="0 0 300 400">
  <!-- Stack frames as <rect width="240" height="44"> stacked bottom-to-top -->
  <!-- Function name + line number as <text> inside each frame -->
  <!-- Stack pointer arrow: <polygon> on right edge -->
</svg>
```

**Push animation:** New frame slides in from bottom: `translateY(50px), opacity: 0` ‚Üí `translateY(0), opacity: 1`, 250ms, `ease-out`. All existing frames shift up simultaneously.

**Pop animation:** Top frame shrinks: `opacity: 1 ‚Üí 0, scaleY: 1 ‚Üí 0`, `transform-origin: top center`, 200ms `ease-in`. Remaining frames shift down.

**Active frame:** Top frame fill `#1E3A5F`, border `#3B82F6`. Lower frames `#1F2937`, border `#374151`.

**Stack overflow state:** Frame fills change to gradient `#450A0A ‚Üí #7F1D1D`; shake animation `translateX: 0 ‚Üí -4 ‚Üí 4 ‚Üí -2 ‚Üí 2 ‚Üí 0`, 400ms total.

**prefers-reduced-motion:** Instant push/pop; no translateY or shake.

---

### MetricGauge

**Usage:** LCP/INP/CLS thresholds, Lighthouse score display, performance budget meters.

**SVG structure:**
```
<svg viewBox="0 0 300 180">
  <!-- Arc: <path> arc segment, sweep angle mapped to metric value -->
  <!-- Needle: <line> rotated from center -->
  <!-- Threshold zones: three arc segments (green/yellow/red) -->
  <!-- Value label: <text> centered below arc -->
</svg>
```

**Zone colors:**
- Good (0‚Äì33%): `#10B981` (green)
- Needs improvement (33‚Äì66%): `#F59E0B` (amber)
- Poor (66‚Äì100%): `#EF4444` (red)

**Fill animation:** Arc sweeps from start angle to value angle: `stroke-dashoffset: arc-length ‚Üí target-offset`, 800ms, `cubic-bezier(0.4,0,0.2,1)`. Needle rotates simultaneously from start to target angle, same duration.

**Value counter:** `<text>` counts up from 0 to final value, stepping every 16ms (rAF-driven), formatted with unit (ms, s, score).

**prefers-reduced-motion:** Instant fill; value appears at final number immediately.

---

### NetworkWaterfall

**Usage:** HTTP/1.1 vs HTTP/2 multiplexing comparison, connection reuse, QUIC stream visualization.

*Extends WaterfallChart with multiple connection lanes.*

**Additional structure:**
```
<!-- Connection lanes: each HTTP/1.1 connection = one horizontal lane -->
<!-- HTTP/2: all streams on single lane, color-coded by stream ID -->
```

**Stream colors (HTTP/2):** Streams 1‚Äì6 use `#6366F1, #EC4899, #F59E0B, #10B981, #3B82F6, #A855F7` respectively.

**HTTP/1.1 mode:** Requests queue behind each other on their connection lane; blocked requests show `fill: #6B7280` with stripe pattern `patternTransform`.

**HTTP/2 mode:** All streams appear on one lane interleaved; arrival animation staggered 20ms per stream.

---

## Group 1 ‚Äî Critical Rendering (Articles 01‚Äì06)

> Article 01 (`01-browser-rendering-pipeline.md`) ‚Äî **File not found ‚Äî skipping**. No corresponding `.md` file exists in `src/articles/`. Content may be inline in `articlesData.js`.

---

# Article: Critical Rendering Path

## Article File
`src/articles/02-critical-rendering-path.md`

## Article Summary
Explains the browser's Critical Rendering Path (CRP) ‚Äî the sequence of work from HTML fetch through paint that determines time to first pixel. Covers what makes CSS and JavaScript render-blocking, how `async`/`defer` break the block, the preload scanner's role, and an optimization checklist. The article builds from a conceptual pipeline to concrete code patterns.

## Animation Necessity
Animation helps because the CRP is inherently sequential ‚Äî showing the pipeline stages advancing, blocking events stalling progress, and the preload scanner running in parallel makes the causal structure immediately visible in ways a static diagram cannot.

## Animation Type
Step-by-step walkthrough

## Animation Scope
- Pipeline stages (HTML fetch ‚Üí Parse ‚Üí CSSOM ‚Üí JS execute ‚Üí Render Tree ‚Üí Layout ‚Üí Paint) animate sequentially
- Blocking events (CSS block, JS parser-block) shown as red "halt" states on the pipeline
- `async`/`defer` comparison shows two timelines side-by-side ‚Äî static labels, animated progress bars
- Preload scanner shown as a secondary animated path running in parallel
- Linear, auto-play with Replay button
- Replay: resets all stages to pending (0ms), restarts

## Controls
- **Replay button** ‚Äî resets pipeline and restarts animation; lets user re-examine the sequence
- **Mode toggle: "Blocking / Async / Defer"** ‚Äî switches which scenario animates; educational purpose: lets user directly compare all three loading strategies

## Step Plan
### Total Steps: 6

#### Step 1 ‚Äî HTML Fetch & Parse
- Related concept: HTML parsing, preload scanner discovery
- Goal: Show browser fetching and parsing HTML as the starting point
- Animation: `PipelineSteps` component activates "Fetch HTML" stage (fill `#374151` ‚Üí `#3B82F6`, 300ms). A small "preload scanner" icon (magnifying glass `<path>`) fades in below the HTML bar after 400ms, opacity `0 ‚Üí 1`, 200ms
- Motion details: Stage rect fill transition 300ms `ease-out`; preload scanner icon translateY `10px ‚Üí 0`, opacity `0 ‚Üí 1`, 200ms
- User interaction: None ‚Äî auto-advances after 900ms
- Educational objective: Establish that HTML parsing is the root of the CRP
- Timing: 0‚Äì900ms

#### Step 2 ‚Äî CSS Discovery & CSSOM Block
- Related concept: CSS is always render-blocking
- Goal: Show the browser halting at a `<link rel="stylesheet">` discovery
- Animation: "Fetch CSS" stage activates blue. After 400ms, the stage shifts to `#EF4444` red with a padlock icon (`<path>` 14√ó14px, opacity `0 ‚Üí 1`, 200ms). A "BLOCKED" label appears below in `#EF4444`, `font-size: 11px`
- Motion details: Fill change 200ms; padlock translateY `-5px ‚Üí 0`, 200ms; label opacity `0 ‚Üí 1`, 150ms
- User interaction: None
- Educational objective: Make render-blocking CSS viscerally clear
- Timing: 900‚Äì1800ms

#### Step 3 ‚Äî JS Parser Block (Blocking Mode) / Parallel Download (Async/Defer Mode)
- Related concept: `async`/`defer` vs default script loading
- Goal: Contrast blocking vs non-blocking JS
- Animation (Blocking): JS stage turns red, parser halts ‚Äî same padlock icon as Step 2; progress bar for HTML parse freezes (scaleX stops mid-animation, 0ms ease)
- Animation (Async): JS download bar runs in parallel (second horizontal bar, same row, `translateX` offset), HTML parse bar continues at full speed
- Animation (Defer): Same as Async but a small clock icon marks "executes after parse" ‚Äî icon appears at end of HTML parse bar
- Motion details: Parallel bars use `TimelineBar` component; blocking bar: `scaleX` pause via JS `animation-play-state: paused`
- User interaction: Mode toggle switches between Blocking/Async/Defer scenarios instantly (no animation reset, instant state swap)
- Educational objective: Make the concrete performance difference between loading strategies visible
- Timing: 1800‚Äì2700ms

#### Step 4 ‚Äî Render Tree Construction
- Related concept: DOM + CSSOM merge into render tree
- Goal: Show two trees merging
- Animation: Two simplified `TreeDiff`-style trees (DOM left, CSSOM right) slide inward `translateX(¬±60px) ‚Üí translateX(0)`, opacity `0 ‚Üí 1`, 400ms `ease-out`. A combined "Render Tree" box fades in at center, scale `0.8 ‚Üí 1`, 300ms
- Motion details: DOM tree in `#6366F1`, CSSOM tree in `#8B5CF6`, Render Tree in `#3B82F6`
- User interaction: None
- Educational objective: Clarify that both CSS and DOM must be ready before any rendering
- Timing: 2700‚Äì3600ms

#### Step 5 ‚Äî Layout & Paint
- Related concept: Layout geometry calculation, pixel painting
- Goal: Show the final pipeline stages completing
- Animation: `PipelineSteps` advances "Layout" (pink `#EC4899`) then "Paint" (green `#10B981`), 600ms per stage with connector arrow dash animation
- Motion details: Each stage 300ms fill + 200ms arrow stroke-dashoffset, sequential
- User interaction: None
- Educational objective: Complete the pipeline mental model
- Timing: 3600‚Äì4500ms

#### Step 6 ‚Äî Optimization Overlay
- Related concept: CRP checklist ‚Äî defer, inline CSS, preload
- Goal: Show the optimized CRP running faster
- Animation: A second timeline (labeled "Optimized") fades in below. Its bars are ~40% shorter. A diff indicator (downward arrow + "‚àí1.2s LCP") appears in `#10B981`, `font-size: 13px`
- Motion details: Timeline reveal left-to-right clip-path 600ms; diff label pops in scale `0.8 ‚Üí 1`, 200ms `ease-out`
- User interaction: None ‚Äî auto ends; Replay button reactivates
- Educational objective: Motivate the techniques with a measurable before/after
- Timing: 4500‚Äì5800ms

## Visual Behavior Rules
- Stage rects: `<rect width="90" height="36" rx="4">` at 110px horizontal spacing
- Connecting arrows: `<path>` with `marker-end` arrowhead, `stroke: #4B5563`, 16px arrow
- Active stage glow: `filter: drop-shadow(0 0 8px currentColor)`, applied to active rect only
- Completed stage checkmark: `<path d="M6 12 L10 16 L18 8">` stroke `#10B981`, `stroke-dashoffset: 20 ‚Üí 0`, 200ms
- Blocked stage shake: `translateX: 0 ‚Üí -3 ‚Üí 3 ‚Üí -2 ‚Üí 2 ‚Üí 0`, 300ms total, `ease-in-out`
- All text: `font-family: monospace`, `font-size: 11px`, fill `#D1D5DB`

## Technical Implementation
- SVG structure: Single `<svg viewBox="0 0 800 300">` containing timeline rows + pipeline
- Animation: JS-orchestrated via `requestAnimationFrame` + CSS transitions on individual elements; state managed as an array `stages[i].state = 'pending'|'active'|'complete'|'blocked'`
- Reuses: `PipelineSteps`, `TimelineBar`
- Performance: All elements pre-rendered in DOM; only class/attribute changes trigger transitions. No layout-triggering properties animated.

## Accessibility
- prefers-reduced-motion: Skip all translate/scale; use instant opacity changes (50ms cross-fade); auto-play disabled ‚Äî show final state with Replay button only
- Keyboard: Tab to focus the animation container; Enter to replay; arrow keys to step forward/back through steps
- Contrast: All text on dark backgrounds meets WCAG AA (`#D1D5DB` on `#111827`)

## Mobile
- Reduce SVG viewBox to `0 0 560 220`; pipeline stages shrink to `width: 70px`; timeline bar labels move to tooltip on tap; step text shown in a separate `<p>` below SVG instead of inline

## Complexity: Advanced
## Priority: Critical

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Reflow, Repaint & Layout Thrashing

## Article File
`src/articles/03-reflow-repaint-layout-thrashing.md`

## Article Summary
Explains the performance cost difference between reflow (geometry recalculation), repaint (visual redraw), and compositor-only operations. Demonstrates layout thrashing ‚Äî the read-write interleaving pattern that forces repeated synchronous layouts in a loop ‚Äî with a code comparison of the bad pattern vs the batched fix. Also covers long tasks, the 50ms threshold, and practical fixes including `requestAnimationFrame` and CSS transform preference.

## Animation Necessity
Layout thrashing is uniquely visual ‚Äî the alternating "write then read" loop that forces the browser to recalculate layout is hard to understand textually. An animation showing the read-write-read-write cycle vs the batched approach makes the performance difference visceral.

## Animation Type
Interactive simulation

## Animation Scope
- Two simulation panels side-by-side: "Thrashing" and "Batched"
- Each panel shows a mini loop iterating over DOM items
- Thrashing panel: on each iteration, a "WRITE" flash followed immediately by a "READ" flash triggers a layout recalc indicator
- Batched panel: all reads first, then all writes ‚Äî single layout recalc at end
- User triggers the simulation ("Run Loop")
- Replay supported

## Controls
- **Run button** ‚Äî starts both simulations simultaneously; user sees the time difference
- **Speed toggle (1√ó/0.5√ó)** ‚Äî slow-motion mode for examining individual loop iterations
- **Item count selector (5/10/20)** ‚Äî changes the loop size to exaggerate the difference

## Step Plan
### Total Steps: 5

#### Step 1 ‚Äî Setup: Show DOM Items
- Related concept: DOM node collection
- Goal: Show a row of items (cards) that the loop will process
- Animation: 10 `<rect width="50" height="50" rx="4">` items slide in from below staggered 40ms each, `translateY(20px) ‚Üí translateY(0)`, opacity `0 ‚Üí 1`, 200ms each
- Motion details: Items fill `#374151`, stroke `#4B5563`
- User interaction: User presses "Run"
- Educational objective: Make concrete what "items" means in the loop
- Timing: 0‚Äì600ms (auto on mount)

#### Step 2 ‚Äî Thrashing Loop (Left Panel)
- Related concept: Read-after-write forces synchronous layout
- Goal: Visualize the bad loop forcing a layout on every iteration
- Animation: For each item (left to right): item highlights amber `#F59E0B` (WRITE), 150ms; then a "‚ö° Layout!" burst `<text>` pops up above (`translateY: 0 ‚Üí -20px`, opacity `1 ‚Üí 0`, 300ms) in `#EF4444`; then item dims back to gray. A counter ticks up: "Layout recalcs: 1, 2, 3‚Ä¶" in `#EF4444`
- Motion details: WRITE fill 150ms `ease-out`; burst text scale `0.8 ‚Üí 1.2 ‚Üí 1`, 300ms; counter increments in DOM text node
- User interaction: Speed toggle affects per-iteration delay (100ms or 200ms)
- Educational objective: Make each forced synchronous layout visible and countable
- Timing: Per iteration: 400ms; 10 items = 4s total (at 1√ó)

#### Step 3 ‚Äî Batched Loop (Right Panel, simultaneous)
- Related concept: Batch reads then writes ‚Äî one layout total
- Goal: Show all reads completing without triggering layouts, then all writes at once
- Animation: All 10 items highlight blue `#3B82F6` simultaneously (READ phase), 300ms. Then all shift to green `#10B981` simultaneously (WRITE phase), 300ms. Single "‚ö° Layout!" burst appears once, in `#10B981` (benign). Counter shows "Layout recalcs: 1"
- Motion details: All items transition simultaneously; single burst at end only
- User interaction: None
- Educational objective: Contrast the single-layout outcome with thrashing
- Timing: 600ms total (reads 300ms + writes 300ms)

#### Step 4 ‚Äî Timing Comparison
- Related concept: Long tasks vs short tasks
- Goal: Show elapsed time for both approaches
- Animation: Two horizontal bars (like `TimelineBar`) reveal their widths proportionally ‚Äî thrashing bar ~8√ó longer than batched bar. Both bars reveal left-to-right via `clip-path`, 400ms. Time labels animate as counters
- Motion details: Thrashing bar `#EF4444`; batched bar `#10B981`; counters count up from 0
- User interaction: None
- Educational objective: Quantify the performance cost
- Timing: After both loops complete

#### Step 5 ‚Äî Compositor-Only Zone
- Related concept: `transform` and `opacity` bypass layout
- Goal: Show a third row: "Use transform instead" with no layout recalc
- Animation: A third panel slides in from below, showing items moving via `translateX` ‚Äî no layout burst icons appear at all. A "0 layout recalcs" badge in `#10B981` pulses once
- Motion details: Panel `translateY(30px) ‚Üí translateY(0)`, opacity `0 ‚Üí 1`, 300ms
- User interaction: None
- Educational objective: Complete the mental model: compositor-only properties are free
- Timing: 300ms after Step 4

## Visual Behavior Rules
- Item rects: `<rect width="50" height="50" rx="6">` with 8px gap between items
- Layout burst text: `font-size: 13px`, `font-weight: bold`, fill `#EF4444`, absolute position above each rect via `dy="-16"`
- Counter text: `font-size: 16px`, `font-family: monospace`, fill `#EF4444` (thrashing) / `#10B981` (batched)
- Panel labels: `font-size: 12px`, `font-weight: bold`, fill `#9CA3AF`, centered above each panel
- Run button: styled as SVG `<rect>` + `<text>` or external HTML button element (prefer HTML for a11y)
- Background: `#0F172A` (near-black) for the SVG container

## Technical Implementation
- SVG structure: Two `<svg viewBox="0 0 400 200">` side-by-side in a flex container, or single `<svg viewBox="0 0 820 200">` with two groups
- Animation: JS-orchestrated with `async/await` + `setTimeout` chains simulating the loop iterations; `requestAnimationFrame` for counter increments
- Reuses: Nothing ‚Äî custom implementation; reusable "burst" particle as a standalone function
- Performance: All rects pre-rendered; only fill and text changes. No actual DOM measurement done ‚Äî purely cosmetic simulation.

## Accessibility
- prefers-reduced-motion: Skip item translate-in; disable burst pop animations; counter jumps to final value immediately; auto-play disabled
- Keyboard: Tab to "Run" button; Enter/Space to trigger; Speed toggle keyboard accessible
- Contrast: `#EF4444` on `#0F172A` passes WCAG AA for large text; counter labels are large enough

## Mobile
- Stack panels vertically; reduce item count default to 5; viewBox `0 0 380 380` split into two 380√ó160 sections

## Complexity: Advanced
## Priority: Critical

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: CSS & JS Animations

## Article File
`src/articles/04-css-js-animations.md`

## Article Summary
Compares the rendering cost of different animation approaches. CSS `transform`/`opacity` run on the compositor thread and bypass main-thread layout entirely. CSS transitions are simplest, `@keyframes` gives multi-step control, and JS rAF is for physics/choreography. Covers `requestAnimationFrame` as the correct JS animation mechanism, and `will-change` for pre-promoting layers. Ends with DevTools jank detection and the Layers panel.

## Animation Necessity
The core thesis ‚Äî that compositor-only properties are "free" while geometry properties are expensive ‚Äî is much more compelling when shown as two simultaneous animations where one stays smooth under main-thread load and the other stutters.

## Animation Type
Interactive simulation

## Animation Scope
- Left panel: element animating via `left` (layout-triggering) ‚Äî shows layout recalc bursts per frame
- Right panel: same movement via `transform: translateX` ‚Äî no recalc icons, smooth 60fps indicator
- A simulated "main thread busy" toggle that makes the left panel stutter while right stays smooth
- User-driven: toggle "Stress main thread" checkbox

## Controls
- **Stress main thread toggle** ‚Äî simulates a long task blocking the main thread; left (layout) animation stutters, right (transform) continues smoothly. Educational purpose: shows compositor independence of transform/opacity
- **Replay** ‚Äî resets both animations to start

## Step Plan
No discrete step system required ‚Äî this is a live side-by-side comparison animation, not a walkthrough.

## Visual Behavior Rules
- Left panel label: "‚ùå left / top" in `#EF4444`
- Right panel label: "‚úÖ transform" in `#10B981`
- Animated element: `<rect width="40" height="40" rx="4">`, fill `#3B82F6`
- Animation: both rects oscillate `translateX: 0 ‚Üí 200px ‚Üí 0`, 1.5s infinite, `ease-in-out` (using CSS animation for the right panel; JS rAF for left)
- Frame drop indicators on left panel: when "stress" is on, every 4th frame the rect freezes for 200ms (simulated jank), a "‚ö° JANK" label flashes `opacity 1 ‚Üí 0`, 400ms, `#EF4444`
- FPS counter below each panel: counts approximate frame rate using timestamp deltas, `font-family: monospace`, `font-size: 14px`
- Compositor thread indicator (right panel): a small separate `<rect>` labeled "Compositor Thread" pulses green regardless of stress state
- `will-change` demo toggle: adds/removes a purple ring around the right panel's element to show "promoted layer" state

## Technical Implementation
- SVG structure: Two `<svg viewBox="0 0 280 160">` in flex row
- Animation: Left panel uses JS `requestAnimationFrame` with intentional frame-skip simulation; right panel uses CSS `@keyframes` on `transform` (compositor-handled)
- Reuses: None
- Performance: Right panel CSS animation is truly compositor-only; left panel deliberately uses JS to simulate layout pressure

## Accessibility
- prefers-reduced-motion: Both animations paused; show still comparison with colored labels only
- Keyboard: Tab to checkboxes/buttons; space to toggle
- Contrast: All labels WCAG AA

## Mobile
- Stack panels vertically; reduce oscillation distance to 120px; FPS counter simplified to "Smooth" / "Janky" text indicator

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: CSS Containment

## Article File
`src/articles/05-css-containment.md`

## Article Summary
Explains the `contain` CSS property and its four values (`layout`, `style`, `paint`, `size`) as a way to isolate subtrees from the rest of the document, allowing the browser to skip expensive recalculation work. Covers `content-visibility: auto` as the highest-impact single-property optimization for long content feeds, and the required `contain-intrinsic-size` to prevent scroll-bar jumping.

## Animation Necessity
The concept of "the browser skips work it would otherwise do" is invisible by default. An animation showing the document-wide reflow chain vs the contained reflow chain makes the isolation benefit concrete.

## Animation Type
Step-by-step walkthrough

## Animation Scope
- Two-panel comparison: "Without contain" vs "With contain: layout"
- Document tree shows a change propagating through all nodes vs stopping at the contained boundary
- `content-visibility: auto` demo: shows off-screen cards being skipped (grayed out) vs being computed
- Linear, user-stepped (Next button) or auto-play

## Controls
- **Next / Back buttons** ‚Äî step through the three-part comparison
- **Toggle: without / with containment** ‚Äî instantly shows the difference in propagation scope

## Step Plan
### Total Steps: 3

#### Step 1 ‚Äî Without Containment: Reflow Propagates Everywhere
- Related concept: Default browser behavior ‚Äî layout change invalidates the whole document
- Goal: Show a style change in a nested widget causing a whole-document reflow
- Animation: A node deep in a tree highlights amber `#F59E0B`. Reflow "ripple" expands outward: concentric `<circle>` rings `r: 10 ‚Üí 80`, opacity `1 ‚Üí 0`, 600ms `ease-out`, stroke `#EF4444`. All sibling and ancestor nodes briefly flash pink `opacity: 0.3 ‚Üí 0`, 300ms
- Motion details: Ripple circles `stroke-width: 2`, stroke `#EF4444`; flash on nodes `fill: #EF4444, opacity: 0.15`; staggered 60ms per tree level
- User interaction: Click "Without containment" to trigger
- Educational objective: Make the propagation cost of a layout change visible
- Timing: 1200ms total

#### Step 2 ‚Äî With contain: layout ‚Äî Reflow Stops at Boundary
- Related concept: `contain: layout` creates an isolated layout context
- Goal: Show the reflow stopping at the contained element's boundary
- Animation: Same change occurs. Ripple expands inside the contained subtree. At the boundary rect, the ripple hits a dashed border `stroke: #10B981, stroke-dasharray: 6 3` and disappears (`opacity: 1 ‚Üí 0`, 200ms). Outside nodes do not flash. A "Contained!" badge `#10B981` pops in on the boundary rect, scale `0 ‚Üí 1`, 250ms
- Motion details: Boundary rect gets a green glow `filter: drop-shadow(0 0 8px #10B981)`, 300ms
- User interaction: Click "With contain"
- Educational objective: Show that containment is a hard boundary for layout propagation
- Timing: 800ms total

#### Step 3 ‚Äî content-visibility: auto Demo
- Related concept: Off-screen rendering skip
- Goal: Show a long list where off-screen cards are gray/skipped vs visible cards rendered
- Animation: Scrollable SVG viewport showing 8 cards. Cards 1‚Äì2 are in-viewport: full color, rendered. Cards 3‚Äì8 below: gray `fill: #374151`, dashed outline, "Skipped" label. A "viewport line" moves down on scroll simulation: cards above line ‚Üí full color, below ‚Üí gray. A paint bucket icon `<path>` flies to each newly-visible card and fills it in, 250ms each
- Motion details: Card color transition `fill: #374151 ‚Üí #1F2937` + full content opacity `0 ‚Üí 1`, 250ms; paint icon translateY `-20px ‚Üí 0`, opacity `0 ‚Üí 1 ‚Üí 0`, 400ms
- User interaction: "Simulate scroll" button advances the viewport line one card at a time
- Educational objective: Make `content-visibility: auto` tangible as a skip-rendering optimization
- Timing: 400ms per card reveal

## Visual Behavior Rules
- Tree nodes: `<circle r="14">` connected by `<line>` edges, fill `#1F2937` stroke `#4B5563`
- Contained element boundary: `<rect>` with dashed green border `stroke: #10B981, stroke-dasharray: 6 3, stroke-width: 2`
- Reflow ripple: `<circle>` at center of changed node, `r: 0 ‚Üí 60`, `stroke: #EF4444`, `fill: none`, `opacity: 1 ‚Üí 0`, 500ms
- Cards: `<rect width="160" height="60" rx="6">`, skipped cards `fill: #1F2937, stroke: #374151, stroke-dasharray: 4 4`
- Viewport indicator: `<line stroke="#3B82F6" stroke-width="1.5">` labeled "Viewport bottom"

## Technical Implementation
- SVG structure: `<svg viewBox="0 0 600 350">` with two sub-groups for the two-panel comparison
- Animation: JS-orchestrated; ripple circles created dynamically then removed after animation. Card state tracked in array.
- Reuses: None directly, but tree node styling shares colors with `TreeDiff`
- Performance: Ripple circles removed from DOM after fade-out to prevent accumulation

## Accessibility
- prefers-reduced-motion: Ripple disabled; only fill color changes; "Skipped"/"Rendered" labels shown statically
- Keyboard: Tab to Next/Back buttons; Space to step
- Contrast: All labels WCAG AA

## Mobile
- ViewBox `0 0 400 300`; two-panel comparison stacked vertically; card list shows 4 items only

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Event Loop & Task Queue

## Article File
`src/articles/06-event-loop-task-queue.md`

## Article Summary
Explains JavaScript's single-threaded execution model via the event loop: call stack execution, Web APIs dispatching async work, task queue (macrotasks) vs microtask queue, and the critical rule that microtasks drain completely before each render tick. Covers long tasks (>50ms) as the root cause of INP issues and demonstrates yielding patterns. `requestIdleCallback` for non-urgent background work is also covered.

## Animation Necessity
The event loop is one of the most-misunderstood concepts in JavaScript. A live animation showing tasks arriving, microtasks draining before macrotasks, and the render step being blocked by long tasks makes the mental model click instantly.

## Animation Type
Interactive simulation

## Animation Scope
- Call stack (left): stack frames push/pop
- Microtask queue (center-top): drained completely after each macrotask
- Task/Macrotask queue (center-bottom): one task dequeued per cycle
- Web APIs zone (right): timers and fetch complete and move callbacks to queues
- Render indicator (bottom): green flash when render happens; blocked/red when long task running
- User can inject macrotasks, microtasks, or a "long task" via buttons

## Controls
- **Add setTimeout** ‚Äî injects a macrotask callback into the task queue
- **Add Promise.resolve()** ‚Äî injects a microtask into the microtask queue
- **Add Long Task** ‚Äî adds a task that takes >50ms; render indicator goes red
- **Step mode** ‚Äî advance one event loop tick at a time; useful for educational exploration
- **Run mode** ‚Äî auto-run the loop at visible speed (one tick per 800ms)

## Step Plan
No discrete step system required ‚Äî this is a live interactive simulation with configurable queue contents.

## Visual Behavior Rules
- Call stack: Uses `CallStackVisualizer` component, positioned left. Frames: `<rect width="180" height="40" rx="4">`. Active frame fill `#1E3A5F`, others `#1F2937`
- Microtask queue: Uses `QueueVisualizer` component, positioned top-center. Items fill `#8B5CF6` (violet) = Promise color
- Macrotask queue: Uses `QueueVisualizer`, bottom-center. Items fill `#F59E0B` (amber) = setTimeout color
- Web APIs zone: Right panel `<rect>` with label. Active timers shown as countdown arcs using `stroke-dashoffset` depleting over timer duration
- Event loop arrow: A circular `<path>` arrow `r=30` that rotates clockwise, `stroke: #3B82F6`, `stroke-width: 2`, continuously rotating at 1 RPM when running; pauses during long tasks
- Render indicator: `<rect width="120" height="30" rx="4">` at bottom. Default fill `#10B981` labeled "Render". During long task: fill `#EF4444`, label "BLOCKED". During microtask drain: fill `#F59E0B`, label "Draining microtasks"
- Queue-to-stack movement: When a task is picked, a copy of the task rect slides from queue position to stack position via `translate`, 350ms `ease-in-out`, then disappears as the stack frame appears
- Microtask drain rule: After each macrotask completes, microtask items automatically dequeue and execute before the render step ‚Äî this is shown by the microtask queue visually draining before the render indicator fires
- Long task item: `<rect fill="#EF4444">`, labeled "Long Task (200ms)". Event loop arrow pauses during its execution; render indicator turns red with a blocked timer bar depleting

## Technical Implementation
- SVG structure: `<svg viewBox="0 0 820 460">` with five zones: call stack, microtask queue, macrotask queue, Web APIs, render indicator
- Animation: JS-orchestrated event loop simulation. Each "tick" is controlled by a state machine: `IDLE ‚Üí RUN_TASK ‚Üí DRAIN_MICROTASKS ‚Üí RENDER ‚Üí IDLE`. State transitions trigger DOM updates.
- Reuses: `CallStackVisualizer`, `QueueVisualizer`
- Performance: Animation is simulation-speed (800ms/tick), not real-time. No performance concerns.

## Accessibility
- prefers-reduced-motion: Disable queue slide animations; items teleport; loop arrow does not rotate; state changes via color only
- Keyboard: All buttons keyboard accessible; step mode fully keyboard-navigable with Enter
- Contrast: WCAG AA throughout; queue item labels use white text on colored backgrounds

## Mobile
- Reduce to two visible zones (call stack + one queue); remove Web APIs zone; step mode only (no auto-run); viewBox `0 0 420 400`

## Complexity: Highly Interactive
## Priority: Critical

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Group 2 ‚Äî Measurement & Loading (Articles 07‚Äì12)

---

# Article: DevTools Performance Profiler

## Article File
`src/articles/07-devtools-performance-profiler.md`

## Article Summary
A guide to using Chrome DevTools' Performance panel for tracing bottlenecks. Covers the flame chart structure (x=time, y=call stack depth), track types (Network, Main, Compositor, GPU, Timings), long task identification (red triangles, >50ms), Bottom-Up and Call Tree tabs for finding hot functions, memory timeline for leak detection, and the Rendering tab's live overlays. The article specifically shows layout thrashing in the trace as alternating purple-yellow bars.

## Animation Necessity
Animation helps because a static screenshot of a flame chart teaches very little ‚Äî readers need to understand how to read one, what patterns mean, and how to navigate from symptom (red triangle) to cause (JS function). An interactive mini-trace they can explore makes this transfer of knowledge much faster.

## Animation Type
Interactive simulation

## Animation Scope
- A simplified mock flame chart with labeled tracks (Network, Main, Timings)
- Clickable long-task blocks reveal a zoomed-in view of the call stack inside
- The alternating purple-yellow layout thrashing pattern shown as a demo trace
- User can click different tracks/blocks to see explanations
- Hover interactions with tooltips

## Controls
- **Track selector tabs** ‚Äî switch between "Network", "Main", "Timings" to focus explanations
- **Click a long task** ‚Äî reveals the bottom-up breakdown below the chart
- **Toggle "Layout Thrashing" overlay** ‚Äî highlights the alternating purple-yellow pattern

## Step Plan
No discrete step system required ‚Äî this is an exploratory interactive simulation.

## Visual Behavior Rules
- Flame chart background: `#0F172A`
- Track row headers: `<rect width="80" height="30">`, fill `#1F2937`, text `#9CA3AF`, `font-size: 11px`
- Task blocks in Main track:
  - JS (yellow): `#F59E0B`, min height 16px
  - Style/Layout (purple): `#8B5CF6`
  - Paint (green): `#10B981`
  - Long task marker: red triangle `<polygon points="0,0 12,0 12,12">` at top-right of block, fill `#EF4444`
- Layout thrashing pattern: alternating `<rect>` blocks purple `#8B5CF6` and yellow `#F59E0B`, each 30‚Äì40px wide, packed tightly. On "Show Thrashing" toggle, they pulse: `opacity 0.6 ‚Üí 1 ‚Üí 0.6`, 600ms alternating
- Bottom-up table: appears below SVG as HTML table (not SVG) showing function name, self time, total time ‚Äî more readable as HTML. Slides in `translateY(20px) ‚Üí translateY(0)`, opacity `0 ‚Üí 1`, 300ms
- Hover tooltip: HTML `<div>` absolutely positioned over hovered block; `background: #1F2937`, `border: 1px solid #374151`, `font-family: monospace`, shows block type + duration
- Time ruler: `<line>` marks at every 50ms, `font-size: 10px` labels in `#6B7280`
- Timings track: LCP, FCP markers as colored vertical lines with labels. LCP: `#F59E0B`, FCP: `#6366F1`

## Technical Implementation
- SVG structure: `<svg viewBox="0 0 800 280">` for the chart; HTML elements overlaid for tooltips and table
- Animation: CSS transitions on hover; JS for click-to-expand and overlay toggle
- Reuses: Color scheme shared with `TimelineBar`
- Performance: Static SVG elements; only class changes on interaction

## Accessibility
- prefers-reduced-motion: Disable thrashing pulse; tooltips appear on focus not hover; table appears statically
- Keyboard: Tab through track blocks; Enter to select/expand; Escape to collapse
- Contrast: WCAG AA for all text

## Mobile
- Reduce viewBox to `0 0 420 200`; show only Main track; disable tooltip on hover (show on tap instead); table scrollable horizontally

## Complexity: Advanced
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Core Web Vitals

## Article File
`src/articles/08-core-web-vitals.md`

## Article Summary
Explains Google's three Core Web Vitals: LCP (largest content renders ‚â§2.5s), CLS (layout stability score ‚â§0.1), and INP (interaction latency ‚â§200ms). Each metric has thresholds, common causes, and fixes with code examples. The article also covers field vs lab data tradeoffs and prioritization order (LCP ‚Üí CLS ‚Üí INP).

## Animation Necessity
Each metric is abstract until visualized. LCP becomes clear when you see a timeline showing when the hero image appears. CLS becomes clear when you see elements jumping. INP becomes clear when you see the interaction-to-paint gap.

## Animation Type
Hybrid interactive system

## Animation Scope
- Three metric panels, each with its own visualization
- LCP panel: timeline bar showing load phases with LCP marker
- CLS panel: page mock-up showing an image loading and pushing content down (shift animation)
- INP panel: click interaction timeline showing the gap between click and paint
- User can switch between "Good", "Needs Improvement", "Poor" states for each metric
- Auto-play demo on each panel

## Controls
- **Metric tabs (LCP / CLS / INP)** ‚Äî switch focus between the three panels
- **Rating toggle (Good / Needs Improvement / Poor)** ‚Äî morphs the animation to show that threshold scenario, updating the `MetricGauge` needle position
- **Replay** ‚Äî re-runs the selected metric's demo

## Step Plan
No discrete step system required ‚Äî panels are independently interactive.

## Visual Behavior Rules
- `MetricGauge` component used for each metric's score display
- LCP panel: `TimelineBar` with a vertical yellow dashed "LCP" marker line dropping in. At "Good" LCP: line appears before 2.5s mark. At "Poor": line appears after 4s mark. Hero image placeholder `<rect>` in timeline fills amber when LCP element renders
- CLS panel: Two `<rect>` content blocks. On "shift event": lower block is displaced downward `translateY: 0 ‚Üí 40px`, 300ms `ease-out`. A red region overlay `<rect fill="rgba(239,68,68,0.2)">` flashes over the shifted area for 800ms. "CLS: 0.15" counter appears in `#EF4444`
- INP panel: A click icon `<circle>` appears at a point in the timeline. A dashed horizontal line extends rightward to where "Paint" occurs. The gap is filled with `#F59E0B` at "Needs Improvement" width or `#EF4444` at "Poor" width. Labels: "Input delay", "Processing time", "Presentation delay" in three segments
- All three panels share a consistent `#0F172A` background with the threshold zones labeled "Good (green) / Needs improvement (amber) / Poor (red)" as horizontal bands

## Technical Implementation
- SVG structure: Three `<svg viewBox="0 0 600 200">` panels in a tabbed layout
- Animation: CSS transitions for gauge needle; JS for CLS shift sequence; Timeline bar uses `clip-path` reveal
- Reuses: `MetricGauge`, `TimelineBar`
- Performance: CLS shift uses `transform: translateY` only ‚Äî no actual layout triggered

## Accessibility
- prefers-reduced-motion: CLS shift instant; gauge needle at final position; LCP marker appears without drop animation
- Keyboard: Tab between metric tabs; arrow keys between Good/NI/Poor; Enter to trigger demo
- Contrast: WCAG AA; red/green supplemented with labels not just color

## Mobile
- Stack metric panels vertically; gauge smaller (viewBox `0 0 200 120`); CLS shift distance reduced to 20px

## Complexity: Advanced
## Priority: Critical

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Lighthouse & RUM

## Article File
`src/articles/09-lighthouse-and-rum.md`

## Article Summary
Explains how Lighthouse works (controlled Chrome + CPU/network throttle ‚Üí trace ‚Üí log-normal scoring ‚Üí weighted average), its limitations (variability, no INP, single cold load), and how Real User Monitoring (RUM) complements it with actual field data. Covers CrUX, the web-vitals library, and the correct workflow: Lighthouse for dev iteration, CrUX/PageSpeed for validation, RUM for monitoring.

## Animation Necessity
The log-normal scoring curve and the field vs lab data gap benefit from visualization. Understanding that a score of 50 ‚Üí 70 is a bigger absolute metric improvement than 90 ‚Üí 95 is counterintuitive and best shown as a curve.

## Animation Type
Passive looping animation

## Animation Scope
- Left: Lighthouse scoring pipeline diagram (metric ‚Üí score curve ‚Üí weighted sum)
- Right: RUM data distribution ‚Äî a histogram of real user LCP values with percentile markers
- The log-normal curve animates on load; the histogram populates with simulated data points
- Auto-play, loops after 5s pause

## Controls
- **"Switch metric" dropdown** ‚Äî changes which metric's scoring curve is shown (LCP / CLS / INP)
- **"Show field vs lab" toggle** ‚Äî overlays a single Lighthouse point on the RUM distribution, showing where lab data sits vs the full user distribution

## Step Plan
No discrete step system required.

## Visual Behavior Rules
- Scoring curve: `<path>` for the log-normal distribution curve, `stroke: #3B82F6`, `stroke-width: 2`, `fill: none`. Drawn via `stroke-dashoffset: curve-length ‚Üí 0`, 1200ms, `ease-out`. Good zone fill: `rgba(16,185,129,0.1)` under curve before 90 score. Poor zone: `rgba(239,68,68,0.1)` past 60 score area.
- Metric value axis (x): 0 to "poor threshold √ó 2"; score axis (y): 0 to 100
- A moving dot traces the curve at the "current metric value", `<circle r="5" fill="#F59E0B">`, animated `cx` from 0 to sample value position over 1000ms
- RUM histogram: 20 vertical bars `<rect>` representing LCP value buckets. Bars grow from height 0 upward, staggered 40ms, `ease-out`, 300ms each. Bar color: green (`#10B981`) for buckets ‚â§2.5s, amber for 2.5‚Äì4s, red for >4s
- 75th percentile line: `<line stroke="#F59E0B" stroke-dasharray="4 4">` vertical, labeled "p75 = 3.1s"
- Lighthouse point: `<circle r="8" fill="#6366F1">` overlaid on histogram at the lab-measured LCP value; labeled "Lab: 2.3s"

## Technical Implementation
- SVG structure: `<svg viewBox="0 0 700 300">` split into two panels
- Animation: SVG path `stroke-dashoffset` for curve; JS for bar height transitions; rAF for dot movement
- Reuses: `MetricGauge` colors/zone scheme
- Performance: Histogram bars are static after initial animation

## Accessibility
- prefers-reduced-motion: Curve appears instantly; histogram bars at final heights; no dot movement
- Keyboard: Dropdown/toggle keyboard accessible
- Contrast: WCAG AA

## Mobile
- Hide curve panel; show histogram only; simplify to 3 zone-colored bars (% good, NI, poor)

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Resource Loading Strategies

## Article File
`src/articles/10-resource-loading-strategies.md`

## Article Summary
Covers practical patterns for loading fonts (FOIT/FOUT, font-display), CSS (critical inlined vs async non-critical), JavaScript (async/defer, module/nomodule, facade pattern for third-party), and images (native lazy loading). Each pattern has a code example and the article builds toward a combined "well-optimized loading strategy" checklist.

## Animation Necessity
The loading timeline is the right mental model here ‚Äî showing when each resource type is fetched, when it blocks, and what happens with each pattern. A side-by-side "bad vs good" timeline makes the impact of each strategy immediately visible.

## Animation Type
Step-by-step walkthrough

## Animation Scope
- A `TimelineBar` showing four rows: Font, CSS, JS, Images
- Each row has a "default" bar and an "optimized" bar side by side
- Steps walk through each resource type and toggle the optimization on
- Replay clears optimizations and restores defaults

## Controls
- **Next / Back** ‚Äî step through each resource type
- **Toggle individual optimizations** ‚Äî e.g., "Enable font-display: swap", "Enable defer on JS", "Enable lazy images" ‚Äî each toggled independently

## Step Plan
### Total Steps: 4

#### Step 1 ‚Äî Default Font Loading (FOIT)
- Related concept: FOIT ‚Äî invisible text while font loads
- Goal: Show text invisible during font download
- Animation: A text placeholder `<rect>` shows blank (fill `#374151`, dashed border) for 1500ms, then text fades in. A blocking indicator (gray bar on timeline) spans the wait period. Label: "FOIT: text invisible for 1.5s"
- Motion details: Text opacity `0 ‚Üí 1` after 1500ms, 200ms `ease-out`; timeline bar fill `#6B7280`
- User interaction: "Enable font-display: swap" button
- Educational objective: Make FOIT visceral ‚Äî silence teaches nothing, invisible text teaches everything
- Timing: 0‚Äì1800ms

#### Step 2 ‚Äî font-display: swap Applied
- Related concept: FOUT ‚Äî fallback text shown immediately, swaps when font loads
- Goal: Show fallback text rendering immediately, then font swap
- Animation: Text appears immediately in "fallback font" (wider, slightly different `letter-spacing`). At 1500ms, text transitions smoothly: `letter-spacing` shifts, `font-family` effectively changes via class swap. A small "swap!" label appears `opacity 0 ‚Üí 1 ‚Üí 0`, 600ms
- Motion details: Letter-spacing `2px ‚Üí 0px` over 300ms to simulate font metrics change; `#10B981` timeline bar replaces gray
- User interaction: None after toggle applied
- Educational objective: Show font-display:swap eliminates invisible text at the cost of a minor swap jank
- Timing: Auto after Step 1

#### Step 3 ‚Äî CSS: Render-Blocking vs Async
- Related concept: Inline critical CSS, async non-critical CSS
- Goal: Compare a blocking stylesheet vs inlined critical + async non-critical
- Animation: `TimelineBar` shows two CSS rows: "Blocking CSS" (red bar spanning full first-paint delay) vs "Inline critical" (green, instant) + "Async rest" (blue, loads after paint). First-paint marker moves left on the optimized row
- Motion details: Timeline `clip-path` reveal; first-paint marker `translateX` to new position, 400ms `ease-out`
- User interaction: "Apply critical CSS" toggle
- Educational objective: Show the first-paint timing improvement from inlining critical CSS
- Timing: 400ms reveal

#### Step 4 ‚Äî JS: Default vs Defer
- Related concept: Parser-blocking vs deferred scripts
- Goal: Show the DOMContentLoaded time difference
- Animation: `TimelineBar` JS row: default shows a long blocking yellow bar (parser halted); defer shows same bar running parallel to HTML parse. DCL marker moves left dramatically
- Motion details: Blocking bar `fill: #EF4444`; defer parallel bar `fill: #F59E0B`; DCL line `translateX` to earlier position, 500ms `ease-out`
- User interaction: "Apply defer" toggle
- Educational objective: Motivate using defer on all app scripts
- Timing: 500ms transition

## Visual Behavior Rules
- Timeline rows: 4 rows, each 30px tall, 10px gap
- Bar colors: font blocking `#6B7280`, font optimized `#10B981`; CSS blocking `#EF4444`, CSS inline `#10B981`, CSS async `#3B82F6`; JS blocking `#EF4444`, JS deferred `#F59E0B`; lazy image `#3B82F6`
- First-paint marker: yellow dashed vertical `<line stroke="#F59E0B" stroke-dasharray="4 2">`, labeled "First Paint"
- All optimization toggles: HTML checkboxes or buttons above the SVG (not inside it)

## Technical Implementation
- SVG structure: `<svg viewBox="0 0 700 200">` for the timeline
- Animation: Bar widths and positions change via `transform: scaleX` with `transform-origin: left`; first-paint line position changes via `translateX`
- Reuses: `TimelineBar`
- Performance: All transitions CSS-only after JS sets class names

## Accessibility
- prefers-reduced-motion: Toggle states apply instantly; no transitions
- Keyboard: Checkboxes/buttons keyboard accessible
- Contrast: WCAG AA

## Mobile
- Reduce to 2 rows at a time; scroll between resource types; viewBox `0 0 420 160`

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Image Optimization

## Article File
`src/articles/11-image-optimization.md`

## Article Summary
Images are the top LCP bottleneck. Covers format selection (JPEG ‚Üí WebP ‚Üí AVIF with `<picture>`), responsive images via `srcset` + `sizes`, preventing CLS by setting `width`/`height`, native lazy loading, `decoding="async"`, and special treatment for the LCP image (preload + `fetchpriority="high"`). Includes Next.js `<Image>` component context.

## Animation Necessity
The `srcset` browser selection process and the CLS shift caused by missing dimensions are naturally visual. An animation showing the browser picking the right image size from srcset, and another showing the page jumping when `width`/`height` are absent, makes both concepts stick.

## Animation Type
Hybrid interactive system

## Animation Scope
- Panel 1: Browser viewport resizer ‚Äî drag to resize, watch which srcset variant the browser "selects" (highlighted in a list)
- Panel 2: CLS demo ‚Äî toggle `width`/`height` attributes; page layout jumps vs stays stable
- Panel 3: Format comparison ‚Äî progress bars showing relative file sizes for JPEG/WebP/AVIF
- Auto-play for format comparison; user-driven for others

## Controls
- **Viewport width slider** ‚Äî simulates different device widths, updates srcset selection highlight
- **Toggle "Add width/height"** ‚Äî shows page stability vs instability
- **Format toggle (JPEG / WebP / AVIF)** ‚Äî animates bar shortening

## Step Plan
No discrete step system required ‚Äî three independent interactive panels.

## Visual Behavior Rules
- Viewport mock: `<rect>` with dashed border representing viewport width; draggable right edge (or slider). Width label updates dynamically: "375px", "768px", "1200px"
- srcset list: Three items `<text>`: "400w", "800w", "1600w". Active (selected) item gets a `#10B981` checkmark and fill changes `#1F2937 ‚Üí #064E3B`; others gray out `opacity: 0.4`
- CLS demo: Two `<rect>` content blocks. Without dimensions: top block fills amber (image loading), then shifts down 50px pushing text block. With dimensions: space reserved (gray placeholder `<rect fill="#374151">`), no shift
- CLS shift: `translateY(0) ‚Üí translateY(50px)`, 400ms `ease-out`; red region flash overlay
- Format bars: `<rect>` horizontal bars. JPEG: width 300px (baseline). WebP: 200px. AVIF: 160px. Bars shrink via `scaleX` transition 500ms `ease-out`; labels show "‚àí30%", "‚àí47%"

## Technical Implementation
- SVG structure: Three `<svg viewBox="0 0 360 200">` in a grid
- Animation: srcset selection: JS maps slider value to breakpoints, updates SVG classes. CLS: `transform: translateY`. Format bars: `transform: scaleX`.
- Reuses: None
- Performance: All CSS transitions on transform/opacity

## Accessibility
- prefers-reduced-motion: CLS shift instant; bar widths final; srcset selection instant
- Keyboard: Slider keyboard-accessible with arrow keys; toggles with Enter/Space
- Contrast: WCAG AA

## Mobile
- Stack panels vertically; reduce srcset list to icons only; CLS shift reduced to 20px

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Font Optimization

## Article File
`src/articles/12-font-optimization.md`

## Article Summary
Covers the complete font loading lifecycle: FOIT vs FOUT, font-display values table (auto/block/swap/fallback/optional), self-hosting vs Google Fonts (eliminating two DNS round-trips), Unicode subsetting via `unicode-range`, preloading above-the-fold fonts, and variable fonts (one file vs multiple weight files).

## Animation Necessity
FOIT and FOUT are directly visual ‚Äî a reader needs to see invisible text vs jumpy text to understand why the defaults are bad. The DNS round-trip comparison also benefits from a timeline.

## Animation Type
Step-by-step walkthrough

## Animation Scope
- Three demonstrations in tabs: FOIT demo, FOUT demo, Self-hosting vs Google Fonts timeline
- Each tab auto-plays its demo
- Variable font slider: drags weight axis and shows one file vs four files

## Controls
- **font-display selector (FOIT / FOUT / fallback / optional)** ‚Äî replays the loading behavior demo for each value
- **Replay** ‚Äî re-runs current demo
- **Variable font slider** ‚Äî drag font weight from 100‚Äì900; file count indicator shows 1 file vs N files

## Step Plan
### Total Steps: 3

#### Step 1 ‚Äî FOIT Demo
- Related concept: Block period: text invisible
- Goal: Show text invisible for 3 seconds
- Animation: A paragraph mock of `<text>` elements set to `opacity: 0`. A "loading" spinner `<circle stroke-dashoffset>` animates for 1500ms. Then text fades in `opacity: 0 ‚Üí 1`, 200ms. Label "FOIT: invisible for 1.5s" in `#EF4444`
- Motion details: Spinner `stroke-dashoffset: 50 ‚Üí 0`, 1500ms linear; text fade-in 200ms
- User interaction: Triggered on tab open or Replay
- Timing: 1700ms total

#### Step 2 ‚Äî FOUT Demo (font-display: swap)
- Related concept: Swap period: fallback then swap
- Goal: Show text in fallback font, then font swap
- Animation: `<text>` elements appear immediately (`opacity: 1`) with wide tracking (`letter-spacing: 3px`) simulating a wide fallback font. At 1000ms, letter-spacing transitions to `0px` over 300ms ‚Äî the font "swapped in". Label "FOUT: text shifts at swap" in `#F59E0B`
- Motion details: `letter-spacing: 3px ‚Üí 0px`, 300ms, `ease-out`; a brief amber highlight `fill: rgba(245,158,11,0.1)` on the text block
- User interaction: None
- Timing: 1300ms total

#### Step 3 ‚Äî Self-Host vs Google Fonts Timeline
- Related concept: DNS round-trips eliminated by self-hosting
- Goal: Compare the request chains
- Animation: `TimelineBar` showing Google Fonts path: DNS (`fonts.googleapis.com`) + DNS (`fonts.gstatic.com`) + CSS download + font download. Self-hosted path: direct font download only ‚Äî 2 fewer steps. Bars reveal left-to-right; self-hosted path is ~40% shorter total
- Motion details: Timeline `clip-path` reveal per row, staggered 150ms; time labels count up
- User interaction: Toggle "Self-hosted / Google Fonts"
- Timing: 800ms reveal per toggle

## Visual Behavior Rules
- Text mock: 3 lines of `<text>` simulating paragraph text, `font-size: 14px`, fill `#D1D5DB`
- FOIT state: text `opacity: 0`, background `<rect fill="#1F2937">` with dashed border
- FOUT state: text visible with exaggerated `letter-spacing` in fallback font color `#9CA3AF`; after swap: `#D1D5DB`
- Spinner: `<circle r="16" stroke="#3B82F6" fill="none" stroke-width="3">`, animated `stroke-dashoffset`
- Timeline colors: DNS `#14B8A6`, CSS download `#8B5CF6`, font download `#3B82F6`
- Variable font indicator: single `<rect fill="#10B981">` labeled "1 file" vs four `<rect fill="#F59E0B">` stacked labeled "4 files"; transition: extra rects scale from `scaleY(1) ‚Üí scaleY(0)` when toggled to variable, 300ms staggered 50ms

## Technical Implementation
- SVG structure: `<svg viewBox="0 0 600 240">` with tab panels
- Animation: CSS transitions for letter-spacing, opacity; JS for spinner stroke-dashoffset; timeline uses TimelineBar
- Reuses: `TimelineBar`
- Performance: All CSS transitions; no layout-triggering properties

## Accessibility
- prefers-reduced-motion: Skip FOUT letter-spacing transition; FOIT demo shows text at final opacity immediately; timeline bars at final widths
- Keyboard: Tabs keyboard accessible with arrow keys; Replay with Enter
- Contrast: WCAG AA

## Mobile
- Stack demos vertically; reduce timeline to 2 rows; hide variable font slider (show text comparison only)

## Complexity: Medium
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed


---

## Group 3 - Network and Protocols (Articles 13-18)

---

# Article: Compression Brotli and Gzip

## Article File
`src/articles/13-compression-brotli-gzip.md`

## Article Summary
Explains how Gzip and Brotli use LZ77 plus Huffman coding to compress repeated byte sequences (especially effective on JS with repeated keywords). Compares the two algorithms (Brotli: 15-25% better than Gzip), explains dynamic vs static pre-compression, server configuration, and what content types to compress vs not. Includes DevTools verification steps.

## Animation Necessity
The compression concept of repeated patterns replaced by back-references is inherently visual. The before/after file size comparison is best shown as animated bars.

## Animation Type
Lightweight motion enhancement

## Animation Scope
- Compression ratio bars: resource types side by side showing compressed vs uncompressed sizes
- A code block with repeated tokens highlighted (showing what the compressor finds)
- Bars auto-animate on scroll-into-view

## Controls
- Replay: re-runs the bar fill animation

## Step Plan
No discrete step system required.

## Visual Behavior Rules
- Compression ratio bars: pairs of rect per resource type. Uncompressed: gray fill #374151. Compressed: JS #10B981, CSS #3B82F6, HTML #6366F1. Image bars: both gray with cross icon (no benefit)
- Bar reveal: clip-path inset(0 100% 0 0) to inset(0 0% 0 0), 500ms ease-out, staggered 150ms per pair
- Compression percent labels animate as counters from 0 to final value e.g. -73%, font-family monospace, font-size 13px
- Repeated token highlight: rect highlights each instance of function keyword in amber #F59E0B, opacity 0 to 0.3, staggered 100ms per instance; connecting arrow to dictionary entry, stroke-dashoffset path-length to 0, 300ms
- Brotli vs Gzip comparison: two horizontal bars per resource, Brotli bar slightly shorter; diff bracket line plus label +15% in #10B981

## Technical Implementation
- SVG structure: svg viewBox 0 0 700 280 with dictionary demo section and ratio bars section
- Animation: IntersectionObserver triggers bar animation on scroll; counters via rAF
- Reuses: Bar fill animation pattern from WaterfallChart
- Performance: All CSS transitions; dictionary highlight rects pre-rendered, toggled via opacity class

## Accessibility
- prefers-reduced-motion: Bars at final widths; counters at final values; no highlight animation
- Keyboard: Replay button accessible
- Contrast: WCAG AA

## Mobile
- Hide dictionary demo; show ratio bars only; viewBox 0 0 420 180

## Complexity: Simple
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Browser Networking and Caching

## Article File
`src/articles/14-browser-networking-and-caching.md`

## Article Summary
Walks through every stage of a cold network request: DNS resolution (20-120ms), TCP 3-way handshake (1 RTT), TLS handshake (1-2 RTT, TLS 1.3 reduces to 1), HTTP request/TTFB, and download. Covers Cache-Control directives (max-age, no-cache, immutable, private), ETag/conditional requests (304 Not Modified), CDN edge delivery, and cumulative timing breakdown.

## Animation Necessity
The request pipeline is a sequential multi-stage process with specific timing costs. A waterfall animation showing each stage and how optimizations collapse or eliminate stages is highly effective.

## Animation Type
Step-by-step walkthrough

## Animation Scope
- Cold request waterfall: DNS to TCP to TLS to TTFB to Download, each phase colored
- Scenario toggle: preconnect, cache hit, 304 conditional each collapse relevant phases
- LCP marker moves left as optimizations applied

## Controls
- Scenario selector (Cold / preconnect / Cache hit / 304): switches which scenario plays
- Replay: re-runs animation

## Step Plan
### Total Steps: 4

#### Step 1 - Cold Request
- Related concept: Full DNS+TCP+TLS+TTFB+Download chain
- Goal: Show total cost of cold load
- Animation: WaterfallChart with all 5 phases revealing left-to-right, staggered 200ms. Total bar labeled approximately 200ms to first byte
- Motion details: DNS fill #14B8A6 teal 60ms width; TCP fill #F97316 orange 50ms; TLS fill #8B5CF6 violet 50ms; TTFB fill #F59E0B amber 80ms; Download fill #3B82F6 blue
- User interaction: None, auto-advances
- Timing: 1200ms reveal

#### Step 2 - With preconnect
- Related concept: preconnect pre-warms TCP and TLS
- Goal: Show DNS/TCP/TLS phases moved to separate pre-warm row
- Animation: DNS/TCP/TLS bars lift out translateY(0) to translateY(-50px), 400ms; main bar shrinks, starting at TTFB
- Motion details: Lifted phases dim to opacity 0.4; remaining bar snaps left, 300ms
- User interaction: Select preconnect scenario
- Timing: 700ms

#### Step 3 - Cache Hit
- Related concept: All network phases eliminated
- Goal: Show zero cost for returning users
- Animation: All phase rects scaleX(1) to scaleX(0), 300ms; single green Cache hit bar fades in, 200ms; label shows approximately 1ms
- Motion details: Cache bar fill #10B981
- User interaction: Select Cache hit scenario
- Timing: 500ms

#### Step 4 - ETag / 304 Not Modified
- Related concept: Conditional request, cache revalidation
- Goal: Show full connection but no download body
- Animation: All phases except Download show; 304 Not Modified badge at end of TTFB bar, fill #10B981, scale 0 to 1, 200ms
- User interaction: Select 304 scenario
- Timing: 800ms

## Visual Behavior Rules
- Phase rects: rect height 28px, proportional to timing cost
- Phase labels: font-size 10px, white text inside bars if bar wider than 40px, else tooltip
- Pre-warm row: small colored circles above waterfall labeled Pre-warmed
- Timing labels: font-family monospace, positioned below bars

## Technical Implementation
- SVG structure: svg viewBox 0 0 700 160
- Animation: JS updates width and x attributes; CSS transitions 300ms
- Reuses: WaterfallChart
- Performance: All transitions on transform/width

## Accessibility
- prefers-reduced-motion: Phase bars at final state; no translation animations
- Keyboard: Scenario selector keyboard accessible
- Contrast: WCAG AA; phase names as text labels not just color

## Mobile
- Reduce to 3 phases DNS, TTFB, Download; viewBox 0 0 420 120

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: HTTP/2 and HTTP/3

## Article File
`src/articles/15-http2-and-http3.md`

## Article Summary
Compares HTTP/1.1 (1 request per connection, 6 max, head-of-line blocking, verbose repeated headers) with HTTP/2 (multiplexing streams on 1 connection, HPACK header compression, stream prioritization) and HTTP/3 (QUIC over UDP, transport-layer stream isolation, 1-RTT setup, connection migration). Explains how HTTP/2 makes concatenation and domain-sharding unnecessary.

## Animation Necessity
Multiplexing and head-of-line blocking are inherently visual. Without showing streams running in parallel vs queuing behind each other, the concept stays abstract.

## Animation Type
Interactive simulation

## Animation Scope
- Three-panel comparison: HTTP/1.1 vs HTTP/2 vs HTTP/3
- Each panel shows connections as horizontal lanes with request bars
- Packet loss scenario shows different blocking behavior per protocol

## Controls
- Simulate packet loss button: injects dropped packet; HTTP/1.1 and HTTP/2 block, HTTP/3 only one stream
- Replay

## Step Plan
No discrete step system required.

## Visual Behavior Rules
- HTTP/1.1 panel: 6 connection lane rects. Waiting bars fill #374151; active bars colored by resource type
- HTTP/2 panel: 1 connection lane; multiple stream bars interleaved, color-coded by stream ID: #6366F1, #EC4899, #F59E0B, #10B981, #3B82F6, #A855F7
- HTTP/3 panel: same as HTTP/2, labeled QUIC; on packet loss, only one stream freezes
- Request bars: rect height 20px rx 3, scaleX 0 to 1 left-to-right, 300ms
- Freeze state: bar fill changes to #EF4444; Blocked label opacity 0 to 1, 200ms
- HTTP/2 freeze: ALL streams blocked simultaneously; HTTP/3 freeze: only affected stream

## Technical Implementation
- SVG structure: Three svg viewBox 0 0 360 200 in flex row
- Animation: JS class changes trigger CSS transitions; packet loss state machine
- Reuses: NetworkWaterfall
- Performance: Static SVG elements; class-based transitions

## Accessibility
- prefers-reduced-motion: Bars at final state; packet loss shown as static color change only
- Keyboard: Button keyboard accessible
- Contrast: WCAG AA; Blocked and Waiting as text labels

## Mobile
- Stack panels vertically; HTTP/1.1 reduced to 3 connection lanes

## Complexity: Advanced
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Resource Hints

## Article File
`src/articles/16-resource-hints.md`

## Article Summary
Covers all five browser resource hint types: dns-prefetch (DNS only), preconnect (DNS+TCP+TLS), preload (high-priority current-page fetch), prefetch (low-priority next-page fetch), modulepreload (fetch+parse ES module tree). Explains correct usage, common mistakes including preloading too much, missing crossorigin, and confusing preload with prefetch.

## Animation Necessity
The waterfall impact of each hint type is the key learning. Showing that dns-prefetch only eliminates the DNS bar while preconnect eliminates DNS+TCP+TLS is best shown as a waterfall comparison.

## Animation Type
Step-by-step walkthrough

## Animation Scope
- A base waterfall (no hints) shown first
- Each hint enabled one by one, collapsing the phases it handles
- LCP metric marker moves left as hints accumulate

## Controls
- Hint checkboxes (dns-prefetch / preconnect / preload): each toggles its effect on the waterfall
- Replay: resets to no hints

## Step Plan
### Total Steps: 3

#### Step 1 - No Hints: Full Cold Waterfall
- Related concept: Browser discovers everything at parse time
- Goal: Establish full cost baseline
- Animation: WaterfallChart with DNS+TCP+TLS+TTFB+Download all showing; LCP marker at approximately 3.2s
- Motion details: All bars reveal left-to-right, 400ms per bar
- Timing: 1200ms

#### Step 2 - dns-prefetch Applied
- Related concept: DNS resolved before resource discovered
- Goal: Show DNS phase eliminated from main bar
- Animation: DNS bar translateY 0 to -30px, opacity 1 to 0, 300ms; joins pre-resolved indicator above waterfall as circle r 6 fill #14B8A6; main bar shifts left by DNS duration; LCP marker moves left approximately 60ms
- User interaction: Check dns-prefetch checkbox
- Timing: 600ms

#### Step 3 - preconnect Applied
- Related concept: TCP and TLS also pre-warmed
- Goal: Show DNS+TCP+TLS all moved to pre-warm row
- Animation: TCP and TLS bars also slide out; main bar now starts at TTFB; LCP marker moves left another ~100ms; Saved 160ms badge in #10B981, scale 0 to 1, 200ms
- User interaction: Check preconnect checkbox
- Timing: 600ms

## Visual Behavior Rules
- Pre-warm row: small colored circles above main waterfall, labeled Pre-warmed phases
- LCP marker: vertical line stroke #F59E0B stroke-dasharray 3 3; translateX to new position 400ms ease-out
- Saved badge: rect fill #064E3B with text fill #10B981, scale 0 to 1

## Technical Implementation
- SVG structure: svg viewBox 0 0 700 180
- Animation: Phase positions via JS attribute updates and CSS transitions
- Reuses: WaterfallChart
- Performance: All transform transitions

## Accessibility
- prefers-reduced-motion: Phase changes instant; LCP marker instant
- Keyboard: Checkboxes keyboard accessible
- Contrast: WCAG AA

## Mobile
- Reduce to 3 phases; viewBox 0 0 420 120

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Priority Hints and Fetch Priority

## Article File
`src/articles/17-priority-hints-fetch-priority.md`

## Article Summary
Explains the browser's default resource priority table and how fetchpriority="high|low|auto" corrects the heuristic. Key use case: boosting the LCP image above other high-priority resources, and deprioritizing below-fold images and non-critical scripts. Also covers the fetch() API priority option. Adding fetchpriority="high" to the LCP image is cited as one of the cheapest LCP improvements available.

## Animation Necessity
The priority queue is invisible by default. An animation showing resources queued at different tiers and the LCP image jumping to the front when fetchpriority="high" is added makes the scheduler behavior concrete.

## Animation Type
Interactive simulation

## Animation Scope
- Priority queue: three tiers (Highest, High, Low) with resource tokens
- Toggle fetchpriority high on LCP image: it moves to Highest tier
- Toggle fetchpriority low on analytics: it moves to Low tier
- Waterfall below reorders accordingly

## Controls
- Add fetchpriority=high to LCP image toggle
- Add fetchpriority=low to analytics toggle

## Step Plan
No discrete step system required.

## Visual Behavior Rules
- Priority tiers: three horizontal bands labeled Highest, High, Low; fill alternating #1F2937, #374151, #1F2937
- Resource tokens: rect width 100 height 28 rx 4, labeled by filename; JS fill #F59E0B, CSS fill #8B5CF6, Image fill #3B82F6
- LCP image token: border dashed #10B981 when not boosted, solid when boosted
- Priority boost: translateY(tierHeight) to translateY(0), 350ms cubic-bezier(0.34,1.56,0.64,1) spring easing; shuffled tokens slide 200ms
- Deprioritize: token slides down to Low tier, same spring downward
- Waterfall reorders: LCP image bar moves to top row, 400ms ease-out
- LCP improved badge: text -180ms in #10B981, scale 0 to 1, 250ms

## Technical Implementation
- SVG structure: svg viewBox 0 0 700 320 with tiers top section and waterfall bottom section
- Animation: JS moves g elements via transform translateY; CSS transitions
- Reuses: WaterfallChart for bottom section
- Performance: Only transform translateY; no layout changes

## Accessibility
- prefers-reduced-motion: Tokens snap instantly; no spring animation
- Keyboard: Toggles keyboard accessible
- Contrast: WCAG AA

## Mobile
- Hide waterfall; show tiers only; 4 tokens; viewBox 0 0 420 220

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Intersection Observer, Debounce and Throttle

## Article File
`src/articles/18-intersection-observer-debounce-throttle.md`

## Article Summary
Explains three high-frequency-event patterns: Intersection Observer (visibility detection without scroll listeners, runs off main thread), debouncing (delay until settled for search inputs and resize), and throttling (rate-limited continuous execution for scroll progress and drag). Includes implementations, timing guidelines, and a combined example using all three.

## Animation Necessity
Debounce vs throttle timing behavior is a common confusion point. An interactive timeline showing events firing and which ones actually execute is the clearest possible explanation of the difference.

## Animation Type
Interactive simulation

## Animation Scope
- Three panels: Intersection Observer demo, Debounce timeline, Throttle timeline
- Debounce: Simulate typing button fires events; only last one executes after delay
- Throttle: Simulate scrolling fires events; executes at capped rate
- Intersection Observer: viewport mock with element entering view

## Controls
- Simulate typing button: fires rapid events to debounce timeline
- Simulate scrolling button: fires rapid events to throttle timeline
- Delay/interval sliders: adjustable 100 to 500ms

## Step Plan
No discrete step system required.

## Visual Behavior Rules
- Timeline axis: horizontal line with tick marks every 100ms
- Fired but not executed markers: circle r 5 fill #F59E0B opacity 0.5 at each event timestamp
- Executed markers: circle r 8 fill #10B981 with checkmark path inside
- Suppressed markers: circle r 5 fill #6B7280 with strikethrough line
- Debounce timer bar: rect fill #3B82F6 opacity 0.3 extending from last event by delay distance; resets on each new event; executed marker appears on completion
- Throttle gate indicator: rect fill #8B5CF6 opacity 0.3 of fixed interval width after each execution; incoming events during gate shown as suppressed
- Intersection Observer panel: mini viewport rect with element rect; scroll animation moves viewport; element entering triggers #10B981 border flash and Callback fired label opacity 0 to 1 to 0, 800ms
- Timelines scroll right-to-left at 100px per second via rAF; markers added at right edge

## Technical Implementation
- SVG structure: Three svg viewBox 0 0 600 100 for timelines; svg viewBox 0 0 300 200 for IO demo
- Animation: rAF-driven timeline scrolling; markers added to DOM on simulated events; old markers past left edge removed from DOM
- Reuses: QueueVisualizer color scheme
- Performance: DOM cleanup prevents marker accumulation

## Accessibility
- prefers-reduced-motion: Timelines static; events shown as text log instead of animated markers
- Keyboard: Buttons and sliders keyboard accessible
- Contrast: WCAG AA

## Mobile
- Hide IO panel; show only debounce and throttle timelines; width 320px

## Complexity: Advanced
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Group 4 - JS Engine and React (Articles 19-24)

---

# Article: V8 JIT Compilation

## Article File
`src/articles/19-v8-jit-compilation.md`

## Article Summary
Explains V8's two-tier compilation pipeline: Ignition interpreter (parses to bytecode, fast to generate) and TurboFan optimizing JIT compiler (profiles hot functions, compiles to machine code based on type assumptions). Covers hidden classes (object shape optimization), monomorphic vs polymorphic vs megamorphic call sites, deoptimization triggers, and practical rules for JIT-friendly code.

## Animation Necessity
The two-tier pipeline and the concept of hidden class transitions are hard to grasp textually. An animation showing a function being promoted from bytecode to optimized machine code, and then a shape change triggering deoptimization, makes the compiler's behavior concrete.

## Animation Type
Step-by-step walkthrough

## Animation Scope
- Pipeline diagram: JS Source -> AST -> Bytecode (Ignition) -> Optimized code (TurboFan)
- Hidden class transition demo: shows object shapes as boxes, transitions when properties are added dynamically
- Monomorphic vs polymorphic call site comparison
- Deoptimization event: optimized code discarded, fallback to bytecode

## Controls
- Next / Back: step through the pipeline
- Toggle JIT-friendly / JIT-unfriendly code: shows different hidden class outcomes

## Step Plan
### Total Steps: 5

#### Step 1 - Source to Bytecode
- Related concept: Ignition interpreter, bytecode generation
- Goal: Show first stage of compilation
- Animation: PipelineSteps activates JS Source stage (fill #374151 to #3B82F6, 300ms), then arrow animate, then AST stage activates, then Bytecode stage. Each stage 700ms with arrow stroke-dashoffset animation
- Motion details: Three stages left-to-right with connector arrows; Bytecode label includes Ignition badge #8B5CF6
- User interaction: None, auto-advances
- Timing: 2100ms

#### Step 2 - Hot Function Detection
- Related concept: Profiling and hotness threshold
- Goal: Show Ignition counting function calls until threshold
- Animation: A counter badge on the Bytecode stage ticks up 1 to 5 to 10 to hot-threshold, font-family monospace. At threshold, stage border changes to amber #F59E0B with a flame icon path appearing, opacity 0 to 1, 200ms
- Motion details: Counter increments via DOM text updates at 200ms intervals; flame icon scale 0 to 1.2 to 1.0, 300ms
- User interaction: None
- Timing: 1400ms

#### Step 3 - TurboFan Optimization
- Related concept: Optimized machine code compilation
- Goal: Show the function promoted to optimized machine code
- Animation: An arrow from Bytecode stage to a new TurboFan stage slides in from below, stroke-dashoffset path-length to 0, 400ms. TurboFan stage rect fill changes to #10B981. A speed indicator shows x faster label
- Motion details: New stage slides up translateY(30px) to translateY(0), opacity 0 to 1, 300ms; x3 faster badge in #10B981, scale 0 to 1
- User interaction: None
- Timing: 700ms

#### Step 4 - Hidden Class Demo
- Related concept: Object shape optimization, property order
- Goal: Show two objects with same property order sharing a hidden class vs different orders creating different classes
- Animation: Two objects shown as ScopeChain-style nested rects. Object with {x:1, y:2}: single hidden class box fills green #10B981. Object built as empty then obj.x then obj.y: two hidden class boxes appear sequentially, first fills amber, transitions to second on each property add
- Motion details: Hidden class boxes: rect width 80 height 32 rx 4; transition fill on each property addition 200ms; dashed border on intermediate states
- User interaction: Toggle JIT-friendly / JIT-unfriendly code
- Timing: 600ms per property addition

#### Step 5 - Deoptimization Event
- Related concept: Type assumption violated, fallback to bytecode
- Goal: Show TurboFan discarding optimized code on type change
- Animation: The TurboFan optimized code rect shatters via clip-path transitions: scaleY 1 to 0 with red fill #EF4444, 300ms ease-in. A Deopt! label appears with red border flash. Arrow reverses: machine code back to bytecode stage, stroke-dashoffset reverse direction, 400ms
- Motion details: Demotion arrow stroke #EF4444; Deopt label font-size 14px bold
- User interaction: None
- Educational objective: Make the cost of type inconsistency visceral
- Timing: 800ms

## Visual Behavior Rules
- Pipeline stages: rect width 100 height 40 rx 6
- JIT tier badges: small rect bottom-right of each stage, Ignition in #8B5CF6, TurboFan in #10B981
- Hot function indicator: flame icon path fill #F59E0B, size 16x20px
- Speed badge: rect fill #064E3B, text fill #10B981, font-family monospace
- All connector arrows: stroke #4B5563, stroke-width 1.5, arrowhead marker-end

## Technical Implementation
- SVG structure: svg viewBox 0 0 800 320 with horizontal pipeline + vertical hidden class demo
- Animation: JS-orchestrated state machine with requestAnimationFrame for counter
- Reuses: PipelineSteps
- Performance: All class-based transitions; no layout-triggering properties

## Accessibility
- prefers-reduced-motion: Pipeline stages advance instantly; counter jumps to hot threshold; no flame animation
- Keyboard: Next/Back buttons keyboard accessible
- Contrast: WCAG AA

## Mobile
- Reduce to 4 pipeline stages; hide hidden class comparison; viewBox 0 0 480 200

## Complexity: Advanced
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Memory Leaks and Garbage Collection

## Article File
`src/articles/20-memory-leaks-garbage-collection.md`

## Article Summary
Explains V8's mark-and-sweep GC algorithm (roots outward reachability determines live objects). Covers the four common leak patterns: forgotten event listeners (closure holds reference to data), detached DOM nodes (JS variable prevents GC after DOM removal), closures capturing large objects unnecessarily, and unbounded Map caches. Also covers WeakRef, FinalizationRegistry, and DevTools Memory panel techniques (heap snapshot, allocation timeline, detached node filter).

## Animation Necessity
The mark-and-sweep GC is highly visual: a reference graph with roots, live objects, and unreachable (garbage) objects is the clearest way to show what leaks vs what gets collected.

## Animation Type
Step-by-step walkthrough

## Animation Scope
- A reference graph of objects: roots (call stack, global) with edges to reachable objects
- Leaked objects: shown connected but logically unused (grayed out but still connected)
- GC mark phase: animation traverses reachable objects
- GC sweep phase: unreachable objects removed
- The four leak patterns each shown as mini demos

## Controls
- Pattern selector tabs (Event Listener / Detached Node / Closure / Unbounded Cache)
- Run GC button: animates the mark-and-sweep
- Fix leak toggle: removes the leaking reference, re-runs GC showing collection

## Step Plan
### Total Steps: 4

#### Step 1 - Reference Graph: Normal State
- Related concept: Mark phase starts from roots
- Goal: Show what a healthy reference graph looks like
- Animation: StateTransitionDiagram-style graph builds from roots outward, each edge stroke-dashoffset path-length to 0, 200ms staggered 100ms per edge. Root nodes fill #1E3A5F, live objects fill #1F2937
- Motion details: Nodes appear with scale 0 to 1, 200ms each; edges follow
- User interaction: None, auto-advances
- Timing: 1500ms

#### Step 2 - Leak Introduced
- Related concept: Object stays reachable despite being logically dead
- Goal: Show a leaked object still connected to a live reference chain
- Animation: A new node appears (the leaked object) connected by a dashed edge (the forgotten listener or captured closure reference). The leaked node fill is amber #F59E0B with a warning icon. Its content (the large data object it holds) cascades in as child nodes
- Motion details: Dashed edge stroke-dasharray 5 3, stroke #F59E0B; leaked node fill #3B1900; child nodes smaller circles
- User interaction: None (or select leak pattern via tabs)
- Timing: 800ms

#### Step 3 - GC Mark Phase
- Related concept: Traversal from roots marks all reachable objects
- Goal: Show the GC traversal coloring reachable objects
- Animation: A sweep indicator travels from root node outward along edges; each visited node briefly pulses blue #3B82F6 then stays marked (border blue). Leaked node is visited because it is still reachable. Unreachable nodes (no path from root) remain gray
- Motion details: Sweep path stroke-dashoffset forward, 150ms per edge; node pulse scale 1 to 1.15 to 1, 200ms
- User interaction: Run GC button
- Timing: 2000ms for full traversal

#### Step 4 - Fix and Collect
- Related concept: Removing reference allows GC to collect
- Goal: Show what happens after Fix leak is toggled
- Animation: Dashed edge to leaked node disappears (opacity 1 to 0, 300ms). On next GC run: leaked node and its children are not marked; they fade out opacity 1 to 0, scale 1 to 0.8, 400ms ease-in, labeled Collected
- Motion details: Collected label fill #10B981, font-size 12px; nodes: staggered 100ms fade-out
- User interaction: Toggle Fix leak, then Run GC
- Timing: 1500ms

## Visual Behavior Rules
- Root nodes: circle r 20, fill #1E3A5F, stroke #3B82F6, labeled Global / Call Stack
- Live object nodes: circle r 14, fill #1F2937, stroke #4B5563
- Leaked object node: circle r 16, fill #3B1900, stroke #F59E0B, dashed stroke
- Unreachable nodes: fill #111827, stroke #1F2937
- Collected state: nodes shrink to scale 0.5, opacity 0, fill #064E3B before disappearing
- GC sweep indicator: small circle r 6 fill #3B82F6 that travels along edge paths
- Heap size counter: font-family monospace, positioned below graph, updates as objects collected

## Technical Implementation
- SVG structure: svg viewBox 0 0 700 380 with node graph
- Animation: JS state machine with rAF for sweep indicator path traversal
- Reuses: StateTransitionDiagram node/edge styling
- Performance: Node fade-out removes elements from DOM after animation completes

## Accessibility
- prefers-reduced-motion: GC sweep instant; nodes appear/disappear with opacity only; no scale
- Keyboard: Tab selector + Run GC button keyboard accessible
- Contrast: WCAG AA; all nodes have text labels

## Mobile
- Reduce graph to 6 nodes; hide child nodes of leaked object; viewBox 0 0 420 300

## Complexity: Advanced
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Web Workers and OffscreenCanvas

## Article File
`src/articles/21-web-workers-offscreencanvas.md`

## Article Summary
Explains Web Workers as background threads without DOM access, communicating via postMessage (structured clone). Covers Transferable Objects for zero-copy large buffer transfer. Details what to move to workers (JSON parsing, crypto, image processing, physics). Covers OffscreenCanvas for moving canvas rendering off the main thread. Also covers Shared Workers, Service Workers distinction, module workers, and worker pools via comlink.

## Animation Necessity
The main thread vs worker thread separation is fundamentally visual. Showing computation moving from the main thread (which is also handling input and paint) to a background thread illustrates the INP benefit immediately.

## Animation Type
Interactive simulation

## Animation Scope
- Main thread vs worker thread side-by-side lanes
- A heavy computation task shown blocking the main thread (input events queued), then offloaded to a worker (main thread stays clear)
- OffscreenCanvas demo: canvas animation that stays smooth even when main thread is stressed
- postMessage data transfer animation

## Controls
- Run on main thread button: shows blocking scenario
- Run in worker button: shows non-blocking scenario
- Stress main thread toggle: adds work to main thread lane to show contention

## Step Plan
No discrete step system required.

## Visual Behavior Rules
- Main thread lane: horizontal rect fill #1F2937, labeled Main Thread, height 50px
- Worker thread lane: below main, same width, fill #1F2937, labeled Worker Thread, height 50px
- Task blocks: rect on the lane, fill #F59E0B (JS work). Heavy task: fill #EF4444, width proportional to duration
- Input events: small diamond shapes #3B82F6 appearing on main thread lane; queued events pile up as multiple diamonds when main is blocked
- On main thread: heavy task rect spans full lane width; input diamonds queue behind it; Blocked label
- In worker: heavy task rect on Worker Thread lane; main thread lane stays clear; input diamonds process immediately
- postMessage arrow: path from main thread to worker, stroke-dashoffset path-length to 0, 300ms; data packet rect slides along path
- OffscreenCanvas: a small canvas element with animated rect; when main thread stressed, CSS animation (compositor-only) continues unaffected since its in a worker
- FPS counter below each canvas, font-family monospace, font-size 14px

## Technical Implementation
- SVG structure: svg viewBox 0 0 720 300 with two thread lanes + canvas demo section
- Animation: JS state machine; task blocks added to lanes dynamically; input diamonds rAF-driven
- Reuses: QueueVisualizer for input event queue pattern
- Performance: Worker lane uses actual background color changes only; no real computation

## Accessibility
- prefers-reduced-motion: Disable task animations; show static blocked/clear state; no rAF counters
- Keyboard: Buttons keyboard accessible
- Contrast: WCAG AA

## Mobile
- Stack lanes vertically; hide OffscreenCanvas demo; viewBox 0 0 420 280

## Complexity: Advanced
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: SSR, CSR, SSG, ISR

## Article File
`src/articles/22-ssr-csr-ssg-isr.md`

## Article Summary
Explains the four major rendering strategies for web apps, comparing where and when HTML is generated. CSR: empty shell, browser renders everything, bad FCP. SSR: server generates full HTML per request, fast FCP but TTFB cost and hydration gap. SSG: build-time HTML, CDN-served, best perf, stale content. ISR: SSG with background revalidation. Includes streaming SSR with React 18 Suspense.

## Animation Necessity
The strategies differ primarily in timing and location of work ó which is exactly what a timeline comparison captures. Showing where the work happens (server vs client, build vs request time) makes the tradeoffs immediately visible.

## Animation Type
Step-by-step walkthrough

## Animation Scope
- Four-panel comparison with identical timelines for each strategy
- Timeline shows: Build, Request, Server work, TTFB, HTML parse, Hydration, Interactive
- Each strategy highlights different timeline phases
- User can switch between strategies and see timing differences

## Controls
- Strategy selector tabs (CSR / SSR / SSG / ISR)
- Replay: re-runs the selected strategy timeline

## Step Plan
### Total Steps: 4

#### Step 1 - CSR Timeline
- Related concept: Client-side rendering, empty shell
- Goal: Show how CSR delays first content until JS executes
- Animation: TimelineBar showing: Request (short), TTFB (short, server sends empty HTML), HTML parse (short), JS download + execute (long amber #F59E0B bar), Data fetch (another bar), FCP/LCP (late marker). Interactive marker very late. FCP marker labeled with time
- Motion details: All bars reveal left-to-right clip-path 400ms; empty shell period shown as gray dashed bar
- User interaction: Select CSR tab
- Timing: 1200ms

#### Step 2 - SSR Timeline
- Related concept: Server renders full HTML per request
- Goal: Show SSR's fast FCP but TTFB cost and hydration gap
- Animation: Server work bar added before TTFB (purple #8B5CF6, labeled Server render). TTFB marker pushed right by server work. HTML parse produces FCP immediately after TTFB. JS hydration bar follows (amber). Interactive marker after hydration. Hydration gap highlighted with amber overlay
- Motion details: Same reveal pattern; hydration gap rect fill #F59E0B opacity 0.1 with label
- User interaction: Select SSR tab
- Timing: 1200ms

#### Step 3 - SSG Timeline
- Related concept: Build-time HTML, CDN delivery
- Goal: Show SSG eliminating server work from request path
- Animation: Build phase shown on a separate build-time axis above request timeline. Request timeline: CDN edge delivery (very short TTFB), HTML parse, FCP immediately. No server render bar in request path. No hydration bar. FCP and Interactive markers very close together
- Motion details: CDN delivery bar fill #10B981, short width; FCP + Interactive markers nearly overlapping
- User interaction: Select SSG tab
- Timing: 800ms

#### Step 4 - ISR Timeline
- Related concept: SSG with background revalidation
- Goal: Show ISR serving stale content + background regeneration
- Animation: Same as SSG for the request path. A separate background process shows after response: small regeneration indicator pulsing below the timeline, labeled Background revalidation. A second request shows fresh content served
- Motion details: Regen indicator: circle r 6 fill #3B82F6, pulse opacity 1 to 0.3 loop; fresh badge appears on second request in #10B981
- User interaction: Select ISR tab
- Timing: 1200ms

## Visual Behavior Rules
- Timeline rows: 40px tall each, same x-axis spanning 0 to 4s
- Server work bar: fill #8B5CF6 (violet)
- Client JS execution bar: fill #F59E0B (amber)
- Network/CDN bar: fill #14B8A6 (teal)
- FCP marker: vertical line stroke #10B981, labeled FCP
- Interactive marker: vertical line stroke #3B82F6, labeled TTI
- Hydration gap: rect fill #F59E0B opacity 0.08, spanning from FCP to TTI
- Build-time axis: shown above request timeline with gray background, labeled Build Time

## Technical Implementation
- SVG structure: svg viewBox 0 0 700 200 with single timeline, updated per strategy tab
- Animation: Strategy change updates bar widths/positions via JS; CSS transitions 400ms
- Reuses: TimelineBar
- Performance: All CSS transitions; no layout-triggering properties

## Accessibility
- prefers-reduced-motion: Strategy tab change instant; bars at final state
- Keyboard: Tabs keyboard accessible with arrow keys
- Contrast: WCAG AA; strategy names as text

## Mobile
- Stack strategies as dropdown not tabs; single timeline row; viewBox 0 0 420 160

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: React Performance Patterns

## Article File
`src/articles/23-react-performance-patterns.md`

## Article Summary
Explains React's re-render trigger conditions (state, parent re-render, context). Covers React.memo (skip re-render when props unchanged), useMemo (cache expensive calculations), useCallback (stable function references for memo'd children), correct key usage in lists (stable id vs index), React.lazy+Suspense for code splitting, startTransition for non-urgent updates, and the React DevTools Profiler as the starting point.

## Animation Necessity
The re-render propagation concept is visual: showing a tree where a state change propagates downward, and then showing memo boundaries stopping that propagation, makes the optimization impact immediately clear.

## Animation Type
Interactive simulation

## Animation Scope
- A component tree (5-6 nodes in a hierarchy)
- A state change at the root triggers re-renders cascading downward (all nodes flash)
- Add React.memo boundaries: only nodes with changed props re-render
- Toggle memo on/off interactively

## Controls
- Trigger state change button: fires a parent re-render
- Toggle memo on subtrees: checkboxes per component branch
- Show re-render reasons toggle: labels each re-rendered node with why it re-rendered

## Step Plan
No discrete step system required.

## Visual Behavior Rules
- Component tree: TreeDiff-style nodes, circle r 20, fill #1F2937, connected by lines
- Re-rendered node: briefly fills amber #F59E0B, then returns to default, 400ms total (200ms in, 200ms out)
- Skipped node (memo working): briefly fills green #10B981 with checkmark, 300ms
- Memo boundary indicator: dashed ring circle r 24 stroke #10B981 around memo-wrapped components
- Re-render reason label: small text element below node, font-size 10px, fill #9CA3AF, shows parent re-render / state change / props changed
- Re-render counter badge: small rect top-right of node, fill #EF4444, text in white, counts cumulative re-renders
- Without memo: all child nodes flash amber on every state change
- With memo: only nodes with changed props flash; others show green skip flash

## Technical Implementation
- SVG structure: svg viewBox 0 0 600 360 with component tree
- Animation: JS tracks re-render count per node; color transitions CSS 200ms; counter badge updates in DOM
- Reuses: TreeDiff node styling
- Performance: All CSS class transitions; no layout changes

## Accessibility
- prefers-reduced-motion: Re-render shown as border-color change only, 50ms; skip shown as green border only
- Keyboard: Buttons/checkboxes keyboard accessible
- Contrast: WCAG AA; counter badges large enough

## Mobile
- Reduce tree to 4 nodes; viewBox 0 0 420 280

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Virtual Scrolling and Windowing

## Article File
`src/articles/24-virtual-scrolling-windowing.md`

## Article Summary
Explains the DOM cost of long lists (50,000+ nodes from 5,000 items), how windowing renders only the visible rows plus overscan buffer, the outer container full-height illusion via absolute positioning, and concrete implementations with react-window (FixedSizeList) and @tanstack/virtual (headless, variable-height). Covers when to apply (>100 items, meaningful DOM weight) and accessibility considerations (aria-rowcount).

## Animation Necessity
The windowing concept is inherently visual: showing only 10 rows rendered in the DOM while the scrollbar suggests 10,000 rows exist is the perfect illustration. Animations comparing full DOM vs windowed DOM make the performance difference immediate.

## Animation Type
Interactive simulation

## Animation Scope
- Two-panel comparison: Full DOM list vs Windowed list
- Both panels show a scrollable list; user can scroll via a slider
- Full DOM panel shows all rows in DOM (DOM node counter climbs to 10000)
- Windowed panel shows only visible rows in DOM (counter stays at ~12)
- A scroll simulation slider triggers smooth scrolling in both panels

## Controls
- Scroll slider: simulates scrolling position in both lists simultaneously
- Toggle windowing: switches windowed panel from full DOM to windowed mode and back
- Item count selector (100 / 1000 / 10000): changes list size

## Step Plan
No discrete step system required.

## Visual Behavior Rules
- List panel: rect width 200 height 300 rx 4 as viewport outline; rows inside as rect height 30 labeled Row N
- Full DOM panel: rows extend far beyond viewport rect (overflow hidden); all visible; DOM counter climbs (font-family monospace, font-size 14px, fill #EF4444)
- Windowed panel: only 8-10 rows visible; DOM counter stays at 10-12 in #10B981; as scroll slider moves, rows recycle: exiting rows fade out bottom translateY(10px), opacity 0; new rows fade in top translateY(-10px) to 0, 150ms each
- Scroll slider maps to row index; both panels update simultaneously
- Performance indicator: render time bar below each panel (full DOM: long red bar; windowed: short green bar); bars proportional to simulated render cost
- Initial load time badge: full DOM shows 3200ms in #EF4444; windowed shows 60ms in #10B981

## Technical Implementation
- SVG structure: Two svg viewBox 0 0 240 320 in flex row
- Animation: Scroll slider JS updates visible row indices; CSS transitions on row opacity/transform
- Reuses: None
- Performance: Windowed panel DOM contains maximum 14 row elements at any time

## Accessibility
- prefers-reduced-motion: Row recycling instant; no translate animations
- Keyboard: Slider keyboard-adjustable with arrow keys
- Contrast: WCAG AA

## Mobile
- Stack panels vertically; reduce panel height to 200px; viewBox 0 0 300 250

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Group 5 - Perceived Performance and Budgets (Articles 25-30)

---

# Article: Perceived Performance

## Article File
`src/articles/25-perceived-performance.md`

## Article Summary
Explains that perceived performance is about managing user expectation and reducing uncertainty, independent of actual metrics. Covers three principles: occupied time feels shorter, uncertain waits feel longer, early feedback signals progress. Techniques: skeleton screens with shimmer animations, optimistic UI (instant state change + rollback on failure), determinate vs indeterminate progress indicators, the 100ms spinner rule, blur-up image loading (LQIP), and route prefetching for instant navigation.

## Animation Necessity
The concepts here are themselves animations (skeleton shimmer, optimistic UI toggle, blur-up transition). The spec is defining these as live interactive demos that are both educational and directly demonstrating the pattern.

## Animation Type
Hybrid interactive system

## Animation Scope
- Three demo panels: Skeleton screen, Optimistic UI, Blur-up image
- Each demo is interactive and plays the real pattern
- Auto-play on scroll-into-view

## Controls
- Skeleton demo: Simulate load complete button transitions skeleton to content
- Optimistic UI: Like button that responds immediately vs with delay toggle
- Blur-up: Load image button triggers the blur-to-sharp transition

## Step Plan
No discrete step system required.

## Visual Behavior Rules
- Skeleton screen: three rect elements height 20, 14, 14 stacked. Background: linear-gradient(90deg, #1F2937 25%, #374151 50%, #1F2937 75%), background-size 200% 100%. Animation: background-position 200% 0 to -200% 0, 1.5s linear infinite (shimmer). On Load complete: skeleton elements fade out opacity 1 to 0, 200ms; real content fades in opacity 0 to 1, 200ms
- Optimistic UI: A heart button. Without optimistic: click shows spinner for 800ms then fills. With optimistic: click immediately fills heart (fill #EF4444, scale 1 to 1.3 to 1, 200ms spring), spinner appears briefly bottom-right corner, then disappears. Toggle switches between modes
- Blur-up: a placeholder rect with blur filter applied (CSS blur(20px)). On load: blur transitions 20px to 0px, 400ms ease-out; opacity 0.3 to 1, simultaneous. LQIP color gradient simulated as: gradient fill from #374151 to #1F2937 in the placeholder

## Technical Implementation
- SVG structure: svg viewBox 0 0 300 200 per panel; three panels in flex row
- Animation: CSS keyframes for shimmer; JS for button state; blur filter transition via CSS
- Reuses: None
- Performance: CSS-only shimmer (no JS); blur via CSS filter (compositor-handled)

## Accessibility
- prefers-reduced-motion: Shimmer animation disabled; opacity change only; blur-up instant
- Keyboard: All buttons keyboard accessible
- Contrast: WCAG AA

## Mobile
- Stack panels vertically; reduce each panel viewBox to 0 0 280 140

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Bundle Optimization

## Article File
`src/articles/26-bundle-optimization.md`

## Article Summary
Explains the full cost of JavaScript (parse + compile + execute on every load, not just transfer). Covers tree shaking (dead code elimination via static ES module analysis, requiring sideEffects:false), code splitting (route-based and component-level with React.lazy+Suspense, dynamic import()), shared chunks (vendor extraction), and bundle analysis tools (rollup-plugin-visualizer, bundlephobia). Includes minification and compression as the final pass.

## Animation Necessity
The tree shaking concept (which exports are used vs dead) is visual. A dependency graph where unused branches are grayed out and trimmed makes the mechanism clear. Code splitting before/after is best shown as a bundle size treemap comparison.

## Animation Type
Step-by-step walkthrough

## Animation Scope
- Panel 1: Tree shaking demo - import graph with used/unused exports; unused exports grayed out and trimmed
- Panel 2: Code splitting - one large bundle rect splits into multiple smaller chunk rects, one per route
- Panel 3: Bundle size bar chart before/after optimization

## Controls
- Apply tree shaking toggle: grays out and removes unused exports
- Apply code splitting toggle: splits the monolithic bundle into chunks
- Replay

## Step Plan
### Total Steps: 3

#### Step 1 - Tree Shaking
- Related concept: Dead code elimination via static analysis
- Goal: Show unused exports being eliminated from the bundle
- Animation: Import graph with module nodes (rect width 80 height 32) connected by arrows. Used exports highlighted #10B981; unused exports fill #374151 dashed border. On Apply: unused nodes scale 0.8 to 0, opacity 1 to 0, 300ms staggered 100ms per node. Bundle size counter decrements from e.g. 500KB to 320KB
- Motion details: Used nodes remain; unused fade; counter decrements via rAF
- User interaction: Toggle Apply tree shaking
- Timing: 800ms

#### Step 2 - Code Splitting
- Related concept: Route chunks loaded on demand
- Goal: Show one large bundle rect splitting into route-specific chunks
- Animation: A large rect fill #EF4444 labeled 500KB bundle. On Apply: rect splits via clip-path into 4 smaller rects that spread apart, each labeled with route name (/, /dashboard, /settings, /profile). Each chunk rect fill #3B82F6, smaller size. A Loaded on demand label appears on 3 of 4 chunks
- Motion details: Split animation: parent rect scaleX 1 to 0.25, four child rects appear from center spreading outward, translateX staggered 60ms each, 350ms ease-out
- User interaction: Toggle Apply code splitting
- Timing: 1000ms

#### Step 3 - Bundle Size Comparison
- Related concept: Combined optimization results
- Goal: Show total size reduction after all optimizations
- Animation: Three horizontal bars: Original (longest, fill #EF4444), After tree shaking (medium, fill #F59E0B), After splitting (shortest initial load, fill #10B981). Bars reveal left-to-right, staggered 200ms. Percentage labels: -36%, -68% initial load
- Motion details: clip-path reveal 400ms ease-out per bar
- User interaction: None, auto-advances
- Timing: 1200ms

## Visual Behavior Rules
- Module nodes in tree shaking: rect width 80 height 32 rx 4; used fill #064E3B stroke #10B981; unused fill #1F2937 stroke #374151 dashed
- Import arrows: line stroke #4B5563, stroke-width 1.5, arrowhead marker
- Bundle rect: rect proportional to KB size
- Chunk labels: font-size 10px monospace inside each chunk rect
- Counter: font-family monospace font-size 16px fill #D1D5DB positioned above bundle rect

## Technical Implementation
- SVG structure: svg viewBox 0 0 700 280 with three sections top to bottom
- Animation: JS class toggles trigger CSS transitions; counter via rAF
- Reuses: None
- Performance: All CSS transitions

## Accessibility
- prefers-reduced-motion: Tree shaking instant color change; split instant position change; bars at final widths
- Keyboard: Toggles keyboard accessible
- Contrast: WCAG AA

## Mobile
- Hide tree shaking section; show code splitting and bar chart only; viewBox 0 0 420 200

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Third-Party Scripts

## Article File
`src/articles/27-third-party-scripts.md`

## Article Summary
Explains the multi-dimensional cost of third-party scripts: DNS lookup, connection, main-thread blocking parse/execute, their own sub-requests, DOM manipulation, and persistent listeners. Covers measurement (DevTools Network filter, Bottom-Up group by domain, Lighthouse audit, Request Blocking). Loading strategies: async/defer, load-on-interaction, facade pattern (YouTube thumbnail that loads real iframe only on click). Partytown (scripts run in Web Worker). Connection warming with preconnect.

## Animation Necessity
The load-on-interaction and facade patterns are behavioral ó showing the difference between eager loading (blocks everything) and interaction-triggered loading (zero cost until click) makes the optimization visceral.

## Animation Type
Interactive simulation

## Animation Scope
- Two panels: Eager loading vs Load on interaction
- Eager loading: the waterfall fills with third-party script bars immediately; main thread blocked
- Load on interaction: waterfall clean until user clicks; then script loads
- Facade demo: YouTube-style thumbnail with play button; clicking loads the real embed

## Controls
- Toggle: Eager / Load-on-interaction
- Click the play button in the facade demo

## Step Plan
No discrete step system required.

## Visual Behavior Rules
- Waterfall panels: WaterfallChart with rows for own JS, analytics, chat widget, tag manager
- Eager panel: all rows fill from t=0; main thread blocked bar (red fill #EF4444) spans first 2s
- Load-on-interaction panel: only own JS row fills at t=0; third-party rows are gray dashed until Click event marker; after click at t=2s third-party rows reveal
- Click event marker: small circle #3B82F6 on timeline at t=2s labeled Click; vertical line drops down to third-party rows triggering their reveal clip-path, 200ms each staggered 100ms
- Main thread blocked indicator: rect fill #EF4444 opacity 0.15 spanning the blocked period, labeled Blocked
- Facade component: rect width 280 height 160 rx 6 fill #0F172A; thumbnail gradient background fill #1F2937; centered play triangle polygon fill #fff opacity 0.9; on click: rect transitions to iframe placeholder with loading spinner, 300ms
- TBT savings badge: -850ms TBT text in #10B981 after load-on-interaction, scale 0 to 1, 250ms

## Technical Implementation
- SVG structure: Two svg viewBox 0 0 480 200 side-by-side; facade below as svg viewBox 0 0 320 200
- Animation: Mode toggle triggers class changes; row reveals via clip-path; click event fires timeline sequence
- Reuses: WaterfallChart
- Performance: All CSS transitions

## Accessibility
- prefers-reduced-motion: Rows appear at final state; no clip-path reveal
- Keyboard: Toggle and play button keyboard accessible
- Contrast: WCAG AA; Blocked label as text

## Mobile
- Stack panels vertically; show facade only on mobile; hide second panel

## Complexity: Medium
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Service Workers and Caching

## Article File
`src/articles/28-service-workers-and-caching.md`

## Article Summary
Explains Service Workers as a programmable network proxy on a background thread. Covers the lifecycle (Install: pre-cache assets, Activate: clean old caches, Fetch: intercept requests) with skipWaiting/clients.claim nuances. Covers four caching strategies: Cache-First (static assets), Network-First (HTML/API with offline fallback), Stale-While-Revalidate (fast response + background refresh), Cache-Then-Network (instant display + real-time updates). When to use SWs and gotchas.

## Animation Necessity
The Service Worker lifecycle state machine and the three caching strategies are both inherently sequential and visual. A state transition diagram for the lifecycle, and a request/response flow animation for each strategy, make the architecture clear.

## Animation Type
Step-by-step walkthrough

## Animation Scope
- Lifecycle: StateTransitionDiagram showing Parsed -> Installing -> Installed -> Activating -> Activated -> Redundant
- Caching strategy selector: choose Cache-First / Network-First / Stale-While-Revalidate
- Each strategy shows a request flow: browser -> SW -> Cache / Network with animated arrows

## Controls
- Lifecycle Next button: advance through lifecycle states
- Strategy selector: switch between 3 strategies
- Replay

## Step Plan
### Total Steps: 3

#### Step 1 - Service Worker Lifecycle
- Related concept: Install, Activate, Fetch states
- Goal: Show the SW state machine
- Animation: StateTransitionDiagram with 6 nodes: Parsed, Installing, Installed, Activating, Activated, Redundant. Each state advance: edge stroke-dashoffset path-length to 0, 350ms; new node activates fill #1E3A5F stroke #3B82F6. A Install event fires at Installing node (small badge pops), Activate fires at Activating
- Motion details: Each node transition 350ms with connector edge animation
- User interaction: Next button advances states
- Timing: 350ms per step

#### Step 2 - Cache-First Strategy
- Related concept: Check cache first, network only if miss
- Goal: Show request flow for versioned static assets
- Animation: A request arrow travels: Browser (node) -> SW node -> Cache node. Cache hit: arrow returns Browser via Cache (green path). Cache miss: arrow continues to Network, returns to Cache (storing), then to Browser. Both paths animated via stroke-dashoffset
- Motion details: Hit path stroke #10B981; miss path stroke #F59E0B; nodes labeled Browser/SW/Cache/Network as circle r 24
- User interaction: Toggle Cache hit / Cache miss
- Timing: 500ms per path segment

#### Step 3 - Stale-While-Revalidate
- Related concept: Return cached immediately, refresh in background
- Goal: Show two simultaneous paths: cached response returned instantly, network update in background
- Animation: Request arrives. Two arrows fire simultaneously: one returns from Cache to Browser immediately (300ms), one goes Network -> Cache (background, 800ms), labeled Next visit will get fresh. Both paths visible, different opacity/color
- Motion details: Immediate path stroke #10B981 opacity 1; background path stroke #3B82F6 opacity 0.5 dashed
- User interaction: None
- Timing: 800ms total (both paths complete)

## Visual Behavior Rules
- Request/response arrows: path with arrowhead marker, stroke-dashoffset animation
- Hit path: stroke #10B981; miss path: stroke #F59E0B; background refresh: stroke #3B82F6 dashed
- Strategy nodes: circle r 24, labels font-size 11px monospace
- Cache node: fill #064E3B (greenish); Network node: fill #1E3A5F (blue); SW node: fill #3B0764 (purple)
- Lifecycle nodes: circle r 22, same state colors as StateTransitionDiagram component

## Technical Implementation
- SVG structure: svg viewBox 0 0 600 320 with lifecycle diagram (top) + strategy flow (bottom)
- Animation: JS state machine; path animations via stroke-dashoffset
- Reuses: StateTransitionDiagram
- Performance: Path animations via SVG stroke properties only

## Accessibility
- prefers-reduced-motion: State transitions instant; paths appear at final state; no dash animation
- Keyboard: Buttons/selector keyboard accessible
- Contrast: WCAG AA; all nodes labeled with text

## Mobile
- Hide lifecycle diagram; show strategy flow only; viewBox 0 0 360 220

## Complexity: Advanced
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Adaptive Loading

## Article File
`src/articles/29-adaptive-loading.md`

## Article Summary
Explains how to adapt served content to real device/network capabilities using navigator.connection (effectiveType, downlink, rtt, saveData), navigator.deviceMemory (coarsened to 8 tiers), and navigator.hardwareConcurrency. Provides a getDeviceCapabilities() helper and patterns: serve lower-quality images on slow connections, disable non-essential animations on saveData/slow networks, defer non-critical JS on low-end devices, cap worker count by CPU. Covers prefers-reduced-data CSS media query and prefers-reduced-motion.

## Animation Necessity
The concept is best demonstrated by showing the same page layout loading different assets based on a simulated network condition. A live slider that changes network type and updates what loads (image quality, animation on/off) makes the pattern concrete.

## Animation Type
Interactive simulation

## Animation Scope
- A simulated device capabilities dashboard
- Sliders for network quality (4G / 3G / 2G / slow-2G) and device memory (8GB / 4GB / 1GB / 512MB)
- As sliders change, three content items update: image quality, animation enabled/disabled, feature module loading

## Controls
- Network quality slider (4G / 3G / 2G / slow-2G)
- Device memory selector
- saveData toggle

## Step Plan
No discrete step system required.

## Visual Behavior Rules
- Capability display: three rows of indicators
  - Network row: signal bars icon (1-4 filled bars based on quality), effectiveType label, downlink Mbps
  - Memory row: filled/empty memory blocks (8 blocks, filled count proportional to memory), deviceMemory label
  - CPU row: core icons (1-8 dots, filled count = hardwareConcurrency)
- Content preview area: three items:
  - Image quality: rect fill color shifts from high-fidelity gradient (#3B82F6 to #8B5CF6) on 4G to flat gray (#374151) on 2G; label changes: Full quality / Reduced quality / Low quality
  - Animation state: a small animated element (rotating ring) that stops on slow network; label: Animations enabled / Disabled
  - Feature module: a [Load feature] button that is grayed out on low memory (fill #374151 text #6B7280) and active on high memory (fill #3B82F6 text #fff)
- Network quality slider: HTML range input styled above SVG
- Transitions: all content preview changes 200ms ease-out

## Technical Implementation
- SVG structure: svg viewBox 0 0 600 320 with capability indicators and content preview
- Animation: JS event listeners on sliders update SVG fill classes; CSS transitions handle color changes
- Reuses: None
- Performance: All CSS class-based transitions

## Accessibility
- prefers-reduced-motion: Rotating ring always stopped; no transition animations
- Keyboard: Sliders keyboard accessible
- Contrast: WCAG AA; labels always shown not just icons

## Mobile
- Stack vertically; reduce content preview to 2 items; viewBox 0 0 360 300

## Complexity: Medium
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Performance Budgets

## Article File
`src/articles/30-performance-budgets.md`

## Article Summary
Explains performance budgets as constraints on metrics that prevent silent regression. Covers three budget categories: quantity-based (bundle size KB, request count), rule-based (Lighthouse score >= 90), timing-based (LCP < 2.5s, INP < 200ms, TBT < 200ms). Lighthouse CI YAML setup for PR gates. bundle-size + size-limit for deterministic bundle checks. Process for setting realistic budgets (measure, add 10% buffer, tighten over time).

## Animation Necessity
The concept of a budget threshold that blocks a PR when crossed is best shown as a bar chart where a new deployment pushes a bar over the limit and triggers a fail state.

## Animation Type
Lightweight motion enhancement

## Animation Scope
- A bundle size trend chart showing multiple deployments
- A budget threshold line that stays fixed
- Animated bar for a new deployment that crosses the threshold (red) vs stays under (green)
- CI pass/fail badge animated

## Controls
- Add deployment button: adds a new bar to the chart (randomly sized, sometimes over budget)
- Simulate PR button: adds a specific over-budget bar to show the fail scenario
- Reset

## Step Plan
No discrete step system required.

## Visual Behavior Rules
- Trend chart: bar chart, each bar rect height proportional to bundle KB. X-axis: deployment numbers. Y-axis: KB
- Budget threshold line: horizontal line stroke #F59E0B stroke-dasharray 4 4, labeled Budget: 200KB
- Under-budget bars: fill #10B981
- Over-budget bars: fill #EF4444; a CI FAIL badge pops above the bar scale 0 to 1.2 to 1, 300ms; bar shakes translateX 0 -3 3 -2 2 0, 400ms
- CI PASS badge: fill #064E3B text #10B981 pops on under-budget bar, 200ms
- New bar enters from right: scaleY 0 to 1 from bottom, 350ms ease-out
- Delta label: appears on new bar showing +17.3KB in #EF4444 or -8.1KB in #10B981, opacity 0 to 1, 200ms
- Budget line stays fixed; bars animate in under it

## Technical Implementation
- SVG structure: svg viewBox 0 0 700 280 with bar chart and threshold line
- Animation: JS adds new bar rects with CSS transitions; badge pop-in via scale transition
- Reuses: MetricGauge color scheme
- Performance: All CSS transitions

## Accessibility
- prefers-reduced-motion: Bars appear at final height; no shake; badges appear instantly
- Keyboard: Buttons keyboard accessible
- Contrast: WCAG AA; labels on bars not just color

## Mobile
- Reduce to 5 bars visible; viewBox 0 0 420 220

## Complexity: Simple
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Group 6 - Deep Dives and Projects

---

# Article: React Virtual DOM Reconciliation

## Article File
`src/articles/react-virtual-dom-reconciliation.md`

## Article Summary
Deep-dives into how React interacts with the browser rendering pipeline. Explains the Virtual DOM as an in-memory JS object tree that batches DOM work, reconciliation as diffing old vs new vDOM to produce minimal DOM mutations, and where React runs in the browser frame loop (JS execution slot, competing for 16.67ms). Covers React 18's concurrent rendering via Fiber (pause/resume/abandon renders), automatic batching, startTransition, and React Server Components shifting initial render to server.

## Animation Necessity
The vDOM diff and the frame loop position of the reconciler are highly visual. Showing the old and new vDOM trees with diff highlighting, and placing React in the browser frame budget alongside layout/paint, makes both concepts land immediately.

## Animation Type
Step-by-step walkthrough

## Animation Scope
- Step 1: Browser frame loop with React's position shown
- Step 2: vDOM tree (before) + new vDOM tree (after state change) + diff highlighting
- Step 3: Minimal DOM mutations applied from the diff
- Step 4: Concurrent rendering - render interrupted by high-priority input

## Controls
- Next / Back buttons
- Toggle concurrent mode to show interruptible vs blocking render

## Step Plan
### Total Steps: 4

#### Step 1 - Browser Frame Loop
- Related concept: React runs in the JS execution slot
- Goal: Show where React lives in the 16.67ms frame budget
- Animation: TimelineBar showing one 16.67ms frame. Segments: Input events (short blue), JS/React (amber, labeled React reconciler), Style recalc (violet), Layout (pink), Paint (green), Composite (teal). Each segment reveals in sequence
- Motion details: Segments clip-path reveal 200ms each; React segment has a small React logo rect overlay
- User interaction: None
- Timing: 1400ms

#### Step 2 - vDOM Diff
- Related concept: New vDOM vs old vDOM, O(n) diffing
- Goal: Show a before/after tree comparison with changed nodes highlighted
- Animation: TreeDiff component. Left tree (previous vDOM): nodes fill #1F2937. Right tree (new vDOM): mostly same, but one updated node fill #3B82F6 with a Changed badge, one removed node fill #EF4444 with scale 1 to 0, one new node fill #10B981 with scale 0 to 1
- Motion details: Changed node: border #3B82F6 pulse 0 to 3px; removed: scale 1 to 0, 250ms; added: scale 0 to 1, 300ms spring
- User interaction: None
- Timing: 800ms

#### Step 3 - Minimal DOM Mutations
- Related concept: React applies only the diff, not the full tree
- Goal: Show only 2-3 DOM nodes being updated vs the full tree
- Animation: Real DOM tree (right side of screen). Most nodes gray (unchanged). Changed nodes glow blue and show an update icon. A counter in #10B981 shows 2 DOM mutations vs the 9 nodes that re-rendered
- Motion details: Unchanged nodes dim to opacity 0.3; updated nodes glow filter drop-shadow 0 0 8px #3B82F6, 300ms
- User interaction: None
- Timing: 600ms

#### Step 4 - Concurrent Rendering: Interruptible
- Related concept: Fiber, yield, startTransition
- Goal: Show React pausing a render to handle input, then resuming
- Animation: Two scenarios side-by-side. Blocking (React 17): one long amber bar spans 80ms, input event (blue diamond) queued behind it, delayed. Concurrent (React 18): amber bar pauses mid-render (splits into segments with gaps), input event processes during gap, then render resumes
- Motion details: Blocking bar: single rect fill #EF4444 opacity 0.8; Concurrent: bar splits into 3 shorter segments with input diamond between segments 1 and 2
- User interaction: Toggle Blocking / Concurrent
- Timing: 1000ms per scenario

## Visual Behavior Rules
- Frame timeline: same color scheme as TimelineBar component
- vDOM nodes: circle r 16 connected by line edges
- Changed indicator: ring circle r 20 stroke #3B82F6 stroke-width 2, pulse opacity
- DOM mutation counter: font-family monospace font-size 16px fill #10B981
- Input event diamond: polygon 4 points fill #3B82F6

## Technical Implementation
- SVG structure: svg viewBox 0 0 800 360 with frame timeline (top) + tree diff (middle) + concurrent demo (bottom)
- Animation: JS state machine per step; TreeDiff for step 2; CSS transitions throughout
- Reuses: TreeDiff, TimelineBar
- Performance: All CSS transitions

## Accessibility
- prefers-reduced-motion: Steps advance with instant color changes; no scale or pulse animations
- Keyboard: Next/Back keyboard accessible
- Contrast: WCAG AA

## Mobile
- Hide frame timeline; show tree diff and concurrent comparison; viewBox 0 0 480 300

## Complexity: Advanced
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Article: Web Performance Planner

## Article File
`src/articles/web-performance-planner.md`

## Article Summary
A project reference guide for the Web Performance Planner tool. Explains the problem it solves (Lighthouse loop is slow, noisy, non-comparative), its core value proposition (import a real Lighthouse JSON, simulate CWV scores deterministically in real time), calibration algorithm (binary search curve fitting per metric), variation system (side-by-side comparison), and all main features: resource management, Lighthouse import, CDN/network simulation, waterfall view, roadmap suggestions.

## Animation Necessity
No animation needed. This is a project reference guide, not a conceptual explainer. The tool itself is the interactive demo. A static architecture diagram would be more appropriate than an animation.

## Animation Type
No animation needed

## Animation Scope
N/A

## Controls
N/A

## Step Plan
No discrete step system required.

## Visual Behavior Rules
N/A

## Technical Implementation
N/A

## Accessibility
N/A

## Mobile
N/A

## Complexity: N/A
## Priority: Low

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Ready for implementation (no animation to implement)

---

# Article: Holdings Analyzer

## Article File
`src/articles/holdings-analyzer.md`

## Article Summary
A project documentation article for the Holdings Analyzer portfolio tool. Covers the CSV upload flow, dashboard overview (six stat cards, allocation pie, gainers/losers chart), holdings table (editable, sortable, with market cap badges), dividends tab (yield tracking, payout ratio safety badges, income projections), fundamentals tab, and risk metrics. Written as a user guide, not a technical explainer.

## Animation Necessity
No animation needed. This is a project guide/documentation article, not a conceptual explainer. The project itself provides the interactive demo experience.

## Animation Type
No animation needed

## Animation Scope
N/A

## Controls
N/A

## Step Plan
No discrete step system required.

## Visual Behavior Rules
N/A

## Technical Implementation
N/A

## Accessibility
N/A

## Mobile
N/A

## Complexity: N/A
## Priority: Low

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Ready for implementation (no animation to implement)

---

# Article: Claude Figma MCP Integration

## Article File
`src/articles/claude-figma-mcp-integration.md`

## Article Summary
A setup and usage guide for the Figma MCP server integration with Claude Code. Covers adding the remote MCP server, authentication flow, the three exposed tools (get_screenshot, get_design_context, get_metadata), and practical usage patterns. Written as a step-by-step integration guide.

## Animation Necessity
No animation needed. This is a setup guide with linear steps best presented as static numbered instructions. The authentication flow involves external browser navigation that cannot be meaningfully animated in an SVG.

## Animation Type
No animation needed

## Animation Scope
N/A

## Controls
N/A

## Step Plan
No discrete step system required.

## Visual Behavior Rules
N/A

## Technical Implementation
N/A

## Accessibility
N/A

## Mobile
N/A

## Complexity: N/A
## Priority: Low

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Ready for implementation (no animation to implement)

---

# Article: The Figma LLM Problem

## Article File
`src/articles/figma-llm-problem.md`

## Article Summary
Analyzes why LLM-generated code from Figma MCP data is often inaccurate. The core problem: visual truth (screenshot shows perfect design) vs structural truth (metadata exposes messy nesting, generic names, absolute positioning). Covers Frames not mapping to HTML elements, over-nesting from design convenience, and how clean semantic Figma structure directly improves LLM code quality. A diagnostic/analytical article.

## Animation Necessity
The visual truth vs structural truth comparison benefits from a simple side-by-side showing a clean Figma node tree vs a messy one, and how each maps to HTML. However this is minimal and optional ó the article is text-heavy analysis.

## Animation Type
Lightweight motion enhancement

## Animation Scope
- A simple two-panel comparison: Clean Figma structure vs Messy structure
- Each panel shows a node tree and the resulting HTML element mapping
- Arrows connect Figma nodes to HTML elements; messy structure shows many unmapped nodes

## Controls
- Toggle: Clean vs Messy structure

## Step Plan
No discrete step system required.

## Visual Behavior Rules
- Figma nodes: rect width 100 height 24 rx 2, fill #1F2937, labeled with name; clean: semantic names (Button, CardTitle, HeroSection); messy: generic names (Frame 42, Group 7, Frame 43)
- HTML output nodes: rect width 80 height 24, fill #064E3B stroke #10B981; labeled with tag name
- Mapping arrows: path stroke #10B981 opacity 0.6 for clean structure; stroke #EF4444 opacity 0.4 and dashed for mismatched; no arrows for unmapped nodes
- Unmapped nodes in messy structure: fill #450A0A stroke #EF4444 dashed; labeled with question mark
- Clean panel: 4 nodes, all mapped with green arrows, 200ms staggered reveal
- Messy panel: 7 nodes, only 2 mapped, 5 unmapped with red marks; on toggle 400ms staggered

## Technical Implementation
- SVG structure: Two svg viewBox 0 0 320 280 side-by-side
- Animation: Toggle class changes + CSS transitions 200ms
- Reuses: None
- Performance: All CSS transitions

## Accessibility
- prefers-reduced-motion: Instant state change on toggle
- Keyboard: Toggle button keyboard accessible
- Contrast: WCAG AA

## Mobile
- Stack panels vertically; reduce to 3 nodes each; viewBox 0 0 280 200

## Complexity: Simple
## Priority: Low

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

# Group 7: What-Is / What-Are Explainer Articles

## Overview
26 short explainer articles. Most reuse shared components directly. Two articles need no animation.

---

## Article: what-is-call-stack

## Summary
Explains the call stack as LIFO structure tracking function execution context.

## Animation Necessity
YES ó call stack push/pop is inherently sequential and visual.

## Type: Scroll-triggered, interactive (play/reset button)

## Scope: Inline SVG, 480x320px

## Controls: Play / Reset

## Step Plan

1. Initial ó empty stack frame, label "Call Stack" at top.
2. Step 1 (0-600ms) ó main() frame slides up into stack, fill #374151.
3. Step 2 (700-1300ms) ó fetchData() frame slides up on top, fill #3B82F6.
4. Step 3 (1400-2000ms) ó parseJSON() frame slides up on top, fill #F59E0B.
5. Step 4 (2200-2800ms) ó parseJSON() pops: translateX(+220px) + opacity 0.
6. Step 5 (3000-3600ms) ó fetchData() pops same way.
7. Step 6 (3800-4200ms) ó main() pops, stack empty.
8. Auto-reset after 1s.

## Visual Behavior Rules
- Stack area: rect x=20 y=20 width=200 height=280, stroke #4B5563, fill #111827
- Frame rect: width=196 height=56, rx=4
- Frame label: font-size 13px, fill #F9FAFB
- Pop: translateX(+220px) + opacity 0, 400ms ease-in
- Push: translateY from +60px to 0, 400ms ease-out
- prefers-reduced-motion: show final state immediately

## Technical Implementation
- SVG viewBox="0 0 480 320"
- JS array of frames, push/pop by index
- requestAnimationFrame for translation

## Accessibility
- role="img" aria-label="Call stack animation: functions pushed and popped in LIFO order"
- Pause on focus

## Mobile: Scale to 100% width, maintain aspect ratio

## Complexity: Simple
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-dom

## Summary
Explains the Document Object Model as a tree of nodes representing HTML structure.

## Animation Necessity
YES ó tree construction benefits from node-by-node reveal.

## Type: Scroll-triggered

## Scope: Inline SVG, 480x300px

## Controls: None (auto-play on scroll-enter)

## Step Plan

1. Initial ó single root html node visible, gray.
2. Step 1 (0-400ms) ó head and body nodes appear connected by lines.
3. Step 2 (400-800ms) ó title under head; header, main, footer under body.
4. Step 3 (800-1200ms) ó h1, p under main appear.
5. Final ó all nodes visible. Hover highlights node amber, tooltip shows type.

## Visual Behavior Rules
- Node: circle r=22, fill #1F2937, stroke #3B82F6 stroke-width=2
- Node label: font-size 10px, fill #93C5FD, text-anchor middle
- Edge: line stroke=#4B5563 stroke-width=1.5
- Appear: opacity 0 to 1 + scale 0.5 to 1, 300ms ease-out
- Hover: stroke #F59E0B, transition 150ms
- prefers-reduced-motion: all nodes visible from start

## Technical Implementation
- SVG viewBox="0 0 480 300"
- Pre-computed node positions
- IntersectionObserver triggers staggered class additions

## Accessibility
- aria-label="DOM tree diagram: html root with head and body branches"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-cssom

## Summary
Explains CSSOM and how DOM + CSSOM merge into the Render Tree.

## Animation Necessity
YES ó the merge step is the key concept.

## Type: Scroll-triggered

## Scope: Inline SVG, 520x340px

## Controls: None

## Step Plan

1. Initial ó two columns: DOM Tree (blue nodes), CSSOM Tree (violet nodes). Both muted.
2. Step 1 (0-600ms) ó DOM nodes illuminate #3B82F6.
3. Step 2 (700-1300ms) ó CSSOM nodes illuminate #8B5CF6.
4. Step 3 (1500-2200ms) ó arrows converge to center Render Tree (#10B981 nodes).
5. Final ó non-visible nodes shown crossed-out in DOM column, absent from Render Tree.

## Visual Behavior Rules
- DOM nodes: circle r=18, fill #1E3A5F, stroke #3B82F6
- CSSOM nodes: circle r=18, fill #2D1B69, stroke #8B5CF6
- Render nodes: circle r=20, fill #064E3B, stroke #10B981
- Arrow: path stroke=#9CA3AF stroke-width=1.5 marker-end=arrowhead
- Excluded node: stroke-through line, opacity 0.3
- prefers-reduced-motion: skip to final state

## Technical Implementation
- SVG viewBox="0 0 520 340"
- CSS class transitions for illuminate states
- SVG marker for arrowhead

## Accessibility
- aria-label="Diagram: DOM and CSSOM merge into Render Tree, excluding non-visible nodes"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-main-thread

## Summary
Explains the browser main thread as single-threaded executor handling JS, style, layout, and paint.

## Animation Necessity
YES ó blocking vs non-blocking tasks on a single timeline is the core concept.

## Type: Scroll-triggered

## Scope: Inline SVG, 500x200px

## Controls: None

## Step Plan

1. Initial ó single horizontal lane labeled "Main Thread", empty.
2. Step 1 (0-500ms) ó task blocks appear left to right: Parse HTML (green, 80px wide), Style (violet, 40px), Layout (blue, 60px), Paint (amber, 50px).
3. Step 2 (700-1400ms) ó a Long Task block appears (red, 180px wide) labeled "Long Task (JS)". Input event icon appears above it with a block symbol ó illustrating input is queued.
4. Step 3 (1600-2000ms) ó Long Task ends, queued input event processes (amber flash).
5. Label "16ms frame budget" vertical dashed lines at every 160px.

## Visual Behavior Rules
- Lane: rect y=80 height=40, fill #1F2937, stroke #374151
- Task blocks: rect height=40, rx=2, fill per type
- Long Task: fill #EF4444 with diagonal stripe pattern (pattern element, 4px stripes)
- Input icon: circle r=8 fill #F59E0B + cursor svg icon, y=50
- Block symbol: red X over input icon during Long Task
- Frame lines: line stroke=#4B5563 stroke-dasharray="4 4" opacity=0.5
- Label: font-size 10px fill #9CA3AF
- prefers-reduced-motion: static diagram all tasks visible

## Technical Implementation
- SVG viewBox="0 0 500 200"
- SVG pattern element for Long Task stripes
- CSS animation for task block width expansion (clip-path or width transition)

## Accessibility
- aria-label="Main thread timeline: normal tasks followed by a long task blocking user input"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-microtask-queue

## Summary
Explains microtask queue and how it drains before next macrotask, key to Promise execution order.

## Animation Necessity
YES ó reuses QueueVisualizer + CallStackVisualizer side-by-side.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 560x340px

## Controls: Step / Reset

## Step Plan

1. Initial ó three zones: Call Stack (left), Microtask Queue (center), Macrotask Queue (right). All empty.
2. Step 1 ó setTimeout callback enters Macrotask Queue (amber).
3. Step 2 ó Promise.resolve().then callback enters Microtask Queue (blue).
4. Step 3 ó Call Stack runs: top frame finishes. Microtask Queue drains first (blue item moves to Call Stack, executes, leaves).
5. Step 4 ó Macrotask Queue item enters Call Stack (amber).
6. Counter shows "Microtasks: 1, Macrotasks: 1 ó microtask ran first".

## Visual Behavior Rules
- Call Stack: same as CallStackVisualizer component
- Microtask Queue: rect x=200, fill #1E3A5F, stroke #3B82F6
- Macrotask Queue: rect x=380, fill #3B1F00, stroke #F59E0B
- Item movement: cubic-bezier path animation from source to destination rect
- Step label: font-size 11px fill #D1D5DB center-bottom
- prefers-reduced-motion: instant position changes, no path animation

## Technical Implementation
- SVG viewBox="0 0 560 340"
- Path-based motion animation using SVG animateMotion or JS translate
- State machine: 6 steps, Step button advances index

## Accessibility
- aria-label="Animation: microtask queue drains before macrotask queue after call stack empties"

## Mobile: Scale to 100% width, stacked layout at <400px

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-preload-scanner

## Summary
Explains how the browser's preload scanner runs in parallel with the HTML parser to discover resources early.

## Animation Necessity
YES ó two-lane parallel timeline is the critical insight.

## Type: Scroll-triggered

## Scope: Inline SVG, 500x220px

## Controls: None

## Step Plan

1. Initial ó two horizontal lanes: "HTML Parser" (top) and "Preload Scanner" (bottom). Both empty.
2. Step 1 (0-400ms) ó HTML Parser begins, green block expanding right.
3. Step 2 (300ms) ó HTML Parser hits render-blocking script, turns red, stops expanding.
4. Simultaneously (300ms) ó Preload Scanner lane activates (blue block), scans ahead discovering img src and link href.
5. Network requests appear as small downward arrows from Scanner lane at the discovered resource positions.
6. Step 3 (900ms) ó Script finishes loading, HTML Parser resumes (green).
7. Resources discovered by scanner already loading or cached.

## Visual Behavior Rules
- Lane rect: height=36, fill #1F2937, stroke #374151
- Parser active: fill #10B981 blocks expanding via clip-path
- Parser blocked: fill #EF4444 pulse (opacity 0.7 to 1.0, 600ms loop)
- Scanner: fill #3B82F6 block, runs from x=100 to x=460
- Resource arrows: line y1=top-of-scanner y2=bottom-of-scanner+30, stroke #8B5CF6, marker-end arrowhead, stagger 100ms each
- Lane labels: font-size 11px fill #9CA3AF
- prefers-reduced-motion: static two-lane diagram

## Technical Implementation
- SVG viewBox="0 0 500 220"
- clip-path width animation for block expansion
- CSS keyframes for blocked pulse

## Accessibility
- aria-label="Preload scanner runs in parallel with HTML parser, discovering resources while parser is blocked"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-requestanimationframe

## Summary
Explains rAF as the browser-native animation timing hook, contrasted with setInterval.

## Animation Necessity
YES ó the jank of setInterval vs smoothness of rAF is the whole point.

## Type: Scroll-triggered + interactive (toggle between modes)

## Scope: Inline SVG, 500x260px

## Controls: Toggle "setInterval" / "requestAnimationFrame"

## Step Plan

**setInterval mode:**
1. A ball moves right in a lane. Timer fires every 20ms but frame rate is 60fps (16.67ms). Ball jumps in irregular increments, skips frames. Frame grid shows some frames with no update, others with double-updates.

**rAF mode:**
1. Same ball moves right. Update fires once per frame exactly. Ball moves smoothly, one update per frame grid cell.

Visual: two lanes stacked. Top = setInterval (choppy), Bottom = rAF (smooth). Toggle switches active lane.

## Visual Behavior Rules
- Lane: rect height=50, fill #1F2937, stroke #374151
- Ball: circle r=14, fill #3B82F6 (rAF) or #EF4444 (setInterval)
- Frame grid: vertical lines every 16.67px width, stroke #374151 opacity=0.4
- setInterval ball: JS timer with Math.random()*4 jitter per step
- rAF ball: requestAnimationFrame loop, exactly 2px per frame
- Jank indicator: red glow on setInterval ball when it skips a frame
- Label: "setInterval (jank)" fill #EF4444, "rAF (smooth)" fill #10B981
- Toggle button: fills #3B82F6, border-radius 4px, 14px font

## Technical Implementation
- Real JS animation inside SVG foreignObject or canvas overlay
- setInterval at 20ms driving circle cx attribute
- rAF loop driving circle cx attribute
- Both run simultaneously; toggle shows/hides lanes

## Accessibility
- aria-label="Comparison: setInterval causes jank; requestAnimationFrame syncs to display refresh"
- prefers-reduced-motion: static diagram showing both balls at midpoint

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-fcp

## Summary
Explains First Contentful Paint ó when the browser first renders any text or image.

## Animation Necessity
YES ó MetricGauge + timeline showing paint moment is perfect.

## Type: Scroll-triggered

## Scope: Inline SVG, 480x280px

## Controls: None

## Step Plan

1. Initial ó empty browser chrome mockup (address bar, blank content area). Timeline bar at bottom, 0ms.
2. Step 1 (0-600ms) ó timeline advances. Page blank.
3. Step 2 (600-900ms) ó HTML parsed. Still blank (CSS not loaded).
4. Step 3 (900-1200ms) ó CSS loads. First text appears in content area (fade in). FCP marker fires on timeline (vertical amber line labeled "FCP: 1.1s").
5. MetricGauge needle sweeps from 0 to position corresponding to 1.1s, color green (good range).
6. FCP label below gauge: "1.1s" in green.

## Visual Behavior Rules
- Browser chrome: rect fill #1F2937 stroke #374151, address bar rect fill #374151
- Content area: rect fill #111827
- Text lines: rect width=120 height=8 rx=2 fill #F9FAFB, staggered appear
- Timeline bar: rect y=240 height=12 fill #374151 stroke none, full width
- FCP marker: line stroke=#F59E0B stroke-width=2, label font-size 10px fill #F59E0B
- MetricGauge: reuse MetricGauge component, needle at ~35% arc
- prefers-reduced-motion: static with all elements visible, FCP marker shown

## Technical Implementation
- SVG viewBox="0 0 480 280"
- CSS animation sequence tied to scroll-trigger
- MetricGauge component embedded

## Accessibility
- aria-label="First Contentful Paint animation: browser renders first text at 1.1 seconds"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-ttfb

## Summary
Explains Time to First Byte ó the latency between request and first byte of response.

## Animation Necessity
YES ó WaterfallChart reuse showing request lifecycle, TTFB phase highlighted.

## Type: Scroll-triggered

## Scope: Inline SVG, 480x200px

## Controls: None

## Step Plan

1. Single waterfall row for the HTML document request.
2. Phases expand left-to-right in sequence:
   - DNS (20px, gray)
   - TCP Connect (20px, gray)
   - TLS (20px, gray)
   - Request Sent (10px, blue)
   - Waiting TTFB (120px, green highlighted, pulsing during expansion)
   - Content Download (40px, blue)
3. TTFB bracket appears above the TTFB phase with label "TTFB = 380ms".
4. After all phases: total time label at end.

## Visual Behavior Rules
- All phases: same WaterfallChart component colors
- TTFB phase: fill #10B981, stroke #34D399 stroke-width=1 (glow)
- TTFB bracket: path above bar, stroke #F59E0B stroke-width=1.5, label fill #F59E0B font-size 11px
- Expansion: clip-path right-to-left reveal, 200ms per phase, staggered
- prefers-reduced-motion: all phases visible, no expansion animation

## Technical Implementation
- SVG viewBox="0 0 480 200"
- Reuse WaterfallChart row rendering logic
- Bracket path computed from phase x/width

## Accessibility
- aria-label="TTFB waterfall: DNS, TCP, TLS, request, then waiting for first byte highlighted at 380ms"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-cdn

## Summary
Explains CDN as globally distributed edge nodes serving content closer to users.

## Animation Necessity
YES ó geographic routing paths make the CDN benefit concrete.

## Type: Scroll-triggered

## Scope: Inline SVG, 520x300px

## Controls: Toggle "No CDN" / "With CDN"

## Step Plan

**No CDN mode:**
1. World map outline (simplified continents as paths). Origin server dot in US (amber).
2. User dots in Europe, Asia, South America.
3. Request lines from each user to origin server ó long paths, labeled with latency "320ms", "490ms", "280ms".

**With CDN mode:**
1. Same map. Edge node dots appear across Europe (blue), Asia-Pacific (blue), South America (blue).
2. Request lines now go to nearest edge node ó short paths, labeled "28ms", "35ms", "22ms".
3. Origin server shown with dashed line to edge nodes (cache fill).

Toggle animates: old lines fade, new lines draw in.

## Visual Behavior Rules
- World map: simplified path outlines, fill #1F2937 stroke #374151
- Origin server: circle r=10 fill #F59E0B stroke #FCD34D
- Edge nodes: circle r=8 fill #3B82F6 stroke #93C5FD, appear on CDN mode
- Request lines: path stroke=#9CA3AF stroke-width=1 stroke-dasharray="4 4", animated stroke-dashoffset
- CDN request lines: stroke=#10B981 stroke-width=1.5
- Latency labels: font-size 10px fill matching line color
- Toggle button: fills #3B82F6
- prefers-reduced-motion: static comparison, both states shown stacked

## Technical Implementation
- SVG viewBox="0 0 520 300"
- Simplified continent outlines as SVG paths
- Stroke-dashoffset animation for line draw
- Toggle switches classes between no-cdn and cdn states

## Accessibility
- aria-label="CDN diagram: without CDN requests travel far to origin; with CDN requests go to nearby edge nodes"

## Mobile: Scale to 100% width, reduce node count to 4

## Complexity: Medium
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-jit-compilation

## Summary
Explains JIT compilation pipeline: interpret hot code, profile, optimise, deoptimise on assumption failure.

## Animation Necessity
YES ó PipelineSteps showing the three-way path (cold/warm/hot) is the core mental model.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 520x320px

## Controls: Step / Reset

## Step Plan

1. Initial ó source code box on left.
2. Step 1 ó Parser: source to AST (arrow, label "Parse").
3. Step 2 ó Ignition (Interpreter): AST to bytecode. Label "Run & Profile". Function call counter appears.
4. Step 3 ó Counter reaches threshold (e.g. 100 calls). Label "Hot function detected".
5. Step 4 ó TurboFan (Optimising compiler): bytecode to machine code. Arrow labeled "Optimise". Output box glows green.
6. Step 5 ó Assumption failure scenario: red arrow from machine code back to bytecode, label "Deoptimise".
7. Path branches: hot path (green arrow to TurboFan), cold path (gray arrow stays at Ignition).

## Visual Behavior Rules
- Boxes: rect width=100 height=44 rx=6 fill #1F2937 stroke per stage
- Source: stroke #9CA3AF
- Ignition: stroke #3B82F6
- TurboFan: stroke #10B981
- Machine code: stroke #8B5CF6
- Arrows: marker-end arrowhead, stroke per source
- Hot path arrow: stroke #10B981 stroke-width=2
- Deopt arrow: stroke #EF4444 stroke-width=1.5 stroke-dasharray="6 3"
- Counter badge: circle r=14 fill #F59E0B, counter text font-size=11
- prefers-reduced-motion: all boxes visible, no step animation

## Technical Implementation
- SVG viewBox="0 0 520 320"
- State machine: 7 steps
- Step button advances, Reset returns to step 0
- Counter animates 0 to 100 during step 4

## Accessibility
- aria-label="JIT pipeline: parse to bytecode, profile for hot functions, optimise to machine code, deoptimise on failure"

## Mobile: Scale to 100% width, stack boxes vertically

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-cache-control

## NO ANIMATION NEEDED
The article explains HTTP header syntax and directive semantics (max-age, no-store, stale-while-revalidate, etc.). A static reference table communicates this better than any animation. No SVG needed.

---

## Article: what-is-stale-while-revalidate

## Summary
Explains the stale-while-revalidate cache strategy: serve stale immediately, refresh in background.

## Animation Necessity
YES ó two-path flow showing parallel serve + background refresh is the key insight.

## Type: Scroll-triggered

## Scope: Inline SVG, 500x280px

## Controls: None

## Step Plan

1. Initial ó browser icon on left, cache box in center, server on right. All idle.
2. Step 1 (0-400ms) ó request arrow from browser to cache.
3. Step 2 (400-700ms) ó cache has stale entry (amber glow). Arrow from cache to browser: "Serve stale immediately" (amber label).
4. Simultaneously (400-700ms) ó background arrow from cache to server: "Revalidate in background" (gray dashed).
5. Step 3 (900-1300ms) ó server responds (blue arrow to cache). Cache updates (green flash).
6. Step 4 ó next request arrow from browser hits cache, gets fresh response (green arrow to browser).
7. Labels: "First request: stale" / "Next request: fresh"

## Visual Behavior Rules
- Browser icon: simplified rect + screen fill #1F2937 stroke #3B82F6
- Cache box: rect width=80 height=60, fill #1F2937, stroke #F59E0B when stale, stroke #10B981 when fresh
- Server icon: rect fill #1F2937 stroke #8B5CF6
- Arrows: path stroke per color, marker-end arrowhead
- Dashed arrow: stroke-dasharray="6 3" stroke=#9CA3AF
- Flash: opacity pulse 0.4 to 1.0, 300ms, 2 cycles
- Labels: font-size 11px fill per type
- prefers-reduced-motion: static diagram showing both paths

## Technical Implementation
- SVG viewBox="0 0 500 280"
- CSS animation sequence with delays
- Parallel animation branches using animation-delay

## Accessibility
- aria-label="Stale-while-revalidate: browser gets stale response immediately while cache revalidates in background"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-dns

## Summary
Explains DNS resolution: recursive lookup through resolver, root, TLD, authoritative nameserver, with caching.

## Animation Necessity
YES ó PipelineSteps with cache-hit short-circuit shows both the full path and the fast path.

## Type: Scroll-triggered, interactive (toggle cache-miss / cache-hit)

## Scope: Inline SVG, 540x280px

## Controls: Toggle "First Visit" / "Cached"

## Step Plan

**First Visit (cache-miss):**
1. Browser sends query to Recursive Resolver (arrow).
2. Resolver asks Root Nameserver (arrow).
3. Root refers to .com TLD server (arrow).
4. TLD refers to Authoritative NS (arrow).
5. Authoritative NS returns IP address (return arrows, green).
6. Resolver caches result, returns to browser.
7. Labels show latency at each hop: "12ms", "8ms", "6ms", "4ms". Total: "30ms".

**Cached:**
1. Browser sends query. Resolver has cached result (green glow).
2. Single return arrow browser to resolver to browser: "0.2ms".

## Visual Behavior Rules
- Each server: rect width=80 height=40 rx=4, fill #1F2937, stroke per role
- Resolver: stroke #3B82F6
- Root: stroke #8B5CF6
- TLD: stroke #F59E0B
- Auth NS: stroke #10B981
- Query arrows: stroke #9CA3AF stroke-width=1.5, dashed stroke-dasharray="4 3"
- Return arrows: stroke #10B981 stroke-width=1.5 solid
- Cache hit arrow: stroke #F59E0B stroke-width=2
- Latency labels: font-size 10px fill #D1D5DB
- prefers-reduced-motion: static diagram, first-visit state shown

## Technical Implementation
- SVG viewBox="0 0 540 280"
- Stroke-dashoffset animation for arrow draw
- Toggle hides/shows server rows via opacity transition

## Accessibility
- aria-label="DNS resolution: browser queries resolver, then root, TLD, and authoritative nameserver; cached queries skip to resolver"

## Mobile: Scale to 100% width, reduce to vertical stack

## Complexity: Medium
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-debouncing

## Summary
Explains debouncing: delaying execution until input stops for a set interval.

## Animation Necessity
YES ó debounce timeline from article 18 can be reused directly.

## Type: Scroll-triggered

## Scope: Inline SVG, 500x180px (reuse debounce lane from article 18)

## Controls: None (auto-play on scroll-enter)

## Step Plan
Identical to debounce lane in article 18 (what-is-intersection-observer-debounce-throttle):
1. Input event ticks appear on a timeline.
2. Each tick resets the debounce timer (orange arrow resets).
3. After final tick, timer counts down (dashes).
4. Handler fires once (green flash at end).

## Visual Behavior Rules
- Reuse exact visual rules from article 18 debounce section
- Event ticks: circle r=6 fill #3B82F6
- Timer reset arrow: arc above timeline stroke #F59E0B
- Handler fire: circle r=10 fill #10B981 + radial glow

## Technical Implementation
- Extract and reuse debounce SVG component from article 18 implementation
- Single IntersectionObserver trigger

## Accessibility
- aria-label="Debounce: handler fires only after input stops for 300ms"

## Mobile: Scale to 100% width

## Complexity: Simple (reuse)
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-throttling

## Summary
Explains throttling: executing handler at most once per interval regardless of input rate.

## Animation Necessity
YES ó throttle timeline from article 18 can be reused directly.

## Type: Scroll-triggered

## Scope: Inline SVG, 500x180px (reuse throttle lane from article 18)

## Controls: None

## Step Plan
Identical to throttle lane in article 18:
1. Rapid input events on timeline.
2. Handler fires at fixed intervals (green dots at regular spacing).
3. Events between fires are ignored (gray ticks).

## Visual Behavior Rules
- Reuse exact visual rules from article 18 throttle section
- Input ticks: circle r=6 fill #3B82F6
- Ignored ticks: opacity 0.25
- Handler fires: circle r=10 fill #10B981 at evenly spaced intervals

## Technical Implementation
- Extract and reuse throttle SVG component from article 18

## Accessibility
- aria-label="Throttle: handler fires at most once every 300ms regardless of input rate"

## Mobile: Scale to 100% width

## Complexity: Simple (reuse)
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-virtual-dom

## Summary
Explains React's Virtual DOM as an in-memory JS object tree, diffed against real DOM to minimise mutations.

## Animation Necessity
YES ó TreeDiff component reuse showing vDOM old vs new vs real DOM patch.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 540x320px

## Controls: Step / Reset

## Step Plan

1. Initial ó two trees side by side: "vDOM (old)" and "vDOM (new)". Real DOM row at bottom.
2. Step 1 ó old and new trees visible, identical structure.
3. Step 2 ó one node in "new" tree changes (text change): highlight amber.
4. Step 3 ó diff algorithm runs: unchanged nodes gray, changed node amber, deleted node red, added node green.
5. Step 4 ó only the changed node's mutation arrow points to Real DOM below. One DOM update fires.
6. Label: "1 DOM mutation" vs "N vDOM operations".

## Visual Behavior Rules
- Reuse TreeDiff component colors and node shapes
- vDOM nodes: circle r=18
- Real DOM row: rect nodes width=60 height=32 rx=4, fill #064E3B stroke #10B981
- Mutation arrow: stroke #10B981 stroke-width=2, marker-end arrowhead
- Unchanged: fill #374151 opacity=0.5
- Changed: fill #92400E stroke #F59E0B
- Step label bottom: font-size 11px fill #9CA3AF
- prefers-reduced-motion: static final state

## Technical Implementation
- SVG viewBox="0 0 540 320"
- Reuse TreeDiff component
- State machine: 4 steps

## Accessibility
- aria-label="Virtual DOM: old and new vDOM trees are diffed, only changed node is patched in real DOM"

## Mobile: Scale to 100% width

## Complexity: Simple (reuse)
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-react-fiber

## Summary
Explains React Fiber as the reconciler architecture enabling incremental rendering and priority scheduling.

## Animation Necessity
YES ó reuse concurrent rendering panel from article 23 (react-performance-patterns).

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 540x300px

## Controls: Step / Reset

## Step Plan

1. Initial ó single long task bar labeled "Old Reconciler: render to completion" (red, blocking).
2. Step 1 ó contrast: Fiber mode. Long render broken into small units (fiber work units shown as small blue blocks).
3. Step 2 ó between fiber blocks: input event (amber flash) is handled ó main thread yields.
4. Step 3 ó render resumes, completes.
5. Step 4 ó priority label: high-priority update (user input) shown jumping queue.
6. Labels: "Blocking" vs "Interruptible", "No interruption" vs "Input handled at 8ms".

## Visual Behavior Rules
- Old reconciler bar: rect height=40 fill #EF4444 width=380 (full width)
- Fiber units: rect width=28 height=40 fill #3B82F6, gap=4px between units, 10 units total
- Input event flash: circle r=14 fill #F59E0B, pop animation scale 0.5 to 1.5 to 1, 300ms
- Resume continuation: amber dashed line connecting fiber units after input
- Labels: font-size 11px fill #D1D5DB
- prefers-reduced-motion: static showing both rows, all fiber units visible

## Technical Implementation
- SVG viewBox="0 0 540 300"
- Reuse concurrent mode visualization from article 23
- State machine: 4 steps

## Accessibility
- aria-label="React Fiber: old reconciler blocked input; Fiber breaks work into units, yielding to input events"

## Mobile: Scale to 100% width

## Complexity: Simple (reuse)
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-reconciliation

## Summary
Explains React's reconciliation algorithm: diffing vDOM trees to find minimal real DOM mutations.

## Animation Necessity
YES ó TreeDiff component reuse, focused on the diffing algorithm rules.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 540x300px (reuse TreeDiff)

## Controls: Step / Reset

## Step Plan

1. Initial ó two trees: "Previous Render" and "Next Render". Identical.
2. Step 1 ó element type change: div becomes span at one node. Red highlight.
3. Step 2 ó entire subtree torn down and rebuilt (red X on old subtree, green new subtree appears).
4. Step 3 ó list with keys: items reorder. Key-matched items animate to new positions. No teardown.
5. Step 4 ó list without keys: all items re-render (amber highlight on all nodes).
6. Labels explain each rule as it plays.

## Visual Behavior Rules
- Reuse all TreeDiff visual rules
- Type-change node: fill #7F1D1D stroke #EF4444
- Subtree teardown: opacity 0, scale 0.8, 300ms ease-in
- New subtree: opacity 0 to 1, scale 0.8 to 1, 300ms ease-out
- Key move: path animation from old position to new position, stroke #10B981 dashed
- No-key re-render: all nodes pulse amber, 400ms

## Technical Implementation
- SVG viewBox="0 0 540 300"
- Reuse TreeDiff component
- State machine: 4 steps

## Accessibility
- aria-label="Reconciliation: type changes cause full subtree rebuild; keyed lists move efficiently; unkeyed lists re-render all"

## Mobile: Scale to 100% width

## Complexity: Simple (reuse)
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-hydration

## Summary
Explains React hydration: server sends HTML, client JS attaches event handlers without re-rendering.

## Animation Necessity
YES ó TimelineBar with two-phase sequence: server HTML arrives, hydration gap, interactive.

## Type: Scroll-triggered

## Scope: Inline SVG, 500x260px

## Controls: None

## Step Plan

1. Initial ó timeline starting at 0ms.
2. Phase 1 (0-800ms) ó "HTML from Server" block (green, expanding). Page mockup shows text content appearing.
3. Phase 2 (800-1200ms) ó "Hydration Gap" (red, hatched) ó content visible but not interactive. Click icon with X above page.
4. Phase 3 (1200-1800ms) ó "JS Bundle Downloads" (blue block). Spinner on page.
5. Phase 4 (1800-2200ms) ó "Hydrate" (amber block). Event handlers attach (node highlights flash).
6. Phase 5 (2200+) ó "Interactive" (green). Click icon shows success.
7. Labels below timeline at each phase boundary.

## Visual Behavior Rules
- TimelineBar phases: same color system as Group 1 CRP visualization
- Hydration gap: fill #7F1D1D, diagonal stripe pattern
- Page mockup: rect 160x100 right side, content lines appear/disappear per phase
- Interactive indicator: circle r=14 fill #10B981 checkmark inside
- Block: rect fill #374151 stroke none, click icon: path cursor shape fill #F9FAFB
- prefers-reduced-motion: static showing all phases labeled, no expansion

## Technical Implementation
- SVG viewBox="0 0 500 260"
- Reuse TimelineBar component
- clip-path expansion for each phase block

## Accessibility
- aria-label="Hydration timeline: server HTML visible immediately, JS downloads, then React attaches handlers"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-react-suspense

## Summary
Explains React Suspense: declarative loading state management with fallback UI while async data/code loads.

## Animation Necessity
YES ó StateTransitionDiagram with three states: Loading, Resolved, Error.

## Type: Scroll-triggered, interactive (toggle outcomes)

## Scope: Inline SVG, 480x280px

## Controls: Toggle "Success" / "Error"

## Step Plan

**Success flow:**
1. Initial ó component in "Loading" state. Suspense boundary shows fallback (spinner rect amber).
2. Transition ó data resolves. Spinner fades, content fades in (green).
3. Final ó "Resolved" state. Content displayed.

**Error flow:**
1. Initial ó same Loading state.
2. Transition ó data rejects. Error boundary catches (red border on container).
3. Final ó "Error" state. Error UI shown (red).

State machine nodes: Loading (amber), Resolved (green), Error (red). Arrows between states.

## Visual Behavior Rules
- State nodes: rect width=100 height=44 rx=6 per StateTransitionDiagram component
- Loading: fill #92400E stroke #F59E0B, spinner path inside (rotate 360 loop)
- Resolved: fill #064E3B stroke #10B981
- Error: fill #7F1D1D stroke #EF4444
- Transition arrows: stroke matching target state
- Component mockup: rect 140x80 right side, content swaps per state
- Fallback label: font-size 11px fill #F59E0B "Suspense fallback"
- prefers-reduced-motion: static showing all three states

## Technical Implementation
- SVG viewBox="0 0 480 280"
- Reuse StateTransitionDiagram component
- Toggle button switches active path via CSS class

## Accessibility
- aria-label="React Suspense: Loading state shows fallback; resolves to content or catches in Error boundary"

## Mobile: Scale to 100% width

## Complexity: Simple (reuse)
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-streaming-ssr

## Summary
Explains streaming SSR: server sends HTML in chunks as it renders, browser can display and parse progressively.

## Animation Necessity
YES ó two-row TimelineBar comparing traditional SSR vs streaming SSR.

## Type: Scroll-triggered

## Scope: Inline SVG, 520x260px

## Controls: None

## Step Plan

**Traditional SSR row:**
1. Server renders entire page (long block, blue, 0-1800ms).
2. HTML arrives all at once (single large block).
3. Browser parses and displays (green, 1800-2200ms).
4. FCP at 1.8s marker.

**Streaming SSR row:**
1. Server starts sending first chunk immediately (small blue block, 0-400ms).
2. Browser renders shell (green, 400-600ms). FCP at 400ms marker.
3. More chunks arrive and render progressively (alternating small blue + green blocks).
4. Page fully rendered at 1800ms but content visible from 400ms.

FCP comparison label: "Traditional: 1.8s" vs "Streaming: 0.4s".

## Visual Behavior Rules
- Row labels: font-size 11px fill #9CA3AF, left-aligned
- Traditional row: single large blue rect width=220px at offset
- Streaming chunks: 5 smaller blue rects with green render blocks interleaved
- FCP marker: vertical line stroke=#F59E0B at respective x positions, label above
- Time ruler: same as WaterfallChart ruler
- prefers-reduced-motion: static two-row diagram, all blocks visible

## Technical Implementation
- SVG viewBox="0 0 520 260"
- Reuse TimelineBar component for each row
- clip-path expansion animations staggered

## Accessibility
- aria-label="Streaming SSR comparison: traditional SSR shows content at 1.8s; streaming shows first content at 400ms"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-are-compositing-layers

## Summary
Explains browser compositing layers: elements promoted to their own GPU layer, composited without triggering layout or paint.

## Animation Necessity
YES ó LayerStack component showing layer promotion and compositing.

## Type: Scroll-triggered, interactive (toggle promoted / not promoted)

## Scope: Inline SVG, 480x320px

## Controls: Toggle "No layer" / "Promoted"

## Step Plan

**No layer promotion:**
1. Element animates transform. Every frame: Layout check (amber flash), Paint (red flash), Composite (blue).
2. Three-step cost shown per frame.

**Promoted (will-change: transform):**
1. Element on own layer (LayerStack shows it elevated). Animate transform.
2. Only Composite step fires per frame (blue). Layout and Paint skipped (gray, crossed out).
3. GPU icon appears next to layer.

LayerStack component shows stacked semi-transparent planes.

## Visual Behavior Rules
- Reuse LayerStack component: each layer = parallelogram, fill rgba(59,130,246,0.15) stroke #3B82F6
- Active layer: stroke #10B981 glow (filter: drop-shadow 0 0 4px #10B981)
- GPU badge: rect fill #8B5CF6 label "GPU" font-size 10px
- Pipeline step badges: rect width=64 height=24 rx=3 per step, fill per state
- Skipped step: fill #374151 opacity=0.3, strikethrough line
- Frame counter: cycles at 60fps (16ms per frame) shown as small ticker
- prefers-reduced-motion: static showing both states side by side

## Technical Implementation
- SVG viewBox="0 0 480 320"
- Reuse LayerStack component
- Toggle button switches active state class

## Accessibility
- aria-label="Compositing layers: promoted elements animate on GPU skipping layout and paint"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-are-long-tasks

## Summary
Explains Long Tasks (>50ms on main thread) and their impact on INP and user responsiveness.

## Animation Necessity
YES ó TimelineBar with long task blocking input events.

## Type: Scroll-triggered

## Scope: Inline SVG, 500x200px

## Controls: None

## Step Plan

1. Timeline ruler at top (0-500ms).
2. Main thread lane: normal short tasks (green blocks, 5-15px wide) interleaved with idle (dark gaps).
3. Long Task block appears (red, 240px wide = 200ms). Diagonal stripe fill.
4. During Long Task: two input event icons (click, keypress) appear above the bar with clock icons ó queued, not handled.
5. Long Task ends. Input events process (amber flash, sequential).
6. INP indicator: shows "INP: 210ms" label in red at end.

## Visual Behavior Rules
- Normal tasks: rect height=36 fill #10B981 rx=2, widths 8-20px
- Long Task: rect height=36 fill #EF4444, diagonal stripe SVG pattern
- Long Task label: font-size 10px fill #FCA5A5 "Long Task (200ms)"
- Input icons: circle r=10 fill #F59E0B, clock symbol inside
- INP label: font-size 12px fill #EF4444 bold, right-aligned
- 50ms threshold line: vertical dashed line stroke=#9CA3AF at x corresponding to 50ms
- prefers-reduced-motion: static diagram all elements visible

## Technical Implementation
- SVG viewBox="0 0 500 200"
- Reuse TimelineBar component
- SVG pattern for diagonal stripes on Long Task

## Accessibility
- aria-label="Long Tasks: a 200ms task blocks main thread, queuing two input events, causing 210ms INP"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-compositor-thread

## Summary
Explains the compositor thread: handles scroll and CSS transform animations independently of main thread.

## Animation Necessity
YES ó reuse article 04 (css-js-animations) compositor lane visualization.

## Type: Scroll-triggered

## Scope: Inline SVG, 520x240px

## Controls: None

## Step Plan

1. Two-lane diagram: Main Thread (top) and Compositor Thread (bottom).
2. Main Thread: busy (JS Long Task, red block 180px wide).
3. Simultaneously: Compositor Thread runs scroll animation + CSS transform (blue blocks, smooth).
4. Arrow from Raster tiles to Compositor Thread showing GPU compositing.
5. Label: "Scroll stays smooth even when main thread is busy".
6. Contrast: JS animation in main thread (red block) causes jank during Long Task.

## Visual Behavior Rules
- Reuse article 04 two-lane layout and color system
- Main Thread lane: fill #111827
- Long Task: fill #EF4444 diagonal stripe
- Compositor blocks: fill #3B82F6 rx=2, evenly spaced (60fps cadence)
- GPU icon: rect fill #8B5CF6 "GPU" label
- Lane labels: font-size 11px fill #9CA3AF
- prefers-reduced-motion: static diagram, both lanes visible

## Technical Implementation
- SVG viewBox="0 0 520 240"
- Reuse article 04 compositor visualization
- CSS animation for compositor blocks (translate loop)

## Accessibility
- aria-label="Compositor thread: scroll and transform animations run on compositor thread independently of a busy main thread"

## Mobile: Scale to 100% width

## Complexity: Simple (reuse)
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: what-is-css-specificity

## NO ANIMATION NEEDED
CSS specificity is a numeric calculation system (0-1-0, 1-0-0, etc.). A static specificity calculator table or scored example grid communicates this better than any animation. No SVG needed.

---

# End of Group 7

---

# Group 8: JavaScript Series ó Foundational

---

## Article: js-variables-scope-hoisting

## Summary
Covers var/let/const, scope (global/function/block), hoisting, and the Temporal Dead Zone.

## Animation Necessity
YES ó scope nesting and TDZ are spatial concepts that benefit from a visual scope chain.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 480x320px

## Controls: Step / Reset

## Step Plan

1. Initial ó three nested scope boxes: Global (outermost, gray border), Function (middle, blue border), Block (inner, amber border).
2. Step 1 ó var declaration: label "var x = 10" appears in Function scope. Arrow shows hoisting ó ghost of x floats to top of function scope with value undefined, then resolves to 10.
3. Step 2 ó let declaration: label "let y = 20" in Block scope. TDZ bracket shown above it from start-of-block to declaration line (red zone label).
4. Step 3 ó access attempt inside TDZ: red flash on block scope border + error label "ReferenceError: Cannot access y before init".
5. Step 4 ó scope chain lookup: a variable not found in block traces an arrow up to function scope, then global scope.

## Visual Behavior Rules
- Global scope: rect fill #111827 stroke #374151 rx=8
- Function scope: rect fill #1E293B stroke #3B82F6 rx=6, inset 24px each side
- Block scope: rect fill #1F2937 stroke #F59E0B rx=4, inset 24px further
- Var label: font-size 12px fill #93C5FD
- Hoisting ghost: opacity 0.4 fill #3B82F6, translateY animation from declaration to top
- TDZ bracket: path above let label, stroke #EF4444 stroke-width=1.5, label "TDZ" fill #EF4444 font-size 10px
- Error flash: scope border stroke #EF4444 + filter drop-shadow, 400ms, 2 pulses
- Lookup arrow: dashed path stroke=#9CA3AF marker-end arrowhead
- prefers-reduced-motion: static scope diagram with labels, no animation

## Technical Implementation
- SVG viewBox="0 0 480 320"
- Nested rects with padding
- State machine 5 steps
- Arrow path computed from source to parent scope rect

## Accessibility
- aria-label="Scope diagram: nested scopes for var, let, const with TDZ and scope chain lookup"

## Mobile: Scale to 100% width, reduce padding by 50%

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-this-demystified

## Summary
Covers the four `this` binding rules: default, implicit, explicit (call/apply/bind), new. Arrow function lexical binding.

## Animation Necessity
YES ó the four binding rules as a StateTransitionDiagram decision tree is the key mental model.

## Type: Scroll-triggered, interactive (toggle rule)

## Scope: Inline SVG, 520x300px

## Controls: Four rule buttons (Default / Implicit / Explicit / New)

## Step Plan

Each button activates one scenario:

**Default:** `showThis()` called standalone. Arrow points to Global (window/undefined in strict). Gray box lights up.

**Implicit:** `obj.method()` called. Arrow points from call site to `obj`. Blue box lights up. `this` = obj.

**Explicit:** `fn.call(ctx)`. Arrow points to ctx argument. Violet box lights up. `this` = ctx.

**New:** `new Fn()`. Arrow points to newly created object. Green box lights up. `this` = new instance.

Center: function call expression. Outer ring: four labeled boxes for each result.

## Visual Behavior Rules
- Function call box: rect center x=260 y=140 width=100 height=40 rx=6 fill #1F2937 stroke #9CA3AF
- Four result boxes: positioned at N/E/S/W of center, rect width=90 height=36 rx=4
- Default: fill #374151 stroke #6B7280 (top)
- Implicit: fill #1E3A5F stroke #3B82F6 (left)
- Explicit: fill #2D1B69 stroke #8B5CF6 (right)
- New: fill #064E3B stroke #10B981 (bottom)
- Active box: stroke-width=2.5 + glow filter
- Arrow: path stroke matching active box, marker-end arrowhead, 300ms draw
- Rule buttons: rect fill #1F2937 hover fill #374151, font-size 11px
- prefers-reduced-motion: all boxes visible, toggle changes active highlight only

## Technical Implementation
- SVG viewBox="0 0 520 300"
- Four-state toggle managed by button click handler
- Arrow path switches via display/opacity

## Accessibility
- aria-label="this binding rules: four scenarios determining what this refers to at call site"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-closures-lexical-scope

## Summary
Covers closures: inner functions retaining access to outer scope variables, memory model, practical patterns.

## Animation Necessity
YES ó ScopeChain component showing closure variable retention after outer function returns.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 500x320px

## Controls: Step / Reset

## Step Plan

1. Initial ó two scope boxes: outer() (blue) containing `const message = "hello"`, inner() (amber) inside outer.
2. Step 1 ó `outer()` called. Call stack shows outer frame pushed.
3. Step 2 ó `outer()` returns, popping its stack frame. But message box doesn't disappear ó it moves to a floating "Closure" bubble on the heap (dashed border, fill #1E3A5F).
4. Step 3 ó `inner()` called later. Arrow from inner to Closure bubble showing it still reads message.
5. Step 4 ó GC cannot collect message (amber lock icon on bubble). Label "message stays alive because inner references it".
6. Step 5 ó inner() reference dropped (fn = null). Lock icon disappears. Closure bubble fades (GC-eligible).

## Visual Behavior Rules
- Reuse ScopeChain component
- Outer scope: rect fill #1E293B stroke #3B82F6
- Inner scope: rect fill #1F2937 stroke #F59E0B
- Closure bubble: rect rx=12 fill #1E3A5F stroke #3B82F6 stroke-dasharray="6 3"
- Variable pill: rect fill #374151 width=120 height=24 rx=4, label fill #93C5FD font-size 11px
- GC lock: path lock icon fill #F59E0B x=bubble right corner
- Arrow: dashed path stroke #10B981
- Fade animation: opacity 1 to 0, 600ms ease-out on step 5
- prefers-reduced-motion: static showing closure bubble with all labels

## Technical Implementation
- SVG viewBox="0 0 500 320"
- Reuse ScopeChain component
- State machine 5 steps

## Accessibility
- aria-label="Closure animation: outer function returns but its variable stays alive on heap while inner function references it"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-prototypes-inheritance

## Summary
Covers prototype chain: __proto__, prototype property on functions, property lookup chain, Object.create, new.

## Animation Necessity
YES ó prototype chain as linked nodes is a classic visual.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 500x300px

## Controls: Step / Reset

## Step Plan

1. Initial ó three boxes stacked vertically: instance `naveen` (top, amber), `Person.prototype` (middle, blue), `Object.prototype` (bottom, violet). Lines connecting them.
2. Step 1 ó property access `naveen.name`: lookup starts at naveen box (green flash on name property). Found. Done.
3. Step 2 ó `naveen.greet()`: not on naveen, arrow traces down to Person.prototype. Found. Green flash.
4. Step 3 ó `naveen.toString()`: not on naveen, not on Person.prototype, arrow traces to Object.prototype. Found.
5. Step 4 ó `naveen.nonexistent`: traces all the way to Object.prototype.__proto__ = null. Red X.
6. Labels show `[[Prototype]]` on each arrow.

## Visual Behavior Rules
- Instance box: rect width=160 height=60 rx=6 fill #1F2937 stroke #F59E0B
- Prototype box: rect same size fill #1E3A5F stroke #3B82F6
- Object.prototype box: fill #2D1B69 stroke #8B5CF6
- Null terminator: text "null" fill #EF4444 x=right side
- Property pill: rect fill #374151 width=100 height=20 rx=3 inside box
- Active property: fill #064E3B stroke #10B981 green flash 300ms
- Lookup arrow: path stroke #9CA3AF stroke-dasharray="4 3" animated stroke-dashoffset
- Not-found X: path red X 24px right of null
- prefers-reduced-motion: static chain with all labels

## Technical Implementation
- SVG viewBox="0 0 500 300"
- Stroke-dashoffset animation for lookup arrow draw
- State machine 4 steps for lookup scenarios

## Accessibility
- aria-label="Prototype chain: property lookup traverses from instance to prototype to Object.prototype, ending at null"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-equality-coercion

## NO ANIMATION NEEDED
The article explains == vs === coercion rules via truth tables and type conversion examples. A static comparison table with highlighted cells communicates this better than animation. No SVG needed.

---

## Article: js-error-handling

## NO ANIMATION NEEDED
The article covers try/catch/finally, Error types, custom errors, and error propagation via code examples. No spatial or temporal concept requires animation. No SVG needed.

---

## Article: js-destructuring-spread-rest

## NO ANIMATION NEEDED
The article covers destructuring syntax patterns and spread/rest operators with runnable code examples. No SVG needed.

---

## Article: js-template-literals

## NO ANIMATION NEEDED
Short article covering template literal syntax, tagged templates. Code examples are the right medium. No SVG needed.

---

# Group 9: JavaScript Series ó Functions and Arrays

---

## Article: js-call-apply-bind

## Summary
Covers Function.prototype.call, apply, and bind ó explicit `this` binding with argument control.

## Animation Necessity
YES ó showing how the same function runs with different `this` contexts via call/apply/bind is a key spatial concept.

## Type: Scroll-triggered, interactive (toggle call / apply / bind)

## Scope: Inline SVG, 500x280px

## Controls: Three buttons (call / apply / bind)

## Step Plan

Each button shows one scenario. Center box = function `greet`. Context box = the `this` object being injected.

**call:** Arrow from `greet.call(person, arg1)` points to person. "this = person". Args passed individually (two pills slide in).

**apply:** Arrow same target. "this = person". Args array slides in as single group pill.

**bind:** Arrow shows new function created (dashed border box). New function has person locked in (lock icon). Call later arrows to execution.

## Visual Behavior Rules
- Function box: rect center fill #1F2937 stroke #8B5CF6 width=120 height=44 rx=6
- Context box: rect fill #1E3A5F stroke #3B82F6, positioned right of function
- Arg pills: rect width=40 height=20 rx=3 fill #374151 stroke #9CA3AF
- Bind result box: same as function box but stroke-dasharray="6 3" + lock icon
- Arrow: path stroke matching active mode, marker-end arrowhead
- Active button: fill #3B82F6 stroke none
- prefers-reduced-motion: static showing all three scenarios stacked

## Technical Implementation
- SVG viewBox="0 0 500 280"
- Three-state toggle
- Arrow paths switch via display

## Accessibility
- aria-label="call, apply, bind: explicit this binding with different argument passing patterns"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-currying-partial-application

## Summary
Covers currying: transforming f(a,b,c) into f(a)(b)(c), and partial application: pre-filling arguments.

## Animation Necessity
YES ó PipelineSteps showing argument accumulation across curried calls.

## Type: Scroll-triggered

## Scope: Inline SVG, 480x240px

## Controls: None

## Step Plan

1. Initial ó function box `add(a, b, c)` with three argument slots (gray placeholders).
2. Step 1 (0-500ms) ó `add(1)` call. First slot fills amber "1". Returns partial function (new box appears).
3. Step 2 (600-1100ms) ó `(2)` call on partial. Second slot fills blue "2". Returns another partial.
4. Step 3 (1200-1700ms) ó `(3)` call. Third slot fills green "3". All filled ó final result "6" appears in green output box.
5. Arrow chain: each step connected by arrows.

## Visual Behavior Rules
- Function box: rect width=160 height=50 rx=6 fill #1F2937 stroke #8B5CF6
- Arg slot: rect width=32 height=28 rx=3 fill #374151 (empty), fill #F59E0B (arg1), #3B82F6 (arg2), #10B981 (arg3)
- Slot fill: scale 0.5 to 1 + opacity 0 to 1, 300ms ease-out
- Partial function box: same style, appears via opacity 0 to 1 + translateY -20 to 0
- Output box: rect fill #064E3B stroke #10B981, value label font-size 14px bold fill #34D399
- Arrows: path stroke #9CA3AF marker-end arrowhead
- prefers-reduced-motion: static showing final state with all slots filled

## Technical Implementation
- SVG viewBox="0 0 480 240"
- CSS animation sequence

## Accessibility
- aria-label="Currying: add(1)(2)(3) fills argument slots one by one, returning partial functions until all are filled"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-debounce-throttle

## Summary
Deep-dive implementation of debounce and throttle with timers, leading/trailing edge variants.

## Animation Necessity
YES ó reuse debounce and throttle timeline from article 18 (already in Group 7 what-is articles). Two-lane comparison.

## Type: Scroll-triggered

## Scope: Inline SVG, 500x220px (reuse from article 18 and Group 7)

## Controls: None

## Step Plan
Identical to the two-lane debounce/throttle comparison in article 18. Extract as shared component.

## Visual Behavior Rules
- Reuse debounce and throttle lane specs from article 18 and what-is-debouncing/what-is-throttling

## Technical Implementation
- SVG viewBox="0 0 500 220"
- Shared component extraction from article 18 implementation

## Accessibility
- aria-label="Debounce vs throttle: debounce delays until input stops; throttle fires at fixed intervals"

## Mobile: Scale to 100% width

## Complexity: Simple (reuse)
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-array-methods-polyfills-1

## NO ANIMATION NEEDED
Covers map, filter, reduce, forEach, find, findIndex with polyfill implementations. Code examples are the right medium. No SVG needed.

---

## Article: js-array-methods-polyfills-2

## NO ANIMATION NEEDED
Covers flat, flatMap, every, some, includes, indexOf with polyfills. Code-focused article. No SVG needed.

---

## Article: js-memoize-once

## Summary
Covers memoization (cache previous results) and once() (run only first call).

## Animation Necessity
YES ó cache hit/miss visualization for memoize; call gate for once().

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 500x280px

## Controls: Step / Reset

## Step Plan

**Memoize section (top half):**
1. Initial ó function box + cache map (empty, gray).
2. Step 1 ó `compute(5)` called. Cache miss (gray X). Function executes (amber pulse). Result 25 stored in cache (green entry added).
3. Step 2 ó `compute(5)` called again. Cache hit (green checkmark). Returns instantly from cache (skip function execution ó function box stays gray).

**Once section (bottom half):**
1. Initial ó function box + "called" counter = 0.
2. Step 1 ó first call executes (green flash). Counter increments to 1.
3. Step 2 ó second call: gate icon (lock) blocks execution. Counter stays 1. "Ignored" label appears.

## Visual Behavior Rules
- Function box: rect width=120 height=40 rx=6 fill #1F2937 stroke #3B82F6
- Cache map: rect width=160 height=80 rx=4 fill #111827 stroke #374151
- Cache entry: rect width=140 height=20 rx=3 fill #064E3B stroke #10B981 (hit) or fill #374151 (empty)
- Cache miss X: path red X centered over cache, 300ms fade
- Cache hit check: path green check 300ms scale-in
- Gate lock: path lock icon stroke #F59E0B fill none, on function box top edge
- Counter: text font-size 16px bold fill #F9FAFB, animates number change
- prefers-reduced-motion: static showing cache with one entry and gate locked

## Technical Implementation
- SVG viewBox="0 0 500 280"
- State machine 4 steps total
- Counter text animation with CSS countup

## Accessibility
- aria-label="Memoize: cache hit skips function execution; once: function runs only on first call"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-recursion-patterns

## Summary
Covers recursion, base cases, tail recursion, tree traversal, and common recursive patterns.

## Animation Necessity
YES ó call stack push/pop for recursion is a classic spatial visualization. Reuse CallStackVisualizer.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 480x340px (reuse CallStackVisualizer)

## Controls: Step / Reset

## Step Plan

Factorial(3) example:
1. Initial ó empty call stack.
2. Step 1 ó `factorial(3)` pushed (waiting for factorial(2)).
3. Step 2 ó `factorial(2)` pushed (waiting for factorial(1)).
4. Step 3 ó `factorial(1)` pushed. Base case hit (green glow on frame).
5. Step 4 ó `factorial(1)` returns 1 (pops). `factorial(2)` now computing 2 * 1.
6. Step 5 ó `factorial(2)` returns 2 (pops). `factorial(3)` computing 3 * 2.
7. Step 6 ó `factorial(3)` returns 6 (pops). Result box shows "6".

## Visual Behavior Rules
- Reuse CallStackVisualizer component specs
- Base case frame: stroke #10B981 green glow
- Return value pill: rect fill #064E3B stroke #10B981 slides right on pop
- Result box: rect fill #064E3B stroke #10B981 width=80 height=40, appears at end
- Frame fill colors: varying blue shades by depth level
- prefers-reduced-motion: static showing maximum depth stack with all labels

## Technical Implementation
- SVG viewBox="0 0 480 340"
- Reuse CallStackVisualizer
- State machine 7 steps

## Accessibility
- aria-label="Recursion: factorial(3) builds call stack three levels deep, then unwinds returning values"

## Mobile: Scale to 100% width

## Complexity: Simple (reuse)
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-deep-clone-compare

## NO ANIMATION NEEDED
Covers structuredClone, JSON.parse/stringify, recursive clone, and deep equality. Code-focused. No SVG needed.

---

## Article: js-flatten-unflatten-object

## NO ANIMATION NEEDED
Covers nested object flattening/unflattening algorithms with code examples. No SVG needed.

---

# Group 10: JavaScript Series ó Async

---

## Article: js-event-loop-in-depth

## Summary
Deep-dive event loop: call stack, macrotask queue, microtask queue, rendering, with execution order examples.

## Animation Necessity
YES ó this is the canonical event loop visualization. QueueVisualizer + CallStackVisualizer side-by-side extended.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 600x380px

## Controls: Step / Reset

## Step Plan

Full execution order demonstration with `setTimeout`, `Promise.resolve`, and `queueMicrotask`:

1. Initial ó Call Stack (left), Microtask Queue (center-top), Macrotask Queue (center-bottom), Render (right placeholder). All empty.
2. Step 1 ó Script runs: `console.log("A")` enters stack, executes (green flash), logs "A". setTimeout callback enters Macrotask Queue (amber).
3. Step 2 ó Promise.resolve().then enters Microtask Queue (blue).
4. Step 3 ó Script ends. Stack empty. Microtask Queue drains: then-callback enters stack, runs, logs "B". Pops.
5. Step 4 ó Render opportunity (if any). Render box pulses briefly (violet).
6. Step 5 ó Macrotask: setTimeout callback enters stack from Macrotask Queue. Runs, logs "C". Pops.
7. Log output panel (right side) accumulates: A, B, C with timestamps.

## Visual Behavior Rules
- Layout: Call Stack left 180px, Micro Queue top-center 160px, Macro Queue bottom-center 160px, Log panel right 160px
- Call Stack: rect height=280 fill #111827 stroke #374151
- Micro Queue: rect height=120 fill #1E3A5F stroke #3B82F6
- Macro Queue: rect height=120 fill #3B1F00 stroke #F59E0B
- Item movement: cubic-bezier path animation between zones, 400ms
- Log line: font-size 11px fill #D1D5DB, slides in from right edge
- Render pulse: rect opacity 0.2 to 0.8 to 0.2, 600ms, fill #8B5CF6
- Step label: bottom center font-size 11px fill #9CA3AF
- prefers-reduced-motion: static showing all queues filled + log output A B C

## Technical Implementation
- SVG viewBox="0 0 600 380"
- Path-based motion animation for item movement
- State machine 7 steps
- Log panel as foreignObject or SVG text elements

## Accessibility
- aria-label="Event loop: microtask queue (Promise) drains before macrotask queue (setTimeout), log order A B C"

## Mobile: Scale to 100% width; stack queues vertically at width less than 480px

## Complexity: Complex
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: settimeout-setinterval

## Summary
Covers setTimeout and setInterval mechanics, timer queuing, minimum delay, clearTimeout/clearInterval.

## Animation Necessity
YES ó timer queue visualization showing delay before callback enters macrotask queue.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 500x260px

## Controls: Step / Reset

## Step Plan

1. Initial ó Call Stack, Timer Web API box, Macrotask Queue. All empty.
2. Step 1 ó `setTimeout(fn, 300)` called. Stack shows setTimeout, then pops. Timer enters Web API box (countdown 300ms starts, amber bar depleting).
3. Step 2 ó Timer fires (0ms). fn moves from Web API box to Macrotask Queue (amber).
4. Step 3 ó Stack empties. fn enters stack, executes (green flash), pops.
5. setInterval demo: fn re-enters Web API box immediately after execution. Cycle repeats.
6. Label: "setTimeout: once. setInterval: repeats every N ms".

## Visual Behavior Rules
- Web API box: rect fill #2D1B69 stroke #8B5CF6, label "Web APIs (Timer)"
- Timer bar: rect height=8 fill #F59E0B inside API box, depleting width animation
- Item movement: same path-based animation as event loop article
- Repeat arrow: curved arrow from execution back to Web API box for setInterval demo
- prefers-reduced-motion: static two-state diagram (timer set, then callback queued)

## Technical Implementation
- SVG viewBox="0 0 500 260"
- Reuse event loop queue rendering components
- Timer bar: CSS animation width 100% to 0%, duration 1.5s (visual, not real 300ms)

## Accessibility
- aria-label="setTimeout: callback waits in Web API timer, then queued in macrotask queue after delay"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-promise-from-scratch

## Summary
Builds Promise from scratch. Shows pending/fulfilled/rejected state machine, then-chaining, microtask scheduling.

## Animation Necessity
YES ó StateTransitionDiagram for Promise state machine + chain visualization.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 540x320px

## Controls: Step / Reset

## Step Plan

1. Initial ó Promise state box: "Pending" (amber center).
2. Step 1 ó resolve() called. Arrow to "Fulfilled" (green box). Fulfilled box glows.
3. Step 2 ó .then() callbacks shown as chain: then1 box, then2 box, connected by arrows. Each enters microtask queue in sequence.
4. Alternate path (toggle): reject() called. Arrow to "Rejected" (red box). .catch() handler shown.
5. Step 3 ó finally() node at bottom of both paths.

## Visual Behavior Rules
- State boxes: rect width=100 height=44 rx=6
- Pending: fill #92400E stroke #F59E0B
- Fulfilled: fill #064E3B stroke #10B981
- Rejected: fill #7F1D1D stroke #EF4444
- Settled label: font-size 10px fill #9CA3AF below state boxes
- Then chain: smaller rect width=80 height=32 rx=4 fill #1E3A5F stroke #3B82F6, connected by arrows
- Catch: rect fill #7F1D1D stroke #EF4444
- Finally: rect fill #374151 stroke #9CA3AF at bottom
- Arrows: marker-end arrowhead, stroke matching target state
- prefers-reduced-motion: static showing both fulfilled and rejected paths

## Technical Implementation
- SVG viewBox="0 0 540 320"
- Reuse StateTransitionDiagram component
- Toggle button for resolve/reject path

## Accessibility
- aria-label="Promise state machine: pending transitions to fulfilled or rejected, then-chain runs as microtasks"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-promise-combinators

## Summary
Covers Promise.all, allSettled, race, any ó semantics and failure modes.

## Animation Necessity
YES ó parallel timeline showing each combinator's behavior on success/failure scenarios.

## Type: Scroll-triggered, interactive (toggle combinator)

## Scope: Inline SVG, 540x280px

## Controls: Four buttons (all / allSettled / race / any)

## Step Plan

Each combinator shows three parallel promise timelines (P1 fast, P2 medium, P3 fails):

**all:** P1 resolves (green), P2 resolves (green), P3 rejects (red). Combined rejects immediately on P3. Red output.

**allSettled:** All three complete regardless. Output shows [{fulfilled}, {fulfilled}, {rejected}]. Green output.

**race:** P1 resolves first. Output = P1's value. P2 and P3 continue but result ignored. Amber output.

**any:** P3 rejects first, ignored. P1 resolves. Output = P1. Green output. If all rejected: AggregateError (red).

## Visual Behavior Rules
- Three horizontal lane rows for P1/P2/P3 timeline
- Lane: rect height=24 fill #1F2937 stroke #374151
- Resolve end: circle r=8 fill #10B981 at resolve time
- Reject end: circle r=8 fill #EF4444 at reject time
- Result box: rect width=120 height=36 rx=6 at end, fill per outcome
- Early-short-circuit line: vertical dashed line at P3 reject time for `all` mode
- Ignored continuation: opacity 0.3 for remaining lanes after race resolves
- prefers-reduced-motion: static final state for active combinator

## Technical Implementation
- SVG viewBox="0 0 540 280"
- Four-state toggle
- Promise timelines as TimelineBar rows

## Accessibility
- aria-label="Promise combinators: all, allSettled, race, any ó behavior with mixed resolve and reject"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-async-await-under-hood

## Summary
Shows async/await as syntactic sugar over generators + Promises. Step through how await suspends execution.

## Animation Necessity
YES ó call stack showing suspension and resumption on await is uniquely visual.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 520x320px

## Controls: Step / Reset

## Step Plan

1. Initial ó `async function fetchUser()` box. Call stack empty.
2. Step 1 ó fetchUser() called. Frame pushed to stack.
3. Step 2 ó `await fetch(url)` hit. Frame is suspended (frame border dashes, amber). Yields control.
4. Step 3 ó Stack shows other work happening (different function executes while fetch is in-flight).
5. Step 4 ó fetch resolves. Microtask queue: fetchUser resumption queued (blue item).
6. Step 5 ó fetchUser resumes (frame border solid again, green flash). Continues after await.
7. Step 6 ó fetchUser completes, pops.

## Visual Behavior Rules
- Async frame: rect same as CallStackVisualizer, when suspended: stroke-dasharray="6 3" stroke #F59E0B
- Suspended label: "awaiting..." text fill #F59E0B font-size 11px on frame
- Resume: stroke solid #10B981, "resumed" flash 300ms
- Microtask item: rect fill #1E3A5F stroke #3B82F6, path animation to stack
- Other work frame: fill #374151 opacity between steps
- prefers-reduced-motion: static showing suspended frame and resumed frame as two static states

## Technical Implementation
- SVG viewBox="0 0 520 320"
- Reuse CallStackVisualizer
- State machine 6 steps

## Accessibility
- aria-label="async/await: await suspends function frame, other work runs, then frame resumes via microtask"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-generators-iterators

## Summary
Covers generators (function*), yield, iterator protocol, lazy sequences, and custom iterables.

## Animation Necessity
YES ó generator pause/resume cycle shown on a step timeline.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 500x260px

## Controls: Step / Reset (calls next())

## Step Plan

1. Initial ó generator function box with three yield points marked (Y1, Y2, Y3). Execution pointer at top.
2. Step 1 (.next()) ó pointer moves to Y1, yields value 1. Value pill pops out to right: {value:1, done:false}.
3. Step 2 (.next()) ó pointer at Y2, value 2. Pill: {value:2, done:false}.
4. Step 3 (.next()) ó pointer at Y3, value 3. Pill: {value:3, done:false}.
5. Step 4 (.next()) ó pointer past end. Pill: {value:undefined, done:true}.
6. Each step: generator box "paused" indicator (amber dot at yield), "running" (green) when executing.

## Visual Behavior Rules
- Generator box: rect width=140 height=200 rx=6 fill #1F2937 stroke #8B5CF6
- Yield markers: small horizontal line in box at Y1/Y2/Y3 positions, stroke #F59E0B
- Execution pointer: triangle shape fill #10B981, animates up/down box
- Value pill: rect width=160 height=32 rx=4 fill #374151 stroke #3B82F6, pops in from right
- Paused dot: circle r=6 fill #F59E0B at yield position
- Running dot: circle r=6 fill #10B981 pulse
- Done pill: stroke #9CA3AF fill #374151
- prefers-reduced-motion: static showing all four yield results

## Technical Implementation
- SVG viewBox="0 0 500 260"
- State machine 4 steps (next calls)
- Pointer position animates via translateY

## Accessibility
- aria-label="Generator: each next() call resumes execution to next yield, returning value until done"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-async-iteration

## NO ANIMATION NEEDED
Covers for-await-of and async iterables. Close to generators article; code examples are sufficient. No SVG needed.

---

## Article: js-concurrency-limits

## Summary
Covers limiting concurrent async operations (p-limit pattern): run N tasks at a time, queue the rest.

## Animation Necessity
YES ó QueueVisualizer showing limited concurrency slots is perfect.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 520x280px (reuse QueueVisualizer)

## Controls: Step / Reset

## Step Plan

Scenario: 6 async tasks, concurrency limit = 2.

1. Initial ó 6 task items in pending queue (right). Two "active slot" lanes (left). Empty.
2. Step 1 ó Tasks 1 and 2 move into active slots (blue, running bars expanding).
3. Step 2 ó Task 1 finishes (green flash, exits slot). Task 3 immediately enters empty slot.
4. Step 3 ó Task 2 finishes, Task 4 enters. Queue depletes as slots free up.
5. Step 4 ó All done. Slots empty, queue empty. "6 tasks completed" label.

## Visual Behavior Rules
- Active slots: two rect lanes height=44 fill #1E3A5F stroke #3B82F6, side by side
- Task items: rect width=44 height=36 rx=4 fill #374151 stroke #9CA3AF with number label
- Running bar: inner rect width expanding from 0 to 100% fill #3B82F6, 1s duration
- Completed: fill #064E3B stroke #10B981, scale 1 to 0 + opacity 0 exit
- Queue area: rect fill #111827 stroke #374151, items stacked
- Movement path: cubic-bezier from queue to slot
- Completion counter: text "0/6" updating per step, font-size 14px bold fill #F9FAFB
- prefers-reduced-motion: static showing 2 running + remaining queued

## Technical Implementation
- SVG viewBox="0 0 520 280"
- Reuse QueueVisualizer layout
- State machine 4 steps

## Accessibility
- aria-label="Concurrency limiter: 6 tasks, 2 active slots, queue feeds slots as each task completes"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-abort-controller

## NO ANIMATION NEEDED
Covers AbortController and AbortSignal for cancelling fetch and other async operations. Code-focused. No SVG needed.

---

# Group 11: JavaScript Series ó Objects and Data Structures

---

## Article: js-map-set-weakmap-weakset

## Summary
Covers Map, Set, WeakMap, WeakSet: when to use each over plain objects/arrays, iteration, weak reference semantics.

## Animation Necessity
YES ó Map vs Object key comparison (any key type) and Set deduplication are good visuals.

## Type: Scroll-triggered

## Scope: Inline SVG, 500x260px

## Controls: None

## Step Plan

Two demos side by side:

**Map demo (left):**
1. Key types appear as different shapes: string key (rect), number key (circle), object key (diamond).
2. Each maps to a value box via arrow. "Map accepts any key type" label.

**Set demo (right):**
1. Input array with duplicates: [1, 2, 2, 3, 3, 3]. Items animate into Set.
2. Duplicates are rejected (red X, bounce back). Unique items stay (green fill).
3. Result: {1, 2, 3} in Set box.

## Visual Behavior Rules
- Map box: rect fill #1F2937 stroke #3B82F6 width=200 height=180
- Key shapes: rect (string) fill #374151, circle (number), diamond (object key ref) all stroke #9CA3AF
- Arrow: path stroke #3B82F6 stroke-width=1.5
- Value box: rect fill #064E3B stroke #10B981 width=60 height=24 rx=3
- Set box: rect fill #1F2937 stroke #8B5CF6 width=180 height=120
- Input items: circle r=16 fill #374151 stroke #9CA3AF, number label
- Duplicate bounce: translateX +30 then back, opacity flash red, 300ms
- Unique accept: fill changes to #3B82F6, scale 1.2 to 1, 200ms
- prefers-reduced-motion: static showing final Map and Set states

## Technical Implementation
- SVG viewBox="0 0 500 260"
- CSS animation for bounce-back
- IntersectionObserver scroll trigger

## Accessibility
- aria-label="Map accepts any key type; Set deduplicates values, rejecting duplicates"

## Mobile: Scale to 100% width, stack left/right halves vertically

## Complexity: Simple
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-object-create-instanceof

## Summary
Covers Object.create, instanceof operator, prototype chain inspection.

## Animation Necessity
YES ó reuse prototype chain visualization from js-prototypes-inheritance with Object.create focus.

## Type: Scroll-triggered

## Scope: Inline SVG, 480x280px (reuse prototype chain component)

## Controls: None

## Step Plan

1. `Object.create(proto)` call. New object appears with direct __proto__ link to proto box.
2. `instanceof` operator traces: follows __proto__ chain, comparing to Constructor.prototype at each step.
3. Labels show "true" (green) when match found, "false" (red) when chain ends at null.

## Visual Behavior Rules
- Reuse prototype chain box/arrow style from js-prototypes-inheritance
- instanceof check arrow: dashed amber stroke, sweeps down chain
- Match result: green checkmark or red X at match point
- prefers-reduced-motion: static chain with instanceof check shown

## Technical Implementation
- SVG viewBox="0 0 480 280"
- Reuse prototype chain component

## Accessibility
- aria-label="Object.create and instanceof: prototype chain traversal to check inheritance"

## Mobile: Scale to 100% width

## Complexity: Simple (reuse)
## Priority: Low

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-symbols-in-depth

## NO ANIMATION NEEDED
Covers Symbol uniqueness, well-known symbols, Symbol.iterator, Symbol.toPrimitive. Code-focused. No SVG needed.

---

## Article: js-proxy-reflect-api

## Summary
Covers Proxy traps (get, set, has) and Reflect for meta-programming.

## Animation Necessity
YES ó Proxy as an intercepting layer between caller and target is a spatial concept.

## Type: Scroll-triggered

## Scope: Inline SVG, 480x240px

## Controls: None

## Step Plan

1. Three boxes horizontally: Caller (left), Proxy (center, amber border), Target Object (right).
2. Property access `proxy.name`:
   - Arrow from Caller to Proxy (intercepted, amber flash).
   - Proxy's `get` trap fires (amber label "get trap").
   - Trap can return modified value, log, or forward to Target (arrow to Target, blue).
3. Property set `proxy.age = 25`:
   - Arrow from Caller to Proxy.
   - `set` trap fires. Validation shown (green checkmark if valid, red X if invalid).
   - If valid: forward to Target.

## Visual Behavior Rules
- Caller box: rect fill #1F2937 stroke #374151
- Proxy box: rect fill #1F2937 stroke #F59E0B stroke-width=2, label "Proxy" above, "Handler" inside
- Target box: rect fill #1F2937 stroke #3B82F6
- Trap label: font-size 10px fill #F59E0B, appears in proxy box
- Intercept arrow: stroke #F59E0B, flashes before forwarding
- Forward arrow: stroke #3B82F6
- Validation: circle r=8 fill #10B981 or #EF4444 with icon
- prefers-reduced-motion: static showing all three boxes with labeled arrows

## Technical Implementation
- SVG viewBox="0 0 480 240"
- CSS animation sequence for two scenarios

## Accessibility
- aria-label="Proxy: intercepts get and set operations between caller and target object via handler traps"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-json-stringify-parser

## NO ANIMATION NEEDED
Covers JSON.stringify/parse, replacer, reviver, circular reference handling. Code-focused. No SVG needed.

---

## Article: js-url-query-parser

## NO ANIMATION NEEDED
Covers URLSearchParams and custom URL query string parsing. Code-focused. No SVG needed.

---

## Article: js-string-templating-engine

## NO ANIMATION NEEDED
Covers building a minimal template engine with tagged template literals. Code-focused. No SVG needed.

---

# Group 12: JavaScript Series ó Engine and Patterns

---

## Article: js-v8-jit-compilation

## Summary
Deep-dive into V8's Ignition interpreter and TurboFan optimising compiler. Deopt triggers.

## Animation Necessity
YES ó reuse JIT pipeline from what-is-jit-compilation (Group 7) with added deopt detail.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 540x340px (reuse and extend JIT pipeline)

## Controls: Step / Reset

## Step Plan

Extend the what-is-jit-compilation steps with deopt scenarios:
1-6: Same as what-is-jit-compilation steps.
7. Step 7 ó Deopt scenario: type change on hot function (number arg becomes string). Assumption fails.
8. Step 8 ó Deopt arrow (red dashed) from machine code back to bytecode. Counter resets.
9. Step 9 ó "Type feedback" badge appears: V8 marks function as megamorphic (gray badge). No longer optimised.
10. Label: "Hidden class change triggers deopt".

## Visual Behavior Rules
- Reuse all JIT pipeline visual rules from what-is-jit-compilation
- Megamorphic badge: rect fill #374151 stroke #6B7280 rx=3 label "Megamorphic" font-size 9px
- Type change label: text fill #EF4444 "number -> string" at deopt arrow
- Additional step label area extended below pipeline
- prefers-reduced-motion: static showing full pipeline + deopt path

## Technical Implementation
- SVG viewBox="0 0 540 340"
- Reuse and extend JIT pipeline component
- State machine 9 steps

## Accessibility
- aria-label="V8 JIT: Ignition to TurboFan, with deopt on type change causing fallback to bytecode"

## Mobile: Scale to 100% width

## Complexity: Medium (reuse + extend)
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-memory-leaks-gc

## Summary
Covers garbage collection (mark-and-sweep), common memory leak patterns: detached DOM, closures, event listeners.

## Animation Necessity
YES ó GC mark-and-sweep visualization showing reachable vs unreachable nodes.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 520x320px

## Controls: Step / Reset

## Step Plan

1. Initial ó object graph: Root (GC Roots box), Object A, B, C connected. Object D and E not connected to root (floating, gray).
2. Step 1 ó Mark phase: GC traverses from Root. A, B, C light up green (reachable).
3. Step 2 ó D and E remain gray (unreachable). Mark complete.
4. Step 3 ó Sweep phase: D and E fade and disappear (opacity 0, scale 0.8). Memory freed bar decreases.
5. Memory usage bar (right): animated gauge, drops by 20% on sweep.
6. Leak scenario toggle: add EventListener that keeps D alive unexpectedly. D stays (not swept). Label "memory leak".

## Visual Behavior Rules
- Object nodes: circle r=24 fill #1F2937 stroke #374151 (default)
- Reachable: stroke #10B981, fill #064E3B
- Unreachable: stroke #374151, fill #1F2937 opacity=0.5
- Root box: rect fill #2D1B69 stroke #8B5CF6
- GC sweep: node scale 1 to 0 + opacity 0, 400ms ease-in
- Memory bar: rect height=140 fill #3B82F6, height animation
- Edges: line stroke #4B5563
- Leak node D: stroke #EF4444 when leak toggle active
- prefers-reduced-motion: static showing final swept state

## Technical Implementation
- SVG viewBox="0 0 520 320"
- Pre-computed graph layout
- State machine 4 steps + leak toggle

## Accessibility
- aria-label="Garbage collection: GC marks reachable objects from root, sweeps unreachable ones, freeing memory"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-hoisting-tdz-deep

## Summary
Deep-dive into hoisting mechanics: var hoisted with undefined, function declarations hoisted fully, let/const TDZ.

## Animation Necessity
YES ó reuse scope diagram from js-variables-scope-hoisting with added hoisting ghost animation detail.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 480x300px (reuse scope component)

## Controls: Step / Reset

## Step Plan

Focus on execution context creation phase:
1. Initial ó code as written (declarations at their literal positions).
2. Step 1 ó "Hoisting phase" banner. var declarations float to top of scope (ghost translateY animation). Function declarations fully float with their body outline.
3. Step 2 ó let/const markers appear at top as TDZ red zones from top-of-scope to declaration line.
4. Step 3 ó Execution begins. var starts as undefined (gray pill), resolved later. Function immediately callable (green pill).
5. Step 4 ó let line reached, TDZ clears (red zone disappears), variable initialised.

## Visual Behavior Rules
- Reuse all scope diagram visual rules
- Hoisting ghost: opacity 0.4, dashed border, translateY animation from original to top
- TDZ zone: rect fill rgba(239,68,68,0.15) stroke #EF4444 stroke-dasharray="4 3", label "TDZ" fill #EF4444
- Execution banner: rect fill #374151 stroke #9CA3AF label "Hoisting Phase" font-size 11px
- Undefined pill: rect fill #374151 stroke #6B7280 label "undefined" fill #9CA3AF
- Initialised pill: rect fill #064E3B stroke #10B981
- prefers-reduced-motion: static showing scope with TDZ and hoisted positions labeled

## Technical Implementation
- SVG viewBox="0 0 480 300"
- Reuse scope diagram component
- TranslateY animation for ghost movement

## Accessibility
- aria-label="Hoisting: var and function declarations move to scope top in creation phase; let/const stay in TDZ until reached"

## Mobile: Scale to 100% width

## Complexity: Simple (reuse)
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-module-systems

## NO ANIMATION NEEDED
Covers CommonJS vs ES Modules: require/exports vs import/export, static vs dynamic, tree-shaking implications. Code comparisons are the right medium. No SVG needed.

---

## Article: js-classes-under-hood

## Summary
Shows how ES6 class syntax maps to prototype chain ó class is syntactic sugar.

## Animation Necessity
YES ó reuse prototype chain from js-prototypes-inheritance. Show class syntax on left, equivalent prototype wiring on right.

## Type: Scroll-triggered

## Scope: Inline SVG, 540x280px

## Controls: None

## Step Plan

1. Left panel: class syntax code as text (`class Animal { constructor... }`, `class Dog extends Animal {}`).
2. Right panel: equivalent prototype chain diagram (Dog.prototype.__proto__ === Animal.prototype).
3. Animation reveals right panel after left (fade in + slide from right), showing class is just a wrapper.
4. `super()` call shown as arrow from Dog constructor to Animal constructor.

## Visual Behavior Rules
- Code text: font-family monospace, font-size 11px fill #93C5FD, left panel
- Prototype boxes: reuse prototype chain component
- Divider line: stroke #374151 center vertical
- Fade reveal: right panel opacity 0 to 1, translateX +30 to 0, 500ms
- Super arrow: dashed path stroke #F59E0B
- Label: "class syntax" fill #9CA3AF left, "prototype wiring" fill #9CA3AF right
- prefers-reduced-motion: both panels visible from start

## Technical Implementation
- SVG viewBox="0 0 540 280"
- Left panel as SVG text/tspan elements
- Reuse prototype chain component for right panel

## Accessibility
- aria-label="ES6 class syntax (left) maps to prototype chain wiring (right) ó class is syntactic sugar"

## Mobile: Scale to 100% width, stack panels vertically

## Complexity: Simple (reuse)
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-deopt-patterns

## NO ANIMATION NEEDED
Covers deoptimisation triggers: polymorphic call sites, argument type changes, delete operator on hidden class. Code patterns are the right medium. The JIT pipeline from js-v8-jit-compilation covers the visual. No additional SVG needed.

---

## Article: js-event-emitter

## Summary
Builds a custom EventEmitter: on, off, emit, once. Covers the observer pattern foundation.

## Animation Necessity
YES ó event emission fan-out to multiple listeners is a good visual.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 500x280px

## Controls: Step / Reset

## Step Plan

1. Initial ó EventEmitter box center. Three listener boxes (L1, L2, L3) connected by lines.
2. Step 1 ó `emitter.on('data', listener1)` ó L1 line draws in (stroke-dashoffset animation).
3. Step 2 ó Same for L2, L3.
4. Step 3 ó `emitter.emit('data', payload)` ó payload pill appears at emitter, fans out via arrows to all three listeners simultaneously. Each listener flashes green.
5. Step 4 ó `emitter.off('data', L2)` ó L2 line fades out. L2 box grays out.
6. Step 5 ó emit again. Payload only reaches L1 and L3.

## Visual Behavior Rules
- Emitter box: rect width=120 height=50 rx=6 fill #1F2937 stroke #8B5CF6
- Listener boxes: rect width=80 height=36 rx=4 fill #1F2937 stroke #3B82F6
- Connection lines: path stroke #374151 stroke-width=1.5
- Payload pill: rect width=60 height=24 rx=4 fill #8B5CF6 stroke none, animated along path
- Listener flash: fill #064E3B stroke #10B981, 300ms pulse
- Disconnected line: opacity 0, 400ms ease-out
- Disabled listener: stroke #374151 opacity=0.3
- prefers-reduced-motion: static showing all connections + emit arrows

## Technical Implementation
- SVG viewBox="0 0 500 280"
- Stroke-dashoffset for line draw
- Path-based motion for payload pill

## Accessibility
- aria-label="EventEmitter: emit fans payload to all registered listeners; off removes a listener"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-observer-pattern

## Summary
Covers the Observer pattern: Subject with subscribe/unsubscribe/notify, multiple Observer instances.

## Animation Necessity
YES ó reuse EventEmitter visualization with Subject/Observer terminology. Effectively the same visual.

## Type: Scroll-triggered

## Scope: Inline SVG, 500x260px (reuse EventEmitter component)

## Controls: None

## Step Plan

Same as js-event-emitter but with Subject/Observer labels instead of EventEmitter/Listener.
State change triggers notification to all subscribed observers.

## Visual Behavior Rules
- Reuse all EventEmitter visual rules
- Subject box: stroke #F59E0B
- Observer boxes: stroke #3B82F6
- State change label: text fill #F59E0B "state changed" above subject on notify

## Technical Implementation
- SVG viewBox="0 0 500 260"
- Reuse EventEmitter component, parameterized with Subject/Observer labels

## Accessibility
- aria-label="Observer pattern: state change in Subject notifies all subscribed Observers"

## Mobile: Scale to 100% width

## Complexity: Simple (reuse)
## Priority: Low

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-singleton-factory-patterns

## NO ANIMATION NEEDED
Covers Singleton (single instance guard) and Factory (object creation abstraction). Code pattern explanations. No SVG needed.

---

# Group 13: JavaScript Series ó Data Structures, FP, and Browser APIs

---

## Article: js-linked-list

## Summary
Implements singly and doubly linked list: insert, delete, traverse. O(1) head operations.

## Animation Necessity
YES ó node insertion and deletion with pointer rewiring is inherently visual.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 520x240px

## Controls: Step / Reset (Insert / Delete buttons)

## Step Plan

1. Initial ó three nodes in a row: A ? B ? C. Arrows (next pointers) connecting them.
2. Insert step: Insert D between B and C.
   - D node slides in from above between B and C.
   - Old B?C arrow fades (red). New B?D arrow draws in (green). D?C arrow draws in (green).
3. Delete step: Delete B.
   - B node highlights red.
   - A?B and B?D arrows fade.
   - A?D arrow draws in (green, arcing over B).
   - B fades out (scale 0, opacity 0).

## Visual Behavior Rules
- Node: rect width=60 height=44 rx=6 fill #1F2937 stroke #3B82F6, label fill #93C5FD font-size 12px
- Next arrow: path stroke #4B5563 stroke-width=1.5 marker-end arrowhead, 6px gap between nodes
- Insert node: slide from y=-60 to y=0, opacity 0 to 1, 400ms ease-out
- New arrows: stroke-dashoffset 0 to full, 300ms
- Delete target: stroke #EF4444 fill #7F1D1D
- Old arrows fade: opacity 1 to 0, 200ms
- New bypass arrow: arc path stroke #10B981 stroke-width=2
- Delete fade: scale 1 to 0.5 + opacity 0, 400ms ease-in
- prefers-reduced-motion: static showing insert result then delete result as two diagrams

## Technical Implementation
- SVG viewBox="0 0 520 240"
- Arrow paths computed from node positions
- State machine 3 states (initial / after-insert / after-delete)

## Accessibility
- aria-label="Linked list: insert node rewires pointers; delete node rewires bypass pointer"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-hash-table

## Summary
Implements hash table with chaining: hash function, bucket array, collision handling.

## Animation Necessity
YES ó hash function feeding into bucket array with collision chains.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 520x300px

## Controls: Step / Reset

## Step Plan

1. Initial ó key-value pair input on left ("name", "Alice"). Bucket array (8 slots) in center. Empty.
2. Step 1 ó hash("name") runs: number output "2" appears (animated character-by-character).
3. Step 2 ó hash result ? bucket[2] highlighted amber. Entry inserted.
4. Step 3 ó Second key "age" hashes to bucket[2] (collision). Chain appended (linked list node below bucket[2]).
5. Step 4 ó Lookup: "name" key ? hash ? bucket[2] ? chain traversal ? match found (green flash).
6. Bucket array slots: 0-7 visible, filled buckets highlighted.

## Visual Behavior Rules
- Bucket array: rect column width=40, 8 cells height=32 each, fill #111827 stroke #374151
- Hash input: rect fill #374151 stroke #3B82F6, key text fill #93C5FD
- Hash result arrow: path stroke #8B5CF6, label "hash() = 2" fill #8B5CF6 font-size 11px
- Filled bucket: fill #1E3A5F stroke #3B82F6
- Chain node: rect width=60 height=28 rx=3 below bucket, connected by line
- Collision label: text fill #F59E0B "collision!" font-size 10px
- Lookup flash: fill #064E3B stroke #10B981 on match
- prefers-reduced-motion: static showing bucket array with two entries and chain

## Technical Implementation
- SVG viewBox="0 0 520 300"
- State machine 4 steps
- Chain nodes positioned dynamically

## Accessibility
- aria-label="Hash table: key hashes to bucket index; collision handled by chaining in same bucket"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-lru-cache

## Summary
LRU Cache: O(1) get/put using Map + doubly linked list. Evict least recently used on capacity.

## Animation Necessity
YES ó doubly linked list reordering on access (move-to-front) is the key visual insight.

## Type: Scroll-triggered, interactive (Step / Reset)

## Scope: Inline SVG, 540x300px

## Controls: Step / Reset

## Step Plan

1. Initial ó 3-item cache at capacity: [C (MRU)] ? [A] ? [B (LRU)]. Doubly linked list visible. Hash map shown as key-to-node arrows.
2. Step 1 ó `cache.get("A")`: A node moves to head (MRU). List becomes [A] ? [C] ? [B]. Pointer rewire animation.
3. Step 2 ó `cache.put("D", ...)`: capacity exceeded. LRU node (B) removed from tail (red fade). D inserted at head (green). List: [D] ? [A] ? [C].
4. Hash map updates: B entry removed (red), D entry added (green).

## Visual Behavior Rules
- List nodes: rect width=70 height=44 rx=6 fill #1F2937 stroke #3B82F6, key label fill #93C5FD
- MRU label: "HEAD (MRU)" above first node, fill #10B981 font-size 10px
- LRU label: "TAIL (LRU)" below last node, fill #EF4444 font-size 10px
- Doubly linked arrows: bidirectional paths both above and below node row
- Move-to-front: translateX animation following path from position to head, 500ms ease-in-out
- Evict: opacity 1 to 0 + translateY +30, 300ms ease-in
- New insert: opacity 0 to 1 + translateY -30 to 0 at head position, 300ms ease-out
- Map keys: text column left of list, lines connecting to nodes
- Map update: old key line fades red, new key line draws green
- prefers-reduced-motion: two static diagrams (before/after state)

## Technical Implementation
- SVG viewBox="0 0 540 300"
- State machine 2 steps
- Node position interpolation for move-to-front

## Accessibility
- aria-label="LRU cache: get moves node to head; put inserts at head and evicts tail on overflow"

## Mobile: Scale to 100% width

## Complexity: Complex
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-binary-heap-priority-queue

## Summary
Implements min-heap and priority queue: insert with sift-up, extract-min with sift-down, heap array representation.

## Animation Necessity
YES ó heap tree + array visualization with sift-up/down is the classic heap visual.

## Type: Scroll-triggered, interactive (Insert / Extract / Reset)

## Scope: Inline SVG, 540x340px

## Controls: Insert / Extract-Min / Reset

## Step Plan

**Insert (value 3):**
1. New node appears at bottom of tree (last position). Colored amber.
2. Sift-up: compare with parent. If smaller, swap (nodes swap positions via arc animation). Arrow shows comparison.
3. Continue until heap property restored. Final position highlighted green.

**Extract-Min:**
1. Root node (minimum) highlighted red.
2. Root swapped with last node (arc animation).
3. Last-node-now-root: sift-down. Compare with children, swap with smallest child. Continue.
4. Removed node shown below tree, fading out.

Array representation below tree: always in sync. Swapped cells highlight during swap.

## Visual Behavior Rules
- Tree nodes: circle r=22 fill #1F2937 stroke #374151
- Heap-valid node: stroke #3B82F6
- Active/comparing: stroke #F59E0B fill #92400E
- New insert: stroke #F59E0B opacity 0 to 1 scale 0.5 to 1, 300ms
- Min node: stroke #EF4444 fill #7F1D1D
- Swap arc: dashed path between swapping nodes, animated stroke-dashoffset
- Tree edges: line stroke #4B5563 stroke-width=1.5
- Array cells: rect width=36 height=36 fill #1F2937 stroke #374151, value label
- Active array cell: fill #1E3A5F stroke #3B82F6
- prefers-reduced-motion: static tree + array showing final state per operation

## Technical Implementation
- SVG viewBox="0 0 540 340"
- Heap array backing store
- Tree layout computed from array indices (parent = floor((i-1)/2))
- Node positions pre-computed for 7-node heap

## Accessibility
- aria-label="Binary heap: insert sifts up; extract-min moves last node to root and sifts down"

## Mobile: Scale to 100% width

## Complexity: Complex
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-trie-prefix-tree

## Summary
Implements Trie: character-by-character prefix insertion and search, word completion.

## Animation Necessity
YES ó character traversal through trie nodes is inherently sequential.

## Type: Scroll-triggered, interactive (type to search)

## Scope: Inline SVG, 500x320px

## Controls: Input field (type prefix, trie highlights matching path)

## Step Plan

Pre-built trie with words: "cat", "car", "card", "care", "dog".

1. Initial ó trie displayed as tree: root ? c ? a ? t/r ? r ? d/e.
2. User types "ca" in input: c node lights up (green), then a node lights up. Path to ca highlighted.
3. User types "car": r node lights up. Matching words shown below: "car", "card", "care".
4. User types "card": d node lights up (leaf, word end marker = filled circle). "card" highlighted in word list.
5. Clear: all nodes return to default.

## Visual Behavior Rules
- Trie nodes: circle r=18 fill #1F2937 stroke #374151
- Word-end node: inner circle r=6 fill #10B981
- Active path node: stroke #10B981 fill #064E3B
- Inactive: stroke #374151 fill #1F2937 opacity=0.5
- Edge: line stroke #4B5563 label = character fill #9CA3AF font-size 11px
- Word list: text items font-size 12px fill #9CA3AF, active word fill #F9FAFB
- Input: foreignObject input element, font-size 13px, max-width 120px
- prefers-reduced-motion: input still works; node highlight is instant (no transition)

## Technical Implementation
- SVG viewBox="0 0 500 320"
- Trie data structure in JS
- Input event updates active path in trie tree
- Node colors updated via classList

## Accessibility
- aria-label="Trie search: type a prefix to highlight matching path and see matching words"
- Input label: "Type prefix to search"

## Mobile: Scale to 100% width

## Complexity: Complex
## Priority: High

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-compose-pipe

## Summary
Covers compose (right-to-left) and pipe (left-to-right) function composition.

## Animation Necessity
YES ó data flowing through a function pipeline is a clear spatial metaphor.

## Type: Scroll-triggered, interactive (toggle compose / pipe)

## Scope: Inline SVG, 500x220px

## Controls: Toggle compose / pipe

## Step Plan

Three functions: `double`, `addOne`, `square`. Input value = 3.

**pipe(double, addOne, square)(3):**
- Left to right: 3 enters double (?6), 6 enters addOne (?7), 7 enters square (?49). Value pill flows left-to-right.

**compose(square, addOne, double)(3):**
- Right to left: 3 enters double first (?6), then addOne (?7), then square (?49). Value pill flows right-to-left.

Function boxes labeled with names and operators.

## Visual Behavior Rules
- Function boxes: rect width=80 height=44 rx=6 fill #1F2937 stroke #8B5CF6, label fill #E9D5FF
- Connector arrows: path stroke #8B5CF6 stroke-width=1.5
- Value pill: rect width=40 height=28 rx=4 fill #F59E0B stroke none, value label fill #111827 font-size 12px bold
- Pill animation: translateX along pipeline, 300ms per step with 100ms pause at each box
- Active box: fill #2D1B69 during pill pass-through
- Direction label: "pipe: left-to-right" or "compose: right-to-left" fill #9CA3AF font-size 11px
- prefers-reduced-motion: static showing final value (49) at output with arrow chain

## Technical Implementation
- SVG viewBox="0 0 500 220"
- Toggle switches pill animation direction
- requestAnimationFrame for smooth pill motion

## Accessibility
- aria-label="compose vs pipe: same functions, different direction ó compose right-to-left, pipe left-to-right"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-transduce

## NO ANIMATION NEEDED
Covers transducers as composable, efficient data transformations. Highly abstract FP concept best explained with code. No SVG needed.

---

## Article: js-maybe-either-monad

## NO ANIMATION NEEDED
Covers Maybe and Either monads for null safety and error handling. Abstract algebraic structures best explained with code. No SVG needed.

---

## Article: js-point-free-style

## NO ANIMATION NEEDED
Covers point-free / tacit programming with compose/pipe. Code patterns are the right medium. No SVG needed.

---

## Article: js-immutability-patterns

## NO ANIMATION NEEDED
Covers Object.freeze, structural sharing (Immer), immutable update patterns. Code-focused. No SVG needed.

---

## Article: js-requestanimationframe-idlecallback

## Summary
Covers rAF for visual updates and requestIdleCallback for background work. Frame timing model.

## Animation Necessity
YES ó frame timeline showing rAF (beginning of frame) vs rIC (idle time after frame) placement.

## Type: Scroll-triggered

## Scope: Inline SVG, 520x220px

## Controls: None

## Step Plan

1. Frame timeline ruler (0-100ms, two frames of 16.67ms shown).
2. Frame 1 sections: Input (4px), JavaScript (rAF callback shown as green block, 6px), Style/Layout/Paint (8px), Composite (4px). Idle gap after frame (yellow block, 8px) = rIC fires here.
3. Frame 2: same structure.
4. Labels: "rAF: runs at start of frame before render" (green arrow), "rIC: runs in idle gap" (yellow arrow).
5. If frame is long (JS block expanded): idle gap shrinks. rIC deferred. Label "no idle time ó rIC deferred".

## Visual Behavior Rules
- Frame sections: colored rects using same article 04 color scheme for browser pipeline steps
- rAF block: rect fill #10B981 label "rAF cb" fill #F9FAFB font-size 9px
- Idle block: rect fill #F59E0B label "idle (rIC)" fill #111827 font-size 9px
- Frame boundary: vertical line stroke #4B5563
- Labels: font-size 11px fill #9CA3AF with arrows
- Long frame: JS block width expands (animation), idle gap shrinks, rIC label "deferred" fill #EF4444
- prefers-reduced-motion: static two-frame diagram with labels

## Technical Implementation
- SVG viewBox="0 0 520 220"
- Reuse TimelineBar component
- Frame section widths pre-computed

## Accessibility
- aria-label="rAF fires at frame start for visual updates; requestIdleCallback fires in idle gap after rendering"

## Mobile: Scale to 100% width

## Complexity: Simple
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-web-workers-offscreen

## Summary
Covers Web Workers: off-main-thread computation, postMessage communication, OffscreenCanvas.

## Animation Necessity
YES ó reuse article 21 (web-workers-offscreencanvas) two-thread visualization.

## Type: Scroll-triggered

## Scope: Inline SVG, 520x240px (reuse article 21 component)

## Controls: None

## Step Plan
Identical to article 21 visualization: Main Thread lane (busy with UI) + Worker Thread lane (running computation) + postMessage arrows between them.

## Visual Behavior Rules
- Reuse all article 21 visual rules
- postMessage arrows: stroke #F59E0B animated path

## Technical Implementation
- SVG viewBox="0 0 520 240"
- Reuse article 21 component

## Accessibility
- aria-label="Web Worker: computation runs on separate thread, communicating via postMessage"

## Mobile: Scale to 100% width

## Complexity: Simple (reuse)
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-intersection-observer

## Summary
Covers IntersectionObserver API: threshold, rootMargin, callback on visibility change.

## Animation Necessity
YES ó scrolling viewport with elements entering/leaving intersection zone.

## Type: Scroll-triggered (ironically, the SVG itself demonstrates the concept)

## Scope: Inline SVG, 480x320px

## Controls: Scroll simulation (play/pause)

## Step Plan

1. Viewport rect (blue border) visible in center of SVG. Three element rects below the viewport (initially out of view).
2. "Scroll" animation: elements move upward (translateY), simulating scroll.
3. As first element crosses viewport threshold (10px into viewport): highlight green, callback label fires: "intersecting: true, ratio: 0.1".
4. Element fully inside viewport: fully green, "ratio: 1.0".
5. Element exits top of viewport: gray, "intersecting: false".
6. rootMargin shown as dashed border just outside viewport rect.

## Visual Behavior Rules
- Viewport rect: rect fill none stroke #3B82F6 stroke-width=2
- rootMargin border: same rect expanded by 50px each side, stroke #3B82F6 stroke-dasharray="6 3" opacity=0.5
- Element rects: rect width=180 height=60 rx=6 fill #1F2937 stroke #374151
- Intersecting element: stroke #10B981 fill #064E3B
- Callback label: font-size 10px fill #10B981, slides in from right
- Scroll animation: elements translateY at constant rate, 3s duration loop
- prefers-reduced-motion: static showing one element in each state (outside, intersecting, past)

## Technical Implementation
- SVG viewBox="0 0 480 320"
- CSS animation translateY loop for "scroll" simulation
- IntersectionObserver on real elements in a scrollable container (not SVG simulation)
  OR: JS computes intersection manually for SVG demo

## Accessibility
- aria-label="IntersectionObserver: callback fires when element enters or exits the viewport"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-event-delegation-bubbling

## Summary
Covers event bubbling from target to root, and event delegation: single listener on parent handles child events.

## Animation Necessity
YES ó bubble animation up the DOM tree is the classic visual.

## Type: Scroll-triggered, interactive (click a node)

## Scope: Inline SVG, 480x280px (reuse DOM tree layout)

## Controls: Click any node in the tree

## Step Plan

1. DOM tree shown (document ? div ? ul ? li items).
2. User clicks a li node: click ripple on li (amber circle expands).
3. Event bubbles: li highlights, then ul highlights, then div highlights, then document highlights (amber sequential).
4. Event listener badge (ear icon) on ul shows "caught!" (green flash) ó delegation demo.
5. `event.target` label shown at original li. `event.currentTarget` shown at ul listener.

## Visual Behavior Rules
- Reuse DOM tree node styles from what-is-dom
- Click ripple: circle r=0 to 30 opacity 1 to 0, 400ms, fill #F59E0B
- Bubble highlight: stroke #F59E0B fill #92400E sequential, 200ms per level
- Listener badge: rect fill #10B981 "listener" font-size 9px on ul node
- Caught flash: stroke #10B981 fill #064E3B, 300ms pulse on ul
- target label: font-size 10px fill #F9FAFB below li node
- currentTarget label: font-size 10px fill #10B981 below ul node
- prefers-reduced-motion: static showing bubble path with arrows from li to document

## Technical Implementation
- SVG viewBox="0 0 480 280"
- Click event on li SVG elements
- Sequential timeout-based highlight up tree

## Accessibility
- aria-label="Event bubbling: click on li bubbles up through ul, div, to document; listener on ul catches it via delegation"

## Mobile: Scale to 100% width

## Complexity: Medium
## Priority: Medium

## Completion Checklist
- [ ] Article analyzed
- [ ] Animation necessity evaluated
- [ ] Interaction model finalized
- [ ] Step structure finalized
- [ ] Motion rules finalized
- [ ] Technical notes finalized
- [ ] Accessibility reviewed
- [ ] Mobile behavior reviewed
- [ ] Ready for implementation
- [ ] Implemented
- [ ] Reviewed

---

## Article: js-drag-and-drop

## NO ANIMATION NEEDED
Covers the HTML5 drag-and-drop API and mouse/touch event alternatives. The demo would need to be a real interactive component, not an SVG animation ó out of scope for this spec. No SVG needed.

---

## Article: js-storage-cookies-indexeddb

## NO ANIMATION NEEDED
Covers localStorage, sessionStorage, cookies, and IndexedDB with code examples. Storage comparison table is the right medium. No SVG needed.

---

# Final Summary: Articles Requiring No Animation

The following articles were evaluated and determined to be best served by code examples, tables, or static diagrams rather than animated SVGs. No SVG animation should be implemented for these.

## Performance Series
- (none ó all 29 performance articles received animation specs)

## Project / Deep Dive Articles
- (none ó all project articles received animation specs or deferred to their own UI)

## What-Is Articles
- **what-is-cache-control** ó HTTP header directive reference; static table is clearest.
- **what-is-css-specificity** ó Numeric calculation system; static specificity calculator table is clearest.

## JS Foundations
- **js-equality-coercion** ó == vs === truth tables; static comparison table.
- **js-error-handling** ó try/catch/finally patterns; code examples.
- **js-destructuring-spread-rest** ó Syntax patterns; code examples.
- **js-template-literals** ó Template literal syntax; code examples.

## JS Functions and Arrays
- **js-array-methods-polyfills-1** ó map, filter, reduce polyfills; code examples.
- **js-array-methods-polyfills-2** ó flat, flatMap, every, some polyfills; code examples.
- **js-deep-clone-compare** ó structuredClone, recursive clone; code examples.
- **js-flatten-unflatten-object** ó Nested object algorithms; code examples.

## JS Async
- **js-async-iteration** ó for-await-of; code examples (generators article covers visuals).
- **js-abort-controller** ó AbortController/AbortSignal; code examples.

## JS Objects and Data
- **js-symbols-in-depth** ó Symbol uniqueness, well-known symbols; code examples.
- **js-json-stringify-parser** ó JSON.stringify/parse, replacer/reviver; code examples.
- **js-url-query-parser** ó URLSearchParams; code examples.
- **js-string-templating-engine** ó Tagged template engine; code examples.

## JS Engine and Patterns
- **js-module-systems** ó CJS vs ESM; code comparisons.
- **js-deopt-patterns** ó Deopt triggers; code patterns (JIT article covers the visual).
- **js-singleton-factory-patterns** ó Design patterns; code examples.

## JS Data Structures, FP, Browser APIs
- **js-transduce** ó Transducers; abstract FP, code examples.
- **js-maybe-either-monad** ó Algebraic structures; code examples.
- **js-point-free-style** ó Tacit programming; code examples.
- **js-immutability-patterns** ó Object.freeze, Immer; code examples.
- **js-drag-and-drop** ó Requires real interactive component, not SVG.
- **js-storage-cookies-indexeddb** ó Storage API comparison; table and code.

---

# Implementation Priority Order

## P0 ó Critical (implement first)
Articles whose animations explain the site's core topic (web performance) or appear in the most-visited content:

1. what-is-main-thread
2. what-is-requestanimationframe
3. what-is-fcp
4. what-is-ttfb
5. what-are-long-tasks
6. what-is-react-fiber
7. what-is-reconciliation
8. what-is-virtual-dom
9. js-event-loop-in-depth
10. js-promise-from-scratch
11. js-async-await-under-hood
12. js-lru-cache
13. js-linked-list
14. js-hash-table
15. js-binary-heap-priority-queue
16. js-trie-prefix-tree

## P1 ó High (implement second pass)
17. js-variables-scope-hoisting
18. js-this-demystified
19. js-closures-lexical-scope
20. js-prototypes-inheritance
21. js-v8-jit-compilation (JS series)
22. js-memory-leaks-gc
23. what-is-call-stack
24. what-is-microtask-queue
25. what-is-hydration
26. what-is-react-suspense
27. js-promise-combinators
28. js-generators-iterators
29. js-concurrency-limits

## P2 ó Medium (third pass)
Remaining articles with YES animation ó all Groups 7-13 not listed above.

## P3 ó Low
Articles with LOW priority labels in their specs.

---

# END OF ANIMATED SVG SPECIFICATION
# Total articles specified: 80+
# Total requiring animation: ~55
# Total no-animation: ~25
# Shared components defined: 11
