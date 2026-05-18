`deepClone(value)` returns a structurally identical copy with no shared references. The interviewer starts with JSON-serializable types (objects, arrays, primitives), then asks about edge cases: `null`, nested arrays, and why `JSON.parse(JSON.stringify(x))` isn't the answer.

**Related deep-dive:** [Data #1 — Deep Clone & Deep Compare](/articles/js-deep-clone-compare)

---

## What is `deepClone()`?

`deepClone(value)` creates a **structurally identical copy** of a value where no nested reference is shared with the original. Mutating the copy at any level has zero effect on the original — they're completely independent.

This is different from a shallow copy (`{ ...obj }` or `Object.assign`), which only copies the top level. Nested objects and arrays are still shared references in a shallow copy. Changing `shallow.b.c` also changes `original.b.c` because `b` is the same object. `deepClone` recreates `b`, `c`, and everything below them.

The implementation is a **recursive tree copy**. At each node:
- Primitives (strings, numbers, booleans, `null`) are returned as-is — they're already copied by value
- Arrays spawn new arrays, each element recursively cloned
- Objects spawn new objects, each value recursively cloned

The critical JavaScript-specific trap: `typeof null === "object"`. Without an explicit `null` check, the recursion would try `Object.keys(null)` and throw. Interviewers test for this specifically — it's the `null`-typeof gotcha in a practical context.

Real-world use cases:
- **State management** — creating immutable state snapshots (Redux requires you never mutate state; deep cloning ensures it)
- **Undo/redo** — store a deep copy of the document before each change so you can revert
- **Form drafts** — clone initial form values so you can compare "dirty" vs "pristine" state
- **Passing data across boundaries** — clone an object before handing it to third-party code that might mutate it

The interview starts with JSON-serializable types and escalates to handling `Date`, `RegExp`, `Map`, `Set`, and circular references — each requiring its own branch in the recursion.

---

## The Problem

> "Implement `deepClone(value)` that returns a deep copy. It should handle objects, arrays, strings, numbers, booleans, and `null`. No `JSON.parse(JSON.stringify(x))`."

---

## Thought Process

You're walking a tree. At each node:
- **Primitive** → return as-is (they're already copied by value)
- **Array** → create a new array, deep-clone each element
- **Object** → create a new object, deep-clone each value

The recursion naturally creates new references at every level — that's the "deep" part. The interviewer will immediately ask: "What about `null`?" — `typeof null === 'object'`, so check for it before recursing.

---

## Step 1 — Base Implementation

```js-exec
function deepClone(value) {
  // Primitives and null — return as-is
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Array
  if (Array.isArray(value)) {
    return value.map(item => deepClone(item));
  }

  // Plain object
  const clone = {};
  for (const key of Object.keys(value)) {
    clone[key] = deepClone(value[key]);
  }
  return clone;
}

const original = { a: 1, b: { c: [2, 3] } };
const cloned = deepClone(original);
console.log(cloned);                          // { a: 1, b: { c: [2, 3] } }
console.log(cloned.b === original.b);         // false — different reference
console.log(cloned.b.c === original.b.c);     // false — deeply cloned
```

---

## Step 2 — Handle Nested Arrays

The array branch already handles nested arrays because `map` calls `deepClone` on each element, which checks `Array.isArray` again. But let's verify:

```js-exec
const nested = [[1, 2], [3, [4, 5]]];
const cloned = deepClone(nested);
console.log(cloned[1][1] === nested[1][1]);  // false — deeply cloned
console.log(cloned[0] === nested[0]);        // false
```

---

## Step 3 — Edge Cases

**`null`** — handled by the `value === null` check at the top. Without it, `typeof null === 'object'` would send `null` into `Object.keys(null)`, which throws.

**Empty object / empty array** — `{}` → loops over no keys → `{}`. `[]` → `map` over zero elements → `[]`. Both work naturally.

**Nested nulls** — `{ a: null }` → the recursive call hits `deepClone(null)`, which returns `null`. Correct.

**Why not `JSON.parse(JSON.stringify(x))`?** It loses `undefined`, `function`, `Date`, `RegExp`, `Map`, `Set`, `Symbol`, and circular references. Name-check this — the interviewer wants to hear you know it.

---

## Full Solution

```js-exec
function deepClone(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => deepClone(item));
  }

  const clone = {};
  for (const key of Object.keys(value)) {
    clone[key] = deepClone(value[key]);
  }
  return clone;
}
```

---

## What Interviewers Are Testing

- **typeof null trap** — knowing that `typeof null === 'object'` and guarding for it
- **Recursive structural copy** — creating new containers at every level
- **Array vs object branching** — using `Array.isArray` instead of `typeof`
- **`JSON.parse(JSON.stringify())` awareness** — knowing its limitations

---

## Complexity

| | Time | Space |
|-|------|-------|
| deepClone | O(N) — each value visited once | O(N) — new copy of everything |

---

## Interview Tips

- **Check for `null` immediately** — "First, I'll handle `null` since `typeof null` is `'object'`." This tells the interviewer you won't fall into the trap.
- **Use `Array.isArray`**, not `typeof` — arrays are objects; `typeof []` is `'object'`.
- **Mention `structuredClone`** — "In production you'd use `structuredClone`, which handles more types." This shows platform awareness.
- **Acknowledge what's missing** — mention that this doesn't handle `Date`, `RegExp`, `Map`, `Set`, or circular refs, and that those would need a reference tracker (like a `WeakMap`).

---

## Related Questions

- [#28 — Deep Clone with Circular References](/articles/js-interview-deep-clone-circular)
- [#14 — Implement deepEqual()](/articles/js-interview-deep-equal)
- [#15 — Implement deepOmit()](/articles/js-interview-deep-omit)
