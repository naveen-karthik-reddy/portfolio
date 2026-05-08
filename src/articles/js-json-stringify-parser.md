`JSON.stringify()` converts JavaScript values to JSON text. Behind its simple API, it handles objects, arrays, primitives, nested structures, and circular references. This article builds a simplified but functional stringify from scratch.

**Prerequisites:** [Recursion Patterns](/articles/javascript-series/js-recursion-patterns)

---

## 1. What `JSON.stringify()` Handles

JSON supports: objects, arrays, strings, numbers, booleans, and `null`. It rejects: functions, `undefined`, Symbols, BigInt, and circular references:

```js-exec
const obj = {
  name: "Naveen",
  age: 25,
  active: true,
  tags: ["js", "react"],
  address: { city: "Bangalore" },
  fn: function () {}, // Skipped
  nothing: null,
};

console.log(JSON.stringify(obj, null, 2));
// Functions are omitted. undefined, Symbol, BigInt also omitted.
```

---

## 2. Basic `stringify` — Primitives, Objects, Arrays

```js-exec
function stringify(value) {
  // null
  if (value === null) return "null";

  const type = typeof value;

  // String — escape quotes and control characters
  if (type === "string") {
    return `"${value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t")}"`;
  }

  // Number — NaN and Infinity become null
  if (type === "number") {
    return Number.isFinite(value) ? String(value) : "null";
  }

  // Boolean
  if (type === "boolean") return String(value);

  // Undefined, Function, Symbol — return undefined (not valid JSON)
  if (type === "undefined" || type === "function" || type === "symbol") {
    return undefined;
  }

  // Array
  if (Array.isArray(value)) {
    const items = value.map((item) => {
      const str = stringify(item);
      return str === undefined ? "null" : str; // undefined → null in arrays
    });
    return `[${items.join(",")}]`;
  }

  // Object
  const pairs = [];
  for (const key of Object.keys(value)) {
    const val = value[key];
    if (typeof val === "function" || typeof val === "undefined" || typeof val === "symbol") {
      continue; // Skip functions, undefined, symbols
    }
    pairs.push(`${stringify(key)}:${stringify(val)}`);
  }
  return `{${pairs.join(",")}}`;
}

// Test
const obj = {
  name: "Naveen",
  age: 25,
  active: true,
  tags: ["js", "react"],
  address: { city: "Bangalore" },
  fn: function () {},
  nothing: null,
  undef: undefined,
  nan: NaN,
};

console.log(stringify(obj));
// {"name":"Naveen","age":25,"active":true,"tags":["js","react"],"address":{"city":"Bangalore"},"nothing":null,"nan":null}
```

---

## 3. Circular Reference Detection

```js-exec
function stringifySafe(value, seen = new WeakSet()) {
  if (value === null) return "null";

  const type = typeof value;

  if (type === "string") {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")}"`;
  }

  if (type === "number") return Number.isFinite(value) ? String(value) : "null";
  if (type === "boolean") return String(value);
  if (type === "undefined" || type === "function" || type === "symbol") return undefined;

  // Circular reference check for objects and arrays
  if (typeof value === "object") {
    if (seen.has(value)) {
      throw new TypeError("Converting circular structure to JSON");
    }
    seen.add(value);
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => {
      const str = stringifySafe(item, seen);
      return str === undefined ? "null" : str;
    });
    return `[${items.join(",")}]`;
  }

  const pairs = [];
  for (const key of Object.keys(value)) {
    const val = value[key];
    if (typeof val === "function" || typeof val === "undefined" || typeof val === "symbol") continue;
    pairs.push(`${stringifySafe(key, seen)}:${stringifySafe(val, seen)}`);
  }
  return `{${pairs.join(",")}}`;
}

const circular = { name: "test" };
circular.self = circular;

try {
  stringifySafe(circular);
} catch (e) {
  console.log("Circular detection:", e.message);
}

// Non-circular still works
console.log(stringifySafe({ a: [1, 2], b: { c: 3 } }));
```

---

## 4. The `toJSON()` Method — Custom Serialization

If an object has a `toJSON()` method, `JSON.stringify()` calls it:

```js-exec
const user = {
  name: "Naveen",
  password: "secret123",
  createdAt: new Date(),

  toJSON() {
    // Omit sensitive fields and format date
    return {
      name: this.name,
      createdAt: this.createdAt.toISOString(),
    };
  },
};

console.log(JSON.stringify(user));
// {"name":"Naveen","createdAt":"2026-..."} — no password!
```

---

## 5. The `replacer` Parameter — Filter and Transform

Accepts an array of keys or a transformer function:

```js-exec
const data = {
  name: "Naveen",
  age: 25,
  password: "secret",
  email: "naveen@example.com",
};

// Array replacer — only include these keys
console.log("Array replacer:", JSON.stringify(data, ["name", "email"]));

// Function replacer — transform values
console.log(
  "Function replacer:",
  JSON.stringify(data, (key, value) => {
    if (key === "password") return undefined; // Remove
    if (key === "age") return value + 1; // Transform
    return value;
  })
);
```

---

## 6. Building a Minimal `JSON.parse()` (Bonus)

JSON parsing is significantly more complex (requires a real parser). Here's a conceptual overview:

```js-exec
// JSON.parse uses the built-in JS engine under the hood.
// A manual implementation would need:
//
// 1. Tokenizer    — break "{\"a\":1}" into tokens: { "a" : 1 }
// 2. Parser       — build an AST from tokens
// 3. Evaluator    — convert AST to JS values

// The built-in is safe — it doesn't eval():
// JSON.parse('{"malicious": "code"}') — OK, no code execution
// eval('({"malicious": "code"})') — DANGEROUS, runs arbitrary code!

console.log("Always use JSON.parse(), never eval()");
```

---

## Key Takeaways

- `JSON.stringify()` handles primitives, objects, arrays, `null` — skips functions and `undefined`.
- Escape strings properly: `"`, `\\`, `\n`, `\r`, `\t`.
- `NaN` and `Infinity` become `null` in JSON.
- Circular references throw `TypeError` — use a `WeakSet` to detect them.
- `toJSON()` lets objects customize serialization.
- `replacer` (array or function) filters/transforms during serialization.

---

**Next:** [Parsing #2 — URL & Query String Parsing](/articles/javascript-series/js-url-query-parser) — parse query strings into objects and build them back.
