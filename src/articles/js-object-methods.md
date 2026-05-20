JavaScript objects come with a set of static methods that let you inspect, create, copy, freeze, and iterate over objects. This is a practical reference for every `Object.*` method you'll reach for in interviews and real code.

---

## 1. `Object.keys(obj)` — Get Own Enumerable Keys

Returns an array of an object's **own enumerable** string-keyed property names.

```js-exec
const user = { id: 1, name: 'Alice', active: true };
console.log(Object.keys(user));  // ['id', 'name', 'active']

// Only own properties — NOT inherited ones
const parent = { inherited: true };
const child = Object.create(parent);
child.own = 'value';
console.log(Object.keys(child));  // ['own']
```

**Interview use**: Iterating over object properties, counting keys for deep comparison, filtering keys in deepOmit.

---

## 2. `Object.values(obj)` — Get Own Enumerable Values

Returns an array of values (same order as `Object.keys`).

```js-exec
const user = { id: 1, name: 'Alice', active: true };
console.log(Object.values(user));  // [1, 'Alice', true]
```

---

## 3. `Object.entries(obj)` — Get [key, value] Pairs

Returns an array of `[key, value]` pairs. Useful for iterating with destructuring.

```js-exec
const user = { id: 1, name: 'Alice' };

for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`);
}
// id: 1
// name: Alice

// Quick transform: swap keys and values
const swapped = Object.fromEntries(
  Object.entries(user).map(([k, v]) => [v, k])
);
console.log(swapped);  // { '1': 'id', Alice: 'name' }
```

**Interview use**: `classnames()` conditionally adds keys when values are truthy; `listFormat` style transformations.

---

## 4. `Object.fromEntries(entries)` — Array → Object

The reverse of `Object.entries`. Converts an iterable of `[key, value]` pairs into an object.

```js-exec
const entries = [['a', 1], ['b', 2], ['c', 3]];
console.log(Object.fromEntries(entries));  // { a: 1, b: 2, c: 3 }

// Convert Map to Object
const map = new Map([['x', 10], ['y', 20]]);
console.log(Object.fromEntries(map));  // { x: 10, y: 20 }
```

---

## 5. `Object.assign(target, ...sources)` — Copy Properties

Copies own enumerable properties from source objects to a target. Returns the target.

```js-exec
const target = { a: 1 };
const source = { b: 2, c: 3 };
Object.assign(target, source);
console.log(target);  // { a: 1, b: 2, c: 3 }

// Shallow merge — nested objects share references
const merged = Object.assign({}, { a: { deep: true } });
console.log(merged.a === { deep: true });  // false — but nested object IS shared

// Common pattern: clone + override defaults
const defaults = { theme: 'light', fontSize: 14 };
const userPrefs = { theme: 'dark' };
const config = Object.assign({}, defaults, userPrefs);
console.log(config);  // { theme: 'dark', fontSize: 14 }
```

**Interview use**: Merging default options, shallow cloning, overriding configs.

---

## 6. `Object.create(proto, descriptors?)` — Create with Custom Prototype

Creates a new object with the specified prototype and optional property descriptors.

```js-exec
const parent = { greet() { return `Hello, ${this.name}`; } };
const child = Object.create(parent, {
  name: { value: 'Alice', writable: true, enumerable: true }
});

console.log(child.name);       // 'Alice'
console.log(child.greet());    // 'Hello, Alice'
console.log(Object.getPrototypeOf(child) === parent);  // true
```

**Interview use**: Creating dictionaries without inherited properties (`Object.create(null)`), setting up prototype chains explicitly.

---

## 7. `Object.freeze(obj)` & `Object.seal(obj)` — Immutability

- **freeze**: No additions, deletions, or modifications. `writable` becomes `false`, `configurable` becomes `false`.
- **seal**: No additions or deletions, but existing properties can be modified. `configurable` becomes `false`.

```js-exec
const frozen = Object.freeze({ x: 1 });
frozen.x = 2;       // silently ignored (strict mode: TypeError)
frozen.y = 3;       // silently ignored
delete frozen.x;    // silently ignored
console.log(frozen); // { x: 1 }

const sealed = Object.seal({ x: 1 });
sealed.x = 2;       // OK — existing properties can change
sealed.y = 3;       // silently ignored — no new properties
console.log(sealed); // { x: 2 }

// Check status
console.log(Object.isFrozen(frozen));  // true
console.log(Object.isSealed(sealed));  // true
```

**Interview use**: Ensuring configuration objects aren't mutated accidentally.

---

## 8. `Object.defineProperty(obj, key, descriptor)` — Precise Control

Define or modify a property with fine-grained control over writability, enumerability, and configurability.

```js-exec
const obj = {};
Object.defineProperty(obj, 'secret', {
  value: 42,
  writable: false,
  enumerable: false,
  configurable: false
});

console.log(obj.secret);         // 42
console.log(Object.keys(obj));   // [] — not enumerable
obj.secret = 100;                // silently ignored
console.log(obj.secret);         // 42
```

---

## 9. `Object.prototype.hasOwnProperty(key)` — Own Property Check

Checks if a property exists **directly** on the object, not on the prototype chain.

```js-exec
const obj = { own: 1 };
console.log(obj.hasOwnProperty('own'));       // true
console.log(obj.hasOwnProperty('toString'));  // false — inherited

// Safer: call from Object.prototype (works even if hasOwnProperty is overridden)
console.log(Object.prototype.hasOwnProperty.call(obj, 'own'));  // true

// Or use the modern static method (ES2022)
console.log(Object.hasOwn(obj, 'own'));  // true
```

**Interview use**: Deep equality checks, filtering prototype properties during iteration.

---

## 10. `Object.prototype.toString.call(value)` — Reliable Type Check

Returns `[object Type]` — the most reliable way to determine a value's internal type.

```js-exec
const tag = (v) => Object.prototype.toString.call(v);

console.log(tag([]));             // '[object Array]'
console.log(tag({}));             // '[object Object]'
console.log(tag(null));           // '[object Null]'
console.log(tag(new Date()));     // '[object Date]'
console.log(tag(/regex/));        // '[object RegExp]'
console.log(tag(new Map()));      // '[object Map]'
console.log(tag(new Set()));      // '[object Set]'
console.log(tag(Promise.resolve())); // '[object Promise]'
```

**Interview use**: Type utilities (#5), distinguishing arrays from plain objects, cross-realm type checking.

---

## Quick Reference

| Method | What It Does |
|-|-|
| `Object.keys(o)` | Array of own enumerable string keys |
| `Object.values(o)` | Array of own enumerable values |
| `Object.entries(o)` | Array of `[key, value]` pairs |
| `Object.fromEntries(arr)` | Array of pairs → object |
| `Object.assign(t, ...s)` | Copy own properties into target |
| `Object.create(proto)` | New object with given prototype |
| `Object.freeze(o)` | Make immutable (shallow) |
| `Object.seal(o)` | Prevent add/delete, allow modify |
| `Object.isFrozen(o)` | Check frozen status |
| `Object.isSealed(o)` | Check sealed status |
| `Object.defineProperty(o, k, d)` | Precise property definition |
| `Object.hasOwn(o, k)` | Own-property check (modern) |
| `Object.getPrototypeOf(o)` | Get `[[Prototype]]` |
| `Object.getOwnPropertyNames(o)` | All own keys (including non-enumerable) |
| `Object.prototype.hasOwnProperty.call(o, k)` | Safe own-property check |
| `Object.prototype.toString.call(v)` | Reliable type tag |

---

## Related Articles

- [Implement deepClone()](/articles/js-interview-deep-clone-circular)
- [Implement deepEqual()](/articles/js-interview-deep-equal)
- [Data #3 — Map, Set, WeakMap, WeakSet](/articles/js-map-set-weakmap-weakset)
