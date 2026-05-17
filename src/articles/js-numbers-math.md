JavaScript has one number type — IEEE 754 double-precision 64-bit floating point. That single fact explains `NaN`, `Infinity`, `0.1 + 0.2 !== 0.3`, and `+0`/`-0`. This article covers `Number` methods, the `Math` object, and the traps interviewers test.

---

## 1. Number Representation

JavaScript uses 64-bit IEEE 754. Integers are safe up to `2^53 - 1`; beyond that precision degrades.

```js-exec
console.log(Number.MAX_SAFE_INTEGER);  // 9007199254740991
console.log(Number.MIN_SAFE_INTEGER);  // -9007199254740991
console.log(Number.MAX_VALUE);         // ~1.8e+308
console.log(Number.MIN_VALUE);         // ~5e-324 (smallest positive)
console.log(Number.EPSILON);           // ~2.2e-16 (smallest difference between two numbers)
```

For integers larger than `MAX_SAFE_INTEGER`, use `BigInt`:

```js-exec
const big = 9007199254740992n;
console.log(big + 1n);  // 9007199254740993n
```

---

## 2. `NaN` — Not a Number

`NaN` is the result of a failed numeric operation. It's the only value not equal to itself.

```js-exec
console.log(0 / 0);              // NaN
console.log(parseInt('hello'));  // NaN
console.log(NaN === NaN);        // false
console.log(Number.isNaN(NaN));  // true

// The global isNaN() coerces first — don't use it
console.log(isNaN('hello'));     // true  (coerces 'hello' → NaN)
console.log(Number.isNaN('hello')); // false (no coercion — it's a string, not NaN)
```

**Interview use**: Deep equality checks (#14), JSON.stringify (NaN → null).

---

## 3. Infinity and Finite Checks

```js-exec
console.log(1 / 0);             // Infinity
console.log(-1 / 0);            // -Infinity
console.log(Infinity > 999999); // true

// Global isFinite() coerces — use Number.isFinite()
console.log(isFinite('42'));         // true  (coerces string to number)
console.log(Number.isFinite('42'));  // false (no coercion)
console.log(Number.isFinite(1 / 0)); // false
console.log(Number.isFinite(42));    // true
```

**Interview use**: JSON.stringify (Infinity → null), range checks (#30).

---

## 4. `+0` and `-0`

IEEE 754 has signed zero. `+0 === -0` is `true`, but `Object.is(+0, -0)` is `false`.

```js-exec
console.log(+0 === -0);          // true  ← TRAP
console.log(Object.is(+0, -0));  // false

// The easiest way to check for -0
console.log(1 / +0);             // Infinity
console.log(1 / -0);             // -Infinity

function isNegativeZero(v) {
  return v === 0 && 1 / v === -Infinity;
}
console.log(isNegativeZero(-0));  // true
console.log(isNegativeZero(0));   // false
```

**Interview use**: Deep equality — `Object.is` or custom check (#14).

---

## 5. Floating-Point Precision

0.1 + 0.2 is not 0.3 — it's a binary representation artifact:

```js-exec
console.log(0.1 + 0.2);          // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);  // false

// Fix: compare within epsilon
function approxEq(a, b, epsilon = Number.EPSILON) {
  return Math.abs(a - b) < epsilon;
}
console.log(approxEq(0.1 + 0.2, 0.3));  // true

// For currency: work in cents (integers)
const total = (10 + 20) / 100;  // 0.30, not 0.1 + 0.2
```

---

## 6. `Number` Static Methods

### `Number.isInteger(value)` — Integer Check

```js-exec
console.log(Number.isInteger(42));    // true
console.log(Number.isInteger(42.5));  // false
console.log(Number.isInteger('42'));  // false — no coercion
```

### `Number.parseFloat(str)` / `Number.parseInt(str, radix)`

```js-exec
console.log(Number.parseInt('42px'));     // 42
console.log(Number.parseInt('1010', 2));  // 10 (binary)
console.log(Number.parseFloat('3.14px')); // 3.14

// Prefer these over the global versions (same behavior but clearer intent)
```

### `Number.prototype.toFixed(digits)` — Format

```js-exec
console.log((3.14159).toFixed(2));  // '3.14' (string)
console.log((3).toFixed(2));        // '3.00'
```

---

## 7. The `Math` Object

### Rounding

```js-exec
console.log(Math.floor(3.9));   // 3   (down)
console.log(Math.ceil(3.1));    // 4   (up)
console.log(Math.round(3.5));   // 4   (nearest, .5 rounds up)
console.log(Math.trunc(-3.9));  // -3  (remove fractional part)
```

### Min, Max, Range

```js-exec
console.log(Math.min(3, 1, 4, 1, 5));  // 1
console.log(Math.max(3, 1, 4, 1, 5));  // 5

// From array — use spread
const arr = [3, 1, 4, 1, 5];
console.log(Math.min(...arr));  // 1
console.log(Math.max(...arr));  // 5

// Clamp a value to a range
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
console.log(clamp(50, 0, 100));  // 50
console.log(clamp(-10, 0, 100)); // 0
console.log(clamp(200, 0, 100)); // 100
```

**Interview use**: Range filters in data selection (#30).

### Random

```js-exec
console.log(Math.random());  // 0.0... to 0.999... (never 1)

// Random integer [0, max]
function randomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}
console.log(randomInt(10));  // 0–10

// Random integer [min, max]
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
console.log(randomRange(5, 10));  // 5–10
```

### Other Useful Math Methods

```js-exec
console.log(Math.abs(-5));        // 5
console.log(Math.sqrt(16));       // 4
console.log(Math.pow(2, 10));     // 1024
console.log(2 ** 10);             // 1024 (exponentiation operator, ES2016)
console.log(Math.sign(-42));      // -1
console.log(Math.sign(0));        // 0
console.log(Math.sign(42));       // 1
```

---

## Quick Reference

| Category | Methods |
|-|-|
| **Check** | `Number.isNaN(v)`, `Number.isFinite(v)`, `Number.isInteger(v)`, `Number.isSafeInteger(v)` |
| **Parse** | `Number.parseInt(s, r)`, `Number.parseFloat(s)` |
| **Round** | `Math.floor`, `Math.ceil`, `Math.round`, `Math.trunc` |
| **Min/Max** | `Math.min(...a)`, `Math.max(...a)` |
| **Random** | `Math.random()` |
| **Other** | `Math.abs`, `Math.sqrt`, `Math.pow`, `Math.sign` |
| **Equality** | `Object.is(a, b)` — handles NaN and +0/-0 correctly |

---

## Interview Tips

- **Use `Number.isNaN`, not `isNaN`** — the global version coerces strings to numbers.
- **Use `Number.isFinite`, not `isFinite`** — same reason.
- **Use `Object.is` for strict comparisons** — handles NaN and signed zero.
- **Clamp with `Math.min(Math.max(v, min), max)`** — the one-liner for range constraints.

---

## Related Articles

- [#5 — Type Utilities](/articles/js-interview-type-utilities)
- [#14 — Implement deepEqual()](/articles/js-interview-deep-equal)
- [#30 — Implement Data Selection](/articles/js-interview-data-selection)
- [Data Types & Type Checking](/articles/js-data-types)
