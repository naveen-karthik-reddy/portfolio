# Performance #17 - Priority Hints & Fetch Priority

The browser fetches dozens of resources during a page load and has to decide what order to request them. Its heuristics are good but not perfect — it doesn't know that your hero image matters more than a below-fold carousel image, or that one analytics script is less important than your app bundle. The `fetchpriority` attribute lets you correct those assumptions.

---

## How the Browser Prioritizes Resources

By default, the browser assigns priority based on resource type and position in the document:

| Resource | Default priority |
|---|---|
| HTML | Highest |
| Render-blocking CSS | Very High |
| Preloaded fonts | High |
| Images in viewport | High |
| Images outside viewport | Low |
| Async scripts | Low |
| `<script>` in head | High |

These defaults work for most pages. Problems arise when the browser's heuristic disagrees with your actual priorities — for example, it assigns High priority to a decorative header image because it's technically "in viewport", but your LCP is a different image below it.

---

## The fetchpriority Attribute

`fetchpriority` accepts three values: `high`, `low`, and `auto` (default).

```html
<!-- ✅ Boost the LCP image — tell the browser this one actually matters -->
<img src="hero.webp" fetchpriority="high" alt="Hero" />

<!-- ✅ Deprioritize carousel images that aren't immediately visible -->
<img src="slide-2.webp" fetchpriority="low" alt="Slide 2" />

<!-- ✅ Deprioritize a non-critical script so it stops competing with real resources -->
<script src="analytics.js" fetchpriority="low" defer></script>

<!-- ✅ Boost a preloaded resource within its priority tier -->
<link rel="preload" href="critical.js" as="script" fetchpriority="high" />
```

---

## The LCP Image Use Case

The single most impactful use of `fetchpriority` is on the LCP image. Without it, the browser may delay fetching it behind other High-priority resources discovered earlier in the document.

```html
<head>
  <!-- Preload + high priority: browser fetches this before anything else at the same tier -->
  <link rel="preload" as="image" href="hero.webp" fetchpriority="high" />
</head>
<body>
  <img src="hero.webp" fetchpriority="high" alt="Hero" width="1200" height="630" />
</body>
```

Both the preload hint and the `<img>` tag carry `fetchpriority="high"`. This tells the browser unambiguously: fetch this before anything else at the same priority tier.

Google's research shows this can improve LCP by 5–10% on pages where the LCP image was already being preloaded.

---

## Deprioritizing Non-Critical Resources

Below-fold images, non-essential third-party scripts, and deferred stylesheets can be explicitly deprioritized so they don't compete with above-fold critical resources:

```html
<!-- ❌ Without fetchpriority — below-fold image competes with above-fold content -->
<img src="product-2.webp" loading="lazy" alt="..." />

<!-- ✅ With fetchpriority — explicitly yields to higher-priority resources -->
<img src="product-2.webp" fetchpriority="low" loading="lazy" alt="..." />

<!-- ✅ Non-essential third-party widget deprioritized -->
<script src="https://cdn.example.com/widget.js" fetchpriority="low" defer></script>
```

`fetchpriority="low"` on an async/defer script effectively says: load this after my critical resources, even if the network is idle.

---

## fetch() API

`fetchpriority` also works in the `fetch()` API via the `priority` option:

```js
// High-priority data fetch — user is waiting on this
const data = await fetch('/api/search', { priority: 'high' });

// Low-priority background prefetch — speculative, not blocking anything
fetch('/api/recommendations', { priority: 'low' });
```

---

## What It Doesn't Do

`fetchpriority` adjusts the **relative priority** within the browser's scheduler — it doesn't guarantee ordering. A `low` priority resource may still load before a `high` priority one if the latter is discovered later. Think of it as a hint to the scheduler, not a strict ordering constraint.

It also doesn't replace `preload` — you still need `<link rel="preload">` to move resource discovery earlier. `fetchpriority` then ensures the preloaded resource is scheduled at the right tier.

`fetchpriority="high"` on your LCP image is one of the cheapest LCP wins available — a single HTML attribute with no JavaScript required. The deprioritization side is just as useful: every non-critical resource you push down the queue is bandwidth and scheduler capacity reclaimed for what actually matters on the current page.
