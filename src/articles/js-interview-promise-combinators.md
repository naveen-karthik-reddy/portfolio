`Promise.all`, `race`, `allSettled`, and `any` are four combinators that each settle differently. The interviewer wants all four — and tests whether you know which short-circuits on rejection, which on fulfillment, and what shape each result takes.

---

## What are Promise Combinators?

Promise combinators are static methods on the `Promise` constructor that take an array of promises and return a single promise whose fate depends on how the input promises settle. Each combinator has a different rule for when it resolves and when it rejects.

- **`Promise.all(promises)`** — resolves when **all** resolve, with an array of results in input order. Rejects immediately if **any one** rejects (short-circuit on first rejection). Use it for parallel independent work where all results are needed.
- **`Promise.race(promises)`** — settles with the **first** promise to settle (resolve or reject). "First past the post" — winner takes all. Use it for timeouts and "fastest response wins" scenarios.
- **`Promise.allSettled(promises)`** — resolves when **all** settle (resolve or reject), with an array of `{ status, value/reason }` objects. **Never rejects.** Use it when you want results from every promise regardless of failure.
- **`Promise.any(promises)`** — resolves when **any one** resolves (short-circuit on first success). Rejects only when **all** reject, with an `AggregateError`. Use it for "first successful response from multiple sources" scenarios.

The implementation of each follows the same pattern: return a `new Promise`, iterate inputs, attach `.then`/`.catch` to each, track counts, and resolve/reject when the combinator's rule is met. The key differences are in **which settlement triggers what** and **what shape the result takes**.

The interview tests whether you understand these four distinct settlement strategies, the edge cases for empty arrays (each combinator behaves differently), and the use of `Promise.resolve()` to normalize non-promise values. Implementing all four in one session is a common async marathon question.

---

## The Problem

> "Implement `myPromiseAll(promises)`, `myPromiseRace(promises)`, `myPromiseAllSettled(promises)`, and `myPromiseAny(promises)` — all four from scratch."

---

## Thought Process

Each combinator has one rule:
- **all** — resolve when all resolve; reject as soon as ANY one rejects
- **race** — settle as soon as the first promise settles (resolve or reject)
- **allSettled** — resolve when all settle; never reject
- **any** — resolve as soon as ANY one resolves; reject only when ALL reject

The pattern for each is the same: return a `new Promise`, iterate the input, attach `.then`/`.catch` to each, track counts.

---

## Step 1 — `myPromiseAll`

```js-exec
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let settled = 0;

    if (promises.length === 0) {
      resolve(results);
      return;
    }

    promises.forEach((promise, i) => {
      Promise.resolve(promise).then(value => {
        results[i] = value;
        settled++;
        if (settled === promises.length) {
          resolve(results);
        }
      }, reject);  // first rejection → reject the whole thing
    });
  });
}

// Test
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.reject('fail');

myPromiseAll([p1, p2]).then(console.log);  // [1, 2]
myPromiseAll([p1, p3]).catch(console.log); // 'fail'
```

---

## Step 2 — `myPromiseRace`

```js-exec
function myPromiseRace(promises) {
  return new Promise((resolve, reject) => {
    for (const promise of promises) {
      Promise.resolve(promise).then(resolve, reject);
    }
  });
}

// Test
const slow = new Promise(r => setTimeout(() => r('slow'), 100));
const fast = new Promise(r => setTimeout(() => r('fast'), 10));

myPromiseRace([slow, fast]).then(console.log);  // 'fast'
```

**Key**: Race doesn't stop other promises — they keep running. The result of the first to settle is what the returned promise settles with.

---

## Step 3 — `myPromiseAllSettled`

```js-exec
function myPromiseAllSettled(promises) {
  return new Promise((resolve) => {
    const results = [];
    let settled = 0;

    if (promises.length === 0) {
      resolve(results);
      return;
    }

    promises.forEach((promise, i) => {
      Promise.resolve(promise).then(
        value => {
          results[i] = { status: 'fulfilled', value };
          settled++;
          if (settled === promises.length) resolve(results);
        },
        reason => {
          results[i] = { status: 'rejected', reason };
          settled++;
          if (settled === promises.length) resolve(results);
        }
      );
    });
  });
}

// Test
myPromiseAllSettled([p1, p3]).then(console.log);
// [{ status: 'fulfilled', value: 1 }, { status: 'rejected', reason: 'fail' }]
```

---

## Step 4 — `myPromiseAny`

```js-exec
function myPromiseAny(promises) {
  return new Promise((resolve, reject) => {
    const errors = [];
    let rejected = 0;

    if (promises.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }

    promises.forEach((promise, i) => {
      Promise.resolve(promise).then(resolve, reason => {
        errors[i] = reason;
        rejected++;
        if (rejected === promises.length) {
          reject(new AggregateError(errors, 'All promises were rejected'));
        }
      });
    });
  });
}

// Test
myPromiseAny([p1, p3]).then(console.log);  // 1 (first resolution wins)
myPromiseAny([p3, Promise.reject('err')]).catch(console.log);
// AggregateError: All promises were rejected
```

---

## Step 5 — Edge Cases

**Empty array**:
- `all([])` → resolves with `[]`
- `race([])` → stays pending forever (the real `Promise.race([])` does this)
- `allSettled([])` → resolves with `[]`
- `any([])` → rejects with `AggregateError`

**Non-promise values**: `Promise.resolve(x)` wraps non-promises, so `"hello"` is treated as `Promise.resolve("hello")`.

**Already-settled promises**: Work fine — `.then` fires synchronously for resolved promises.

---

## Comparison Table

| Combinator | Resolves when | Rejects when |
|-|-|-|
| `all` | All resolve | Any one rejects |
| `race` | First to settle (resolve) | First to settle (reject) |
| `allSettled` | All settle (never rejects) | Never |
| `any` | Any one resolves | All reject |

---

## Full Solution

```js-exec
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);
    const results = [];
    let settled = 0;
    promises.forEach((p, i) => {
      Promise.resolve(p).then(v => {
        results[i] = v;
        if (++settled === promises.length) resolve(results);
      }, reject);
    });
  });
}

function myPromiseRace(promises) {
  return new Promise((resolve, reject) => {
    for (const p of promises) Promise.resolve(p).then(resolve, reject);
  });
}

function myPromiseAllSettled(promises) {
  return new Promise((resolve) => {
    if (promises.length === 0) return resolve([]);
    const results = [];
    let settled = 0;
    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        v => { results[i] = { status: 'fulfilled', value: v }; if (++settled === promises.length) resolve(results); },
        r => { results[i] = { status: 'rejected', reason: r }; if (++settled === promises.length) resolve(results); }
      );
    });
  });
}

function myPromiseAny(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return reject(new AggregateError([], 'All promises were rejected'));
    const errors = [];
    let rejected = 0;
    promises.forEach((p, i) => {
      Promise.resolve(p).then(resolve, r => {
        errors[i] = r;
        if (++rejected === promises.length) reject(new AggregateError(errors, 'All promises were rejected'));
      });
    });
  });
}
```

---

## Step 5 — `Promise.finally`

`finally(onFinally)` runs a callback when the promise settles — regardless of outcome — and passes through the original value or reason unchanged:

```js-exec
Promise.prototype.myFinally = function (onFinally) {
  return this.then(
    // On fulfillment: run onFinally, wait for it, then pass the original value through
    (value) => Promise.resolve(onFinally()).then(() => value),
    // On rejection: run onFinally, wait for it, then re-throw the original reason
    (reason) => Promise.resolve(onFinally()).then(() => { throw reason; })
  );
};

// Test
Promise.resolve(42)
  .myFinally(() => console.log("cleanup"))  // "cleanup"
  .then(console.log);                        // 42 — original value passes through

Promise.reject(new Error("fail"))
  .myFinally(() => console.log("cleanup"))  // "cleanup"
  .catch(err => console.log(err.message));   // "fail" — original reason passes through

// If onFinally itself throws, that error wins
Promise.resolve(42)
  .myFinally(() => { throw new Error("finally threw"); })
  .catch(err => console.log(err.message));  // "finally threw"
```

The key insight: `finally` is **not** a transformation — it can't change the resolved value or rejection reason unless it throws. Wrapping `onFinally()` in `Promise.resolve()` means it works whether `onFinally` is sync or async.

---

## What Interviewers Are Testing

- **Promise construction** — creating a new Promise and resolving/rejecting from within
- **Index tracking** — using index `i` to place results in the correct position (preserves order)
- **Short-circuit logic** — `all` rejects immediately on first rejection; `any` resolves immediately on first resolution
- **Edge case: empty input** — each combinator handles empty arrays differently
- **`Promise.resolve()` wrapping** — ensuring non-promise values are treated as resolved promises
- **`finally` pass-through** — understanding that `finally` doesn't transform values, just observes settlement

---

## Complexity

| | Time | Space |
|-|------|-------|
| all | O(N) | O(N) for results |
| race | O(1) — first wins | O(1) |
| allSettled | O(N) | O(N) for results |
| any | O(N) worst case | O(N) for errors |

---

## Interview Tips

- **Implement `all` first** — it's the most commonly asked. Then `race`, then `allSettled`, then `any`.
- **Nail the empty array behavior** — interviewers specifically test this: `all([])` resolves with `[]`, `any([])` rejects with `AggregateError`, `race([])` stays pending.
- **Use `Promise.resolve(p)` on every input** — this normalizes non-promise values without you writing a separate check.
- **Preserve order in `all` with index assignment** — `results[i] = value`, not `results.push(value)`. Show you understand that promises might resolve out of order.

---

## Related Questions

- [Implement promisify()](/articles/js-interview-promisify)
- [Implement promiseTimeout()](/articles/js-interview-promise-timeout)
- [Implement mapAsync() and mapAsyncLimit()](/articles/js-interview-map-async)
