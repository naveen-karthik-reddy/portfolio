The **main thread** is the single thread in the browser responsible for almost everything that matters: parsing HTML, executing JavaScript, calculating styles, running layout, and painting pixels. It is a single thread — every task queues behind every other task, one at a time.

---

## What runs on it

| Task | Runs on main thread? |
|------|----------------------|
| JavaScript execution | Yes |
| HTML parsing | Yes |
| CSS style calculation | Yes |
| Layout (reflow) | Yes |
| Paint | Yes |
| Compositing | No — compositor thread |
| Scroll handling (most cases) | No — compositor thread |
| Web Workers | No — worker threads |

Most of the browser's rendering pipeline runs on the main thread. The only major exception is compositing — the final step of combining painted layers into the image you see on screen.

---

## Why it's a bottleneck

Because everything queues on the same thread, any long-running task blocks everything else. A 200ms JavaScript function means the browser can't respond to clicks, can't run animations, and can't paint new frames for 200ms. The user experiences this as a frozen, unresponsive page.

At 60fps the browser has **16.67ms per frame** to complete all its work. A task that exceeds that budget causes a dropped frame — visible to the user as jank or stutter.

```js
// ❌ Blocks the main thread for the full duration —
//    no input handling, no animation, no paint
function expensiveTask() {
  const result = [];
  for (let i = 0; i < 10_000_000; i++) {
    result.push(Math.sqrt(i));
  }
  return result;
}

// ✅ Break long work into chunks that yield between iterations
function chunkedTask(items, onDone) {
  let i = 0;
  function next() {
    const end = Math.min(i + 1000, items.length);
    while (i < end) process(items[i++]);
    if (i < items.length) setTimeout(next, 0); // yield
    else onDone();
  }
  next();
}
```

---

## The compositor thread

The browser runs compositing on a **separate compositor thread**. This is why `transform` and `opacity` animations can run smoothly even when the main thread is busy — they don't need to go through JavaScript, style calculation, or layout. The compositor thread handles them directly.

```css
/* ❌ Changes geometry — forces main thread layout on every frame */
.bad  { transition: left 300ms ease; }

/* ✅ Compositor-only — bypasses the main thread entirely */
.good { transition: transform 300ms ease; }
```

---

## Offloading work

Two browser APIs exist specifically to move work off the main thread:

**Web Workers** — run JavaScript in a separate background thread. No DOM access, but ideal for CPU-heavy computation (parsing, encryption, image processing).

**`requestIdleCallback`** — schedules non-urgent work during idle periods between frames, so it doesn't compete with rendering.

React 18's concurrent renderer also addresses this at the framework level — it can pause reconciliation mid-render to yield the main thread back to the browser when a higher-priority task (like user input) arrives.

---

Performance work is largely about protecting the main thread: keeping tasks short, deferring non-critical work, and pushing as many operations as possible to the compositor or background threads.
