Memoize caches a function's return values keyed by its arguments. The base version is straightforward — wrap the function, check a cache before calling. But the interview gets interesting when you add a custom key resolver for multi-arg and object-argument functions.

---

## What is `memoize()`?

`memoize(fn)` returns a wrapped version of `fn` that **caches return values by input arguments**. The first call with a given argument set runs `fn` and stores the result; every subsequent call with the same arguments returns the cached value instantly, skipping `fn` entirely.

This is the canonical **time-for-space trade-off**: you burn memory to avoid re-computation. It's only worth doing when `fn` is expensive (heavy computation, network calls) and called repeatedly with the same inputs.

The core mechanic is a closure with a cache (usually a `Map` or plain object). On each call, serialize the arguments into a cache key, check if the result exists, and return it if so. Otherwise, call `fn`, store the result, and return it.

Real-world use cases:
- **Expensive calculations** — Fibonacci, factorial, or any recursive math with overlapping subproblems
- **Derived data** — computing `fullName` from `firstName` + `lastName` in a component that re-renders often
- **Selector functions** in state management (Redux's `createSelector` is memoization)
- **Parsing** — memoize `JSON.parse()` or template compilation by input string

The interview escalates with a **custom key resolver**: when `fn` takes multiple arguments or object arguments, the default cache key (`arguments[0]`) isn't enough. You need a `resolver` function that maps `(...args)` to a unique cache key. This tests whether you understand cache key design and can generalize from a single-argument cache to arbitrary signatures.

---

## The Problem

> "Implement `memoize(fn)` that returns a memoized version of `fn`. The memoized function should cache results by argument and return the cached value on subsequent calls with the same argument."

The interviewer extends:
> "Now add a `resolver` parameter — a custom function that generates the cache key from the arguments. This handles multi-argument functions and object arguments."

---

## Thought Process

A memoized function is a closure around a cache (typically a `Map`). On each call:
1. Compute the cache key from the arguments
2. If the key is in the cache, return the cached value
3. Otherwise, call the original function, store the result, return it

`Map` is the right data structure here: O(1) lookup, and keys can be anything — not just strings.

For multi-argument functions, the default key strategy is `JSON.stringify(args)`. But a custom `resolver` function gives the caller control.

---

## Step 1 — Base: Single-Argument Memoize

```js-exec
function memoize(fn) {
  const cache = new Map();

  return function (arg) {
    if (cache.has(arg)) {
      return cache.get(arg);
    }
    const result = fn.call(this, arg);
    cache.set(arg, result);
    return result;
  };
}

// Test
let callCount = 0;
const expensive = (n) => {
  callCount++;
  return n * 2;
};

const memoized = memoize(expensive);
console.log(memoized(5));  // 10 — fn called
console.log(memoized(5));  // 10 — from cache
console.log(memoized(5));  // 10 — from cache
console.log(callCount);    // 1
```

---

## Step 2 — Why the Default Key Breaks for Multiple Arguments

```js-exec
// The single-arg version silently ignores extra arguments
const add = (a, b) => a + b;
const memoAdd = memoize(add);

console.log(memoAdd(2, 3));  // 5 — computed
console.log(memoAdd(2, 4));  // 5 — WRONG! Should be 6, but arg "2" hits the cache
```

`Map` only uses the first argument as the key. For multi-arg functions, we need a key that captures **all** arguments.

---

## Step 3 — Adding a Custom Resolver

```js-exec
function memoize(fn, resolver) {
  const cache = new Map();

  return function (...args) {
    // Use the resolver if provided, otherwise use the first argument
    const key = resolver ? resolver(...args) : args[0];

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Test with multi-arg function
const add = (a, b) => {
  console.log("computing...");
  return a + b;
};

// Default resolver: JSON.stringify
const memoAdd = memoize(add, (...args) => JSON.stringify(args));
console.log(memoAdd(2, 3));  // computing... 5
console.log(memoAdd(2, 3));  // 5 (cached)
console.log(memoAdd(2, 4));  // computing... 6 (different key)

// Custom resolver for object arguments
const getUserName = (user) => {
  console.log("fetching...");
  return user.name.toUpperCase();
};

const memoGetUserName = memoize(getUserName, (user) => user.id);
const alice = { id: 1, name: "Alice" };
console.log(memoGetUserName(alice));  // fetching... "ALICE"
console.log(memoGetUserName(alice));  // "ALICE" (cached by id=1)
```

The custom resolver pattern: pass a function that extracts a stable identifier from the arguments. For database records, use the ID. For computation, use `JSON.stringify` on the relevant portion.

---

## Step 4 — Handling Object Arguments

The interviewer asks: "What happens if I use an object as a cache key without a resolver?"

```js-exec
// Without resolver — objects are compared by reference
const noResolver = memoize((obj) => obj.value);

const a = { value: 1 };
console.log(noResolver(a));  // 1 (computed)
console.log(noResolver(a));  // 1 (cached — same reference)

const b = { value: 1 };
console.log(noResolver(b));  // 1 (re-computed — different reference!)

// JSON.stringify handles this
const withResolver = memoize(
  (obj) => obj.value,
  (...args) => JSON.stringify(args)
);
console.log(withResolver({ value: 1 }));  // 1 (computed)
console.log(withResolver({ value: 1 }));  // 1 (cached — same serialized key)
```

---

## Step 5 — Edge Cases

**`NaN` as a key**: `Map` uses SameValueZero comparison. `NaN` is treated as equal to `NaN` in `Map` (unlike `===`). This means `memoize(fn)(NaN)` works correctly — subsequent calls with `NaN` hit the cache.

**`undefined` return value vs cache miss**: `cache.has(key)` distinguishes "key exists with value `undefined`" from "key doesn't exist." Never use `cache.get(key)` to check for cache hits — use `has()`.

**Unbounded cache growth**: A real memoize implementation should limit cache size. Mention LRU eviction as the standard solution:

```js
// Quick LRU mention — not full implementation
// "I'd add a maxSize option and evict the least recently used entry.
// That requires a Map + doubly linked list for O(1) eviction."
```

**`this` context**: The memoized function forwards `this` with `fn.apply(this, args)`. This is important when memoizing prototype methods.

---

## Step 6 — In-Flight Deduplication (Production Pattern)

The interviewer asks: "What if two callers request the same key before the first async call resolves? You'd fire the function twice."

Standard memoize caches **results** — but if `fn` is async and takes 500ms, a second call during that window misses the cache and fires a duplicate request. The fix: cache the **promise itself** while it's in-flight.

```js-exec
function memoizeAsync(fn, resolver) {
  const cache = new Map();
  const inFlight = new Map();

  return function (...args) {
    const key = resolver ? resolver(...args) : args[0];

    if (cache.has(key)) return cache.get(key);
    if (inFlight.has(key)) return inFlight.get(key); // same promise, no duplicate call

    const promise = Promise.resolve(fn.apply(this, args)).then(
      (value) => {
        cache.set(key, value);
        inFlight.delete(key);
        return value;
      },
      (err) => {
        inFlight.delete(key); // don't cache failures
        throw err;
      }
    );

    inFlight.set(key, promise);
    return promise;
  };
}

// Simulate slow API
let callCount = 0;
const fetchUser = async (id) => {
  callCount++;
  await new Promise(r => setTimeout(r, 50));
  return { id, name: "Naveen" };
};

const memoFetch = memoizeAsync(fetchUser);

async function main() {
  // Two simultaneous calls for same id — only ONE fetch fires
  const [a, b] = await Promise.all([memoFetch(1), memoFetch(1)]);
  console.log("calls made:", callCount); // 1 — not 2
  console.log("same result:", a === b);  // true — same resolved value

  // Third call after resolution — served from cache
  const c = await memoFetch(1);
  console.log("calls made:", callCount); // still 1
}

main();
```

This is the pattern used in data-fetching libraries (React Query, SWR) to prevent duplicate network requests.

---

## Full Solution

```js-exec
// Sync memoize
function memoize(fn, resolver) {
  const cache = new Map();

  return function (...args) {
    const key = resolver ? resolver(...args) : args[0];

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Async memoize with in-flight deduplication
function memoizeAsync(fn, resolver) {
  const cache = new Map();
  const inFlight = new Map();

  return function (...args) {
    const key = resolver ? resolver(...args) : args[0];
    if (cache.has(key)) return cache.get(key);
    if (inFlight.has(key)) return inFlight.get(key);

    const promise = Promise.resolve(fn.apply(this, args)).then(
      (value) => { cache.set(key, value); inFlight.delete(key); return value; },
      (err)   => { inFlight.delete(key); throw err; }
    );

    inFlight.set(key, promise);
    return promise;
  };
}
```

---

## What Interviewers Are Testing

- **Cache data structure choice** — `Map` over plain object (Map handles any key type, avoids `__proto__` injection, has O(1) `has()`)
- **Key generation** — understanding that default single-arg keying breaks for multi-arg and object-arg functions
- **Resolver pattern** — the ability to inject a custom key function for flexible caching strategies
- **`has()` vs `get()`** — using `has()` to distinguish cache miss from cached `undefined`
- **Memory awareness** — acknowledging unbounded cache growth and mentioning LRU as the fix
- **In-flight deduplication** — caching the promise itself, not just the result, to prevent duplicate concurrent requests

---

## Complexity

| | Time | Space |
|-|------|-------|
| Cache hit | O(1) | O(N) — N = cache entries |
| Cache miss | O(T) of fn | O(N) |

---

## Interview Tips

- **Choose `Map` and explain why** — "I'm using `Map` instead of a plain object because it handles any key type, avoids prototype pollution, and has clearer `has()` semantics."
- **Write single-arg first, then show it breaking** — implement the simple version, then demonstrate `memoAdd(2, 3)` followed by `memoAdd(2, 4)` returning the wrong answer. This proves you understand the limitation.
- **Mention LRU unprompted** — after presenting the base solution, say "in production, I'd add a `maxSize` option with LRU eviction to prevent memory leaks from unbounded caching."
- **Use a realistic resolver example** — `resolver: (user) => user.id` is more convincing than `JSON.stringify`. It shows you think about real API responses, not just toy arguments.

---

## Related Questions

- [Implement once()](/articles/js-interview-once)
- [Implement curry()](/articles/js-interview-curry)
- [Implement debounce()](/articles/js-interview-debounce)
