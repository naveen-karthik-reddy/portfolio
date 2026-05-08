Every JavaScript developer uses `var`, `let`, and `const` — but few understand what actually happens when you declare a variable. This article walks through scope, hoisting, and the Temporal Dead Zone with examples you can edit and run.

**Prerequisites:** None — this is the starting point for the JavaScript Foundations series.

---

## 0. What Is a Variable?

A **variable** is a named container in memory that holds a value. When you write `let age = 25`, three things happen:

1. **Declaration** — you tell the engine "I want a variable named `age`"
2. **Initialization** — the engine sets aside memory for it (and may fill it with `undefined`)
3. **Assignment** — the value `25` is placed into that memory

Different keywords (`var`, `let`, `const`) change *when* initialization happens and *where* the variable lives — that's what scope and hoisting are about.

Think of it like this:

```
let age = 25;
//  ┬   ┬
//  │   └── Assignment (put 25 in the box)
//  └────── Declaration + Initialization (create the box)
```

---

## 1. The Three Ways to Declare Variables

JavaScript gives you three keywords: `var` (function-scoped, hoisted with `undefined`), `let` (block-scoped, TDZ), and `const` (block-scoped, TDZ, cannot be reassigned).

```js-exec
// var — function-scoped
var x = 10;
console.log("var x:", x);

// let — block-scoped, reassignable
let y = 20;
console.log("let y:", y);
y = 21;
console.log("let y reassigned:", y);

// const — block-scoped, cannot reassign
const z = 30;
console.log("const z:", z);
// z = 31; // ❌ TypeError: Assignment to constant variable
```

If you uncomment the `z = 31` line and run it, you'll see the runtime error. `const` prevents reassignment but does *not* make objects immutable:

```js-exec
const obj = { name: "Naveen" };
obj.name = "Karthik";  // ✅ Allowed — mutating the object
console.log(obj);
// obj = {}; // ❌ TypeError — reassigning the binding itself
```

---

## 2. Function Scope vs Block Scope

`var` is scoped to the nearest **function**. `let` and `const` are scoped to the nearest **block** (`{ }`).

```js-exec
function scopeDemo() {
  if (true) {
    var a = "I am var — function scoped";
    let b = "I am let — block scoped";
    const c = "I am const — block scoped";
  }

  console.log(a); // ✅ Accessible — var ignores the if block
  console.log(typeof b, typeof c); // Both undefined — b and c died with the block
}

scopeDemo();
```

This is the single biggest reason `var` is considered harmful: it doesn't respect block boundaries, so a variable declared inside an `if` or `for` leaks into the surrounding function. This leads to accidental overwrites, closure bugs in loops, and code that's hard to reason about. `let` and `const` fix all three by being block-scoped and creating fresh bindings per loop iteration.

`setTimeout` schedules a function to run **later**, after the loop has already finished. With `var`, all three callbacks point to the same `i` (now `3`). With `let`, each iteration gets its own `j` with the value frozen at that iteration.

```js-exec
// var in loop — only ONE variable, shared across all iterations
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var i:", i), 10); // Prints 3, 3, 3
}

// let in loop — NEW variable per iteration
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let j:", j), 10); // Prints 0, 1, 2
}
```

---

## 3. Global Scope — The `window` Difference

`var` in global scope attaches itself to the global object (`window` in browsers, `globalThis` everywhere). `let` and `const` do not — they exist in a separate global lexical environment.

```js-exec
var globalVar = "I'm on window";
let globalLet = "I'm not on window";

console.log(window.globalVar); // "I'm on window" ✅
console.log(window.globalLet); // undefined — let doesn't attach to window
```

This matters because `window` properties can collide with built-ins (`name`, `status`, `top`) and third-party scripts. `let`/`const` keep your variables isolated.

---

## 4. Redeclaration Rules

`var` lets you redeclare the same variable name in the same scope — no error, just silently overwrites. `let` and `const` throw a `SyntaxError` if you try.

```js-exec
// var allows redeclaration (common source of bugs)
var count = 1;
var count = 2; // No error — silently overwrites
console.log("count:", count); // 2

// let blocks redeclaration in the same scope
let total = 10;
// let total = 20; // ❌ SyntaxError: Identifier 'total' has already been declared
console.log("total:", total);
```

The rule: **you can redeclare `var` anywhere in the same function. You cannot redeclare a `let`/`const` in the same block scope.** However, you CAN use the same `let` name in a nested block — that's shadowing (covered below), not redeclaration.

---

## 5. Hoisting — What Gets Lifted

During compilation, the engine registers all declarations *before* executing code. `var` declarations are hoisted and initialized to `undefined`. `let` and `const` are hoisted but **not initialized** — they exist in the TDZ.

```js-exec
// This prints undefined, NOT a ReferenceError
console.log("var before declaration:", hoistedVar);
var hoistedVar = 42;

// This WOULD throw a ReferenceError — uncomment to see:
// console.log("let before declaration:", hoistedLet);
// let hoistedLet = 99;
```

Here's the mental model of what the engine does:

```
// What you write:
console.log(x);
var x = 5;

// What the engine sees after hoisting:
var x = undefined;   // Declaration hoisted, initialized to undefined
console.log(x);      // undefined
x = 5;               // Assignment stays in place
```

For `let`/`const`, the declaration is hoisted but the variable remains **uninitialized** until the `let`/`const` line executes:

```js-exec
function tdzDemo() {
  // TDZ for 'name' starts here — the declaration exists, but it's uninitialized

  try {
    console.log(name); // ReferenceError: Cannot access before initialization
  } catch (e) {
    console.log("Caught:", e.message);
  }

  let name = "Naveen"; // TDZ ends here — variable is now initialized
  console.log("After declaration:", name);
}

tdzDemo();
```

Even `typeof` — the operator that's safe for undeclared variables — throws inside the TDZ:

```js-exec
// typeof on an undeclared variable → "undefined" (safe)
console.log("typeof undeclared:", typeof completelyUnknown);

// typeof on a TDZ variable → ReferenceError
try {
  console.log(typeof inTDZ);
} catch (e) {
  console.log("typeof in TDZ throws:", e.message);
}
let inTDZ = "here";
```

---

## 6. Function Declarations vs Function Expressions

Function **declarations** are hoisted completely — name AND body. Function **expressions** (assigning to a variable) follow the variable's hoisting rules.

```js-exec
// Function declaration — fully hoisted
console.log(greet("World")); // ✅ Works before declaration

function greet(name) {
  return `Hello, ${name}!`;
}

// Function expression with var — only the variable is hoisted (to undefined)
try {
  greetExpr("World"); // TypeError: greetExpr is not a function
} catch (e) {
  console.log("Expression call before assignment:", e.message);
}

var greetExpr = function (name) {
  return `Hi, ${name}!`;
};
```

Arrow functions assigned to `const` are also not hoisted:

```js-exec
try {
  arrowFn(); // ReferenceError: Cannot access before initialization
} catch (e) {
  console.log("Arrow before declaration:", e.message);
}

const arrowFn = () => console.log("Arrow works!");
arrowFn(); // ✅ Fine after declaration
```

---

## 7. Shadowing — When Inner Blocks Hide Outer Variables

A variable in an inner scope **shadows** a variable with the same name in an outer scope if it's declared with the same keyword or a more restrictive one.

```js-exec
let message = "outer";

function shadowDemo() {
  console.log(message); // → "outer" — no shadow yet

  let message = "inner"; // Shadows the outer 'message' within this block
  console.log(message); // → "inner"
}

shadowDemo();
console.log(message); // → "outer" — the shadow died with the function
```

Illegal shadowing — `var` cannot shadow `let` because `var` is scoped to the **function**, not the block. So when the engine hoists `var`, it tries to register it in the same scope as the outer `let` — causing a collision:

```js-exec
// This is fine: let in outer scope, let shadows in inner block
let val = 10;
if (true) {
  let val = 20; // OK — different block, independent variable
  console.log("inner:", val);
}
console.log("outer:", val);

// But this fails — var hoists to the FUNCTION scope, not the block:
// let count = 5;
// function demo() {
//   if (true) {
//     var count = 10; // SyntaxError — var hoists to 'demo', collides with outer 'let'
//   }
// }
```

---

## 8. The Scope Chain — How the Engine Looks Up Variables

When you reference a variable, the engine walks the **scope chain** from inner to outer until it finds a match — or throws `ReferenceError`.

```
Global Scope
├── outerVar (not here — go deeper)
├── global  ✅ FOUND
│
└── outer() Scope
    ├── innerVar (not here — go deeper)
    ├── outerVar ✅ FOUND
    │
    └── inner() Scope
        ├── innerVar ✅ FOUND
        └── (not here → check outer)
```

```js-exec
const global = "I am global";

function outer() {
  const outerVar = "I am from outer";

  function inner() {
    const innerVar = "I am from inner";

    console.log(innerVar); // Found in inner scope
    console.log(outerVar); // Found in outer scope (closure)
    console.log(global);   // Found in global scope
    // console.log(unknown); // Would throw ReferenceError
  }

  inner();
}

outer();
```

This scope chain is what makes closures possible — inner functions retain access to their outer scope variables even after the outer function returns.

---

## 9. `var` Hoisting in Functions

`var` inside a function is hoisted to the top of that function, not to the global scope:

```js-exec
function varInside() {
  console.log("pre-declaration:", localVar); // undefined
  var localVar = "scoped to varInside";
  console.log("post-declaration:", localVar);
}

varInside();
console.log("outside:", typeof localVar); // undefined — localVar is function-scoped
```

---

## Key Takeaways

| Keyword | Scope | Hoisted? | Initialized? | Can Reassign? |
|---|---|---|---|---|
| `var` | Function | Yes | To `undefined` | Yes |
| `let` | Block | Yes (TDZ) | No — TDZ until assignment | Yes |
| `const` | Block | Yes (TDZ) | No — TDZ until assignment | No |
| `function` | Block/Function | Yes (fully) | Name + body | N/A |

- **Hoisting** is not physical movement — it's the compile-time registration of declarations.
- **TDZ** means the variable exists but accessing it before the `let`/`const` line throws `ReferenceError`.
- **Always use `const` by default, `let` when reassignment is needed, and never `var`** unless maintaining legacy code.
- Function declarations are fully hoisted; function expressions follow variable rules.

---

**Next:** [JS Foundations #2 — `this` Demystified](/articles/javascript-series/js-this-demystified) — the four binding rules that determine what `this` points to in every situation.
