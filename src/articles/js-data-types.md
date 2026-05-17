JavaScript has 7 primitive types and 1 object type. The `typeof` operator, `instanceof`, and `Object.prototype.toString` each give you different information — and each has quirks. This article covers the type system and every type-checking tool, including the traps interviewers specifically test.

---

## 1. The 8 Types

```
Primitives (7):  string  number  bigint  boolean  undefined  symbol  null
Object    (1):   everything else — arrays, functions, dates, maps, sets, classes...
```

Primitives are immutable and compared by **value**. Objects are compared by **reference**.

```js-exec
// Primitives: compared by value
console.log(1 === 1);             // true
console.log('hello' === 'hello'); // true

// Objects: compared by reference
console.log({} === {});           // false
console.log([] === []);           // false

const obj = {};
console.log(obj === obj);         // true
```

---

## 2. `typeof` — The Primary Tool

```js-exec
console.log(typeof 'hello');       // 'string'
console.log(typeof 42);            // 'number'
console.log(typeof 123n);          // 'bigint'
console.log(typeof true);          // 'boolean'
console.log(typeof undefined);     // 'undefined'
console.log(typeof Symbol('id'));  // 'symbol'
console.log(typeof function(){});  // 'function'
console.log(typeof {});            // 'object'
console.log(typeof []);            // 'object'   ← TRAP
console.log(typeof null);          // 'object'   ← TRAP
```

### The Two Classic `typeof` Traps

**Trap 1: `typeof null === 'object'`** — This is a bug from JavaScript's first implementation that can't be fixed without breaking the web. Always check `value === null` separately.

**Trap 2: `typeof [] === 'object'`** — Arrays are objects, so `typeof` can't distinguish them. Use `Array.isArray()`.

```js-exec
function whatIs(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

console.log(whatIs(null));   // 'null'
console.log(whatIs([]));     // 'array'
console.log(whatIs('hi'));   // 'string'
console.log(whatIs(42));     // 'number'
console.log(whatIs({}));     // 'object'
```

---

## 3. `instanceof` — Prototype Chain Check

Checks if an object's prototype chain contains a specific constructor's `.prototype`.

```js-exec
console.log([] instanceof Array);        // true
console.log([] instanceof Object);       // true  (Array → Object)
console.log({} instanceof Object);       // true
console.log({} instanceof Array);        // false
console.log(new Date() instanceof Date); // true
console.log(new Map() instanceof Map);   // true

// Primitives: boxed first, then checked
console.log('hello' instanceof String);  // false — primitives aren't instances
console.log(42 instanceof Number);       // false
```

### The Cross-Realm Problem

`instanceof` fails when objects come from a different JavaScript realm (iframe, VM context). Each realm has its own `Array`, `Date`, etc.

```js-exec
// Conceptual — won't work in a single file:
// const iframeArray = iframe.contentWindow.Array;
// console.log(iframeArray() instanceof Array);  // false — different Array constructor
```

This is why libraries prefer `Object.prototype.toString.call()` for type checking.

---

## 4. `Object.prototype.toString.call(value)` — Most Reliable

Returns `[object InternalType]` where `InternalType` is the engine's internal class.

```js-exec
const type = (v) => Object.prototype.toString.call(v).slice(8, -1);

console.log(type('hello'));       // 'String'
console.log(type(42));            // 'Number'
console.log(type(true));          // 'Boolean'
console.log(type(undefined));     // 'Undefined'
console.log(type(null));          // 'Null'
console.log(type([]));            // 'Array'
console.log(type({}));            // 'Object'
console.log(type(function(){}));  // 'Function'
console.log(type(new Date()));    // 'Date'
console.log(type(/regex/));       // 'RegExp'
console.log(type(new Map()));     // 'Map'
console.log(type(new Set()));     // 'Set'
console.log(type(new Error()));   // 'Error'
console.log(type(Promise.resolve())); // 'Promise'
console.log(type(Symbol('s')));   // 'Symbol'
```

This works across realms — it always reflects the engine's internal class.

---

## 5. `Array.isArray(value)` — Array-Specific Check

```js-exec
console.log(Array.isArray([]));           // true
console.log(Array.isArray({}));           // false
console.log(Array.isArray('hello'));      // false
console.log(Array.isArray(arguments));    // false — but arguments is array-like
```

This is the only reliable way to detect arrays. It works across realms (unlike `instanceof Array`).

---

## 6. Checking for Specific Primitive Types

```js-exec
function isString(v)  { return typeof v === 'string' || v instanceof String; }
function isNumber(v)  { return typeof v === 'number' && !isNaN(v); }
function isBoolean(v) { return typeof v === 'boolean'; }
function isNull(v)    { return v === null; }
function isUndefined(v) { return v === undefined; }
function isFunction(v) { return typeof v === 'function'; }

// For objects that are NOT arrays, null, or functions
function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v) &&
         Object.prototype.toString.call(v) === '[object Object]';
}

console.log(isPlainObject({}));          // true
console.log(isPlainObject([]));          // false
console.log(isPlainObject(null));        // false
console.log(isPlainObject(new Date()));  // false
```

---

## 7. NaN, Infinity, and -0

### NaN Detection

```js-exec
console.log(NaN === NaN);          // false — the only value not equal to itself
console.log(isNaN(NaN));           // true
console.log(isNaN('hello'));       // true  ← TRAP: isNaN coerces to number first
console.log(Number.isNaN(NaN));    // true
console.log(Number.isNaN('hello')); // false ← always use Number.isNaN
```

### Infinity

```js-exec
console.log(1 / 0);              // Infinity
console.log(-1 / 0);             // -Infinity
console.log(Infinity === Infinity); // true
console.log(isFinite(42));         // true
console.log(Number.isFinite(Infinity)); // false
```

### -0

```js-exec
console.log(+0 === -0);          // true  ← TRAP
console.log(Object.is(+0, -0));  // false ← most precise comparison
console.log(1 / -0);             // -Infinity (can use this to detect -0)
```

---

## 8. `Object.is(a, b)` — Most Precise Equality

```js-exec
console.log(Object.is(NaN, NaN));   // true   (=== says false)
console.log(Object.is(+0, -0));     // false  (=== says true)
console.log(Object.is(1, 1));       // true
console.log(Object.is({}, {}));     // false
```

`Object.is` is SameValue equality — the strictest comparison. Use it when you need exact equivalence.

---

## Quick Reference

| Check | Tool | Watch Out |
|-|-|-|
| Is it null? | `v === null` | `typeof null === 'object'` |
| Is it array? | `Array.isArray(v)` | `typeof [] === 'object'` |
| Is it NaN? | `Number.isNaN(v)` | NOT `isNaN(v)` — it coerces |
| Is it finite? | `Number.isFinite(v)` | NOT `isFinite(v)` — it coerces |
| Is it integer? | `Number.isInteger(v)` | |
| General type | `typeof v` | Handles most primitives + functions |
| Cross-realm type | `Object.prototype.toString.call(v)` | Most reliable |
| Prototype check | `v instanceof Constructor` | Doesn't work across realms |
| Strictest equality | `Object.is(a, b)` | NaN and +0/-0 correct |

---

## Interview Tips

- **Always check `null` before `typeof`** — `typeof null === 'object'` will trip you.
- **Use `Array.isArray`** — never `typeof` for arrays.
- **Use `Number.isNaN`** — not the global `isNaN`.
- **Use `Object.prototype.toString.call` for generic type tags** — it's the nuclear option that always works.

---

## Related Articles

- [#5 — Type Utilities](/articles/js-interview-type-utilities)
- [#14 — Implement deepEqual()](/articles/js-interview-deep-equal)
- [JS Foundations #5 — Equality & Type Coercion](/articles/js-equality-coercion)
