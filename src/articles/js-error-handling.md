Error handling in JavaScript goes beyond `try/catch`. **Without error handling, a single uncaught error crashes your entire program** — the rest of your code never runs. Error handling lets you gracefully recover, show fallback UI, log what went wrong, and keep the app alive.

This article covers the full toolkit: `try/catch/finally`, custom error classes, re-throwing patterns, unhandled promise rejections, and global error listeners.

**Prerequisites:** [JS Foundations #1 — Variables & Scope](/articles/javascript-series/js-variables-scope-hoisting)

---

## 1. `throw` — Starting an Error

Before we can catch errors, we need to know how to **create** one. The `throw` statement immediately stops the current function and starts unwinding the call stack until a `catch` block is found:

```js-exec
function validateAge(age) {
  if (age < 0) {
    throw new Error("Age cannot be negative");
    // Nothing after 'throw' ever runs — execution stops here
  }
  return "Age is valid";
}

validateAge(-5); // This throws — try commenting this out
```

If no `catch` exists anywhere up the stack, the program terminates (or the promise rejects unhandled). Always throw `Error` objects, never plain strings or numbers — `Error` objects include a stack trace showing exactly where the problem happened.

---

## 2. `try/catch/finally` — The Basics

The `try` block runs code that may throw. The `catch` block receives the error. The `finally` block runs regardless of whether an error occurred:

```js-exec
function divide(a, b) {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

try {
  console.log(divide(10, 2));  // 5
  console.log(divide(10, 0));  // throws — rest of try block is skipped
  console.log("This never runs");
} catch (err) {
  console.log("Caught:", err.message);
} finally {
  console.log("Cleanup runs no matter what");
}

console.log("Execution continues after try/catch");
```

The `catch` parameter is optional (ES2019) — you can omit it if you only need the `finally`:

```js-exec
try {
  throw new Error("Oops");
} catch {
  console.log("Caught but don't need the error object");
}
```

---

## 3. The Error Object

JavaScript has several built-in error types:

```js-exec
const errors = [
  new Error("Generic error"),
  new TypeError("Expected a string"),
  new RangeError("Index out of range"),
  new ReferenceError("Variable not defined"),
  new SyntaxError("Invalid code"),
  new URIError("Malformed URI"),
];

for (const err of errors) {
  console.log(err.name.padEnd(18), "|", err.message);
}
```

Key properties of any Error object:

```js-exec
try {
  JSON.parse("not json");
} catch (err) {
  console.log("name:", err.name);       // "SyntaxError"
  console.log("message:", err.message); // "Unexpected token ..."
  console.log("stack:", err.stack?.split("\n")[0]); // First line of stack trace
}
```

---

## 4. Custom Error Classes

Extend `Error` to create domain-specific errors with extra data:

```js-exec
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

function validateUser(user) {
  if (!user.name) throw new ValidationError("Name is required", "name");
  if (user.age < 0) throw new ValidationError("Age cannot be negative", "age");
  return true;
}

try {
  validateUser({ name: "", age: -5 });
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(`Validation failed on "${err.field}": ${err.message}`);
  } else {
    console.log("Unknown error:", err.message);
  }
}
```

Using `instanceof` to distinguish error types is cleaner than checking `err.name` or `err.message`.

---

## 5. `finally` Always Runs — Even After `return`

The `finally` block executes even if `try` has a `return` statement:

```js-exec
function testFinally() {
  try {
    console.log("Inside try");
    return "try's return";
  } catch (err) {
    console.log("Inside catch");
    return "catch's return";
  } finally {
    console.log("Inside finally — ALWAYS runs");
  }
}

const result = testFinally();
console.log("Got:", result);
```

Note: `finally` runs, but the `return` from `try` wins. If `finally` itself has a `return`, it overrides everything:

```js-exec
function finallyOverrides() {
  try {
    return "from try";
  } finally {
    return "from finally";
  }
}

console.log(finallyOverrides()); // "from finally"
```

---

## 6. Re-throwing Errors

Sometimes you catch an error to log it, then **re-throw** it so a higher-level handler can deal with it:

```js-exec
function saveToDatabase(data) {
  throw new Error("Database connection failed");
}

function processRequest(data) {
  try {
    saveToDatabase(data);
  } catch (err) {
    console.log("Logging:", err.message);
    throw err; // Re-throw — let the caller decide how to handle this
  }
}

try {
  processRequest({ name: "Naveen" });
} catch (err) {
  console.log("Top-level handler:", err.message); // Both layers act
}
```

This is the **log-and-throw** pattern — useful in layered architectures where the top-level code decides what to show the user.

---

## 7. Catching Async Errors

`try/catch` works with `async/await` — just wrap the `await`:

```js-exec
async function fetchUser(id) {
  if (id < 0) throw new Error("Invalid user ID");
  // Simulate an async operation
  return { id, name: "Naveen" };
}

async function main() {
  try {
    const user = await fetchUser(-1);
    console.log("User:", user);
  } catch (err) {
    console.log("Async error caught:", err.message);
  }
}

main();
```

Without `await`, you need `.catch()` — a rejected promise doesn't throw synchronously:

```js-exec
function failingPromise() {
  return Promise.reject(new Error("Async failure"));
}

// ❌ This won't catch it — the promise rejection is outside try/catch
try {
  failingPromise(); // No await — rejection is uncaught here
} catch (err) {
  console.log("Never reached");
}

// ✅ Correct: use .catch()
failingPromise().catch((err) => console.log("Caught with .catch:", err.message));
```

---

## 8. Unhandled Promise Rejections

A rejected promise with no `.catch()` triggers the `unhandledrejection` event:

```js-exec
// In browsers, you'd use:
// window.addEventListener("unhandledrejection", (event) => {
//   console.log("Unhandled rejection:", event.reason);
// });

// Simulating the concept:
const pending = Promise.reject(new Error("Forgotten rejection"));
// If nothing catches this, the browser fires 'unhandledrejection'

// In Node.js:
// process.on("unhandledRejection", (reason, promise) => { ... });
console.log("In a real browser, check the console for unhandled rejection warnings");
```

Always add a `.catch()` or `try/catch` around your promises.

---

## 9. Global Error Handling

Catch errors that escape all `try/catch` blocks:

```js-exec
// Browser global error handler:
// window.addEventListener("error", (event) => {
//   console.log("Global error:", event.message, event.filename, event.lineno);
//   // Return true to prevent the default browser error
//   return true;
// });

// window.onerror = function (message, source, lineno, colno, error) {
//   console.log("Caught:", message);
//   return true; // Prevents default browser error display
// };

console.log("Global error handlers are set up once at app initialization.");
console.log("They catch unhandled errors but should NOT be used for recovery —");
console.log("only for logging/monitoring.");
```

---

## 10. Error Boundary Pattern

In complex apps, wrap parts of the app in "error boundaries" that catch errors and show a fallback UI:

```js-exec
function errorBoundary(fn, fallback) {
  try {
    return fn();
  } catch (err) {
    console.log("Boundary caught:", err.message);
    return fallback;
  }
}

function riskyOperation() {
  if (Math.random() > 0.5) throw new Error("Random failure");
  return "Success!";
}

// Run 5 times and catch each failure independently
for (let i = 0; i < 5; i++) {
  const result = errorBoundary(riskyOperation, "Fallback value");
  console.log(`Attempt ${i + 1}:`, result);
}
```

---

## 11. Throwing Non-Error Values

You can `throw` anything — but don't. Always throw `Error` objects so you get stack traces:

```js-exec
// ❌ Bad — throws a string, no stack trace
try {
  throw "Something went wrong";
} catch (err) {
  console.log("String as error:", err);
  console.log("Has stack?", !!err.stack); // false — no stack!
}

// ✅ Good — always throw Error instances
try {
  throw new Error("Something went wrong");
} catch (err) {
  console.log("Has stack?", !!err.stack); // true
}
```

---

## Key Takeaways

- `try/catch/finally` — `finally` runs no matter what, even after `return`.
- Use `instanceof` to distinguish custom error types — cleaner than checking `err.name`.
- `async/await` errors work with `try/catch`. Plain promises need `.catch()`.
- Always throw `Error` objects (or subclasses), never strings or numbers.
- Set up global error listeners for logging, not recovery.
- Handle promise rejections — unhandled ones crash Node.js and pollute browser consoles.

---

**Next:** [JS Foundations #7 — Destructuring, Spread & Rest](/articles/javascript-series/js-destructuring-spread-rest) — array/object destructuring with defaults, spread for copying/merging, and rest parameters.
