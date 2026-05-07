JavaScript didn't have built-in modules for its first 20 years. Developers invented their own — first IIFE patterns, then CommonJS for servers, AMD for browsers, and finally ES Modules as the official standard. This article traces the evolution and implements each pattern.

**Prerequisites:** [JS Foundations #3 — Closures](/articles/javascript-series/js-closures-lexical-scope)

---

## 1. The IIFE Module Pattern (Pre-ES6)

Before any module system, the IIFE (Immediately Invoked Function Expression) created private scope and returned a public API:

```js-exec
const MyModule = (function () {
  // Private — not accessible outside
  const privateVar = "secret";
  function privateFn() {
    return privateVar;
  }

  // Public — returned and accessible
  return {
    publicMethod() {
      return privateFn().toUpperCase();
    },
    publicVar: "exposed",
  };
})();

console.log(MyModule.publicMethod()); // "SECRET"
console.log(MyModule.publicVar);      // "exposed"
console.log(MyModule.privateVar);     // undefined — truly private!
```

---

## 2. The Revealing Module Pattern

A cleaner variant that defines everything private then explicitly reveals what's public:

```js-exec
const Calculator = (function () {
  // All definitions are private by default
  function add(a, b) { return a + b; }
  function subtract(a, b) { return a - b; }
  function multiply(a, b) { return a * b; }
  function _internalLog(msg) { console.log("[Calc]", msg); }
  const PI = 3.14159;

  // Explicitly reveal only what we want to expose
  return {
    add,
    subtract,
    // multiply is NOT revealed — it's private!
    PI,
  };
})();

console.log(Calculator.add(2, 3)); // 5
console.log(Calculator.multiply);  // undefined — not revealed
```

---

## 3. CommonJS — The Node.js Standard

CommonJS uses `require()` and `module.exports`. Each file is wrapped in a function so it has its own scope:

```js-exec
// Simulating how Node wraps CommonJS modules:
function requireSimulation() {
  function wrap(code) {
    // This is what Node does internally:
    const wrapper = [
      "(function (exports, require, module, __filename, __dirname) {",
      code,
      "\n})",
    ];
    return wrapper.join("");
  }

  const wrapped = wrap(`
    // This is module code — it has its own scope
    const secret = "local";
    module.exports.greet = function (name) {
      return "Hello, " + name;
    };
    module.exports.version = "1.0.0";
  `);

  console.log("Node wraps CommonJS code in a function:");
  console.log(wrapped);

  // The simulated require:
  const module = { exports: {} };
  const fn = new Function("exports", "require", "module", `
    const secret = "local";
    module.exports.greet = function (name) {
      return "Hello, " + name;
    };
    module.exports.version = "1.0.0";
  `);
  fn(module.exports, null, module);

  return module.exports;
}

const mod = requireSimulation();
console.log(mod.greet("Naveen")); // "Hello, Naveen"
console.log(mod.version);         // "1.0.0"
console.log(mod.secret);          // undefined — module-scoped
```

Key CommonJS traits:
- **Synchronous** loading — `require()` is blocking
- **Single export object** — `module.exports` is what you get
- **Copy of exports** — you get a copy, not a live binding

---

## 4. AMD — Asynchronous Module Definition (Browser)

AMD was designed for browsers where loading files is async:

```js-exec
// AMD pattern — define() with dependency array
function define(name, deps, factory) {
  // In real AMD (RequireJS): load deps asynchronously, then call factory
  // For this simulation, we resolve synchronously:
  const resolvedDeps = deps.map((dep) => {
    if (dep === "jquery") return { $: "jQuery" };
    if (dep === "lodash") return { map: "lodash map" };
    return {};
  });
  return factory(...resolvedDeps);
}

const myModule = define("myModule", ["jquery", "lodash"], function ($, _) {
  return {
    doSomething() {
      console.log("Using", $, "and", _);
    },
  };
});

myModule.doSomething();
// AMD = async loading for browser, specify deps upfront
```

---

## 5. ES Modules — The Official Standard

ESM is **static** — imports/exports are known at parse time, enabling tree-shaking:

```js-exec
// ESM syntax (conceptual — real ESM needs browser/server):
console.log("ESM features:");
console.log("  1. Static structure — imports known at parse time");
console.log("  2. Named exports: export const x = 1;");
console.log("  3. Default exports: export default function() {}");
console.log("  4. Live bindings — import gets updated value, not a copy");
console.log("  5. Async loading — import() returns a promise");
console.log("  6. Tree-shakeable — bundlers remove unused exports");

// Dynamic import example:
async function loadModule() {
  // In a real app, this would load a separate file
  const mod = await Promise.resolve({
    default: function () { return "loaded!"; },
    named: 42,
  });
  console.log("Dynamic import:", mod.default(), mod.named);
}

loadModule();
```

---

## 6. Comparing the Module Systems

```js-exec
console.log("│ System    │ Loading  │ Scope     │ Tree-shake? │ Live bindings? │");
console.log("│───────────│──────────│───────────│─────────────│────────────────│");
console.log("│ IIFE      │ None     │ Function  │ No          │ No             │");
console.log("│ CommonJS  │ Sync     │ Function  │ No          │ No — copy      │");
console.log("│ AMD       │ Async    │ Function  │ No          │ No             │");
console.log("│ ESM       │ Async    │ Module    │ Yes         │ Yes            │");

// ESM live bindings demo (conceptual):
// counter.js:  export let count = 0; export function inc() { count++; }
// main.js:     import { count, inc } from './counter.js';
//              console.log(count); // 0
//              inc();
//              console.log(count); // 1 ← live binding! CommonJS would still be 0
```

---

## Key Takeaways

- **IIFE**: private scope via function closures — the precursor that proved modules were possible.
- **CommonJS** (`require`/`module.exports`): synchronous, server-first, copies exports.
- **AMD** (`define`): async, browser-first, dependency array.
- **ESM** (`import`/`export`): static, tree-shakeable, live bindings, the modern standard.
- ESM's **static structure** is its biggest advantage — bundlers can analyze and eliminate dead code at build time.

---

**Next:** [Classes Under the Hood](/articles/javascript-series/js-classes-under-hood) — desugar `class`, `extends`, `super`, and private fields to ES5.
