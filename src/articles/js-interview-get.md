`_.get(obj, path, defaultValue)` is Lodash's safe nested access utility. It drills into an object following a dot/bracket path string and returns the value — or a fallback if any intermediate step is nullish. It's a recursion + string parsing question that tests defensive programming instincts.

---

## What is `get()`?

`get(obj, path, defaultValue)` is Lodash's safe nested access utility. Instead of writing `obj.a && obj.a.b && obj.a.b.c` (which is verbose) or `obj.a.b.c` (which throws if any intermediate key is missing), you write `get(obj, "a.b.c", "fallback")` — read the path, return the value if it exists, or return `defaultValue` if anything along the way is `null` or `undefined`.

The problem it solves is **defensive traversal**: navigating objects where the shape is uncertain (API responses, config objects, optional nested structures) without littering the code with guard checks. The native optional chaining `obj?.a?.b?.c` handles many cases now, but `get()` gives you programmatic path control — the path can be a dynamic string built at runtime.

The interview tests two skills in one question:
1. **Path parsing** — converting a string like `"a[0].b.c"` into individual keys `["a", "0", "b", "c"]`, handling both dot and bracket notation
2. **Safe traversal** — walking the object key by key, returning early if any step is nullish instead of throwing

The key detail interviewers look for: checking `current == null` **before** accessing `current[key]`. Without that check, drilling into a null intermediate value throws a `TypeError` — exactly what `get()` is meant to prevent.

---

## The Problem

> "Implement `get(obj, path, defaultValue)` that safely retrieves a nested value from an object using a dot-notation path string. If any part of the path doesn't exist, return the default value instead of throwing."

Expected behavior:

```js
const obj = { a: { b: { c: 42 } } };
get(obj, "a.b.c");           // 42
get(obj, "a.b.x");           // undefined
get(obj, "a.b.x", "N/A");    // "N/A"
get(obj, "a.x.y");           // undefined
```

The interviewer may then extend the path syntax to include bracket notation:

```js
get({ a: [{ b: 1 }] }, "a[0].b");  // 1
```

---

## Thought Process

There are two sub-problems:

1. **Path parsing**: convert `"a.b.c"` into `["a", "b", "c"]`
2. **Safe traversal**: walk the path on the object, returning early if any step is `null`/`undefined`

The traversal is the interesting part. The naive approach — `obj[path.split(".")[0]][...]` — is a one-liner that explodes when a key is missing. The safe approach needs to check each step.

---

## Step 1 — Base: Dot Notation Only

```js-exec
function get(obj, path, defaultValue) {
  const keys = path.split(".");

  let current = obj;
  for (const key of keys) {
    if (current == null) {
      return defaultValue;
    }
    current = current[key];
  }

  return current === undefined ? defaultValue : current;
}

// Test
const data = { user: { name: "Naveen", age: 25 } };
console.log(get(data, "user.name"));          // "Naveen"
console.log(get(data, "user.email"));         // undefined
console.log(get(data, "user.email", "N/A"));  // "N/A"
console.log(get(data, "profile.city"));       // undefined
console.log(get(data, "profile.city", "?"));  // "?"
```

---

## Step 2 — Why `current == null` Works

`current == null` checks for both `null` and `undefined` simultaneously (loose equality). This is one of the few places where `==` is the right tool — a concise nullish check.

The check must happen **before** accessing `current[key]`, because `null[key]` throws a `TypeError`. This is the defensive programming instinct the interviewer wants to see.

---

## Step 3 — Extended: Bracket Notation

The interviewer says: "Now support array indices with bracket notation — `a[0].b.c[1]`."

We need to parse the path into individual keys:

```js-exec
function get(obj, path, defaultValue) {
  // Split on dots, then strip brackets and split their contents
  const keys = path
    .split(".")
    .flatMap(segment => {
      // "a[0]" → split by "[", keep the part before "[", then the index
      if (segment.includes("[")) {
        const parts = [];
        // Replace "]" with empty, split by "[" 
        // e.g., "a[0][1]" → ["a", "0", "1"]
        const split = segment.replace(/\]/g, "").split("[");
        return split;
      }
      return segment;
    });

  let current = obj;
  for (const key of keys) {
    if (current == null) return defaultValue;
    current = current[key];
  }

  return current === undefined ? defaultValue : current;
}

// Test
const data = {
  users: [
    { name: "Alice", scores: [90, 85] },
    { name: "Bob", scores: [78, 92] }
  ]
};

console.log(get(data, "users[0].name"));          // "Alice"
console.log(get(data, "users[1].scores[0]"));     // 78
console.log(get(data, "users[2].name", "none"));  // "none"
```

---

## Step 4 — Edge Cases

**Empty path string**: `get(obj, "")` — should return the object itself or the default value? The least surprising behavior is returning `obj`.

**Path with trailing dot**: `get(obj, "a.")` — `split(".")` produces `["a", ""]`, and `current[""]` would be `undefined`. Handle it by filtering empty keys, or just let it happen — the result is `undefined` anyway.

**Null in the middle of the path**: `get({ a: null }, "a.b.c")` — our `current == null` check catches this after `a` is `null`, and returns `defaultValue` instead of crashing.

**Numeric strings as array indices**: `get(arr, "0")` — `arr["0"]` works on arrays (property access coerces). No special handling needed.

**Escaped dots in keys**: Real `_.get` supports `["a.b"]` for keys containing dots. This is rarely tested but worth mentioning as a known limitation.

---

## Full Solution

```js-exec
function get(obj, path, defaultValue) {
  if (path === "") return obj;

  const keys = path
    .replace(/\[(\w+)\]/g, ".$1")  // Convert [0] → .0
    .split(".")
    .filter(Boolean);               // Remove empty segments

  let current = obj;
  for (const key of keys) {
    if (current == null) return defaultValue;
    current = current[key];
  }

  return current === undefined ? defaultValue : current;
}

// Tests
const obj = { a: { b: [{ c: 42 }] } };
console.log(get(obj, "a.b[0].c"));       // 42
console.log(get(obj, "a.b[0].x", "?"));  // "?"
console.log(get(obj, ""));               // { a: { b: [{ c: 42 }] } }
```

---

## What Interviewers Are Testing

- **Defensive traversal** — checking `current == null` before accessing `current[key]` to avoid `TypeError`
- **String parsing** — splitting the path string and handling both dot and bracket notation
- **Nullish awareness** — using `== null` to catch both `null` and `undefined`
- **Default value semantics** — returning the default when the path doesn't exist, not just when the final value is falsy

---

## Complexity

| | Time | Space |
|-|------|-------|
| Path parsing | O(P) — P = path length | O(K) — K = number of keys |
| Traversal | O(D) — D = depth | O(1) |

---

## Interview Tips

- **Ask about the path format first** — "Is the path always dot-notation, or can it include brackets?" This shows you're gathering requirements before coding.
- **Use the regex trick for brackets** — `path.replace(/\[(\w+)\]/g, ".$1")` converts bracket notation to dot notation in one line. Mentioning this shows you know regex.
- **Explain `== null`** — when you write `if (current == null)`, note that this catches both `null` and `undefined`. Interviewers want to see you use loose equality intentionally, not accidentally.
- **Mention the `undefined` vs `null` distinction** — the native `_.get` distinguishes: `current === undefined` returns the default, but `null` is a valid value. If the interviewer asks, say you'd use `=== undefined` for stricter semantics.
