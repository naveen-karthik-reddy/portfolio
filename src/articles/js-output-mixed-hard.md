Ten expert-tier output questions combining concurrent chains, resolve(promise) timing, async error layers, and multi-queue interleaving — the questions that define the senior JS interview. If you can get all ten right without peeking, your async mental model is complete.

---

## Q1 — Breadth-first with concrete values

```js-exec
Promise.resolve()
  .then(() => {
    console.log(1);
    return 2;
  })
  .then(v => console.log(v));

Promise.resolve()
  .then(() => {
    console.log(3);
    return 4;
  })
  .then(v => console.log(v));

Promise.resolve()
  .then(() => console.log(5));
```

<details>
<summary>Show answer</summary>

**Output:**
```
1
3
5
2
4
```

**Why:** Microtask queue initially: `[cb1, cb3, cb5]`. `cb1` runs → `1` → schedules `cb2`. Queue: `[cb3, cb5, cb2]`. `cb3` → `3` → schedules `cb4`. Queue: `[cb5, cb2, cb4]`. `cb5` → `5`. Then `cb2` → `2`. Then `cb4` → `4`. Breadth-first: all depth-1 callbacks (`cb1`, `cb3`, `cb5`) run before any depth-2 callback (`cb2`, `cb4`).

</details>

---

## Q2 — resolve(promise) vs resolve(plain) head start

```js-exec
const inner = Promise.resolve("inner");

const outer = new Promise(resolve => resolve(inner));
const plain = new Promise(resolve => resolve("plain"));

outer.then(v => console.log("outer:", v));
plain.then(v => console.log("plain:", v));
inner.then(v => console.log("inner:", v));

new Promise(resolve => resolve("extra"))
  .then(v => console.log("extra:", v));
```

<details>
<summary>Show answer</summary>

**Output:**
```
plain: plain
inner: inner
extra: extra
outer: inner
```

**Why:** `resolve(inner)` requires adoption — one extra microtask tick. Timeline:

1. Sync ends. Microtask queue: `[adopt, plain-then, inner-then, extra-then]`
2. Adoption runs → `outer` resolves → queues `outer-then`. Queue: `[plain-then, inner-then, extra-then, outer-then]`
3. `plain: plain`, `inner: inner`, `extra: extra`, `outer: inner`.

`outer`'s `.then()` is last because of the adoption overhead. All plain-value chains got a one-tick head start.

</details>

---

## Q3 — return vs return await in a nested async chain

```js-exec
async function inner() {
  throw new Error("inner error");
}

async function withoutAwait() {
  try {
    return inner();
  } catch (e) {
    console.log("caught:", e.message);
    return "recovered";
  }
}

async function withAwait() {
  try {
    return await inner();
  } catch (e) {
    console.log("caught:", e.message);
    return "recovered";
  }
}

withoutAwait().then(v => console.log("without:", v)).catch(e => console.log("without failed:", e.message));
withAwait().then(v => console.log("with:", v));
```

<details>
<summary>Show answer</summary>

**Output:**
```
without failed: inner error
caught: inner error
with: recovered
```

**Why:** `return inner()` exits the `try` block immediately — `inner()` returns a rejected Promise (because `inner` is async — `throw` inside async creates a rejected Promise). The `catch` block never runs. `withoutAwait()` returns that rejected Promise, so the caller's `.catch()` fires.

`return await inner()` stays inside the `try`. `await` unwraps the rejection → `inner error` is thrown → `catch` intercepts, returns `"recovered"`. The caller's `.then()` receives `"with: recovered"`.

</details>

---

## Q4 — Promise.race vs Promise.any on first rejection

```js-exec
const fastReject = new Promise((_, reject) => setTimeout(() => reject("fast reject"), 50));
const slowResolve = new Promise(resolve => setTimeout(() => resolve("slow resolve"), 100));

Promise.race([fastReject, slowResolve])
  .then(v => console.log("race:", v))
  .catch(e => console.log("race:", e));

Promise.any([fastReject, slowResolve])
  .then(v => console.log("any:", v))
  .catch(e => console.log("any:", e));

console.log("sync");
```

<details>
<summary>Show answer</summary>

**Output:**
```
sync
race: fast reject
any: slow resolve
```

**Why:** `"sync"` logs first. At ~50ms: `fastReject` settles. `race` immediately rejects (first settlement wins). At ~100ms: `slowResolve` fulfills. `any` skips rejections so `fastReject` is ignored — `any` fulfills with `"slow resolve"`. This is the key difference: `race` = first to settle (resolve or reject); `any` = first to fulfill (skips rejections).

</details>

---

## Q5 — Promise chain schedules setTimeout, setTimeout schedules Promise

```js-exec
Promise.resolve()
  .then(() => {
    console.log("P1");
    setTimeout(() => {
      console.log("T1");
      Promise.resolve().then(() => console.log("P-in-T1"));
    }, 0);
  })
  .then(() => console.log("P2"));

setTimeout(() => {
  console.log("T2");
  Promise.resolve().then(() => console.log("P-in-T2"));
}, 0);

console.log("sync");
```

<details>
<summary>Show answer</summary>

**Output:**
```
sync
P1
P2
T2
P-in-T2
T1
P-in-T1
```

**Why:** Sync: `"sync"`. Microtask drain: `P1` → queues macrotask `T1` → queues `P2`. Then `P2` runs. Macrotask queue now: `[T2, T1]` (T2 was scheduled during sync, T1 during microtask). `T2` → `"T2"` → queues microtask `P-in-T2`. Microtask drain: `"P-in-T2"`. `T1` → `"T1"` → queues microtask `P-in-T1`. Microtask drain: `"P-in-T1"`. The key: macrotask scheduled inside a microtask goes to the end of the task queue, behind already-scheduled macrotasks.

</details>

---

## Q6 — Async error propagation through three layers

```js-exec
async function C() {
  console.log("C");
  throw new Error("from C");
}

async function B() {
  console.log("B");
  return await C();
}

async function A() {
  console.log("A");
  try {
    await B();
    console.log("after B");
  } catch (e) {
    console.log("A caught:", e.message);
  }
}

A();
console.log("sync");
```

<details>
<summary>Show answer</summary>

**Output:**
```
A
B
C
sync
A caught: from C
```

**Why:** All pre-`await` code runs synchronously: `"A"`, `"B"`, `"C"`. Then `"sync"`. `C()` returns a rejected Promise. `B()`'s `await` re-throws it, making `B()` return a rejected Promise. `A()`'s `await` re-throws it, landing in `A`'s `catch`. `"after B"` is unreachable. The error propagates up through each `await` like a synchronous throw through a call stack.

</details>

---

## Q7 — Promise.allSettled output shape

```js-exec
async function main() {
  const results = await Promise.allSettled([
    Promise.resolve("ok"),
    Promise.reject("fail"),
    new Promise(resolve => setTimeout(() => resolve("delayed"), 50)),
  ]);

  console.log(results.length);
  console.log(results[0].status, "→", results[0].value);
  console.log(results[1].status, "→", results[1].reason);
  console.log(results[2].status, "→", results[2].value);
}

main();
```

<details>
<summary>Show answer</summary>

**Output:**
```
3
fulfilled → ok
rejected → fail
fulfilled → delayed
```

**Why:** `Promise.allSettled` waits for all Promises (including the 50ms delay) and returns an array in input order. Fulfilled: `{status:"fulfilled", value:...}`. Rejected: `{status:"rejected", reason:...}`. All three are represented — nothing is lost. The 50ms delay means the whole thing takes ~50ms, but the structure doesn't change. `allSettled` never rejects.

</details>

---

## Q8 — await inside .map() finishes before mapped promises

```js-exec
async function main() {
  const p = [1, 2, 3].map(async (n) => {
    await new Promise(resolve => setTimeout(resolve, n * 100));
    return n * 10;
  });

  console.log("p is array of:", p[0] instanceof Promise ? "Promises" : "Values");

  const results = await Promise.all(p);
  console.log("results:", results);
}

main();
console.log("sync");
```

<details>
<summary>Show answer</summary>

**Output:**
```
p is array of: Promises
sync
results: [10, 20, 30]
```

**Why:** `.map(async fn)` returns an array of Promises — `"P"` logs `"Promises"`. `main()` suspends at `await Promise.all(p)` — the continuations (printing `results`) are microtasks. `"sync"` logs. After ~300ms (the longest timer), all Promises resolve: `[10, 20, 30]`. Note: even though `n=1` resolves first at 100ms, the array order is preserved by `Promise.all`.

</details>

---

## Q9 — for await...of sequential timing

```js-exec
function delay(ms, val) {
  return new Promise(resolve => setTimeout(() => resolve(val), ms));
}

async function main() {
  const promises = [delay(100, "a"), delay(50, "b"), delay(150, "c")];
  const start = Date.now();

  for await (const val of promises) {
    console.log(val, Date.now() - start, "ms");
  }
}

main();
```

<details>
<summary>Show answer</summary>

**Output (approx):**
```
a 100 ms
b 100 ms
c 150 ms
```

**Why:** All three Promises are started at the same time (inside the `promises` array). `for await...of` awaits them in order: first `promises[0]` (~100ms) → `"a"` at ~100ms. Then `promises[1]` — already resolved at 50ms, so it yields immediately: `"b"` at ~100ms. Then `promises[2]` (~150ms) → `"c"` at ~150ms. Total time is the longest Promise (~150ms), not the sum of delays. Each iteration blocks on the current element's resolution.

</details>

---

## Q10 — Everything at once

```js-exec
async function f1() {
  console.log("f1-start");
  await null;
  console.log("f1-mid");
  await Promise.resolve();
  console.log("f1-end");
}

async function f2() {
  console.log("f2-start");
  throw "f2-error";
}

f1();
f2().catch(e => console.log("f2", e));

Promise.all([
  Promise.resolve("all-ok"),
  Promise.resolve("all-ok2"),
]).then(v => console.log(...v));

setTimeout(() => {
  console.log("T");
  Promise.resolve().then(() => console.log("P-in-T"));
}, 0);

queueMicrotask(() => console.log("QM"));
console.log("DONE");
```

<details>
<summary>Show answer</summary>

**Output:**
```
f1-start
f2-start
DONE
QM
f1-mid
f2 f2-error
all-ok all-ok2
f1-end
T
P-in-T
```

**Why:** Full tick-by-tick:

**Sync:** `"f1-start"`, `"f2-start"`, `"DONE"`. `f2()` throws: its returned Promise is immediately rejected (`.catch()` will fire as microtask). `f1()` suspends at first `await null`. `Promise.all` is all-resolved → `.then()` queued as microtask. `queueMicrotask` queues `QM`. Macrotask: `T`.

**Microtask queue after sync:** `[f1-mid, f2-catch, all-then, QM]`
- `f1-mid` → `"f1-mid"` → second `await` → schedules `f1-end` at end
- `f2-catch` → `"f2 f2-error"` (the catch fires — `f2` returned a rejected Promise)
- `all-then` → `"all-ok all-ok2"`
- `QM` → `"QM"`
- Now: `[f1-end]` → `"f1-end"`

**Macrotask:** `"T"` → queues microtask `P-in-T` → microtask drain: `"P-in-T"`.

</details>

---

## Key Rules

| Pattern | Rule |
|---|---|
| Breadth-first interleaving | Multiple `.then()` chains alternate by depth: depth-1 all run before any depth-2 |
| `resolve(promise)` extra tick | Adoption = 1 extra microtask — chains using `resolve(plain)` get a head start |
| `return fn()` vs `return await fn()` | `return` exits `try` immediately; `return await` keeps the error inside |
| `Promise.race` vs `Promise.any` | `race` = first settled; `any` = first fulfilled (skips rejections) |
| `setTimeout` from `.then()` | Macrotask is queued at the end — runs after previously scheduled macrotasks |
| Error through `await` layers | Propagates like sync call stack — each `await` re-throws |
| `Promise.allSettled` | Never rejects; `{status,value}` or `{status,reason}` per entry |
| `[].map(async fn)` | Returns array of Promises — wrap with `Promise.all` to await |
| `for await...of` | Awaits in order; all Promises start immediately; total time = longest |

---

## Go Deeper

- [Output Quiz #13 — Mixed Async Topics (Easy)](/articles/js-output-mixed-easy) — the easy sampler
- [Output Quiz #12 — Microtask Queue: Breadth-First Ordering](/articles/js-output-microtask-order) — breadth-first deep dive
- [Output Quiz #9 — async/await Patterns & return vs return await](/articles/js-output-async-patterns) — the return vs return await trap
- [Output Quiz #8 — Promise Combinators](/articles/js-output-promise-combinators) — race vs any in detail
- [Output Quiz #3 — The Event Loop & Task Ordering](/articles/js-output-event-loop) — the microtask queue model
