A monad wraps a value and lets you chain operations without worrying about null, undefined, or errors. The Maybe monad handles nullable values. The Either monad handles success/failure paths. Both eliminate defensive null checks and try/catch litter.

**Prerequisites:** [FP #1 — compose/pipe](/articles/javascript-series/js-compose-pipe)

---

## 1. The Problem — Defensive Null Checks Everywhere

```js-exec
// Without monads — null checks at every level
function getZipCode(user) {
  if (user && user.address && user.address.zip) {
    return user.address.zip;
  }
  return "Unknown";
}

console.log(getZipCode({ address: { zip: "560001" } })); // "560001"
console.log(getZipCode(null));                             // "Unknown"
console.log(getZipCode({}));                                // "Unknown"
```

---

## 2. Maybe Monad — Chain Without Null Checks

`Maybe` wraps a value that might be null/undefined. Operations are applied only if the value exists:

```js-exec
class Maybe {
  constructor(value) {
    this._value = value;
  }

  static of(value) {
    return new Maybe(value);
  }

  static nothing() {
    return new Maybe(null);
  }

  isNothing() {
    return this._value === null || this._value === undefined;
  }

  map(fn) {
    return this.isNothing() ? Maybe.nothing() : Maybe.of(fn(this._value));
  }

  chain(fn) {
    return this.isNothing() ? Maybe.nothing() : fn(this._value);
  }

  getOrElse(defaultValue) {
    return this.isNothing() ? defaultValue : this._value;
  }
}

// Usage — no null checks!
const user = { address: { zip: "560001" } };
const emptyUser = null;

const zipCode1 = Maybe.of(user)
  .map((u) => u.address)
  .map((a) => a.zip)
  .getOrElse("Unknown");

const zipCode2 = Maybe.of(emptyUser)
  .map((u) => u.address)
  .map((a) => a.zip)
  .getOrElse("Unknown");

console.log("Valid user zip:", zipCode1);  // "560001"
console.log("Null user zip:", zipCode2);   // "Unknown"
```

---

## 3. Either Monad — Success/Failure Paths

`Either` has two variants: `Right` (success) and `Left` (failure). `map` only runs on `Right`. `chain` enables branching:

```js-exec
class Left {
  constructor(value) {
    this._value = value;
  }
  map(_fn) { return this; } // Left ignores map — error propagates
  chain(_fn) { return this; }
  fold(leftFn, _rightFn) { return leftFn(this._value); }
  getOrElse(defaultValue) { return defaultValue; }
}

class Right {
  constructor(value) {
    this._value = value;
  }
  map(fn) { return new Right(fn(this._value)); }
  chain(fn) { return fn(this._value); }
  fold(_leftFn, rightFn) { return rightFn(this._value); }
  getOrElse(_defaultValue) { return this._value; }
}

// Helper
const Either = {
  tryCatch: (fn) => {
    try {
      return new Right(fn());
    } catch (err) {
      return new Left(err);
    }
  },
};

// Usage
function parseJSON(str) {
  return Either.tryCatch(() => JSON.parse(str));
}

function getUserId(obj) {
  if (!obj.user?.id) throw new Error("Missing user.id");
  return obj.user.id;
}

const process = (input) =>
  parseJSON(input)
    .chain((parsed) => Either.tryCatch(() => getUserId(parsed)))
    .map((id) => `User #${id}`)
    .fold(
      (err) => `Error: ${err.message}`,
      (result) => `Success: ${result}`
    );

console.log(process('{"user":{"id":42}}'));   // "Success: User #42"
console.log(process('{"noUser":true}'));      // "Error: Missing user.id"
console.log(process('invalid'));              // "Error: Unexpected token..."
```

---

## 4. Railway-Oriented Programming Visualized

```js-exec
console.log("Railway pattern with Either:");
console.log("");
console.log("  Input → [Parse JSON] → [Get User ID] → [Format] → Output");
console.log("            │                  │              │");
console.log("            ├─ Error ──────────┤              │");
console.log("            │   (Left track)   │              │");
console.log("            │                  │              │");
console.log("            └──→  Skip  ──────→┼──→  Skip ──→┼──→ Error handler");
console.log("");
console.log("Once a Left is produced, all subsequent .map() calls are no-ops.");
console.log(".fold() at the end handles both tracks.");
```

---

## 5. Chaining Async Operations with Either

```js-exec
async function asyncEither(promise) {
  try {
    const value = await promise;
    return new Right(value);
  } catch (err) {
    return new Left(err);
  }
}

async function fetchUser(id) {
  if (id < 0) throw new Error("Invalid ID");
  return { id, name: "Naveen" };
}

async function main(userId) {
  const result = await asyncEither(fetchUser(userId));
  return result
    .map((user) => user.name.toUpperCase())
    .fold(
      (err) => `Failed: ${err.message}`,
      (name) => `Hello, ${name}!`
    );
}

main(42).then(console.log);  // "Hello, NAVEEN!"
main(-1).then(console.log);  // "Failed: Invalid ID"
```

---

## Key Takeaways

- **Maybe**: wraps nullable values — `map`/`chain` skip when null/undefined. Use for deep property access.
- **Either/Result**: wraps operations that may fail — `Right` for success, `Left` for failure.
- **`.map(fn)`**: transforms the wrapped value (if it exists/is success).
- **`.chain(fn)`**: like `map` but `fn` returns a new monad — enables branching.
- **`.fold(errFn, okFn)`**: unwrap both paths at the end — the only place errors are handled.
- Monads compose — chain `Maybe` with `Either` for null-safe, error-safe pipelines.

---

**Next:** [FP #4 — Point-Free Style & Referential Transparency](/articles/javascript-series/js-point-free-style) — write functions without naming arguments.
