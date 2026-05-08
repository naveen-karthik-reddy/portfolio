`requestAnimationFrame` syncs JavaScript to the browser's refresh rate (~60Hz) for smooth animations. `requestIdleCallback` runs low-priority work during idle periods between frames. This article explains where each fits in the frame lifecycle.

**Prerequisites:** [Async #1 — The Event Loop](/articles/javascript-series/js-event-loop-in-depth)

---

## 1. The Frame Lifecycle — Where rAF and rIC Fit

Every ~16ms (at 60fps), the browser tries to produce a frame:

```
[Macrotask] → [Microtasks] → [rAF callbacks] → [Style] → [Layout] → [Paint] → [Composite]
                                                                    ↑
                                                         [rIC callback]
                                                         (idle time after paint)
```

```js-exec
// Visualizing the order within one frame
console.log("Frame lifecycle:");
console.log("  1. Macrotask executes (script, event handler)");
console.log("  2. All microtasks drain");
console.log("  3. requestAnimationFrame callbacks fire");
console.log("  4. Style calculation");
console.log("  5. Layout (reflow)");
console.log("  6. Paint");
console.log("  7. Composite");
console.log("  8. requestIdleCallback fires (if time remains)");
```

---

## 2. `requestAnimationFrame` — Smooth Animations

rAF fires before the next paint, giving you ~16ms to update the DOM:

```js-exec
// ❌ Bad: setTimeout animation — janky, not synced to display
// let pos = 0;
// setInterval(() => { pos += 1; element.style.left = pos + "px"; }, 16);

// ✅ Good: rAF — synced to refresh rate, pauses when tab is hidden
function animate(duration) {
  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    console.log(`Progress: ${Math.round(eased * 100)}%`);

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      console.log("Animation complete!");
    }
  }

  requestAnimationFrame(frame);
}

// Simulate a 500ms animation (logs progress, won't animate in this sandbox)
animate(500);
```

---

## 3. Canceling rAF

`requestAnimationFrame` returns an ID — cancel with `cancelAnimationFrame`:

```js-exec
let rafId;

function startAnimation() {
  rafId = requestAnimationFrame(function frame() {
    console.log("Frame tick");
    rafId = requestAnimationFrame(frame);
  });
}

function stopAnimation() {
  cancelAnimationFrame(rafId);
  console.log("Animation cancelled");
}

startAnimation();
// stop it after a short while
setTimeout(stopAnimation, 100);
```

---

## 4. `requestIdleCallback` — Do Work When the Browser is Free

rIC runs callbacks during idle periods — when the browser has nothing else to do:

```js-exec
// The callback receives an IdleDeadline with timeRemaining() and didTimeout
if (typeof requestIdleCallback !== "undefined") {
  requestIdleCallback((deadline) => {
    console.log("Idle — time remaining:", deadline.timeRemaining(), "ms");

    // Process work in chunks while time remains
    while (deadline.timeRemaining() > 0 && tasks.length > 0) {
      const task = tasks.shift();
      console.log("Processing:", task);
    }

    // If more work remains, schedule another idle callback
    if (tasks.length > 0) {
      requestIdleCallback(arguments.callee);
    }
  });
} else {
  console.log("requestIdleCallback not available — use setTimeout(fn, 0) as fallback");
}

const tasks = ["log", "analytics", "cleanup", "prefetch"];
```

---

## 5. rIC with Timeout — Ensure Work Runs

Pass `{ timeout }` to guarantee the callback fires even if the browser is never idle:

```js-exec
// Without timeout: may never run if the page is busy
// With timeout: guaranteed to run within N ms
function scheduleWork(fn, { timeout = 2000 } = {}) {
  if (typeof requestIdleCallback !== "undefined") {
    return requestIdleCallback(fn, { timeout });
  }
  // Fallback for Safari/older browsers
  return setTimeout(fn, 1);
}

scheduleWork(
  (deadline) => {
    console.log("Running analytics sync...");
    console.log("Deadline:", deadline ? "rIC" : "setTimeout fallback");
  },
  { timeout: 3000 }
);
```

---

## 6. When to Use Each

```js-exec
console.log("│ API         │ Use For                          │ Priority  │");
console.log("│─────────────│──────────────────────────────────│───────────│");
console.log("│ rAF         │ Animations, visual updates       │ High      │");
console.log("│             │ DOM changes before next paint    │ Before paint│");
console.log("│ rIC         │ Analytics, prefetching, cleanup  │ Low       │");
console.log("│             │ Non-urgent work, log flushing    │ After paint │");
console.log("│ setTimeout  │ Deferred work, minimum delay     │ Medium    │");
console.log("│             │ Fallback when rIC unavailable    │ Next task  │");
```

---

## Key Takeaways

- rAF fires **before** the next paint — use for visual updates that must be frame-perfect.
- rAF is **automatically throttled** when the tab is hidden — saves CPU/battery.
- rIC fires **after** the paint, in leftover frame time — use for analytics, cleanup, prefetching.
- rIC's `deadline.timeRemaining()` tells you how much idle time is left — process in chunks.
- Pass `{ timeout }` to rIC for work that must eventually complete.
- Neither rAF nor rIC are available in Node.js — they're browser-only APIs.

---

**Next:** [Web APIs #2 — Web Workers & OffscreenCanvas](/articles/javascript-series/js-web-workers-offscreen) — move heavy computation off the main thread.
