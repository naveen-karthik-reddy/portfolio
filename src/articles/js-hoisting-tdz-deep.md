Hoisting isn't magic — it's the result of how the JavaScript engine processes code in two phases: compilation (creation) and execution. This article goes deeper than the beginner-level explanation to understand what the engine actually does with execution contexts, environment records, and the Temporal Dead Zone.

**Prerequisites:** [JS Foundations #1 — Variables, Scope & Hoisting](/articles/javascript-series/js-variables-scope-hoisting)

---

## 1. The Two Phases — Creation vs Execution

Every time the engine enters a scope (global, function, block), it creates an **execution context** in two phases:

```js-exec
// What you write:
console.log(x);
var x = 5;
console.log(x);

// Phase 1 — Creation (compilation):
//   Engine scans for declarations:
//   - var x → creates binding in variable environment, initializes to undefined
//   - function declarations → fully hoisted (name + body)

// Phase 2 — Execution:
//   - Runs console.log(x) → undefined (from phase 1)
//   - Assigns x = 5
//   - Runs console.log(x) → 5

// This is why this actually works:
var y = undefined; // Implicit from phase 1
console.log(y);   // undefined (from phase 1)
y = 5;
console.log(y);   // 5
```

---

## 2. Environment Records — Where Variables Actually Live

The spec defines three kinds of environment records:

```js-exec
// 1. Declarative Environment Record — for let, const, class, function
//    Variables are created but UNINITIALIZED (TDZ) until the declaration line

// 2. Object Environment Record — for var in global scope
//    Variables become properties of the global object (window)

// 3. Function Environment Record — for function scope
//    Has an additional [[ThisValue]], [[ThisBindingStatus]], etc.

// Demonstrating var → global object connection:
var globalVar = "I am on window";
console.log("var creates window property:", typeof window !== "undefined" && window.globalVar === globalVar);

// let and const do NOT become window properties:
let scopedLet = "I am NOT on window";
console.log("let does NOT create window property:", typeof window !== "undefined" && window.scopedLet === undefined);
```

---

## 3. The Temporal Dead Zone — Why It Exists

The TDZ exists because `let`/`const` hoist the **binding** but not the **initialization**:

```js-exec
// This creates an execution context with:
// - let x: binding EXISTS but is UNINITIALIZED (TDZ)

// Phase 1 (Creation):
//   let x → binding created, status: uninitialized

// Phase 2 (Execution):
//   Start of block → TDZ for x begins
//   console.log(x) → ReferenceError! x is in TDZ
//   let x = 5 → x is initialized, TDZ ends
//   console.log(x) → 5

{
  // console.log(x); // ❌ ReferenceError — x is in TDZ
  let x = 5;
  console.log(x); // ✅ 5 — TDZ ended
}

// TDZ is temporal, not spatial — it's about execution ORDER, not position
```

The key insight: `typeof` is NOT safe for TDZ variables:

```js-exec
// typeof on an undeclared variable → "undefined" (safe)
console.log(typeof neverDeclared); // "undefined"

// typeof on a TDZ variable → ReferenceError (NOT safe)
try {
  console.log(typeof inTDZ);
} catch (e) {
  console.log("typeof in TDZ:", e.message); // Cannot access before initialization
}
let inTDZ = "value";
```

---

## 4. Function Declarations in Blocks — The Surprising Case

Function declarations inside blocks behave differently in strict vs sloppy mode:

```js-exec
// Strict mode (ESM default): block-scoped like let
"use strict";
{
  function foo() { return "inside block"; }
  console.log(foo()); // "inside block"
}
// console.log(foo()); // ReferenceError (in strict mode)

// Sloppy mode: hoisted to the enclosing function BUT initialized
// with undefined, then set when the block executes
// This is a web compatibility quirk — never rely on it.
```

---

## 5. Class Hoisting — Classes are NOT Fully Hoisted

`class` declarations are hoisted like `let` — binding exists in TDZ until the class body runs:

```js-exec
// Function declarations: fully hoisted ✅
console.log(typeof myFunc); // "function"
function myFunc() {}

// Class declarations: hoisted with TDZ ❌
try {
  // console.log(typeof MyClass); // ReferenceError — TDZ!
} catch (e) {
  console.log("Class in TDZ:", e?.message ?? "ReferenceError");
}

class MyClass {}
console.log(typeof MyClass); // "function" — now it's available

// Class expressions: follow the variable's rules
// const x = class {} → x is in TDZ until this line
```

---

## 6. Summary — Hoisting Rules by Declaration Type

```js-exec
console.log("│ Declaration    │ Hoisted?   │ Initial Value    │ TDZ?        │");
console.log("│────────────────│────────────│──────────────────│─────────────│");
console.log("│ var            │ Yes        │ undefined         │ No          │");
console.log("│ let            │ Yes        │ <uninitialized>   │ Yes         │");
console.log("│ const          │ Yes        │ <uninitialized>   │ Yes         │");
console.log("│ function decl  │ Yes        │ Function object   │ No          │");
console.log("│ class decl     │ Yes        │ <uninitialized>   │ Yes         │");
console.log("│ import         │ Yes        │ Live binding      │ N/A         │");
console.log("│ function* decl │ Yes        │ Generator object  │ No          │");
```

---

## Key Takeaways

- Execution contexts are created in two phases: **creation** (hoisting, scope setup) and **execution** (code runs line by line).
- `var` hoists with `undefined` initialization; `let`/`const` hoist but stay uninitialized (TDZ).
- TDZ is **temporal**, not spatial — based on execution order within the block.
- `typeof` on a TDZ variable throws `ReferenceError` — the one case where `typeof` is not safe.
- Function declarations in blocks are a spec anomaly — avoid them in all modes.
- `class` hoists like `let` — must be defined before use.

---

**Next:** [Modules — IIFE, CommonJS, AMD, ESM](/articles/javascript-series/js-module-systems) — the evolution of JavaScript module systems.
