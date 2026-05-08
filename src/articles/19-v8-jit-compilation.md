JavaScript runs fast on modern hardware not because it's inherently efficient, but because the engine works hard to make it so. V8 profiles your code as it runs and compiles the hot paths to machine code that rivals what a C compiler would produce — but only if your code cooperates. When it doesn't, you get silent deoptimizations that cost throughput without any obvious error.

---

## V8's Compilation Pipeline

V8 (Chrome, Node.js, Edge) uses a two-tier compilation pipeline:

**Ignition** is V8's interpreter. It parses JavaScript into an AST, then compiles it to compact **bytecode** and executes that bytecode directly. Bytecode is faster to generate than machine code and uses less memory, making it ideal for code that runs once or infrequently.

**TurboFan** is V8's optimizing [JIT](/articles/what-is-jit-compilation) compiler. It watches which functions are called frequently ("hot" functions), profiles their types and shapes, and compiles them to highly optimized machine code based on those observations.

```text
JS Source
  ↓ Parse
AST
  ↓ Compile
Bytecode (Ignition executes this)
  ↓ [if function is "hot"]
Optimized Machine Code (TurboFan)
```

---

## Hidden Classes

V8 assigns every object a **hidden class** — an internal descriptor of its shape (the names and order of its properties). When objects share the same shape, V8 can treat them as the same type and use faster property access paths.

```js
// ✅ Same hidden class — V8 can use a single optimized access path for both
function Point(x, y) {
  this.x = x;
  this.y = y;
}
const p1 = new Point(1, 2);
const p2 = new Point(3, 4);

// ❌ Different hidden classes — property order differs, so V8 treats these as different shapes
const q1 = { x: 1, y: 2 };
const q2 = { y: 2, x: 1 };
```

Adding properties to an object after construction creates a new hidden class transition:

```js
// ❌ Each assignment creates a new hidden class — two transitions for one object
const obj = {};
obj.x = 1; // hidden class A
obj.y = 2; // hidden class B — transition required

// ✅ Initialize everything upfront — one hidden class, no transitions
const obj = { x: 1, y: 2 };
```

Initialize all properties in the constructor, in the same order, every time.

---

## Monomorphic vs Polymorphic Call Sites

A function call site is **monomorphic** if it always receives objects of the same hidden class. TurboFan can inline and specialize the compiled code for that one type.

A **polymorphic** call site receives 2–4 different types. TurboFan generates a type check and branches.

A **megamorphic** call site receives many types. TurboFan gives up specializing and falls back to a generic (slower) path.

```js
// ✅ Monomorphic — always called with Point objects, TurboFan inlines property access
function getX(point) {
  return point.x;
}

// ❌ Megamorphic — called with many different object shapes, TurboFan can't specialize
function getValue(obj) {
  return obj.value; // obj could be a User, Product, Event, Config...
}
```

Keep your hot functions monomorphic by ensuring they always receive the same object shape.

---

## Deoptimization

When TurboFan's assumptions are violated at runtime — a type changes, an unexpected value arrives — it **deoptimizes**: discards the optimized machine code and falls back to Ignition's bytecode. Deoptimization itself is cheap, but the loss of optimized code hurts throughput.

Common deoptimization triggers:
- Changing an object's shape after construction
- Passing `null` or `undefined` to a function that was compiled assuming an object
- Using `arguments` object in non-trivial ways
- `try/catch` blocks (V8 historically struggled to optimize these; modern V8 is better)

DevTools → Performance → Bottom-Up shows deoptimization events as `Deoptimize` entries in the call stack.

---

## Practical Rules for JIT-Friendly Code

**Initialize all object properties in the constructor.** Don't add properties dynamically after construction.

```js
// ❌ Triggers hidden class transitions
class Config {
  constructor(data) {
    if (data.debug) this.debug = true;   // shape varies by input
    if (data.timeout) this.timeout = data.timeout;
  }
}

// ✅ Stable shape regardless of input
class Config {
  constructor(data) {
    this.debug = data.debug ?? false;    // always present
    this.timeout = data.timeout ?? 5000; // always present
  }
}
```

**Keep functions small and focused.** TurboFan is more likely to inline and optimize small functions.

**Avoid type polymorphism in hot loops.** If an array contains mixed types, V8 can't use SIMD-like optimizations.

**Don't delete properties.** `delete obj.x` transitions the object to a dictionary mode that bypasses hidden class optimization entirely.

**Avoid `arguments` in hot code.** Using `arguments` as an array prevents several optimizations. Use rest parameters (`...args`) instead.

```js
// ❌ arguments object prevents optimizations
function sum() {
  return Array.from(arguments).reduce((a, b) => a + b, 0);
}

// ✅ Rest parameters — same semantics, JIT-friendly
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
```

Most of these patterns cost nothing at the source level — writing consistent constructors and avoiding post-construction mutation is just good object design anyway. The JIT benefit is a side effect of code that's already easier to reason about.

> **Deeper dive:** See [JS V8 #1 — JIT Compilation & Hidden Classes](/articles/javascript-series/js-v8-jit-compilation) and [V8 #3 — Deoptimization Patterns](/articles/javascript-series/js-deopt-patterns) in the JavaScript series for a more detailed walkthrough of V8 internals, including inline caching and concrete deopt patterns.
