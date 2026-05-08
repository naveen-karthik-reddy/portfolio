`Object.create(proto)` creates a new object with a specified prototype — the purest form of prototypal inheritance. `instanceof` checks if a constructor's `prototype` appears anywhere in an object's prototype chain. This article implements both from scratch.

**Prerequisites:** [JS Foundations #4 — Prototypes](/articles/javascript-series/js-prototypes-inheritance)

---

## 1. What `Object.create()` Does

Creates a new object and sets its `[[Prototype]]` to the provided object. Optionally accepts property descriptors:

```js-exec
const parent = {
  greet() {
    return `Hello, I'm ${this.name}`;
  },
};

const child = Object.create(parent);
child.name = "Naveen";

console.log(child.greet()); // "Hello, I'm Naveen"
console.log(child.__proto__ === parent); // true
console.log(parent.isPrototypeOf(child)); // true
```

---

## 2. Implementing `Object.create()` Polyfill

The simplest polyfill uses a temporary constructor:

```js-exec
function myObjectCreate(proto, propertiesObject) {
  if (proto === null || typeof proto !== "object" && typeof proto !== "function") {
    throw new TypeError("Object prototype may only be an Object or null");
  }

  // Create a temporary constructor
  function Temp() {}

  // Set its prototype to the provided prototype
  Temp.prototype = proto;

  // Create instance — its __proto__ becomes proto
  const obj = new Temp();

  // If propertiesObject is provided, define them
  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject);
  }

  return obj;
}

// Test
const parent = {
  sayHi() { return `Hi from parent!`; },
};

const child = myObjectCreate(parent, {
  name: {
    value: "Naveen",
    writable: true,
    enumerable: true,
    configurable: true,
  },
});

console.log(child.__proto__ === parent); // true
console.log(child.sayHi());              // "Hi from parent!"
console.log(child.name);                 // "Naveen"

// null prototype — no inherited properties at all
const pureDict = myObjectCreate(null);
console.log(pureDict.__proto__);         // undefined (or null in spec)
console.log(pureDict.toString);          // undefined — no Object.prototype!
```

---

## 3. What `instanceof` Does

`obj instanceof Constructor` checks whether `Constructor.prototype` appears anywhere in `obj`'s prototype chain:

```js-exec
function Animal() {}
function Dog() {}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const rex = new Dog();

console.log(rex instanceof Dog);     // true
console.log(rex instanceof Animal);  // true
console.log(rex instanceof Object);  // true
console.log(rex instanceof Array);   // false
```

---

## 4. Implementing `instanceof` — Walking the Prototype Chain

```js-exec
function myInstanceOf(obj, Constructor) {
  // Constructor must be a function (has a .prototype)
  if (typeof Constructor !== "function") {
    throw new TypeError("Right-hand side of instanceof is not callable");
  }

  // null and undefined return false — they have no prototype chain
  if (obj === null || obj === undefined) {
    return false;
  }

  // Get the prototype we're looking for
  const targetProto = Constructor.prototype;

  // Walk up obj's prototype chain
  let proto = Object.getPrototypeOf(obj);

  while (proto !== null) {
    if (proto === targetProto) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}

// Test
function A() {}
function B() {}
B.prototype = Object.create(A.prototype);

const b = new B();

console.log(myInstanceOf(b, B));      // true
console.log(myInstanceOf(b, A));      // true
console.log(myInstanceOf(b, Object)); // true
console.log(myInstanceOf(b, Array));  // false

// Primitives return false
console.log(myInstanceOf(42, Number));    // false
console.log(myInstanceOf("hi", String));  // false

// null and undefined
console.log(myInstanceOf(null, Object));    // false
console.log(myInstanceOf(undefined, Object)); // false
```

---

## 5. `Symbol.hasInstance` — Customizing `instanceof`

A constructor can override `instanceof` behavior via `Symbol.hasInstance`:

```js-exec
class RangeChecker {
  static [Symbol.hasInstance](value) {
    return typeof value === "number" && value >= 0 && value <= 100;
  }
}

console.log(50 instanceof RangeChecker);  // true
console.log(150 instanceof RangeChecker); // false
console.log("hi" instanceof RangeChecker); // false

// The engine calls RangeChecker[Symbol.hasInstance](value)
// If not defined, it falls back to the prototype chain walk
```

---

## 6. `isPrototypeOf()` — The Other Direction

Instead of `obj instanceof Ctor`, use `proto.isPrototypeOf(obj)`:

```js-exec
const parent = { x: 1 };
const child = Object.create(parent);

console.log(parent.isPrototypeOf(child)); // true
console.log(Object.prototype.isPrototypeOf(child)); // true

// Implementation is simple:
Object.prototype.myIsPrototypeOf = function (obj) {
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === this) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
};

console.log("myIsPrototypeOf:", parent.myIsPrototypeOf(child)); // true
```

---

## Key Takeaways

- `Object.create(proto)` uses a temporary constructor to link the new object's `__proto__`.
- `instanceof` walks the `[[Prototype]]` chain checking for `Constructor.prototype`.
- `Symbol.hasInstance` lets a function/class customize `instanceof` behavior.
- `isPrototypeOf()` is the equivalent check from the prototype's perspective.
- Both `instanceof` and `isPrototypeOf` are O(chain-length) — avoid deep chains in hot paths.

---

**Next:** [Symbols — Well-Known Symbols & Hidden Properties](/articles/javascript-series/js-symbols-in-depth) — every well-known symbol and how they control object behavior.
