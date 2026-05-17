`Map` is JavaScript's true key-value data structure. Unlike objects, Map keys can be any type — objects, functions, numbers — and entries stay in insertion order. It's used in interviews for caches, frequency counters, event listeners, and anywhere you need a reliable dictionary.

**Related:** [Data #3 — Map, Set, WeakMap, WeakSet Polyfills](/articles/js-map-set-weakmap-weakset) implements Map from scratch.

---

## 1. Why Map Over Object?

Objects have three problems as dictionaries:

```js-exec
// Problem 1: Keys are always strings
const obj = {};
const key1 = {};
const key2 = {};
obj[key1] = 'value1';
obj[key2] = 'value2';
console.log(obj[key1]);  // 'value2' — both keys stringify to '[object Object]'

// Problem 2: Inherited properties collide
const dict = {};
dict['toString'] = 'custom';
console.log(typeof dict.toString);  // 'function' — inherited, not your value

// Problem 3: No size property
console.log(Object.keys(dict).length);  // have to call Object.keys()

// Map solves all three:
const map = new Map();
map.set(key1, 'value1');
map.set(key2, 'value2');
console.log(map.get(key1));  // 'value1' — different keys!
console.log(map.get(key2));  // 'value2'
console.log(map.size);       // 2
console.log(map.get('toString'));  // undefined — no collision
```

---

## 2. Creating a Map

```js-exec
// Empty
const empty = new Map();

// From array of [key, value] pairs
const map = new Map([
  ['name', 'Alice'],
  ['age', 30],
  [true, 'boolean key'],
  [{ id: 1 }, 'object key'],
]);

console.log(map.size);  // 4

// Clone
const clone = new Map(map);
console.log(clone.get('name'));  // 'Alice'
```

---

## 3. Basic Operations

```js-exec
const map = new Map();

// Set — add or update
map.set('a', 1);
map.set('b', 2);
map.set('a', 10);  // overwrites
console.log(map.size);  // 2

// Get
console.log(map.get('a'));    // 10
console.log(map.get('z'));    // undefined (key doesn't exist)

// Has
console.log(map.has('a'));    // true
console.log(map.has('z'));    // false

// Delete
map.delete('b');
console.log(map.has('b'));    // false

// Clear
map.clear();
console.log(map.size);        // 0
```

---

## 4. Iteration

Map is iterable and preserves insertion order:

```js-exec
const map = new Map([
  ['first', 1],
  ['second', 2],
  ['third', 3],
]);

// forEach
map.forEach((value, key) => console.log(`${key}: ${value}`));

// for...of with destructuring
for (const [key, value] of map) {
  console.log(`${key} → ${value}`);
}

// Iterate keys
console.log([...map.keys()]);    // ['first', 'second', 'third']

// Iterate values
console.log([...map.values()]);  // [1, 2, 3]

// Iterate entries
console.log([...map.entries()]); // [['first', 1], ['second', 2], ['third', 3]]

// Convert to array
console.log([...map]);           // same as entries()
```

---

## 5. Object Keys

Object keys use reference equality — same reference = same key:

```js-exec
const map = new Map();
const key = { id: 1 };

map.set(key, 'value');
console.log(map.get(key));        // 'value'
console.log(map.get({ id: 1 }));  // undefined — different reference!
```

This is why Map is perfect for storing metadata about objects without modifying the objects themselves:

```js-exec
const users = [{ name: 'Alice' }, { name: 'Bob' }];
const metadata = new Map();

metadata.set(users[0], { lastLogin: Date.now(), visits: 5 });
metadata.set(users[1], { lastLogin: Date.now(), visits: 12 });

console.log(metadata.get(users[0]).visits);  // 5
// The user object itself isn't modified — metadata stays separate
```

---

## 6. NaN and -0 as Keys

Map uses SameValueZero comparison — `NaN` equals `NaN`, and `+0` equals `-0`:

```js-exec
const map = new Map();
map.set(NaN, 'not a number');
map.set(+0, 'positive zero');

console.log(map.get(NaN));   // 'not a number'
console.log(map.get(-0));    // 'positive zero'  (SameValueZero: +0 === -0)
```

**Interview use**: Memoize (#10) — `NaN` arguments properly hit the same cache entry.

---

## 7. Map vs Object Decision Guide

| | Map | Object |
|-|-|-|
| Key types | Any value | String or Symbol only |
| Insertion order | Guaranteed | Mostly guaranteed (ES2015+) |
| Size | `map.size` | `Object.keys(obj).length` |
| Iteration | `for...of`, `forEach` | `for...in` + `hasOwnProperty` |
| Performance (frequent add/delete) | Faster | Slower |
| JSON serialization | Must convert first | Native `JSON.stringify` |
| Prototype collisions | None | `toString`, `constructor`, etc. |

**Rule of thumb**: Use Map for dictionaries with dynamic keys (especially non-string keys). Use objects for fixed-schema data and JSON serialization.

---

## 8. Common Interview Patterns

### Frequency Counter

```js-exec
function frequencies(arr) {
  const map = new Map();
  for (const item of arr) {
    map.set(item, (map.get(item) || 0) + 1);
  }
  return map;
}

console.log(frequencies(['a', 'b', 'a', 'c', 'b', 'a']));
// Map { 'a' → 3, 'b' → 2, 'c' → 1 }
```

### Two-Sum (O(N))

```js-exec
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return null;
}

console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]
```

### Event Listener Registry (#22)

```js-exec
class EventBus {
  #listeners = new Map();

  on(event, fn) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, []);
    }
    this.#listeners.get(event).push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    const arr = this.#listeners.get(event);
    if (arr) {
      const idx = arr.indexOf(fn);
      if (idx !== -1) arr.splice(idx, 1);
    }
  }

  emit(event, ...args) {
    const arr = this.#listeners.get(event);
    if (arr) for (const fn of [...arr]) fn(...args);
  }
}
```

### Data Merging by Key (#25)

```js-exec
function mergeByKey(rows, keyField) {
  const map = new Map();
  for (const row of rows) {
    const key = row[keyField];
    if (!map.has(key)) {
      map.set(key, { ...row });
    } else {
      // Merge logic here
      const existing = map.get(key);
      existing.count += row.count || 0;
    }
  }
  return [...map.values()];
}
```

---

## Quick Reference

| Method | What It Does |
|-|-|
| `new Map(entries?)` | Create Map (optionally from [k,v] pairs) |
| `map.set(key, value)` | Add or update entry |
| `map.get(key)` | Get value (or undefined) |
| `map.has(key)` | Check if key exists |
| `map.delete(key)` | Remove entry |
| `map.clear()` | Remove all entries |
| `map.size` | Number of entries |
| `map.keys()` | Iterator of keys |
| `map.values()` | Iterator of values |
| `map.entries()` | Iterator of [key, value] pairs |
| `map.forEach(fn)` | Iterate with callback |

---

## Interview Tips

- **Use Map for non-string keys** — "I'll use a Map so I can key by the actual object reference, not its string representation."
- **Map preserves insertion order** — count-by preserves the order keys are first seen.
- **`map.get()` returns `undefined` for missing keys** — distinguish from stored `undefined` with `map.has()`.
- **Use Map for event listeners** — `Map<string, listener[]>` avoids prototype collisions on event names.

---

## Related Articles

- [Set in JavaScript](/articles/js-set)
- [Data #3 — Map, Set, WeakMap, WeakSet](/articles/js-map-set-weakmap-weakset)
- [#10 — Implement memoize()](/articles/js-interview-memoize)
- [#22 — Implement an EventEmitter](/articles/js-interview-event-emitter)
- [#25 — Implement Data Merging](/articles/js-interview-data-merging)
