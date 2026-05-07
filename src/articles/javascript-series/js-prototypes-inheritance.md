JavaScript uses prototypal inheritance, not classical inheritance. Every object has an internal `[[Prototype]]` link to another object. Understanding this chain — and the difference between `__proto__` and `prototype` — is the key to understanding how properties are looked up, how `new` works, and what `class` actually does.

**Prerequisites:** [JS Foundations #3 — Closures](/articles/javascript-series/js-closures-lexical-scope)

---

## 1. `__proto__` vs `prototype` — The Most Confused Concept

There are two different things that sound similar:

- **`__proto__`** (or `[[Prototype]]`): exists on **every object** — it's the link to the object it inherits from
- **`prototype`**: exists only on **functions** — it's the object that becomes the `__proto__` of instances created by `new`

```js-exec
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  return `Hello, I'm ${this.name}`;
};

const naveen = new Person("Naveen");

// naveen.__proto__ === Person.prototype
console.log(naveen.__proto__ === Person.prototype); // true

// Person.prototype is just a plain object
console.log(typeof Person.prototype); // "object"

// naveen doesn't own greet — it's on the prototype
console.log(naveen.hasOwnProperty("greet")); // false
console.log(naveen.hasOwnProperty("name"));  // true
```

The mental model:

```
naveen  ──.__proto__──→  Person.prototype  ──.__proto__──→  Object.prototype  ──.__proto__──→  null
  { name: "Naveen" }      { greet: fn }                      { hasOwnProperty, toString, ... }
```

---

## 2. The Prototype Chain — How Property Lookup Works

When you access `obj.prop`, the engine:
1. Looks on `obj` itself
2. If not found, looks on `obj.__proto__`
3. If not found, looks on `obj.__proto__.__proto__`
4. Continues until it reaches `null` — then returns `undefined`

```js-exec
const grandparent = {
  generation: "grandparent",
};
const parent = {
  generation: "parent",
  __proto__: grandparent,
};
const child = {
  __proto__: parent,
};

// Child has no 'generation' property of its own
console.log(child.generation);       // "parent" — found on parent
console.log(child.hasOwnProperty("generation")); // false — it's inherited

// parent has no 'toString', but it's on Object.prototype
console.log(child.toString());       // "[object Object]"
console.log(child.__proto__.__proto__.__proto__ === Object.prototype); // true
```

---

## 3. Setting Properties on the Prototype

Properties on the prototype are **shared** across all instances. Mutating a reference type on the prototype affects everyone:

```js-exec
function Team() {}
Team.prototype.members = [];

const a = new Team();
const b = new Team();

a.members.push("Alice");
console.log(b.members); // ["Alice"] — both share the SAME array!

// The fix: assign in the constructor, not on the prototype
function TeamFixed() {
  this.members = []; // Each instance gets its own array
}
TeamFixed.prototype.addMember = function (name) {
  this.members.push(name); // Uses the instance's own array
};

const c = new TeamFixed();
const d = new TeamFixed();
c.addMember("Alice");
console.log(c.members); // ["Alice"]
console.log(d.members); // [] — independent
```

---

## 4. What `new` Actually Does (Step by Step)

```js-exec
function Person(name) {
  this.name = name;
  // Implicit: return this
}

// We can implement 'new' ourselves:
function myNew(constructor, ...args) {
  // Step 1: Create a new empty object
  const obj = {};

  // Step 2: Link its __proto__ to constructor's prototype
  Object.setPrototypeOf(obj, constructor.prototype);
  // Equivalent to: obj.__proto__ = constructor.prototype;

  // Step 3: Call constructor with 'this' set to the new object
  const result = constructor.apply(obj, args);

  // Step 4: Return the object (or the constructor's explicit return if it's an object)
  return result instanceof Object ? result : obj;
}

const naveen = myNew(Person, "Naveen");
console.log(naveen.name);                    // "Naveen"
console.log(naveen instanceof Person);       // true
console.log(naveen.__proto__ === Person.prototype); // true
```

---

## 5. Constructor Property

Every `prototype` object has a `.constructor` property pointing back to the function:

```js-exec
function Dog(name) {
  this.name = name;
}

const rex = new Dog("Rex");

console.log(rex.constructor === Dog); // true — found on Dog.prototype
console.log(Dog.prototype.constructor === Dog); // true
```

This is easily broken if you overwrite `prototype` entirely:

```js-exec
function Cat(name) {
  this.name = name;
}

// ❌ Overwriting prototype breaks constructor
Cat.prototype = {
  meow() {
    console.log(this.name + " says meow");
  },
};

const whiskers = new Cat("Whiskers");
console.log(whiskers.constructor === Cat); // false — now it's Object
console.log(whiskers.constructor === Object); // true

// ✅ Fix: explicitly set constructor
Cat.prototype = {
  constructor: Cat,
  meow() {
    console.log(this.name + " says meow");
  },
};
```

---

## 6. Inheritance Without Classes

Before `class extends`, we built inheritance chains manually:

```js-exec
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound`;
};

function Dog(name, breed) {
  // Step 1: Call parent constructor
  Animal.call(this, name);
  this.breed = breed;
}

// Step 2: Create prototype chain
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog; // Fix constructor

// Step 3: Add child-specific methods
Dog.prototype.bark = function () {
  return `${this.name} barks!`;
};

const rex = new Dog("Rex", "Labrador");
console.log(rex.speak()); // "Rex makes a sound" — inherited from Animal
console.log(rex.bark());  // "Rex barks!" — Dog's own method
console.log(rex instanceof Dog);    // true
console.log(rex instanceof Animal); // true
```

The prototype chain we built:

```
rex  ──→  Dog.prototype  ──→  Animal.prototype  ──→  Object.prototype  ──→  null
```

---

## 7. `Object.create()` — The Purest Form of Prototypal Inheritance

You can create an object that inherits from another without any constructor function:

```js-exec
const parent = {
  greet() {
    return `Hello from ${this.name}`;
  },
};

const child = Object.create(parent);
child.name = "child";

console.log(child.greet()); // "Hello from child"
console.log(child.__proto__ === parent); // true
console.log(child.hasOwnProperty("greet")); // false — on parent
console.log("greet" in child); // true — found via prototype chain
```

---

## 8. `instanceof` — Checking the Prototype Chain

`obj instanceof Constructor` walks `obj.__proto__` up the chain and checks if it ever equals `Constructor.prototype`:

```js-exec
function A() {}
function B() {}

B.prototype = Object.create(A.prototype);
B.prototype.constructor = B;

const b = new B();

console.log(b instanceof B); // true — b.__proto__ === B.prototype
console.log(b instanceof A); // true — b.__proto__.__proto__ === A.prototype
console.log(b instanceof Object); // true — chain ends at Object.prototype
console.log(b instanceof Array);  // false — Array.prototype not in chain
```

---

## 9. `class` — Syntax Sugar Over Prototypes

Modern `class` syntax does the same thing under the hood:

```js-exec
// ES6 class
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
    super(name); // ≡ Animal.call(this, name)
    this.breed = breed;
  }
  bark() {
    return `${this.name} barks!`;
  }
}

const rex = new Dog("Rex", "Labrador");

// Everything is STILL prototype-based:
console.log(rex.__proto__ === Dog.prototype);     // true
console.log(Dog.prototype.__proto__ === Animal.prototype); // true
console.log(typeof Dog); // "function" — class is just a function
console.log(rex instanceof Dog);    // true
console.log(rex instanceof Animal); // true
```

---

## Key Takeaways

| Concept | Meaning |
|---|---|
| `__proto__` / `[[Prototype]]` | The link from an object to its parent — exists on EVERY object |
| `prototype` | The object that becomes `__proto__` for `new` instances — exists only on FUNCTIONS |
| `new` | Creates object, links `__proto__`, calls constructor, returns object |
| `Object.create(proto)` | Pure prototypal inheritance — no constructor needed |
| `instanceof` | Walks `__proto__` chain checking against `Constructor.prototype` |
| `class extends` | Syntax sugar — builds the same `__proto__` chain underneath |

- Properties are looked up by walking the `__proto__` chain until found or `null`.
- Don't put mutable reference types (arrays, objects) on `prototype` — they are shared.
- `Object.create(null)` creates an object with no prototype — useful for dictionaries.

---

**Next:** [JS Foundations #5 — Equality & Type Coercion](/articles/javascript-series/js-equality-coercion) — `==` vs `===`, the abstract equality algorithm, and why `[] == ![]` is `true`.
