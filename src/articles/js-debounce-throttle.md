Scroll events fire at ~60Hz (every 16ms). Resize events can fire hundreds of times per second. Run expensive work on every event and you tank frame rate.

**Think of it with a real-world analogy:**
- **Debounce** is like an elevator door — each time someone steps in, the door resets its close timer. The door only closes after nobody has entered for N seconds.
- **Throttle** is like a revolving door — it lets one person through at fixed intervals, no matter how many people are lined up.

This article implements both from scratch, including leading/trailing edge variants.

**Prerequisites:** [JS Foundations #3 — Closures](/articles/javascript-series/js-closures-lexical-scope)

---

## 1. Debounce — Wait for the Pause

A debounced function delays execution until **N milliseconds have passed since the last call**. Every new call resets the timer.

```js-exec
function debounce(fn, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Simulate rapid calls
function search(query) {
  console.log("Searching for:", query);
}

const debouncedSearch = debounce(search, 300);

debouncedSearch("r");
debouncedSearch("re");
debouncedSearch("rea");
debouncedSearch("reac");
debouncedSearch("react");
// Only "Searching for: react" prints — 300ms after the last keystroke
```

This is exactly what search-as-you-type needs — wait until the user stops typing.

---

## 2. Debounce — Trailing vs Leading Edge

By default, debounce fires on the **trailing** edge (after the burst). A **leading** variant fires on the first call immediately, then ignores subsequent calls for the cooldown period:

```js-exec
function debounce(fn, delay, { leading = false } = {}) {
  let timeoutId;

  return function (...args) {
    const shouldCallImmediately = leading && !timeoutId;

    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      if (!leading) {
        fn.apply(this, args);
      }
      timeoutId = null;
    }, delay);

    if (shouldCallImmediately) {
      fn.apply(this, args);
    }
  };
}

// Trailing (default) — fires after the last call
const trailingSave = debounce(
  (val) => console.log("Trailing save:", val),
  500
);

// Leading — fires on the first call immediately
const leadingSave = debounce(
  (val) => console.log("Leading save:", val),
  500,
  { leading: true }
);

// Simulate rapid clicks
trailingSave("data1"); // (nothing yet)
trailingSave("data1"); // resets timer
setTimeout(() => trailingSave("data2"), 600);
// Prints "Trailing save: data2" at ~1100ms

leadingSave("action1"); // Prints immediately!
leadingSave("action1"); // ignored (cooldown)
// Prints "Leading save: action1"
```

---

## 3. Throttle — Enforce a Rate Limit

Throttle ensures a function runs **at most once every N milliseconds**, no matter how many times it's called:

```js-exec
function throttle(fn, limit) {
  let inCooldown = false;

  return function (...args) {
    if (!inCooldown) {
      fn.apply(this, args);
      inCooldown = true;
      setTimeout(() => {
        inCooldown = false;
      }, limit);
    }
  };
}

// Simulate rapid scroll events
function handleScroll() {
  console.log("Scroll handler fired at:", Date.now() % 10000);
}

const throttledScroll = throttle(handleScroll, 1000);

// Fire 5 times rapidly — only the first and last (if trailing) will execute
throttledScroll(); // fires
throttledScroll(); // skipped
throttledScroll(); // skipped
```

---

## 4. Throttle with Trailing Edge

The basic throttle drops calls during cooldown. With trailing edge, the **last call during cooldown** is saved and executed after the cooldown ends:

```js-exec
function throttle(fn, limit, { trailing = true } = {}) {
  let inCooldown = false;
  let trailingArgs = null;
  let trailingThis = null;

  function execute() {
    if (trailing && trailingArgs) {
      fn.apply(trailingThis, trailingArgs);
      trailingArgs = null;
    }
  }

  return function (...args) {
    if (!inCooldown) {
      fn.apply(this, args);
      inCooldown = true;
      setTimeout(() => {
        inCooldown = false;
        execute();
      }, limit);
    } else if (trailing) {
      trailingArgs = args;
      trailingThis = this;
    }
  };
}

const log = throttle(
  (msg) => console.log("Fired:", msg),
  1000,
  { trailing: true }
);

log("first");  // fires immediately
log("second"); // saved for trailing
log("third");  // overwrites "second" — only the latest is saved
// After ~1000ms, prints "Fired: third"
```

---

## 5. Debounce vs Throttle — When to Use Which

```js-exec
function visualizeBehavior() {
  // Debounce: one final call after quiet period
  const debounced = debounce(
    () => console.log("  Debounced: FIRED (after last call)"),
    500
  );

  // Throttle: regularly spaced calls
  const throttled = throttle(
    () => console.log("  Throttled: FIRED (at rate limit)"),
    500
  );

  console.log("Simulating 10 rapid calls every 100ms:");
  let count = 0;
  const interval = setInterval(() => {
    count++;
    console.log(`Call #${count}`);
    debounced();
    throttled();
    if (count === 10) clearInterval(interval);
  }, 100);
}

setTimeout(visualizeBehavior, 100);
```

| Use Case | Pattern |
|---|---|
| Search-as-you-type | Debounce (trailing) |
| Form submit button (prevent double-submit) | Debounce (leading) |
| Scroll position tracker | Throttle |
| Resize handler | Debounce or throttle |
| Game input (shoot button) | Throttle |
| Analytics tracking | Throttle with trailing |

---

## 6. A Combined "Smart" Utility

Sometimes you want debounce for bursty input but throttle for continuous streams. Here's a combined approach:

```js-exec
function smartRateLimit(fn, { debounceDelay = 300, throttleDelay = 1000 } = {}) {
  let lastRun = 0;
  let timeoutId;

  return function (...args) {
    const now = Date.now();

    // Throttle: run immediately if enough time has passed
    if (now - lastRun >= throttleDelay) {
      fn.apply(this, args);
      lastRun = now;
      clearTimeout(timeoutId);
      return;
    }

    // Debounce: otherwise, wait for a pause
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      lastRun = Date.now();
    }, debounceDelay);
  };
}

const handler = smartRateLimit(
  (x) => console.log("Handling:", x),
  { debounceDelay: 200, throttleDelay: 800 }
);

// Rapid calls during scroll
handler(1);
handler(2);
handler(3); // Either fires immediately (if cooldown passed) or debounces
```

---

## Key Takeaways

- **Debounce**: delay execution until the burst stops. Use for input that should resolve once (search, form validation).
- **Throttle**: enforce a maximum rate. Use for continuous events where you need regular updates (scroll position, resize).
- **Leading edge**: fire on the first call, ignore subsequent calls during cooldown. Use for button clicks.
- **Trailing edge**: fire the last call after cooldown. Use for search suggestions, save drafts.
- Both use closures to hold timer references and cooldown state — the core pattern behind `useDebounce` and `useThrottle` hooks.

---

**Next:** [Arrays #1 — `map`, `filter`, `reduce` Polyfills](/articles/javascript-series/js-array-methods-polyfills-1) — build the three most-used array methods from scratch.
