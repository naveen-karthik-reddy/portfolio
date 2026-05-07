JavaScript is single-threaded — one call stack, one thing at a time. Yet it handles thousands of concurrent operations. The secret is the **event loop**: the mechanism that coordinates the call stack, microtask queue, and macrotask queue. Understanding it explains why `setTimeout(fn, 0)` doesn't run immediately and why Promises jump the queue.

**Prerequisites:** [JS Foundations #3 — Closures](/articles/javascript-series/js-closures-lexical-scope)

---

## 1. The Call Stack — JavaScript's To-Do List

The call stack tracks where we are in a program. Functions push onto it when called, pop off when they return:

```js-exec
function multiply(a, b) {
  return a * b; // Step 4: multiply runs, returns 6, pops off
}

function square(n) {
  const result = multiply(n, n); // Step 3: multiply(n,n) pushed
  return result; // Step 5: square returns 9, pops off
}

function printSquare(n) {
  const sq = square(n); // Step 2: square(3) pushed
  console.log(sq); // Step 6: console.log runs, pops off
}

printSquare(3); // Step 1: printSquare(3) pushed
// Step 7: stack is empty

// Stack trace:
// printSquare → square → multiply → [return] → square → printSquare → [return]
```

A long-running function blocks everything — rendering, clicks, timers:

```js-exec
console.log("Start");

// This blocks the thread for ~2 seconds
const start = Date.now();
while (Date.now() - start < 2000) {
  // Busy-wait — nothing else can run
}

console.log("End (after 2s freeze)");
```

---

## 2. The Event Loop — How Async Work Actually Happens

The event loop continuously checks: "Is the call stack empty? If so, push the next queued task." The magic is in the queues:

```js-exec
console.log("1 — sync start");

setTimeout(() => console.log("3 — macrotask (setTimeout 0)"), 0);

Promise.resolve().then(() => console.log("2 — microtask (Promise.then)"));

console.log("4 — sync end");

// Output: 1, 4, 2, 3
// Why? Sync code runs first → microtasks drain → one macrotask → repeat
```

The mental model:

```
Call Stack (LIFO)        Microtask Queue (FIFO)     Macrotask Queue (FIFO)
┌──────────┐             ┌──────────────────┐      ┌──────────────────────┐
│  script  │             │ Promise.then     │      │ setTimeout callback  │
│  (sync)  │             │ queueMicrotask   │      │ setInterval callback │
│          │             │ MutationObserver │      │ I/O events           │
│          │             │ await (after)    │      │ UI events            │
└──────────┘             └──────────────────┘      └──────────────────────┘
```

**Event loop algorithm:**
1. Execute one task from the macrotask queue
2. Drain ALL microtasks (including microtasks added by microtasks)
3. Render (if needed — ~16ms frame budget)
4. Go to step 1

---

## 3. Microtask Queue — Promises, `queueMicrotask`, `await`

Microtasks run **after every task, before the next task**. All microtasks drain before any macrotask runs:

```js-exec
setTimeout(() => {
  console.log("1 — macrotask: setTimeout");

  Promise.resolve().then(() => {
    console.log("2 — microtask inside macrotask");
  });
}, 0);

Promise.resolve().then(() => {
  console.log("3 — microtask from script");
});

// Output: 3, 1, 2
// Script task ends → drain microtasks (3) → next macrotask (1) → drain microtasks (2)
```

`queueMicrotask()` explicitly schedules a microtask:

```js-exec
console.log("A — sync");

queueMicrotask(() => console.log("B — queued microtask"));

Promise.resolve().then(() => {
  console.log("C — promise microtask");
  queueMicrotask(() => console.log("D — microtask scheduled inside microtask"));
});

console.log("E — sync");

// Output: A, E, B, C, D
// Microtasks drain recursively — D runs before any macrotask
```

---

## 4. Microtask Starvation — The Infinite Loop Trap

Scheduling a microtask that schedules another microtask starves the macrotask queue — rendering and user input freeze:

```js-exec
// ❌ DON'T DO THIS — infinite microtask loop
let count = 0;
function recursiveMicrotask() {
  if (count < 5) {
    console.log(`Microtask ${count}`);
    count++;
    queueMicrotask(recursiveMicrotask);
  } else {
    console.log("Done — but any real code would freeze the page forever");
  }
}

recursiveMicrotask();

// setTimeout never gets a chance to run:
setTimeout(() => console.log("This runs AFTER all microtasks drain"), 0);
```

---

## 5. Complete Task Ordering — Everything in Sequence

```js-exec
console.log("1 — sync script start");

setTimeout(() => console.log("7 — setTimeout 0"), 0);

setTimeout(() => console.log("8 — setTimeout 0 (second)"), 0);

Promise.resolve()
  .then(() => console.log("2 — Promise.then 1"))
  .then(() => console.log("4 — Promise.then 2 (chained)"));

Promise.resolve().then(() => {
  console.log("3 — Promise.then 3");
  queueMicrotask(() => console.log("5 — queueMicrotask inside promise"));
});

queueMicrotask(() => console.log("6 — queueMicrotask from script"));

console.log("9 — sync script end");

// Output order: 1, 9, 2, 3, 6, 4, 5, 7, 8
// 
// Explanation:
// Sync (1, 9) → drain microtasks:
//   then-1 (2), then-3 (3), queueMicrotask (6)
//   then chaining: then-2 (4)
//   microtask nested: (5)
// → macrotask: setTimeout-0-1 (7)
//   (microtasks drained? yes) 
// → macrotask: setTimeout-0-2 (8)
```

---

## 6. The Render Step — Where rAF Fits

Between macrotasks, after microtasks drain, the browser may render a frame. `requestAnimationFrame` callbacks fire just before the render:

```js-exec
// In a real browser, the order per frame is:
// Macrotask → Drain microtasks → rAF callbacks → Style calc → Layout → Paint → Compositing

console.log("Script runs (task)");

requestAnimationFrame(() => console.log("rAF — before next paint"));

setTimeout(() => {
  console.log("setTimeout — next task, after paint");
}, 0);

Promise.resolve().then(() => console.log("Microtask — before rAF"));

// Order: Script → Microtask → rAF → Paint → setTimeout
```

---

## 7. Visualizing the Event Loop

```js-exec
console.log("╔══════════════════════════════════════════╗");
console.log("║     EVENT LOOP — ONE CYCLE              ║");
console.log("╠══════════════════════════════════════════╣");
console.log("║  1. Pick ONE macrotask                  ║");
console.log("║  2. Execute it (push/pop call stack)    ║");
console.log("║  3. Drain ALL microtasks                ║");
console.log("║     (including ones added during drain) ║");
console.log("║  4. rAF callbacks (if frame due)        ║");
console.log("║  5. Render (if needed)                  ║");
console.log("║  6. GOTO 1                              ║");
console.log("╚══════════════════════════════════════════╝");
```

---

## Key Takeaways

| Queue | Examples | Priority |
|---|---|---|
| **Call Stack** | Synchronous code | Runs immediately |
| **Microtask** | `Promise.then`, `queueMicrotask`, `await` | Drains after every task |
| **Macrotask** | `setTimeout`, `setInterval`, I/O, events | One per event-loop tick |
| **rAF** | `requestAnimationFrame` | Before render step |

- JavaScript is **single-threaded** — one call stack, one thing at a time.
- **Microtasks drain completely** before the next macrotask — this includes microtasks added by microtasks.
- **`setTimeout(fn, 0)`** does NOT run immediately — it's a macrotask waiting behind the current task + all microtasks.
- **Microtask starvation** happens when a microtask schedules another microtask infinitely — the macrotask queue and rendering freeze.

---

**Next:** [Async #2 — `setTimeout` & `setInterval` Deep Dive](/articles/javascript-series/settimeout-setinterval) — timers, drift, nested scheduling, and the minimum delay.
