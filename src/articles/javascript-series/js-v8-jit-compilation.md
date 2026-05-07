V8 compiles JavaScript to machine code using a two-tier system: **Ignition** (interpreter, fast startup) and **TurboFan** (optimizing compiler, fast execution). Between them lies the secret to JavaScript's near-native performance: hidden classes and inline caching. This article explains how V8 makes your code fast and what patterns accidentally slow it down.

**Prerequisites:** None — but familiarity with JavaScript functions and objects helps.

---

## 1. The Two-Compiler Pipeline

V8 uses a layered approach:

```
Source Code → Parser → AST → Ignition (interpreter) → Bytecode
                                      ↓ (hot functions)
                                TurboFan (compiler) → Optimized Machine Code
                                      ↓ (bailout/deopt)
                                Back to Ignition (bytecode)
```

```js-exec
// Ignition runs this first as bytecode — fast to start
function add(a, b) {
  return a + b;
}

// If 'add' is called many times ("hot"), TurboFan compiles it to machine code
for (let i = 0; i < 10000; i++) {
  add(i, i + 1);
}

console.log("If this function was hot, TurboFan optimized it");
```

---

## 2. Hidden Classes (Shape) — How V8 Optimizes Objects

V8 doesn't use dictionary lookups for object properties. It assigns each object a **hidden class** (also called a "Shape" or "Map") that describes its property layout:

```js-exec
// These two objects share the SAME hidden class
const obj1 = { a: 1, b: 2 };
const obj2 = { a: 3, b: 4 };

// Property access becomes an offset lookup, NOT a hash lookup:
// obj1.a → (*obj1) + offset_0 → 1
// obj1.b → (*obj1) + offset_8 → 2

console.log("These two objects likely share the same hidden class");
```

The hidden class is determined by property order:

```js-exec
// ❌ Different hidden classes — different property order!
const objA = { a: 1, b: 2 };
const objB = { b: 2, a: 1 };

// ✅ Same hidden class — same constructor/pattern
function Point(x, y) {
  this.x = x; // Same order every time
  this.y = y;
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
// p1 and p2 share the same hidden class
console.log("Constructor functions create objects with the same hidden class");
```

---

## 3. Inline Caching (IC) — Remembering Property Locations

V8 caches the location of properties the first time it looks them up. This is called **inline caching**:

```js-exec
function getX(obj) {
  return obj.x; // V8 remembers: "last time, obj had hidden class H, and x was at offset 0"
}

// Monomorphic: only one hidden class seen → fast path
const point = { x: 10, y: 20 };
getX(point); // IC records: if hidden class matches Point, x is at offset 0

// Calling getX with the same shape → instant, zero hash lookup
for (let i = 0; i < 1000; i++) {
  getX({ x: i, y: i }); // Same hidden class → IC hits every time
}

console.log("Monomorphic: 1 hidden class → fastest");
```

---

## 4. Polymorphic and Megamorphic — When Caching Fails

```js-exec
function getProp(obj) {
  return obj.x;
}

// Monomorphic (1 shape): ✅ fast
getProp({ x: 1, y: 2 });

// Polymorphic (2-4 shapes): ⚠️ slower but still optimized
getProp({ x: "a" });         // Different shape — only has x
getProp({ x: true, z: 3 });  // Different shape — x, z

// Megamorphic (5+ shapes): ❌ V8 gives up, falls back to dictionary lookup
getProp({ x: 1, a: 1 });
getProp({ x: 2, b: 2 });
getProp({ x: 3, c: 3, d: 4 });

// Each call with a new shape degrades the inline cache
console.log("Polymorphic: 2-4 shapes → slower");
console.log("Megamorphic: 5+ shapes → slowest (dictionary mode)");
```

---

## 5. The Optimization / Deoptimization Cycle

TurboFan makes assumptions based on observed types. If those assumptions break, it **deopts** — throws away the optimized code and falls back to the interpreter:

```js-exec
function add(a, b) {
  return a + b;
}

// Phase 1: add is always called with numbers → TurboFan optimizes for numbers
for (let i = 0; i < 10000; i++) {
  add(i, i + 1); // Always integers → optimized for integer addition
}

// Phase 2: Now we call it with strings → assumption broken → DEOPT!
add("hello", "world"); // V8: "I optimized for numbers, but this is a string! Bail out!"

// After deopt, the function runs in the interpreter for a while.
// If the mixed behavior continues, TurboFan may re-optimize differently.
console.log("Deoptimization = throwing away machine code + restarting in interpreter");
```

---

## 6. What Stays Fast in V8

```js-exec
// ✅ Fast patterns:
// 1. Constructor functions — same initialization order every time
function User(name, age) {
  this.name = name;
  this.age = age;
}

// 2. Monomorphic function calls
function process(user) {
  return user.name; // Always a User object → monomorphic
}

// 3. Keep object shapes consistent
const items = [];
for (let i = 0; i < 1000; i++) {
  items.push({ x: i, y: i }); // Same shape every iteration → fast
}

// 4. Avoid adding properties after creation
// ✅ Good: pre-declare all properties
const obj = { a: 1, b: 2, c: 3 };

// ❌ Bad: adding properties dynamically creates new hidden classes
// obj.d = 4; // Creates a transition to a new hidden class!

console.log("Keep object shapes consistent, avoid dynamic property addition");
```

---

## Key Takeaways

- V8 uses **Ignition** (interpreter) for quick startup and **TurboFan** (compiler) for hot functions.
- **Hidden classes** map property names to offsets — like C structs, not hash maps.
- **Inline caching** remembers which hidden class + offset a property was at — the key to fast property access.
- **Monomorphic** (1 shape) → fast. **Polymorphic** (2-4 shapes) → OK. **Megamorphic** (5+) → slow.
- **Deoptimization** happens when optimized code's assumptions are violated — e.g., type changes, new properties added.
- Always initialize properties in the same order, and prefer constructors to create consistent object shapes.

---

**Next:** [V8 #2 — Memory Leaks & Garbage Collection](/articles/javascript-series/js-memory-leaks-gc) — the four SPA leak patterns and how mark-and-sweep works.
