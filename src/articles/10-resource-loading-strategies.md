# Performance #10 - Resource Loading Strategies

Loading assets efficiently is where a lot of page speed is won or lost. Your app logic might be well-optimized, but if fonts block text, a 300KB stylesheet is loaded upfront for a page that needs 15KB, and every script tag fires at parse time — you're leaving significant performance on the table. This article covers fonts, CSS, JavaScript, and lazy loading, with the practical patterns for each.

---

## Font Loading: FOIT, FOUT, and font-display

Web fonts are a common source of invisible or invisible-then-jumpy text. Two terms describe the extremes:

- **FOIT (Flash of Invisible Text)** — the browser hides text while the font downloads. Users see blank content.
- **FOUT (Flash of Unstyled Text)** — the browser renders text in a fallback font, then swaps to the web font when it arrives. Users see a layout shift.

The `font-display` CSS descriptor controls this behaviour:

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;
}
```

| Value | Behaviour |
|-------|-----------|
| `auto` | Browser default (usually FOIT) |
| `block` | Short FOIT, then unlimited wait |
| `swap` | Immediate FOUT, unlimited wait |
| `fallback` | Very short FOIT, short swap window |
| `optional` | Very short FOIT, no swap — font only used if cached |

**Recommended approach for body text:** `font-display: swap` with a well-matched fallback font to minimise layout shift.

**Recommended approach for icon fonts:** `font-display: block` — unstyled icons are worse than invisible ones.

Additionally, **preload** your critical fonts so they start downloading early:

```html
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

---

## Critical CSS vs Non-Critical CSS

CSS is render-blocking. The browser won't paint until all linked stylesheets are processed. Loading 300KB of CSS for a page that only needs 10KB above the fold is a costly default.

**Critical CSS** is the minimal set of styles needed to render above-the-fold content — layout, typography, hero section. It should be inlined in `<head>`:

```html
<head>
  <style>
    /* Inlined critical styles — layout, hero, typography */
    body { margin: 0; font-family: Inter, sans-serif; }
    .hero { display: flex; min-height: 100vh; ... }
  </style>
</head>
```

**Non-critical CSS** — everything else — is loaded asynchronously after the initial render:

```html
<link rel="stylesheet" href="/styles/main.css" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="/styles/main.css"></noscript>
```

The `media="print"` trick causes the browser to download the stylesheet without blocking render. The `onload` handler switches it to `all` once it arrives.

Tools like [critical](https://github.com/addyosmani/critical) can automate critical CSS extraction at build time.

---

## JavaScript Loading Patterns

Beyond `async` and `defer`, there are higher-level patterns for loading JavaScript efficiently.

### Module/Nomodule Split

Serve modern ES modules to modern browsers and a bundled fallback to legacy ones:

```html
<script type="module" src="app.modern.js"></script>
<script nomodule src="app.legacy.js"></script>
```

Modern browsers download and execute the `module` script (which is deferred by default) and ignore `nomodule`. Legacy browsers do the opposite. This eliminates transpilation overhead for the majority of users.

### Third-Party Script Loading

Third-party scripts (chat widgets, analytics, A/B testing) are a common performance liability. Strategies:

```js
// ❌ Script injected on DOMContentLoaded — runs during the critical loading window
document.addEventListener('DOMContentLoaded', () => {
  loadChatWidget();
});

// ✅ Inject after first user interaction — the widget isn't needed until then
let widgetLoaded = false;
function loadOnFirstInteraction() {
  if (widgetLoaded) return;
  widgetLoaded = true;
  loadChatWidget();
}
['click', 'scroll', 'keydown'].forEach(event =>
  window.addEventListener(event, loadOnFirstInteraction, { once: true })
);

// ✅ Or defer to idle time for non-interactive scripts like analytics
requestIdleCallback(() => {
  loadAnalyticsScript();
});
```

For embedded widgets (YouTube videos, maps), use a **facade pattern** — show a static preview image, then swap in the real embed only when the user clicks.

---

## Lazy Loading: Images, Components, and Routes

Loading everything upfront is wasteful. Lazy loading defers resources until they're actually needed.

### Images

The native `loading="lazy"` attribute tells the browser to defer offscreen images until they're near the viewport:

```html
<!-- ❌ No dimensions — content shifts when image loads, no space reserved -->
<img src="product.jpg" loading="lazy" alt="Product">

<!-- ✅ Explicit dimensions let the browser reserve space; lazy keeps it out of
     the critical path while still preventing layout shift -->
<img src="product.jpg" loading="lazy" alt="Product" width="800" height="600">
```

Do **not** lazy load above-the-fold images — especially the LCP image. That delays the metric that matters most.

### Components (React / Vue / etc.)

Dynamic imports allow splitting component code into separate chunks:

```jsx
// React
const HeavyChart = React.lazy(() => import('./HeavyChart'));

// Usage
<Suspense fallback={<Spinner />}>
  <HeavyChart />
</Suspense>
```

The chunk for `HeavyChart` is only downloaded when the component is first rendered. Combined with Intersection Observer, you can trigger the load only when the component is near the viewport.

### Routes

Route-based code splitting is the highest-value lazy loading technique. Each route gets its own chunk, and users only download code for the pages they visit:

```jsx
// React Router v7
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));

<Route path="/articles" element={
  <Suspense fallback={null}>
    <ArticlesPage />
  </Suspense>
} />
```

Most modern frameworks (Next.js, Nuxt, SvelteKit) do this automatically.

---

## Putting It All Together

A well-optimised loading strategy looks like this:

1. **Fonts:** preloaded, `font-display: swap`, matched fallback font
2. **CSS:** critical styles inlined, non-critical loaded async
3. **JS:** all app scripts deferred, third-party scripts lazy-loaded
4. **Images:** `loading="lazy"` on all below-fold images with explicit dimensions; LCP image eagerly loaded
5. **Routes/Components:** code-split at the route level, heavy components lazy-loaded with Suspense

Each layer reduces work on the critical path. The pattern is consistent: get the minimum required for first paint to the browser as fast as possible, and pull everything else in on demand. Apply it systematically and you'll often see LCP drop by seconds without touching a single line of app logic.
