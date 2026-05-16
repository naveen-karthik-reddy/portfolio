The hardest interview questions combine macrotasks and microtasks in a single snippet — setTimeout inside .then(), Promise.resolve() inside setTimeout, async functions called from timer callbacks. Ten questions building from two-queue basics to full multi-layer traces.

---

## Q1 — setTimeout inside a .then() handler

```js-exec
Promise.resolve()
  .then(() => {
    console.log(1);
    setTimeout(() => console.log(2), 0);
    console.log(3);
  });

setTimeout(() => console.log(4), 0);
```

<details>
<summary>Show answer</summary>

**Output:**
```
1
3
4
2
```

**Why:** The microtask `.then()` runs first: `1`, schedules `setTimeout(2)`, `3`. Then the macrotask queue is drained. Both `setTimeout(4)` and `setTimeout(2)` are in the queue. `setTimeout(4)` was scheduled first (during sync), so it runs first: `4`. Then `setTimeout(2)` runs: `2`. Macrotasks are FIFO.

</details>

---

## Q2 — Promise.resolve() inside a setTimeout callback

```js-exec
setTimeout(() => {
  console.log("macro");
  Promise.resolve().then(() => console.log("micro inside macro"));
}, 0);

setTimeout(() => console.log("next macro"), 0);
```

<details>
<summary>Show answer</summary>

**Output:**
```
macro
micro inside macro
next macro
```

**Why:** First macrotask runs: logs `"macro"`, then schedules a new microtask. After the macrotask completes, the engine drains the microtask queue before starting the next macrotask. So `"micro inside macro"` runs, then `"next macro"`. This is the **golden rule**: after every macrotask, all microtasks are drained before the next macrotask.

</details>

---

## Q3 — Two setTimeouts + one Promise

```js-exec
console.log("sync");
setTimeout(() => console.log("timeout1"), 0);
Promise.resolve().then(() => console.log("promise"));
setTimeout(() => console.log("timeout2"), 0);
```

<details>
<summary>Show answer</summary>

**Output:**
```
sync
promise
timeout1
timeout2
```

**Why:** Sync code runs first (`"sync"`). Both `setTimeout`s queue macrotasks (in order). The `.then()` queues a microtask. After sync: microtask queue is drained (`"promise"`). Then macrotask queue is drained in FIFO order: `"timeout1"`, `"timeout2"`.

</details>

---

## Q4 — Promise chain → setTimeout → Promise chain

```js-exec
setTimeout(() => console.log("A"), 0);
Promise.resolve().then(() => console.log("B"));
setTimeout(() => {
  console.log("C");
  Promise.resolve().then(() => console.log("D"));
}, 0);
Promise.resolve().then(() => console.log("E"));
```

<details>
<summary>Show answer</summary>

**Output:**
```
B
E
A
C
D
```

**Why:** Sync queues: macrotasks `[A, C]`, microtasks `[B, E]`. Microtasks drain: `B`, `E`. First macrotask: `A`. Second macrotask: `C`, then queues microtask `D`. Microtask drains before next macrotask: `D`. The microtask from inside a macrotask always runs before the next macrotask in line.

</details>

---

## Q5 — setTimeout with delay vs resolving Promise after shorter duration

```js-exec
setTimeout(() => console.log("timeout"), 100);

new Promise(resolve => setTimeout(() => resolve("promise"), 50))
  .then(v => console.log(v));
```

<details>
<summary>Show answer</summary>

**Output:**
```
promise
timeout
```

**Why:** At ~50ms, the inner `setTimeout` resolves the Promise, and its `.then()` callback is scheduled as a **microtask** — which runs immediately after the current task (the 50ms timer) completes. At ~100ms, the outer `setTimeout` fires. Even though the outer `setTimeout` was registered first, the Promise's `.then()` fires as a microtask at 50ms — long before the 100ms macrotask. Macrotask ordering is by due time, not registration order.

</details>

---

## Q6 — Three setTimeouts with same delay + Promise chain

```js-exec
setTimeout(() => console.log("one"), 0);
setTimeout(() => console.log("two"), 0);
Promise.resolve().then(() => console.log("micro"));
setTimeout(() => console.log("three"), 0);
```

<details>
<summary>Show answer</summary>

**Output:**
```
micro
one
two
three
```

**Why:** All three `setTimeout`s are queued as macrotasks in registration order (`one`, `two`, `three`). The `.then()` is queued as a microtask. Sync ends → microtask drains (`"micro"`) → macrotasks drain in FIFO order (`"one"`, `"two"`, `"three"`). The delay being `0` for all doesn't change ordering — macrotasks are dequeued in insertion order.

</details>

---

## Q7 — Async function called from a setTimeout callback

```js-exec
async function fetchData() {
  console.log("fetch start");
  await Promise.resolve();
  console.log("fetch end");
}

setTimeout(() => {
  console.log("timeout start");
  fetchData();
  console.log("timeout end");
}, 0);

Promise.resolve().then(() => console.log("micro"));
```

<details>
<summary>Show answer</summary>

**Output:**
```
micro
timeout start
fetch start
timeout end
fetch end
```

**Why:** Microtask `"micro"` runs first. Then the macrotask fires: `"timeout start"` logs. `fetchData()` is called — its synchronous part (`"fetch start"`) runs immediately. Then `await Promise.resolve()` suspends it. `"timeout end"` logs (still part of the macrotask). After this macrotask, the microtask queue is drained: `"fetch end"` runs. The resumed `async` function continuation is a microtask from the macrotask that started it.

</details>

---

## Q8 — Promise.all inside a setTimeout

```js-exec
setTimeout(async () => {
  console.log("A");
  const results = await Promise.all([
    Promise.resolve("B"),
    Promise.resolve("C"),
  ]);
  console.log(...results);
}, 0);

Promise.resolve().then(() => console.log("D"));
```

<details>
<summary>Show answer</summary>

**Output:**
```
D
A
B C
```

**Why:** Micromask `D` runs first. Then the macrotask fires: `"A"` logs. `await Promise.all(...)` suspends the async function — the rest becomes a microtask. The macrotask ends. Engine drains microtask queue: the continuation runs, logs `"B C"`. Note: `Promise.all` with already-resolved Promises resolves synchronously within the microtask scheduling layer, so the `await` resumes in the same microtask drain cycle.

</details>

---

## Q9 — Nested setTimeout + Promise.resolve()

```js-exec
setTimeout(() => {
  console.log("T1");
  setTimeout(() => {
    console.log("T2");
    Promise.resolve().then(() => console.log("P2"));
  }, 0);
  Promise.resolve().then(() => console.log("P1"));
}, 0);
```

<details>
<summary>Show answer</summary>

**Output:**
```
T1
P1
T2
P2
```

**Why:** First macrotask: `"T1"` logs. It queues a new macrotask `T2` and a microtask `P1`. After the macrotask exits, microtasks drain: `"P1"`. Then the second macrotask: `"T2"`, which queues microtask `"P2"`. After that macrotask exits, microtasks drain: `"P2"`. The outer pattern repeats — microtask always drains after each macrotask.

</details>

---

## Q10 — Full multi-layer trace

```js-exec
console.log("sync-1");

setTimeout(() => {
  console.log("t1");
  Promise.resolve().then(() => {
    console.log("p-in-t1");
    setTimeout(() => console.log("t-in-p-in-t1"), 0);
  });
  setTimeout(() => console.log("t2"), 0);
}, 0);

Promise.resolve().then(() => {
  console.log("p1");
  queueMicrotask(() => console.log("qm"));
});

setTimeout(() => console.log("t3"), 0);
console.log("sync-2");
```

<details>
<summary>Show answer</summary>

**Output:**
```
sync-1
sync-2
p1
qm
t1
p-in-t1
t3
t2
t-in-p-in-t1
```

**Why:** Step-by-step trace:

1. Sync: `"sync-1"`, `"sync-2"`. Macrotask queue: `[t1, t3]`. Microtask queue: `[p1]`.
2. Drain microtasks: `"p1"` runs, queues `qm`. Then `"qm"` runs.
3. First macrotask `t1`: logs `"t1"`, queues microtask `p-in-t1`, queues macrotask `t2`. Macrotask queue now: `[t3, t2]`.
4. Drain microtasks: `"p-in-t1"` runs, queues macrotask `t-in-p-in-t1`. Queue: `[t3, t2, t-in-p-in-t1]`.
5. Next macrotask `t3`: `"t3"`.
6. Next macrotask `t2`: `"t2"`.
7. Next macrotask `t-in-p-in-t1`: `"t-in-p-in-t1"`.

</details>

---

## Key Rules

| Scenario | Order |
|---|---|
| `setTimeout` inside `.then()` | Macrotask goes to back of task queue — runs after previously queued macrotasks |
| `Promise.resolve()` inside `setTimeout` | Microtask runs before the **next** macrotask |
| Sync + N `setTimeout(0)` + Promise | Sync → all microtasks → macrotasks in FIFO order |
| `setTimeout(100)` vs Promise resolving at 50ms | Promise `.then()` (micro at 50ms) fires before `setTimeout` (macro at 100ms) |
| `async fn()` from `setTimeout` | Pre-`await` code is part of the macrotask; post-`await` is a microtask |
| `Promise.all` inside `setTimeout` | Resolved values are microtasks; all run before next macrotask |

**Golden rule:** After every macrotask, the microtask queue is completely drained before the next macrotask runs.

---

## Go Deeper

- [Output Quiz #9 — async/await Patterns & the return vs return await Trap](/articles/js-output-async-patterns) — the previous quiz
- [Output Quiz #11 — Async Error Propagation](/articles/js-output-async-errors) — the next quiz
- [Output Quiz #3 — The Event Loop & Task Ordering](/articles/js-output-event-loop) — the microtask/macrotask queue model
- [Output Quiz #7 — Promise Chaining & the .catch() Recovery Rules](/articles/js-output-promise-chaining) — concurrent chain interleaving
