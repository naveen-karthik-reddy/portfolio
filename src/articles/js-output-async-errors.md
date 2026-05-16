Async error handling has more moving parts than synchronous code — errors jump queues, try/catch doesn't cover bare calls, and Promise.all silently discards results on failure. Ten output questions tracing how errors move through async call stacks, combining .catch() chains, async function layers, and timing.

---

## Q1 — throw inside async function creates a rejected Promise

```js-exec
async function boom() {
  throw new Error("async error");
}

const p = boom();
console.log(p instanceof Promise);

p.catch(e => console.log("caught:", e.message));
console.log("after boom()");
```

<details>
<summary>Show answer</summary>

**Output:**
```
true
after boom()
caught: async error
```

**Why:** A `throw` inside an `async` function is automatically converted to a rejected Promise. The calling code is unaffected synchronously — the rejection is handled as a microtask. `"after boom()"` logs first, then the `.catch()` fires.

</details>

---

## Q2 — Promise.reject() with no .catch()

```js-exec
const p = Promise.reject("oops");
console.log("sync after reject");
p.catch(e => console.log("caught:", e));
```

<details>
<summary>Show answer</summary>

**Output:**
```
sync after reject
caught: oops
```

**Why:** `Promise.reject("oops")` creates a rejected Promise immediately. The `.catch()` is attached synchronously (same microtask timing), so the rejection is handled. If there were a gap — if `.catch()` was added in a `setTimeout` — the unhandled rejection would fire first. This is why `.catch()` registration timing matters.

</details>

---

## Q3 — Error in Promise executor is NOT catchable by sync try/catch

```js-exec
try {
  new Promise((resolve, reject) => {
    throw new Error("executor error");
  });
} catch (e) {
  console.log("sync catch:", e.message);
}
```

<details>
<summary>Show answer</summary>

**Output:**
(nothing logs — the error is silently converted to a rejection)

**Why:** The `throw` inside the Promise executor is caught by the Promise constructor, which converts it to a rejection — it never escapes to the outer `try/catch`. The outer `catch` block is never reached. To handle this error, you need `.catch()` on the Promise itself. The synchronous `try/catch` around `new Promise(...)` cannot intercept executor errors.

</details>

---

## Q4 — .catch() returning a value recovers the chain

```js-exec
Promise.reject("initial")
  .catch(e => {
    console.log("first catch:", e);
    return 42;
  })
  .then(v => console.log("then:", v))
  .catch(e => console.log("second catch:", e));
```

<details>
<summary>Show answer</summary>

**Output:**
```
first catch: initial
then: 42
```

**Why:** The first `.catch()` returns `42` — a plain value. This converts the chain back to the resolved track. The `.then()` runs and receives `42`. The second `.catch()` is never reached because the chain is no longer rejected. Recovery: handle, return something useful, and the chain continues normally.

</details>

---

## Q5 — .catch() that re-throws keeps the chain rejected

```js-exec
Promise.reject("first error")
  .catch(e => {
    console.log("catcher:", e);
    throw "second error";
  })
  .then(v => console.log("then:", v))
  .catch(e => console.log("final catch:", e));
```

<details>
<summary>Show answer</summary>

**Output:**
```
catcher: first error
final catch: second error
```

**Why:** The first `.catch()` re-throws (`throw "second error"`), which keeps the chain on the rejected track. The `.then()` is skipped. The second `.catch()` catches `"second error"`. Re-throwing is how you inspect an error and decide it's not recoverable — the error propagates further down the chain.

</details>

---

## Q6 — Promise.all discards results on first rejection

```js-exec
async function main() {
  const p1 = Promise.resolve("one");
  const p2 = Promise.reject("fail");
  const p3 = Promise.resolve("three");

  try {
    const results = await Promise.all([p1, p2, p3]);
    console.log(results);
  } catch (e) {
    console.log("caught:", e);
    // What happens to p1 and p3's values?
  }
}

main();
```

<details>
<summary>Show answer</summary>

**Output:**
```
caught: fail
```

**Why:** `Promise.all` is fail-fast — it rejects with the first rejection reason. The resolved values from `p1` and `p3` are **discarded**. The Promises themselves still resolve (you could still `.then()` on `p1` individually), but their values are lost from the `Promise.all` result. If you need all results even with failures, use `Promise.allSettled`.

</details>

---

## Q7 — Chained async function calls propagate errors through await

```js-exec
async function level3() {
  throw new Error("deep");
}

async function level2() {
  return await level3();
}

async function level1() {
  try {
    await level2();
  } catch (e) {
    console.log("caught at top:", e.message);
  }
}

level1();
```

<details>
<summary>Show answer</summary>

**Output:**
```
caught at top: deep
```

**Why:** Errors propagate up the `await` chain. `level3()` rejects → `level2()`'s `await` on it re-throws → `level2()` returns a rejected Promise → `level1()`'s `await` on it re-throws → `level1()`'s `catch` intercepts. This is why `async/await` is preferred for multi-layer async — error propagation works like synchronous error propagation through call stacks.

</details>

---

## Q8 — try/catch without await doesn't cover the async function's body

```js-exec
async function fetch() {
  await Promise.resolve();
  throw new Error("late error");
}

try {
  fetch();
} catch (e) {
  console.log("sync catch:", e.message);
}

fetch().catch(e => console.log("catch on call:", e.message));
```

<details>
<summary>Show answer</summary>

**Output:**
```
catch on call: late error
```

**Why:** `try { fetch() }` without `await` only catches errors thrown synchronously by `fetch()` — which returns a Promise (not an error) because the `throw` happens after `await`. The synchronous `catch` block is never reached. To catch the error, you must either `await fetch()` inside the `try`, or attach `.catch()` to the returned Promise. This is the root cause of countless unhandled rejection bugs.

</details>

---

## Q9 — Unhandled rejection in .then() chain catches

```js-exec
Promise.resolve()
  .then(() => {
    throw new Error("then error");
  })
  .then(() => console.log("never"));

console.log("sync");

// The chain rejection is unhandled until we add:
// .catch(e => console.log(e.message))
```

<details>
<summary>Show answer</summary>

**Output:**
```
sync
(UnhandledPromiseRejection warning in Node)
```

**Why:** The error thrown in the first `.then()` propagates down the chain looking for a `.catch()`. There is none in this snippet — the chain ends without a rejection handler. This triggers an `UnhandledPromiseRejection`. `"sync"` logs first (the rejection happens as a microtask). The fix: always end a `.then()` chain with `.catch()`, or use `try/catch` with `await`.

</details>

---

## Q10 — Long .then() chain — where does the 3rd .then()'s error end up?

```js-exec
Promise.resolve(1)
  .then(v => {
    console.log("t1:", v);
    return v + 1;
  })
  .then(v => {
    console.log("t2:", v);
    throw new Error("bad");
  })
  .then(v => {
    console.log("t3:", v);
    return v + 1;
  })
  .then(v => console.log("t4:", v))
  .catch(e => console.log("catch:", e.message));
```

<details>
<summary>Show answer</summary>

**Output:**
```
t1: 1
t2: 2
catch: bad
```

**Why:** `t1` logs `1` and returns `2`. `t2` logs `2` and throws `"bad"`. The error jumps past `t3` and `t4` (both skipped) and lands in the `.catch()` at the end. Errors in a `.then()` chain skip all subsequent `.then()` handlers and jump to the nearest `.catch()` — wherever it appears in the chain. This is why `.catch()` at the end of the chain is the standard pattern.

</details>

---

## Key Rules

| Scenario | What happens |
|---|---|
| `throw` in `async fn` | Returned Promise becomes rejected; callers are unaffected synchronously |
| `Promise.reject()` unattached | `unhandledrejection` event fires if `.catch()` isn't attached in the same microtask round |
| `throw` in Promise executor | Caught by the constructor — converted to rejection; NOT catchable by outer try/catch |
| `.catch()` returns plain value | Chain recovers to resolved; next `.then()` receives that value |
| `.catch()` re-throws | Chain stays rejected; next `.catch()` in line fires |
| `Promise.all` with rejection | Fail-fast — only first rejection reason surfaces; other values lost |
| Error through `await` chain | Propagates up like sync call stack — each `await` re-throws |
| `try { asyncFn() }` without `await` | Does NOT cover errors inside `asyncFn`'s body |
| `.then()` error without `.catch()` | Jumps down the chain; unhandled rejection if no catch exists |

---

## Go Deeper

- [Output Quiz #10 — setTimeout + Promises: Real-World Interleaving](/articles/js-output-settimeout-promise) — the previous quiz
- [Output Quiz #12 — Microtask Queue: Breadth-First Ordering](/articles/js-output-microtask-order) — the next quiz
- [Output Quiz #7 — Promise Chaining & the .catch() Recovery Rules](/articles/js-output-promise-chaining) — deeper on .catch() recovery vs re-throw
- [Output Quiz #9 — async/await Patterns](/articles/js-output-async-patterns) — return vs return await trap
