`deepClone` from Interview #13 breaks on circular references — it recurses infinitely. Solve it with a `WeakMap` that tracks already-cloned objects and returns the clone instead of recursing. Then extend to handle `Date`, `RegExp`, `Map`, and `Set`.

**Related deep-dive:** [Data #1 — Deep Clone & Deep Compare](/articles/js-deep-clone-compare)

---

## What is Circular Reference Handling in `deepClone()`?

The basic `deepClone` from Interview #13 fails catastrophically on circular references. If `obj.self = obj`, the recursion enters an infinite loop and eventually overflows the call stack. Solving this means tracking which objects have already been cloned and, when you encounter one again, returning the existing clone instead of recursing.

The data structure for this is a **`WeakMap` from original → clone**. Before cloning an object, check if it's already in the map. If so, return the cached clone (this is what breaks the cycle). If not, create a new clone, **store it in the map immediately** (before recursing into children), then recursively clone the children.

The `WeakMap` is specifically chosen over `Map` because:
- It holds **weak references** — if the original object is garbage collected, the WeakMap entry is automatically removed
- It avoids memory leaks in long-lived clone operations
- It's the same data structure the native `structuredClone` uses internally for this purpose

Once the cycle-breaking mechanism is in place, the interviewer typically extends the question to handle non-JSON types:
- **`Date`** → `new Date(value.getTime())`
- **`RegExp`** → `new RegExp(value.source, value.flags)`
- **`Map`** → `new Map(Array.from(value.entries()).map(([k, v]) => [deepClone(k, seen), deepClone(v, seen)]))`
- **`Set`** → `new Set(Array.from(value).map(v => deepClone(v, seen)))`

Each type requires its own branch in the recursion, with the `WeakMap` tracker threaded through all of them.

Real-world use: circular references are common in DOM trees (`parentNode`/`childNodes`), graph data structures (adjacency lists), and state management (parent/child entity relationships). Any general-purpose clone utility must handle them.

---

## The Problem

> "Your `deepClone` from earlier handles plain objects and arrays. Now extend it to handle:
> 1. Circular references (an object referencing itself)
> 2. `Date`, `RegExp`, `Map`, and `Set`
> 3. Explain why you use `WeakMap`, not `Map`"

---

## Thought Process

**Circular references**: When you encounter an object that you've already started cloning, you need to return the clone-in-progress, not start a new clone. A `WeakMap<original, clone>` tracks this mapping.

**Why WeakMap?** If the original object is garbage collected, the WeakMap entry is automatically removed. With a regular `Map`, the entry would keep the original alive, creating a memory leak. For a one-shot clone this doesn't matter, but it's the right habit.

**Date/RegExp**: Create new instances with the same value. `new Date(date.valueOf())` and `new RegExp(regex.source, regex.flags)`.

**Map/Set**: Create new instances and recursively clone their entries.

---

## Step 1 — Circular Reference Detection

```js-exec
function deepClone(value, visited = new WeakMap()) {
  // Primitives and null
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Circular reference check
  if (visited.has(value)) {
    return visited.get(value);
  }

  if (Array.isArray(value)) {
    const clone = [];
    visited.set(value, clone);
    for (const item of value) {
      clone.push(deepClone(item, visited));
    }
    return clone;
  }

  const clone = {};
  visited.set(value, clone);
  for (const key of Object.keys(value)) {
    clone[key] = deepClone(value[key], visited);
  }
  return clone;
}

// Test circular reference
const obj = { name: 'root' };
obj.self = obj;          // points to itself
obj.child = { parent: obj }; // mutual reference

const cloned = deepClone(obj);
console.log(cloned.name);           // 'root'
console.log(cloned.self === cloned); // true — circular preserved
console.log(cloned.child.parent === cloned); // true — mutual ref preserved
```

**The key**: `visited.set(value, clone)` happens *before* recursing into properties. This way, if a property points back to the same object, `visited.has(value)` returns `true` and the clone-in-progress is returned.

---

## Step 2 — Handling Date and RegExp

```js-exec
function deepClone(value, visited = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (visited.has(value)) return visited.get(value);

  // Date
  if (value instanceof Date) {
    const clone = new Date(value.getTime());
    visited.set(value, clone);
    return clone;
  }

  // RegExp
  if (value instanceof RegExp) {
    const clone = new RegExp(value.source, value.flags);
    visited.set(value, clone);
    return clone;
  }

  if (Array.isArray(value)) {
    const clone = [];
    visited.set(value, clone);
    for (const item of value) clone.push(deepClone(item, visited));
    return clone;
  }

  const clone = {};
  visited.set(value, clone);
  for (const key of Object.keys(value)) {
    clone[key] = deepClone(value[key], visited);
  }
  return clone;
}

// Test
const date = new Date('2024-01-15');
const clonedDate = deepClone(date);
console.log(clonedDate instanceof Date);  // true
console.log(clonedDate.getTime() === date.getTime()); // true
console.log(clonedDate === date);         // false

const regex = /hello/gi;
const clonedRegex = deepClone(regex);
console.log(clonedRegex.source);  // 'hello'
console.log(clonedRegex.flags);   // 'gi'
```

---

## Step 3 — Handling Map and Set

```js-exec
function deepClone(value, visited = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (visited.has(value)) return visited.get(value);

  if (value instanceof Date) {
    const clone = new Date(value.getTime());
    visited.set(value, clone);
    return clone;
  }

  if (value instanceof RegExp) {
    const clone = new RegExp(value.source, value.flags);
    visited.set(value, clone);
    return clone;
  }

  if (value instanceof Map) {
    const clone = new Map();
    visited.set(value, clone);
    for (const [k, v] of value) {
      clone.set(deepClone(k, visited), deepClone(v, visited));
    }
    return clone;
  }

  if (value instanceof Set) {
    const clone = new Set();
    visited.set(value, clone);
    for (const item of value) {
      clone.add(deepClone(item, visited));
    }
    return clone;
  }

  if (Array.isArray(value)) {
    const clone = [];
    visited.set(value, clone);
    for (const item of value) clone.push(deepClone(item, visited));
    return clone;
  }

  const clone = {};
  visited.set(value, clone);
  for (const key of Object.keys(value)) {
    clone[key] = deepClone(value[key], visited);
  }
  return clone;
}
```

---

## Step 4 — Edge Cases

**Self-referencing object**: `obj.self = obj` — handled by setting `visited.set(value, clone)` before recursing.

**Mutual reference**: A → B → A — both clones reference each other correctly.

**Map/Set with object keys**: Map keys are deep-cloned too, preserving the structural independence.

**`instanceof` check order**: Check `Date` before `Object`, check `RegExp` before `Object`. All are `instanceof Object`.

**Symbol properties**: `Object.keys` skips symbols. If symbol keys matter, use `Object.getOwnPropertySymbols` or `Reflect.ownKeys`.

---

## Full Solution

```js-exec
function deepClone(value, visited = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (visited.has(value)) return visited.get(value);

  if (value instanceof Date) {
    const clone = new Date(value.getTime());
    return visited.set(value, clone), clone;
  }

  if (value instanceof RegExp) {
    const clone = new RegExp(value.source, value.flags);
    return visited.set(value, clone), clone;
  }

  if (value instanceof Map) {
    const clone = new Map();
    visited.set(value, clone);
    for (const [k, v] of value) clone.set(deepClone(k, visited), deepClone(v, visited));
    return clone;
  }

  if (value instanceof Set) {
    const clone = new Set();
    visited.set(value, clone);
    for (const item of value) clone.add(deepClone(item, visited));
    return clone;
  }

  if (Array.isArray(value)) {
    const clone = [];
    visited.set(value, clone);
    for (const item of value) clone.push(deepClone(item, visited));
    return clone;
  }

  const clone = {};
  visited.set(value, clone);
  for (const key of Object.keys(value)) {
    clone[key] = deepClone(value[key], visited);
  }
  return clone;
}
```

---

## What Interviewers Are Testing

- **Circular reference handling** — tracking visited objects with a WeakMap
- **WeakMap vs Map** — understanding GC implications of key storage
- **Type extension** — adding Date, RegExp, Map, Set while keeping the structure clean
- **Set-before-recurse order** — registering the clone in the WeakMap *before* diving into properties

---

## Complexity

| | Time | Space |
|-|------|-------|
| deepClone | O(N) — each value visited once | O(N) — new copy + O(N) WeakMap entries |

---

## Interview Tips

- **Explain why WeakMap** — "WeakMap lets the GC collect the original if the clone outlives it. With Map, the clone keeps the original alive forever."
- **Set the clone before recursing** — "I register the clone in the WeakMap first, then recurse. If a child references the parent, the clone is already in the map."
- **Check Date and RegExp before object** — "`instanceof Date` and `instanceof RegExp` before the generic object branch, otherwise they fall into the `Object.keys` loop and lose their prototype."
- **Mention what's still missing** — typed arrays, `Error`, `Promise`, `Function`, prototype chain preservation. List them so the interviewer knows you're aware.

---

## Related Questions

- [Implement deepClone() (base version)](/articles/js-interview-deep-clone)
- [Implement deepEqual()](/articles/js-interview-deep-equal)
- [Implement a Simplified JSON.stringify()](/articles/js-interview-json-stringify)
