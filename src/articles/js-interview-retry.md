Retry wraps an async function and re-executes it on failure, up to N times. The base version is a loop — but the interview escalates to exponential backoff, selective retry based on error type, and combining with a timeout deadline.

---

## What is `retry()`?

`retry(fn, attempts)` calls `fn()` and, if it rejects, calls it again — up to `attempts` times total. On the final attempt, if it still fails, the last error propagates.

This is the **resilience** pattern. Where `promiseTimeout` says "give up after N ms", retry says "try again up to N times." In production they're usually combined: retry with a timeout per attempt.

Real-world use cases:
- **Network requests** — transient failures (502, network blip) should be retried; client errors (404, 403) should not
- **Database connections** — retry on connection refused during startup
- **Third-party APIs** — rate-limited responses (429) warrant a retry after a delay
- **File system operations** — retry on temporary lock contention

The interview escalates: fixed delay → exponential backoff → `shouldRetry` predicate to skip retrying on certain errors → combining with `promiseTimeout` for a per-attempt deadline.

---

## The Problem

> "Implement `retry(fn, attempts)` that calls `fn()` up to `attempts` times. If all attempts fail, reject with the last error."

The interviewer extends:
> "Add a delay between retries. Then make it exponential backoff. Then add a `shouldRetry` option so we can skip retry for certain errors."

---

## Thought Process

A retry loop has three pieces:
1. **Attempt counter** — try up to N times
2. **On success** — return immediately
3. **On failure** — if we have attempts left, wait (optionally) and try again; otherwise throw

A `for` loop with `try/catch` inside is the clearest structure. Avoid `while(true)` — the bounded `for` makes the attempt count explicit.

---

## Step 1 — Base: Fixed Attempts

```js-exec
async function retry(fn, attempts) {
  let lastError;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn(); // success — return immediately
    } catch (err) {
      lastError = err;
      // If this wasn't the last attempt, loop continues
    }
  }

  throw lastError; // all attempts exhausted
}

// Test
let calls = 0;
const flaky = () => new Promise((resolve, reject) => {
  calls++;
  calls < 3 ? reject(new Error(`fail #${calls}`)) : resolve("success");
});

retry(flaky, 5).then(console.log); // "success" (on 3rd attempt)
```

---

## Step 2 — Fixed Delay Between Retries

```js-exec
async function retry(fn, attempts, delay = 0) {
  let lastError;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1 && delay > 0) {
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  throw lastError;
}

// Test — logs each attempt with a gap
let n = 0;
const unstable = async () => {
  console.log(`attempt ${++n}`);
  if (n < 3) throw new Error("not yet");
  return "ok";
};

retry(unstable, 5, 10).then(r => console.log("result:", r));
// attempt 1, attempt 2, attempt 3, result: ok
```

---

## Step 3 — Exponential Backoff

Backoff doubles the wait after each failure: 100ms, 200ms, 400ms... This avoids hammering a service that's struggling.

```js-exec
async function retry(fn, attempts, { delay = 0, factor = 2, maxDelay = Infinity } = {}) {
  let lastError;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1 && delay > 0) {
        const wait = Math.min(delay * Math.pow(factor, i), maxDelay);
        await new Promise(r => setTimeout(r, wait));
      }
    }
  }

  throw lastError;
}

// Delays: 100ms, 200ms, 400ms (capped at 300ms → 300ms, 300ms)
// retry(fn, 5, { delay: 100, factor: 2, maxDelay: 300 })
console.log("delays:", [0,1,2,3].map(i => Math.min(100 * Math.pow(2, i), 300)));
// [100, 200, 300, 300]
```

---

## Step 4 — `shouldRetry` Predicate

Not all errors should trigger a retry. A 404 should fail immediately. A 503 should retry.

```js-exec
async function retry(fn, attempts, {
  delay = 0,
  factor = 2,
  maxDelay = Infinity,
  shouldRetry = () => true  // retry everything by default
} = {}) {
  let lastError;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isLastAttempt = i === attempts - 1;

      if (isLastAttempt || !shouldRetry(err, i + 1)) {
        throw err; // give up immediately
      }

      if (delay > 0) {
        const wait = Math.min(delay * Math.pow(factor, i), maxDelay);
        await new Promise(r => setTimeout(r, wait));
      }
    }
  }

  throw lastError;
}

// Only retry on network errors, not on "NotFound"
class NetworkError extends Error {}
class NotFoundError extends Error {}

let attempt = 0;
const api = async () => {
  attempt++;
  if (attempt === 1) throw new NetworkError("connection reset");
  if (attempt === 2) throw new NotFoundError("resource gone");
  return "data";
};

retry(api, 5, {
  shouldRetry: (err) => err instanceof NetworkError
}).catch(err => console.log("stopped on:", err.constructor.name, err.message));
// stopped on: NotFoundError resource gone (after 2 attempts)
```

---

## Full Solution

```js-exec
async function retry(fn, attempts, {
  delay = 0,
  factor = 2,
  maxDelay = Infinity,
  shouldRetry = () => true
} = {}) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      const isLastAttempt = i === attempts - 1;
      if (isLastAttempt || !shouldRetry(err, i + 1)) throw err;
      if (delay > 0) {
        const wait = Math.min(delay * Math.pow(factor, i), maxDelay);
        await new Promise(r => setTimeout(r, wait));
      }
    }
  }
}

// Usage: retry with backoff, only on network errors
// retry(fetchData, 3, { delay: 200, factor: 2, shouldRetry: err => err.status >= 500 })
console.log("retry utility ready");
```

---

## What Interviewers Are Testing

- **Loop structure** — `for` with `try/catch` inside, not a recursive approach (stack overflow risk at high attempt counts)
- **Immediate throw on `shouldRetry` = false** — not just on last attempt; give up early when the error is unretryable
- **Backoff formula** — `delay * factor^i` — naming it "exponential backoff" and explaining why it helps
- **`maxDelay` cap** — preventing infinite wait times at high attempt counts
- **No delay on last attempt** — skip the wait if you're about to throw anyway

---

## Complexity

| | Time | Space |
|-|------|-------|
| Best case (1st succeeds) | O(T) of fn | O(1) |
| Worst case (all fail) | O(N × T + total delay) | O(1) |

---

## Interview Tips

- **Start with the loop, not recursion** — a `for` loop is O(1) stack space. Recursion works but mention the trade-off.
- **Throw early in `shouldRetry: false`** — don't wait for the loop to exhaust; call `throw err` immediately when the error is unretryable.
- **Mention `jitter`** — "In production I'd add random jitter to the delay to prevent thundering herd: `wait * (0.5 + Math.random() * 0.5)`." This shows real-world awareness.
- **Combine with `promiseTimeout`** — "For a per-attempt deadline: `retry(() => promiseTimeout(fetch(url), 3000), 3)`."

---

## Related Questions

- [Implement promiseTimeout()](/articles/js-interview-promise-timeout)
- [Implement mapAsync() and mapAsyncLimit()](/articles/js-interview-map-async)
- [Implement Promise.all, race, any & allSettled](/articles/js-interview-promise-combinators)
