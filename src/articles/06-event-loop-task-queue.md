JavaScript runs on a single thread. That one fact explains most performance problems you'll ever debug — frozen pages, janky animations, click handlers that feel sluggish. The event loop is just the scheduling mechanism that decides *what* runs on that thread and *when*. Once you see it clearly, a lot of browser behavior that felt arbitrary starts making sense.

---

## The Call Stack

The [call stack](/articles/what-is-call-stack) is where synchronous JavaScript executes. When you call a function, it's pushed onto the stack. When it returns, it's popped off. The stack can only run one frame at a time.

When the stack is busy, nothing else can run — not a click handler, not a paint, not a layout recalculation. A function that takes 500ms to complete will block the page for 500ms.

---

## Web APIs and the Task Queue

Async operations — `setTimeout`, `fetch`, DOM events, `IndexedDB` — are handled by Web APIs provided by the browser, outside the JS engine. When they complete, they queue a **callback** (also called a **macrotask** or **task**) into the **task queue**.

The event loop follows a strict algorithm — here it is step by step:

1. **Pick one macrotask** from the task queue and run it to completion (push it onto the call stack, execute every synchronous instruction, pop it off).
2. **Drain all microtasks.** After the macrotask finishes, run every pending microtask in the queue. New microtasks added during this phase also run before moving on — the queue must be completely empty.
3. **Run `requestAnimationFrame` callbacks** (if the browser decides it's time for a new frame).
4. **Render** — recalculate styles, layout, paint, and composite (if needed and frame budget allows).
5. **Repeat** — go back to step 1.

```text
Pick ONE macrotask → run to completion
  ↓
Drain ALL microtasks (including new ones added during this step)
  ↓
requestAnimationFrame callbacks (if a frame is due)
  ↓
Style → Layout → Paint → Composite (if needed)
  ↓
Repeat
```

This is why a slow macrotask blocks everything: the event loop can't move to step 2 (microtasks) or step 4 (rendering) until the current macrotask finishes.

---

## Microtasks vs Macrotasks

This is where most developers get confused.

Why the names? **Macrotasks** are the "big" units — one per event-loop tick, each representing a discrete piece of work. **Microtasks** are the "small" units that run immediately after the current macrotask, before the next one. Think of it as: one macrotask, then a burst of microtasks, then repeat.

**Macrotasks** (task queue): `setTimeout`, `setInterval`, `setImmediate`, I/O callbacks, UI events.

**[Microtasks](/articles/what-is-microtask-queue)** (microtask queue): `Promise.then/.catch/.finally`, `queueMicrotask`, `MutationObserver`.

The critical difference: **after every macrotask, the browser drains the entire microtask queue before doing anything else** — including rendering. This means:

```js
setTimeout(() => console.log('macrotask'), 0);
Promise.resolve().then(() => console.log('microtask'));

// Output:
// microtask
// macrotask
```

And if your microtask queue chains infinitely, you get **microtask starvation** — the event loop never escapes step 2, so rendering and user input are blocked indefinitely:

```js
function loop() {
  Promise.resolve().then(loop); // infinite microtask loop
}
loop(); // page freezes — render never gets a turn
```

---

## Long Tasks

A [**long task**](/articles/what-are-long-tasks) is any task that runs for more than 50ms on the main thread. During a long task, the browser cannot render a frame, respond to input, or run anything else.

Long tasks are the primary cause of poor INP (Interaction to Next Paint). The browser's task scheduler shows them highlighted in red in the Performance panel.

Common sources:
- Large JSON parsing (`JSON.parse` on a 5MB response)
- Synchronous loops over large datasets
- React re-renders of large tree with no memoization
- Third-party script initialization

---

## Breaking Up Long Tasks

The fix is to yield back to the browser between chunks of work. Without yielding, the browser is locked out for the entire duration of the task:

```js
// ❌ Processes everything in one blocking task
function processOrders(orders) {
  for (const order of orders) {
    computeShippingCost(order);
    updateInventory(order);
  }
}

// ✅ Yields every 100 items so the browser can render and handle input
async function processOrders(orders) {
  for (let i = 0; i < orders.length; i++) {
    computeShippingCost(orders[i]);
    updateInventory(orders[i]);

    if (i % 100 === 0) {
      // hand control back to the browser before continuing
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}
```

`scheduler.yield()` (Chrome 129+) is the modern API for this — it yields with higher priority than `setTimeout(fn, 0)`, resuming before other pending macrotasks.

---

## requestIdleCallback

For non-urgent background work (analytics, prefetching, cache warming), `requestIdleCallback` runs your callback only when the browser has idle time between frames.

```js
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    doBackgroundTask(tasks.shift());
  }
});
```

This keeps all main-thread time available for user interactions and rendering.

---

The event loop isn't an implementation detail you can safely ignore — it's the reason `setTimeout(fn, 0)` isn't actually instant, why Promises resolve before timers, and why a poorly chunked data import can make your entire UI unresponsive. If INP is your biggest CWV problem, tracing long tasks on the main thread is almost always where the fix starts.
