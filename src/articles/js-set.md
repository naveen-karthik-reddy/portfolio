`Set` is JavaScript's collection of unique values. Any value can be a member — primitives, objects, functions. Sets give you O(1) membership tests, automatic deduplication, and are iterable in insertion order. They're used in interviews for dedup, visited tracking, and set operations.

**Related:** [Data #3 — Map, Set, WeakMap, WeakSet Polyfills](/articles/js-map-set-weakmap-weakset) implements Set from scratch.

---

## 1. Why Set Over Array?

Arrays require O(N) to check membership and don't enforce uniqueness:

```js-exec
// Array: O(N) membership, no uniqueness guarantee
const arr = [1, 2, 2, 3, 3, 3];
console.log(arr.includes(3));  // true — but O(N)
console.log(new Set(arr));     // Set { 1, 2, 3 } — automatic dedup

// Set: O(1) membership, guaranteed uniqueness
const set = new Set([1, 2, 3]);
console.log(set.has(3));       // true — O(1)
set.add(3);                    // no effect — already present
console.log(set.size);         // 3
```

---

## 2. Creating a Set

```js-exec
// Empty
const empty = new Set();

// From iterable (array, string, another Set)
const set = new Set([1, 2, 3, 3, 2, 1]);
console.log([...set]);  // [1, 2, 3] — duplicates removed

// From string
console.log(new Set('hello'));  // Set { 'h', 'e', 'l', 'o' }

// Clone
const clone = new Set(set);
console.log(clone.size);  // 3
```

---

## 3. Basic Operations

```js-exec
const set = new Set();

// Add
set.add(1);
set.add(2);
set.add(1);          // duplicate — ignored
console.log(set.size);  // 2

// Has
console.log(set.has(1));  // true
console.log(set.has(3));  // false

// Delete
set.delete(2);
console.log(set.has(2));  // false

// Clear
set.clear();
console.log(set.size);    // 0
```

`add()` returns the Set itself — chainable:

```js-exec
const set = new Set();
set.add('a').add('b').add('c');
console.log([...set]);  // ['a', 'b', 'c']
```

---

## 4. Iteration

Set is iterable and preserves insertion order:

```js-exec
const set = new Set(['first', 'second', 'third']);

// forEach
set.forEach(value => console.log(value));

// for...of
for (const value of set) {
  console.log(value);
}

// keys() — same as values() for Set (Map compat)
console.log([...set.keys()]);    // ['first', 'second', 'third']
console.log([...set.values()]);  // ['first', 'second', 'third']
console.log([...set.entries()]); // [['first', 'first'], ...] (Map compat)

// Convert to array
console.log([...set]);           // ['first', 'second', 'third']
console.log(Array.from(set));   // same
```

`keys()` exists on Set only for API compatibility with Map. Both `keys()` and `values()` return the same iterator.

---

## 5. Object Values and Reference Equality

Object membership uses reference equality — same reference = same member:

```js-exec
const set = new Set();
const obj = { id: 1 };

set.add(obj);
console.log(set.has(obj));        // true
console.log(set.has({ id: 1 }));  // false — different reference

set.add({ id: 1 });  // different reference — added
console.log(set.size);  // 2
```

---

## 6. NaN and -0

Set uses SameValueZero comparison — `NaN` equals `NaN`, and `+0` equals `-0`:

```js-exec
const set = new Set();
set.add(NaN);
set.add(NaN);  // duplicate — ignored
console.log(set.size);   // 1
console.log(set.has(NaN));  // true

set.add(+0);
set.add(-0);  // duplicate — ignored
console.log(set.size);  // 2 (NaN, 0)
```

---

## 7. Common Interview Patterns

### Deduplicate an Array

```js-exec
function unique(arr) {
  return [...new Set(arr)];
}

console.log(unique([1, 2, 2, 3, 3, 3, 1]));  // [1, 2, 3]
```

### Track Visited Objects (Circular Reference Detection)

```js-exec
function hasCycle(root) {
  const visited = new Set();

  function walk(node) {
    if (visited.has(node)) return true;  // cycle detected
    visited.add(node);
    for (const child of node.children || []) {
      if (walk(child)) return true;
    }
    return false;
  }

  return walk(root);
}
```

**Interview use**: Circular reference detection in deep clone (#28 — though typically uses WeakSet/WeakMap), graph traversal.

### Set Operations (Union, Intersection, Difference)

```js-exec
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

// Union: all elements from both
console.log(new Set([...a, ...b]));  // Set { 1, 2, 3, 4 }

// Intersection: elements in both
console.log(new Set([...a].filter(x => b.has(x))));  // Set { 2, 3 }

// Difference: in A but not in B
console.log(new Set([...a].filter(x => !b.has(x))));  // Set { 1 }

// Symmetric difference: in either but not both
const diff = new Set([
  ...[...a].filter(x => !b.has(x)),
  ...[...b].filter(x => !a.has(x))
]);
console.log(diff);  // Set { 1, 4 }

// Is subset?
const isSubset = [...a].every(x => b.has(x));
console.log(isSubset);  // false
```

### Omit Keys Set (#15)

```js-exec
function deepOmit(obj, keys) {
  const keySet = new Set(keys);  // O(1) lookup

  function walk(value) {
    if (value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(walk);

    const result = {};
    for (const key of Object.keys(value)) {
      if (!keySet.has(key)) {        // O(1) membership check
        result[key] = walk(value[key]);
      }
    }
    return result;
  }

  return walk(obj);
}
```

---

## 8. Converting Between Set and Array

```js-exec
const arr = [1, 2, 2, 3];

// Array → Set (dedup)
const set = new Set(arr);

// Set → Array
const back = [...set];
const also = Array.from(set);

console.log(back);  // [1, 2, 3]
```

---

## 9. WeakSet — When References Shouldn't Prevent GC

`WeakSet` only holds objects and doesn't prevent garbage collection:

```js-exec
const ws = new WeakSet();

const obj = {};
ws.add(obj);
console.log(ws.has(obj));  // true

// When obj is no longer referenced anywhere, it's GC'd
// and automatically removed from the WeakSet
```

WeakSet is not iterable, has no `size`, and only has `add`, `has`, and `delete`. It's designed exclusively for "have I seen this object before?" use cases.

---

## Quick Reference

| Method | What It Does |
|-|-|
| `new Set(iterable?)` | Create Set |
| `set.add(value)` | Add value (returns set) |
| `set.has(value)` | Check membership |
| `set.delete(value)` | Remove value |
| `set.clear()` | Remove all |
| `set.size` | Number of values |
| `set.forEach(fn)` | Iterate |
| `set.keys()` / `set.values()` | Values iterator |
| `set.entries()` | [v, v] iterator (Map compat) |

---

## Interview Tips

- **Use Set for O(1) membership** — `set.has(x)` beats `array.includes(x)` for frequent checks.
- **Use Set for dedup** — `[...new Set(arr)]` is the idiomatic one-liner.
- **Use WeakSet for "visited" tracking** — it avoids memory leaks when objects are discarded.
- **Set handles NaN correctly** — `set.add(NaN); set.add(NaN);` stores it once.

---

## Related Articles

- [Map in JavaScript](/articles/js-map)
- [Data #3 — Map, Set, WeakMap, WeakSet](/articles/js-map-set-weakmap-weakset)
- [#15 — Implement deepOmit()](/articles/js-interview-deep-omit)
- [#28 — Deep Clone with Circular References](/articles/js-interview-deep-clone-circular)
