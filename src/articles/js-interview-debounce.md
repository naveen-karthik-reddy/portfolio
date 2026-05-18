Debounce is the most commonly requested timing utility in frontend interviews. The base version is straightforward — but interviewers escalate by asking for `cancel()`, `flush()`, and leading-edge variants. Here's how to build every version they might ask for.

**Related deep-dive:** [Functions #3 — Debounce & Throttle](/articles/js-debounce-throttle)

---

## What is `debounce()`?

`debounce(fn, delay)` returns a function that delays invoking `fn` until `delay` milliseconds have passed **since the last invocation**. If the returned function is called again before the timer fires, the previous timer is reset. Only when calls stop long enough does `fn` actually execute — with the most recent arguments.

Think of an elevator door: every time someone steps in, the door re-opens and the timer resets. The elevator only leaves when no one has stepped in for N seconds.

This is the **timer-reset pattern**. Every call clears the previous timer (`clearTimeout`) and starts a fresh one (`setTimeout`). The function never executes during a burst — only at the trailing edge, once the burst ends.

Real-world use cases:
- **Search-as-you-type (typeahead)** — don't hit the server on every keystroke; wait until the user stops typing for 300ms
- **Window resize handlers** — recalculate layout only after the user finishes resizing, not 60 times per second
- **Form auto-save** — persist draft data after the user pauses editing, not on every field change
- **Button double-click prevention** — with the `leading` option, fire immediately on the first click and ignore subsequent rapid clicks

Interviewers escalate by asking for `leading` edge (fire on the first call, not the last), `cancel()` (clear a pending timer), and `flush()` (immediately invoke the pending function). These test timer management, `this` context preservation, and state cleanup — not just the basic pattern.

---

## The Problem

> "Implement `debounce(fn, delay)` — a function that delays invoking `fn` until after `delay` milliseconds have elapsed since the last invocation. Only the last call in a burst should execute."

The interviewer will then ask you to add features one at a time:
1. Trailing-edge debounce (the base)
2. Leading-edge option (invoke on the first call, not the last)
3. `cancel()` method (cancel a pending invocation)
4. `flush()` method (immediately invoke the pending function)

---

## Thought Process

Debounce is a **timer-reset pattern**. Every call clears the previous timer and starts a new one. Only when calls stop for `delay` ms does the function actually execute.

Core mechanic:
```
1. On call: clearTimeout(previousTimer)
2. Set a new timer with the delay
3. When the timer fires: execute fn with the latest arguments
```

The key insight: the returned function **does not call `fn` directly**. It schedules `fn` for later, and only the last schedule survives.

---

## Step 1 — Base: Trailing-Edge Debounce

```js-exec
function debounce(fn, delay) {
  let timer = null;

  return function (...args) {
    clearTimeout(timer);                    // Reset the countdown
    timer = setTimeout(() => {
      fn.apply(this, args);                // Execute after delay
    }, delay);
  };
}

// Test — simulate rapid calls
function log(msg) {
  console.log(msg, Date.now());
}

const debouncedLog = debounce(log, 500);

// Simulate 5 rapid calls 100ms apart
debouncedLog("call 1");
setTimeout(() => debouncedLog("call 2"), 100);
setTimeout(() => debouncedLog("call 3"), 200);
setTimeout(() => debouncedLog("call 4"), 300);
setTimeout(() => debouncedLog("call 5"), 400);
// Only "call 5" fires — at ~900ms (400 + 500)
```

---

## Step 2 — Adding the Leading Edge

The interviewer says: "Sometimes you want the function to fire immediately on the first call, then suppress subsequent calls until the delay passes. Add a `leading` option."

```js-exec
function debounce(fn, delay, options = {}) {
  const { leading = false } = options;
  let timer = null;

  return function (...args) {
    const shouldCallNow = leading && timer === null;

    clearTimeout(timer);

    if (shouldCallNow) {
      fn.apply(this, args);           // Fire immediately
    }

    timer = setTimeout(() => {
      if (!leading) {
        fn.apply(this, args);         // Trailing: fire after delay
      }
      timer = null;                    // Reset for next burst
    }, delay);
  };
}

// Test leading edge
const leadingLog = debounce(log, 500, { leading: true });

leadingLog("first");              // Fires immediately
leadingLog("second");             // Ignored (within 500ms)
setTimeout(() => leadingLog("third"), 600); // Fires immediately (timer was null)
```

Key detail: we set `timer = null` **inside** the timeout callback, not outside. This ensures a new burst can start fresh after the delay window closes.

---

## Step 3 — Adding `cancel()`

The interviewer says: "Add a `cancel` method that clears any pending invocation."

```js-exec
function debounce(fn, delay, options = {}) {
  const { leading = false } = options;
  let timer = null;

  function debounced(...args) {
    const shouldCallNow = leading && timer === null;

    clearTimeout(timer);

    if (shouldCallNow) {
      fn.apply(this, args);
    }

    timer = setTimeout(() => {
      if (!leading) {
        fn.apply(this, args);
      }
      timer = null;
    }, delay);
  }

  debounced.cancel = function () {
    clearTimeout(timer);
    timer = null;
  };

  return debounced;
}

// Test cancel
const cancelableLog = debounce(log, 500);

cancelableLog("hello");
cancelableLog.cancel();
// "hello" never fires — timer was cleared
```

---

## Step 4 — Adding `flush()`

The interviewer says: "Now add `flush()` — immediately invoke any pending call and reset the timer."

```js-exec
function debounce(fn, delay, options = {}) {
  const { leading = false } = options;
  let timer = null;
  let lastArgs = null;
  let lastThis = null;

  function invoke() {
    fn.apply(lastThis, lastArgs);
    lastArgs = null;
    lastThis = null;
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;

    const shouldCallNow = leading && timer === null;

    clearTimeout(timer);

    if (shouldCallNow) {
      invoke();
    }

    timer = setTimeout(() => {
      if (!leading) {
        invoke();
      }
      timer = null;
    }, delay);
  }

  debounced.cancel = function () {
    clearTimeout(timer);
    timer = null;
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = function () {
    if (timer !== null) {
      clearTimeout(timer);
      invoke();
      timer = null;
    }
  };

  return debounced;
}

// Test flush
const flushableLog = debounce(log, 500);

flushableLog("important message");
console.log("Before flush — nothing logged yet");
flushableLog.flush();
console.log("After flush — message was logged immediately");
// "important message" fires during flush, not after 500ms
```

---

## Step 5 — Edge Cases

**Calling debounced function after `cancel()`**: After cancel, `timer` is `null`. The next call starts a fresh timer — this is correct behavior.

**Calling `flush()` when nothing is pending**: If `timer === null`, `flush()` should be a no-op. Our check handles this.

**`delay = 0`**: `setTimeout(fn, 0)` pushes to the macrotask queue. The debounced function fires asynchronously but on the next event loop tick — not synchronously.

**Rapid calls with leading edge**: The first call fires immediately. Subsequent calls within the delay window are suppressed. When the delay window closes (`timer = null`), the next call fires immediately again. This creates a throttle-like behavior.

---

## Full Solution

```js-exec
function debounce(fn, delay, options = {}) {
  const { leading = false } = options;
  let timer = null;
  let lastArgs = null;
  let lastThis = null;

  function invoke() {
    fn.apply(lastThis, lastArgs);
    lastArgs = null;
    lastThis = null;
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    const shouldCallNow = leading && timer === null;

    clearTimeout(timer);

    if (shouldCallNow) invoke();

    timer = setTimeout(() => {
      if (!leading) invoke();
      timer = null;
    }, delay);
  }

  debounced.cancel = function () {
    clearTimeout(timer);
    timer = null;
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = function () {
    if (timer !== null) {
      clearTimeout(timer);
      invoke();
      timer = null;
    }
  };

  return debounced;
}
```

---

## What Interviewers Are Testing

- **Timer management** — `clearTimeout` + `setTimeout` pattern, and the importance of clearing before setting
- **`this` context preservation** — using `this` from the wrapper's invocation, not the timeout callback's
- **Argument forwarding** — capturing the latest arguments with `lastArgs = args`
- **Cleanup** — `cancel()` clears the timer AND resets state; `flush()` clears the timer AND calls the function
- **Leading vs trailing trade-off** — knowing when each is appropriate (typeahead = trailing, button click = leading)

---

## Complexity

| | Time | Space |
|-|------|-------|
| `debounced()` | O(1) | O(1) |
| `cancel()` | O(1) | O(1) |
| `flush()` | O(T) of fn | O(1) |

---

## Interview Tips

- **Build incrementally** — start with 5 lines for trailing-only, then add `leading`, then `cancel`, then `flush`. Don't write the full version from scratch. Interviewers want to see you iterate.
- **Mention the `lastArgs`/`lastThis` storage** — without it, `flush()` has nothing to invoke. Say "I need to store the latest `this` and arguments so `flush` knows what to call."
- **Explain leading vs trailing with real examples** — "trailing debounce is for search-as-you-type. Leading debounce is for a save button that should work on the first click but ignore double-clicks."
- **Note the `timer = null` reset location** — setting it inside the `setTimeout` callback (not outside) is intentional. It means the delay window doesn't reset until the timer fires.

---

## Related Questions

- [#9 — Implement throttle()](/articles/js-interview-throttle)
- [#4 — Implement once()](/articles/js-interview-once)
- [#10 — Implement memoize()](/articles/js-interview-memoize)
