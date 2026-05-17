JavaScript classes are the modern way to create objects with shared methods. They're used in interview questions for data structures, event systems, and custom errors. This is a practical guide to class syntax and patterns — not the desugaring to prototypes.

**Related:** [Classes Under the Hood](/articles/js-classes-under-hood) desugars every class feature into ES5 prototypes.

---

## 1. Basic Class Syntax

```js-exec
class Counter {
  constructor(initial = 0) {
    this._count = initial;
  }

  increment() {
    this._count++;
    return this._count;
  }

  decrement() {
    this._count--;
    return this._count;
  }

  get value() {
    return this._count;
  }

  set value(v) {
    if (v < 0) throw new RangeError('Value cannot be negative');
    this._count = v;
  }

  static create() {
    return new Counter();
  }
}

const c = new Counter(5);
c.increment();
console.log(c.value);       // 6 (getter — no parentheses)
c.value = 10;               // setter
console.log(c.value);       // 10

// Static method — called on the class, not instances
const c2 = Counter.create();
console.log(c2.value);      // 0
```

**Key points:**
- `constructor` runs once on `new`
- Methods are on the prototype — shared across all instances
- Getters/setters look like properties but run code
- `static` methods are on the class itself

---

## 2. `extends` — Inheritance

```js-exec
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
    super(name);  // must call super() before using this
    this.breed = breed;
  }

  speak() {
    return `${this.name} the ${this.breed} barks`;
  }
}

const dog = new Dog('Rex', 'German Shepherd');
console.log(dog.speak());   // 'Rex the German Shepherd barks'
console.log(dog instanceof Dog);     // true
console.log(dog instanceof Animal);  // true
```

**Interview use**: Custom Error classes (`class TimeoutError extends Error`), extending EventEmitter.

---

## 3. Private Fields (ES2022)

Fields prefixed with `#` are truly private — not accessible outside the class:

```js-exec
class BankAccount {
  #balance = 0;       // private field with initial value
  #owner;             // private field without initial value

  constructor(owner) {
    this.#owner = owner;
  }

  deposit(amount) {
    this.#balance += amount;
    return this.#balance;
  }

  get balance() {
    return this.#balance;
  }
}

const account = new BankAccount('Alice');
account.deposit(100);
console.log(account.balance);  // 100
// console.log(account.#balance);  // SyntaxError: private field
// console.log(account.#owner);    // SyntaxError: private field
```

**Interview use**: True encapsulation in data structures (Map polyfill, LRU cache, EventEmitter).

---

## 4. `this` in Class Methods

Methods can lose their `this` context when passed as callbacks:

```js-exec
class Logger {
  constructor(prefix) {
    this.prefix = prefix;
  }

  log(msg) {
    console.log(`[${this.prefix}] ${msg}`);
  }
}

const logger = new Logger('INFO');
logger.log('hello');  // '[INFO] hello'

// Lost context — 'this' is undefined (strict mode)
const fn = logger.log;
// fn('hello');  // TypeError: Cannot read properties of undefined

// Fix 1: bind
const bound = logger.log.bind(logger);
bound('hello');  // '[INFO] hello'

// Fix 2: arrow function in constructor
class LoggerFixed {
  constructor(prefix) {
    this.prefix = prefix;
    this.log = (msg) => console.log(`[${this.prefix}] ${msg}`);
  }
}
const logger2 = new LoggerFixed('DEBUG');
const fn2 = logger2.log;
fn2('works');  // '[DEBUG] works'
```

**Trade-off**: Arrow-in-constructor creates a new function per instance. `bind` is more memory-efficient for many instances.

---

## 5. Instance vs Prototype Methods

```js-exec
class Example {
  constructor(val) {
    this.val = val;
    this.instanceMethod = () => this.val;  // per-instance
  }

  prototypeMethod() {  // shared on prototype
    return this.val;
  }
}

const a = new Example(1);
const b = new Example(2);

console.log(a.prototypeMethod === b.prototypeMethod); // true — shared
console.log(a.instanceMethod === b.instanceMethod);   // false — per instance
```

---

## 6. `instanceof` with Classes

```js-exec
class Base {}
class Derived extends Base {}

console.log(new Derived() instanceof Derived);  // true
console.log(new Derived() instanceof Base);     // true
console.log(new Derived() instanceof Object);   // true
console.log(new Base() instanceof Derived);     // false

// Symbol.hasInstance — override instanceof behavior
class Matcher {
  static [Symbol.hasInstance](instance) {
    return instance?.match !== undefined;
  }
}

console.log('hello' instanceof Matcher);  // true (strings have .match)
console.log(42 instanceof Matcher);       // false
```

**Interview use**: Type checking in deep clone (#28) — `value instanceof Date`, `value instanceof Map`.

---

## 7. Common Patterns

### Builder Pattern

```js-exec
class RequestBuilder {
  #url = '';
  #method = 'GET';
  #headers = {};

  url(value) { this.#url = value; return this; }
  method(value) { this.#method = value; return this; }
  header(key, value) { this.#headers[key] = value; return this; }

  build() {
    return { url: this.#url, method: this.#method, headers: { ...this.#headers } };
  }
}

const request = new RequestBuilder()
  .url('/api/users')
  .method('POST')
  .header('Content-Type', 'application/json')
  .build();

console.log(request);
```

### Registry / Factory

```js-exec
class EventRegistry {
  #events = new Map();

  register(name, handler) {
    this.#events.set(name, handler);
    return this;
  }

  dispatch(name, ...args) {
    const handler = this.#events.get(name);
    if (handler) return handler(...args);
  }

  remove(name) {
    this.#events.delete(name);
    return this;
  }
}

const registry = new EventRegistry();
registry.register('click', (x, y) => `Clicked at ${x}, ${y}`);
console.log(registry.dispatch('click', 10, 20));  // 'Clicked at 10, 20'
```

**Interview use**: EventEmitter (#22) — a class with `on`/`off`/`emit`/`once` methods.

---

## Quick Reference

| Feature | Syntax |
|-|-|
| Basic class | `class Name { constructor() {} method() {} }` |
| Getter | `get prop() { return ... }` |
| Setter | `set prop(v) { ... }` |
| Static method | `static method() {}` |
| Inheritance | `class Child extends Parent { ... }` |
| `super` call | `super(args)` in constructor |
| `super` method | `super.method()` |
| Private field | `#field` |
| Private method | `#method() {}` |
| instanceof | `obj instanceof Class` |

---

## Interview Tips

- **Call `super()` before `this`** — in a derived class constructor, `this` doesn't exist until `super()` runs.
- **Use private fields for true encapsulation** — the `#` prefix is real privacy, not convention.
- **Bind methods or use arrow fields** — if the method will be passed as a callback.
- **Use `instanceof` for type-safe error handling** — `catch (err) { if (err instanceof TimeoutError) ... }`.

---

## Related Articles

- [#22 — Implement an EventEmitter](/articles/js-interview-event-emitter)
- [#20 — Implement promiseTimeout()](/articles/js-interview-promise-timeout)
- [Classes Under the Hood](/articles/js-classes-under-hood)
- [JS Foundations #4 — Prototypes & Inheritance](/articles/js-prototypes-inheritance)
