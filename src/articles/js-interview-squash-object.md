`squash(obj)` flattens a nested object into a single-level object with dot-path keys: `{ a: { b: { c: 1 } } }` becomes `{ 'a.b.c': 1 }`. The interviewer will then ask you to reverse it with `unsquash()`.

**Related deep-dive:** [Data #2 — Flatten & Unflatten Nested Objects](/articles/js-flatten-unflatten-object)

---

## What is `squash()`?

`squash(obj)` converts a deeply nested object into a flat, single-level object where each key is a dot-notation path to the original value. For example, `{ a: { b: { c: 1 } } }` becomes `{ "a.b.c": 1 }`. Arrays use bracket notation: `{ users: [{ name: "Alice" }] }` becomes `{ "users[0].name": "Alice" }`.

This is the reverse of `unflatten` / `unsquash`, which takes a flat dot-path object and reconstructs the nested hierarchy. Together they form a serialization/deserialization pair.

The implementation is a recursive depth-first walk. At each level:
- **Primitive or null** — set the accumulated path key to this value
- **Plain object** — recurse into each entry, appending `.key` to the accumulated path
- **Array** — recurse into each element, appending `[index]` to the path

The accumulator is a path string that grows as you descend, and you only write to the result object at leaf nodes.

Real-world use cases:
- **Form libraries** — convert nested form state into flat `{ "user.name": "Alice" }` for validation or submission
- **URL query params** — flatten a config object into query parameters: `filter[status]=active&filter[date]=today`
- **Database updates** — MongoDB and Firebase use dot-notation for updating nested fields without overwriting siblings
- **Diffing** — compare two nested objects by flattening both and doing a shallow diff on the flat versions

The interviewer will typically ask for `unsquash()` as the reverse operation. Building both tests whether you can think in both directions — encoding a hierarchy into paths and decoding paths back into a hierarchy.

---

## The Problem

> "Implement `squash(obj)` that converts a nested object into a flat object with dot-separated keys. Handle both objects and arrays (arrays use bracket notation)."
>
> "Now implement `unsquash(obj)` — the reverse operation."

---

## Thought Process

`squash` is a DFS traversal where you accumulate a path as you go down. At each leaf (non-object, non-array value), you set `result[path] = value` and bubble back up.

Key decisions:
- **Separator**: dot by default, but make it configurable
- **Array notation**: use `parent[index]` bracket syntax
- **Unsquash**: split the path, walk/create the nested structure, set the leaf

---

## Step 1 — Squash (Objects Only)

```js-exec
function squash(obj, sep = '.') {
  const result = {};

  function walk(current, path) {
    if (current === null || typeof current !== 'object' || Array.isArray(current)) {
      result[path.join(sep)] = current;
      return;
    }

    for (const key of Object.keys(current)) {
      walk(current[key], [...path, key]);
    }
  }

  walk(obj, []);
  return result;
}

console.log(squash({ a: { b: { c: 1 } } }));
// { 'a.b.c': 1 }
console.log(squash({ a: 1, b: { c: 2, d: { e: 3 } } }));
// { a: 1, 'b.c': 2, 'b.d.e': 3 }
```

---

## Step 2 — Squash with Arrays

```js-exec
function squash(obj, sep = '.') {
  const result = {};

  function walk(current, path) {
    if (current === null || typeof current !== 'object') {
      result[path.join(sep)] = current;
      return;
    }

    if (Array.isArray(current)) {
      for (let i = 0; i < current.length; i++) {
        walk(current[i], [...path, `[${i}]`]);
      }
      return;
    }

    for (const key of Object.keys(current)) {
      walk(current[key], [...path, key]);
    }
  }

  walk(obj, []);
  return result;
}

console.log(squash({ users: [{ name: 'Alice' }, { name: 'Bob' }] }));
// { 'users[0].name': 'Alice', 'users[1].name': 'Bob' }
```

---

## Step 3 — Unsquash (Reverse)

```js-exec
function unsquash(obj, sep = '.') {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    // Parse path: 'a.b[0].c' → ['a', 'b', '[0]', 'c']
    const parts = key
      .replace(/\[(\d+)\]/g, '.$1')  // [0] → .0
      .split(sep);

    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const next = parts[i + 1];
      const nextIsIndex = /^\d+$/.test(next);

      if (!(part in current)) {
        current[part] = nextIsIndex ? [] : {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  return result;
}

console.log(unsquash({ 'a.b.c': 1, 'a.b.d': 2 }));
// { a: { b: { c: 1, d: 2 } } }

console.log(unsquash({ 'users[0].name': 'Alice', 'users[1].name': 'Bob' }));
// { users: [{ name: 'Alice' }, { name: 'Bob' }] }
```

---

## Step 4 — Edge Cases

**Already flat**: `squash({ a: 1 })` returns `{ a: 1 }`. Works — no object leaves to recurse into.

**Null values**: `{ a: null }` → `{ a: null }`. `null` is not an object, so it's treated as a leaf.

**Empty objects/arrays**: `{ a: {} }` → `{}` (no keys). `{ a: [] }` → `{}` (no indices). The walk function has nothing to iterate.

**Numbers as object keys**: `{ 0: 'a' }` — treated as any other key. On unsquash, numeric keys create objects with numeric string keys, not arrays.

---

## Full Solution

```js-exec
function squash(obj, sep = '.') {
  const result = {};

  function walk(current, path) {
    if (current === null || typeof current !== 'object') {
      result[path.join(sep)] = current;
      return;
    }

    if (Array.isArray(current)) {
      current.forEach((item, i) => walk(item, [...path, `[${i}]`]));
      return;
    }

    const keys = Object.keys(current);
    if (keys.length === 0) {
      result[path.join(sep)] = current;
      return;
    }

    for (const key of keys) {
      walk(current[key], [...path, key]);
    }
  }

  walk(obj, []);
  return result;
}

function unsquash(obj, sep = '.') {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const parts = key
      .replace(/\[(\d+)\]/g, '.$1')
      .split(sep);

    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const next = parts[i + 1];
      if (!(part in current)) {
        current[part] = /^\d+$/.test(next) ? [] : {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
  }

  return result;
}
```

---

## What Interviewers Are Testing

- **Path construction** — building dot-notation keys during DFS
- **Array index notation** — bracket syntax for array elements
- **Reverse operation** — parsing paths back into nested structure
- **Empty container handling** — deciding what to do with `{}` and `[]`

---

## Complexity

| | Time | Space |
|-|------|-------|
| squash | O(N) — each leaf visited once | O(N) — new flat object |
| unsquash | O(K × P) — K keys, P path depth | O(N) — new nested object |

---

## Interview Tips

- **Use array for path, join at the end** — building strings incrementally (`path + '.' + key`) is error-prone. Accumulate segments in an array and `join` once.
- **Ask about array notation preference** — `a[0].b` vs `a.0.b`. The bracket convention is standard because it avoids ambiguity with numeric keys.
- **Handle empty objects/arrays explicitly** — state your choice and why: "I'll preserve empty containers as-is rather than dropping them."
- **Mention the real lodash** — `_.get` / `_.set` are the production equivalents; `squash`/`unsquash` test whether you can implement their core logic.

---

## Related Questions

- [Implement _.get()](/articles/js-interview-get)
- [Implement deepClone()](/articles/js-interview-deep-clone)
- [Implement flatten()](/articles/js-interview-flatten)
