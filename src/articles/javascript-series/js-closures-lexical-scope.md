Closures are the reason inner functions "remember" variables from outer functions long after the outer function has returned. They power module patterns, memoization, once(), and almost every callback you've ever written. Understanding the memory model behind closures changes how you write JavaScript.

**Prerequisites:** [JS Foundations #1 — Variables & Scope](/articles/javascript-series/js-variables-scope-hoisting), [JS Foundations #2 — `this`](/articles/javascript-series/js-this-demystified)

---

## 1. What is a Closure?

A closure is created when a function **retains access to variables in its outer lexical scope** even after that outer function has finished executing. In JavaScript, every function is a closure.

```js-exec
function outer() {
  const message = "I am from outer";

  function inner() {
    console.log(message); // inner "closes over" message
  }

  return inner;
}

const fn = outer();  // outer runs and returns inner
fn();                 // "I am from outer" — message is still alive!
```

`outer()` returned. Its stack frame is gone. But `message` still lives — on the heap — because `inner` still references it. The garbage collector won't touch `message` as long as `fn` exists.

---

## 2. The Scope Chain in Closures

Closures don't capture a snapshot — they hold a **live reference** to the outer variable. If the variable changes before the inner function runs, the inner function sees the latest value:

```js-exec
function createFunctions() {
  const results = [];

  for (var i = 0; i < 3; i++) {
    // Each closure references the SAME 'i'
    results.push(function () {
      console.log("var i:", i);
    });
  }

  return results;
}

const fns = createFunctions();
fns[0](); // 3 (not 0!)
fns[1](); // 3 (not 1!)
fns[2](); // 3
```

Every closure sees `3` because `var i` is function-scoped — there's only one `i`, and by the time the closures run, the loop has finished and `i` is `3`.

The fix with `let` — `let` creates a **fresh binding per iteration**:

```js-exec
function createFunctionsFixed() {
  const results = [];

  for (let i = 0; i < 3; i++) {
    results.push(function () {
      console.log("let i:", i);
    });
  }

  return results;
}

const fixedFns = createFunctionsFixed();
fixedFns[0](); // 0
fixedFns[1](); // 1
fixedFns[2](); // 2
```

Or using an IIFE to create a new scope for each iteration (the pre-ES6 fix):

```js-exec
function createFunctionsIIFE() {
  const results = [];

  for (var i = 0; i < 3; i++) {
    (function (captured) {
      results.push(function () {
        console.log("IIFE captured:", captured);
      });
    })(i);
  }

  return results;
}

const iifeFns = createFunctionsIIFE();
iifeFns[0](); // 0
iifeFns[1](); // 1
iifeFns[2](); // 2
```

---

## 3. Private State with Closures

The most practical use of closures: **encapsulating private data**. No class, no fields — just functions.

```js-exec
function createCounter() {
  let count = 0; // Private — nobody outside can touch this

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    get value() {
      return count;
    },
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.decrement(); // 1
console.log(counter.value); // 1
console.log(counter.count);  // undefined — can't access from outside
```

This is the **module pattern** — every `createCounter()` call creates a new, independent closure with its own private `count`:

```js-exec
const c1 = createCounter();
const c2 = createCounter();

c1.increment(); // 1
c1.increment(); // 2

c2.increment(); // 1 — completely independent from c1

console.log("c1:", c1.value, "c2:", c2.value); // c1: 2, c2: 1
```

---

## 4. Closure for Memoization

Cache expensive function results so repeated calls with the same input are instant:

```js-exec
function memoize(fn) {
  const cache = {}; // Private cache — closed over

  return function (...args) {
    const key = JSON.stringify(args);
    if (key in cache) {
      console.log("Cache hit:", key);
      return cache[key];
    }
    console.log("Cache miss:", key, "— computing...");
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}

function expensiveAdd(a, b) {
  // Simulate expensive work
  let sum = 0;
  for (let i = 0; i < 1e7; i++) sum += i % 2;
  return a + b;
}

const memoAdd = memoize(expensiveAdd);

console.log(memoAdd(5, 3)); // Cache miss — computes
console.log(memoAdd(5, 3)); // Cache hit — instant
console.log(memoAdd(1, 2)); // Cache miss — new arguments
```

---

## 5. once() — Ensure a Function Runs Only Once

A useful pattern using closures to prevent a function from being called more than once:

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

const init = once(() => {
  console.log("Initializing...");
  return { ready: true };
});

console.log(init()); // "Initializing..." → { ready: true }
console.log(init()); // (no log) → { ready: true }
console.log(init()); // (no log) → { ready: true }
```

---

## 6. Function Factories

Closures can produce specialized functions — think of it as "creating a function from a template":

```js-exec
function multiply(a) {
  return function (b) {
    return a * b;
  };
}

const double = multiply(2);
const triple = multiply(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

This is the core of **currying** and **partial application** — covered in depth in a later article.

---

## 7. The Classic Closure Interview Question

Write a function that logs 1, 2, 3 at one-second intervals:

```js-exec
// ❌ Wrong — setTimeout is async, loop finishes before any callback fires
function wrongCount() {
  for (var i = 1; i <= 3; i++) {
    setTimeout(() => console.log("wrong:", i), i * 1000);
  }
}

wrongCount();
// Prints: 4, 4, 4 — all at 1s, 2s, 3s

// ✅ Fix 1: let
function fixLet() {
  for (let i = 1; i <= 3; i++) {
    setTimeout(() => console.log("let:", i), i * 1000);
  }
}

setTimeout(fixLet, 3500);
// Prints: 1, 2, 3 at 4.5s, 5.5s, 6.5s

// ✅ Fix 2: IIFE
function fixIIFE() {
  for (var i = 1; i <= 3; i++) {
    (function (j) {
      setTimeout(() => console.log("IIFE:", j), j * 1000);
    })(i);
  }
}

setTimeout(fixIIFE, 7000);
// Prints: 1, 2, 3
```

---

## 8. Closure Performance Tip

Closures keep variables alive. If you capture a large object but only need a small part, you keep the entire object in memory:

```js-exec
// ❌ Inefficient — the entire largeData object stays in memory
function createProcessor(largeData) {
  const relevant = largeData.summary;
  // largeData is still held in memory because it's in the closure's scope!
  return () => relevant;
}

// ✅ Better — only capture what you need
function createProcessorOptimized({ summary }) {
  return () => summary;
}
```

---

## Key Takeaways

- A **closure** is a function + its lexical environment — it retains access to outer-scope variables even after the outer function returns.
- Closures hold **live references**, not snapshots — the classic `for` + `var` + `setTimeout` bug.
- Closures enable **private state** without classes: counters, caches, once(), module patterns.
- **Every function in JavaScript is a closure.** The question is just what it closes over.
- Be mindful of **memory** — closing over a large object keeps the whole object alive.

---

**Next:** [JS Foundations #4 — Prototypes & Inheritance](/articles/javascript-series/js-prototypes-inheritance) — `__proto__` vs `prototype`, what `new` really does, and how `class extends` is sugar over the prototype chain.
