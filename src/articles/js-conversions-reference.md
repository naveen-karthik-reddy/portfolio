JavaScript has seven primitive types and one object type. Every conversion you'll ever need — explicit, implicit, boxed, unboxed — is covered here.

---

## 1. Primitive → Object (Boxing)

`Object()` wraps any primitive in its object equivalent. JavaScript does this automatically when you call a method on a primitive (e.g. `"hi".toUpperCase()`).

```js-exec
console.log(Object("hello"));    // String {"hello"}
console.log(Object(42));         // Number {42}
console.log(Object(true));       // Boolean {true}
console.log(Object(null));       // {} — plain object, not null
console.log(Object(undefined));  // {} — plain object, not undefined
console.log(Object(Symbol("s")));// Symbol {Symbol(s)}
console.log(Object(42n));        // BigInt {42n}

// explicit via constructors (always gives an object, not a primitive)
console.log(new String("hi") === "hi");  // false — it's an object
console.log(typeof new Number(5));       // "object"
```

Use `Object()` in polyfills to handle primitive `this` contexts — this is what native `call`/`apply` do internally.

---

## 2. Object → Primitive (Unboxing)

Unwrap an object wrapper back to its primitive using `.valueOf()`, or let coercion do it implicitly.

```js-exec
const boxed = new String("hello");
console.log(boxed.valueOf());          // "hello" (string primitive)
console.log(typeof boxed.valueOf());   // "string"
console.log(+new Number(42));          // 42 — unary + triggers valueOf
console.log(`${new String("hi")}`);   // "hi" — template literal calls toString
```

---

## 3. → String

```js-exec
// Explicit
console.log(String(42));          // "42"
console.log(String(null));        // "null"
console.log(String(undefined));   // "undefined"
console.log(String(true));        // "true"
console.log(String(false));       // "false"
console.log(String(Symbol("x"))); // "Symbol(x)"  ← only way without toString

// .toString()
console.log((42).toString());     // "42"
console.log((255).toString(16));  // "ff"  ← base 16
console.log((8).toString(2));     // "1000" ← binary

// Implicit (concatenation)
console.log(1 + "");              // "1"
console.log(null + "");           // "null"
console.log(undefined + "");      // "undefined"
```

**Gotcha:** `null.toString()` throws — `String(null)` never does.

---

## 4. → Number

```js-exec
// Explicit — Number()
console.log(Number("42"));        // 42
console.log(Number("3.14"));      // 3.14
console.log(Number(""));          // 0   ← empty string is 0
console.log(Number("  5  "));     // 5   ← trims whitespace
console.log(Number("42abc"));     // NaN ← any non-numeric → NaN
console.log(Number(null));        // 0
console.log(Number(undefined));   // NaN
console.log(Number(true));        // 1
console.log(Number(false));       // 0
console.log(Number([]));          // 0   ← [] → "" → 0
console.log(Number([3]));         // 3   ← [3] → "3" → 3
console.log(Number([1,2]));       // NaN ← [1,2] → "1,2" → NaN

// parseInt — reads leading integer, ignores rest
console.log(parseInt("42abc"));   // 42  ← stops at non-digit
console.log(parseInt("3.9"));     // 3   ← truncates float
console.log(parseInt("0xff", 16));// 255 ← base 16
console.log(parseInt("010"));     // 10  ← no octal in modern JS

// parseFloat — reads leading float
console.log(parseFloat("3.14rem")); // 3.14
console.log(parseFloat("1e3"));     // 1000

// Unary + (fastest, no radix support)
console.log(+"42");               // 42
console.log(+"");                 // 0
console.log(+null);               // 0
console.log(+undefined);          // NaN
console.log(+true);               // 1

// Multiply trick
console.log("10" * 1);            // 10
console.log("3.5" * 1);           // 3.5
```

| Method | Stops at non-digit | Handles floats | Handles hex | Handles `""` |
|--------|-------------------|----------------|-------------|---------------|
| `Number()` | No (→ NaN) | Yes | No | → 0 |
| `parseInt()` | Yes | No (truncates) | Yes (with radix) | → NaN |
| `parseFloat()` | Yes | Yes | No | → NaN |
| Unary `+` | No (→ NaN) | Yes | No | → 0 |

---

## 5. → Boolean

```js-exec
// Falsy values — everything else is truthy
console.log(Boolean(0));          // false
console.log(Boolean(-0));         // false
console.log(Boolean(0n));         // false
console.log(Boolean(""));        // false
console.log(Boolean(null));       // false
console.log(Boolean(undefined));  // false
console.log(Boolean(NaN));        // false

// Truthy — these trip people up
console.log(Boolean("0"));        // true  ← non-empty string
console.log(Boolean([]));         // true  ← empty array
console.log(Boolean({}));         // true  ← empty object
console.log(Boolean("false"));    // true  ← still a non-empty string

// Double-bang shorthand
console.log(!!"hello");           // true
console.log(!!0);                 // false
console.log(!!null);              // false
```

**Interview pattern:** Use `!!value` when you need a boolean for a condition. Use `Boolean(value)` when readability matters.

---

## 6. Character ↔ Number (ASCII / Unicode)

```js-exec
// Character → code point
console.log("A".charCodeAt(0));          // 65
console.log("a".charCodeAt(0));          // 97
console.log("0".charCodeAt(0));          // 48
console.log("Z".charCodeAt(0));          // 90
console.log("😀".codePointAt(0));        // 128512  ← handles emoji (> U+FFFF)

// Code point → character
console.log(String.fromCharCode(65));     // "A"
console.log(String.fromCharCode(97));     // "a"
console.log(String.fromCodePoint(128512));// "😀"

// Useful patterns
const toUpperOffset = "a".charCodeAt(0) - "A".charCodeAt(0); // 32
console.log(String.fromCharCode("a".charCodeAt(0) - toUpperOffset)); // "A"

// Alphabet index (0-based)
const idx = (c) => c.charCodeAt(0) - "a".charCodeAt(0);
console.log(idx("a")); // 0
console.log(idx("z")); // 25
```

---

## 7. Array ↔ String

```js-exec
// Array → String
console.log([1, 2, 3].join("-"));     // "1-2-3"
console.log([1, 2, 3].join(""));      // "123"
console.log([1, 2, 3].join());        // "1,2,3" ← comma is default
console.log([1, 2, 3].toString());    // "1,2,3" ← same as .join(",")
console.log(String([1, 2, 3]));       // "1,2,3"

// String → Array
console.log("hello".split(""));       // ["h","e","l","l","o"]
console.log("a,b,c".split(","));      // ["a","b","c"]
console.log([..."hello"]);            // ["h","e","l","l","o"] ← spread
console.log(Array.from("hello"));     // ["h","e","l","l","o"]
```

---

## 8. Object ↔ Array

```js-exec
const obj = { a: 1, b: 2, c: 3 };

// Object → Array
console.log(Object.keys(obj));          // ["a","b","c"]
console.log(Object.values(obj));        // [1,2,3]
console.log(Object.entries(obj));       // [["a",1],["b",2],["c",3]]

// Array (of entries) → Object
const entries = [["x", 10], ["y", 20]];
console.log(Object.fromEntries(entries));   // {x:10, y:20}
console.log(Object.fromEntries(new Map([["k", "v"]]))); // {k:"v"}

// Map → Object
const map = new Map([["a", 1], ["b", 2]]);
console.log(Object.fromEntries(map));   // {a:1, b:2}

// Object → Map
console.log(new Map(Object.entries(obj))); // Map(3) {a→1, b→2, c→3}

// Array → Set (deduplication)
console.log(new Set([1, 2, 2, 3, 3])); // Set(3) {1,2,3}

// Set → Array
console.log([...new Set([1, 2, 2, 3])]);  // [1,2,3]
console.log(Array.from(new Set([1, 2, 2, 3]))); // [1,2,3]
```

---

## 9. JSON Conversions

```js-exec
const data = { name: "Naveen", scores: [95, 87, 92], active: true };

// Object/Array → JSON string
const json = JSON.stringify(data);
console.log(json);
// '{"name":"Naveen","scores":[95,87,92],"active":true}'

// Pretty-print
console.log(JSON.stringify(data, null, 2));

// JSON string → Object/Array
const parsed = JSON.parse(json);
console.log(parsed.scores[0]); // 95

// What gets dropped
const tricky = {
  fn: () => "x",      // functions — dropped
  sym: Symbol("s"),   // symbols — dropped
  u: undefined,       // undefined values — dropped
  n: null,            // null — kept
  inf: Infinity,      // Infinity → null
  nan: NaN,           // NaN → null
};
console.log(JSON.stringify(tricky));
// '{"n":null,"inf":null,"nan":null}'

// Deep clone shortcut (JSON-safe values only)
const clone = JSON.parse(JSON.stringify(data));
console.log(clone === data); // false
```

---

## 10. Implicit Coercion — The Hidden Rules

```js-exec
// + operator: if either side is a string → string concatenation
console.log(1 + "2");        // "12"
console.log("1" + 2);        // "12"
console.log(1 + 2 + "3");    // "33" ← left-to-right: 3 + "3"
console.log("1" + 2 + 3);    // "123"

// - * / % always convert to number
console.log("5" - 2);        // 3
console.log("5" * "3");      // 15
console.log("10" / "2");     // 5
console.log(null - 1);       // -1  ← null → 0
console.log(undefined - 1);  // NaN ← undefined → NaN

// == uses Abstract Equality algorithm (converts before comparing)
console.log(0 == "");        // true  ← "" → 0
console.log(0 == "0");       // true  ← "0" → 0
console.log("" == "0");      // false ← both strings, no conversion
console.log(null == undefined); // true  ← spec rule
console.log(null == 0);      // false ← null only loosely equals undefined
console.log([] == false);    // true  ← [] → "" → 0, false → 0

// Template literals call toString / valueOf
console.log(`${null}`);      // "null"
console.log(`${undefined}`); // "undefined"
console.log(`${[1,2]}`);     // "1,2"
console.log(`${{a:1}}`);     // "[object Object]"
```

---

## 11. Symbol.toPrimitive — Custom Conversion

Override how an object converts with `Symbol.toPrimitive`:

```js-exec
const temp = {
  celsius: 100,
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.celsius;
    if (hint === "string") return `${this.celsius}°C`;
    return this.celsius; // "default" (used by == and +)
  },
};

console.log(+temp);         // 100  (hint: "number")
console.log(`${temp}`);     // "100°C"  (hint: "string")
console.log(temp + 0);      // 100  (hint: "default")
```

Without `Symbol.toPrimitive`, JS calls `valueOf()` first, then `toString()`.

---

## Quick Reference

| From → To | Method | Edge case |
|-----------|--------|-----------|
| any → string | `String(x)` or `` `${x}` `` | `String(Symbol())` works; `Symbol().toString()` works; template literal throws |
| string → number | `Number(x)` | `Number("")` → 0, `Number("  ")` → 0 |
| string → integer | `parseInt(x, 10)` | Always pass radix 10 |
| string → float | `parseFloat(x)` | Stops at first non-numeric char |
| any → boolean | `Boolean(x)` or `!!x` | `[]` and `{}` are truthy |
| any → object | `Object(x)` | `null`/`undefined` → `{}` |
| char → code | `str.charCodeAt(0)` | Use `codePointAt` for emoji |
| code → char | `String.fromCharCode(n)` | Use `fromCodePoint` for emoji |
| array → string | `arr.join(sep)` | Default sep is `","` |
| string → array | `str.split("")` | Or `[...str]` or `Array.from(str)` |
| object → entries | `Object.entries(obj)` | Keys are always strings |
| entries → object | `Object.fromEntries(arr)` | Also accepts Map |
| object/array → JSON | `JSON.stringify(x)` | Drops functions, symbols, undefined |
| JSON → object/array | `JSON.parse(str)` | Throws on invalid JSON |

---

## Related Articles

- [JS Foundations #5 — Equality & Type Coercion](/articles/js-equality-coercion)
- [JS Foundations #9 — Data Types & Type Checking](/articles/js-data-types)
- [Type Checking Quick Reference](/articles/js-type-checking)
- [JS Foundations #10 — Numbers & Math](/articles/js-numbers-math)
