Currying transforms `f(a, b, c)` into `f(a)(b)(c)`. It's the canonical functional programming interview question — testing recursion, closures, and argument accumulation all at once. This article covers both the fixed-arity version (curry I) and the variadic version (curry II).

**Related deep-dive:** [Functions #2 — Currying & Partial Application](/articles/js-currying-partial-application)

---

## The Problem

**Curry I (fixed arity):**
> "Implement `curry(fn)` that transforms `fn(a, b, c)` so it can be called as `curried(a)(b)(c)`. The curried function should execute `fn` once enough arguments have been collected."

**Curry II (variadic):**
> "Now modify it so the curried function can accept any number of arguments at each step: `curried(a, b)(c)`, `curried(a)(b, c)`, etc. The function executes when enough total arguments have been collected."

---

## Thought Process

The core pattern is recursion with argument accumulation:

1. When the curried function is called, collect the new arguments
2. If enough arguments have been collected (`args.length >= fn.length`), call `fn`
3. Otherwise, return a new function that will collect more arguments

The termination condition is `fn.length` — the number of declared parameters. This works because `fn.length` returns the count of parameters before the first default/rest parameter.

---

## Step 1 — Curry I: Fixed Arity (One Arg Per Call)

```js-exec
function curry(fn) {
  return function curried(...args) {
    // If we have enough args, execute the original function
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // Otherwise, return a function that collects the next arg
    return function (...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

// Test
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3));   // 6
console.log(curriedAdd(1, 2)(3));   // 6 — variadic at each step
console.log(curriedAdd(1)(2, 3));   // 6
```

Wait — this already handles variadic calls at each step! That's because the inner function uses `...nextArgs` (rest parameter), so `curried(1, 2)(3)` works naturally. The interviewer may still ask you to walk through why this works.

---

## Step 2 — How Argument Accumulation Works

Let's trace `curriedAdd(1)(2)(3)`:

```
Call 1: curried(1)
  args = [1], fn.length = 3 → not enough
  Returns: (...nextArgs) => curried(1, ...nextArgs)

Call 2: returned_fn(2)
  nextArgs = [2]
  Calls: curried(1, 2)
  args = [1, 2], fn.length = 3 → not enough
  Returns: (...nextArgs) => curried(1, 2, ...nextArgs)

Call 3: returned_fn(3)
  nextArgs = [3]
  Calls: curried(1, 2, 3)
  args = [1, 2, 3], fn.length = 3 → enough!
  Calls: add(1, 2, 3) → 6
```

The accumulated arguments grow with each recursive call. The recursion bottoms out when `args.length >= fn.length`.

---

## Step 3 — Curry II: Variadic with Termination on Empty Call

The interviewer says: "Now I want the curried function to collect arguments until called with **no arguments**. Calling with `()` signals termination."

This is a different termination strategy — not based on arity, but on an explicit signal:

```js-exec
function curryVariadic(fn) {
  return function curried(...args) {
    if (args.length === 0) {
      // Termination signal — call with no args
      return fn.call(this);
    }
    // Accumulate arguments and return a new collector
    const accumulated = args;
    return function (...nextArgs) {
      if (nextArgs.length === 0) {
        // Termination signal at the next level
        return fn.apply(this, accumulated);
      }
      return curried(...accumulated, ...nextArgs);
    };
  };
}

// Test
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}

const curriedSum = curryVariadic(sum);
console.log(curriedSum(1)(2)(3)(4)());  // 10
console.log(curriedSum(1, 2)(3, 4)());  // 10
```

But there's a cleaner pattern — accumulate in a closure and terminate explicitly:

```js-exec
function curryVariadic(fn) {
  const allArgs = [];

  function curried(...args) {
    if (args.length === 0) {
      return fn.apply(this, allArgs);
    }
    allArgs.push(...args);
    return curried;  // Return itself for chaining
  }

  return curried;
}

const curriedSum = curryVariadic(sum);
console.log(curriedSum(1)(2)(3)());         // 6
console.log(curriedSum(1, 2)(3, 4, 5)());   // 15
```

This version uses a shared `allArgs` array — cleaner, but all calls to the same curried function share state. For the interview, mention both approaches and their trade-offs.

---

## Step 4 — Edge Cases

**Functions with default parameters**: `fn.length` excludes parameters with defaults. `function f(a, b = 2, c) {}` has `f.length === 1` because the count stops at the first default. This means `curry(f)(1)(2)(3)` would fail — `fn.length` says 1 arg is enough. Solution: document this limitation or use a different arity source.

**Functions with rest parameters**: `function f(...args) {}` has `f.length === 0`. Curry would execute on the first call regardless of arguments. This is correct behavior — you can't curry a variadic function by arity.

**No-argument functions**: `function f() {}` has `f.length === 0`. `curry(f)()` executes immediately. This is also correct.

**Calling with more arguments than expected**: `curriedAdd(1, 2, 3, 4)` — our implementation calls `add(1, 2, 3, 4)` (extra args are passed but `add` ignores them). The native Lodash `curry` also allows this.

---

## Full Solution

```js-exec
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}
```

---

## What Interviewers Are Testing

- **Recursion with accumulation** — building up arguments across recursive calls until a terminal condition is met
- **`fn.length`** — knowing that `fn.length` gives the declared parameter count (and its limitations with defaults/rest)
- **Closures** — each level of the curried function closes over the accumulated `args` array
- **`this` preservation** — using `fn.apply(this, args)` so the original function sees the correct context
- **Rest and spread** — using `...args` and `[...args, ...nextArgs]` for flexible argument handling

---

## Complexity

| | Time | Space |
|-|------|-------|
| Per curried call | O(N) for spread (N = args so far) | O(N) for accumulated args |
| Final execution | O(T) of fn | O(1) |

---

## Interview Tips

- **Write the 4-line recursive solution first** — it handles both curry I and curry II in one shot. Interviewers are often surprised the solution is so short.
- **Trace one example out loud** — pick `curried(1)(2)(3)` and walk through each recursive call showing how `args` grows. This proves you understand the accumulation, not just the syntax.
- **Mention `fn.length` limitations proactively** — "I'm using `fn.length` for arity, but it doesn't count parameters after the first default value. For a production version, I'd accept an explicit arity parameter."
- **Distinguish from partial application** — "Currying always returns unary functions (one arg each). What I've implemented is closer to Lodash's `curry`, which allows variadic calls at each step — this is sometimes called 'curry-style partial application.'" Showing you know the terminology distinction signals depth.

---

## Related Questions

- [#10 — Implement memoize()](/articles/js-interview-memoize)
- [#29 — Variadic curry() — Fully Variadic](/articles/js-interview-curry-variadic)
- [#1 — Implement call(), apply() & bind()](/articles/js-interview-call-apply-bind)
