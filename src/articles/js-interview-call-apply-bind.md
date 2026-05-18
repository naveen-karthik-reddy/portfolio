Implementing `call`, `apply`, and `bind` from scratch is one of the most common frontend interview questions. It tests whether you truly understand how `this` works — not just the rules, but the mechanics.

**Related deep-dive:** [Functions #1 — call(), apply() & bind() Polyfills](/articles/js-call-apply-bind)

---

## What are `call()`, `apply()`, and `bind()`?

These three methods let you explicitly control what `this` refers to when a function executes. By default, `this` is determined by how a function is called (the "implicit binding" rule) — but `call`, `apply`, and `bind` override that.

- **`call(thisArg, ...args)`** — invokes the function immediately with `this` set to `thisArg` and arguments passed individually.
- **`apply(thisArg, argsArray)`** — same as `call`, but arguments are passed as an array (or array-like object).
- **`bind(thisArg, ...args)`** — does NOT invoke the function. It returns a new function with `this` permanently bound to `thisArg`, with optional partial application of arguments.

These are foundational because many higher-level patterns (function borrowing, partial application, method delegation) are built on them. In modern code, arrow functions and the `...spread` operator handle some of these use cases, but `bind` is still essential for event handlers and callback binding.

The core mechanic behind all three is the **temporary property trick**: attach the function as a property on the context object, call it as `obj.fn()`, then remove the property. Implicit binding handles the rest.

---

## The Problem

Interviewers will ask some variation of:

> "Implement `Function.prototype.myCall`, `myApply`, and `myBind` from scratch. Each should replicate the behavior of the native method."

You're expected to implement all three. The interviewer may start with `call` and ask you to build up to `bind`.

---

## Thought Process

The core question is: **how do you make `this` point to a specific object when calling a function?**

Recall the implicit binding rule: when a function is called as `obj.fn()`, `this` inside `fn` is `obj`. So the trick is:

1. Temporarily attach the function as a property on the context object
2. Call it as `obj[tempKey]()` — implicit binding sets `this`
3. Delete the temporary property

That's the entire mechanical insight. Everything else is edge cases and argument forwarding.

---

## Step 1 — `myCall`: Base Implementation

```js-exec
Function.prototype.myCall = function (context, ...args) {
  // null/undefined context → default to globalThis
  context = context ?? globalThis;

  // Use a Symbol to avoid overwriting any existing property
  const tempKey = Symbol("myCall");
  context[tempKey] = this;

  const result = context[tempKey](...args);

  delete context[tempKey];
  return result;
};

// Test
function greet(greeting) {
  console.log(`${greeting}, I'm ${this.name}`);
}

const user = { name: "Naveen" };
greet.myCall(user, "Hello");   // Hello, I'm Naveen
greet.myCall(null, "Hi");      // Hi, I'm undefined
```

Why `Symbol`? If we used a string like `"fn"`, it could collide with an existing property on the context object. A `Symbol()` is guaranteed unique.

---

## Step 2 — `myApply`: Arguments as an Array

`apply` is identical to `call`, except it takes arguments as an array (or array-like):

```js-exec
Function.prototype.myApply = function (context, argsArray) {
  context = context ?? globalThis;

  const tempKey = Symbol("myApply");
  context[tempKey] = this;

  // If no args array is provided, treat as empty
  const result = argsArray
    ? context[tempKey](...argsArray)
    : context[tempKey]();

  delete context[tempKey];
  return result;
};

// Test
function introduce(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

introduce.myApply(user, ["Hey", "!"]);  // Hey, I'm Naveen!
introduce.myApply(user);                 // undefined, I'm Naveenundefined
```

---

## Step 3 — `myBind`: Return a New Function

`bind` is different — it doesn't invoke the function. It returns a **new function** with `this` permanently bound.

The key behaviors:
1. Returns a new function
2. Supports partial application — arguments passed to `bind` are prepended
3. The bound function can be called with more arguments
4. A bound function cannot be re-bound

```js-exec
Function.prototype.myBind = function (context, ...boundArgs) {
  const originalFn = this;

  return function (...callArgs) {
    return originalFn.apply(context, [...boundArgs, ...callArgs]);
  };
};

// Test
function greet(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const boundHello = greet.myBind(user, "Hello");
boundHello("!");   // Hello, I'm Naveen!
boundHello(".");   // Hello, I'm Naveen.
```

---

## Step 4 — Edge Cases

**The interviewer will now say:** "What about primitive contexts? What about calling the bound function with `new`?"

### Primitive context values

When the context is a primitive (string, number, boolean), it should be wrapped in its object equivalent:

```js-exec
Function.prototype.myCall = function (context, ...args) {
  // Wrap primitives — mirrors native behavior
  if (context == null) {
    context = globalThis;
  } else if (typeof context !== "object" && typeof context !== "function") {
    context = Object(context);
  }

  const tempKey = Symbol("myCall");
  context[tempKey] = this;
  const result = context[tempKey](...args);
  delete context[tempKey];
  return result;
};

// Native call does this:
// "hello".toUpperCase()       → "HELLO"
// String.prototype.toUpperCase.myCall(5) → "5" (5 is wrapped as new Number(5))
```

### Bound function called with `new`

This is the tricky one. When a bound function is used as a constructor with `new`, the `this` binding should be ignored — the `new` keyword creates its own `this`. The native `bind` handles this:

```js-exec
Function.prototype.myBind = function (context, ...boundArgs) {
  const originalFn = this;

  function boundFn(...callArgs) {
    // If called with 'new', 'this' is an instance of boundFn — use it
    const actualContext = this instanceof boundFn
      ? this
      : context;
    return originalFn.apply(actualContext, [...boundArgs, ...callArgs]);
  }

  // Preserve the prototype chain for instanceof checks
  boundFn.prototype = Object.create(originalFn.prototype || Object.prototype);

  return boundFn;
};

// Test with new
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const BoundPerson = Person.myBind(null, "Naveen");
const p = new BoundPerson(25);
console.log(p.name);   // "Naveen"
console.log(p.age);    // 25
console.log(p instanceof Person);   // true
console.log(p instanceof BoundPerson);  // true
```

---

## Step 5 — Full Solution

```js-exec
// myCall — complete
Function.prototype.myCall = function (context, ...args) {
  if (context == null) {
    context = globalThis;
  } else if (typeof context !== "object" && typeof context !== "function") {
    context = Object(context);
  }
  const key = Symbol("myCall");
  context[key] = this;
  const result = context[key](...args);
  delete context[key];
  return result;
};

// myApply — complete
Function.prototype.myApply = function (context, argsArray) {
  if (context == null) {
    context = globalThis;
  } else if (typeof context !== "object" && typeof context !== "function") {
    context = Object(context);
  }
  const key = Symbol("myApply");
  context[key] = this;
  const result = argsArray ? context[key](...argsArray) : context[key]();
  delete context[key];
  return result;
};

// myBind — complete
Function.prototype.myBind = function (context, ...boundArgs) {
  const originalFn = this;
  function boundFn(...callArgs) {
    const actualContext = this instanceof boundFn ? this : context;
    return originalFn.apply(actualContext, [...boundArgs, ...callArgs]);
  }
  boundFn.prototype = Object.create(originalFn.prototype || Object.prototype);
  return boundFn;
};
```

---

## What Interviewers Are Testing

- **Implicit binding mechanic** — you understand the temp-property trick at the heart of `call`/`apply`
- **`Symbol` usage** — you know to use a unique key to avoid property collisions
- **Primitive handling** — you know primitives passed as context must be boxed with `Object()`
- **`bind` + `new` interaction** — you understand that `new` overrides the bound `this`
- **Prototype preservation** — you know to wire up `boundFn.prototype` so `instanceof` works

---

## Complexity

| | Time | Space |
|-|------|-------|
| `myCall` | O(1) | O(1) |
| `myApply` | O(1) | O(1) |
| `myBind` | O(1) — returns immediately | O(1) — closure captures reference |

---

## Interview Tips

- **Start with `call` first** — once you explain the temp-property trick, `apply` is trivial (just spread the array). This shows you see the pattern.
- **Mention `Symbol` unprompted** — saying "I'll use a Symbol to avoid property name collisions" shows you think about defensive coding.
- **Don't forget the return value** — `call` and `apply` must return whatever the function returns. Many candidates leave this out.
- **For `bind` + `new`, state "this gets complicated with the `new` keyword"** — even if you don't fully implement it, an interviewer will give you credit for knowing the edge case exists.

---

## Related Questions

- [#2 — Implement map(), filter() & reduce()](/articles/js-interview-map-filter-reduce)
- [#3 — Make Counter](/articles/js-interview-make-counter)
- [#4 — Implement once()](/articles/js-interview-once)
