`_.set(obj, 'a.b.c', value)` writes a value at an arbitrarily deep path, creating intermediate objects along the way. It's the natural companion to `_.get()` — and it's harder because you need to mutate rather than just read, and create missing nodes rather than returning a default.

---

## What is `_.set()`?

`set(obj, path, value)` writes `value` at the location described by `path`, creating any intermediate objects (or arrays) that don't yet exist:

```js
set({}, 'a.b.c', 42)           // { a: { b: { c: 42 } } }
set({}, 'a[0].name', 'Alice')  // { a: [{ name: 'Alice' }] }
set(obj, ['x', 'y'], 'z')      // object path as array
```

The hard part is determining **what to create** at each intermediate step: a plain object `{}` or an array `[]`. The heuristic: if the next key in the path is a valid array index (a non-negative integer), create an array; otherwise create a plain object.

Real-world use cases:
- **Form state** — update `form.address.city` without spread-cloning every layer
- **Config patching** — set a deeply nested config value from a flat key path
- **Redux reducers** — safely write to nested state paths
- **Template engines** — populate nested data structures from dot-notation keys

---

## The Problem

> "Implement `set(obj, path, value)` that writes a value at the nested path. Path can be a dot-notation string like `'a.b.c'`, bracket notation like `'a[0].b'`, or an array of keys. Create intermediate objects/arrays as needed."

---

## Thought Process

Two phases:
1. **Parse the path** — normalize `'a[0].b'` to `['a', '0', 'b']` (always an array of string keys)
2. **Walk and write** — traverse the object, creating missing nodes, then set the final key

For step 2: iterate over all keys except the last. At each key, check if the next node exists and is an object. If not, create it — using `{}` or `[]` based on whether the next key looks like an array index (`/^\d+$/`).

---

## Step 1 — Parsing the Path

```js-exec
function parsePath(path) {
  if (Array.isArray(path)) return path.map(String);

  // Convert bracket notation: 'a[0].b' → 'a.0.b' → ['a', '0', 'b']
  return path
    .replace(/\[(\d+)\]/g, '.$1')  // [0] → .0
    .split('.')
    .filter(Boolean);               // remove empty strings from leading dots
}

console.log(parsePath('a.b.c'));       // ['a', 'b', 'c']
console.log(parsePath('a[0].name'));   // ['a', '0', 'name']
console.log(parsePath('a[1][2]'));     // ['a', '1', '2']
console.log(parsePath(['x', 'y']));   // ['x', 'y']
```

---

## Step 2 — Walk and Write

```js-exec
function set(obj, path, value) {
  const keys = Array.isArray(path)
    ? path.map(String)
    : path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);

  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    // If the node doesn't exist or is a primitive, create it
    if (current[key] == null || typeof current[key] !== 'object') {
      // Create array if next key is a non-negative integer, otherwise object
      current[key] = /^\d+$/.test(nextKey) ? [] : {};
    }

    current = current[key];
  }

  // Set the final value
  current[keys[keys.length - 1]] = value;
  return obj;
}

// Test
const obj = {};

set(obj, 'a.b.c', 42);
console.log(JSON.stringify(obj)); // {"a":{"b":{"c":42}}}

set(obj, 'a.arr[0]', 'first');
console.log(JSON.stringify(obj)); // {"a":{"b":{"c":42},"arr":["first"]}}

set(obj, 'a.arr[1]', 'second');
console.log(JSON.stringify(obj)); // {"a":{"b":{"c":42},"arr":["first","second"]}}

// Array path
set(obj, ['x', 'y', 'z'], 99);
console.log(obj.x.y.z); // 99
```

---

## Step 3 — Overwriting Non-Object Nodes

What if an intermediate node exists but is a primitive? It gets replaced.

```js-exec
function set(obj, path, value) {
  const keys = Array.isArray(path)
    ? path.map(String)
    : path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);

  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = /^\d+$/.test(nextKey) ? [] : {};
    }

    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return obj;
}

// Overwriting a primitive node — 'b' was 5, now becomes { c: 1 }
const o = { a: { b: 5 } };
set(o, 'a.b.c', 1);
console.log(JSON.stringify(o)); // {"a":{"b":{"c":1}}}

// Existing deep path — update in place
const config = { db: { host: 'localhost', port: 5432 } };
set(config, 'db.port', 3306);
console.log(config.db); // { host: 'localhost', port: 3306 }
```

---

## Full Solution

```js-exec
function set(obj, path, value) {
  const keys = Array.isArray(path)
    ? path.map(String)
    : path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);

  if (keys.length === 0) return obj;

  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = /^\d+$/.test(nextKey) ? [] : {};
    }

    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return obj;
}

// Tests
console.log(JSON.stringify(set({}, 'a.b.c', 1)));          // {"a":{"b":{"c":1}}}
console.log(JSON.stringify(set({}, 'items[0].id', 42)));   // {"items":[{"id":42}]}
console.log(set({ x: 1 }, 'x', 2).x);                     // 2 — update existing
```

---

## What Interviewers Are Testing

- **Path normalization** — converting bracket notation to dot notation before splitting
- **`{} vs []` creation heuristic** — using the next key's value to decide what to create: number → array, string → object
- **Primitive overwrite** — not assuming existing nodes are objects; replacing them if they're not
- **Mutates in place** — `set` modifies the original object and returns it (Lodash behavior)

---

## Complexity

| | Time | Space |
|-|------|-------|
| `set(obj, path, val)` | O(D) — D = path depth | O(D) — path keys array |

---

## Interview Tips

- **Handle bracket notation first** — `.replace(/\[(\d+)\]/g, '.$1')` before `.split('.')` is the cleanest path normalization.
- **Explain the `{} vs []` decision** — "I check whether the next key is a digit. If so, I create an array because integer keys indicate array indexing."
- **Mention immutability** — "This mutates the object. For immutable set, you'd create new objects at each level — similar to how Redux reducers work with spread operators."
- **Compare to `_.get`** — "Get traverses and returns; set traverses, creates, and writes. The traversal logic is the same, the write step is new."

---

## Related Questions

- [Implement Lodash's _.get() for Safe Nested Access](/articles/js-interview-get)
- [Implement deepClone() — Complete Guide](/articles/js-interview-deep-clone-circular)
- [Implement squash() — Flatten Nested Objects to Dot Paths](/articles/js-interview-squash-object)
