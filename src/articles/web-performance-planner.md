The usual loop for improving Lighthouse scores goes like this: you have an idea, you make a code change, you build, you deploy to staging, you run Lighthouse, you wait 30–60 seconds, you get a number. Then you realise the score fluctuated by 8 points from the previous run just due to network variance — so you run it again. And again. Then you're not sure if your change actually helped or if you're just seeing noise.

That loop is slow, noisy, and demoralising. A 5-point improvement on a 500KB JS bundle is invisible inside Lighthouse's natural variance. You can't compare two ideas side by side. You can't tell your team "deferring this script saves 12 points" with any confidence.

The Web Performance Planner moves the feedback loop entirely out of production. You import a real Lighthouse report and the tool simulates Core Web Vitals scores in real time. Change a loading strategy, the score updates instantly. Defer a script, reduce TTFB, enable a CDN, mark an image as high priority — every change produces a deterministic, comparable result. No deployments. No waiting. No variance.

[Open the Web Performance Planner →](/projects/perf-planner)

---

## Why This Changes How You Work

Without a simulator, you're flying blind between Lighthouse runs. Every experiment requires a full code → build → deploy → measure cycle. You can't safely answer questions like "does deferring this script matter more than reducing its size?" without building two separate versions and running Lighthouse on both — multiple times each, because of variance.

With the planner, that question takes about 30 seconds. Create two variations, change one thing in each, compare side by side. The numbers are deterministic — the same input always produces the same output — so differences between variations are real, not noise.

This also changes how you plan work. Before writing a single line of code, you can model your target architecture and see what score it will produce. If your proposed resource budget won't reach a score of 75, you know that before you build it. The planner becomes a constraint-checking tool that catches performance problems at the design stage instead of the post-deploy stage.

---

## Start with a Lighthouse Report

The planner starts from a real Lighthouse report. When you import a JSON report, the tool extracts every resource from your page — sizes, loading strategies, JavaScript execution times, font strategies, measured network timings — and then fits its simulation curves so the overall score matches your real score exactly. From that point, every what-if change is a calibrated prediction based on your actual page, not a generic estimate.

**To get your Lighthouse JSON:**
Open Chrome DevTools, go to the Lighthouse tab, run an analysis, and when it finishes click the download icon and choose "Save as JSON". That file is what the planner needs.

**To import it:**
Click "Calibrate from Lighthouse" on the welcome screen, upload the file, review the preview — it shows your real metrics, the fitted simulation accuracy, detected CDN status, and a breakdown of every resource it found — then click "Create page". The planner creates a calibrated baseline variation with all your real resources pre-populated.

You can recalibrate at any time without losing your variations. If you've re-run Lighthouse after shipping improvements, recalibrating updates the baseline to match your new real-world numbers.

### How Calibration Works

Under the hood, the planner extracts all five Core Web Vitals metrics from your Lighthouse JSON, then runs a two-pass curve-fitting algorithm. Pass 1 adjusts per-metric scoring curves via binary search until each simulated metric score matches the real one within 0.5 points. Pass 2 applies a uniform global nudge if the overall score still diverges by more than 1 point. The result is a scoring model that reproduces your real Lighthouse numbers exactly.

A resource hash fingerprint is computed from the page's resources — `type:sizeKB:loading:source:count` for each — so the planner knows when the current resource set matches the calibrated state. When the hashes match, the dashboard shows your real FCP and LCP values directly. When you modify resources (and the hash diverges), it switches to simulated values.

---

## Pages and Variations

The planner is organised around two concepts: pages and variations.

A **page** is one URL you're modelling — your homepage, product page, checkout flow. You can have as many pages as you want. Each page has its own calibration, its own resources, and its own saved variations. Switch between pages from the dropdown in the top bar.

A **variation** is a named configuration within a page. Every page starts with a baseline variation — your current real-world state. From there you create variations to explore hypothetical changes.

Each variation is a full independent snapshot: its own resource list, its own TTFB setting, its own CDN state. Creating a new variation clones the baseline so you always start from a known reference point, then diverge from there. Rename variations to describe what you're testing — "defer analytics", "preload hero image", "with CDN + reduced TTFB" — so they're readable at a glance.

The variation tabs at the top of the page each show a mobile score badge. You can see at a glance which configuration scores best without switching to comparison mode. Clicking a tab instantly updates the entire dashboard — score cards, waterfall, roadmap — to reflect that variation's numbers.

---

## The Dashboard

After selecting a variation, the right side of the screen shows the performance dashboard.

At the top is a profile toggle for **Mobile** and **Desktop**. Both are always computed — the toggle just controls which one is displayed in detail. The mobile score is almost always lower and is the number that matters for Google's Page Experience ranking signal. It simulates a throttled slow-4G connection (150ms round-trip time, 200 KB/s bandwidth) with a 4× CPU slowdown applied to all JavaScript execution. Desktop simulates a cable connection (40ms RTT, 1,250 KB/s) with no CPU penalty.

Below the toggle is the **score card** — a large gauge showing the overall 0–100 performance score, followed by five metric rows. The overall score is a weighted combination:

| Metric | Weight | What it measures |
|--------|--------|------------------|
| Total Blocking Time (TBT) | 30% | Main thread blocking during load |
| Largest Contentful Paint (LCP) | 25% | When the largest visible element renders |
| Cumulative Layout Shift (CLS) | 25% | Unexpected layout movement during load |
| First Contentful Paint (FCP) | 10% | When anything first appears on screen |
| Speed Index (SI) | 10% | How quickly content fills in progressively |

Each metric row shows the value, a colour-coded sub-score bar, the contribution to the overall score, and a delta pill comparing against the baseline variation. The colour coding follows Lighthouse conventions: green (≥90), orange (≥50), red (<50).

CLS is not simulated from resource properties — it always reflects the imported Lighthouse value. Resource changes like adding image dimensions or changing font-display don't currently affect the CLS score.

---

## The Resource Waterfall

Each score card contains a waterfall — a timeline showing every file your page loads as a horizontal bar. The bar spans the resource's full lifecycle, broken into the same timing phases Chrome DevTools shows: DNS lookup, initial connection, SSL handshake, request sent, waiting for the first byte (TTFB), and content download. Each phase has a distinct colour matching Chrome's conventions.

The download bar uses a colour per resource type — red for JavaScript, amber for CSS, blue for HTML documents, purple for fonts, green for images, teal for API requests — so you can identify what's consuming time at a glance.

One thing the waterfall makes explicit that standard Lighthouse summaries hide: for most resources on a well-optimised page, the bar is mostly grey "Waiting (TTFB)" with only a small coloured download segment at the end. A 1 KB script sitting next to a 150 KB library can have identical finish times — not because the small file is slow to download, but because both requests were queued on the same H2/H3 connection and the server responded to them in parallel. The tool decomposes the download time into server wait and actual transfer, so you can see at a glance whether your time is going into bytes-in-flight or into the server deciding to send them.

Two vertical markers show where FCP and LCP fall across your resource timeline. If LCP fires long after most resources have finished, that tells you your LCP element isn't being prioritised. If FCP is late, look at what render-blocking resources appear before it.

You can scroll over the ruler to zoom into any time window, drag horizontally to pan, and drag vertically to scroll through long resource lists. This is useful for dense pages with many requests where bars compress together at the default scale.

When you import from Lighthouse, the waterfall uses your actual measured timings — so the bars reflect what really happened in the browser, not a model approximation. For JavaScript resources, the waterfall also shows parse/compile (cyan) and script evaluation (magenta) phases extending beyond the download bar, sourced from Lighthouse's bootup-time audit.

---

## The Optimization Roadmap

Below the score card is the roadmap — a ranked list of every available optimisation, sorted by how much each one would improve your mobile score. The highest-leverage change is always at the top.

Each suggestion tells you what to change, what the target value would be, which specific metrics improve, and by exactly how much. The effort label tells you the cost: Easy means a config change or a single HTML attribute, Medium means some refactoring, Hard means significant engineering.

Suggestions include things like converting images to AVIF, deferring render-blocking scripts, adding `fetchpriority="high"` to the LCP image, switching fonts to `font-display: optional`, adding missing image dimensions, enabling CDN, or reducing TTFB.

If a suggestion isn't feasible for your situation — maybe you can't change a third-party script, or your design requires a specific image format — click the lock icon on that card. It won't reappear in the roadmap, and the remaining suggestions recalculate around your actual constraints.

You can apply any suggestion directly from the roadmap. It patches the resource or page meta in your current variation and the scores update immediately.

---

## Comparison Mode

Once you have two or more variations, switch to Comparison Mode with the Compare button in the top bar. Select up to four variations and they appear side by side, each in its own column showing all five metric scores and the overall.

The best value per metric is highlighted green across the columns. The worst is highlighted red. This makes trade-offs concrete in a way that looking at variations one at a time never does. You can see immediately whether deferring the analytics script saves more than compressing the hero image, whether combining both changes compounds or if one dominates, and what the ceiling is for the improvements you're considering.

Comparison mode always uses the mobile profile.

---

## Page Meta Controls

Above the resource list on the left side, two controls affect the whole page simulation.

**TTFB** is your server's response time in milliseconds — how long from the browser sending a request to receiving the first byte of HTML. Everything else on the page waits for this to finish before it can start. The roadmap will flag it if your TTFB is above 200ms.

**CDN** is a toggle that simulates having your static assets served from an edge node close to the user. Enabling it reduces the effective round-trip time for same-origin resources by about 60%. On a mobile connection where RTT is 150ms, that drops to around 60ms for cached assets — a meaningful difference when you have many resources.

---

## Settings

The settings panel (gear icon in the top bar) lets you tune the underlying simulation model.

Under **Network Profiles** you can adjust RTT, bandwidth, and CPU multiplier for mobile and desktop independently. If your real users are on faster or slower connections than Lighthouse's defaults, you can model your actual audience.

Under **Scoring Weights** you can change how much each metric contributes to the overall score. Useful if you have a specific product reason to weight TBT or CLS differently — or to see what your score would look like under a hypothetical future Lighthouse version with different weights.

Under **Scoring Curves** you can adjust the log-normal CDF parameters for each metric. The default values match Lighthouse's published thresholds. Adjusting p10 and median values lets you calibrate against a custom performance budget — for example, if your team has committed to an LCP under 2.0s as the "good" threshold rather than Lighthouse's default 2.5s.

Under **Connection Model** you can configure HTTP/1.1 parallel connection limits, TCP initial congestion window size, and HTTP/3 QUIC gain factor. These rarely need changing, but they're useful if you're specifically investigating protocol-level tradeoffs.

Settings can be exported as JSON and shared with teammates so everyone on the team runs the same simulation assumptions.

---

## Sharing and Persistence

Everything saves automatically to your browser's local storage as you work. There's no account, no server, no save button. Nothing leaves your machine.

Under the hood, the tool uses IndexedDB for storage with a 500ms debounced auto-save on every variation change. Pages, variations, and settings persist across browser sessions.

To share your work, open the Page Manager (top bar), click the export icon on any page card, and share the `.json` file. Anyone can import it and see the same pages, variations, calibration, and scores you do — ready to explore their own what-if changes from your baseline.

---

## A Real Example of the Workflow

Imagine your homepage scores 54 on mobile Lighthouse. The team is aiming for 70 before the next release. Here's what the planner workflow looks like:

You import your Lighthouse JSON. The simulated score lands at 54, matching your real number. The waterfall shows a large third-party analytics script loading as render-blocking, pushing FCP to 4.3 seconds. TBT is 680ms — most of it from that same script executing on the main thread.

You open the roadmap. The top suggestion is deferring that script — estimated gain of plus 11 points. You create a variation called "defer analytics", change the script's loading to defer. Score jumps to 65.

The roadmap now shows "Enable CDN" as the top remaining suggestion — estimated plus 5 points. You create another variation called "defer + CDN", enable CDN, drop TTFB to 80ms. Score reaches 71.

You switch to Comparison Mode. The baseline is at 54, "defer analytics" is at 65, "defer + CDN" is at 71. The metrics column shows exactly which numbers drove the change — FCP dropped from 4.3s to 2.1s, TBT dropped from 680ms to 290ms.

That whole process took about 10 minutes and involved zero code changes. You now know the exact two things to implement, their individual contributions, and the expected final score. What would have taken a week of incremental deploys and noisy Lighthouse runs became a planning session.

[Open the Web Performance Planner →](/projects/perf-planner)
