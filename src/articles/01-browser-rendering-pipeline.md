You type a URL and hit Enter. A few hundred milliseconds later, a fully styled, interactive page appears. What actually happened in between?

Most performance advice — defer your scripts, inline critical CSS, stick to `transform` for animations — only makes sense once you understand the pipeline it's targeting. Here are the six steps the browser runs on every frame, in order.

---

## From Bytes to Pixels: The Six Steps

The browser performs six distinct steps to go from raw HTML bytes to pixels on screen. These steps are sequential within a single frame; skipping or short-circuiting any of them is what performance work is actually about.

---

## Step 1: Parsing HTML → DOM

The browser's HTML parser reads the document byte by byte and builds the **Document Object Model (DOM)** — a tree of nodes representing every element, attribute, and text content on the page.

Parsing is **incremental**: the browser doesn't wait for the full document before it starts building the DOM. It works through the stream and emits nodes as it goes. This is why placing `<script>` tags at the bottom of `<body>` matters — a blocking script encountered mid-parse halts the entire process.

```html
<!-- ❌ Blocks parsing — browser stops here, fetches and runs the script,
     then resumes building the DOM -->
<head>
  <script src="app.js"></script>
</head>

<!-- ✅ Fetched in parallel, executed after HTML is parsed -->
<head>
  <script src="app.js" defer></script>
</head>
```

The DOM is not the rendered output. It's a structured representation of the document's content. Styles live elsewhere.

---

## Step 2: Parsing CSS → CSSOM

Separately, every stylesheet linked or embedded in the document is parsed into the **[CSS Object Model (CSSOM)](/articles/what-is-cssom)** — a tree that maps selectors to computed style values.

CSS is **render-blocking**: the browser will not move past this step until all stylesheets have been downloaded and parsed. The reason is safety — rendering anything without complete style information would produce an unstyled flash of content that would immediately re-render, which is worse than waiting.

The CSSOM is also where specificity, inheritance, and cascade are resolved. By the time this tree is built, every element has a fully computed set of styles.

### Critical vs Non-Critical CSS

Not all CSS is equally urgent. **Critical CSS** is the subset of styles needed to render above-the-fold content — the part the user sees immediately. Everything else is non-critical and can be loaded after the first paint.

```html
<!-- ❌ One big stylesheet — all of it blocks rendering,
     even the styles for the footer the user hasn't seen yet -->
<link rel="stylesheet" href="styles.css">

<!-- ✅ Option 1: Inline critical styles — no network round trip at all -->
<head>
  <style>
    /* Critical: nav, hero, above-the-fold layout */
    nav { display: flex; height: 56px; background: #fff; }
    .hero { padding: 4rem 2rem; font-size: 2rem; }
  </style>

  <!-- Non-critical: async load via media="print" trick -->
  <link
    rel="stylesheet"
    href="non-critical.css"
    media="print"
    onload="this.media='all'"
  >
  <noscript><link rel="stylesheet" href="non-critical.css"></noscript>
</head>

<!-- ✅ Option 2: Separate critical.css loaded normally — still blocks,
     but the file is tiny so the block is short.
     Non-critical CSS loads async alongside it. -->
<head>
  <link rel="stylesheet" href="critical.css">
  <link
    rel="stylesheet"
    href="non-critical.css"
    media="print"
    onload="this.media='all'"
  >
  <noscript><link rel="stylesheet" href="non-critical.css"></noscript>
</head>
```

Inlining avoids a network round trip entirely — best when the critical CSS is small (under ~14KB). A separate `critical.css` file loaded normally is a valid alternative when you'd rather keep styles out of the HTML; it still blocks, but a focused file is downloaded and parsed far faster than one large bundle. Either way, the non-critical rest loads without blocking via the `media="print"` trick — the browser fetches it at low priority, then `onload` flips it to `all` so it applies once it arrives.

---

## Step 3: Combining Them → Render Tree

The browser merges the DOM and CSSOM into the **Render Tree** — a new tree that contains only the nodes that are actually visible on screen.

Nodes with `display: none` are excluded entirely. Pseudo-elements like `::before` are included even though they're not in the DOM. The render tree is the first structure that truly represents what the user will see.

---

## Step 4: Layout

Given the render tree, the browser now calculates the **exact position and size of every element** on the page. This step is called **layout** (or reflow).

Layout takes the render tree and the viewport dimensions and produces a **box model** for every visible node — its x/y coordinates, width, height, and relationship to its parent.

Layout is expensive. Changing anything that affects geometry — width, height, padding, margin, font size, or document structure — triggers a re-layout of everything downstream. This is why layout thrashing is a serious performance concern.

```js
// ❌ Each offsetHeight read forces a synchronous layout
//    because the previous write invalidated it
items.forEach((el) => {
  const h = el.offsetHeight;   // forces layout
  el.style.height = h * 2 + 'px'; // invalidates layout
});

// ✅ Batch all reads, then all writes — layout recalculates once
const heights = items.map((el) => el.offsetHeight);
items.forEach((el, i) => {
  el.style.height = heights[i] * 2 + 'px';
});
```

---

## Step 5: Paint

Layout tells the browser *where* things go. **Paint** fills them in — it converts each node's visual properties (colour, border, background, shadow, text) into draw calls.

Modern browsers separate paint into **[compositing layers](/articles/what-are-compositing-layers)**. Elements that are promoted to their own compositor layer (via `transform`, `will-change`, `opacity`, or fixed positioning) are painted independently. This is how animations run without triggering full-page repaints.

---

## Step 6: Compositing

The final step takes all the painted layers and **composites** them into the final image you see on screen, respecting z-index and stacking order. This step runs on the **compositor thread**, separate from the main thread.

This separation is what makes `transform` and `opacity` animations special — they live entirely on the compositor thread and bypass the main thread. A JavaScript-heavy page can be freezing the main thread while a CSS `transform` animation still runs at 60fps.

```css
/* ❌ triggers layout → paint → composite on every frame */
.bad  { transition: left 300ms ease; }

/* ✅ compositor-only — skips layout and paint entirely */
.good { transition: transform 300ms ease; }
```

---

## The Main Thread vs the Compositor

The [**main thread**](/articles/what-is-main-thread) handles parsing, JavaScript execution, style calculation, layout, and paint. It is a single thread — everything queues behind everything else.

The **compositor thread** handles compositing. It also handles scroll and touch input, which is why `position: fixed` elements and `overflow: scroll` containers need careful handling to stay off the main thread.

Performance work is largely about keeping the main thread free — deferring non-critical work, avoiding layout-triggering reads inside animation loops, and moving as many operations as possible to the compositor.

---

## Frame Budget

At 60 frames per second, the browser has **16.67ms per frame** to run all six steps. At 120fps, that drops to 8.3ms. JavaScript execution, style recalculation, layout, and paint all compete for that budget.

When a frame misses its deadline, the user sees a dropped frame — or "jank". Tools like Chrome DevTools' Performance tab show you exactly which step consumed the budget and where to cut.

---

Once this pipeline clicks, the reasoning behind most performance advice becomes obvious. Deferring scripts protects step 1. Inlining critical CSS shortens step 2. Sticking to `transform` for animations keeps steps 4 and 5 out of the equation entirely. The pipeline is the model — everything else is just applying it.

---

*Using React? See [How React Works Inside the Browser Pipeline](/articles/react-virtual-dom-reconciliation) — where the Virtual DOM, reconciler, and concurrent rendering fit into these six steps.*
