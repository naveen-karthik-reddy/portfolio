No keyword confuses JavaScript developers more than `this`. It's not the function itself, not the scope, and — in regular functions — not even determined until the call site. This article covers the four binding rules, arrow functions, and every gotcha.

**Prerequisites:** [JS Foundations #1 — Variables, Scope & Hoisting](/articles/javascript-series/js-variables-scope-hoisting)

---

## 1. What `this` Is NOT

Before learning what `this` is, clear two misconceptions:

- `this` is **not** the function itself
- `this` is **not** the function's lexical scope

`this` is a **runtime binding** — its value depends entirely on *how* the function is called, not where it's defined (arrow functions are the exception).

```js-exec
function showThis() {
  console.log(this);
}

// Called as a standalone function → this is the global object (window)
// In strict mode it would be undefined
showThis();
```

---

## 2. The Four Binding Rules

There are exactly four rules that determine `this`, in order of precedence:

### Rule 1: Default Binding (lowest priority)

When a function is called standalone, `this` defaults to:
- **Non-strict mode:** the global object (`window` / `globalThis`)
- **Strict mode:** `undefined`

```js-exec
function defaultDemo() {
  "use strict";
  console.log(this); // undefined
}

defaultDemo();

function nonStrictDemo() {
  console.log(this === globalThis); // true (in non-strict mode)
}

// Calling non-strict through eval to avoid inheriting strict from the module
// In a module, this function would be in strict mode by default
```

---

### Rule 2: Implicit Binding

When a function is called as a **method of an object**, `this` points to that object — the one directly before the dot.

```js-exec
const user = {
  name: "Naveen",
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  },
};

user.greet(); // this → user
```

The key detail: `this` binds to the **immediate** owning object:

```js-exec
const outer = {
  name: "outer",
  inner: {
    name: "inner",
    whoAmI() {
      console.log(this.name);
    },
  },
};

outer.inner.whoAmI(); // "inner" — the object directly before the dot
```

**Implicit loss** — extracting a method from its object loses the binding:

```js-exec
const obj = {
  name: "Naveen",
  sayName() {
    console.log(this.name);
  },
};

const extracted = obj.sayName; // Just the function, detached from obj
extracted(); // undefined (or error in strict mode) — this is now global/undefined
```

This is the most common `this` bug. Callbacks suffer from the same problem:

```js-exec
const user = {
  name: "Naveen",
  delayedGreet() {
    setTimeout(function () {
      console.log("setTimeout this.name:", this.name);
    }, 100);
  },
};

user.delayedGreet(); // undefined — the setTimeout callback runs as a standalone call
```

The fix (before arrow functions) was explicit binding.

---

### Rule 3: Explicit Binding — `call`, `apply`, `bind`

You can force `this` to be whatever you want using these three methods:

```js-exec
function greet(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person = { name: "Naveen" };

// call — passes arguments individually
greet.call(person, "Hello", "!");

// apply — passes arguments as an array
greet.apply(person, ["Hi", "."]);

// bind — returns a new function with this permanently fixed
const boundGreet = greet.bind(person, "Hey");
boundGreet("!!"); // "Hey, I'm Naveen!!"
// boundGreet.call({ name: "Other" }, "Try"); // Still "Naveen" — bind is permanent!
```

**`bind` is permanent** — once bound, `this` cannot be overridden, even with `call` or `apply`:

```js-exec
function identify() {
  console.log(this.name);
}

const a = { name: "Alice" };
const b = { name: "Bob" };

const boundToA = identify.bind(a);  // Permanently bound
boundToA();                              // "Alice"
boundToA.call(b);                        // Still "Alice" — bind wins!
```

---

### Rule 4: `new` Binding (highest priority)

When you call a function with `new`, JavaScript creates a brand new object and sets it as `this`:

```js-exec
function Person(name) {
  // Behind the scenes: this = {} (new empty object)
  this.name = name;
  // Behind the scenes: return this
}

const naveen = new Person("Naveen");
const karthik = new Person("Karthik");

console.log(naveen.name); // Naveen
console.log(karthik.name); // Karthik
```

What `new` actually does:
1. Creates a fresh empty object
2. Links that object's `__proto__` to the constructor's `prototype`
3. Calls the constructor with `this` set to that object
4. Returns the object (unless the constructor returns a non-null object)

---

## 3. Precedence Order — Tested on the Hardest Case

The priority is: **`new` → explicit (`call`/`apply`/`bind`) → implicit → default**

```js-exec
function show() {
  console.log(this.priority);
}

const obj1 = { priority: "implicit", show };
const obj2 = { priority: "explicit" };

obj1.show();                      // "implicit" — rule 2
obj1.show.call(obj2);             // "explicit" — rule 3 beats rule 2

const Bound = show.bind(obj1);    // rule 3
const instance = new Bound();     // "undefined" — rule 1 wins! bind lost to new
// Wait, what? Let's test again...

function ShowPriority() {
  console.log(this.name);
}

ShowPriority.prototype.name = "prototype";

const BoundShow = ShowPriority.bind({ name: "explicit bind" });
const b = new BoundShow(); // Prints "prototype" — new overrides bind!
```

When `new` is used on a bound function, `new` wins. The bound `this` is ignored in favor of the newly created object.

---

## 4. Arrow Functions — The Exception to Everything

Arrow functions **do not have their own `this`**. They inherit `this` from their enclosing lexical scope — exactly like a variable would. This is the single most important fact about arrows.

```js-exec
const user = {
  name: "Naveen",
  delayedGreet() {
    // Arrow inherits 'this' from delayedGreet's scope
    // delayedGreet was called as user.delayedGreet(), so this → user
    setTimeout(() => {
      console.log("Arrow this.name:", this.name);
    }, 100);
  },
};

user.delayedGreet(); // "Naveen" — arrow captures the right this!
```

Arrows **cannot** be bound — `call`, `apply`, and `bind` have no effect on them:

```js-exec
const arrow = () => console.log(this.name);

const obj = { name: "test" };

arrow();              // undefined (inherits from outer scope)
arrow.call(obj);      // Still undefined — call is ignored on arrows
arrow.apply(obj);     // Still undefined — apply is ignored on arrows
arrow.bind(obj)();    // Still undefined — bind is ignored on arrows
```

This is why arrow functions make terrible object methods:

```js-exec
const badIdea = {
  name: "Naveen",
  greet: () => {
    console.log(this.name); // this is NOT badIdea — it's whatever was outside
  },
};

badIdea.greet(); // undefined — arrow as method = wrong this
```

---

## 5. `this` in Classes

In classes, methods use implicit binding — `this` is the instance. But callbacks still lose `this` unless you bind:

```js-exec
class Counter {
  constructor() {
    this.count = 0;

    // Fix 1: bind in constructor
    this.boundIncrement = this.increment.bind(this);
  }

  increment() {
    this.count++;
    console.log(this.count);
  }

  // Fix 2: class field as arrow (modern, common pattern)
  arrowIncrement = () => {
    this.count++;
    console.log(this.count);
  };
}

const c = new Counter();
const { increment, boundIncrement, arrowIncrement } = c;

try {
  increment(); // TypeError — this is undefined in strict mode class body
} catch (e) {
  console.log("Unbound method:", e.message);
}

boundIncrement();   // ✅ 1 — manually bound
arrowIncrement();   // ✅ 2 — arrow captures instance from constructor
```

---

## 6. `this` in Event Handlers

In DOM event handlers, `this` is the element that received the event:

```js-exec
// Simulate a DOM event handler pattern
const button = {
  text: "Click Me",
  addHandler(handler) {
    // Simulating: element.addEventListener('click', handler)
    handler.call({ type: "click", target: button }); // this → the event-like object
  },
};

button.addHandler(function () {
  console.log("In handler, this.target:", this.target?.text);
});

button.addHandler(() => {
  console.log("Arrow handler, this:", this === undefined ? "lexical scope" : "button");
});
```

---

## 7. Quick Reference — The Four Rules

```js-exec
function identify() {
  console.log("this →", this?.name ?? this?.constructor?.name ?? this);
}

const obj = { name: "obj", identify };
const bound = identify.bind({ name: "bound" });

// Default binding
identify(); // this → global / undefined (strict)

// Implicit binding
obj.identify(); // this → obj

// Explicit binding
identify.call({ name: "explicit" }); // this → explicit
bound(); // this → bound

// Arrow functions — inherit from enclosing scope
const arrow = () => console.log("arrow this →", this?.name ?? "outer scope");
arrow(); // ignores all the rules above
```

---

## Key Takeaways

| Rule | Trigger | Priority |
|---|---|---|
| `new` | Called with `new` keyword | Highest |
| Explicit | `call` / `apply` / `bind` | High |
| Implicit | `obj.method()` — dot before call | Medium |
| Default | Standalone call | Lowest |

- **Arrow functions** break all rules — they inherit `this` lexically.
- **`bind` is permanent** — but `new` still overrides it.
- **Implicit loss** (extracting a method) is the #1 `this` bug.
- Use **arrows for callbacks**, **regular functions / class methods for methods**.

---

**Next:** [JS Foundations #3 — Closures & Lexical Scope](/articles/javascript-series/js-closures-lexical-scope) — how inner functions remember their outer scope variables, and why that powers everything from module patterns to memoization.
