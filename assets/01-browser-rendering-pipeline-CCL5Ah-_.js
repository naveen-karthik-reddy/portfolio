const e=`# #1 — How the Browser Renders a Page

You type a URL and hit Enter. A few hundred milliseconds later, a fully styled, interactive page appears. What actually happened in between?

Understanding the rendering pipeline is foundational to web performance. Every optimisation you make — from deferring scripts to inlining critical CSS — exists because of how browsers execute these steps. Here's the full picture.

---

## From Bytes to Pixels: The Six Steps

The browser performs six distinct steps to go from raw HTML bytes to pixels on screen. These steps are sequential within a single frame; skipping or short-circuiting any of them is what performance work is actually about.

---

## Step 1: Parsing HTML → DOM

The browser's HTML parser reads the document byte by byte and builds the **Document Object Model (DOM)** — a tree of nodes representing every element, attribute, and text content on the page.

Parsing is **incremental**: the browser doesn't wait for the full document before it starts building the DOM. It works through the stream and emits nodes as it goes. This is why placing \`<script>\` tags at the bottom of \`<body>\` matters — a blocking script encountered mid-parse halts the entire process.

The DOM is not the rendered output. It's a structured representation of the document's content. Styles live elsewhere.

---

## Step 2: Parsing CSS → CSSOM

Separately, every stylesheet linked or embedded in the document is parsed into the **CSS Object Model (CSSOM)** — a tree that maps selectors to computed style values.

CSS is **render-blocking**: the browser will not move past this step until all stylesheets have been downloaded and parsed. The reason is safety — rendering anything without complete style information would produce an unstyled flash of content that would immediately re-render, which is worse than waiting.

The CSSOM is also where specificity, inheritance, and cascade are resolved. By the time this tree is built, every element has a fully computed set of styles.

---

## Step 3: Combining Them → Render Tree

The browser merges the DOM and CSSOM into the **Render Tree** — a new tree that contains only the nodes that are actually visible on screen.

Nodes with \`display: none\` are excluded entirely. Pseudo-elements like \`::before\` are included even though they're not in the DOM. The render tree is the first structure that truly represents what the user will see.

---

## Step 4: Layout

Given the render tree, the browser now calculates the **exact position and size of every element** on the page. This step is called **layout** (or reflow).

Layout takes the render tree and the viewport dimensions and produces a **box model** for every visible node — its x/y coordinates, width, height, and relationship to its parent.

Layout is expensive. Changing anything that affects geometry — width, height, padding, margin, font size, or document structure — triggers a re-layout of everything downstream. This is why layout thrashing is a serious performance concern.

---

## Step 5: Paint

Layout tells the browser *where* things go. **Paint** fills them in — it converts each node's visual properties (colour, border, background, shadow, text) into draw calls.

Modern browsers separate paint into **layers**. Elements that are promoted to their own compositor layer (via \`transform\`, \`will-change\`, \`opacity\`, or fixed positioning) are painted independently. This is how animations run without triggering full-page repaints.

---

## Step 6: Compositing

The final step takes all the painted layers and **composites** them into the final image you see on screen, respecting z-index and stacking order. This step runs on the **compositor thread**, separate from the main thread.

This separation is important. CSS animations on \`transform\` and \`opacity\` run entirely on the compositor thread and bypass the main thread entirely — which is why they're smooth even when JavaScript is busy.

---

## The Main Thread vs the Compositor

The **main thread** handles parsing, JavaScript execution, style calculation, layout, and paint. It is a single thread — everything queues behind everything else.

The **compositor thread** handles compositing. It also handles scroll and touch input, which is why \`position: fixed\` elements and \`overflow: scroll\` containers need careful handling to stay off the main thread.

Performance work is largely about keeping the main thread free — deferring non-critical work, avoiding layout-triggering reads inside animation loops, and moving as many operations as possible to the compositor.

---

## Frame Budget

At 60 frames per second, the browser has **16.67ms per frame** to run all six steps. At 120fps, that drops to 8.3ms. JavaScript execution, style recalculation, layout, and paint all compete for that budget.

When a frame misses its deadline, the user sees a dropped frame — or "jank". Tools like Chrome DevTools' Performance tab show you exactly which step consumed the budget and where to cut.

---

## Key Takeaways

- The browser builds two separate trees (DOM and CSSOM) and merges them into the Render Tree before it can paint anything.
- CSS is render-blocking; JavaScript blocks HTML parsing.
- Layout and paint run on the main thread. Compositing runs on its own thread.
- \`transform\` and \`opacity\` animations avoid layout and paint entirely, running only on the compositor.
- Every optimisation in web performance targets one or more of these six steps.
`;export{e as default};
