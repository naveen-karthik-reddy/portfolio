Promises and `async/await` are the most common source of output-ordering surprises in modern JavaScript interviews. The key insight: Promise callbacks are microtasks, and `await` is syntactic sugar for `.then()`. Ten questions to cement that model.

---

## Q1 — Promise executor is synchronous

```js-exec
console.log("before");

new Promise((resolve) => {
  console.log("executor");
  resolve("done");
});

console.log("after");
```

<details>
<summary>Show answer</summary>

**Output:**
```
before
executor
after
```

**Why:** The Promise executor function runs **synchronously** at the point the `Promise` is constructed. `"executor"` logs between `"before"` and `"after"`. The resolved value `"done"` goes nowhere here because there's no `.then()` — but the executor itself is not async.

</details>

---

## Q2 — .then() is a microtask

```js-exec
console.log("A");

Promise.resolve("B").then(v => console.log(v));

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

**Why:** `.then()` callbacks are scheduled as **microtasks** — they don't run until the current synchronous execution completes. `"A"` and `"C"` run synchronously; only after the call stack is empty does the microtask `"B"` run.

</details>

---

## Q3 — Returning a value from .then()

```js-exec
Promise.resolve(1)
  .then(v => v + 1)
  .then(v => v * 2)
  .then(v => console.log(v));
```

<details>
<summary>Show answer</summary>

**Output:**
```
4
```

**Why:** Each `.then()` receives the return value of the previous handler. `1 + 1 = 2`, then `2 * 2 = 4`, then `4` is logged. Returning a non-Promise value from `.then()` wraps it in a resolved Promise for the next handler.

</details>

---

## Q4 — async function return value

```js-exec
async function getValue() {
  return 42;
}

const result = getValue();
console.log(result instanceof Promise);

result.then(v => console.log(v));
```

<details>
<summary>Show answer</summary>

**Output:**
```
true
42
```

**Why:** An `async` function **always returns a Promise**, even if you `return` a plain value. `getValue()` returns `Promise.resolve(42)`. So `result instanceof Promise` is `true`. The `.then()` callback receives `42` as a microtask.

</details>

---

## Q5 — await pauses, then resumes

```js-exec
async function main() {
  console.log(1);
  const val = await Promise.resolve(2);
  console.log(val);
  console.log(3);
}

main();
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

**Why:** `main()` runs synchronously until `await`. `1` logs. The `await` suspends `main()` and schedules the rest as a microtask, returning control to the caller. `4` logs synchronously. Then the microtask resumes: `val` is `2`, `2` and `3` log.

</details>

---

## Q6 — Promise.all ordering

```js-exec
async function main() {
  const [a, b] = await Promise.all([
    Promise.resolve("first"),
    Promise.resolve("second"),
  ]);
  console.log(a, b);
}

main();
console.log("sync");
```

<details>
<summary>Show answer</summary>

**Output:**
```
sync
first second
```

**Why:** `"sync"` runs before the `await` resolves (microtask). `Promise.all` resolves when all input Promises resolve — since both are already resolved, it resolves immediately. The destructured values maintain **input order** regardless of resolution order: `a = "first"`, `b = "second"`.

</details>

---

## Q7 — Rejected Promise and .catch()

```js-exec
Promise.reject("error")
  .then(v => console.log("then:", v))
  .catch(e => console.log("catch:", e))
  .then(() => console.log("after catch"));
```

<details>
<summary>Show answer</summary>

**Output:**
```
catch: error
after catch
```

**Why:** A rejection skips all `.then()` handlers until it finds a `.catch()` (or a `.then(null, onReject)` handler). The `.then` after `.catch` runs because `.catch` returned a resolved Promise (it didn't re-throw). The chain is back to the resolved track after the `.catch`.

</details>

---

## Q8 — try/catch with async/await

```js-exec
async function main() {
  try {
    const val = await Promise.reject("oops");
    console.log("never");
  } catch (e) {
    console.log("caught:", e);
  }
  console.log("done");
}

main();
```

<details>
<summary>Show answer</summary>

**Output:**
```
caught: oops
done
```

**Why:** `await` on a rejected Promise throws at the `await` expression — which the surrounding `try/catch` can intercept. `"never"` is unreachable. After the `catch` block handles the error, execution continues normally, so `"done"` logs.

</details>

---

## Q9 — Promise.all vs sequential await

```js-exec
async function sequential() {
  const a = await Promise.resolve("a");
  const b = await Promise.resolve("b");
  console.log(a, b);
}

async function parallel() {
  const [a, b] = await Promise.all([
    Promise.resolve("a"),
    Promise.resolve("b"),
  ]);
  console.log(a, b);
}

sequential();
parallel();
console.log("sync");
```

<details>
<summary>Show answer</summary>

**Output:**
```
sync
a b
a b
```

**Why:** Both `sequential()` and `parallel()` suspend at `await`, so `"sync"` logs first. For these already-resolved Promises, timing is similar — but in real code with delays, `parallel()` would resolve faster because both Promises run concurrently. The logged output is the same (`a b` twice) because the values are the same; the order between the two functions depends on microtask scheduling. `sequential` has two `await`s (two microtask checkpoints), `parallel` has one, so `parallel`'s `.then` is scheduled one microtask later — but with resolved promises they interleave such that both log on the same microtask "beat."

</details>

---

## Q10 — Unhandled rejection

```js-exec
async function fail() {
  throw new Error("boom");
}

fail();
console.log("after fail()");
```

<details>
<summary>Show answer</summary>

**Output:**
```
after fail()
(UnhandledPromiseRejection warning in Node / unhandledrejection event in browser)
```

**Why:** `fail()` returns a rejected Promise (because `async` functions convert thrown errors into rejections). The rejection is not handled (no `.catch()`, no `await` inside a `try/catch`). `"after fail()"` logs synchronously before the rejection is processed. Node.js emits an `UnhandledPromiseRejection` warning; browsers fire the `unhandledrejection` event. The key point: an unhandled rejection inside an `async` function is silent until the engine checks for it.

</details>

---

## Key Rules

| Pattern | Behaviour |
|---|---|
| Promise executor | Runs **synchronously** |
| `.then()` / `.catch()` | Scheduled as **microtasks** — run after current sync code |
| `async` function | Always returns a Promise |
| `await expr` | Suspends the function; the rest runs as a microtask |
| Returned value from `.then()` | Wrapped in a resolved Promise for the next handler |
| Thrown error / rejected `await` | Jumps to nearest `.catch()` or `try/catch` |
| `Promise.all` | Resolves when all resolve; preserves **input order** |

---

## Go Deeper

- [Async #3 — Building a Promise from Scratch](/articles/js-promise-from-scratch) — implement the Promise state machine
- [Async #5 — async/await Under the Hood](/articles/js-async-await-under-hood) — how `await` desugars to generators + Promises
- [Output Quiz #5 — Type Coercion & Equality Traps](/articles/js-output-type-coercion) — the previous quiz
- [Output Quiz #7 — Promise Chaining & the .catch() Recovery Rules](/articles/js-output-promise-chaining) — the next quiz
- [Output Quiz #3 — The Event Loop & Task Ordering](/articles/js-output-event-loop) — the microtask model in depth
