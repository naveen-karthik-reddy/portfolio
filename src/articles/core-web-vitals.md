# Core Web Vitals Explained

Google's Core Web Vitals are a set of three metrics that measure the user experience of a page — not in aggregate, but for specific, observable moments: when the main content appears, whether the layout shifts unexpectedly, and how fast the page responds to interaction.

Since 2021, Core Web Vitals have been a confirmed ranking signal. More importantly, they're good proxies for what users actually feel.

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
1. Ensure your LCP image is in the `<head>` as a preload: `<link rel="preload" as="image" href="/hero.webp">`
2. Never put `loading="lazy"` on the LCP image
3. Serve images in modern formats (WebP, AVIF) at appropriate sizes
4. Reduce TTFB with a CDN and fast server response
5. Eliminate render-blocking resources from the critical path

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
1. Always specify `width` and `height` on `<img>` and `<video>` elements
2. Reserve space for ads/embeds with `min-height` on their containers
3. Use `font-display: optional` for fonts where FOUT causes shifts (at the cost of potentially not using the font)
4. Insert dynamic content below the fold, not above existing content
5. Use `transform` for animations instead of properties that affect layout

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
1. Break long tasks into smaller chunks using `setTimeout` or `scheduler.yield()`
2. Move non-critical work off the main thread using Web Workers
3. Avoid synchronous operations in event handlers
4. Optimise component re-render cost (React: `memo`, `useMemo`, `useCallback` where warranted)
5. Use `content-visibility: auto` to skip rendering off-screen sections

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
