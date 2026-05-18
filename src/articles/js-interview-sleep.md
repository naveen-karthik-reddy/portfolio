`sleep(ms)` pauses async execution for a given number of milliseconds. It's the shortest article in this series — a one-liner that tests whether you understand how `Promise` resolution and `await` work together. But the follow-up questions make it interesting.

---

## What is `sleep()`?

`sleep(ms)` is a utility that returns a Promise resolving after `ms` milliseconds. It lets you pause execution inside an `async` function with `await sleep(1000)` — something JavaScript doesn't natively support (unlike Python's `time.sleep()` or Java's `Thread.sleep()`).

Under the hood, `sleep` wraps `setTimeout` in a Promise constructor. The returned Promise resolves when the timer fires, and `await` suspends the async function until that happens. This is the canonical example of "promisifying" a callback-based API — converting a timer API into a Promise-based one.

Common real-world uses:
- **Rate-limiting** — space out API calls in a loop: `for (const item of items) { await process(item); await sleep(200); }`
- **UI delays** — keep a loading spinner visible for at least 500ms to avoid flicker
- **Yielding to the event loop** — `await sleep(0)` defers execution to the next macrotask, letting the browser process pending UI updates or user input before continuing
- **Testing timeout behavior** — simulate network delays or race conditions in tests

The interview starts with the one-liner `new Promise(resolve => setTimeout(resolve, ms))` and escalates quickly: "Make it cancellable with an `AbortSignal`" and "What does `await sleep(0)` actually do?" These follow-ups test whether you understand the Promise constructor, macrotask scheduling, and cleanup patterns.

---

## The Problem

> "Implement `sleep(ms)` that returns a Promise that resolves after `ms` milliseconds. Show how to use it with `async/await`."

The interviewer may extend:
> "Now make it cancellable — add a way to abort the sleep before it finishes."

---

## Thought Process

A Promise that resolves after a delay is `setTimeout` wrapped in a Promise constructor. That's the one-liner.

The `await` keyword pauses execution of the `async` function until the Promise resolves. `await sleep(1000)` literally means "pause here for 1 second."

For cancellation, we need a way to reject the Promise early when an external signal fires. `AbortSignal` is the standard web API for this — wire it up to `reject` the Promise when the signal aborts.

---

## Step 1 — The One-Liner

```js-exec
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Usage with async/await
async function demo() {
  console.log("Start");
  await sleep(1000);
  console.log("1 second later");
}
demo();
```

That's the base answer. But the interviewer has follow-ups.

---

## Step 2 — Why `setTimeout(0)` Is Not "Immediate"

The interviewer may ask: "What does `await sleep(0)` actually do?"

```js-exec
async function showOrdering() {
  console.log("A");
  await sleep(0);
  console.log("B");
}
showOrdering();
console.log("C");
// Output: A, C, B
```

Even with a 0ms delay, `setTimeout` pushes the callback onto the **macrotask queue**. The currently executing script and all microtasks must finish before the macrotask queue is processed. So `await sleep(0)` yields to the event loop — it's a way to defer execution, not run it immediately.

This is sometimes used intentionally to break up long tasks: `await sleep(0)` lets the browser process pending UI updates before continuing.

---

## Step 3 — Cancellable Sleep

The interviewer says: "Make it cancellable. If an `AbortSignal` fires, the sleep should reject immediately."

```js-exec
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);

    if (signal) {
      // If already aborted, reject immediately
      if (signal.aborted) {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }

      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      }, { once: true });
    }
  });
}

// Test
async function test() {
  const controller = new AbortController();

  // Schedule cancellation after 500ms
  setTimeout(() => controller.abort(), 500);

  try {
    console.log("Sleeping...");
    await sleep(2000, controller.signal);
    console.log("Done sleeping");  // Never reached
  } catch (err) {
    console.log("Sleep cancelled:", err.message);  // "Aborted"
  }
}
test();
```

Key details:
- **Clean up the timer**: `clearTimeout(timer)` when aborted — don't leave it dangling
- **Use `DOMException`**: the native `AbortError` is what `fetch` throws on abort. Consistency matters
- **Check `signal.aborted` before adding the listener**: the signal might already be aborted
- **`{ once: true }`**: auto-remove the event listener after it fires once

---

## Step 4 — Extension: Sleep with a Return Value

The interviewer may ask: "Can `sleep` return a value?"

```js-exec
function sleep(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

// Usage
async function demo() {
  const result = await sleep(1000, "done");
  console.log(result);  // "done" (after 1 second)
}
demo();
```

This is useful when `sleep` is used in a Promise chain or when you want to carry a value through an async pipeline.

---

## Step 5 — Edge Cases

**Negative delay**: `setTimeout` treats negative values as 0. `sleep(-1000)` resolves immediately (well, on the next macrotask). Decide whether to clamp to 0 or pass through.

**Very large delay**: `setTimeout` is limited to ~24.8 days (2^31 - 1 ms) due to the 32-bit signed integer limit in most browsers. For practical interviews, this isn't relevant — just mention it if asked.

**Multiple `abort()` calls**: The `{ once: true }` option ensures the listener fires only once. Without it, a second abort would call `reject` again — which is a no-op on an already-settled Promise, but you still have a dangling listener.

---

## Full Solution

```js-exec
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);

    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      }, { once: true });
    }
  });
}
```

---

## What Interviewers Are Testing

- **Promise mechanics** — you know how to create and resolve a Promise using the constructor
- **`setTimeout` + Promise integration** — wrapping a callback-based API into a Promise
- **Event loop awareness** — understanding why `await sleep(0)` doesn't execute immediately
- **Cleanup** — clearing the timer on cancellation to avoid memory leaks
- **`AbortSignal` integration** — wiring external cancellation signals into your Promise

---

## Complexity

| | Time | Space |
|-|------|-------|
| `sleep(ms)` | O(1) to create | O(1) |

---

## Interview Tips

- **Write the one-liner first, then talk about it** — `new Promise(resolve => setTimeout(resolve, ms))`. Write it in 5 seconds, then discuss the event loop implications.
- **Explain `await sleep(0)` unprompted** — "Even with 0ms, this yields to the event loop because `setTimeout` is a macrotask." This shows you understand the execution model, not just the API.
- **Clean up the timer on abort** — `clearTimeout(timer)` is the detail that separates a correct answer from a thorough one. Mention it explicitly.
- **Use the right error type** — `new DOMException("Aborted", "AbortError")` matches what the platform throws. Consistency with native APIs shows attention to detail.

---

## Related Questions

- [#18 — Implement Promise Combinators](/articles/js-interview-promise-combinators)
- [#20 — Implement promiseTimeout()](/articles/js-interview-promise-timeout)
- [#19 — Implement promisify()](/articles/js-interview-promisify)
