Destructuring, spread, and rest syntax are three of the most-used ES6 features. They replace whole blocks of manual extraction, copying, and argument collection with concise syntax.

**Before vs After:**

```js
// Without destructuring — verbose, repetitive
const first = arr[0];
const second = arr[1];
const name = user.name;
const role = user.role;

// With destructuring — clean, one line per source
const [first, second] = arr;
const { name, role } = user;
```

This article covers every variant with runnable examples.

**Prerequisites:** [JS Foundations #1 — Variables & Scope](/articles/javascript-series/js-variables-scope-hoisting)

---

## 1. Array Destructuring — Positional Extraction

Extract array values into named variables based on position:

```js-exec
const colors = ["red", "green", "blue"];

// Basic
const [first, second, third] = colors;
console.log(first, second, third); // red green blue

// Skip elements
const [a, , c] = colors;
console.log(a, c); // red blue

// Rest pattern — collect the rest
const [head, ...tail] = colors;
console.log(head); // red
console.log(tail); // ["green", "blue"]

// Default values when the array is shorter
const [x = "default", y = "default", z = "default", w = "default"] = ["only one"];
console.log(x, y, z, w); // only one, default, default, default
```

Swapping variables without a temp — a classic destructuring use case:

```js-exec
let a = 1;
let b = 2;

[a, b] = [b, a];

console.log("a:", a, "b:", b); // a: 2, b: 1
```

---

## 2. Object Destructuring — Named Extraction

Extract object properties by name — order doesn't matter:

```js-exec
const user = {
  name: "Naveen",
  role: "Frontend Engineer",
  location: "Remote",
  skills: ["React", "JavaScript", "Performance"],
};

// Basic
const { name, role } = user;
console.log(name); // Naveen
console.log(role); // Frontend Engineer

// Rename while extracting
const { name: fullName, role: jobTitle } = user;
console.log(fullName); // Naveen
console.log(jobTitle); // Frontend Engineer

// Default values for missing properties
const { age = 25, salary = "Not disclosed" } = user;
console.log(age);     // 25 (default, user has no 'age')
console.log(salary);  // Not disclosed
```

---

## 3. Nested Destructuring

Destructure deeply nested structures in one statement:

```js-exec
const company = {
  name: "TechCorp",
  ceo: {
    name: "Alice",
    address: {
      city: "San Francisco",
      country: "USA",
    },
  },
  employees: [
    { name: "Bob", role: "Dev" },
    { name: "Carol", role: "Design" },
  ],
};

// Deep extraction
const {
  ceo: {
    name: ceoName,
    address: { city, country },
  },
  employees: [{ name: firstEmployeeName }],
} = company;

console.log(ceoName);            // Alice
console.log(city, country);      // San Francisco, USA
console.log(firstEmployeeName);  // Bob
```

---

## 4. Destructuring in Function Parameters

The most practical pattern — destructure directly in the function signature:

```js-exec
// Without destructuring — unclear what the function expects
function createUserBad(data) {
  console.log(data.name, data.role, data.active);
}

// With destructuring — self-documenting + defaults
function createUser({ name, role = "User", active = true } = {}) {
  console.log(name, role, active);
}

// Works with partial data
createUser({ name: "Naveen" });                    // Naveen, User, true
createUser({ name: "Karthik", role: "Admin" });   // Karthik, Admin, true

// With = {} default, even calling with no args works:
createUser(); // undefined, User, true — no crash!
```

The `= {}` at the end makes the entire parameter optional. Without it, calling the function with no arguments tries to destructure `undefined`, which throws:

```js-exec
function unsafe({ name }) {
  console.log(name);
}

try {
  unsafe(); // No argument — destructures undefined → TypeError
} catch (e) {
  console.log("Error:", e.message);
}
```

Always add `= {}` when a destructured parameter is optional.

---

## 5. Spread Operator — Copy and Merge

The `...` spread operator "expands" an iterable or object into individual elements:

```js-exec
// Array spread — copying
const original = [1, 2, 3];
const copy = [...original];
console.log("Same values?", JSON.stringify(copy)); // [1,2,3]
console.log("Same reference?", original === copy); // false — it's a shallow copy

// Array spread — merging
const a = [1, 2];
const b = [3, 4];
const merged = [...a, ...b, 5];
console.log(merged); // [1, 2, 3, 4, 5]

// Inserting elements
const arr = [1, 2, 5];
const withInsert = [arr[0], ...arr.slice(1, 2), 3, 4, arr[2]];
console.log(withInsert); // [1, 2, 3, 4, 5]

// Object spread — copying
const user = { name: "Naveen", role: "Engineer" };
const userCopy = { ...user };
console.log("Same?", user === userCopy); // false

// Object spread — merging with overrides
const defaults = { theme: "light", fontSize: 14, notifications: true };
const userPrefs = { theme: "dark", fontSize: 16 };
const settings = { ...defaults, ...userPrefs };
console.log(settings); // { theme: "dark", fontSize: 16, notifications: true }

// ⚠️ Spread creates SHALLOW copies — nested objects still share references:
const original = { name: "Naveen", address: { city: "NYC" } };
const copy = { ...original };
copy.address.city = "SF";
console.log(original.address.city); // "SF" — mutated through the copy!
```

---

## 6. Spread for Immutable Updates

Spread is the standard way to update state immutably (React, Redux, etc.):

```js-exec
const state = {
  user: { name: "Naveen", settings: { theme: "light" } },
  posts: [{ id: 1, text: "Hello" }],
};

// Update a nested property (shallow — only copies one level)
const newState = {
  ...state,
  user: {
    ...state.user,
    settings: {
      ...state.user.settings,
      theme: "dark",
    },
  },
};

console.log(newState.user.settings.theme); // "dark"
console.log(state.user.settings.theme);     // "light" — original unchanged!
console.log(state.posts === newState.posts); // true — shallow, posts not copied

// Spread with array — add, update, remove
const todoList = [
  { id: 1, text: "Learn JS", done: true },
  { id: 2, text: "Learn React", done: false },
];

// Update one item
const updated = todoList.map((item) =>
  item.id === 2 ? { ...item, done: true } : item
);
console.log(updated);
```

---

## 7. Rest Parameters — Collect Remaining Arguments

Rest parameters collect all remaining arguments into a real array:

```js-exec
// The old way — arguments is array-like but not an array
function oldSum() {
  console.log(typeof arguments); // "object" — not an array
  console.log(Array.isArray(arguments)); // false
}

// Rest parameters — a real array
function sum(...nums) {
  console.log(Array.isArray(nums)); // true
  return nums.reduce((total, n) => total + n, 0);
}

console.log(sum(1, 2, 3));       // 6
console.log(sum(1, 2, 3, 4, 5)); // 15

// Mix regular params with rest
function greet(greeting, ...names) {
  return `${greeting}, ${names.join(" and ")}!`;
}

console.log(greet("Hello", "Alice", "Bob", "Carol")); // Hello, Alice and Bob and Carol!
console.log(greet("Hi")); // Hi, ! (names is empty array)
```

---

## 8. Spread vs Rest — Same Syntax, Different Context

`...` means **spread** when used to EXPAND (in calls, array/object literals). It means **rest** when used to COLLECT (in function parameters, destructuring):

```js-exec
// REST: collecting remaining items
const [first, ...remaining] = [1, 2, 3, 4];
console.log(first);     // 1
console.log(remaining); // [2, 3, 4]

// SPREAD: expanding items
const numbers = [remaining];
console.log(numbers);   // [[2, 3, 4]] — array inside array
const flat = [first, ...remaining];
console.log(flat);      // [1, 2, 3, 4] — spread flattened it

// REST: collecting remaining arguments
function logAll(prefix, ...messages) {
  for (const msg of messages) {
    console.log(prefix + ":", msg);
  }
}

// SPREAD: expanding an array into arguments
const msgs = ["Error", "Warning", "Info"];
logAll("[App]", ...msgs);
```

---

## Key Takeaways

- **Destructuring** replaces manual `obj.prop` extraction with concise `const { prop } = obj`.
- **Default values** in destructuring prevent `undefined` when properties/indices are missing.
- **Rest parameters** (`...args`) collect arguments into a real array — always use instead of `arguments`.
- **Spread** (`...`) creates shallow copies and merges — `[...arr]`, `{...obj}`.
- Spread + map is the standard pattern for **immutable state updates**.
- `...` means **spread** when expanding, **rest** when collecting — context determines meaning.

---

**Next:** [JS Foundations #8 — Template Literals & Tagged Templates](/articles/javascript-series/js-template-literals) — multiline strings, expression interpolation, and building tagged template functions.
