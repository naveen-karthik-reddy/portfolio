# What are Long Tasks?

A **long task** is any piece of work that runs on the browser's [main thread](/articles/what-is-main-thread) for more than **50 milliseconds** without yielding.

The 50ms threshold isn't arbitrary. At 60fps, the browser has 16.67ms per frame. A task longer than 50ms means at least 3 frames were blocked. Research from Google shows that users start perceiving a response as laggy around 100ms after an interaction — 50ms leaves a buffer for the browser to handle the actual rendering work after the task ends.

---

## What happens during a long task

While a long task is running, everything else on the main thread waits:

- User input (clicks, keypresses, scroll) is queued but not handled
- Animations freeze
- No new frames are painted
- React cannot run state updates or re-renders

The user experience: the page appears frozen. Buttons don't respond. Scroll doesn't scroll.

```js
// ❌ A long task — blocks the thread for ~800ms on a mid-range device
function processLargeDataset(data) {
  return data.map(item => {
    // expensive computation per item
    return heavyTransform(item);
  });
}

// The user clicks a button during this — their click is buffered
// and fires 800ms later. Feels broken.
```

---

## How to find long tasks

**Chrome DevTools → Performance tab:**
Record a profile and look for red triangles at the top of tasks in the flame chart. Any task wider than 50ms gets a red marker. The "Bottom-Up" and "Call Tree" tabs show you exactly which function consumed the time.

**PerformanceObserver API:**
```js
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Long task:', entry.duration.toFixed(1), 'ms');
    // entry.attribution shows which script/frame caused it
  }
});
observer.observe({ entryTypes: ['longtask'] });
```

**Lighthouse:** The "Total Blocking Time" metric is the sum of the blocking portions of all long tasks (the time each task spent beyond 50ms) during page load.

---

## How to break up long tasks

**1. Chunked processing with setTimeout**

The simplest yield point: `setTimeout(..., 0)` schedules the next chunk as a new task, giving the browser a chance to handle input and render a frame between chunks.

```js
// ✅ Process in chunks — yields between each batch
async function processChunked(data, chunkSize = 100) {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    processChunk(chunk);

    // yield to the main thread — browser can render/handle input here
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
```

**2. Scheduler API (isInputPending)**

```js
async function processWithScheduler(data) {
  for (let i = 0; i < data.length; i++) {
    process(data[i]);

    // yield if input is waiting — don't yield unnecessarily
    if (navigator.scheduling?.isInputPending()) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}
```

**3. Web Workers**

Move the work off the main thread entirely. Web Workers run in a separate thread with no access to the DOM, but are ideal for CPU-heavy computation that doesn't need to touch the UI.

```js
// main.js
const worker = new Worker('heavy-worker.js');
worker.postMessage({ data: largeDataset });
worker.onmessage = (e) => updateUI(e.data); // runs on main thread after worker finishes

// heavy-worker.js
self.onmessage = (e) => {
  const result = expensiveComputation(e.data);
  self.postMessage(result);
};
```

**4. React's `startTransition`**

For React-specific long tasks, `startTransition` tells React a state update is non-urgent — React will yield the thread between fiber chunks and process higher-priority updates (like input handling) first.

---

## Long tasks and Core Web Vitals

Long tasks directly impact **Interaction to Next Paint (INP)** — the Core Web Vital that measures responsiveness. Every long task that runs after a user interaction delays the next paint. Eliminating long tasks during page load also improves **Total Blocking Time (TBT)**, a Lighthouse proxy metric.

---

50ms is the line between "fast enough" and "the user noticed." Any single task that crosses it is a long task, and the fix is always the same: yield, chunk, or move the work somewhere else.
