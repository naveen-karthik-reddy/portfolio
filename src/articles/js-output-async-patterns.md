async/await hides a lot of Promise mechanics — and interviewers know exactly where the gaps are. The return vs return await trap in try/catch catches nearly every developer once. Ten questions on the patterns that separate knowing the syntax from understanding the model.

---

## Q1 — await on a non-Promise suspends too

```js-exec
async function main() {
  console.log(1);
  const val = await 42;
  console.log(val);
  console.log(3);
}

main();
console.log(2);
```

<details>
<summary>Show answer</summary>

**Output:**
```
1
2
42
3
```

**Why:** `await 42` is equivalent to `await Promise.resolve(42)`. Even though `42` is a plain number, `await` always suspends the function and schedules the rest as a microtask — regardless of whether the value is a Promise. So `2` logs synchronously before `42` and `3`.

</details>

---

## Q2 — Code before the first await is synchronous

```js-exec
async function setup() {
  console.log("setup start");
  await null;
  console.log("setup end");
}

console.log("before");
setup();
console.log("after");
```

<details>
<summary>Show answer</summary>

**Output:**
```
before
setup start
after
setup end
```

**Why:** The code inside an `async` function runs **synchronously** until the first `await`. `"setup start"` logs as part of the same synchronous turn as `"before"` and `"after"`. The `await null` is the suspension point — everything after it (`"setup end"`) is scheduled as a microtask and runs later.

</details>

---

## Q3 — Error thrown before first await creates a rejected Promise

```js-exec
async function boom() {
  throw new Error("immediate");
  await null;
}

const p = boom();
console.log(p instanceof Promise);

p.catch(e => console.log("caught:", e.message));
console.log("sync after boom()");
```

<details>
<summary>Show answer</summary>

**Output:**
```
true
sync after boom()
caught: immediate
```

**Why:** An `async` function always returns a Promise. If it throws before reaching any `await`, the returned Promise is immediately rejected. `p` is a rejected Promise — `p instanceof Promise` is `true`. The `.catch()` callback fires as a microtask, so `"sync after boom()"` logs first.

</details>

---

## Q4 — return Promise.reject() in try is NOT caught

```js-exec
async function withReturn() {
  try {
    return Promise.reject("error");
  } catch (e) {
    console.log("caught in catch:", e);
  }
}

withReturn().catch(e => console.log("caught outside:", e));
```

<details>
<summary>Show answer</summary>

**Output:**
```
caught outside: error
```

**Why:** `return Promise.reject("error")` exits the `try` block immediately — the `catch` block never runs. The rejected Promise is returned from the function (and thus from the `async` function's own returned Promise). The `try/catch` only catches synchronous throws and `await`-ed rejections. A bare `return` of a rejected Promise is neither.

</details>

---

## Q5 — return await Promise.reject() IS caught

```js-exec
async function withReturnAwait() {
  try {
    return await Promise.reject("error");
  } catch (e) {
    console.log("caught in catch:", e);
    return "recovered";
  }
}

withReturnAwait().then(v => console.log("result:", v));
```

<details>
<summary>Show answer</summary>

**Output:**
```
caught in catch: error
result: recovered
```

**Why:** `return await Promise.reject("error")` first **awaits** the rejected Promise — which throws at the `await` expression — which the surrounding `try/catch` can intercept. The `catch` block recovers and returns `"recovered"`, so the outer `.then()` receives it. This is the critical difference: `return` exits immediately; `return await` stays inside the try and gives the catch block a chance.

</details>

---

## Q6 — Sequential await vs Promise.all timing

```js-exec
function delay(ms, val) {
  return new Promise(resolve => setTimeout(() => resolve(val), ms));
}

async function sequential() {
  const a = await delay(100, "a");
  const b = await delay(100, "b");
  console.log("sequential:", a, b);
}

async function parallel() {
  const [a, b] = await Promise.all([delay(100, "a"), delay(100, "b")]);
  console.log("parallel:", a, b);
}

sequential();
parallel();
```

<details>
<summary>Show answer</summary>

**Output:**
```
parallel: a b
sequential: a b
```

**Why:** `parallel()` runs both `delay(100)` calls concurrently — they start at the same time and both resolve after ~100ms total. `sequential()` waits for each in turn — 100ms for `a`, then another 100ms for `b`, totalling ~200ms. `parallel()` finishes first and logs first. Both log the same values but the timing differs significantly in real code with actual I/O.

</details>

---

## Q7 — Async IIFE suspends independently

```js-exec
console.log("before");

(async () => {
  console.log("iife start");
  await null;
  console.log("iife end");
})();

console.log("after");
```

<details>
<summary>Show answer</summary>

**Output:**
```
before
iife start
after
iife end
```

**Why:** The async IIFE is invoked immediately (like any IIFE) and returns a Promise. Its body runs synchronously until `await null`, which suspends it. Execution returns to the outer scope: `"after"` logs. Then the resumed IIFE continuation fires as a microtask: `"iife end"` logs.

</details>

---

## Q8 — await inside .map() doesn't pause the outer function

```js-exec
async function main() {
  const results = [1, 2, 3].map(async (n) => {
    await null;
    return n * 2;
  });

  console.log("results type:", Array.isArray(results));
  console.log("first element:", results[0] instanceof Promise);

  const resolved = await Promise.all(results);
  console.log("resolved:", resolved);
}

main();
```

<details>
<summary>Show answer</summary>

**Output:**
```
results type: true
first element: true
resolved: [2, 4, 6]
```

**Why:** `async` callbacks passed to `.map()` each return a Promise — so `results` is an array of Promises, not an array of values. The `await` inside each callback suspends only that callback, not `main()`. This is one of the most common async bugs: developers expect `.map(async fn)` to produce resolved values, but it produces an array of Promises. The fix is `await Promise.all(results)`.

</details>

---

## Q9 — Nested async functions — how many ticks to resume outer?

```js-exec
async function inner() {
  return "inner value";
}

async function outer() {
  console.log("outer before await");
  const val = await inner();
  console.log("outer after await:", val);
}

outer();
console.log("sync");
```

<details>
<summary>Show answer</summary>

**Output:**
```
outer before await
sync
outer after await: inner value
```

**Why:** `inner()` is an `async` function that returns `"inner value"` — it resolves immediately. `await inner()` suspends `outer()` and schedules the continuation as a microtask (one tick). `"sync"` logs synchronously. Then the microtask fires and `outer` resumes with `"inner value"`. One `await` = one microtask suspension, regardless of whether the awaited value was already resolved.

</details>

---

## Q10 — for await...of iterates sequentially

```js-exec
function delay(ms, val) {
  return new Promise(resolve => setTimeout(() => resolve(val), ms));
}

async function main() {
  const promises = [delay(100, "a"), delay(50, "b"), delay(150, "c")];

  for await (const val of promises) {
    console.log(val);
  }
}

main();
```

<details>
<summary>Show answer</summary>

**Output:**
```
a
b
c
```

**Why:** `for await...of` on an array of Promises awaits each one **in order**. Even though `"b"` resolves fastest (50ms), the loop awaits `promises[0]` first (100ms), then `promises[1]` (already resolved by then), then `promises[2]` (150ms). All three Promises are started at the same time, but the loop yields values in input order as each resolves. Total time is ~150ms (the longest), not the sum.

</details>

---

## Key Rules

| Pattern | Behaviour |
|---|---|
| `await nonPromise` | Wraps in `Promise.resolve()`; still suspends one microtask tick |
| Code before first `await` | Runs **synchronously** as part of the caller's turn |
| `throw` before first `await` | Returned Promise is immediately rejected |
| `return Promise.reject()` in `try` | NOT caught — exits `try` before rejection is observed |
| `return await Promise.reject()` in `try` | IS caught — `await` throws inside the `try` block |
| Sequential `await a; await b` | Waits for each in turn — total time = sum of each wait |
| `await Promise.all([a, b])` | Concurrent — total time = max of waits |
| `[].map(async fn)` | Returns array of Promises — wrap with `Promise.all` to await all |
| `for await...of promises[]` | Awaits in input order; all Promises start immediately |

---

## Go Deeper

- [Output Quiz #8 — Promise Combinators](/articles/js-output-promise-combinators) — the previous quiz
- [Output Quiz #10 — setTimeout + Promises: Real-World Interleaving](/articles/js-output-settimeout-promise) — the next quiz
- [Output Quiz #6 — Promises & async/await Ordering](/articles/js-output-promises-async) — basics that this quiz builds on
- [Output Quiz #3 — The Event Loop & Task Ordering](/articles/js-output-event-loop) — the microtask model behind await suspension
