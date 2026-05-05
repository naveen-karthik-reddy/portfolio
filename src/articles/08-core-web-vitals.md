Three numbers — LCP, CLS, INP. Google's Core Web Vitals are deliberately narrow: they don't try to capture everything about a page's performance, just the three moments that consistently correlate with whether users feel a page is fast and stable. Since 2021 they've been a confirmed ranking signal, but more practically, improving them tends to improve the experience in ways users actually notice.

---

## Why These Three?

Google analysed its data on user behaviour and found that three moments define the loading and interaction experience most strongly:

- **Loading** — does the main content appear fast?
- **Visual stability** — does the page jump around as it loads?
- **Interactivity** — does the page respond quickly to user input?

Each Core Web Vital targets one of these dimensions.

---

## Largest Contentful Paint (LCP)

**What it measures:** The render time of the largest visible content element — typically a hero image, a large text block, or a video poster. It marks the point when the user perceives the main content as loaded.

**Threshold:**
- Good: ≤ 2.5s
- Needs improvement: 2.5s – 4s
- Poor: > 4s

**Common LCP elements:**
- Hero images (`<img>`, `background-image`)
- Large text blocks (H1, lead paragraph)
- Video poster frames

**What degrades LCP:**
- Slow server response (high TTFB)
- Render-blocking CSS or JavaScript delaying paint
- LCP image not preloaded or lazy-loaded by mistake
- Images served without width/height (causing layout recalculations)

**How to improve LCP:**

```html
<!-- ❌ LCP image discovered late — browser finds it only after parsing the full HTML -->
<img src="/hero.webp" alt="Hero">

<!-- ✅ Preloaded in <head> — starts downloading in parallel with HTML parse -->
<link rel="preload" as="image" href="/hero.webp">

<!-- ❌ Never lazy-load the LCP image — it pushes the metric out by the time
     the browser decides the image is near the viewport -->
<img src="/hero.webp" loading="lazy" alt="Hero">

<!-- ✅ Eager loading (the default) is correct for above-the-fold images -->
<img src="/hero.webp" loading="eager" alt="Hero" width="1200" height="600">
```

Other high-impact fixes: serve images in WebP/AVIF, reduce TTFB with a CDN, and eliminate render-blocking resources from the critical path.

---

## Cumulative Layout Shift (CLS)

**What it measures:** The sum of all unexpected layout shift scores during the page's lifespan. A layout shift occurs when a visible element changes its position on screen without user input.

**Threshold:**
- Good: ≤ 0.1
- Needs improvement: 0.1 – 0.25
- Poor: > 0.25

**The score** is calculated per shift event as: `impact fraction × distance fraction`. Multiple shifts compound into the cumulative score.

**Common causes of CLS:**
- Images without `width` and `height` attributes — the browser can't reserve space before the image loads
- Ads, embeds, or iframes without reserved dimensions
- Web fonts causing text to reflow when they load (FOUT)
- Dynamically injected content above existing content (banners, cookie notices)
- Animations that change layout properties instead of using `transform`

**How to improve CLS:**

```html
<!-- ❌ No dimensions — browser can't reserve space, content shifts when image loads -->
<img src="product.jpg" alt="Product photo">

<!-- ✅ Explicit dimensions let the browser hold the space from the start -->
<img src="product.jpg" alt="Product photo" width="400" height="300">
```

```css
/* ❌ Animating top/left causes layout — triggers shift on every frame */
.toast {
  transition: top 0.3s ease;
  top: -60px;
}
.toast.visible { top: 20px; }

/* ✅ transform doesn't affect layout — no CLS, and it's GPU-composited */
.toast {
  transition: transform 0.3s ease;
  transform: translateY(-80px);
}
.toast.visible { transform: translateY(0); }
```

For ads and embeds, reserve space with a fixed `min-height` on the container. For font FOUT, use `font-display: optional` if the shift is severe, or size your fallback font to closely match the web font metrics.

---

## Interaction to Next Paint (INP)

**What it measures:** The latency of the *worst* interaction (click, tap, or keypress) during a page session — specifically, the time from when the user interacts to when the browser produces the next visual update in response.

INP replaced First Input Delay (FID) as a Core Web Vital in March 2024. FID only measured the first interaction; INP measures all of them.

**Threshold:**
- Good: ≤ 200ms
- Needs improvement: 200ms – 500ms
- Poor: > 500ms

**What makes INP high:**
- Long tasks on the main thread blocking response to input
- Heavy JavaScript execution in event handlers
- Synchronous network requests in handlers
- Complex DOM updates triggered by interaction

**How to improve INP:**

```js
// ❌ Heavy work runs synchronously in the handler — blocks paint
button.addEventListener('click', () => {
  const results = filterAndSortLargeDataset(allProducts); // 200ms of work
  renderProductList(results);
});

// ✅ Yield before the heavy work so the browser can acknowledge the click first
button.addEventListener('click', async () => {
  // yield → browser paints the button's :active state, feels responsive
  await scheduler.yield();
  const results = filterAndSortLargeDataset(allProducts);
  renderProductList(results);
});
```

For React apps, INP problems often trace back to re-rendering too much on interaction. Profile with the React DevTools Profiler to find components that re-render unnecessarily, then apply `memo`, `useMemo`, or `useCallback` where it actually helps.

---

## Measuring in the Field vs the Lab

Core Web Vitals can be measured in two ways:

**Field data (Real User Monitoring):** Collected from actual users visiting your site. Available in Chrome User Experience Report (CrUX), Pagespeed Insights, and Search Console. This is the data Google uses for ranking.

**Lab data:** Simulated in a controlled environment (Lighthouse, WebPageTest). Faster feedback, but doesn't capture real user variability (device speed, network conditions, interaction patterns).

LCP and CLS can be measured in both lab and field. INP requires real user interactions — it can only be meaningfully measured in the field.

---

## Prioritising Improvements

If your CWV scores are poor:

1. **LCP first** — it directly affects perceived load speed and is often fixable with image optimisation and TTFB improvements.
2. **CLS second** — usually fixable with explicit image dimensions and reserved space for dynamic content.
3. **INP third** — requires profiling real user interactions to find the bottleneck; fixes are more code-level.

Use PageSpeed Insights (which shows both lab and field data) as your primary measurement tool, and Lighthouse for local iteration.
