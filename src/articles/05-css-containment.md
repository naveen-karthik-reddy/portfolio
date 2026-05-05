The browser doesn't know which parts of your page have changed unless you tell it. By default, a style change anywhere can theoretically affect everything. CSS Containment is the mechanism to break that assumption — telling the browser that a subtree is isolated, so it can skip work it would otherwise do.

---

## What CSS Containment Does

The `contain` property declares that a subtree is independent from the rest of the document in specific ways. The browser uses this to optimize layout, style, and paint work.

```css
.widget {
  contain: layout style paint;
}
```

There are four containment types:

**`layout`** — the element's children cannot affect the layout of elements outside it, and vice versa. The browser can skip re-laying out the rest of the document when this subtree changes.

**`style`** — style changes inside the element (like counters) cannot affect elements outside it.

**`paint`** — the element acts as a stacking context; its children won't be painted outside its border box. The browser can skip painting this element when it's outside the viewport.

**`size`** — the element's size is fixed and doesn't depend on its children. This enables the most aggressive optimizations but requires you to set an explicit size.

**`strict`** is shorthand for `layout style paint size`. **`content`** is shorthand for `layout style paint` (size excluded).

```css
/* A chart or calendar widget that updates frequently
   but should never affect surrounding layout */
.chart-widget {
  contain: layout style paint;
  width: 600px;
  height: 400px;
}

/* Fixed-size third-party embed — size is known, so use strict */
.ad-slot {
  contain: strict;
  width: 300px;
  height: 250px;
}
```

---

## content-visibility: auto

`content-visibility: auto` is the highest-impact single property in this article. It tells the browser to skip layout and paint for elements that are off-screen.

```css
.article-card {
  content-visibility: auto;
  contain-intrinsic-size: auto 300px;
}
```

On a page with dozens of off-screen cards, the browser renders only the visible portion. This can reduce initial rendering time by 5–10× on content-heavy pages.

**`contain-intrinsic-size`** is required alongside it. When an element is skipped, the browser needs a placeholder size to calculate scrollbar height correctly. Without it, scroll position jumps as you scroll and elements render.

```css
/* ❌ Missing contain-intrinsic-size — scroll bar will jump
   as cards render when you scroll down */
.article-card {
  content-visibility: auto;
}

/* ✅ Placeholder size keeps the scrollbar stable */
.article-card {
  content-visibility: auto;
  contain-intrinsic-size: auto 320px; /* rough estimate of card height */
}
```

---

## When to Use Each

| Scenario | Recommended |
|---|---|
| Complex widget (calendar, chart) with frequent internal updates | `contain: layout style paint` |
| Long feed of cards or articles | `content-visibility: auto` |
| Fixed-size third-party embed | `contain: strict` |
| Anything animating independently | `contain: layout` |

---

## Real-World Impact

A news site with 100 article cards below the fold can spend most of its initial rendering budget on off-screen content. Adding `content-visibility: auto` makes those cards nearly free until the user scrolls to them. The [CSS Containment spec](https://www.w3.org/TR/css-contain-2/) cites rendering time improvements of up to 7× on content-heavy pages.

The property is supported in all modern browsers (Chrome 85+, Firefox 125+, Safari 18+).

---

## Caveats

- `content-visibility: auto` elements are excluded from the browser's find-in-page results until rendered. This is a known limitation.
- Elements with `content-visibility: auto` don't respond to intersection observations until rendered.
- Setting `contain: size` without a fixed size causes the element to collapse to zero, so always pair it with explicit dimensions.

---

CSS Containment is one of those features that's easy to overlook because it doesn't change how anything looks — it only changes what the browser bothers to compute. On a page with a lot of independent sections or a long content feed, adding a few lines of `contain` and `content-visibility` is often the highest-ROI performance change you can make without touching any JavaScript.
