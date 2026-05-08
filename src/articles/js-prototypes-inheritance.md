JavaScript uses prototypal inheritance, not classical inheritance. Every object has an internal `[[Prototype]]` link to another object.

**Think of prototypes like looking up a word in a family of dictionaries.** You first check your own dictionary (the object itself). If the word isn't there, you check your parent's dictionary. Then your grandparent's. You keep going up the chain until you find the definition — or run out of dictionaries. This is exactly how property lookup works in JavaScript.

Understanding this chain — and the difference between `__proto__` and `prototype` — is the key to understanding how properties are looked up, how `new` works, and what `class` actually does.

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

// `hasOwnProperty` checks if a property lives directly on the object
// (not inherited via the prototype chain)
console.log(naveen.hasOwnProperty("greet")); // false — it's inherited
console.log(naveen.hasOwnProperty("name"));  // true — directly on naveen

// Modern code prefers Object.getPrototypeOf() over .__proto__
console.log(Object.getPrototypeOf(naveen) === Person.prototype); // true
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

  // Step 3: Call constructor with 'this' set to the new object
  const result = constructor.apply(obj, args);

  // Step 4: Return the object (or the constructor's explicit return if it's an object)
  return result instanceof Object ? result : obj;
}

const naveen = myNew(Person, "Naveen");
console.log(naveen.name);                    // "Naveen"
console.log(naveen instanceof Person);       // true
console.log(naveen.__proto__ === Person.prototype); // true

// Edge case: if the constructor explicitly returns an object, new returns THAT object
function Trick() {
  this.ignored = true;
  return { override: "I win!" };
}

const t = new Trick();
console.log(t.ignored); // undefined — the returned object replaced 'this'
console.log(t.override); // "I win!"
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

## 9. `for...in` vs `hasOwnProperty` — Why It Matters

`for...in` loops over **all enumerable properties**, including inherited ones. Use `hasOwnProperty` to filter them out:

```js-exec
const parent = { inherited: "from parent" };
const child = Object.create(parent);
child.own = "from child";

console.log("for...in (includes inherited):");
for (const key in child) {
  console.log(" ", key); // "own", "inherited"
}

console.log("Own properties only:");
for (const key in child) {
  if (child.hasOwnProperty(key)) {
    console.log(" ", key); // "own" only
  }
}
```

Always guard `for...in` with `hasOwnProperty` unless you specifically want inherited properties.

---

## 10. `Object.create(null)` — An Object with No Prototype

Sometimes you want a plain dictionary without any inherited baggage (no `toString`, `hasOwnProperty`, etc.):

```js-exec
const dict = Object.create(null);
dict.apple = "fruit";
dict.carrot = "vegetable";

console.log(dict.toString); // undefined — no Object.prototype!
console.log(dict.hasOwnProperty); // undefined — no inherited methods
console.log("apple" in dict); // true — 'in' still works for checking keys
console.log(Object.keys(dict)); // ["apple", "carrot"] — works fine
```

This is useful for lookup maps where keys might collide with built-in method names (like `toString`, `constructor`, `__proto__`).

---

## 11. `class` — Syntax Sugar Over Prototypes

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
