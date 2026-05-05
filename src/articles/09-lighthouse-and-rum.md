A Lighthouse score of 95 is satisfying. It's also possible to have a 95 on Lighthouse while your actual users — on budget Android phones, throttled home connections, with four browser extensions running — are seeing poor CLS and sluggish interactions. Lab tools and field data answer different questions, and you need both to close that gap.

---

## Lab Data vs Field Data

**Lab data** is collected in a controlled, reproducible environment. You run a tool against your URL, it simulates a device and network, and reports metrics. Lighthouse is the most widely used lab tool.

**Field data** (also called Real User Monitoring or RUM) is collected from actual browsers as real users navigate your site. It reflects the diversity of devices, networks, and geographies your users actually have.

| | Lab | Field |
|---|---|---|
| Reproducible | ✅ | ❌ |
| Reflects real users | ❌ | ✅ |
| Measures INP | ❌ | ✅ |
| Available before launch | ✅ | ❌ |
| Used by Google ranking | ❌ | ✅ |

---

## How Lighthouse Works

Lighthouse is an automated auditing tool built into Chrome DevTools, available as a CLI, and the engine behind PageSpeed Insights.

**The process:**
1. Lighthouse opens a controlled Chrome instance with a throttled CPU and network profile (simulating a mid-tier mobile device on a 4G connection by default).
2. It loads the page from scratch and records a performance trace.
3. It extracts raw metric values (LCP time, CLS score, TBT duration, etc.) from the trace.
4. It maps each metric value to a score (0–100) using a **log-normal distribution** fitted to real-world CrUX data.
5. It combines per-metric scores into an **overall Performance score** using fixed weights.

**Current metric weights (as of Lighthouse 12):**

| Metric | Weight |
|--------|--------|
| Largest Contentful Paint (LCP) | 25% |
| Total Blocking Time (TBT) | 30% |
| Cumulative Layout Shift (CLS) | 25% |
| First Contentful Paint (FCP) | 10% |
| Speed Index (SI) | 10% |

> Note: Lighthouse uses **Total Blocking Time (TBT)** as a lab proxy for **INP**, since INP requires real user interaction to measure.

---

## The Scoring Model

Each metric is scored on a log-normal distribution. The distribution is calibrated so that a "good" metric value (the CrUX 75th percentile threshold) maps to a score of 90.

This means:
- Small improvements near the poor threshold produce large score gains.
- Small improvements at the top end produce small gains.
- An overall score of 90+ is hard to achieve because all metrics must be near their "good" thresholds simultaneously.

The overall score is a weighted average of individual metric scores — not a weighted average of metric *values*.

---

## Lighthouse's Limitations

**Variability:** Even in controlled conditions, Lighthouse scores vary run-to-run. CPU throttling is simulated in software and is sensitive to machine load. Run Lighthouse 3–5 times and use the median.

**Simulated throttling ≠ real network:** Lighthouse's default "Mobile" profile simulates a Moto G4 on a slow 4G connection using synthetic CPU and network throttling. This is an approximation. Real devices on real networks behave differently.

**No real interaction:** Lighthouse can't measure INP — it requires a user to actually interact with the page.

**Single page load:** Lighthouse measures a cold load. Returning visitors with warm caches, or users who have already loaded shared scripts, will have very different experiences.

---

## Real User Monitoring (RUM)

RUM collects Core Web Vitals from real browsers using the browser's built-in Performance APIs:

```js
import { onLCP, onCLS, onINP } from 'web-vitals';

onLCP(({ value, rating }) => sendToAnalytics({ metric: 'LCP', value, rating }));
onCLS(({ value, rating }) => sendToAnalytics({ metric: 'CLS', value, rating }));
onINP(({ value, rating }) => sendToAnalytics({ metric: 'INP', value, rating }));
```

The `web-vitals` library (by Google) wraps these APIs and handles edge cases.

**What RUM tells you that Lighthouse can't:**
- The 75th percentile experience across your actual user base
- INP — which interactions are slow and how often
- Performance breakdowns by device type, country, or connection type
- Whether a Lighthouse improvement actually helped real users

**Free sources of field data:**
- **Chrome User Experience Report (CrUX):** Aggregated data from Chrome users, available via PageSpeed Insights, Search Console, and the CrUX API.
- **PageSpeed Insights:** Shows both Lighthouse lab data and CrUX field data side by side.

**Self-hosted RUM:** Tools like Grafana + InfluxDB, or SaaS products like SpeedCurve, Calibre, or Datadog RUM, let you collect and analyse your own user data.

---

## Using Both Together

The right workflow:

1. **Use Lighthouse** for rapid iteration during development. It's fast, reproducible, and gives actionable diagnostics (not just scores).
2. **Use PageSpeed Insights** (or CrUX) to validate that your improvements are moving field metrics for real users.
3. **Use RUM** for ongoing monitoring. Set up alerts when CWV field scores degrade after a deploy.

Lighthouse score improvements that don't move field metrics aren't wasted — they often reflect real changes that just haven't accumulated enough data yet. But if weeks pass with no improvement in CrUX, you're likely optimizing something your real users don't hit. Field data is the ground truth.
