`deepOmit(obj, keys)` removes the specified keys from an object at every level of nesting — including inside arrays. It's a recursive traversal problem that tests whether you remember arrays are objects too.

---

## The Problem

> "Implement `deepOmit(obj, keys)` that returns a new object with the given keys removed from every level of nesting. If a value is an array, apply deep omit to each element."

```
deepOmit({ a: 1, b: { a: 2, c: 3 } }, ['a'])
// { b: { c: 3 } }
```

---

## Thought Process

You're walking a tree and creating a modified copy. At each node:
- **Primitive** → return as-is
- **Array** → map each element through deepOmit
- **Object** → create a new object excluding the target keys, then deepOmit each remaining value

The key insight: after stripping keys at the current level, you must recurse into the values in case they contain nested objects with the same keys.

---

## Step 1 — Shallow Omit

```js-exec
function omit(obj, keys) {
  const keySet = new Set(keys);
  const result = {};
  for (const key of Object.keys(obj)) {
    if (!keySet.has(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

console.log(omit({ a: 1, b: 2, c: 3 }, ['a', 'c']));
// { b: 2 }
```

---

## Step 2 — Deep Omit (Objects)

```js-exec
function deepOmit(obj, keys) {
  const keySet = new Set(keys);

  function walk(value) {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(item => walk(item));
    }

    const result = {};
    for (const key of Object.keys(value)) {
      if (!keySet.has(key)) {
        result[key] = walk(value[key]);  // recurse into remaining values
      }
    }
    return result;
  }

  return walk(obj);
}

const input = { a: 1, b: { a: 2, c: 3, d: { a: 4 } } };
console.log(deepOmit(input, ['a']));
// { b: { c: 3, d: {} } }
```

---

## Step 3 — Arrays of Objects

```js-exec
const withArrays = {
  users: [
    { name: 'Alice', password: '123' },
    { name: 'Bob', password: '456' }
  ],
  password: 'admin'
};

console.log(deepOmit(withArrays, ['password']));
// { users: [{ name: 'Alice' }, { name: 'Bob' }] }
```

---

## Step 4 — Edge Cases

**Key appears at multiple depths** — already handled; the `keySet.has(key)` check runs at every object level.

**Value is `null`** — returned as-is (checked at the top of `walk`).

**Empty arrays** — `map` over zero elements returns `[]`. Correct.

**Key not in object** — nothing to omit; the whole structure is returned identical (but cloned).

**Nested key that's also a value** — `{ x: { x: 1 } }` with keys `['x']` → `{}`. The outer `x` is stripped; the inner `x` is never reached because the recursion only goes into *remaining* values.

---

## Full Solution

```js-exec
function deepOmit(obj, keys) {
  const keySet = new Set(keys);

  function walk(value) {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(item => walk(item));
    }

    const result = {};
    for (const key of Object.keys(value)) {
      if (!keySet.has(key)) {
        result[key] = walk(value[key]);
      }
    }
    return result;
  }

  return walk(obj);
}
```

---

## What Interviewers Are Testing

- **Recursive tree transformation** — creating a structural copy while modifying at each level
- **Array handling in recursion** — remembering that arrays contain objects that may also need omitting
- **Set for key lookup** — using `Set.has()` for O(1) key checking instead of `Array.includes()`
- **Cloning semantics** — returning a new object, not mutating the input

---

## Complexity

| | Time | Space |
|-|------|-------|
| deepOmit | O(N) — each value visited once | O(N) — new copy created |

---

## Interview Tips

- **Use a Set for keys** — "I'll convert `keys` to a Set for O(1) lookup." This shows performance awareness.
- **Handle arrays before objects** — `Array.isArray` check before the object branch, since arrays are objects.
- **Mention immutability** — confirm with the interviewer that the function should return a new copy, not mutate the input.
- **Think aloud about the recursion** — "At each level, I strip the keys, then recurse into the remaining values in case they contain the same keys at a deeper level."

---

## Related Questions

- [#13 — Implement deepClone()](/articles/js-interview-deep-clone)
- [#16 — Implement squash()](/articles/js-interview-squash-object)
- [#14 — Implement deepEqual()](/articles/js-interview-deep-equal)
