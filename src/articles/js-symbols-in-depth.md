Symbols are the 7th primitive type in JavaScript. They solve a concrete problem: **guaranteed-unique property keys.**

Before Symbols, if two libraries both added a property called `"id"` to the same object, one would silently overwrite the other. The workaround was ugly prefixed strings like `"__myLib_id_abc123"`. Symbols fix this: `Symbol("id")` is never equal to another `Symbol("id")`, so collisions are impossible.

Beyond unique keys, Symbols also let you hook into JavaScript's internal protocols through **well-known symbols** — making objects iterable, controlling type coercion, customizing `instanceof`, and more. This article covers both aspects.

**Prerequisites:** [JS Foundations #4 — Prototypes](/articles/javascript-series/js-prototypes-inheritance)

---

## 1. Creating Symbols — Guaranteed Unique

Every `Symbol()` call returns a completely unique value — even if you give them the same description:

```js-exec
const s1 = Symbol("id");
const s2 = Symbol("id");

console.log(s1 === s2);        // false — every Symbol is unique
console.log(s1.description);   // "id"
console.log(typeof s1);        // "symbol"

// Symbols are NOT auto-converted to strings
// console.log("ID: " + s1);   // TypeError
console.log("ID:", String(s1)); // Must explicitly convert
```

---

## 2. Symbols as Object Keys — Hidden Properties

Symbol-keyed properties don't appear in `Object.keys()`, `for...in`, or `JSON.stringify()`:

```js-exec
const id = Symbol("id");
const user = {
  name: "Naveen",
  [id]: 42, // Symbol key
};

console.log("Object.keys:", Object.keys(user)); // ["name"] — Symbol key hidden
console.log("for...in:"); for (const k in user) console.log(" ", k); // Only "name"
console.log("JSON:", JSON.stringify(user)); // {"name":"Naveen"}

// But it IS accessible:
console.log("Symbol property:", user[id]); // 42
console.log("GetOwnPropertySymbols:", Object.getOwnPropertySymbols(user)); // [Symbol(id)]
```

This makes them useful for "soft" private properties — not truly private (still accessible via `getOwnPropertySymbols`), but hidden from casual iteration.

---

## 3. Global Symbol Registry — `Symbol.for()` and `Symbol.keyFor()`

The global symbol registry lets you share symbols across realms/frames:

```js-exec
const global1 = Symbol.for("app.id");
const global2 = Symbol.for("app.id");

console.log(global1 === global2); // true — same global symbol
console.log(Symbol.keyFor(global1)); // "app.id"

// Regular Symbol() is NOT in the registry
const local = Symbol("test");
console.log(Symbol.keyFor(local)); // undefined
```

---

## 4. Well-Known Symbols — Hooking Into JavaScript

JavaScript uses well-known symbols to let you customize object behavior:

### `Symbol.iterator` — Make Objects Iterable

```js-exec
const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let current = this.from;
    return { next: () => current <= this.to ? { value: current++, done: false } : { value: undefined, done: true } };
  },
};

console.log([...range]); // [1, 2, 3]
```

### `Symbol.toPrimitive` — Control Type Coercion

```js-exec
const money = {
  amount: 42.5,
  currency: "USD",
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.amount;
    if (hint === "string") return `${this.currency} ${this.amount}`;
    return `${this.amount} ${this.currency}`; // default
  },
};

console.log(+money);       // 42.5 (number hint)
console.log(`${money}`);   // "USD 42.5" (string hint)
console.log(money + "");   // "42.5 USD" (default hint)
```

### `Symbol.toStringTag` — Custom `Object.prototype.toString()`

```js-exec
class CustomError {
  get [Symbol.toStringTag]() { return "CustomError"; }
}

console.log(Object.prototype.toString.call(new CustomError())); // "[object CustomError]"
```

### `Symbol.hasInstance` — Custom `instanceof`

```js-exec
const Even = {
  [Symbol.hasInstance](n) { return n % 2 === 0; },
};

console.log(4 instanceof Even);  // true
console.log(5 instanceof Even);  // false
```

---

## 5. All Well-Known Symbols at a Glance

```js-exec
const symbols = {
  "Symbol.iterator": "Makes an object iterable (for...of)",
  "Symbol.asyncIterator": "Makes an object async iterable (for await...of)",
  "Symbol.toPrimitive": "Controls conversion to primitive",
  "Symbol.toStringTag": "Custom toString() tag",
  "Symbol.hasInstance": "Custom instanceof behavior",
  "Symbol.isConcatSpreadable": "Controls Array.concat spreading",
  "Symbol.species": "Controls derived object constructor",
  "Symbol.match / replace / search / split": "Custom regexp-like behavior",
  "Symbol.unscopables": "Excludes properties from 'with' binding",
};

for (const [sym, desc] of Object.entries(symbols)) {
  console.log(`  ${sym.padEnd(28)} — ${desc}`);
}
```

---

## Key Takeaways

- **Symbols are unique** — `Symbol("x") !== Symbol("x")`. Use them for non-colliding keys.
- Symbol-keyed properties are **hidden from `Object.keys()`, `for...in`, and `JSON.stringify()`**.
- Use `Symbol.for("key")` for shared global symbols; `Symbol.keyFor()` to retrieve the key.
- **Well-known symbols** let you hook into JavaScript's built-in protocols — iterator, coercion, instanceof, string tags.
- `Symbol.toPrimitive` is the most powerful control over how your object behaves in `+`, `${}`, and numeric contexts.

---

**Next:** [Proxy & Reflect — Validation, Observables & Traps](/articles/javascript-series/js-proxy-reflect-api) — intercept fundamental operations with all 13 proxy traps.
