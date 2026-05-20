`myJSONStringify(value)` converts a JavaScript value into a JSON string. The interviewer wants to see you handle all JSON types, escape strings properly, skip non-JSON values, and detect circular references — essentially a recursive tree serializer.

**Related deep-dive:** [Parsing #1 — Building a Simple JSON.stringify()](/articles/js-json-stringify-parser)

---

## What is `JSON.stringify()`?

`JSON.stringify(value)` converts a JavaScript value into a JSON-formatted string. It's the standard serialization format for web APIs, config files, and data interchange. The native implementation handles primitives, arrays, objects, and has specific rules for what gets skipped or transformed.

Building it from scratch is a **recursive tree serializer** — you walk the value, emit the correct JSON syntax at each node, and handle edge cases the native implementation defines:
- **Primitives** — strings get double-quoted and escaped; numbers and booleans emit directly; `null` emits `"null"`
- **Arrays** — emit `[...]` with recursively serialized elements
- **Objects** — emit `{...}` with quoted keys and recursively serialized values
- **Non-JSON values** — `undefined`, functions, and `Symbol` keys/values are **skipped** (not emitted) in objects and replaced with `null` in arrays
- **Circular references** — must be detected and rejected (throws `TypeError` in native)

The interview tests whether you can handle all these branches correctly. The key edge cases: string escaping (`"`, `\`, newlines, etc.), distinguishing arrays from plain objects, detecting cycles with a `WeakMap`/`Set`, and knowing what JSON considers valid vs. invalid.

Real-world use cases go far beyond building your own serializer. Understanding how `JSON.stringify` works internally helps you debug serialization bugs, understand why certain values disappear from API payloads, and know when to reach for alternatives like `structuredClone` or custom serializers.

---

## The Problem

> "Implement `myJSONStringify(value)` that returns a JSON string. It should handle: `null`, booleans, numbers, strings, arrays, and plain objects. Skip `undefined`, functions, and `Symbol` values. Detect circular references."

---

## Thought Process

JSON is a recursive grammar:
- **null** → `"null"`
- **boolean** → `"true"` or `"false"`
- **number** → `String(value)` (but `NaN` and `Infinity` → `"null"`)
- **string** → wrap in double quotes, escape `"`, `\`, `\n`, `\t`, `\r`, etc.
- **array** → `[` + elements joined by `,` + `]`
- **object** → `{` + key-value pairs joined by `,` + `}`

For circular reference detection, pass a `WeakSet` of visited objects through the recursion.

---

## Step 1 — Primitives

```js-exec
function myJSONStringify(value) {
  // null
  if (value === null) return 'null';

  // boolean
  if (typeof value === 'boolean') return value ? 'true' : 'false';

  // number — NaN and Infinity become null in JSON
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return 'null';
    return String(value);
  }

  // string — wrap in double quotes, escape special chars
  if (typeof value === 'string') {
    return `"${value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')}"`;
  }

  // undefined, function, symbol — not valid JSON, return undefined
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
    return undefined;
  }

  // ... arrays and objects next
}
```

---

## Step 2 — Arrays

```js-exec
function myJSONStringify(value, visited = new WeakSet()) {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return 'null';
    return String(value);
  }
  if (typeof value === 'string') {
    return `"${value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')}"`;
  }
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
    return undefined;
  }

  // Circular reference check
  if (typeof value === 'object' && visited.has(value)) {
    throw new TypeError('Converting circular structure to JSON');
  }
  visited.add(value);

  // Array
  if (Array.isArray(value)) {
    const items = value.map(item => {
      const str = myJSONStringify(item, visited);
      return str === undefined ? 'null' : str;
    });
    return `[${items.join(',')}]`;
  }

  // ... object next
}
```

---

## Step 3 — Objects

```js-exec
function myJSONStringify(value, visited = new WeakSet()) {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return 'null';
    return String(value);
  }
  if (typeof value === 'string') {
    return `"${value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')}"`;
  }
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
    return undefined;
  }

  if (typeof value === 'object' && visited.has(value)) {
    throw new TypeError('Converting circular structure to JSON');
  }
  visited.add(value);

  if (Array.isArray(value)) {
    const items = value.map(item => {
      const str = myJSONStringify(item, visited);
      return str === undefined ? 'null' : str;
    });
    return `[${items.join(',')}]`;
  }

  // Object
  const pairs = [];
  for (const key of Object.keys(value)) {
    const val = value[key];
    // Skip undefined, function, symbol values
    if (val === undefined || typeof val === 'function' || typeof val === 'symbol') {
      continue;
    }
    const keyStr = myJSONStringify(key);
    const valStr = myJSONStringify(val, visited);
    if (valStr !== undefined) {
      pairs.push(`${keyStr}:${valStr}`);
    }
  }
  return `{${pairs.join(',')}}`;
}

console.log(myJSONStringify({ a: 1, b: [2, null, 'hello'], c: { d: true } }));
// {"a":1,"b":[2,null,"hello"],"c":{"d":true}}
```

---

## Step 4 — Edge Cases

**`undefined` in arrays** → `null`. `[1, undefined, 3]` → `[1,null,3]`.

**`undefined` / function / symbol as object values** → skip the key entirely.

**NaN / Infinity** → `null`. Both are invalid JSON values.

**Circular references**: The `WeakSet` tracks visited objects. On second visit, throw a `TypeError` — matching the native behavior.

**Empty array/object**: `[]` → `"[]"`, `{}` → `"{}"`.

---

## Full Solution

```js-exec
function myJSONStringify(value, visited = new WeakSet()) {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return 'null';
    return String(value);
  }
  if (typeof value === 'string') {
    return `"${value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')}"`;
  }
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
    return undefined;
  }

  if (typeof value === 'object' && visited.has(value)) {
    throw new TypeError('Converting circular structure to JSON');
  }
  visited.add(value);

  if (Array.isArray(value)) {
    const items = value.map(item => {
      const str = myJSONStringify(item, visited);
      return str === undefined ? 'null' : str;
    });
    return `[${items.join(',')}]`;
  }

  const pairs = [];
  for (const key of Object.keys(value)) {
    const val = value[key];
    if (val === undefined || typeof val === 'function' || typeof val === 'symbol') continue;
    const valStr = myJSONStringify(val, visited);
    if (valStr !== undefined) {
      pairs.push(`${myJSONStringify(key)}:${valStr}`);
    }
  }
  return `{${pairs.join(',')}}`;
}
```

---

## What Interviewers Are Testing

- **JSON grammar knowledge** — what's valid JSON and what isn't
- **String escaping** — handling double quotes, backslashes, and control characters
- **undefined/function/symbol handling** — knowing they're skipped in objects, replaced with null in arrays
- **Circular reference detection** — using a WeakSet for O(1) lookup and automatic GC
- **NaN/Infinity → null** — the JSON spec says these become null

---

## Complexity

| | Time | Space |
|-|------|-------|
| stringify | O(N) — each value visited once | O(N) — output string + recursion stack |

---

## Interview Tips

- **State the type-dispatcher upfront** — "I'll handle each type: null, boolean, number, string, array, object." This shows structured thinking.
- **Handle `null` before `typeof`** — `typeof null === 'object'` will bite you if you check `typeof` first.
- **Use WeakSet, not Set, for visited tracking** — mention that WeakSet allows garbage collection if the serialized object is discarded mid-operation.
- **Walk through the escape table** — "For strings I need to escape at minimum: backslash, double-quote, newline, carriage return, and tab."

---

## Related Questions

- [Implement deepClone()](/articles/js-interview-deep-clone)
- [Implement deepEqual()](/articles/js-interview-deep-equal)
- [Implement flatten()](/articles/js-interview-flatten)
