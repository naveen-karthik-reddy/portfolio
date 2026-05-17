`classnames(...args)` joins truthy CSS class names into a single string. The real library handles strings, numbers, objects, arrays, and nested arrays — all with a single recursive function. The interviewer wants to see you navigate the mixed-type input cleanly.

---

## The Problem

> "Implement `classnames(...args)` that takes any number of arguments (strings, numbers, objects, arrays) and returns a single string of truthy class names joined by spaces."
>
> ```js
> classnames('btn', { 'btn-primary': true, 'btn-disabled': false }, ['large', 'rounded']);
> // 'btn btn-primary large rounded'
> ```

---

## Thought Process

Walk each argument:
- **string/number** → add to result (numbers are valid class names)
- **object** → for each key, add the key if the value is truthy
- **array** → recurse into each element (handles nested arrays)
- **falsy primitives** → skip (`null`, `undefined`, `false`, `''`, `0`)

The number `0` is a special case — it's falsy but is a valid class name. The real `classnames` library includes `0` as a class name. State your choice.

---

## Step 1 — Strings and Objects

```js-exec
function classnames(...args) {
  const classes = [];

  for (const arg of args) {
    if (!arg) continue;  // skip falsy values

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(arg);
    } else if (typeof arg === 'object' && !Array.isArray(arg)) {
      for (const [key, value] of Object.entries(arg)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

// Test
console.log(classnames('btn', 'active'));
// 'btn active'

console.log(classnames('btn', { 'btn-primary': true, 'btn-disabled': false }));
// 'btn btn-primary'

console.log(classnames(null, undefined, false, 'btn'));
// 'btn'
```

---

## Step 2 — Arrays (Flat and Nested)

```js-exec
function classnames(...args) {
  const classes = [];

  function process(arg) {
    if (!arg && arg !== 0) return;  // skip falsy, but keep 0

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(arg);
      return;
    }

    if (Array.isArray(arg)) {
      for (const item of arg) {
        process(item);  // recurse for nested arrays
      }
      return;
    }

    if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) classes.push(key);
      }
    }
  }

  for (const arg of args) {
    process(arg);
  }

  return classes.join(' ');
}

// Test
console.log(classnames(['btn', ['large', ['rounded']]]));
// 'btn large rounded'

console.log(classnames('btn', ['active', { highlight: true }]));
// 'btn active highlight'
```

---

## Step 3 — Edge Cases

**Numeric class names**: `classnames(1, 0, 'two')` → the real library includes `0` and `1`. Our guard `!arg && arg !== 0` handles this.

**Object with no truthy keys**: `classnames({ a: false, b: null })` → `''` (empty string). Correct.

**Empty input**: `classnames()` → `''`.

**Duplicate classes**: The real library doesn't deduplicate. Neither should yours — `classnames('btn', 'btn')` → `'btn btn'`.

---

## Full Solution

```js-exec
function classnames(...args) {
  const classes = [];

  function collect(arg) {
    if (arg === null || arg === undefined || arg === false || arg === '') return;

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(arg);
      return;
    }

    if (Array.isArray(arg)) {
      for (const item of arg) collect(item);
      return;
    }

    if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) classes.push(key);
      }
    }
  }

  for (const arg of args) collect(arg);
  return classes.join(' ');
}
```

---

## What Interviewers Are Testing

- **Type handling** — dispatching on string, number, array, object
- **Recursion through arrays** — supporting nested arrays cleanly
- **Falsy filtering** — knowing which falsy values to skip and which to keep
- **Object iteration** — `Object.entries()` for key-value class conditionals

---

## Complexity

| | Time | Space |
|-|------|-------|
| classnames | O(N) — each argument visited once | O(N) — output string + classes array |

---

## Interview Tips

- **State the `0` handling** — "I'll include `0` as a valid class name since it's a number. I'll skip `null`, `undefined`, `false`, and `''`."
- **Use a recursive helper** — separate the "process one argument" logic from the "join results" logic. Cleaner and easier to extend.
- **Don't deduplicate** — the real library doesn't, and the interviewer isn't expecting it. Adding deduplication without being asked is wasted complexity.
- **Name-drop `clsx`** — the most popular alternative to `classnames`. Mentioning it shows you know the ecosystem.

---

## Related Questions

- [#22 — Implement an EventEmitter](/articles/js-interview-event-emitter)
- [#6 — Implement _.get()](/articles/js-interview-get)
- [#27 — Implement listFormat()](/articles/js-interview-list-format)
