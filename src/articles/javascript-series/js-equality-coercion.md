Type coercion is why `[] + {}` produces `"[object Object]"` and `[] == ![]` is `true`. This article walks through the abstract equality algorithm, implicit coercion rules, and every edge case that interviewers love to ask about.

**Prerequisites:** [JS Foundations #1 — Variables & Scope](/articles/javascript-series/js-variables-scope-hoisting)

---

## 1. `==` vs `===` — The Core Difference

`===` (strict equality) checks both **type and value** — no coercion. `==` (abstract equality) **coerces types first**, then compares.

```js-exec
console.log(1 === 1);   // true — same type, same value
console.log(1 === "1"); // false — different types, no coercion with ===

console.log(1 == "1");  // true — string "1" is coerced to number 1
console.log(0 == false); // true — false is coerced to 0
console.log(0 == "");    // true — empty string coerced to 0
```

Rule of thumb: **always use `===` unless you specifically want coercion.** There's no performance difference worth thinking about.

---

## 2. The Abstract Equality Algorithm (The Rules for `==`)

When you write `x == y`, the engine follows these steps in order:

1. **Same type?** → Use `===`
2. **null == undefined?** → `true`
3. **Number vs String?** → Convert string to number, compare again
4. **Boolean vs anything?** → Convert boolean to number, compare again
5. **Object vs primitive?** → Convert object to primitive, compare again
6. Otherwise → `false`

```js-exec
// Rule 2: null == undefined (but nothing else)
console.log(null == undefined);      // true
console.log(null == 0);              // false
console.log(null == false);          // false
console.log(null == "");             // false
console.log(undefined == 0);         // false
console.log(undefined == false);     // false

// Rule 3: number vs string — string → number
console.log(42 == "42");             // true — "42" → 42
console.log(0 == "");                // true — "" → 0
console.log(0 == "   ");             // true — "   " → 0 (trimmed)
console.log(0 == "0x0");            // true — "0x0" → 0

// Rule 4: boolean vs anything — boolean → number
console.log(1 == true);              // true — true → 1
console.log(0 == false);             // true — false → 0
console.log("1" == true);            // true — true → 1, then "1" → 1
```

---

## 3. The Infamous `[] == ![]` — Step by Step

```js-exec
// [] == ![] → ??? Let's trace the algorithm

// Step 1: ![] evaluates first. [] is truthy, so ![] is false
// [] == false

// Step 2: Boolean on one side — convert to number. false → 0
// [] == 0

// Step 3: Object vs primitive — convert [] to primitive.
// [].toString() → ""
// "" == 0

// Step 4: String vs number — convert string to number. "" → 0
// 0 == 0

// Step 5: Same type — true!

console.log([] == ![]);    // true ✅
console.log([] == false);  // true
console.log("" == false);  // true
console.log(0 == false);   // true
```

Now you can reason through any coercion puzzle.

---

## 4. The `+` Operator — Addition or Concatenation?

The `+` operator is **overloaded**: if either operand is a string, it concatenates. Otherwise, it adds:

```js-exec
// Both numbers → addition
console.log(1 + 2);        // 3

// String present → concatenation
console.log("1" + 2);      // "12"
console.log(1 + "2");      // "12"
console.log("1" + "2");    // "12"

// Boolean coerced to number for addition
console.log(true + true);  // 2 (1 + 1)
console.log(true + false); // 1 (1 + 0)

// Object → toString, then concatenate
console.log([] + []);      // "" — [].toString() → "" for both
console.log([] + {});      // "[object Object]" — [].toString() → "" + {}.toString() → "[object Object]"
console.log({} + []);      // "[object Object]" in most cases, but depends on position!
```

The `{} + []` gotcha: `{}` at the start is parsed as an empty block statement, not an object:

```js-exec
// {} + [] — when {} is at the start, it's a block, not an object
// This is equivalent to:  (empty block); +[]
// +[] → +"" → 0

// But within parentheses, {} is treated as an object:
console.log({} + []);      // "[object Object]" (in console.log context)
```

---

## 5. Other Arithmetic Operators — `-`, `*`, `/`, `%`

These operators always coerce to numbers:

```js-exec
console.log("10" - 2);     // 8 — "10" → 10
console.log("10" * "2");   // 20 — both → numbers
console.log("10" / "2");   // 5
console.log("10" % "3");   // 1

console.log([] - 1);       // -1 — [] → "" → 0, then 0 - 1
console.log(["5"] - 2);    // 3 — ["5"] → "5" → 5

console.log(true + true);  // 2
console.log(true - false); // 1
```

---

## 6. The Unary `+` and `-` Operators

Unary `+` coerces its operand to a number. Unary `-` does the same then negates:

```js-exec
console.log(+"42");        // 42
console.log(+true);        // 1
console.log(+false);       // 0
console.log(+"");          // 0
console.log(+"hello");     // NaN
console.log(+[]);          // 0  — [] → "" → 0
console.log(+[5]);         // 5  — [5] → "5" → 5
console.log(+[1, 2]);      // NaN — [1,2] → "1,2" → NaN
```

---

## 7. ToPrimitive — How Objects Become Primitives

When coercion needs a primitive from an object, the engine calls `ToPrimitive`:
1. If hint is `"string"` → try `toString()` then `valueOf()`
2. If hint is `"number"` or `"default"` → try `valueOf()` then `toString()`

You can control this with `Symbol.toPrimitive`:

```js-exec
const obj = {
  valueOf() {
    console.log("valueOf called");
    return 42;
  },
  toString() {
    console.log("toString called");
    return "hello";
  },
};

// Numeric context → prefers valueOf
console.log(+obj);      // valueOf called → 42
console.log(Number(obj)); // valueOf called → 42

// String context → prefers toString
console.log(String(obj)); // toString called → "hello"
console.log(`${obj}`);    // toString called → "hello"

// Symbol.toPrimitive takes complete control:
const custom = {
  valueOf() { return 10; },
  toString() { return "ten"; },
  [Symbol.toPrimitive](hint) {
    console.log("hint:", hint);
    if (hint === "number") return 99;
    if (hint === "string") return "custom";
    return "default";
  },
};

console.log(+custom);          // hint: number → 99
console.log(`${custom}`);      // hint: string → "custom"
console.log(custom + "");      // hint: default → "default"
```

---

## 8. `Object.is()` — Better Strict Equality

`Object.is()` is like `===` but with two corrections:

```js-exec
// === bug: NaN is not equal to NaN
console.log(NaN === NaN);          // false
console.log(Object.is(NaN, NaN));  // true — fixed!

// === bug: +0 and -0 are indistinguishable
console.log(+0 === -0);            // true
console.log(Object.is(+0, -0));   // false — fixed!

// Everything else — same as ===
console.log(Object.is(1, 1));     // true
console.log(Object.is(1, "1"));   // false
console.log(Object.is({}, {}));    // false
```

---

## 9. Truthy and Falsy

The **6 falsy values**: `false`, `0`, `""`, `null`, `undefined`, `NaN`. Everything else is truthy — including `[]`, `{}`, `" "`, and `-1`.

```js-exec
const values = [false, 0, -0, "", null, undefined, NaN, true, 1, -1, "hello", " ", [], {}];

for (const v of values) {
  console.log(String(v).padEnd(12), "→", v ? "truthy" : "falsy");
}
```

---

## Key Takeaways

- `===` checks type AND value — no coercion. `==` coerces first.
- The `==` algorithm: same type → compare; null/undefined → true; string → number; boolean → number; object → primitive.
- `+` is overloaded — if either operand is a string, it concatenates.
- `-`, `*`, `/`, `%` always coerce to numbers.
- Falsy values: `false`, `0`, `""`, `null`, `undefined`, `NaN`. Everything else is truthy.
- `Object.is()` fixes `NaN` and `+0`/`-0` edge cases in `===`.

---

**Next:** [JS Foundations #6 — Error Handling](/articles/javascript-series/js-error-handling) — `try/catch/finally`, custom error classes, and global error handlers.
