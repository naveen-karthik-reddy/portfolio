The **microtask queue** is a high-priority queue in the browser's event loop that runs to completion after every task — before the browser renders a new frame or picks up the next task from the regular task queue.

Understanding the difference between tasks and microtasks is what separates "it runs asynchronously" from knowing exactly *when* something runs.

---

## Tasks vs Microtasks

The event loop has two distinct queues:

**Task queue (macrotask queue)**
- `setTimeout`, `setInterval`, `setImmediate`
- I/O callbacks, UI events (click, keydown)
- `MessageChannel` callbacks
- The browser picks **one task**, runs it, then checks the microtask queue before picking the next task.

**Microtask queue**
- `Promise.then / .catch / .finally`
- `queueMicrotask()`
- `MutationObserver` callbacks
- `await` (which is syntactic sugar over Promise.then)
- After each task ends, the browser **drains the entire microtask queue** before doing anything else.

---

## The order of execution

```js
console.log('1 — sync');

setTimeout(() => console.log('4 — task (setTimeout)'), 0);

Promise.resolve()
  .then(() => console.log('2 — microtask'))
  .then(() => console.log('3 — microtask'));

console.log('1b — sync');

// Output:
// 1 — sync
// 1b — sync
// 2 — microtask
// 3 — microtask
// 4 — task (setTimeout)
```

Even though `setTimeout(..., 0)` is scheduled first, the Promise `.then` callbacks run before it — because microtasks drain before the next task is picked up.

---

## One key rule: microtasks drain completely

The browser doesn't interleave tasks and microtasks. After a task ends, every microtask in the queue runs before anything else. If a microtask schedules another microtask, that new one also runs before the next task.

```js
// ⚠️ This runs forever — microtasks scheduling microtasks starve everything else
function infinite() {
  Promise.resolve().then(infinite);
}
infinite();
// The task queue never gets a turn — the page freezes
```

This is why Promise-based code that generates unbounded chains can lock up a page just as badly as a synchronous loop.

---

## Why `await` is a microtask

Every `await` is a checkpoint where the function suspends and schedules its resumption as a microtask.

```js
async function example() {
  console.log('A');
  await Promise.resolve();   // suspends here
  console.log('C');          // resumes as a microtask
}

example();
console.log('B');

// Output: A → B → C
// 'B' runs because example() suspended at await,
// then 'C' runs as a microtask after the current sync task ends
```

---

## Why this matters for performance

Microtasks run before the browser can render a frame. A chain of `.then()` calls that takes 60ms to resolve will block the next paint for 60ms — even though it looks asynchronous.

```js
// ❌ Long microtask chain blocks rendering
async function processAll(items) {
  for (const item of items) {
    await heavyCompute(item); // each await is a microtask — no frames rendered between
  }
}

// ✅ Yield to the task queue periodically to allow frames to render
async function processAll(items) {
  for (const item of items) {
    await heavyCompute(item);
    await yieldToMain(); // forces a task boundary → browser can render
  }
}

function yieldToMain() {
  return new Promise(resolve => setTimeout(resolve, 0));
}
```

The [event loop](/articles/06-event-loop-task-queue) article covers how tasks, microtasks, and rendering fit together in the full frame loop.

---

The microtask queue is the mechanism behind how Promises achieve their "runs before anything else" guarantee — and understanding it is what lets you predict, and control, the exact order your async code executes.
