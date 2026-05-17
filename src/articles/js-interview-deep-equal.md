`deepEqual(a, b)` checks structural equality — same shape, same values, not the same reference. The interviewer tests whether you handle `NaN`, `+0`/`-0`, `null` vs `{}`, and arrays vs objects correctly.

**Related deep-dive:** [Data #1 — Deep Clone & Deep Compare](/articles/js-deep-clone-compare)

---

## The Problem

> "Implement `deepEqual(a, b)` that returns `true` if `a` and `b` have the same structure and values, and `false` otherwise. It should work for primitives, arrays, and plain objects."

---

## Thought Process

The algorithm has ordered checks:
1. **Reference equality** — if `a === b`, return `true` (fast exit). But watch: `NaN !== NaN` and `+0 === -0`.
2. **Type mismatch** — if `typeof a !== typeof b`, return `false`.
3. **NaN handling** — `NaN` is the only value where `x !== x`. If both are `NaN`, they're equal.
4. **`null` check** — if either is `null`, they must be reference-equal (already handled by step 1).
5. **Primitive** — return `a === b`.
6. **Array** — compare lengths, then recurse element-wise.
7. **Object** — compare key counts, then recurse value-wise.

---

## Step 1 — Primitives with NaN

```js-exec
function deepEqual(a, b) {
  // Reference equality (handles +0 === -0, but we handle that separately)
  if (a === b) return true;

  // NaN check — NaN is the only value not equal to itself
  if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) {
    return true;
  }

  // Null or different types → not equal
  if (a === null || b === null || typeof a !== typeof b) {
    return false;
  }

  // Primitives
  if (typeof a !== 'object') {
    return a === b;
  }

  // ... objects/arrays handled next
}
```

---

## Step 2 — Arrays

```js-exec
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) return true;
  if (a === null || b === null || typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;

  // Array comparison
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // If one is array and the other isn't
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // Object comparison
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

console.log(deepEqual([1, 2, [3, 4]], [1, 2, [3, 4]]));   // true
console.log(deepEqual([1, 2], [1, 2, 3]));                  // false
```

---

## Step 3 — Objects

```js-exec
// Continuing from above — the object branch is already in place
console.log(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }));  // true
console.log(deepEqual({ a: 1 }, { a: 1, b: 2 }));                        // false
console.log(deepEqual({ a: 1 }, { a: '1' }));                            // false
```

---

## Step 4 — Edge Cases

**NaN**: `deepEqual(NaN, NaN)` must return `true`. Handled by the `isNaN` check.

**+0 vs -0**: `Object.is(+0, -0)` returns `false`, but `+0 === -0` returns `true`. Our `a === b` early return treats them as equal. If the interviewer wants `Object.is` semantics, use `Object.is` instead of `===`.

**`null` vs `{}`**: `typeof null === 'object'` and `typeof {} === 'object'`. Our `null` check before the `typeof` branch handles this.

**Arrays vs objects**: `deepEqual([], {})` should return `false`. The `Array.isArray(a) !== Array.isArray(b)` check handles this.

**Prototype properties**: `Object.keys` only returns own enumerable properties, so inherited properties are ignored — which is correct for structural equality.

---

## Full Solution

```js-exec
function deepEqual(a, b) {
  if (a === b) return true;

  // Both NaN
  if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) {
    return true;
  }

  if (a === null || b === null || typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;

  // Array branch
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // One array, one object
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // Object branch
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}
```

---

## What Interviewers Are Testing

- **NaN equality** — knowing that `NaN !== NaN` and handling it explicitly
- **null vs object** — knowing that `typeof null === 'object'` and guarding for it
- **Array vs object distinction** — using `Array.isArray` before falling into the object branch
- **Short-circuit on reference equality** — the fastest check, done first

---

## Complexity

| | Time | Space |
|-|------|-------|
| deepEqual | O(N) — each value visited once | O(D) — call stack, D = max depth |

---

## Interview Tips

- **Handle NaN first** — "Since `NaN !== NaN`, I'll check if both values are NaN before anything else." This immediately tells the interviewer you know the quirk.
- **Check types before recursing** — if types differ, return `false` immediately. Saves work and avoids comparing an array to an object.
- **State whether you want `===` or `Object.is` semantics for +0/-0** — most interviewers are fine with `===`, but asking shows awareness.
- **Mention `hasOwnProperty`** — checking it prevents inherited properties from affecting equality.

---

## Related Questions

- [#13 — Implement deepClone()](/articles/js-interview-deep-clone)
- [#15 — Implement deepOmit()](/articles/js-interview-deep-omit)
- [#28 — Deep Clone with Circular References](/articles/js-interview-deep-clone-circular)
