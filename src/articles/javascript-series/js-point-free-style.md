Point-free style (tacit programming) defines functions without explicitly naming the arguments they operate on. Combined with pure functions and referential transparency, it can make code more declarative — or completely unreadable. This article shows both sides.

**Prerequisites:** [FP #1 — compose/pipe](/articles/javascript-series/js-compose-pipe), [Functions #2 — Currying](/articles/javascript-series/js-currying-partial-application)

---

## 1. What is Point-Free Style?

"Point" means the argument. Point-free means you don't name it:

```js-exec
const users = [
  { name: "Alice", active: true },
  { name: "Bob", active: false },
  { name: "Carol", active: true },
];

// Pointed — explicitly names the argument
const activeUsers1 = users.filter(function (user) {
  return user.active;
});

// Still pointed — arrow function names 'u'
const activeUsers2 = users.filter((u) => u.active);

// Point-free — the argument is implicit
const prop = (key) => (obj) => obj[key];
const activeUsers3 = users.filter(prop("active"));

console.log(activeUsers3.map(prop("name"))); // ["Alice", "Carol"]
```

---

## 2. Common Point-Free Patterns

```js-exec
// Utility: prop, eq, not, both, either
const prop = (key) => (obj) => obj[key];
const eq = (a) => (b) => a === b;
const not = (fn) => (...args) => !fn(...args);
const both = (f, g) => (...args) => f(...args) && g(...args);

// Point-free examples:
const isActive = prop("active");
const isAdmin = (user) => user.role === "admin"; // Pointed (role isn't a simple prop)

const numbers = [1, 2, 3, 4, 5, 6, 7, 8];

// Pointed
const evensPointed = numbers.filter((n) => n % 2 === 0);

// Point-free
const isEven = (n) => n % 2 === 0;
const evensFree = numbers.filter(isEven);

console.log("Evens:", evensFree);

// map + filter composition (point-free):
const result = numbers
  .filter((n) => n > 3)
  .map((n) => n * 2);

console.log("Result:", result); // [8, 10, 12, 14, 16]
```

---

## 3. When Point-Free Goes Wrong

```js-exec
// ❌ Overly abstract — what does this do?
const process = (data) =>
  data
    .filter((x) => x > 0)
    .map((x) => ({ value: x }))
    .reduce((acc, x) => acc + x.value, 0);

// ✅ Clear — names convey intent
const getTotalRevenue = (transactions) =>
  transactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

// Rule: point-free is great for single-property access, simple predicates,
// and well-named utility chains. It becomes harmful when:
// 1. The data flow is hard to trace
// 2. Intermediate values have meaningful names
// 3. The concept isn't a well-known pattern
```

---

## 4. Referential Transparency — Same Input, Same Output

A function is **referentially transparent** if you can replace a call with its return value without changing program behavior:

```js-exec
// ✅ Referentially transparent:
function add(a, b) {
  return a + b;
}
// add(2, 3) can always be replaced by 5 — no side effects, no external state

// ❌ Not referentially transparent:
let count = 0;
function increment() {
  count++;
  return count;
}
// increment() gives different results each time — depends on external state

// ❌ Also not transparent:
function getTime() {
  return Date.now();
}
// Every call returns a different value

// ❌ Side effect (not transparent):
function logAndAdd(a, b) {
  console.log("Adding..."); // Side effect — can't replace with just the sum
  return a + b;
}
```

---

## 5. Pure Functions — The Foundation

```js-exec
// Pure function checklist:
// ✅ Same input → same output (deterministic)
// ✅ No side effects (no console.log, no DOM, no network, no mutation)
// ✅ No external mutable state

// Pure:
function square(n) { return n * n; }
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

// Impure:
// function getData() { return fetch('/api/users'); }    // Side effect: network
// function setTitle(el, text) { el.innerText = text; }  // Side effect: DOM
// function random() { return Math.random(); }            // Non-deterministic

// Impure functions are necessary — programs must DO things.
// The FP approach: push impurity to the edges, keep the core pure.
console.log("Push side effects to the edges; keep business logic pure");
```

---

## Key Takeaways

- **Point-free**: don't name arguments when the function is clear without them (`arr.filter(isEven)`, not `arr.filter(x => isEven(x))`).
- **Point-free is a tool, not a goal** — use it when it clarifies, avoid it when it obscures.
- **Referential transparency** means an expression can be replaced by its value — the foundation of equational reasoning.
- **Pure functions** are deterministic and side-effect-free — they're predictable, testable, and cacheable.
- Push side effects (I/O, DOM, network) to the application boundary; keep the core pure.

---

**Next:** [FP #5 — Immutability Patterns](/articles/javascript-series/js-immutability-patterns) — `Object.freeze`, `structuredClone`, and Immer-style patterns.
