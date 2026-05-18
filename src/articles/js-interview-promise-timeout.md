`promiseTimeout(promise, ms)` rejects with a timeout error if the promise doesn't settle within the given time. It's a direct application of `Promise.race` against a timer — but the interviewer also wants to see cleanup and a higher-order version.

---

## What is `promiseTimeout()`?

`promiseTimeout(promise, ms)` races a promise against a timer. If the input promise settles within `ms` milliseconds, its result is used. If it doesn't, the returned promise rejects with a timeout error. It's a deadline enforcement pattern — "get me this result, but don't make me wait forever."

The mechanism is straightforward: create a timer promise that rejects after `ms`, then race it against the input. `Promise.race` is the natural fit — the first to settle wins. But there's a cleanup concern: if the input promise settles first, the timer keeps running (a dangling `setTimeout`). The thorough implementation clears the timer on early settlement.

Real-world use cases:
- **Fetch with timeout** — the native `fetch` API has no built-in timeout. `promiseTimeout(fetch(url), 5000)` adds one
- **API gateways** — enforce SLAs by rejecting requests that take longer than N seconds
- **User-facing loading states** — show a "taking longer than expected" message after 3 seconds, even if the request eventually succeeds
- **Health checks** — `promiseTimeout(ping(service), 2000)` ensures liveness probes fail fast

The interviewer will often ask for the higher-order version: `withTimeout(fn, ms)` that wraps any async function so every call is automatically time-limited. This tests whether you can generalize from a one-shot timeout to a reusable decorator.

---

## The Problem

> "Implement `promiseTimeout(promise, ms)` that returns a promise. If `promise` settles within `ms` milliseconds, return its result. If it doesn't, reject with a timeout error."
>
> "Bonus: make it a higher-order function `withTimeout(fn, ms)` that wraps any async function."

---

## Thought Process

You're racing two things:
1. The original promise
2. A timer that rejects after `ms`

`Promise.race` is the natural tool — first to settle wins. But you need to clean up the timer if the original promise settles first, to avoid a hanging timeout.

The pattern:
- Create a timer promise that rejects after `ms`
- Race it against the input promise
- When the race settles, clear the timer
- Optionally wrap with `Promise.race` or a custom race that handles cleanup

---

## Step 1 — Base Implementation

```js-exec
function promiseTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    )
  ]);
}

// Test
const fast = new Promise(resolve => setTimeout(() => resolve('done'), 50));
const slow = new Promise(resolve => setTimeout(() => resolve('late'), 500));

promiseTimeout(fast, 100).then(console.log);   // 'done' (resolves before timeout)
promiseTimeout(slow, 100).catch(console.error); // Error: Timed out after 100ms
```

---

## Step 2 — Cleaning Up the Timer

The interviewer asks: "What about the timer when the promise resolves? You're leaking a `setTimeout`."

```js-exec
function promiseTimeout(promise, ms) {
  let timer;

  const timerPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
  });

  return Promise.race([promise, timerPromise]).finally(() => {
    clearTimeout(timer);
  });
}

// Now the timer is cleared whether the promise resolves or rejects first
promiseTimeout(fast, 100).then(console.log);  // 'done', timer cleared
```

---

## Step 3 — Custom Error Class

```js-exec
class TimeoutError extends Error {
  constructor(ms) {
    super(`Timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

function promiseTimeout(promise, ms) {
  let timer;

  const timerPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });

  return Promise.race([promise, timerPromise]).finally(() => {
    clearTimeout(timer);
  });
}

promiseTimeout(slow, 100).catch(err => {
  console.log(err.name);   // 'TimeoutError'
  console.log(err.message); // 'Timed out after 100ms'
});
```

---

## Step 4 — Higher-Order `withTimeout`

```js-exec
function withTimeout(fn, ms) {
  return function (...args) {
    return promiseTimeout(fn.apply(this, args), ms);
  };
}

// Usage
async function fetchUser(id) {
  await new Promise(r => setTimeout(r, 200)); // simulate network
  return { id, name: 'Alice' };
}

const fetchUserWithTimeout = withTimeout(fetchUser, 100);
fetchUserWithTimeout(1).catch(console.error); // TimeoutError
```

---

## Step 5 — Edge Cases

**Already-settled promise**: `Promise.race` resolves immediately with the already-settled promise's value. The timer never fires — but we still clean up with `.finally()`.

**Timeout = 0**: `setTimeout(fn, 0)` fires on the next macrotask. If the promise is already resolved (microtask), the race resolves first. If the promise is genuinely async, the timeout wins — correct behavior.

**Promise rejects before timeout**: Still works — `Promise.race` forwards the rejection. The timer is cleaned up by `.finally()`.

---

## Full Solution

```js-exec
class TimeoutError extends Error {
  constructor(ms) {
    super(`Timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

function promiseTimeout(promise, ms) {
  let timer;

  const timerPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });

  return Promise.race([promise, timerPromise]).finally(() => {
    clearTimeout(timer);
  });
}

function withTimeout(fn, ms) {
  return function (...args) {
    return promiseTimeout(fn.apply(this, args), ms);
  };
}
```

---

## What Interviewers Are Testing

- **`Promise.race` understanding** — knowing that race settles with the first to settle
- **Timer cleanup** — using `clearTimeout` to prevent leaks
- **Higher-order function pattern** — wrapping a function with timeout behavior
- **Custom error types** — creating distinguishable error classes

---

## Complexity

| | Time | Space |
|-|------|-------|
| promiseTimeout | O(1) | O(1) |

---

## Interview Tips

- **Start with `Promise.race`** — "This is a race between the promise and a timeout." This tells the interviewer you recognize the pattern.
- **Add timer cleanup without being asked** — it shows you think about resource management.
- **Create a custom error** — `instanceof TimeoutError` lets callers distinguish timeout from other rejections.
- **Show `withTimeout` as a natural extension** — "Once you have `promiseTimeout`, wrapping any async function is trivial. Here's the HOF version."

---

## Related Questions

- [#18 — Implement Promise.all, race, any & allSettled](/articles/js-interview-promise-combinators)
- [#19 — Implement promisify()](/articles/js-interview-promisify)
- [#21 — Implement mapAsync() and mapAsyncLimit()](/articles/js-interview-map-async)
- [#7 — Implement sleep()](/articles/js-interview-sleep)
