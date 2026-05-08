ES6 `class` syntax is often called "syntactic sugar" over prototypes — but what does that actually mean? This article desugars every class feature (constructor, methods, getters/setters, static, extends, super, private fields) into plain ES5 prototype code.

**Prerequisites:** [JS Foundations #4 — Prototypes](/articles/javascript-series/js-prototypes-inheritance)

---

## 1. Basic Class → Constructor + Prototype

```js-exec
// ES6 class
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello, I'm ${this.name}`;
  }
}

const naveen = new Person("Naveen");
console.log(naveen.greet()); // "Hello, I'm Naveen"

// Desugars to:
function PersonES5(name) {
  this.name = name;
}

PersonES5.prototype.greet = function () {
  return `Hello, I'm ${this.name}`;
};

const karthik = new PersonES5("Karthik");
console.log(karthik.greet()); // "Hello, I'm Karthik"

// Verify they work the same:
console.log("Same prototype pattern:", naveen.__proto__ === Person.prototype); // true
```

Key differences between `class` and a plain `function` + prototype:

| | `class` | `function` |
|---|---|---|
| Called without `new` | TypeError | Works (but likely wrong) |
| Methods enumerable? | No | Yes (by default) |
| Body strict mode? | Always strict | Only with `"use strict"` |
| Hoisted? | No (TDZ) | Function declarations: yes |
| `super` available? | Yes | No |
| `arguments` in methods? | No (use rest params) | Yes |

These differences are why `class` isn't just syntax sugar — it enforces better practices.

---

## 2. Getters and Setters

```js-exec
// ES6 class with getter/setter
class User {
  constructor(firstName, lastName) {
    this._firstName = firstName;
    this._lastName = lastName;
  }

  get fullName() {
    return `${this._firstName} ${this._lastName}`;
  }

  set fullName(value) {
    [this._firstName, this._lastName] = value.split(" ");
  }
}

// Desugars to:
function UserES5(firstName, lastName) {
  this._firstName = firstName;
  this._lastName = lastName;
}

Object.defineProperty(UserES5.prototype, "fullName", {
  get: function () {
    return `${this._firstName} ${this._lastName}`;
  },
  set: function (value) {
    var parts = value.split(" ");
    this._firstName = parts[0];
    this._lastName = parts[1];
  },
  enumerable: false,
  configurable: true,
});

const user = new UserES5("Naveen", "Karthik");
console.log(user.fullName); // "Naveen Karthik"
user.fullName = "John Doe";
console.log(user._firstName); // "John"
```

---

## 3. Static Methods

```js-exec
// ES6
class MathUtils {
  static add(a, b) { return a + b; }
  static PI = 3.14159; // Static class field
}

// Desugars to:
function MathUtilsES5() {} // Empty constructor (or throw if you want to prevent `new`)

MathUtilsES5.add = function (a, b) {
  return a + b;
};
MathUtilsES5.PI = 3.14159;

console.log(MathUtilsES5.add(2, 3)); // 5
console.log(MathUtilsES5.PI);        // 3.14159
```

---

## 4. `extends` and `super` — The Full Desugar

```js-exec
// ES6 inheritance
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Required before using 'this'
    this.breed = breed;
  }

  speak() {
    return `${super.speak()} and barks!`;
  }
}

// Full desugar to ES5:
function AnimalES5(name) {
  this.name = name;
}
AnimalES5.prototype.speak = function () {
  return `${this.name} makes a sound`;
};

function DogES5(name, breed) {
  // Step 1: Call parent constructor with this = new Dog instance
  AnimalES5.call(this, name);
  this.breed = breed;
}

// Step 2: Set up prototype chain
DogES5.prototype = Object.create(AnimalES5.prototype);
DogES5.prototype.constructor = DogES5;

// Step 3: Override method + call parent
DogES5.prototype.speak = function () {
  return AnimalES5.prototype.speak.call(this) + " and barks!";
};

const rex = new DogES5("Rex", "Labrador");
console.log(rex.speak());        // "Rex makes a sound and barks!"
console.log(rex instanceof DogES5);   // true
console.log(rex instanceof AnimalES5); // true
```

---

## 5. Private Fields — `#` Syntax

Private fields use `WeakMap` under the hood in transpilation:

```js-exec
// ES6 private fields:
// class Counter {
//   #count = 0;
//   increment() { this.#count++; return this.#count; }
// }

// Desugared using WeakMap:
var Counter = (function () {
  var _count = new WeakMap();

  function Counter() {
    _count.set(this, 0); // Initialize private field
  }

  Counter.prototype.increment = function () {
    var current = _count.get(this);
    _count.set(this, current + 1);
    return _count.get(this);
  };

  return Counter;
})();

const c = new Counter();
console.log(c.increment()); // 1
console.log(c.increment()); // 2
console.log(c.count);       // undefined — truly private via WeakMap
```

---

## 6. Full Checklist — What Desugars to What

```js-exec
const checklist = `
class X {
  constructor() {}      →  function X() {}
  method() {}           →  X.prototype.method = function() {}
  get prop() {}         →  Object.defineProperty(X.prototype, 'prop', { get })
  set prop(v) {}        →  Object.defineProperty(X.prototype, 'prop', { set })
  static method() {}    →  X.method = function() {}
  static field = val    →  X.field = val
  #privateField         →  WeakMap (per instance private state)
}

class Y extends X {
  constructor() {        →  function Y() { X.call(this); }
    super()              →  (see above — must call before using this)
  }
}

Y.prototype = Object.create(X.prototype)  →  extends sets up prototype chain
`;

console.log(checklist);
```

---

## Key Takeaways

- `class` is a function — `typeof MyClass === "function"`.
- All methods go on `ClassName.prototype` — identical to ES5.
- `extends` sets up `Child.prototype = Object.create(Parent.prototype)`.
- `super()` is `Parent.call(this, ...)` in the constructor; `super.method()` is `Parent.prototype.method.call(this)`.
- Private fields (`#x`) transpile to `WeakMap`-based encapsulation.
- Static members attach to the constructor function itself, not the prototype.

---

**Next:** [V8 #3 — Deoptimization Patterns](/articles/javascript-series/js-deopt-patterns) — what specific code patterns cause TurboFan to bail out.
