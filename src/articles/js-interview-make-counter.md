`makeCounter` is the canonical closure interview question. If you understand why the returned function remembers its variables, you understand closures. The question starts simple and escalates — here's how to handle both versions.

**Related deep-dive:** [JS Foundations #3 — Closures & Lexical Scope](/articles/js-closures-lexical-scope)

---

## The Problem

**Version I:**
> "Write a `makeCounter` function that returns a counter. Each call to the returned function increments and returns the count, starting from 0."

**Version II (the interviewer will extend):**
> "Now modify it so the counter object has four methods: `increment()`, `decrement()`, `reset()`, and `getValue()`."

---

## Thought Process

A closure is created when a function "remembers" the variables from its outer scope, even after that outer scope has finished executing. For a counter, the outer function `makeCounter` creates a variable. The inner function closes over it. Each call to `makeCounter` creates a **new, independent** closure.

Key insight: **the variable is private**. Nothing outside the returned function can access or modify it directly. This is the module pattern in its simplest form.

---

## Step 1 — Version I: Simple Closure Counter

```js-exec
function makeCounter() {
  let count = 0;  // This variable lives on because the closure references it

  return function () {
    count++;      // Mutates the closed-over variable
    return count;
  };
}

// Test
const counter1 = makeCounter();
console.log(counter1());  // 1
console.log(counter1());  // 2
console.log(counter1());  // 3

// Each makeCounter() call creates an independent closure
const counter2 = makeCounter();
console.log(counter2());  // 1 — separate from counter1
```

That's it. One variable, one returned function that closes over it. But the interviewer isn't done.

---

## Step 2 — Version II: Counter Object with Methods

The interviewer now says: "Turn it into an object with four methods."

```js-exec
function makeCounter(initialValue = 0) {
  let count = initialValue;

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    reset() {
      count = initialValue;
      return count;
    },
    getValue() {
      return count;
    }
  };
}

// Test
const c = makeCounter(5);
console.log(c.getValue());   // 5
console.log(c.increment());  // 6
console.log(c.increment());  // 7
console.log(c.decrement());  // 6
console.log(c.reset());      // 5
console.log(c.getValue());   // 5
```

---

## Step 3 — Why Closures Make This Work

Here's what the interviewer wants you to articulate:

1. When `makeCounter` is called, a new execution context is created with a local variable `count`.
2. The returned object's methods hold references to `count` — not a copy, the **actual variable**.
3. Even after `makeCounter` returns and its execution context is popped off the call stack, `count` is not garbage-collected because the closures still reference it.
4. Each call to `makeCounter` creates a **new, separate** `count` variable — the closures are independent.

This is the same mechanism that powers the module pattern, memoization, and event handlers in loops.

---

## Step 4 — Edge Cases

**Starting from a non-zero value**: The `initialValue` parameter handles this. Default it to `0` so the counter works with no arguments.

**Calling `reset()`**: Should return to `initialValue`, not `0` (unless `initialValue` was `0`). This is a detail interviewers notice — if you reset to `0` instead of the initial value, that's a bug.

**What if someone passes a non-number?** The native behavior would still work — JavaScript would coerce it. Don't add validation unless asked.

**Making `count` truly unreachable**: Since we return an object with methods, those methods can access `count`. But there's no way to get `count` directly — only through `getValue()`. The data is truly private.

---

## Full Solution

```js-exec
function makeCounter(initialValue = 0) {
  let count = initialValue;

  return {
    increment() { return ++count; },
    decrement() { return --count; },
    reset() {
      count = initialValue;
      return count;
    },
    getValue() { return count; },
  };
}
```

---

## What Interviewers Are Testing

- **Closure fundamentals** — you understand that inner functions retain access to outer variables after the outer function returns
- **Lexical scope** — you know `count` is scoped to `makeCounter`, not the returned function
- **Data privacy** — you recognize that closures create truly private state (no way to access `count` except through the API)
- **Independent instances** — you understand that each `makeCounter()` call creates a fresh closure with its own `count`

---

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| All methods | O(1) | O(1) |

---

## Interview Tips

- **Say "closure" immediately** — when the interviewer asks "how would you implement a counter?", respond "this is a closure — an inner function that captures a variable from its enclosing scope." This shows you recognize the pattern.
- **Write version I in 3 lines** — don't over-explain the simple version. Save your energy for version II, where the discussion happens.
- **Use `++count` not `count++`** — pre-increment returns the updated value directly, so you can write `return ++count` instead of `count++; return count;`. It's a small thing that shows fluency.
- **Mention garbage collection** — when asked "how does the variable stay alive?", explain that the closure reference prevents GC. This signals deeper knowledge.

---

## Related Questions

- [#4 — Implement once()](/articles/js-interview-once)
- [#10 — Implement memoize()](/articles/js-interview-memoize)
- [#1 — Implement call(), apply() & bind()](/articles/js-interview-call-apply-bind)
