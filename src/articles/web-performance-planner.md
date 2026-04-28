The Web Performance Planner is a what-if simulator for Core Web Vitals. You enter the characteristics of a web page — resource sizes, server response time, JavaScript execution cost, font strategy — and the tool instantly computes estimated Lighthouse-style scores for both mobile and desktop. Change a value, the scores update in real time. No deployments, no waiting for lab tests.

It's useful in two situations: planning a new page before writing code, and diagnosing an existing page that's underperforming in Lighthouse.

[Open the Web Performance Planner →](/projects/perf-planner)

## How the Scoring Model Works

The simulator uses the same six metrics Lighthouse reports, combined with Lighthouse's published weights:

| Metric | Weight |
|---|---|
| TBT (Total Blocking Time) | 30% |
| LCP (Largest Contentful Paint) | 25% |
| CLS (Cumulative Layout Shift) | 15% |
| FCP (First Contentful Paint) | 10% |
| SI (Speed Index) | 10% |
| TTI (Time to Interactive) | 10% |

Each metric's raw value is converted to a 0–100 score using a **log-normal distribution** — the same error function (erf) approach Lighthouse uses internally. The median and p10 values that parametrize the curve are configurable in the Settings panel, so you can tune the simulator to match a specific Lighthouse version or scoring configuration.

### Network Profiles

The **mobile** profile simulates a throttled 4G connection: 150ms RTT, 200 KB/s download bandwidth, and a 4× CPU slowdown. The **desktop** profile uses 40ms RTT, 1,250 KB/s, and no CPU penalty. Both scores are always computed and shown side by side — the mobile score usually reveals more room for improvement.

## Pages and Variations

The tool is organized around **pages** and **variations**.

A **page** represents one URL you're modeling (e.g., `/`, `/product`, `/checkout`). A **variation** is a named configuration within that page — a set of inputs you want to test.

Typical variations on a single page:
- `Baseline` — current production numbers from a Lighthouse report
- `With CDN` — same inputs but CDN enabled and TTFB reduced
- `Defer JS` — loading strategy changed from render-blocking to `defer`

Each variation tab shows its overall mobile score as a badge. Switch tabs and the full dashboard updates immediately.

## The Input Panel

The input panel has eight sections covering different stages of the browser's load pipeline. There are 34 fields in total.

### Server

TTFB, HTTP protocol (1.1 / H2 / H3), CDN toggle, and compression method (none / gzip / brotli).

The protocol choice matters more than expected. HTTP/1.1 caps parallel connections at 6, which creates queue delays when you load many resources. HTTP/2 multiplexes all requests over one connection. HTTP/3 adds a QUIC gain on top of that, eliminating head-of-line blocking at the transport layer.

Compression ratios the simulator uses internally:
- **gzip**: ~0.72× for HTML/CSS, ~0.75× for JS, ~0.85× for fonts
- **brotli**: ~0.62× for HTML/CSS, ~0.64× for JS, ~0.75× for fonts

### HTML

Document size, whether you inline critical CSS, and whether you have inline JS in the `<head>`.

### CSS

Total stylesheet size, number of files, and whether any are render-blocking. A render-blocking stylesheet holds up FCP until it fully downloads — `media` queries or `preload` + `as="style"` eliminate this.

### JavaScript

Total JS size, largest bundle size, number of script files, loading strategy (render-blocking / defer / async / module), main thread execution time, and long task count.

Long tasks are the primary driver of TBT. Any main-thread task exceeding 50ms contributes its excess milliseconds to the total blocking time. A 200ms long task adds 150ms of TBT.

### LCP Resource

LCP element type (text, image, background image, or video), its size, format, and whether it's preloaded with `fetchpriority="high"`. A preloaded LCP image can cut LCP by 200–400ms on mobile.

### Fonts

Number of web fonts, total font size, `font-display` strategy, and whether fonts are preloaded. `font-display: swap` prevents invisible text but can cause layout shift. `font-display: optional` eliminates shift but may fall back to system fonts on slow connections.

### Third Party

Count of third-party scripts, their total size, execution time, and whether any block rendering. Third-party scripts that execute on the main thread contribute directly to TBT.

### Layout Stability

Base CLS value, whether images are missing `width`/`height` attributes, whether you inject dynamic content above existing content, and whether font-swap causes layout shift. Each source is weighted and summed.

## The Resource Panel

At the top of the input panel is a **Resource Panel** — a per-file simulator that lets you model individual JS bundles, CSS files, images, fonts, and third-party scripts with more precision than the aggregate fields.

For each resource you specify:

- **Type**: JS, CSS, image, font, or third-party
- **Source**: same-origin, own CDN, or third-party (affects effective RTT)
- **Loading**: render-blocking, async, defer, preload, or lazy
- **Compression**, **size**, and **count**
- For JS: execution time and long task duration
- For images: format (JPEG, WebP, AVIF, PNG, SVG) and an LCP toggle

The simulator calculates each resource's download time using a **TCP slow-start model** where the congestion window doubles each round trip. HTTP/1.1 resources queue when more than 6 connections are already open. Render-blocking resources delay FCP directly. Deferred and async scripts still execute on the main thread and add to TBT.

## Reading the Dashboard

The dashboard shows two score cards — **Mobile** and **Desktop** — each containing:

- A **circular gauge** for the overall score (green ≥ 90, orange ≥ 50, red < 50)
- One row per metric with its raw value, color rating, and weighted sub-score
- A **delta pill** on non-baseline variations showing how much each metric changed vs. the baseline
- A **load waterfall** that breaks the timeline into segments: TTFB → HTML → CSS → JS → LCP Resource → Paint

The waterfall is the fastest way to spot your bottleneck. A wide CSS segment means render-blocking stylesheets. A long JS segment means a large bundle on a throttled connection. A wide TTFB bar means server response time is the limiting factor.

## The Optimization Roadmap

The roadmap scans **24 optimization levers** and ranks them by mobile score gain — the change that moves the needle most appears first.

Each card shows:

- What to change and the target value (e.g., `compression: none → brotli`)
- Which metrics improve and by how much (e.g., `FCP −180ms, LCP −240ms`)
- Effort label: **Easy** (a config change or one HTML attribute), **Medium** (some refactoring), **Hard** (significant engineering work)

### Locking Fields

If a suggestion isn't feasible — maybe you can't switch CDN vendors, or your design requires a background image as the LCP element — click the lock icon on that field. Locked fields are excluded from the roadmap so suggestions stay relevant to what you can actually do.

## Comparison Mode

Switch to **Comparison Mode** to view up to four variations side by side. Each appears in a column with its full metric breakdown. The best value per metric is highlighted green; the worst is red.

This makes trade-off analysis concrete: "does adding the analytics script cost 4 points or 0.5 points?" Once you can see the delta across variations simultaneously, the decision is easy.

## Customizing the Simulation

The **Settings panel** (gear icon in the top bar) exposes the full simulation model:

- **Network profiles**: adjust RTT, bandwidth, and CPU multiplier for mobile and desktop
- **Scoring weights**: change the per-metric contribution percentages (must sum to 100%)
- **Scoring curves**: set the median and p10 values for each metric's log-normal distribution — useful for calibrating the simulator against a specific Lighthouse version
- **Connection model**: HTTP/1.1 parallel connection limit, QUIC gain factor, TCP initial congestion window, and 0-RTT toggle

Settings can be exported as JSON and shared with teammates so everyone simulates under the same model.

## Persistence and Sharing

Everything auto-saves to **IndexedDB** as you type — there's no save button and no account required. The v2 schema stores pages, variations (indexed by `pageId`), and settings in separate object stores.

Any page and its variations can be exported as a JSON file and imported on another machine. This is the only sharing mechanism, which keeps the tool entirely local and offline-capable.

## A Practical Workflow

**For a new page being designed:**

1. Create a baseline variation with your intended resource budget (target JS size, number of fonts, etc.)
2. Check the projected mobile score — if it's below 70, tighten the budget before writing any code
3. Use the roadmap to find which constraints matter most (usually JS size and main thread execution time)

**For an existing page that's underperforming:**

1. Run Lighthouse on the page and pull the six key metric values from the report
2. Enter them as your baseline variation
3. Read the roadmap from top to bottom — the first few cards are the highest-leverage fixes
4. Create a new variation for each fix you're considering to model the combined impact before committing

---

[Open the Web Performance Planner →](/projects/perf-planner)
