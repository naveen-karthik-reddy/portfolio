A quick-reference cheatsheet for checking every JavaScript type correctly — primitives, arrays, dates, maps, sets, and more.

---

## Primitives

Use `typeof` for all primitives except `null`.

```js-exec
const s = "hello";
const n = 42;
const b = true;
const u = undefined;
const big = 123n;
const sym = Symbol("id");

console.log(typeof s === "string");     // true
console.log(typeof n === "number");     // true
console.log(typeof b === "boolean");    // true
console.log(typeof u === "undefined");  // true
console.log(typeof big === "bigint");   // true
console.log(typeof sym === "symbol");   // true
```

---

## `null` — the special case

`typeof null` returns `"object"` (a historic JS bug). Always use strict equality.

```js-exec
const x = null;

console.log(typeof x);         // "object"  ← misleading
console.log(x === null);       // true  ← correct check
console.log(x == undefined);   // true  ← checks null OR undefined
console.log(x === undefined);  // false ← strict: null ≠ undefined
```

---

## Arrays — `Array.isArray()`

`typeof []` returns `"object"`, so you need `Array.isArray`.

```js-exec
const arr = [1, 2, 3];
const obj = { length: 3 };

console.log(Array.isArray(arr));  // true
console.log(Array.isArray(obj));  // false  ← array-like, but not an array
console.log(typeof arr);          // "object"  ← useless for arrays
```

---

## Functions

```js-exec
function greet() {}
const arrow = () => {};
const cls = class Foo {};

console.log(typeof greet === "function");  // true
console.log(typeof arrow === "function");  // true
console.log(typeof cls === "function");    // true  ← classes are functions
```

---

## Plain objects

Check `typeof === "object"` AND rule out `null` and arrays.

```js-exec
function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

console.log(isPlainObject({}));          // true
console.log(isPlainObject({ a: 1 }));   // true
console.log(isPlainObject(null));        // false
console.log(isPlainObject([]));          // false
console.log(isPlainObject(new Date())); // true  ← Date is also an object
```

---

## Built-in objects — `instanceof`

Use `instanceof` for `Date`, `Map`, `Set`, `RegExp`, `Promise`, and `Error`.

```js-exec
console.log(new Date()    instanceof Date);    // true
console.log(new Map()     instanceof Map);     // true
console.log(new Set()     instanceof Set);     // true
console.log(/abc/         instanceof RegExp);  // true
console.log(new Error()   instanceof Error);   // true
console.log(Promise.resolve() instanceof Promise); // true
```

---

## The universal tool — `Object.prototype.toString`

Returns an exact `[object Type]` tag for any value, including ones `typeof` and `instanceof` can't distinguish.

```js-exec
const tag = (v) => Object.prototype.toString.call(v);

console.log(tag("hello"));        // [object String]
console.log(tag(42));             // [object Number]
console.log(tag(true));           // [object Boolean]
console.log(tag(null));           // [object Null]
console.log(tag(undefined));      // [object Undefined]
console.log(tag([]));             // [object Array]
console.log(tag({}));             // [object Object]
console.log(tag(new Date()));     // [object Date]
console.log(tag(new Map()));      // [object Map]
console.log(tag(new Set()));      // [object Set]
console.log(tag(/abc/));          // [object RegExp]
console.log(tag(function(){}));   // [object Function]
```

---

## Summary table

| What you want to check | Correct method |
|---|---|
| `string` | `typeof x === "string"` |
| `number` | `typeof x === "number"` |
| `boolean` | `typeof x === "boolean"` |
| `undefined` | `typeof x === "undefined"` |
| `bigint` | `typeof x === "bigint"` |
| `symbol` | `typeof x === "symbol"` |
| `null` | `x === null` |
| Array | `Array.isArray(x)` |
| Function | `typeof x === "function"` |
| Plain object | `x !== null && typeof x === "object" && !Array.isArray(x)` |
| Date | `x instanceof Date` |
| Map | `x instanceof Map` |
| Set | `x instanceof Set` |
| RegExp | `x instanceof RegExp` |
| Any type precisely | `Object.prototype.toString.call(x)` |

For the full explanation of why these quirks exist, see [Data Types & Type Checking](/articles/js-data-types).
