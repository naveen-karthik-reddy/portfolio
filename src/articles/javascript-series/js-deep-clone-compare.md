`{...obj}` and `[...arr]` give you shallow copies — nested objects are still shared references. Deep cloning makes a completely independent copy. Deep comparison checks if two values are structurally identical. This article implements both, handling all the tricky edge cases.

**Prerequisites:** [Recursion Patterns](/articles/javascript-series/js-recursion-patterns)

---

## 1. The Problem with Shallow Copying

```js-exec
const original = {
  name: "Naveen",
  address: { city: "Bangalore", country: "India" },
  hobbies: ["coding", "reading"],
};

// Shallow copy — top level is independent, nested objects are shared
const shallow = { ...original };
shallow.name = "Karthik";            // ✅ Won't affect original
shallow.address.city = "Mumbai";     // ❌ Affects original! Same reference

console.log("Original address:", original.address.city); // "Mumbai" — polluted!
console.log("Same reference?", original.address === shallow.address); // true
```

`structuredClone()` is the modern native solution (Node 17+, browsers 2022+), but implementing it manually teaches you every edge case.

---

## 2. Deep Clone — Handling Primitives, Arrays, Objects

```js-exec
function deepClone(value, seen = new Map()) {
  // Primitives — return as-is
  if (value === null || typeof value !== "object") {
    return value;
  }

  // Handle circular references
  if (seen.has(value)) {
    return seen.get(value);
  }

  // Date
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  // RegExp
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags);
  }

  // Map
  if (value instanceof Map) {
    const result = new Map();
    seen.set(value, result);
    for (const [k, v] of value) {
      result.set(deepClone(k, seen), deepClone(v, seen));
    }
    return result;
  }

  // Set
  if (value instanceof Set) {
    const result = new Set();
    seen.set(value, result);
    for (const item of value) {
      result.add(deepClone(item, seen));
    }
    return result;
  }

  // Array
  if (Array.isArray(value)) {
    const result = [];
    seen.set(value, result);
    for (let i = 0; i < value.length; i++) {
      result[i] = deepClone(value[i], seen);
    }
    return result;
  }

  // Plain object
  const result = {};
  seen.set(value, result);
  for (const key of Object.keys(value)) {
    result[key] = deepClone(value[key], seen);
  }
  return result;
}

// Test
const obj = {
  name: "Naveen",
  created: new Date(),
  tags: new Set(["js", "react"]),
  meta: new Map([["version", 1]]),
  pattern: /hello/i,
};

const cloned = deepClone(obj);
console.log("Same Date?", obj.created === cloned.created);       // false
console.log("Same Map?", obj.meta === cloned.meta);              // false
console.log("Same Date value?", +obj.created === +cloned.created); // true

// Circular reference test
const circular = { name: "circular" };
circular.self = circular;
const clonedCircular = deepClone(circular);
console.log("Circular test:", clonedCircular.self === clonedCircular); // true
```

---

## 3. Deep Equality — `deepEquals(a, b)`

Structural equality checks if two values have the same "shape" and values — recursively. Unlike `===`, it handles objects, arrays, and edge cases like `NaN` and `+0`/`-0`:

```js-exec
function deepEquals(a, b, seen = new Map()) {
  // Same reference → equal (covers primitives and same objects)
  if (a === b) return true;

  // One null/undefined but not both
  if (a == null || b == null) return false;

  // Different types
  if (typeof a !== typeof b) return false;

  // NaN check: NaN !== NaN, but we want NaN equals NaN
  if (typeof a === "number" && isNaN(a) && isNaN(b)) return true;

  // +0 and -0: 0 === -0 is true, but we might want them distinct
  // Object.is(0, -0) → false; but === says true. Here we follow ===.
  if (typeof a === "number" && a === 0 && b === 0) {
    // If one is -0 and the other is +0, 1/a → Infinity vs 1/b → -Infinity
    if (1 / a !== 1 / b) return false; // Treat +0 and -0 as different
  }

  // Both are objects (including arrays)
  if (typeof a === "object") {
    // Circular reference check
    if (seen.has(a) && seen.has(b)) return seen.get(a) === b;
    seen.set(a, b);

    // Date
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    // RegExp
    if (a instanceof RegExp && b instanceof RegExp) {
      return a.source === b.source && a.flags === b.flags;
    }

    // Map
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (const [key, val] of a) {
        if (!b.has(key) || !deepEquals(val, b.get(key), seen)) {
          return false;
        }
      }
      return true;
    }

    // Set
    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      // Convert to arrays and compare via deepEquals
      const aArr = [...a];
      const bArr = [...b];
      return deepEquals(aArr.sort(), bArr.sort(), seen);
    }

    // Array or plain object mismatch
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEquals(a[key], b[key], seen)) return false;
    }

    return true;
  }

  return false;
}

// Test cases
console.log("Same object:", deepEquals({ a: 1 }, { a: 1 }));          // true
console.log("Different:", deepEquals({ a: 1 }, { a: 2 }));            // false
console.log("NaN:", deepEquals(NaN, NaN));                            // true
console.log("+0 vs -0:", deepEquals(0, -0));                          // false
console.log("Nested:", deepEquals({ a: [1, 2] }, { a: [1, 2] }));    // true
console.log("Nested diff:", deepEquals({ a: [1, 2] }, { a: [1, 3] })); // false

// Circular equality
const a = { x: 1 };
a.self = a;
const b = { x: 1 };
b.self = b;
console.log("Circular:", deepEquals(a, b)); // true
```

---

## 4. `Object.is()` — The Built-in Strict Comparison

`Object.is()` is like `===` with two fixes:

```js-exec
// === fails on these two cases:
console.log("=== NaN:", NaN === NaN);          // false (bug)
console.log("=== +0/-0:", +0 === -0);          // true (bug)

// Object.is fixes both:
console.log("Object.is NaN:", Object.is(NaN, NaN));      // true
console.log("Object.is +0/-0:", Object.is(+0, -0));     // false

// Everything else is ===
console.log(Object.is(1, 1));       // true
console.log(Object.is({}, {}));     // false
console.log(Object.is(null, null)); // true
```

---

## 5. `structuredClone()` — The Modern Native Solution

If you're targeting modern browsers, `structuredClone` handles most cases:

```js-exec
// structuredClone handles:
// - Primitives, objects, arrays
// - Date, RegExp, Map, Set
// - ArrayBuffer, TypedArrays
// - Blob, File
// - Circular references

const original = {
  name: "Naveen",
  created: new Date(),
  data: new Map([["key", new Set([1, 2, 3])]]),
};

if (typeof structuredClone === "function") {
  const cloned = structuredClone(original);
  console.log("structuredClone:", cloned);
  console.log("Same Date?", original.created === cloned.created); // false
} else {
  console.log("structuredClone not available in this environment");
}

// structuredClone CANNOT clone: functions, DOM nodes, Error objects, WeakMap, WeakSet
```

---

## Key Takeaways

- **Shallow copy** (`...`, `Object.assign`) only copies top-level properties — nested objects are shared.
- **Deep clone** recursively copies every level — use `seen` Map to handle circular references.
- Handle special types: `Date` (via `getTime()`), `RegExp` (via `source`/`flags`), `Map`, `Set`.
- **`structuredClone()`** is the best option for modern targets — but can't clone functions or DOM nodes.
- **Deep equality** needs `NaN` === `NaN` and `+0` ≠ `-0` handling, plus circular ref detection.
- Always use a **`seen` Map** for circular reference handling in both clone and equals.

---

**Next:** [Data #2 — Flatten & Unflatten Objects](/articles/javascript-series/js-flatten-unflatten-object) — convert nested objects to flat key paths and back.
