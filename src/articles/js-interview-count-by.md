`countBy(array, fn)` groups array elements by the result of a key function and returns a count of how many fall into each group. It's a single `reduce` call — the challenge is getting the accumulator shape and key resolution right.

---

## The Problem

> "Implement `countBy(array, fn)` that returns an object where each key is the result of calling `fn` on an element, and each value is the number of elements that produced that key."
>
> ```js
> countBy([1, 2, 3, 4, 5], n => n % 2 === 0 ? 'even' : 'odd');
> // { odd: 3, even: 2 }
> ```

---

## Thought Process

You're creating a frequency map. The accumulator is a plain object:
- For each element, compute the key via `fn(element)`
- Increment the count at that key (default to 0 if absent)
- Return the accumulator

`reduce` is the natural fit. The initial value is `{}`.

---

## Step 1 — Base with `reduce`

```js-exec
function countBy(array, fn) {
  return array.reduce((acc, item) => {
    const key = fn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

console.log(countBy([1, 2, 3, 4, 5], n => n % 2 === 0 ? 'even' : 'odd'));
// { odd: 3, even: 2 }

console.log(countBy(['apple', 'banana', 'avocado', 'cherry'], s => s[0]));
// { a: 2, b: 1, c: 1 }
```

---

## Step 2 — Supporting String Keys (Shortcut)

The interviewer says: "What if `fn` is a string? Use it as a property name."

```js-exec
function countBy(array, fn) {
  const resolver = typeof fn === 'function' ? fn : (item) => item[fn];

  return array.reduce((acc, item) => {
    const key = resolver(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

const users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Carol', role: 'admin' },
];

console.log(countBy(users, 'role'));
// { admin: 2, user: 1 }
```

---

## Step 3 — Extension: `groupBy`

The interviewer extends: "Now implement `groupBy` — collect the elements instead of counting them."

```js-exec
function groupBy(array, fn) {
  const resolver = typeof fn === 'function' ? fn : (item) => item[fn];

  return array.reduce((acc, item) => {
    const key = resolver(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

console.log(groupBy(users, 'role'));
// { admin: [{...Alice...}, {...Carol...}], user: [{...Bob...}] }
```

---

## Step 4 — Edge Cases

**Empty array**: `reduce` with an empty array and initial value `{}` returns `{}`. Correct.

**Key function returns `undefined`**: `undefined` becomes an object key: `{ undefined: N }`. This matches lodash's `countBy` behavior. The interviewer may want you to handle it by skipping or using a default key — ask.

**Key function returns non-string**: Object keys are always strings. `countBy([1], n => n)` produces `{ '1': 1 }`, not `{ 1: 1 }`. This is correct — numbers get stringified naturally.

**Null/undefined in array**: `fn(null)` might return a key or throw. Your function should handle whatever `fn` returns.

---

## Full Solution

```js-exec
function countBy(array, fn) {
  const resolver = typeof fn === 'function' ? fn : (item) => item[fn];

  return array.reduce((acc, item) => {
    const key = resolver(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function groupBy(array, fn) {
  const resolver = typeof fn === 'function' ? fn : (item) => item[fn];

  return array.reduce((acc, item) => {
    const key = resolver(item);
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});
}
```

---

## What Interviewers Are Testing

- **Reduce comfort** — recognizing that frequency counting is a reduce operation
- **Shorthand syntax** — supporting both `(item) => key` and `'propertyName'`
- **Accumulator mutation pattern** — creating/modifying keys in the accumulator object
- **Extension to `groupBy`** — showing the pattern generalizes from counting to collecting

---

## Complexity

| | Time | Space |
|-|------|-------|
| countBy | O(N) | O(K) — K unique keys |
| groupBy | O(N) | O(N) — stores all elements |

---

## Interview Tips

- **Write `reduce` confidently** — "This is a frequency map — `reduce` into an object with key counts." Don't write a `for` loop first and then refactor.
- **Support the property-name shortcut** — `countBy(users, 'role')` is the lodash convention. Adding it without being asked shows library awareness.
- **Show `groupBy` as the natural sibling** — "Once you have `countBy`, `groupBy` is the same thing but collecting elements into arrays instead of incrementing numbers."
- **Handle default initialization cleanly** — `acc[key] = (acc[key] || 0) + 1` is the standard one-liner. Don't write `if (!acc[key]) acc[key] = 0; acc[key]++`.

---

## Related Questions

- [#25 — Implement Data Merging](/articles/js-interview-data-merging)
- [#2 — Implement map(), filter() & reduce()](/articles/js-interview-map-filter-reduce)
- [#30 — Implement a Data Selection / Filter Engine](/articles/js-interview-data-selection)
