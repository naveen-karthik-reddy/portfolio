The event loop is the most counter-intuitive topic in JS interviews because the output depends on understanding three separate queues: the call stack, the microtask queue, and the task queue. Ten questions that will sharpen your mental model of execution order.

---

## Q1 — setTimeout(0) vs synchronous code

```js-exec
console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");
```

<details>
<summary>Show answer</summary>

**Output:**
```
A
C
B
```

**Why:** `console.log("A")` and `console.log("C")` run synchronously on the call stack. `setTimeout` schedules `"B"` as a **macrotask** — it goes into the task queue and only runs after the current synchronous execution is complete. Even with a delay of `0`, the callback never jumps the queue ahead of synchronous code.

</details>

---

## Q2 — Promise vs setTimeout

```js-exec
console.log("start");

setTimeout(() => console.log("timeout"), 0);

Promise.resolve().then(() => console.log("promise"));

console.log("end");
```

<details>
<summary>Show answer</summary>

**Output:**
```
start
end
promise
timeout
```

**Why:** Execution order: synchronous code first (`start`, `end`), then the **microtask queue** is drained (`.then` callbacks), then the **task queue** runs (`setTimeout` callbacks). Promise `.then` callbacks are microtasks — they always run before the next macrotask. `setTimeout` is a macrotask, so it waits even though its delay is `0`.

</details>

---

## Q3 — Chained .then()

```js-exec
Promise.resolve()
  .then(() => { console.log(1); return 2; })
  .then((v) => { console.log(v); return 3; })
  .then((v) => console.log(v));

console.log("sync");
```

<details>
<summary>Show answer</summary>

**Output:**
```
sync
1
2
3
```

**Why:** `console.log("sync")` runs first (synchronous). Then the microtask queue is processed: the first `.then` runs (logs `1`, returns `2`), which schedules the second `.then` as a new microtask (logs `2`, returns `3`), which schedules the third (logs `3`). Each `.then` callback is enqueued only after the previous one completes.

</details>

---

## Q4 — queueMicrotask vs setTimeout

```js-exec
setTimeout(() => console.log("macro"), 0);
queueMicrotask(() => console.log("micro"));
console.log("sync");
```

<details>
<summary>Show answer</summary>

**Output:**
```
sync
micro
macro
```

**Why:** `queueMicrotask` explicitly enqueues a microtask — same queue as `Promise.then`. The microtask queue is drained completely after each task, before the next macrotask runs. So order is: synchronous → microtasks → macrotasks.

</details>

---

## Q5 — async/await interleaving

```js-exec
async function foo() {
  console.log("foo start");
  await Promise.resolve();
  console.log("foo after await");
}

console.log("before");
foo();
console.log("after");
```

<details>
<summary>Show answer</summary>

**Output:**
```
before
foo start
after
foo after await
```

**Why:** `foo()` is called synchronously. Inside `foo`, `"foo start"` logs immediately. Then `await Promise.resolve()` suspends `foo` — it schedules the rest of the function (`"foo after await"`) as a microtask and returns control to the caller. `"after"` logs synchronously. Then the microtask runs: `"foo after await"`.

</details>

---

## Q6 — Multiple awaits

```js-exec
async function run() {
  console.log(1);
  await null;
  console.log(2);
  await null;
  console.log(3);
}

run();
console.log(4);
```

<details>
<summary>Show answer</summary>

**Output:**
```
1
4
2
3
```

**Why:** `run()` executes synchronously until the first `await null`. At that point it suspends, returning control: `4` logs. Then the microtask for the resumed `run()` fires: `2` logs. The second `await null` suspends again, but there's no more synchronous code, so the next microtask fires immediately: `3` logs.

</details>

---

## Q7 — Promise constructor is synchronous

```js-exec
console.log("A");

const p = new Promise((resolve) => {
  console.log("B");
  resolve();
});

p.then(() => console.log("C"));

console.log("D");
```

<details>
<summary>Show answer</summary>

**Output:**
```
A
B
D
C
```

**Why:** The Promise executor function (`(resolve) => { ... }`) runs **synchronously** when the `Promise` is constructed. So `"B"` logs immediately. The `.then` callback (`"C"`) is a microtask — it runs after all synchronous code (`"D"`) completes.

</details>

---

## Q8 — Nested setTimeout

```js-exec
setTimeout(() => {
  console.log(1);
  setTimeout(() => console.log(2), 0);
  console.log(3);
}, 0);

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

**Why:** Both outer `setTimeout`s are queued as macrotasks. The first runs: logs `1`, schedules a *new* macrotask for `2`, logs `3`. Then the second outer `setTimeout` runs (it was queued before the inner one): logs `4`. Finally the innermost `setTimeout` runs: logs `2`. Nested `setTimeout` pushes to the back of the task queue, behind already-scheduled tasks.

</details>

---

## Q9 — Promise then vs async/await mixing

```js-exec
async function a() {
  console.log("a1");
  await b();
  console.log("a2");
}

async function b() {
  console.log("b1");
}

console.log("start");
a();
console.log("end");
```

<details>
<summary>Show answer</summary>

**Output:**
```
start
a1
b1
end
a2
```

**Why:** `a()` starts synchronously: `"a1"` logs. `await b()` calls `b()` synchronously: `"b1"` logs. `b()` returns a resolved promise. The `await` suspends `a()` (schedules `"a2"` as a microtask) and returns control to `a()`'s caller. `"end"` logs. Then the microtask runs: `"a2"`.

</details>

---

## Q10 — Microtask starvation

```js-exec
let done = false;

Promise.resolve().then(function loop() {
  if (!done) Promise.resolve().then(loop);
});

setTimeout(() => {
  done = true;
  console.log("setTimeout ran");
}, 0);

console.log("sync done");
```

<details>
<summary>Show answer</summary>

**Output:**
```
sync done
(hangs — "setTimeout ran" never logs in a real browser)
```

**Why:** Each microtask schedules another microtask before the engine can drain the queue. The microtask queue is fully drained before any macrotask runs — so the `setTimeout` callback never gets a turn. This is **microtask starvation**: an infinite chain of microtasks prevents all macrotasks (rendering, I/O, timers) from running. In a real browser, this freezes the page.

</details>

---

## Key Rules

| Queue | What goes there | When it runs |
|---|---|---|
| Call stack | Synchronous code | Right now |
| Microtask queue | `Promise.then`, `queueMicrotask`, `await` resume | After every task, before next macrotask |
| Task queue (macrotask) | `setTimeout`, `setInterval`, I/O, events | One at a time, after microtask queue is empty |

**The golden rule:** synchronous → all microtasks → one macrotask → all microtasks → one macrotask → …

---

## Go Deeper

- [Async #1 — The Event Loop in Depth](/articles/js-event-loop-in-depth) — call stack, microtask queue, and starvation fully explained
- [Performance #6 — The JavaScript Event Loop & Task Queue](/articles/06-event-loop-task-queue) — why this matters for page performance
- [Output Quiz #2 — Closures & the Loop Problem](/articles/js-output-closures) — the previous quiz
- [Output Quiz #4 — this Binding & Arrow Functions](/articles/js-output-this-binding) — the next quiz
