TurboFan (V8's optimizing compiler) watches functions that run frequently. It observes the types and object shapes passed in, then generates highly specialized machine code assuming those types won't change. When those assumptions are broken, it **deoptimizes** — throws away the optimized code and falls back to the slower interpreter.

**Why this matters:** deoptimization isn't free. It costs CPU time and the function runs slower until it gets re-optimized. In hot code paths (scroll handlers, animation loops, data processing), repeated deopts can cause visible jank.

This article covers the most common deopt triggers with before/after examples.

**Prerequisites:** [V8 #1 — JIT Compilation](/articles/javascript-series/js-v8-jit-compilation)

---

## 1. The `delete` Operator — Changing Object Shape

`delete` removes a property, altering the hidden class. This deopts any function that assumed the old shape:

```js-exec
// ❌ Bad: delete changes the hidden class
function getX(obj) {
  return obj.x;
}

const obj = { x: 1, y: 2 };
getX(obj); // TurboFan optimizes: x is at offset 0 for this shape

delete obj.y; // Hidden class changed! obj no longer matches the cached shape.
getX(obj);    // DEOPT! Old shape assumption broken.

// ✅ Good: set to null/undefined instead of deleting
const obj2 = { x: 1, y: 2 };
obj2.y = null; // Shape unchanged — no deopt!
console.log("Set to null instead of deleting:", obj2);
```

---

## 2. The `arguments` Object — Hidden Side Effects

Using `arguments` in non-strict mode has magical behavior (it's linked to named parameters). This prevents optimization:

```js-exec
// ❌ Bad: arguments object prevents optimization
function sum() {
  // arguments is array-like but linked to parameters (non-strict mode)
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}

console.log(sum(1, 2, 3)); // Works, but never optimizes well

// ✅ Good: use rest parameters instead
function sumBetter(...nums) {
  // nums is a real array, no magical behavior
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    total += nums[i];
  }
  return total;
}

console.log(sumBetter(1, 2, 3)); // Works AND can be optimized
```

---

## 3. Polymorphic Property Access — Too Many Shapes

```js-exec
// ❌ Bad: passing objects with different shapes to the same function
function getName(obj) {
  return obj.name;
}

// Each call with a different shape degrades the inline cache
getName({ name: "Alice", age: 25 });       // Shape 1: name, age
getName({ id: 1, name: "Bob" });           // Shape 2: id, name (different order!)
getName({ name: "Carol" });                // Shape 3: name only
getName({ name: "Dave", role: "Admin" });  // Shape 4: name, role
getName({ isAdmin: true, name: "Eve" });   // Shape 5: isAdmin, name

// After 4+ shapes, this becomes megamorphic → falls back to dictionary lookup
console.log("Megamorphic: V8 gave up on optimizing this call site");

// ✅ Good: consistent object shapes via constructors or factory functions
function User(name) {
  this.name = name;
  this.age = null;   // Pre-declare all properties
}

getName(new User("Alice")); // All User objects have the same shape
getName(new User("Bob"));
console.log("Monomorphic: consisent shape → fast path");
```

---

## 4. `try/catch` in Hot Functions

`try/catch` blocks were historically deopt points. Modern V8 has improved this, but `try/catch` in very hot loops still constrains optimization:

```js-exec
// ❌ Was historically problematic — V8 has improved this
function parseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

// For maximum performance, handle errors outside the hot function:
// ✅ Better: separate the error handling path
function parseJSONFast(str) {
  // Validate first, then parse without try/catch in the hot path
  if (typeof str !== "string" || str.trim() === "") {
    return parseError(str);
  }
  return JSON.parse(str); // No try/catch in hot path
}

function parseError(str) {
  try { return JSON.parse(str); } catch { return null; }
}

console.log(parseJSONFast('{"valid": true}')); // { valid: true }
```

---

## 5. Mixed Types in the Same Variable

V8 optimizes based on observed types. Switching types causes deopt:

```js-exec
// ❌ Bad: mixed-type accumulator
function process(values) {
  let result = 0; // V8 sees: result is a number

  for (const val of values) {
    if (val === "reset") {
      result = ""; // Type changed! Deopt! result is now a string
    }
    result += val;
  }
  return result;
}

// ✅ Good: separate variables by type
function processBetter(values) {
  let numericResult = 0;
  let stringResult = "";

  for (const val of values) {
    if (typeof val === "number") {
      numericResult += val;
    } else {
      stringResult += val;
    }
  }

  return { numericResult, stringResult };
}

console.log("Separate type paths → no deopt");
```

---

## 6. Adding Properties After Object Creation

```js-exec
// Every dynamic property addition creates a new hidden class transition:

// ❌ Bad: adding properties dynamically
const obj = { x: 1 };
obj.y = 2; // Hidden class transition!
obj.z = 3; // Another transition!

// ✅ Good: pre-declare or use a constructor
const obj2 = { x: 1, y: 2, z: 3 }; // One hidden class from the start

// ✅ Also good: Object.assign with a consistent template
function createPoint(x, y) {
  return { x, y }; // Same shape every time
}
```

---

## 7. Deopt Pattern Summary

```js-exec
console.log("Deopt Triggers to Avoid in Hot Functions:");
console.log("");
console.log("  ❌ delete obj.prop        → Changes hidden class → deopt");
console.log("  ❌ arguments object       → Use ...rest parameters instead");
console.log("  ❌ Megamorphic calls      → More than 4 shapes → slow path");
console.log("  ❌ try/catch in hot loop  → Constrains optimization");
console.log("  ❌ Mixed types per var    → Keep variable types consistent");
console.log("  ❌ Dynamic property adds  → Pre-declare all properties");
console.log("  ❌ for...in loops         → More expensive than Object.keys()");
console.log("  ❌ eval() / with()        → Prevents all optimization");
console.log("");
console.log("  ✅ Monomorphic call sites → 1 shape per function");
console.log("  ✅ Constructors           → Consistent object shapes");
console.log("  ✅ Rest parameters        → Instead of arguments");
console.log("  ✅ Consistent types       → Don't switch number ↔ string");
```

---

## Key Takeaways

- Deopt means **throwing away optimized machine code** and restarting in the interpreter — it's expensive.
- The #1 cause: **changing object shapes** (delete, dynamic property addition, inconsistent construction order).
- The #2 cause: **mixed types** in the same variable or function parameter.
- `arguments` object in non-strict mode is a deopt trap — always use rest parameters.
- Most deopt patterns only matter in **hot functions** (called thousands of times). In cold code, they're harmless.
- Use Chrome's `--trace-deopt` flag to see what's deopting in your app.

---

**Next:** [Patterns #1 — Event Emitter / Pub-Sub](/articles/javascript-series/js-event-emitter) — implement `on`, `off`, `emit`, and `once` from scratch.
