Two concurrent chains interleave breadth-first, not depth-first — this single fact is wrong in more senior JS interviews than any other async concept. Ten questions building from two-chain interleaving to the full microtask tick-by-tick model, including the resolve(promise) extra-tick rule and three async function interleaving.

---

## Q1 — Two concurrent chains: breadth-first, not depth-first

```js-exec
Promise.resolve()
  .then(() => console.log("A"))
  .then(() => console.log("B"));

Promise.resolve()
  .then(() => console.log("C"))
  .then(() => console.log("D"));
```

<details>
<summary>Show answer</summary>

**Output:**
```
A
C
B
D
```

**Why:** At the end of synchronous code, the microtask queue has two entries: `[cbA, cbC]`. `cbA` runs → logs `"A"` → schedules `cbB` at the end of the queue. Queue: `[cbC, cbB]`. `cbC` runs → logs `"C"` → schedules `cbD`. Queue: `[cbB, cbD]`. `cbB` → `"B"`; `cbD` → `"D"`. This is **breadth-first** interleaving — the chains alternate depth levels. Most developers expect `"A B C D"`.

</details>

---

## Q2 — Why breadth-first matters

```js-exec
Promise.resolve()
  .then(() => console.log(1))
  .then(() => {
    console.log(2);
    return 3;
  })
  .then(v => console.log(v));

Promise.resolve()
  .then(() => console.log(4))
  .then(() => console.log(5));
```

<details>
<summary>Show answer</summary>

**Output:**
```
1
4
2
5
3
```

**Why:** Start: microtask queue `[cb1, cb4]`. `cb1` runs → `1` → schedules `cb2`. Queue: `[cb4, cb2]`. `cb4` runs → `4` → schedules `cb5`. Queue: `[cb2, cb5]`. `cb2` runs → `2` → schedules `cb3`. Queue: `[cb5, cb3]`. `cb5` → `5`; `cb3` → `3`. Each depth level from each chain runs before the next level from any chain. `3` comes last even though it started first.

</details>

---

## Q3 — Three concurrent chains

```js-exec
Promise.resolve()
  .then(() => console.log("A"))
  .then(() => console.log("B"));

Promise.resolve()
  .then(() => console.log("C"))
  .then(() => console.log("D"));

Promise.resolve()
  .then(() => console.log("E"))
  .then(() => console.log("F"));
```

<details>
<summary>Show answer</summary>

**Output:**
```
A
C
E
B
D
F
```

**Why:** Three chains, same rule. Microtask queue initially: `[A, C, E]`. `A` runs → schedules `B`. `C` runs → schedules `D`. `E` runs → schedules `F`. Queue: `[B, D, F]`. All three depth-1 callbacks run before any depth-2 callback. Breadth-first means each "round" of the microtask queue processes one `.then()` from each chain, then the next round, and so on.

</details>

---

## Q4 — queueMicrotask vs Promise.resolve().then()

```js-exec
Promise.resolve().then(() => console.log("A"));
queueMicrotask(() => console.log("B"));
Promise.resolve().then(() => console.log("C"));
```

<details>
<summary>Show answer</summary>

**Output:**
```
A
B
C
```

**Why:** `queueMicrotask` and `Promise.resolve().then()` both schedule to the **same microtask queue**. They are ordered by insertion. `"A"` is queued first, then `"B"`, then `"C"`. So: `A`, `B`, `C`. There is no priority difference — the queue is a simple FIFO. Use either API, but be consistent in your mental model: they're the same thing.

</details>

---

## Q5 — queueMicrotask from inside a .then() handler

```js-exec
Promise.resolve()
  .then(() => {
    console.log("A");
    queueMicrotask(() => console.log("B"));
  });

Promise.resolve()
  .then(() => console.log("C"));
```

<details>
<summary>Show answer</summary>

**Output:**
```
A
C
B
```

**Why:** Microtask queue initially: `[cbA, cbC]`. `cbA` runs → logs `"A"` → queues `qmB` at the end. Queue: `[cbC, qmB]`. `cbC` runs → `"C"`. Then `qmB` → `"B"`. The `queueMicrotask` from inside a `.then()` doesn't jump ahead — it goes to the back of the current microtask queue and runs before the next macrotask, but after already-scheduled microtasks.

</details>

---

## Q6 — Three async functions called back-to-back: exact interleaving

```js-exec
async function f1() {
  console.log("f1-sync");
  await null;
  console.log("f1-end");
}

async function f2() {
  console.log("f2-sync");
  await null;
  console.log("f2-end");
}

async function f3() {
  console.log("f3-sync");
  await null;
  console.log("f3-end");
}

f1(); f2(); f3();
console.log("global");
```

<details>
<summary>Show answer</summary>

**Output:**
```
f1-sync
f2-sync
f3-sync
global
f1-end
f2-end
f3-end
```

**Why:** The pre-`await` code in each async function runs synchronously as part of the call. So `f1-sync`, `f2-sync`, `f3-sync` all run in order. Then `"global"`. Each `await null` suspends and schedules its continuation as a microtask, in order: `[f1-end, f2-end, f3-end]`. Microtask drain: `f1-end`, `f2-end`, `f3-end`. Simple FIFO because each only has one `await`.

</details>

---

## Q7 — Async function with two await points

```js-exec
async function double() {
  console.log("A1");
  await null;
  console.log("A2");
  await null;
  console.log("A3");
}

async function single() {
  console.log("B1");
  await null;
  console.log("B2");
}

double(); single();
console.log("sync");
```

<details>
<summary>Show answer</summary>

**Output:**
```
A1
B1
sync
A2
B2
A3
```

**Why:** Sync: `A1`, `B1`, `"sync"`. First microtask round: `[A2, B2]`. `A2` runs → schedules `A3`. `B2` runs. Second microtask round: `[A3]`. `A3` runs. So `A2` runs before `B2` (FIFO in round 1), but `A3` is scheduled in round 2 and runs after `B2`. The second `await` creates a natural depth break — `A3` goes one round deeper than `A2`.

</details>

---

## Q8 — Nested microtask scheduling: all drain before next macrotask

```js-exec
Promise.resolve()
  .then(() => {
    console.log(1);
    Promise.resolve()
      .then(() => {
        console.log(2);
        Promise.resolve()
          .then(() => console.log(3));
      });
  });

setTimeout(() => console.log("timeout"), 0);
```

<details>
<summary>Show answer</summary>

**Output:**
```
1
2
3
timeout
```

**Why:** Microtask drains before the `setTimeout` macrotask. `1` logs, schedules microtask for `2`. Microtask queue now: `[log2]`. `2` logs, schedules microtask for `3`. Queue: `[log3]`. `3` logs. Queue now empty. Then — and only then — the `setTimeout` macrotask runs: `"timeout"`. No matter how deep the nested microtask chain goes, all must drain before the next macrotask.

</details>

---

## Q9 — resolve(promise) gets one extra microtask tick

```js-exec
const inner = Promise.resolve("inner");

new Promise(resolve => resolve(inner))
  .then(v => console.log("outer:", v));

new Promise(resolve => resolve(42))
  .then(v => console.log("plain:", v));

inner.then(v => console.log("inner:", v));
```

<details>
<summary>Show answer</summary>

**Output:**
```
plain: 42
inner: inner
outer: inner
```

**Why:** `resolve(42)` is a plain value — the `.then()` is queued immediately. `resolve(inner)` triggers Promise adoption — the engine must call `inner.then(resolveOuter, rejectOuter)`, which is itself a microtask.

Timeline:
1. Sync ends. Microtask queue: `[adopt inner→outer, cb "plain: 42", cb "inner: inner"]`
2. `adopt` runs → `outer` resolves → queues `cb "outer: inner"`. Queue: `[cb "plain: 42", cb "inner: inner", cb "outer: inner"]`
3. `"plain: 42"` logs, then `"inner: inner"`, then `"outer: inner"`.

The extra adoption tick pushes `outer`'s `.then()` one position later — behind `inner`'s own `.then()` and behind the plain-value chain's `.then()`.

</details>

---

## Q10 — Full complexity: 3 async functions + queueMicrotasks + setTimeout

```js-exec
async function f1() {
  console.log("A");
  await null;
  console.log("B");
  await null;
  console.log("C");
}

async function f2() {
  console.log("D");
  await null;
  console.log("E");
}

f1(); f2();

queueMicrotask(() => console.log("QM1"));
Promise.resolve().then(() => console.log("P1"));

setTimeout(() => console.log("T1"), 0);

queueMicrotask(() => console.log("QM2"));
console.log("SYNC");
```

<details>
<summary>Show answer</summary>

**Output:**
```
A
D
SYNC
B
E
QM1
P1
QM2
C
T1
```

**Why:** Full tick-by-tick trace:

**Sync:** `A`, `D`, `"SYNC"`. After sync:
- Microtask queue: `[B, E, QM1, P1, QM2]` — f1's first continuation, f2's continuation, then the three sync-scheduled microtasks in order.
- Macrotask queue: `[T1]`

**Microtask drain — round 1:**
- `B` runs → schedules `C` (new microtask). Queue: `[E, QM1, P1, QM2, C]`
- `E` runs. Queue: `[QM1, P1, QM2, C]`
- `QM1` runs. Queue: `[P1, QM2, C]`
- `P1` runs. Queue: `[QM2, C]`
- `QM2` runs. Queue: `[C]`
- `C` runs. Queue empty.

**Macrotask drain:** `T1`.

</details>

---

## Key Rules

| Concept | Rule |
|---|---|
| Breadth-first interleaving | Multiple `.then()` chains alternate by depth level: A, C, B, D — not A, B, C, D |
| `queueMicrotask` vs `.then()` | Same queue, same priority — FIFO insertion order |
| `queueMicrotask` inside `.then()` | Goes to end of current microtask queue, runs before next macrotask |
| Async function continuations | Each `await` schedules the rest as a new microtask |
| Two-`await` function | Second `await` breaks into a new microtask round |
| Nested microtasks | All drain before any macrotask — no limit on depth |
| `resolve(promise)` extra tick | Adoption is one extra microtask — `.then()` is delayed vs `resolve(plainValue)` |
| Golden rule | Sync → all microtasks (recursively) → one macrotask → all microtasks → next macrotask |

---

## Go Deeper

- [Output Quiz #11 — Async Error Propagation](/articles/js-output-async-errors) — the previous quiz
- [Output Quiz #13 — Mixed Async Topics (Easy)](/articles/js-output-mixed-easy) — the next quiz
- [Output Quiz #3 — The Event Loop & Task Ordering](/articles/js-output-event-loop) — the microtask queue model foundation
- [Output Quiz #7 — Promise Chaining & the .catch() Recovery Rules](/articles/js-output-promise-chaining) — breadth-first demo in Q8
