`this` is the binding that confuses more developers than any other JS feature — because its value is determined by *how* a function is called, not where it's defined (except for arrow functions). Ten questions covering the four binding rules and the arrow function exception.

---

## Q1 — Default binding (non-strict)

```js-exec
function show() {
  // Note: In strict mode this would be undefined.
  // In browsers (non-strict), this === window.
  console.log(this === globalThis);
}
show();
```

<details>
<summary>Show answer</summary>

**Output:**
```
true
```

**Why:** When a regular function is called as a plain function call (no object, no `call`/`apply`/`bind`, not `new`), `this` defaults to the global object (`window` in browsers, `globalThis` in Node). In strict mode (`"use strict"`), default binding sets `this` to `undefined` instead.

</details>

---

## Q2 — Implicit binding

```js-exec
const obj = {
  name: "Alice",
  greet() {
    console.log(this.name);
  },
};

obj.greet();
```

<details>
<summary>Show answer</summary>

**Output:**
```
Alice
```

**Why:** When a function is called as a method on an object (`obj.greet()`), `this` is implicitly bound to the object to the left of the dot — `obj`. So `this.name` is `obj.name`, which is `"Alice"`.

</details>

---

## Q3 — Implicit binding lost on extraction

```js-exec
const obj = {
  name: "Alice",
  greet() {
    console.log(this.name);
  },
};

const fn = obj.greet;
fn();
```

<details>
<summary>Show answer</summary>

**Output:**
```
undefined
```

**Why:** `fn = obj.greet` copies the function reference but **loses the binding**. When `fn()` is called as a plain function (no object before the dot), `this` falls back to default binding — the global object in non-strict mode. `globalThis.name` is `undefined` (or an empty string in browsers). The method hasn't changed; only how it was called has changed.

</details>

---

## Q4 — Explicit binding with call

```js-exec
function greet() {
  console.log(this.name);
}

const user = { name: "Bob" };
greet.call(user);
```

<details>
<summary>Show answer</summary>

**Output:**
```
Bob
```

**Why:** `Function.prototype.call(thisArg, ...args)` explicitly sets `this` for that one invocation. `greet.call(user)` calls `greet` with `this === user`, so `this.name` is `"Bob"`.

</details>

---

## Q5 — Arrow function this

```js-exec
const obj = {
  name: "Carol",
  greet: () => {
    console.log(this === globalThis);
  },
};

obj.greet();
```

<details>
<summary>Show answer</summary>

**Output:**
```
true
```

**Why:** Arrow functions **do not have their own `this`**. They capture `this` from their enclosing lexical scope at the time they are *defined*. `greet` is defined at the top level (inside an object literal, but the object literal doesn't create a new scope), so the enclosing `this` is `globalThis`. Calling `obj.greet()` doesn't change anything — the object-method binding rule doesn't apply to arrow functions.

</details>

---

## Q6 — Arrow function inside a method

```js-exec
const obj = {
  name: "Dave",
  outer() {
    const inner = () => console.log(this.name);
    inner();
  },
};

obj.outer();
```

<details>
<summary>Show answer</summary>

**Output:**
```
Dave
```

**Why:** `outer` is a regular function — when called as `obj.outer()`, `this` is bound to `obj`. The arrow function `inner` is defined inside `outer`, so it inherits `this` from `outer`'s scope, which is `obj`. Calling `inner()` as a plain function doesn't override the inherited `this`.

</details>

---

## Q7 — bind creates a permanently bound function

```js-exec
function greet() {
  console.log(this.name);
}

const user = { name: "Eve" };
const other = { name: "Frank" };

const boundGreet = greet.bind(user);
boundGreet.call(other);
```

<details>
<summary>Show answer</summary>

**Output:**
```
Eve
```

**Why:** `bind` returns a new function with `this` permanently set to `user`. You cannot override the binding of a bound function with `call`, `apply`, or another `bind`. Even though `boundGreet.call(other)` tries to set `this` to `other`, the original `bind` wins.

</details>

---

## Q8 — Class method called as callback

```js-exec
class Timer {
  constructor() {
    this.count = 0;
  }
  tick() {
    this.count++;
    console.log(this.count);
  }
}

const t = new Timer();
const tick = t.tick;

try {
  tick();
} catch (e) {
  console.log(e.constructor.name);
}
```

<details>
<summary>Show answer</summary>

**Output:**
```
TypeError
```

**Why:** Class bodies run in strict mode. When `tick` is extracted and called as a plain function, `this` is `undefined` (strict mode default binding). Accessing `undefined.count` throws a `TypeError`. This is the common bug when passing class methods as callbacks (e.g., to `addEventListener` or `setTimeout`) without binding them first.

</details>

---

## Q9 — new binding

```js-exec
function Person(name) {
  this.name = name;
}

const p = new Person("Grace");
console.log(p.name);
console.log(p instanceof Person);
```

<details>
<summary>Show answer</summary>

**Output:**
```
Grace
true
```

**Why:** When a function is called with `new`, four things happen: a new object is created, `this` is bound to that new object, the function body runs (setting `this.name`), and the new object is returned implicitly (unless the function returns another object explicitly). `new` binding takes priority over all other binding rules.

</details>

---

## Q10 — Binding priority

```js-exec
function fn() {
  console.log(this.x);
}

const bound = fn.bind({ x: 1 });
const obj = { x: 2, fn: bound };

obj.fn();
new bound();
```

<details>
<summary>Show answer</summary>

**Output:**
```
1
undefined
```

**Why:** `obj.fn()` uses implicit binding (object-method call), but `bound` is already hard-bound via `.bind({ x: 1 })` — implicit binding loses to `bind`. So `this.x` is `1`. `new bound()` creates a brand new object for `this` — `new` *does* override `bind`'s target, so `this` is the freshly created empty object, which has no `x` property → `undefined`.

</details>

---

## Key Rules — Binding Priority (high → low)

| Priority | Rule | How |
|---|---|---|
| 1 | `new` binding | `new fn()` — `this` is the new object |
| 2 | Explicit binding | `fn.call(obj)`, `fn.apply(obj)`, `fn.bind(obj)()` |
| 3 | Implicit binding | `obj.fn()` — `this` is the object left of the dot |
| 4 | Default binding | `fn()` — `this` is `globalThis` (non-strict) or `undefined` (strict) |
| — | Arrow function | No own `this` — inherits from enclosing lexical scope |

---

## Go Deeper

- [JS Foundations #2 — this Demystified](/articles/js-this-demystified) — all four rules with detailed examples
- [Functions #1 — call(), apply() & bind() Polyfills](/articles/js-call-apply-bind) — implement these from scratch
- [Output Quiz #3 — The Event Loop & Task Ordering](/articles/js-output-event-loop) — the previous quiz
- [Output Quiz #5 — Type Coercion & Equality Traps](/articles/js-output-type-coercion) — the next quiz
