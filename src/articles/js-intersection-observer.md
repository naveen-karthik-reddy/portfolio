Scroll event handlers are expensive — they fire at ~60Hz and force layout calculations. `IntersectionObserver` is the modern replacement: it tells you when an element enters or leaves the viewport without any scroll handlers. This article covers lazy loading, infinite scroll, and ad viewability tracking.

---

## 1. Basic Observer — Detect When an Element Becomes Visible

```js-exec
// Simulate IntersectionObserver behavior (conceptual — requires real DOM)
function simulateObserver() {
  // Real usage:
  // const observer = new IntersectionObserver((entries) => {
  //   for (const entry of entries) {
  //     console.log(entry.target, "is visible?", entry.isIntersecting);
  //     console.log("Ratio:", entry.intersectionRatio);
  //   }
  // }, { threshold: 0.5 }); // Fire when 50% visible
  //
  // observer.observe(element);
  // observer.unobserve(element);
  // observer.disconnect(); // Stop observing all

  console.log("IntersectionObserver API pattern:");
  console.log("  1. Create observer with callback + options");
  console.log("  2. Call observer.observe(element) for each target");
  console.log("  3. Callback fires asynchronously when visibility changes");
  console.log("  4. Call observer.unobserve(element) or observer.disconnect() to stop");
}

simulateObserver();
```

---

## 2. Options — threshold, rootMargin, root

```js-exec
console.log("IntersectionObserver options:");
console.log("");
console.log("  threshold: 0 to 1 (or array)");
console.log("    0.0 → callback fires as soon as 1px is visible");
console.log("    1.0 → callback fires only when 100% visible");
console.log("    [0, 0.5, 1] → fires at 0%, 50%, and 100%");
console.log("");
console.log("  rootMargin: string like '100px 0px'");
console.log("    Expands/shrinks the bounding box");
console.log("    '100px' → fire 100px BEFORE element enters viewport");
console.log("    '-50px' → fire after element is 50px inside viewport");
console.log("");
console.log("  root: element (defaults to viewport)");
console.log("    A scrollable container to observe relative to");

// Example options for different use cases:
const lazyLoadOptions = {
  rootMargin: "200px", // Load images 200px before they appear
  threshold: 0,
};

const adViewabilityOptions = {
  threshold: 0.5, // At least 50% visible
};

const exitAnimationOptions = {
  threshold: 0, // Fire when element completely leaves
};
```

---

## 3. Lazy Loading Images Pattern

```js-exec
function setupLazyLoading() {
  // Real DOM code:
  // const observer = new IntersectionObserver((entries) => {
  //   for (const entry of entries) {
  //     if (entry.isIntersecting) {
  //       const img = entry.target;
  //       img.src = img.dataset.src;         // Set real src
  //       img.srcset = img.dataset.srcset;    // Set responsive srcset
  //       img.classList.remove("lazy");
  //       observer.unobserve(img);           // Done — stop observing
  //     }
  //   }
  // }, { rootMargin: "200px" });
  //
  // document.querySelectorAll("img[data-src]").forEach((img) => {
  //   observer.observe(img);
  // });

  console.log("Lazy loading pattern:");
  console.log("  <img data-src='real-image.jpg' class='lazy' />");
  console.log("  When visible → swap data-src to src → stop observing");
  console.log("  rootMargin: '200px' = start loading before visible");
}

setupLazyLoading();
```

---

## 4. Infinite Scroll Pattern

```js-exec
function setupInfiniteScroll() {
  // const sentinel = document.getElementById("scroll-sentinel");
  //
  // const observer = new IntersectionObserver(async (entries) => {
  //   if (entries[0].isIntersecting && !loading) {
  //     loading = true;
  //     const newItems = await fetchMoreItems();
  //     appendItems(newItems);
  //     loading = false;
  //   }
  // }, { rootMargin: "300px" });
  //
  // observer.observe(sentinel);

  console.log("Infinite scroll pattern:");
  console.log("  1. Place a 'sentinel' div at the bottom of the list");
  console.log("  2. Observe the sentinel with rootMargin for early trigger");
  console.log("  3. When sentinel is visible → fetch next page → append");
  console.log("  4. Sentinel moves down → triggers again when user scrolls further");
}

setupInfiniteScroll();
```

---

## 5. Sticky Header Shadow on Scroll

```js-exec
function setupStickyHeaderObserver() {
  // const header = document.querySelector("header");
  // const sentinel = document.createElement("div");
  // sentinel.style.position = "absolute";
  // sentinel.style.top = "0";
  // header.parentNode.insertBefore(sentinel, header);
  //
  // const observer = new IntersectionObserver((entries) => {
  //   // sentinel is no longer visible → header is now sticky (scrolled)
  //   header.classList.toggle("scrolled", !entries[0].isIntersecting);
  // }, { threshold: 0 });
  //
  // observer.observe(sentinel);

  console.log("Sticky header pattern:");
  console.log("  - Place a sentinel above the header");
  console.log("  - When sentinel leaves viewport → header has scrolled");
  console.log("  - Toggle 'scrolled' class (add shadow/dark background)");
}

setupStickyHeaderObserver();
```

---

## 6. Intersection Observer vs Scroll Events

```js-exec
console.log("│ Feature              │ IO                              │ Scroll Events        │");
console.log("│──────────────────────│─────────────────────────────────│──────────────────────│");
console.log("│ Performance          │ Async, no reflow                │ Sync, causes reflow  │");
console.log("│ Code complexity      │ Observer + callback             │ Debounce + checks    │");
console.log("│ Off-main-thread      │ Yes (browser-optimized)         │ No (JS thread)       │");
console.log("│ Get visible ratio    │ Built-in (intersectionRatio)    │ Requires manual calc │");
console.log("│ Observe many elements│ Observe each individually       │ One handler for all  │");
console.log("│ Browser support      │ All modern browsers             │ Universal            │");
```

---

## Key Takeaways

- `IntersectionObserver` fires **asynchronously** — no reflow, no scroll handler overhead.
- `rootMargin` lets you trigger **before** the element is visible (prefetch, lazy load).
- `threshold` controls what percentage of visibility triggers the callback.
- Always **unobserve** elements when done (e.g., after lazy-loading an image).
- `intersectionRatio` tells you how much of the element is visible (0–1).
- IO replaces: scroll position checks, `getBoundingClientRect()` calls, scroll-spy, ad viewability, and lazy loading.

---

**Next:** [DOM Events #1 — Event Delegation & Bubbling](/articles/javascript-series/js-event-delegation-bubbling) — handle hundreds of elements with a single listener.
