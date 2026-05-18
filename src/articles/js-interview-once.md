`once(fn)` returns a function that runs `fn` at most one time — the first call executes it, and every subsequent call returns the cached result. It's a single-closure problem that tests whether you understand function wrapping and state encapsulation.

**Related deep-dive:** [Functions #4 — memoize() & once()](/articles/js-memoize-once)

---

## What is `once()`?

`once(fn)` is a higher-order function that wraps another function and returns a version that executes **at most one time**. The first call runs `fn` and caches the result; every subsequent call returns the cached result without invoking `fn` again.

This is a **call-limiting pattern**, not a caching pattern. You're not memoizing by input — you're memoizing by the fact of having been called. The arguments on subsequent calls are irrelevant; you always get back the first result.

Real-world use cases:
- **Singleton initialization** — `const initApp = once(() => { setupEventListeners(); loadConfig(); })` ensures setup runs exactly once, no matter how many times it's triggered
- **One-time event handlers** — a click handler that should fire the first time and become a no-op after
- **Lazy computation** — defer an expensive calculation until first access, then cache forever
- **Payment/submission buttons** — prevent double-submission by wrapping the submit handler in `once()`

The implementation is a single closure with two variables: a `called` flag and a `result` cache. The only nuance is forwarding `this` so the wrapped function sees the caller's context. The interviewer will often extend this to `limit(fn, n)` — generalizing from "at most once" to "at most N times."

---

## The Problem

> "Implement `once(fn)` — a function that takes another function and returns a new function. The returned function calls `fn` only on the first invocation and returns the same result for all subsequent calls."

The interviewer may also ask:
> "Now implement `limit(fn, n)` — similar to `once`, but the function can be called up to `n` times before being locked."

---

## Thought Process

You need three things:
1. A flag (or counter) to track whether the function has been called
2. Storage for the cached result
3. A returned function that checks the flag, calls `fn` if allowed, and returns the cached result otherwise

The closure captures the flag and the cache — that's the entire pattern.

The key question the interviewer wants to hear you ask: **"What should the returned function return on subsequent calls — `undefined` or the cached result?"** The answer: the cached result from the first call. That's what makes `once` useful.

---

## Step 1 — Base Implementation

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

// Test
const add = (a, b) => a + b;
const addOnce = once(add);

console.log(addOnce(2, 3));  // 5 — fn executes
console.log(addOnce(10, 20)); // 5 — cached result, fn does NOT execute
console.log(addOnce(0, 0));   // 5 — still cached
```

---

## Step 2 — Preserving `this` Context

The interviewer will ask: "What if the wrapped function uses `this`?"

```js-exec
function once(fn) {
  let called = false;
  let result;

  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);  // forward the caller's 'this'
    }
    return result;
  };
}

// Test with this
const obj = {
  count: 0,
  incrementOnce: once(function (amount) {
    this.count += amount;
    return this.count;
  })
};

obj.incrementOnce(5);
console.log(obj.count);  // 5
obj.incrementOnce(10);
console.log(obj.count);  // 5 — still, fn didn't run again
```

---

## Step 3 — Extension: `limit(fn, n)`

The interviewer extends the question: "Now generalize it. Instead of just once, let the function be called at most `n` times."

```js-exec
function limit(fn, n) {
  let callCount = 0;
  let result;

  return function (...args) {
    if (callCount < n) {
      callCount++;
      result = fn.apply(this, args);
    }
    return result;
  };
}

// Test
const greet = (name) => `Hello, ${name}!`;
const limitedGreet = limit(greet, 3);

console.log(limitedGreet("Alice"));  // "Hello, Alice!" (call 1)
console.log(limitedGreet("Bob"));    // "Hello, Bob!"   (call 2)
console.log(limitedGreet("Carol"));  // "Hello, Carol!" (call 3)
console.log(limitedGreet("Dave"));   // "Hello, Carol!" (locked — returns last result)
```

---

## Step 4 — Edge Cases

**What if `fn` throws?** The native `once` behavior depends on the implementation. A reasonable choice: if `fn` throws, don't cache the result and don't mark it as called — let the caller retry. Or mark it as called anyway but return `undefined`. State your choice and why.

**What if `fn` returns `undefined`?** This is the classic cache-miss problem. If the function legitimately returns `undefined`, we still need to know the function was called. That's why we use a separate `called` flag rather than checking `result === undefined`.

**Async functions**: `once` works with async functions, but the cached result will be a Promise. Subsequent calls return the same Promise — not necessarily the resolved value. If you need the resolved value cached, you'd need to `await` the result first.

---

## Full Solution

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

function limit(fn, n) {
  let callCount = 0;
  let result;

  return function (...args) {
    if (callCount < n) {
      callCount++;
      result = fn.apply(this, args);
    }
    return result;
  };
}
```

---

## What Interviewers Are Testing

- **Closure for state** — using a closed-over variable (`called`) as private state
- **Function wrapping** — the pattern of taking a function, wrapping it with behavior, and returning a new function
- **`this` forwarding** — using `.apply(this, args)` so the wrapped function sees the correct context
- **Flag vs result check** — understanding why a boolean flag is safer than checking `result === undefined`

---

## Complexity

| | Time | Space |
|-|------|-------|
| First call | O(T) of fn | O(1) + O(S) of fn |
| Subsequent calls | O(1) | O(1) |

---

## Interview Tips

- **State the caching behavior upfront** — "I'll use a closure to track whether the function has been called and cache the result." This shows you've seen the pattern before.
- **Ask about error handling** — "If `fn` throws, should the wrapper mark it as called, or allow a retry?" Asking this shows you think about edge cases without being prompted.
- **Write `once` first, then generalize** — `limit(fn, 1)` is `once(fn)`. Show the generalization naturally by replacing the boolean with a counter.
- **Mention `this` forwarding** — even if the test case doesn't use `this`, use `.apply(this, args)` and briefly note why. It shows you think about real-world usage.

---

## Related Questions

- [#10 — Implement memoize()](/articles/js-interview-memoize)
- [#3 — Make Counter](/articles/js-interview-make-counter)
- [#8 — Implement debounce()](/articles/js-interview-debounce)
