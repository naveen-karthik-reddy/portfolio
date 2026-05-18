The hardest curry variant: transform `f(a, b, c, d)` so it accepts any number of arguments at each call — `f(a)(b, c)(d)` — and invokes the original when enough args have been collected. It's curry without the one-arg-at-a-time restriction.

**Related deep-dive:** [Functions #2 — Currying & Partial Application](/articles/js-currying-partial-application)

---

## What is Variadic `curry()`?

Variadic `curry(fn)` is the generalization of the fixed-arity curry from Interview #11. Instead of requiring exactly one argument per call — `curried(a)(b)(c)` — the variadic version accepts any number of arguments at each call: `curried(a, b)(c)`, `curried(a)(b, c)`, or even `curried(a, b, c)`. It invokes `fn` as soon as the total accumulated arguments reaches or exceeds `fn.length`.

The core mechanism is the same as fixed-arity curry: **recursive argument accumulation** with `fn.length` as the termination condition. The difference is that each call collects `...args` (any number) rather than a single argument, and all collected args are spread onto the accumulator.

The termination condition `totalArgs.length >= fn.length` is what makes this "variadic" — you can provide arguments in any-sized batches. Once the total meets or exceeds the function's declared parameter count, the function executes. Excess arguments beyond `fn.length` are still passed through (matching native behavior).

Real-world use cases:
- **Flexible partial application** — `const greetHello = curry(greet)("Hello")` then later `greetHello("Alice")` or `greetHello("Bob")`
- **Configuration pipelines** — pre-configure a function with config in one call, then pass the data in another: `const configured = curry(process)(config); configured(data)`
- **Event handlers** — `const handler = curry(handleEvent)(eventType)(metadata)` then attach `handler(payload)` to the actual event

The variadic version is the one that matches how Lodash's `_.curry` works and is the version most useful in practice. The fixed-arity version is primarily an interview stepping stone.

---

## The Problem

> "Implement `curry(fn)` where the curried function can be called with any number of arguments at each step. It should invoke `fn` as soon as the total accumulated arguments reaches or exceeds `fn.length`."
>
> ```js
> const sum = (a, b, c, d) => a + b + c + d;
> const curriedSum = curry(sum);
> curriedSum(1)(2, 3)(4);  // 10
> curriedSum(1, 2)(3, 4);  // 10
> curriedSum(1)(2)(3)(4);  // 10
> ```

---

## Thought Process

The pattern from Interview #11 (fixed-arity curry) only allows one argument at a time. Here we need to:
1. Accumulate args across calls
2. Check after each call whether we have enough
3. If yes, invoke `fn` with the accumulated args
4. If no, return a new function that continues accumulating

The key difference from #11: instead of returning `(nextArg) => ...`, we return `(...nextArgs) => ...` — allowing any number of arguments per call.

---

## Step 1 — Base Variadic Curry

```js-exec
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}

// Test
const sum = (a, b, c, d) => a + b + c + d;
const curriedSum = curry(sum);

console.log(curriedSum(1)(2, 3)(4));    // 10
console.log(curriedSum(1, 2)(3, 4));    // 10
console.log(curriedSum(1, 2, 3, 4));    // 10
console.log(curriedSum(1)(2)(3)(4));    // 10
```

---

## Step 2 — Handling Extra Arguments

The interviewer asks: "What if you pass more arguments than `fn` expects?"

```js-exec
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args.slice(0, fn.length));  // only pass expected args
    }
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}

const add = (a, b) => a + b;
const curriedAdd = curry(add);
console.log(curriedAdd(1, 2, 3));  // 3 (ignores the third arg)
```

Some implementations pass all args to `fn` and let the function decide. Others slice to `fn.length`. State your choice and why.

---

## Step 3 — Preserving `this` Context

```js-exec
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...nextArgs) => curried.apply(this, [...args, ...nextArgs]);
  };
}

const obj = {
  multiplier: 10,
  multiply: curry(function(a, b) {
    return (a + b) * this.multiplier;
  })
};

console.log(obj.multiply(2)(3));  // 50
```

---

## Step 4 — Functions with Rest Parameters or Defaults

The interviewer: "What about `fn.length` for functions with rest params?"

```js-exec
function curry(fn, arity = fn.length) {
  return function curried(...args) {
    if (args.length >= arity) {
      return fn.apply(this, args);
    }
    return (...nextArgs) => curried.apply(this, [...args, ...nextArgs]);
  };
}

// Function with rest param — fn.length is 0
const sumAll = (...nums) => nums.reduce((a, b) => a + b, 0);
const curriedSumAll = curry(sumAll, 3);  // explicitly specify arity

console.log(curriedSumAll(1)(2)(3));  // 6
```

**Key insight**: Functions with rest params (`...args`) have `fn.length === 0`. Similarly, functions with default params only count parameters before the first default. If the interviewer gives you such a function, ask: "Should I accept an explicit arity?"

---

## Step 5 — Infinite Currying with Terminator

A related variant: infinite currying where the function is called with no arguments to terminate:

```js-exec
function infiniteCurry(fn) {
  const args = [];

  return function curried(...nextArgs) {
    if (nextArgs.length === 0) {
      return fn(...args);
    }
    args.push(...nextArgs);
    return curried;
  };
}

const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
const curriedSum = infiniteCurry(sum);

console.log(curriedSum(1)(2)(3)(4)());  // 10
console.log(curriedSum(5, 6)(7, 8)());  // 26
```

Note: this variant accumulates args in a closure across *all* call chains (the `args` array is shared). For a fresh accumulator each time, re-create the curried function.

---

## Edge Cases

**`fn.length = 0` (no-arg function)**: `curry(() => 'hello')()` — the first call has `args.length >= 0`, so it invokes immediately. Correct.

**Passing more args than expected**: Either slice to `fn.length` or pass all. State your choice.

**Calling with no arguments when arity isn't met**: Return a new function that waits for args. Don't invoke `fn` prematurely.

---

## Full Solution

```js-exec
function curry(fn, arity = fn.length) {
  return function curried(...args) {
    if (args.length >= arity) {
      return fn.apply(this, args);
    }
    return (...nextArgs) => curried.apply(this, [...args, ...nextArgs]);
  };
}
```

---

## What Interviewers Are Testing

- **Accumulation pattern** — gathering arguments across multiple calls
- **Arity detection** — using `fn.length` to know when to invoke
- **Rest parameter handling** — understanding that `fn.length` doesn't count rest params
- **Explicit arity override** — letting the caller specify arity when `fn.length` is unreliable
- **`this` forwarding** — preserving context through all call levels

---

## Complexity

| | Time | Space |
|-|------|-------|
| create curried | O(1) | O(1) |
| each call | O(1) — spread + concat | O(N) — accumulated args |

---

## Interview Tips

- **Start from the fixed-arity curry** — "This is the same pattern as fixed-arity curry, but `(arg)` becomes `(...args)`. That's the only change at the base level."
- **Ask about `fn.length` edge cases early** — "How should I handle functions with rest parameters or default values? Should I accept an explicit arity parameter?"
- **Show infinite curry as a variant** — "There's also infinite curry where you call with `()` to terminate. That uses a shared accumulator rather than arity-checking."
- **Mention `this` forwarding** — use `.apply(this, ...)` even if the test cases don't use `this`. It shows real-world awareness.

---

## Related Questions

- [#11 — Implement curry() — Fixed Arity](/articles/js-interview-curry)
- [#4 — Implement once()](/articles/js-interview-once)
- [#10 — Implement memoize()](/articles/js-interview-memoize)
