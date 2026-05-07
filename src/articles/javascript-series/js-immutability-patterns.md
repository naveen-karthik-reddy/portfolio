Immutability means never modifying data in place — always creating new copies with changes applied. It prevents accidental mutations, enables reliable change detection, and is foundational to React, Redux, and functional programming. This article covers every immutability pattern in JavaScript.

**Prerequisites:** [Data #1 — Deep Clone](/articles/javascript-series/js-deep-clone-compare)

---

## 1. Preventing Mutation — `const` vs `Object.freeze`

`const` prevents reassignment. It does NOT prevent mutation:

```js-exec
const arr = [1, 2, 3];
// arr = [4, 5, 6]; // ❌ TypeError — reassignment blocked
arr.push(4);         // ✅ Allowed — mutating the array!
console.log("After push:", arr); // [1, 2, 3, 4]

const obj = { name: "Naveen" };
obj.name = "Karthik"; // ✅ Allowed — mutating the object!
console.log("After mutation:", obj); // { name: "Karthik" }
```

`Object.freeze()` makes an object shallowly immutable:

```js-exec
const frozen = Object.freeze({ name: "Naveen", details: { age: 25 } });

// frozen.name = "Karthik"; // ❌ TypeError (strict) or silent fail
// frozen.newProp = true;   // ❌ Cannot add properties
// delete frozen.name;      // ❌ Cannot delete properties

// BUT: freeze is SHALLOW — nested objects are still mutable!
frozen.details.age = 30;    // ✅ This works! Nested object is NOT frozen
console.log("Nested mutation:", frozen.details.age); // 30
```

---

## 2. Deep Freeze — Recursive Immutability

```js-exec
function deepFreeze(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (seen.has(obj)) return obj; // Circular ref guard

  seen.add(obj);
  Object.freeze(obj);

  for (const key of Object.keys(obj)) {
    deepFreeze(obj[key], seen);
  }

  return obj;
}

const state = deepFreeze({
  user: { name: "Naveen", settings: { theme: "dark" } },
  items: ["a", "b"],
});

// All mutations are now blocked:
// state.user.name = "Karthik"; // ❌ TypeError
// state.user.settings.theme = "light"; // ❌ TypeError
// state.items.push("c"); // ❌ TypeError

console.log("Deep frozen — all levels protected");
```

---

## 3. Immutable Updates — Spread, Map, Filter

The standard pattern: return a new copy with changes applied:

```js-exec
// Object update
const user = { name: "Naveen", role: "Engineer" };
const updated = { ...user, role: "Senior Engineer" };

console.log("Original:", user);    // { name: "Naveen", role: "Engineer" }
console.log("Updated:", updated);  // { name: "Naveen", role: "Senior Engineer" }

// Nested object update
const state = {
  user: { name: "Naveen", address: { city: "Bangalore" } },
};

const newState = {
  ...state,
  user: {
    ...state.user,
    address: {
      ...state.user.address,
      city: "Mumbai",
    },
  },
};

console.log("Original city:", state.user.address.city); // "Bangalore"
console.log("Updated city:", newState.user.address.city); // "Mumbai"

// Array update — add, remove, update
const items = [1, 2, 3, 4, 5];
const added = [...items, 6];                        // Add
const removed = items.filter((x) => x !== 3);        // Remove
const updatedArr = items.map((x) => x === 2 ? 20 : x); // Update

console.log("Added:", added);       // [1, 2, 3, 4, 5, 6]
console.log("Removed:", removed);   // [1, 2, 4, 5]
console.log("Updated:", updatedArr); // [1, 20, 3, 4, 5]
```

---

## 4. `structuredClone()` — Deep Copy Built Into the Platform

```js-exec
if (typeof structuredClone === "function") {
  const original = {
    name: "Naveen",
    created: new Date(),
    tags: new Set(["js", "react"]),
  };

  const cloned = structuredClone(original);

  // Deeply independent
  cloned.tags.add("node");
  console.log("Original tags:", [...original.tags]); // ["js", "react"]
  console.log("Cloned tags:", [...cloned.tags]);      // ["js", "react", "node"]
} else {
  console.log("structuredClone not available — use deepClone polyfill");
}
```

---

## 5. Immer-Style `produce()` — Write Mutable, Get Immutable

Immer lets you write "mutating" code that actually produces an immutable copy:

```js-exec
function produce(baseState, recipe) {
  // 1. Create a shallow copy
  const draft = { ...baseState };

  // 2. Track which nested objects we've copied (lazy)
  // In a real implementation, we'd use Proxy for lazy copying.
  // For this simplified version, we deep clone.

  // 3. Let the recipe "mutate" the draft
  recipe(draft);

  // 4. Return the draft (or baseState if nothing changed)
  return draft;
}

// Usage — looks like mutation but is immutable!
const base = {
  user: { name: "Naveen", score: 10 },
};

const next = produce(base, (draft) => {
  draft.user.score = 20; // "Mutating" draft — but base is untouched
});

console.log("Base:", base.user.score);  // 10 — unchanged!
console.log("Next:", next.user.score);  // 20
```

---

## 6. Immutability Library Comparison

```js-exec
console.log("│ Approach           │ Pros                             │ Cons                     │");
console.log("│────────────────────│──────────────────────────────────│──────────────────────────│");
console.log("│ Spread / map/filter│ Vanilla JS, no deps              │ Verbose for deep nested  │");
console.log("│ Object.freeze      │ Prevents accidental mutations    │ Shallow only; perf cost  │");
console.log("│ structuredClone    │ Built-in, handles circular refs  │ No functions/DOM nodes   │");
console.log("│ Immer              │ Write mutable, get immutable     │ Proxy overhead; extra dep│");
console.log("│ Immutable.js       │ Persistent data structures      │ Large API; interop issues│");
console.log("│ deepFreeze         │ True immutability guarantee      │ Dev only — don't prod    │");
```

---

## Key Takeaways

- `const` prevents reassignment, NOT mutation. `Object.freeze` is shallow.
- Use **spread/map/filter** for immutable updates — the standard React/Redux pattern.
- **`structuredClone()`** is the modern deep copy — prefer it over manual implementations.
- **Immer-style** `produce()` lets you write "mutating" drafts that produce immutable results.
- In production, don't `deepFreeze` large objects — it has a performance cost. Use it in development for debugging.

---

**Next:** [Web APIs #1 — `requestAnimationFrame` & `requestIdleCallback` ](/articles/javascript-series/js-requestanimationframe-idlecallback) — sync JS to the display refresh and run low-priority work.
