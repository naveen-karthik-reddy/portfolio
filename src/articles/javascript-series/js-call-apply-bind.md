`call`, `apply`, and `bind` are the three built-in methods that let you explicitly set `this` for any function invocation. Understanding them is one thing — **implementing them from scratch** is another. This article walks through building polyfills for all three.

**Prerequisites:** [JS Foundations #2 — `this` Demystified](/articles/javascript-series/js-this-demystified)

---

## 1. The Three Methods at a Glance

```js-exec
function greet(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person = { name: "Naveen" };

// call — comma-separated arguments
greet.call(person, "Hello", "!");   // Hello, I'm Naveen!

// apply — arguments passed as an array
greet.apply(person, ["Hi", "."]);   // Hi, I'm Naveen.

// bind — returns a new function with 'this' permanently fixed
const boundGreet = greet.bind(person, "Hey");
boundGreet("!!");                    // Hey, I'm Naveen!!
```

---

## 2. Implementing `call()` — Step by Step

The `call()` method invokes a function with a given `this` and individual arguments:

```js-exec
// Our polyfill for Function.prototype.call
Function.prototype.myCall = function (context, ...args) {
  // If context is null/undefined, default to globalThis
  context = context ?? globalThis;

  // Temporarily assign 'this' function as a method on context
  const uniqueKey = Symbol("myCall");
  context[uniqueKey] = this;

  // Call it — implicit binding sets 'this' to context
  const result = context[uniqueKey](...args);

  // Clean up — don't leave the property on context
  delete context[uniqueKey];

  return result;
};

// Test it
function show(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const user = { name: "Naveen" };
show.myCall(user, "Hello"); // Hello, Naveen
show.myCall(null, "Hi");    // Hi, undefined (globalThis)
```

Why the `Symbol` for the key? So we don't accidentally overwrite an existing property on `context`. A `Symbol` is guaranteed unique.

---

## 3. Implementing `apply()` — Arguments as an Array

`apply` is identical to `call` except it takes an array (or array-like) of arguments:

```js-exec
Function.prototype.myApply = function (context, argsArray) {
  context = context ?? globalThis;

  const uniqueKey = Symbol("myApply");
  context[uniqueKey] = this;

  // If argsArray is null/undefined, call with no args
  const result = argsArray
    ? context[uniqueKey](...argsArray)
    : context[uniqueKey]();

  delete context[uniqueKey];
  return result;
};

// Test it
function sum(a, b, c) {
  return a + b + c;
}

console.log(sum.myApply(null, [1, 2, 3])); // 6
console.log(sum.myApply(null));             // NaN (no args — a,b,c are undefined)
```

---

## 4. `call` vs `apply` — When to Use Which

`apply` was more useful before the spread operator existed. Today, `call` + spread covers almost everything:

```js-exec
const numbers = [5, 2, 9, 1, 7];

// Old way — apply with Math.max (Math.max takes individual args, not an array)
const maxOld = Math.max.apply(null, numbers);
console.log("max (apply):", maxOld); // 9

// Modern way — spread operator
const maxNew = Math.max(...numbers);
console.log("max (spread):", maxNew); // 9

// The one remaining use case for apply: passing an array-like (not iterable)
function logArgs() {
  console.log("arguments:", [...arguments]);
  // Math.max.apply is still needed for array-like objects without Symbol.iterator
}
logArgs(1, 2, 3);
```

---

## 5. Implementing `bind()` — Return a Bound Function

`bind()` is more complex — it returns a **new function** with `this` permanently fixed, and allows partial application of arguments:

```js-exec
Function.prototype.myBind = function (context, ...boundArgs) {
  const originalFn = this;

  function boundFn(...callArgs) {
    // If called with 'new', 'this' inside boundFn is the new instance
    // In that case, the bound context should be ignored (new > bind)
    const isNewCall = this instanceof boundFn;

    return originalFn.apply(
      isNewCall ? this : context,
      [...boundArgs, ...callArgs]
    );
  }

  // Maintain prototype chain for 'new' to work correctly
  boundFn.prototype = originalFn.prototype;

  return boundFn;
};

// Test 1: Basic binding
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const user = { name: "Naveen" };
const boundGreet = greet.myBind(user, "Hello");
boundGreet("!"); // Hello, Naveen!

// Test 2: bind is permanent — cannot be overridden with call
const boundToUser = greet.myBind(user);
boundToUser.call({ name: "Other" }, "Hi", "."); // Hi, Naveen. (NOT Other!)
```

---

## 6. `bind` + `new` — The Edge Case

When a bound function is called with `new`, `this` should be the newly created object, not the bound context:

```js-exec
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const BoundPerson = Person.myBind({ name: "Ignored" }, "Naveen");

const p = new BoundPerson(25);
console.log(p.name);  // "Naveen" — bound arg was used!
console.log(p.age);   // 25
// Note: p's this was NOT the bound object — it's the new instance
```

The bound args are still prepended — only `this` is overridden by `new`.

---

## 7. Partial Application with `bind`

`bind` lets you pre-fill arguments — this is partial application:

```js-exec
function multiply(a, b) {
  return a * b;
}

// Pre-fill a = 2 — returns a function waiting for b
const double = multiply.bind(null, 2);
console.log(double(5));  // 10
console.log(double(10)); // 20

// Pre-fill both — function takes no more args
const always42 = multiply.bind(null, 6, 7);
console.log(always42()); // 42

// Real-world use: fixing event handler arguments
function handleClick(component, event) {
  console.log(`Clicked ${component} at`, event?.type ?? "unknown event");
}

const headerClick = handleClick.bind(null, "Header");
headerClick({ type: "click" }); // "Clicked Header at click"
```

---

## 8. Quick Reference — Implementing All Three Manually

```js-exec
// Minimal implementations for reference:
Function.prototype.$call = function (ctx, ...args) {
  const key = Symbol();
  (ctx ?? globalThis)[key] = this;
  const result = (ctx ?? globalThis)[key](...args);
  delete (ctx ?? globalThis)[key];
  return result;
};

Function.prototype.$apply = function (ctx, args) {
  const key = Symbol();
  (ctx ?? globalThis)[key] = this;
  const result = args ? (ctx ?? globalThis)[key](...args) : (ctx ?? globalThis)[key]();
  delete (ctx ?? globalThis)[key];
  return result;
};

Function.prototype.$bind = function (ctx, ...bound) {
  const fn = this;
  return function (...call) {
    return fn.apply(new.target ? this : ctx, [...bound, ...call]);
  };
};

// Verify
const obj = { name: "test" };
function say(prefix) {
  console.log(prefix, this.name);
}
say.$call(obj, "via call"); // via call test
say.$apply(obj, ["via apply"]); // via apply test
const $bound = say.$bind(obj, "via bind");
$bound(); // via bind test
```

---

## Key Takeaways

| Method | Invokes Immediately? | Returns | `this` Settable Later? |
|---|---|---|---|
| `call` | Yes | Function's return value | N/A |
| `apply` | Yes | Function's return value | N/A |
| `bind` | No | A new bound function | No — permanent |

- `call` and `apply` differ only in how arguments are passed — comma-separated vs array.
- `bind` returns a **permanent** bound function — `call`/`apply`/`bind` cannot change its `this`.
- `new` overrides `bind`'s `this` but keeps the bound arguments.
- `bind` is also a **partial application** tool — pre-fill arguments, return a function waiting for the rest.

---

**Next:** [Functions #2 — Currying & Partial Application](/articles/javascript-series/js-currying-partial-application) — transform `f(a,b,c)` into `f(a)(b)(c)` and build infinite currying patterns.
