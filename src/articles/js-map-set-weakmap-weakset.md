`Map` and `Set` solve problems that plain objects and arrays don't handle well. `WeakMap` and `WeakSet` enable memory-safe private data. This article implements polyfills for the first two, and explains all four with runnable examples.

**Prerequisites:** [JS Foundations #4 — Prototypes](/articles/javascript-series/js-prototypes-inheritance)

---

## 1. Why We Need `Map` — The Problems with Objects as Dictionaries

Plain objects have key limitations: keys are always strings (or Symbols), and inherited properties collide with data:

```js-exec
const obj = {};
obj["toString"] = "hello";
console.log(obj.toString); // function toString() — not "hello"! Inherited property wins.
console.log(obj["toString"]); // "hello" — bracket access works

// Object.create(null) avoids inheritance, but still forces string keys:
const dict = Object.create(null);
const key = {};
dict[key] = "value"; // key toString'd to "[object Object]"

const key2 = {};
dict[key2] = "value2";
console.log(dict[key]); // "value2" — overwritten! Both keys stringify the same.
```

`Map` fixes this: any value (object, function, number) can be a key, and keys don't collide with inherited properties.

---

## 2. Implementing a Simple `Map` Polyfill

```js-exec
class MyMap {
  constructor(entries = []) {
    this._keys = [];
    this._values = [];

    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }

  get size() {
    return this._keys.length;
  }

  set(key, value) {
    // Linear search — O(n). Real Map uses hashing for O(1).
    const index = this._keys.findIndex((k) => this._sameKey(k, key));
    if (index !== -1) {
      this._values[index] = value; // Update existing
    } else {
      this._keys.push(key);
      this._values.push(value);
    }
    return this;
  }

  get(key) {
    const index = this._keys.findIndex((k) => this._sameKey(k, key));
    return index !== -1 ? this._values[index] : undefined;
  }

  has(key) {
    return this._keys.some((k) => this._sameKey(k, key));
  }

  delete(key) {
    const index = this._keys.findIndex((k) => this._sameKey(k, key));
    if (index === -1) return false;
    this._keys.splice(index, 1);
    this._values.splice(index, 1);
    return true;
  }

  clear() {
    this._keys.length = 0;
    this._values.length = 0;
  }

  forEach(callback, thisArg) {
    for (let i = 0; i < this._keys.length; i++) {
      callback.call(thisArg, this._values[i], this._keys[i], this);
    }
  }

  keys() {
    return this._keys[Symbol.iterator]();
  }

  values() {
    return this._values[Symbol.iterator]();
  }

  *entries() {
    for (let i = 0; i < this._keys.length; i++) {
      yield [this._keys[i], this._values[i]];
    }
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  // Handle NaN key identity (NaN !== NaN but Map treats NaN as equals)
  _sameKey(a, b) {
    return Object.is(a, b) || (Number.isNaN(a) && Number.isNaN(b));
  }
}

// Test
const map = new MyMap();
const objKey = { id: 1 };
const fnKey = function () {};

map.set("string", 1);
map.set(42, 2);
map.set(objKey, 3);
map.set(fnKey, 4);

console.log("Size:", map.size);                // 4
console.log("Get string:", map.get("string")); // 1
console.log("Get object:", map.get(objKey));   // 3
console.log("Has fn:", map.has(fnKey));        // true
```

---

## 3. `Set` — Unique Values

A `Set` stores unique values — duplicates are ignored:

```js-exec
class MySet {
  constructor(values = []) {
    this._data = [];

    for (const value of values) {
      this.add(value);
    }
  }

  get size() {
    return this._data.length;
  }

  add(value) {
    if (!this._data.some((v) => this._sameValue(v, value))) {
      this._data.push(value);
    }
    return this;
  }

  has(value) {
    return this._data.some((v) => this._sameValue(v, value));
  }

  delete(value) {
    const index = this._data.findIndex((v) => this._sameValue(v, value));
    if (index === -1) return false;
    this._data.splice(index, 1);
    return true;
  }

  clear() {
    this._data.length = 0;
  }

  forEach(callback, thisArg) {
    this._data.forEach((val) => callback.call(thisArg, val, val, this));
  }

  keys() { return this._data[Symbol.iterator](); }
  values() { return this._data[Symbol.iterator](); }
  entries() { return this._data.map((v) => [v, v])[Symbol.iterator](); }

  [Symbol.iterator]() { return this._data[Symbol.iterator](); }

  _sameValue(a, b) {
    return Object.is(a, b) || (Number.isNaN(a) && Number.isNaN(b));
  }
}

// Test
const set = new MySet([1, 2, 2, 3, 3, 3]);
console.log("Set:", [...set]); // [1, 2, 3] — duplicates removed
console.log("Has 2:", set.has(2)); // true
console.log("Size:", set.size); // 3

// Common use: dedup an array
const dupes = [1, 1, 2, 3, 2, 4, 5, 5];
const unique = [...new MySet(dupes)];
console.log("Deduped:", unique); // [1, 2, 3, 4, 5]
```

---

## 4. `WeakMap` — Garbage-Collectable Keys

`WeakMap` keys must be objects, and they're held **weakly** — if nothing else references the key, the entry is garbage collected. You can't iterate over a WeakMap:

```js-exec
// WeakMap use case: private data associated with DOM elements
// In real code:
// const elementData = new WeakMap();
// elementData.set(domElement, { clicks: 0, lastClick: null });

// Simulating the concept:
let obj = { name: "temp" };
const wm = new WeakMap();
wm.set(obj, "private data");

console.log("Has before GC:", wm.has(obj)); // true

// When obj is no longer referenced, the WeakMap entry is eligible for GC
obj = null; // Now the entry can be collected

// WeakMap is NOT iterable:
// for (const [k, v] of wm) {} // TypeError
// console.log(wm.size); // undefined
```

The main use case: storing private data associated with an object without preventing its garbage collection. This is how `#private` fields are polyfilled.

---

## 5. `WeakSet` — Weak Collection of Objects

Like `WeakMap`, `WeakSet` only stores objects weakly — no iteration, no size:

```js-exec
const ws = new WeakSet();

const user1 = { name: "Alice" };
const user2 = { name: "Bob" };

ws.add(user1);
ws.add(user2);

console.log("Has user1:", ws.has(user1)); // true
console.log("Has user2:", ws.has(user2)); // true

user1 = null; // Eligible for GC — WeakSet entry can be collected

// Use case: "visited" markers on DOM elements for event handling
// const visited = new WeakSet();
// visited.add(someElement);
// if (visited.has(someElement)) { /* already processed */ }
```

---

## 6. Quick Comparison

```js-exec
console.log("│ Structure  │ Keys          │ Iterable? │ GC-safe?  │");
console.log("│------------│---------------│-----------│-----------│");
console.log("│ Map        │ Any value     │ Yes       │ No        │");
console.log("│ Set        │ Values only   │ Yes       │ No        │");
console.log("│ WeakMap    │ Objects only  │ No        │ Yes       │");
console.log("│ WeakSet    │ Objects only  │ No        │ Yes       │");
```

---

## Key Takeaways

- `Map` allows **any type as keys** and preserves insertion order.
- `Set` stores **unique values** — ideal for deduplication.
- `WeakMap` holds **objects weakly** — use for private data tied to an object's lifetime.
- `WeakMap` and `WeakSet` are **not iterable** and have no `size` — by design.
- `WeakMap` is the ES6 replacement for `Object.create(null)` with stronger guarantees.

---

**Next:** [Prototypes #2 — `Object.create()` & `instanceof` Polyfills](/articles/javascript-series/js-object-create-instanceof) — implement both from scratch.
