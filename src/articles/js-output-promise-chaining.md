Promise chaining has more edge cases than most devs expect — .catch() can recover a chain, .finally() silently passes values through, and two concurrent chains interleave breadth-first, not depth-first. Ten questions to sharpen your mental model before the interview.

---

## Q1 — Returning a plain value from .then()

```js-exec
Promise.resolve(1)
  .then(v => {
    console.log(v);
    return v + 10;
  })
  .then(v => console.log(v));
```

<details>
<summary>Show answer</summary>

**Output:**
```
1
11
```

**Why:** When a `.then()` callback returns a plain value, that value is automatically wrapped in a resolved Promise for the next handler. `v + 10` is `11`, so the second `.then()` receives `11`.

</details>

---

## Q2 — Returning a rejected Promise from .then()

```js-exec
Promise.resolve("start")
  .then(v => {
    console.log(v);
    return Promise.reject("oops");
  })
  .then(v => console.log("then:", v))
  .catch(e => console.log("catch:", e));
```

<details>
<summary>Show answer</summary>

**Output:**
```
start
catch: oops
```

**Why:** When `.then()` returns a rejected Promise, the chain switches to the rejected track. The next `.then()` is skipped entirely, and the nearest `.catch()` fires. Returning `Promise.reject(x)` from inside `.then()` is equivalent to throwing `x`.

</details>

---

## Q3 — .catch() recovers the chain

```js-exec
Promise.reject("error")
  .catch(e => {
    console.log("caught:", e);
    return "recovered";
  })
  .then(v => console.log("then:", v));
```

<details>
<summary>Show answer</summary>

**Output:**
```
caught: error
then: recovered
```

**Why:** `.catch()` that returns a plain value converts the chain back to the resolved track. The `.then()` after `.catch()` runs normally and receives the returned value. Think of `.catch()` as a checkpoint: handle the error, return something, and the chain continues as if nothing went wrong.

</details>

---

## Q4 — .catch() re-throwing keeps the chain rejected

```js-exec
Promise.reject("first error")
  .catch(e => {
    console.log("first catch:", e);
    throw "second error";
  })
  .catch(e => console.log("second catch:", e));
```

<details>
<summary>Show answer</summary>

**Output:**
```
first catch: first error
second catch: second error
```

**Why:** If `.catch()` throws (or returns `Promise.reject()`), the chain stays on the rejected track. The error propagates to the next `.catch()`. This is how error re-throwing works — you can inspect the error and decide to re-throw it or swallow it.

</details>

---

## Q5 — .finally() passes the value through

```js-exec
Promise.resolve(42)
  .finally(() => {
    console.log("finally");
  })
  .then(v => console.log("then:", v));
```

<details>
<summary>Show answer</summary>

**Output:**
```
finally
then: 42
```

**Why:** `.finally()` receives **no arguments** — it does not see the resolved value. Its return value is also ignored (unless it throws). The original value `42` passes through unchanged to the next `.then()`. This makes `.finally()` ideal for cleanup like hiding a spinner — you don't need the value, and you don't want to interfere with it.

</details>

---

## Q6 — .finally() throwing overrides the resolved value

```js-exec
Promise.resolve("success")
  .finally(() => {
    throw "finally error";
  })
  .then(v => console.log("then:", v))
  .catch(e => console.log("catch:", e));
```

<details>
<summary>Show answer</summary>

**Output:**
```
catch: finally error
```

**Why:** If `.finally()` throws (or returns a rejected Promise), the original resolved value is discarded and the chain switches to rejected. The `.then()` is skipped and `.catch()` fires with the error from `.finally()`. This is the one case where `.finally()` changes the outcome of the chain.

</details>

---

## Q7 — .then(onFulfilled, onRejected) does not catch its own onFulfilled's error

```js-exec
Promise.resolve()
  .then(
    () => { throw "thrown in onFulfilled"; },
    (e) => { console.log("onRejected:", e); }
  )
  .catch(e => console.log("catch:", e));
```

<details>
<summary>Show answer</summary>

**Output:**
```
catch: thrown in onFulfilled
```

**Why:** The `onRejected` in `.then(onFulfilled, onRejected)` handles rejections from the **preceding** promise — not errors thrown by `onFulfilled` in the same call. When `onFulfilled` throws, the error escapes past `onRejected` and is caught by the next `.catch()` in the chain. This is why `.then(fn).catch(err)` is usually preferred over `.then(fn, err)` — the standalone `.catch()` also covers errors from `fn`.

</details>

---

## Q8 — Two concurrent chains interleave breadth-first

```js-exec
Promise.resolve()
  .then(() => console.log(1))
  .then(() => console.log(2));

Promise.resolve()
  .then(() => console.log(3))
  .then(() => console.log(4));
```

<details>
<summary>Show answer</summary>

**Output:**
```
1
3
2
4
```

**Why:** Both chains start with already-resolved Promises, so both first `.then()` callbacks are queued as microtasks immediately. The microtask queue at the end of sync: `[cb1, cb3]`.

- `cb1` runs → logs `1` → schedules `cb2`. Queue: `[cb3, cb2]`
- `cb3` runs → logs `3` → schedules `cb4`. Queue: `[cb2, cb4]`
- `cb2` runs → logs `2`. Queue: `[cb4]`
- `cb4` runs → logs `4`.

The chains interleave **breadth-first**, not depth-first. Many developers expect `1 2 3 4` — this is one of the most commonly wrong answers in senior JS interviews.

</details>

---

## Q9 — resolve(promise) adds an extra microtask tick

```js-exec
const inner = Promise.resolve("inner");

const outer = new Promise(resolve => resolve(inner));

outer.then(v => console.log("outer:", v));
inner.then(v => console.log("inner:", v));
```

<details>
<summary>Show answer</summary>

**Output:**
```
inner: inner
outer: inner
```

**Why:** When `resolve` is called with another Promise (`inner`), the engine cannot resolve `outer` directly — it must first call `inner.then(resolveOuter, rejectOuter)` to "adopt" the inner Promise's state. That adoption is itself a microtask.

Timeline:
1. Sync ends. Microtask queue: `[adopt inner→outer, inner.then(log "inner")]`
2. Adoption runs → `outer` resolves → queues `outer.then(log "outer")`
3. Queue: `[inner.then(log "inner"), outer.then(log "outer")]`
4. `inner: inner` logs, then `outer: inner` logs.

If you had used `resolve("inner")` (a plain value) instead, `outer` would resolve in the same microtask tick as `inner`, and the order would be determined by registration order. The extra adoption step is the critical difference.

</details>

---

## Q10 — Promise.resolve(existingPromise) returns the same object

```js-exec
const p = Promise.resolve("original");
const p2 = Promise.resolve(p);

console.log(p === p2);

const p3 = new Promise(resolve => resolve(p));
console.log(p === p3);
```

<details>
<summary>Show answer</summary>

**Output:**
```
true
false
```

**Why:** `Promise.resolve(x)` has a fast path: if `x` is already a native Promise from the same realm, it returns `x` unchanged — no new object is created, no wrapping. `p === p2` is `true`.

`new Promise(resolve => resolve(p))` always creates a **new** Promise object. Even though it eventually resolves to the same value as `p`, it is a different object. `p === p3` is `false`. This also means `p3` has the extra adoption tick from Q9 — `p` would resolve first.

</details>

---

## Key Rules

| Pattern | What happens |
|---|---|
| `.then(v => plainValue)` | Next handler receives `plainValue` (wrapped in resolved Promise) |
| `.then(v => Promise.reject(e))` | Chain switches to rejected track; next `.catch()` fires |
| `.catch(e => value)` | Recovery: chain becomes resolved; next `.then()` runs |
| `.catch(e => { throw e2 })` | Re-throw: chain stays rejected; next `.catch()` fires |
| `.finally(fn)` | `fn` receives no args; original value passes through unless `fn` throws |
| `.finally(() => { throw e })` | Overrides the resolved value; chain becomes rejected with `e` |
| `.then(onFulfilled, onRejected)` | `onRejected` does **not** catch errors from `onFulfilled` in the same call |
| Two concurrent chains | Interleave **breadth-first**: 1, 3, 2, 4 — not 1, 2, 3, 4 |
| `resolve(anotherPromise)` | Adopts state via extra microtask tick — `outer` resolves one beat after `inner` |
| `Promise.resolve(existingPromise)` | Returns the **same object** — no wrapper, no extra tick |

---

## Go Deeper

- [Output Quiz #6 — Promises & async/await Ordering](/articles/js-output-promises-async) — the previous quiz: executor timing, .then() as microtask, basic error handling
- [Output Quiz #8 — Promise Combinators](/articles/js-output-promise-combinators) — the next quiz: Promise.all, race, allSettled, any
- [Output Quiz #3 — The Event Loop & Task Ordering](/articles/js-output-event-loop) — the microtask queue model that powers all of this
