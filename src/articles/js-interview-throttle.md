Throttle guarantees a function runs at most once per interval, no matter how many times it's called. It's the other half of the debounce/throttle pair — and the trailing-edge variant reveals whether you truly understand the timing model.

**Related deep-dive:** [Functions #3 — Debounce & Throttle](/articles/js-debounce-throttle)

---

## The Problem

> "Implement `throttle(fn, interval)` — a function that ensures `fn` is called at most once every `interval` milliseconds. If calls arrive during the cooldown, they should be ignored."

Then the interviewer extends:
> "Add a trailing edge — the last call during a cooldown period should fire after the interval ends."

---

## Thought Process

The key difference from debounce: **debounce resets the timer on every call; throttle ignores calls during cooldown.**

Think of it as a gate:
1. Gate is open → call goes through, gate closes for `interval` ms
2. Gate is closed → calls are ignored
3. After `interval` ms → gate opens

The trailing-edge variant adds: "if a call was ignored while the gate was closed, fire it when the gate opens." This is the throttle equivalent of debounce's trailing edge.

---

## Step 1 — Base: Leading-Edge Throttle

```js-exec
function throttle(fn, interval) {
  let lastCallTime = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastCallTime >= interval) {
      lastCallTime = now;
      fn.apply(this, args);
    }
  };
}

// Test — simulate rapid calls
function log(msg) {
  console.log(msg, Date.now());
}

const throttledLog = throttle(log, 500);

// Fire 5 calls, 100ms apart
throttledLog("call 1");  // fires (first call always fires)
setTimeout(() => throttledLog("call 2"), 100);  // ignored
setTimeout(() => throttledLog("call 3"), 200);  // ignored
setTimeout(() => throttledLog("call 4"), 300);  // ignored
setTimeout(() => throttledLog("call 5"), 600);  // fires (500ms passed)
```

This uses a timestamp-based approach: record when the last execution happened, and only execute if enough time has passed. It's simpler than managing timers and covers the base case.

---

## Step 2 — Debounce vs Throttle: The Key Distinction

Before building the trailing edge, articulate the difference. Interviewers ask this directly.

| | Debounce | Throttle |
|-|----------|----------|
| **Behavior** | Groups calls, executes only the last | Guarantees execution at regular intervals |
| **Analogy** | Elevator door — keeps resetting | Turnstile — spins at a fixed rate |
| **Use case** | Search-as-you-type | Scroll handler, resize handler |
| **Timer** | Resets on every call | Blocks calls during cooldown |

---

## Step 3 — Adding Trailing Edge

The tricky part: if calls arrive during the cooldown, we need to remember the latest one and schedule it for execution after the cooldown ends.

```js-exec
function throttle(fn, interval, options = {}) {
  const { trailing = false } = options;
  let lastCallTime = 0;
  let timer = null;
  let lastArgs = null;
  let lastThis = null;

  return function (...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall >= interval) {
      // Enough time has passed — execute immediately
      lastCallTime = now;
      fn.apply(this, args);
    } else if (trailing) {
      // Store the latest args for the trailing call
      lastArgs = args;
      lastThis = this;

      // If no trailing call is scheduled yet, schedule one
      if (timer === null) {
        const remaining = interval - timeSinceLastCall;
        timer = setTimeout(() => {
          lastCallTime = Date.now();
          timer = null;
          fn.apply(lastThis, lastArgs);
        }, remaining);
      }
    }
  };
}

// Test trailing throttle
const trailingThrottle = throttle(log, 500, { trailing: true });

trailingThrottle("call 1");   // fires immediately
setTimeout(() => trailingThrottle("call 2"), 100);  // trailing at ~500ms
setTimeout(() => trailingThrottle("call 3"), 200);  // overwrites call 2
setTimeout(() => trailingThrottle("call 4"), 300);  // overwrites call 3
// "call 1" fires at 0ms, "call 4" fires at ~500ms
```

Key insight: `remaining = interval - timeSinceLastCall`. We don't wait a full interval — we wait only the remaining time since the last execution.

---

## Step 4 — Combining Leading + Trailing

With both `leading: true` and `trailing: true`, the first call fires immediately and the last call fires after the cooldown. This is the most common real-world configuration — it guarantees both immediate feedback and eventual consistency.

```js-exec
function throttle(fn, interval, options = {}) {
  const { leading = true, trailing = false } = options;
  let lastCallTime = 0;
  let timer = null;
  let lastArgs = null;
  let lastThis = null;

  return function (...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall >= interval) {
      if (leading) {
        lastCallTime = now;
        fn.apply(this, args);
      } else {
        // Non-leading: just reset the clock, trailing will handle it
        lastCallTime = now;
      }
    }

    if (trailing) {
      lastArgs = args;
      lastThis = this;

      if (timer === null) {
        const remaining = interval - (Date.now() - lastCallTime);
        timer = setTimeout(() => {
          lastCallTime = leading ? Date.now() : 0;
          timer = null;
          fn.apply(lastThis, lastArgs);
        }, Math.max(remaining, 0));
      }
    }
  };
}
```

---

## Step 5 — Alternate Approach: Timer-Based Throttle

The timestamp approach works but has one subtlety: the first call after a long idle period always fires immediately, even if `leading: false`. An alternative uses timers exclusively — simpler logic, different edge case:

```js-exec
function throttle(fn, interval) {
  let isThrottled = false;

  return function (...args) {
    if (!isThrottled) {
      isThrottled = true;
      fn.apply(this, args);
      setTimeout(() => {
        isThrottled = false;
      }, interval);
    }
  };
}
```

Mention both approaches — the timestamp version is more common in libraries (it handles clock skew), but the boolean-flag version is cleaner for explaining the concept.

---

## Step 6 — Edge Cases

**Calling exactly on the interval boundary**: If `Date.now() - lastCallTime === interval`, the timestamp approach treats it as "enough time passed" (`>=`). This is correct.

**`this` context in timer callbacks**: The timer callback is an arrow function (`() => {}`), so `this` inherits from the wrapper. No `.bind(this)` gymnastics needed.

**Very rapid bursts**: Trailing throttle only stores the **latest** args — intermediate calls are silently dropped. This matches the real Lodash behavior.

**Timer throttle with trailing**: When using the timer approach, trailing execution requires storing the latest args and scheduling a follow-up timer after the cooldown expires.

---

## Full Solution

```js-exec
function throttle(fn, interval, options = {}) {
  const { leading = true, trailing = false } = options;
  let lastCallTime = 0;
  let timer = null;
  let lastArgs = null;
  let lastThis = null;

  return function (...args) {
    const now = Date.now();
    const elapsed = now - lastCallTime;

    if (elapsed >= interval) {
      if (leading) {
        lastCallTime = now;
        fn.apply(this, args);
      } else if (timer === null) {
        lastCallTime = now; // Start the window without calling
      }
    }

    if (trailing) {
      lastArgs = args;
      lastThis = this;

      if (timer === null) {
        const remaining = interval - (Date.now() - lastCallTime);
        timer = setTimeout(() => {
          lastCallTime = leading ? Date.now() : 0;
          timer = null;
          fn.apply(lastThis, lastArgs);
        }, Math.max(0, remaining));
      }
    }
  };
}
```

---

## What Interviewers Are Testing

- **Timing model** — understanding the difference between "reset on every call" (debounce) and "block during cooldown" (throttle)
- **Timestamp vs timer approaches** — knowing both and their trade-offs
- **Trailing edge mechanics** — storing the latest args and scheduling a follow-up timer with the *remaining* time, not the full interval
- **`this` and argument forwarding** — correctly capturing context for deferred execution

---

## Complexity

| | Time | Space |
|-|------|-------|
| Each invocation | O(1) | O(1) |
| Trailing timer fires | O(T) of fn | O(1) |

---

## Interview Tips

- **Draw the timeline** — before writing code, sketch a timeline on the whiteboard. Mark calls as arrows, executions as dots. This clarifies leading vs trailing and catches off-by-one interval bugs.
- **State the debounce vs throttle distinction succinctly** — "debounce groups calls into one; throttle guarantees a maximum rate." Having a crisp one-line definition shows you've internalized it.
- **Implement the timestamp version first** — it's fewer lines and handles the common case. Then say "a timer-based approach is also possible," and if the interviewer is interested, sketch the boolean-flag version.
- **Ask about `leading` and `trailing` defaults** — "Should the first call fire immediately, or wait for the interval?" Clarifying the API contract before coding shows you're thinking about real-world usage.

---

## Related Questions

- [#8 — Implement debounce()](/articles/js-interview-debounce)
- [#10 — Implement memoize()](/articles/js-interview-memoize)
- [#4 — Implement once()](/articles/js-interview-once)
