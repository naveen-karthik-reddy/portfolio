Type checking in JavaScript is a minefield. `typeof null === "object"`, `NaN` has type `"number"`, and `Array.isArray` exists because `typeof []` lies. Building type utilities from scratch tests whether you know which tool to reach for and when each one breaks.

---

## What are Type Utilities?

Type-checking utilities (`isString`, `isNumber`, `isArray`, `isPlainObject`, etc.) are helpers that reliably determine what kind of value you're dealing with. JavaScript ships with three type-checking primitives — `typeof`, `instanceof`, and `Object.prototype.toString.call()` — and each has specific blind spots you need to know.

- **`typeof`** is fast and works for primitives, but has the infamous bug: `typeof null === "object"`. It also can't distinguish arrays from plain objects.
- **`instanceof`** checks the prototype chain and handles custom classes, but breaks across execution contexts (iframes, different realms) because each realm has its own copy of built-in constructors.
- **`Object.prototype.toString.call(value)`** returns `[object Type]` — the most reliable check for built-in types (`[object Array]`, `[object Date]`, etc.) and the basis for most library-grade type checking.

The hardest utility is `isPlainObject` — distinguishing a plain `{}` from instances of `Date`, `RegExp`, `Map`, or custom classes. This requires inspecting the prototype chain: a plain object's immediate prototype is either `Object.prototype` or `null` (for `Object.create(null)`).

These utilities are foundational. Every library (Lodash, Ramda, etc.) ships its own set, and interviewers use them to test whether you understand JavaScript's type system quirks rather than just the API surface.

---

## The Problem

> "Implement a set of type-checking utilities: `isString`, `isNumber`, `isBoolean`, `isNull`, `isUndefined`, `isArray`, `isObject`, `isFunction`, and `isPlainObject`. Each should return `true` only for the type it claims to check."

---

## Thought Process

JavaScript gives us three type-checking tools:

1. **`typeof`** — fast, works for primitives, but `typeof null === "object"` and `typeof [] === "object"` are both wrong
2. **`instanceof`** — checks the prototype chain, works for custom classes, breaks across realms (iframes)
3. **`Object.prototype.toString.call()`** — returns `[object Type]`, the most reliable for built-in types

The interview tests whether you know which tool to use for which type. The rule of thumb: use `typeof` for primitives, `Array.isArray` for arrays, and `Object.prototype.toString.call()` for distinguishing plain objects from other objects.

---

## Step 1 — `typeof` — What It Gets Right and Wrong

```js-exec
console.log(typeof "hello");       // "string"    ✓
console.log(typeof 42);            // "number"    ✓
console.log(typeof true);          // "boolean"   ✓
console.log(typeof undefined);     // "undefined" ✓
console.log(typeof function(){});  // "function"  ✓
console.log(typeof Symbol());      // "symbol"    ✓

// Now the surprises
console.log(typeof null);          // "object"    ✗ (legacy bug)
console.log(typeof []);            // "object"    ✗ (can't distinguish from plain objects)
console.log(typeof {});            // "object"    ✓
console.log(typeof NaN);           // "number"    ✓ (but NaN is "Not a Number"...)
```

---

## Step 2 — Base Implementations

For primitives, `typeof` works — with special handling for `null`:

```js-exec
function isString(v)  { return typeof v === "string"; }
function isNumber(v)  { return typeof v === "number" && !Number.isNaN(v); }
function isBoolean(v) { return typeof v === "boolean"; }
function isNull(v)    { return v === null; }
function isUndefined(v) { return v === undefined; }
function isFunction(v) { return typeof v === "function"; }

// Tests
console.log(isString("hi"));     // true
console.log(isString(42));       // false
console.log(isNumber(42));       // true
console.log(isNumber(NaN));      // false — special case
console.log(isNumber(Infinity)); // true — Infinity is technically a number
console.log(isNull(null));       // true
console.log(isNull(undefined));  // false
console.log(isNull({}));         // false
```

**The NaN question**: Is `NaN` a number? `typeof NaN === "number"` is true, but most type-checking use cases want to exclude it. State your choice: "I'm excluding NaN because it represents an invalid number."

---

## Step 3 — `isArray` and `isObject`

`typeof` fails for arrays. The reliable approach:

```js-exec
function isArray(v) {
  return Array.isArray(v);
}
// Without Array.isArray (the polyfill approach):
function isArrayPolyfill(v) {
  return Object.prototype.toString.call(v) === "[object Array]";
}

function isObject(v) {
  // Exclude null, arrays, and functions — only plain objects and custom instances
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

// Tests
console.log(isArray([1, 2, 3]));  // true
console.log(isArray({ a: 1 }));   // false
console.log(isArray(null));       // false
console.log(isObject({}));        // true
console.log(isObject([]));        // false — arrays are not plain objects
console.log(isObject(null));      // false — typeof null trap avoided
console.log(isObject(new Date())); // true — it's an object (not a plain one, but still an object)
```

---

## Step 4 — `isPlainObject`

This is the hardest one. A "plain object" is an object created by `{}` or `new Object()` — not a `Date`, `RegExp`, `Map`, or instance of a custom class.

The most reliable check inspects the prototype chain:

```js-exec
function isPlainObject(v) {
  if (typeof v !== "object" || v === null) return false;

  // Walk up the prototype chain
  let proto = Object.getPrototypeOf(v);

  // null prototype means Object.create(null) — still a plain object
  if (proto === null) return true;

  // The constructor's prototype must match the object's prototype
  // For {}, proto.constructor === Object
  return proto === Object.prototype;
}

// Tests
console.log(isPlainObject({}));              // true
console.log(isPlainObject({ a: 1 }));        // true
console.log(isPlainObject(new Object()));    // true
console.log(isPlainObject(Object.create(null))); // true — null prototype
console.log(isPlainObject([]));              // false
console.log(isPlainObject(new Date()));      // false
console.log(isPlainObject(/regex/));         // false
console.log(isPlainObject(null));            // false

class MyClass {}
console.log(isPlainObject(new MyClass()));   // false
```

---

## Step 5 — Edge Cases

**`-0` vs `+0`**: `typeof -0 === "number"` is true. Usually you don't need to special-case this, but be aware of it.

**`NaN`**: Decide whether you include it in `isNumber`. Most utility libraries exclude it. State your choice.

**Boxed primitives**: `new String("hello")` has `typeof "object"`. Most type-checking utilities treat this as an object, not a string. If needed, check with `Object.prototype.toString.call(v) === "[object String]"` but for strings specifically.

**Cross-realm `instanceof`**: If you use `instanceof Array` and the array comes from an iframe, it returns `false` because each realm has its own `Array` constructor. `Array.isArray` and `Object.prototype.toString.call()` don't have this problem.

---

## Full Solution

```js-exec
function isString(v)     { return typeof v === "string"; }
function isNumber(v)     { return typeof v === "number" && !Number.isNaN(v); }
function isBoolean(v)    { return typeof v === "boolean"; }
function isNull(v)       { return v === null; }
function isUndefined(v)  { return v === undefined; }
function isFunction(v)   { return typeof v === "function"; }
function isArray(v)      { return Array.isArray(v); }

function isObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function isPlainObject(v) {
  if (typeof v !== "object" || v === null) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === null || proto === Object.prototype;
}
```

---

## What Interviewers Are Testing

- **`typeof` quirks** — you know `typeof null === "object"` and can explain it's a legacy bug
- **`NaN` awareness** — you know `typeof NaN === "number"` and have a position on whether to include it
- **Array detection** — you know `typeof []` won't work, and `Array.isArray` is the solution
- **Plain object detection** — you can distinguish `{}` from `new Date()` using the prototype chain
- **Cross-realm issues** — you know `instanceof` breaks across iframes

---

## Complexity

| Function | Time | Space |
|----------|------|-------|
| All utilities | O(1) | O(1) |

---

## Interview Tips

- **Start with the three tools** — name `typeof`, `instanceof`, and `Object.prototype.toString.call()` before writing any code. This frames your approach.
- **Call out `typeof null` immediately** — "The first thing to know is that `typeof null` returns `"object"` — so we need a special case." This shows you know the gotcha that trips up juniors.
- **Explain `isPlainObject` carefully** — this is where interviewers spend the most time. Walk through the prototype chain logic out loud.
- **Mention `Object.prototype.toString.call()` as the fallback** — even if you don't use it for every utility, knowing it exists and when to reach for it (e.g., distinguishing `[object Date]` from `[object Object]`) shows deeper knowledge.
