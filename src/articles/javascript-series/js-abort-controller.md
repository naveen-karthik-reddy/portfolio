`AbortController` is the standard way to cancel ongoing async operations in JavaScript — fetch requests, event listeners, streams, and custom async work. It replaces patterns like manual cancellation tokens and timeout hacks.

**Prerequisites:** [Async #3 — Promises](/articles/javascript-series/js-promise-from-scratch), [Async #4 — Promise Combinators](/articles/javascript-series/js-promise-combinators)

---

## 1. The Basic Pattern — Controller + Signal

`AbortController` creates a `signal` (an `AbortSignal`). You pass it to cancelable APIs and call `controller.abort()` when you want to cancel:

```js-exec
// Create a controller
const controller = new AbortController();
const signal = controller.signal;

// The signal has an 'aborted' property and an 'abort' event
console.log("Initially aborted:", signal.aborted); // false

signal.addEventListener("abort", () => {
  console.log("Operation was aborted!");
});

// Cancel after 100ms (simulating user navigation or timeout)
setTimeout(() => {
  controller.abort();
  console.log("Called abort(), signal.aborted:", signal.aborted); // true
}, 100);
```

---

## 2. Canceling `fetch` Requests

The most common use case — abort an in-flight network request:

```js-exec
async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      console.log("Fetch was aborted (timeout or user action)");
    }
    throw err;
  }
}

// Simulate by creating a URL that won't respond quickly
// fetchWithTimeout("https://httpstat.us/200?sleep=10000", 2000)
//   .catch(() => console.log("Request timed out as expected"));
console.log("In a real app, this would abort the fetch after 2 seconds");
```

---

## 3. Wiring `AbortSignal` Into Custom Async Functions

Make your own async functions cancellable by checking `signal.aborted` and listening for the `abort` event:

```js-exec
function cancellableDelay(ms, signal) {
  return new Promise((resolve, reject) => {
    // If already aborted, reject immediately
    if (signal?.aborted) {
      return reject(new DOMException("Already aborted", "AbortError"));
    }

    const timeoutId = setTimeout(resolve, ms);

    const onAbort = () => {
      clearTimeout(timeoutId);
      reject(new DOMException("Aborted", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

// Test — cancel the delay after 100ms
const controller = new AbortController();

cancellableDelay(5000, controller.signal)
  .then(() => console.log("Delay completed"))
  .catch((err) => console.log("Delay cancelled:", err.message));

setTimeout(() => controller.abort(), 100);
```

---

## 4. Removing Event Listeners with `AbortSignal`

Pass a signal to `addEventListener` and the listener is automatically removed when abort is called:

```js-exec
const controller = new AbortController();
const { signal } = controller;

// Old way — need to keep references to remove later
// element.addEventListener("click", handler);
// element.removeEventListener("click", handler);

// New way — abort removes the listener
function handler(e) {
  console.log("Clicked!");
}

// In real DOM code:
// element.addEventListener("click", handler, { signal });

// Simulating cleanup:
signal.addEventListener("abort", () => {
  console.log("Signal aborted — listener would be removed");
});

console.log("(In a real browser, clicking would trigger the handler)");
controller.abort(); // Removes the listener!
```

---

## 5. Aborting Multiple Operations

One controller can cancel many things simultaneously:

```js-exec
function createCancelableOperation(name, duration, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException(`${name}: Already aborted`, "AbortError"));
    }

    console.log(`${name}: Started (${duration}ms)`);
    const id = setTimeout(() => {
      console.log(`${name}: Completed`);
      resolve(`${name} result`);
    }, duration);

    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      console.log(`${name}: Cancelled`);
      reject(new DOMException(`${name}: Aborted`, "AbortError"));
    }, { once: true });
  });
}

// Cancel ALL operations at once
const controller = new AbortController();

const op1 = createCancelableOperation("Upload", 5000, controller.signal);
const op2 = createCancelableOperation("Process", 3000, controller.signal);
const op3 = createCancelableOperation("Notify", 2000, controller.signal);

// User navigates away or clicks cancel — abort everything
setTimeout(() => {
  console.log("\n--- User cancelled! ---");
  controller.abort();
}, 500);

Promise.allSettled([op1, op2, op3]).then((results) => {
  console.log("\nFinal state:");
  results.forEach((r, i) => {
    console.log(`  op${i + 1}: ${r.status} — ${r.value ?? r.reason.message}`);
  });
});
```

---

## 6. `AbortSignal.timeout()` — Static Convenience

Modern browsers support `AbortSignal.timeout(ms)` for simple timeout cases:

```js-exec
// Instead of manually creating a controller + setTimeout:
if (AbortSignal.timeout) {
  const signal = AbortSignal.timeout(3000);
  console.log("Signal auto-aborts after 3s:", signal.aborted); // false

  signal.addEventListener("abort", () => {
    console.log("Timeout signal fired! Reason:", signal.reason?.message);
  });

  // Use with fetch:
  // fetch(url, { signal: AbortSignal.timeout(5000) });
} else {
  console.log("AbortSignal.timeout not available in this environment");
}
```

---

## 7. Composing Signals — `AbortSignal.any()`

Combine multiple signals — abort if ANY of them fires:

```js-exec
// Scenario: cancel if user clicks cancel OR a timeout expires
function createCombinedSignal(userSignal, timeoutMs) {
  if (AbortSignal.any && AbortSignal.timeout) {
    return AbortSignal.any([userSignal, AbortSignal.timeout(timeoutMs)]);
  }

  // Manual fallback
  const controller = new AbortController();

  const abort = () => controller.abort();
  userSignal.addEventListener("abort", abort, { once: true });

  const timeoutId = setTimeout(() => controller.abort(new DOMException("Timeout", "TimeoutError")), timeoutMs);

  // Clean up timeout if user aborts first
  userSignal.addEventListener("abort", () => clearTimeout(timeoutId), { once: true });

  return controller.signal;
}

const userController = new AbortController();
const combined = createCombinedSignal(userController.signal, 5000);

combined.addEventListener("abort", () => {
  console.log("Combined signal aborted! Reason:", combined.reason?.message);
});

// This could be user clicking "Cancel":
// userController.abort("User clicked cancel");
console.log("Combined signal ready — aborts on user action OR timeout");
```

---

## Key Takeaways

- `AbortController` + `AbortSignal` is the **standard cancellation pattern** for the web.
- Pass `signal` to `fetch()`, `addEventListener()`, and custom async functions.
- One controller can **cancel multiple operations** simultaneously.
- `AbortSignal.timeout(ms)` creates a self-aborting signal — no manual timer needed.
- `AbortSignal.any([s1, s2])` aborts when ANY input signal aborts.
- Always handle `AbortError` specially — it's an expected cancellation, not a real error.

---

**Next:** [Data #3 — `Map`, `Set`, `WeakMap`, `WeakSet` Polyfills](/articles/javascript-series/js-map-set-weakmap-weakset) — implement these ES6 data structures and understand their use cases.
