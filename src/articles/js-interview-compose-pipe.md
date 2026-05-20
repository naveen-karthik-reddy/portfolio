Compose and pipe are two sides of the same functional programming coin. The base implementations are short — but interviewers push further with async variants, error propagation, and the ability to explain why one direction is idiomatic over the other.

---

## What are `compose()` and `pipe()`?

`compose(f, g, h)` returns a new function that applies `h` first, then `g`, then `f` — **right-to-left**. This mirrors mathematical function composition: `f(g(h(x)))`.

`pipe(f, g, h)` is the same idea but **left-to-right**: apply `f` first, then `g`, then `h`. This reads like a Unix pipeline or a sequence of transformations — more natural for most developers.

Both are at their core a **`reduce` over an array of functions** — each function receives the output of the previous one and passes its result to the next.

Real-world use cases:
- **Data transformation pipelines** — parse → validate → normalize → format as separate composable steps
- **Redux middleware** — `applyMiddleware` uses compose to chain store enhancers
- **Selector composition** — deriving computed values from state by composing selectors
- **Functional utility libraries** — Ramda, Lodash/FP, and RxJS pipelines are built on this pattern

The interview escalates in two directions. First, the **multi-argument first function**: the initial function in the chain can take multiple arguments; only its return value is passed forward. Second, **async compose/pipe**: when any function in the chain returns a Promise, the whole pipeline must become async — you replace `reduce` with an `async` loop using `await`.

---

## The Problem

> "Implement `compose(...fns)` that takes any number of functions and returns a new function. When called, it applies the functions right-to-left, passing the result of each as input to the next."

The interviewer extends:
> "Now implement `pipe(...fns)` — same idea but left-to-right. Then make `pipeAsync` that handles functions returning Promises."

---

## Thought Process

Both functions share the same structure: a reducer over an array of functions.

- `compose` uses `reduceRight` — start from the last function, work leftward
- `pipe` uses `reduce` — start from the first function, work rightward

For the multi-argument case: the *first* function in the execution order (rightmost in compose, leftmost in pipe) is called with all the initial arguments via rest params. Every subsequent function receives exactly one argument — the result of the previous call.

For async: replace the synchronous reduce loop with an async loop. Each step `await`s the result before passing it to the next function. This handles both sync and async functions in the same pipeline.

---

## Step 1 — `compose()`: Right-to-Left

```js-exec
function compose(...fns) {
  if (fns.length === 0) return (x) => x; // identity
  if (fns.length === 1) return fns[0];

  return function (...args) {
    // reduceRight: last function runs first, receives all args
    // each subsequent function receives the previous result
    return fns.reduceRight((acc, fn, i) => {
      return i === fns.length - 1 ? fn(...args) : fn(acc);
    }, undefined);
  };
}

// Test
const double = (x) => x * 2;
const addOne = (x) => x + 1;
const square = (x) => x * x;

const transform = compose(square, addOne, double);
// Executes: double(3) = 6 → addOne(6) = 7 → square(7) = 49
console.log(transform(3)); // 49

// Multi-arg first function
const add = (a, b) => a + b;
const transformMulti = compose(square, addOne, add);
console.log(transformMulti(3, 4)); // add(3,4)=7 → addOne(7)=8 → square(8)=64
```

---

## Step 2 — Cleaner `compose()` with `reduceRight`

The standard idiom avoids the index check by initializing the accumulator with the first call:

```js-exec
function compose(...fns) {
  if (fns.length === 0) return (x) => x;
  if (fns.length === 1) return fns[0];

  return function (...args) {
    // Pull off the rightmost function to handle multi-arg initial call
    const [first, ...rest] = [...fns].reverse();
    const initial = first(...args);
    return rest.reduce((acc, fn) => fn(acc), initial);
  };
}

const double = (x) => x * 2;
const addOne = (x) => x + 1;
const square = (x) => x * x;

console.log(compose(square, addOne, double)(5)); // double(5)=10 → addOne(10)=11 → square(11)=121
console.log(compose(addOne)(5));                 // single function — 6
console.log(compose()(5));                       // identity — 5
```

---

## Step 3 — `pipe()`: Left-to-Right

`pipe` is `compose` with the array processed in forward order:

```js-exec
function pipe(...fns) {
  if (fns.length === 0) return (x) => x;
  if (fns.length === 1) return fns[0];

  return function (...args) {
    // First function handles multi-arg; the rest take one arg
    const [first, ...rest] = fns;
    const initial = first(...args);
    return rest.reduce((acc, fn) => fn(acc), initial);
  };
}

// Test
const double = (x) => x * 2;
const addOne = (x) => x + 1;
const square = (x) => x * x;

const transform = pipe(double, addOne, square);
// Executes: double(3)=6 → addOne(6)=7 → square(7)=49
console.log(transform(3)); // 49 — same result, more readable order

// Practical example: string pipeline
const processName = pipe(
  (s) => s.trim(),
  (s) => s.toLowerCase(),
  (s) => s.replace(/\s+/g, "_")
);
console.log(processName("  Hello World  ")); // "hello_world"
```

---

## Step 4 — `pipeAsync()`: Async Pipeline

When any function returns a Promise, chain with `await`:

```js-exec
async function pipeAsync(...fns) {
  return async function (...args) {
    const [first, ...rest] = fns;
    let acc = await first(...args);
    for (const fn of rest) {
      acc = await fn(acc);
    }
    return acc;
  };
}

// Simulated async steps
const fetchUser = async (id) => ({ id, name: "Naveen", score: 42 });
const validateUser = (user) => {
  if (!user.name) throw new Error("No name");
  return user;
};
const formatUser = async (user) => ({
  ...user,
  displayName: user.name.toUpperCase(),
  grade: user.score >= 40 ? "A" : "B",
});

async function main() {
  const processUser = await pipeAsync(fetchUser, validateUser, formatUser);
  const result = await processUser(1);
  console.log(result);
  // { id: 1, name: 'Naveen', score: 42, displayName: 'NAVEEN', grade: 'A' }
}

main();
```

---

## Full Solution

```js-exec
function compose(...fns) {
  if (fns.length === 0) return (x) => x;
  if (fns.length === 1) return fns[0];
  return function (...args) {
    const [first, ...rest] = [...fns].reverse();
    return rest.reduce((acc, fn) => fn(acc), first(...args));
  };
}

function pipe(...fns) {
  if (fns.length === 0) return (x) => x;
  if (fns.length === 1) return fns[0];
  return function (...args) {
    const [first, ...rest] = fns;
    return rest.reduce((acc, fn) => fn(acc), first(...args));
  };
}

async function pipeAsync(...fns) {
  return async function (...args) {
    const [first, ...rest] = fns;
    let acc = await first(...args);
    for (const fn of rest) {
      acc = await fn(acc);
    }
    return acc;
  };
}

// Quick tests
const add = (a, b) => a + b;
const double = (x) => x * 2;
const negate = (x) => -x;

console.log("compose:", compose(negate, double, add)(3, 4)); // add(3,4)=7 → double(7)=14 → negate(14)=-14
console.log("pipe:   ", pipe(add, double, negate)(3, 4));    // same result, different readability
```

---

## What Interviewers Are Testing

- **`reduce` vs `reduceRight`** — understanding why compose uses `reduceRight` (or reversing + `reduce`)
- **Multi-arg first function** — knowing only the *entry point* handles spread args; all subsequent functions take one
- **Async awareness** — replacing `reduce` with a `for...of` + `await` loop (not `reduce` with async callbacks, which breaks)
- **Symmetry of compose/pipe** — explaining that they're identical except for the direction of traversal
- **Edge cases** — empty `fns`, single `fns` (identity / passthrough)

---

## Interview Tips

- **Start with `pipe`** — it reads left-to-right like English and is easier to explain. Then show compose as "the same thing, reversed."
- **Don't use `reduce` for `pipeAsync`** — `reduce` with async callbacks doesn't actually await each step; you need a `for...of` loop or `reduce` with `promise.then()` chaining. Mention this explicitly — it's a common trap.
- **Relate to something real** — "Redux's `applyMiddleware` uses compose to chain enhancers" shows you've seen this in production code.
- **Name the FP concept** — "This is function composition — the output of one function becomes the input of the next. It's how you build pipelines of pure transformations."

---

## Related Questions

- [Implement curry()](/articles/js-interview-curry)
- [Implement memoize()](/articles/js-interview-memoize)
- [Implement mapAsync() and mapAsyncLimit()](/articles/js-interview-map-async)
