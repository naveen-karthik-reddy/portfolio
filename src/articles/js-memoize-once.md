`memoize` caches expensive function results so repeated calls with the same input are instant. `once` ensures a function executes at most one time. Both are built on closures and are staples of JavaScript utility libraries.

**Prerequisites:** [JS Foundations #3 — Closures](/articles/javascript-series/js-closures-lexical-scope)

---

## 1. Basic `memoize()` — Cache by First Argument

The simplest memoize stores results keyed by the first argument:

```js-exec
function memoize(fn) {
  const cache = new Map();

  return function (arg) {
    if (cache.has(arg)) {
      console.log(`Cache hit: ${arg}`);
      return cache.get(arg);
    }
    console.log(`Cache miss: ${arg} — computing`);
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

// An expensive computation
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

const memoFactorial = memoize(factorial);

console.log(memoFactorial(5)); // Cache miss — computes
console.log(memoFactorial(5)); // Cache hit — instant
console.log(memoFactorial(6)); // Cache miss — only one new computation
```

---

## 2. `memoize()` with Custom Resolver — Multi-Argument Cache Key

For multi-argument functions, provide a **resolver** that generates the cache key:

```js-exec
function memoize(fn, resolver) {
  const cache = new Map();

  return function (...args) {
    const key = resolver ? resolver(...args) : args[0];

    if (cache.has(key)) {
      console.log(`Cache hit: ${key}`);
      return cache.get(key);
    }

    console.log(`Cache miss: ${key} — computing`);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

function add(a, b) {
  // Simulate expensive work
  return a + b;
}

// Default: keyed by first argument
const memoAddDefault = memoize(add);
console.log(memoAddDefault(1, 2)); // Miss — key=1
console.log(memoAddDefault(1, 3)); // Hit — key=1! (wrong result!)
// 1 + 3 returns the cached result of 1 + 2 — bad!

// Fixed: custom resolver using both arguments
const memoAdd = memoize(add, (a, b) => `${a},${b}`);
console.log(memoAdd(1, 2)); // Miss — key="1,2"
console.log(memoAdd(1, 3)); // Miss — key="1,3" (different key)
console.log(memoAdd(1, 2)); // Hit — key="1,2"
```

---

## 3. Recursive Functions and Memoization

Memoizing a recursive function requires the memoized wrapper to be used for recursive calls too:

```js-exec
// ❌ This doesn't work — recursion calls the original, not the memoized version
function slowFib(n) {
  if (n <= 1) return n;
  return slowFib(n - 1) + slowFib(n - 2); // Calls the unwrapped function!
}

// ✅ Fix: memoize before making recursive calls
const fastFib = memoize(function fib(n) {
  if (n <= 1) return n;
  return fastFib(n - 1) + fastFib(n - 2); // Uses the memoized wrapper
});

// Compare: slow (exponential) vs fast (linear after memoization)
console.time("fastFib(35)");
console.log(fastFib(35));
console.timeEnd("fastFib(35)");
// Runs in ~1ms vs seconds without memoization
```

---

## 4. `once()` — Run at Most Once

`once` wraps a function so it executes only the first time called. All subsequent calls return the first call's result:

```js-exec
function once(fn) {
  let called = false;
  let result;

  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

// Example: initialization
const init = once(() => {
  console.log("Expensive setup done!");
  return { db: "connected", cache: "warm" };
});

console.log(init()); // "Expensive setup done!" → { db, cache }
console.log(init()); // (silent) → same { db, cache }
console.log(init()); // (silent) → same { db, cache }
```

A variation that allows different return values based on context:

```js-exec
function oncePerContext(fn) {
  const called = new WeakMap();

  return function (...args) {
    if (called.has(this)) {
      return called.get(this);
    }
    const result = fn.apply(this, args);
    called.set(this, result);
    return result;
  };
}

const obj1 = {}, obj2 = {};

const getState = oncePerContext(function () {
  console.log("Computing state for", this);
  return { timestamp: Date.now() };
});

console.log(getState.call(obj1)); // Computes
console.log(getState.call(obj1)); // Cached (same this)
console.log(getState.call(obj2)); // Computes (different this)
```

---

## 5. `memoize` with Cache Eviction (TTL)

Production memoization often needs expiration:

```js-exec
function memoizeWithTTL(fn, { ttl = 60000, maxSize = 100 } = {}) {
  const cache = new Map();

  return function (...args) {
    const key = JSON.stringify(args);

    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < ttl) {
      console.log(`Hit: ${key} (${ttl - (Date.now() - entry.timestamp)}ms remaining)`);
      return entry.value;
    }

    // Evict oldest if at capacity
    if (cache.size >= maxSize) {
      const oldest = cache.keys().next().value;
      cache.delete(oldest);
    }

    console.log(`Miss: ${key} — computing`);
    const value = fn.apply(this, args);
    cache.set(key, { value, timestamp: Date.now() });
    return value;
  };
}

// 2-second TTL for demonstration
const memoFetch = memoizeWithTTL(
  (url) => `Data from ${url}`,
  { ttl: 2000, maxSize: 5 }
);

console.log(memoFetch("/api/users"));  // Miss
console.log(memoFetch("/api/users"));  // Hit
// After 2 seconds, the cache entry expires
setTimeout(() => console.log(memoFetch("/api/users")), 2100); // Miss again
```

---

## 6. Real-World Examples

```js-exec
// 1. Memoized DOM selector
function $(selector) {
  console.log(`Querying DOM: ${selector}`);
  return document.querySelector(selector);
}
const memoQuery = memoize($);

// 2. Memoized expensive calculation (Lodash-style)
const heavyComputation = memoize((n) => {
  let sum = 0;
  for (let i = 0; i < n * 1e6; i++) sum += i;
  return sum;
});
console.log(heavyComputation(10)); // Slow
console.log(heavyComputation(10)); // Instant

// 3. once for event listeners
const setupListeners = once(() => {
  console.log("Setting up global event listeners");
  // window.addEventListener("scroll", handler);
  // window.addEventListener("resize", handler);
});
setupListeners();
setupListeners(); // No-op
```

---

## Key Takeaways

- **`memoize(fn)`** wraps a function with a cache — repeated calls with the same key return the cached value.
- Use a **resolver** function to generate cache keys for multi-argument functions.
- For **recursive functions**, call the memoized wrapper from within, not the original.
- **`once(fn)`** returns a function that runs at most once — all subsequent calls return the first result.
- **TTL** and **max size** make memoization production-ready — prevent unbounded memory growth.

---

**Next:** [Recursion Patterns](/articles/javascript-series/js-recursion-patterns) — deep flatten, Fibonacci, permutations, combinations, and tail-call optimization.
