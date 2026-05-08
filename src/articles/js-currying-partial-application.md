Currying transforms a function that takes multiple arguments into a chain of functions each taking a single argument. Partial application fixes some arguments upfront and returns a function waiting for the rest.

**Think of currying like ordering a custom sandwich.** Instead of saying "lettuce, tomato, mayo" all at once, you tell the chef one ingredient at a time. Each time you say an ingredient, they hand you back a partially-built sandwich. Only when all ingredients are specified do you get the complete sandwich. Partial application is saying "lettuce and tomato" upfront and getting back a sandwich that's just waiting for mayo.

Both build on closures and are foundational to functional programming.

**Prerequisites:** [JS Foundations #3 — Closures](/articles/javascript-series/js-closures-lexical-scope), [Functions #1 — call/apply/bind](/articles/javascript-series/js-call-apply-bind)

---

## 1. What is Currying?

Currying converts `f(a, b, c)` into `f(a)(b)(c)` — each call returns a new function until all arguments are collected:

```js-exec
// Normal function
function add(a, b, c) {
  return a + b + c;
}

// Curried version — written manually
function curriedAdd(a) {
  return function (b) {
    return function (c) {
      return a + b + c;
    };
  };
}

console.log(add(1, 2, 3));        // 6 — one call
console.log(curriedAdd(1)(2)(3)); // 6 — three calls

// Partial supply works too
const add1 = curriedAdd(1);
const add1and2 = add1(2);
console.log(add1and2(3)); // 6
console.log(add1and2(10)); // 13
```

Each intermediate function "remembers" its argument via closure until the final call.

---

## 2. Implementing a Generic `curry()`

Write a function that curries any n-argument function:

```js-exec
function curry(fn) {
  return function curried(...args) {
    // If we have enough arguments, call the original function
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // Otherwise, return a function that collects more args
    return function (...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

// Test it
function multiply(a, b, c) {
  return a * b * c;
}

const curriedMultiply = curry(multiply);

console.log(curriedMultiply(2)(3)(4)); // 24
console.log(curriedMultiply(2, 3)(4)); // 24
console.log(curriedMultiply(2)(3, 4)); // 24
console.log(curriedMultiply(2, 3, 4)); // 24 — all at once works too
```

The `fn.length` check uses the function's declared parameter count to know when we're done collecting. Important: `fn.length` counts only the parameters **before** the first default value or rest parameter. So `(a, b, c) => {}` has length 3, but `(a, b = 1, c) => {}` has length 1, and `(...args) => {}` has length 0. For functions with rest parameters or defaults, you'll need a different stop condition (like the empty-call terminator shown in Section 3).

---

## 3. Infinite Currying — `sum(1)(2)(3)()`

A classic interview question: create `sum` that accumulates until called with no arguments:

```js-exec
function sum(a) {
  return function (b) {
    if (b === undefined) {
      return a; // No argument → return accumulated value
    }
    return sum(a + b); // More arguments → keep accumulating
  };
}

console.log(sum(1)(2)(3)());   // 6
console.log(sum(1)(2)(3)(4)()); // 10
console.log(sum(5)());          // 5

// Alternative: using valueOf for automatic coercion
function infiniteSum(initial) {
  const acc = (n) => infiniteSum(initial + n);
  acc.valueOf = () => initial;
  acc.toString = () => String(initial);
  return acc;
}

const result = infiniteSum(1)(2)(3);
console.log(+result);     // 6 (unary + triggers valueOf)
console.log(`${result}`); // "6" (string context triggers toString)
```

---

## 4. Partial Application — Fix Arguments Upfront

Partial application is like `bind` but without touching `this`:

```js-exec
function partial(fn, ...presetArgs) {
  return function (...laterArgs) {
    return fn.apply(this, [...presetArgs, ...laterArgs]);
  };
}

function greet(greeting, name, punctuation) {
  return `${greeting}, ${name}${punctuation}`;
}

const sayHello = partial(greet, "Hello");
const sayHelloExclamation = partial(greet, "Hello", "World");

console.log(sayHello("Naveen", "!"));         // Hello, Naveen!
console.log(sayHelloExclamation("!"));         // Hello, World!
```

---

## 5. Currying vs Partial Application

They look similar but serve different purposes:

```js-exec
// Currying — always one argument at a time, returns functions until done
const curriedGreet = curry(greet);
const addGreeting = curriedGreet("Hello");
const addName = addGreeting("Naveen");
console.log(addName("!")); // Hello, Naveen!

// Partial application — fix any number of arguments, returns final function
const helloToAnyone = partial(greet, "Hello");
console.log(helloToAnyone("Naveen", "!")); // Hello, Naveen!

// Key difference: curry forces single-arg chain; partial lets you pre-fill multiple
```

| | Currying | Partial Application |
|---|---|---|
| **Arguments per call** | Strictly one (or any, in JS-style curry) | Any number |
| **Return type** | Curried function until all args collected | Returns a function immediately |
| **Use case** | When you want point-free composition | When you want to fix known args now |

---

## 6. Real-World Use Cases

```js-exec
// 1. Creating specialized functions from a general one
const log = (level, timestamp, message) =>
  `[${level}] ${timestamp}: ${message}`;

const curriedLog = curry(log);

const debug = curriedLog("DEBUG");
const debugNow = debug(new Date().toISOString());
console.log(debugNow("Connection established"));

const info = curriedLog("INFO")(new Date().toISOString());
console.log(info("Server started"));

// 2. Event handler with pre-configured data
function handleEvent(action, elementId, event) {
  console.log(`${action} on #${elementId} triggered by`, event?.type ?? "unknown");
}

const curriedHandler = curry(handleEvent);
const onSave = curriedHandler("save");
const onSaveHeader = onSave("header");

// onSaveHeader(event) — ready to use as an event handler
onSaveHeader({ type: "click" });

// 3. API client factory
function apiClient(baseUrl, endpoint, params) {
  return `${baseUrl}/${endpoint}?${new URLSearchParams(params)}`;
}

const curriedApi = curry(apiClient);
const api = curriedApi("https://api.example.com");
console.log(api("users", { id: 42 }));
```

---

## Key Takeaways

- **Currying** transforms `f(a,b,c)` → `f(a)(b)(c)` — each call returns a function until all arguments are supplied.
- **`fn.length`** tells you how many parameters a function declares — the stop condition for curry.
- **Infinite currying** uses a terminator (empty call `()`) or `valueOf`/`toString` overload.
- **Partial application** is like `bind` without `this` — pre-fill arguments, get a function back.
- Currying shines in **point-free composition**; partial application shines when you know some args now but not all.

---

**Next:** [Functions #3 — Debounce & Throttle](/articles/javascript-series/js-debounce-throttle) — control how often a function can fire during scroll, resize, and input events.
