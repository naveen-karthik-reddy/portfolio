# Performance #30 - Performance Budgets & CI Enforcement

A performance budget is a constraint on a metric — a number your team agrees not to exceed. Without a budget, performance degrades silently: each pull request adds a small cost that seems acceptable in isolation, and six months later the page is twice as slow as it was. Budgets make performance a requirement, not an afterthought.

---

## What a Performance Budget Covers

Budgets can be set on three categories of metrics:

**Quantity-based** — raw counts and sizes:
- Total JS bundle size (compressed): e.g., < 200KB
- Total page weight: < 1MB
- Number of HTTP requests: < 50
- Image count or total image weight

**Rule-based** — Lighthouse audit scores:
- Performance score: ≥ 90
- No individual audit below a threshold

**Timing-based** — field or lab metrics:
- LCP: < 2.5s
- INP: < 200ms
- TBT: < 200ms
- FCP: < 1.8s

Timing-based budgets are the most meaningful but hardest to enforce in CI because they vary by test environment. Start with bundle size budgets — they're deterministic, fast to measure, and directly causally related to performance.

---

## Lighthouse CI

Lighthouse CI runs Lighthouse on every pull request and fails the build if metrics drop below thresholds.

```bash
npm install -g @lhci/cli
```

```yaml
# .github/workflows/lhci.yml
name: Lighthouse CI
on: [pull_request]

jobs:
  lhci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci && npm run build
      - run: lhci autorun
```

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run preview",
      "url": ["http://localhost:4173"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "cumulative-layout-shift": ["warn", { "maxNumericValue": 0.1 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

Failed assertions block the PR merge. `numberOfRuns: 3` averages multiple runs to reduce variance in the timing metrics. The `upload` config posts the full Lighthouse report as a link in the PR.

---

## Bundle Size Budgets with size-limit

`size-limit` by Andrey Sitnik measures the compressed size of your JS bundles and fails CI if they exceed a threshold.

```bash
npm install --save-dev size-limit @size-limit/preset-app
```

```json
{
  "size-limit": [
    {
      "path": "dist/assets/*.js",
      "limit": "200 kB",
      "import": "*"
    },
    {
      "path": "dist/assets/*.css",
      "limit": "30 kB"
    }
  ],
  "scripts": {
    "size": "size-limit"
  }
}
```

`size-limit` reports gzip and Brotli sizes by default. It also reports the time to parse and execute the bundle on a simulated slow device — a more meaningful number than raw bytes.

Add it to CI:

```yaml
- run: npm run build && npm run size
```

A pull request that pushes the bundle over the limit fails immediately, with a clear message showing the delta:

```text
  dist/assets/*.js
  Size limit:   200 kB
  Size:         217.3 kB (+17.3 kB, +9%)  ❌
```

---

## bundlesize (Alternative)

`bundlesize` is a simpler tool for projects that just need size checks without the parse-time simulation:

```json
{
  "bundlesize": [
    { "path": "./dist/assets/*.js", "maxSize": "200 kB" },
    { "path": "./dist/assets/*.css", "maxSize": "50 kB" }
  ]
}
```

---

## Setting Realistic Budgets

Don't set a budget based on what you wish the numbers were. Set it based on where you are now, then tighten it over time.

A practical process:
1. Measure current metrics (Lighthouse, bundle sizes) on the main branch.
2. Set the initial budget at current values + 10% buffer.
3. Tighten the budget by 5–10% each quarter as the team improves the codebase.
4. Record the rationale for each budget value — what user experience does it protect?

A budget that's never triggered provides no value. A budget that blocks every PR creates friction without insight. Aim for "fails occasionally, but always for a good reason."

---

## Budget Violations as Learning Opportunities

When a budget fails, the team should understand why before they fix it:
- Was it a new dependency that could be replaced with something lighter?
- Was it a feature that should be code-split and loaded on demand?
- Was it a legitimate new feature that warrants a budget increase?

Treat each failure as a data point about the codebase's trajectory, not just a gate to bypass.

---

The real value of a performance budget isn't the tooling — it's that it forces a conversation at the point of change, before the regression ships. Size-limit and Lighthouse CI are just the mechanism. The habit of treating performance as a first-class constraint, like correctness or security, is what makes the difference over time.
