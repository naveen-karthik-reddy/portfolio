`Promise.all`, `race`, `allSettled`, and `any` are four combinators that each settle differently. The interviewer wants all four — and tests whether you know which short-circuits on rejection, which on fulfillment, and what shape each result takes.

**Related deep-dive:** [Async #4 — Promise.all, allSettled, race, any](/articles/js-promise-combinators)

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

## What Interviewers Are Testing

- **Promise construction** — creating a new Promise and resolving/rejecting from within
- **Index tracking** — using index `i` to place results in the correct position (preserves order)
- **Short-circuit logic** — `all` rejects immediately on first rejection; `any` resolves immediately on first resolution
- **Edge case: empty input** — each combinator handles empty arrays differently
- **`Promise.resolve()` wrapping** — ensuring non-promise values are treated as resolved promises

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

- [#19 — Implement promisify()](/articles/js-interview-promisify)
- [#20 — Implement promiseTimeout()](/articles/js-interview-promise-timeout)
- [#21 — Implement mapAsync() and mapAsyncLimit()](/articles/js-interview-map-async)
