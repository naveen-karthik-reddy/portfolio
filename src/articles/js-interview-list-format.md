`listFormat(array)` converts an array into a human-readable list string: `['a', 'b', 'c']` → `"a, b, and c"`. The logic depends on the length — 0, 1, 2, and 3+ items each have different formatting. Support custom conjunctions and an Oxford comma option.

---

## What is `listFormat()`?

`listFormat(array, options)` converts an array into a **human-readable list string** following natural language conventions. Three items becomes `"a, b, and c"`, two items becomes `"a and b"`, one item is just the item itself, and an empty array returns `""`.

The formatting logic depends entirely on the array length, making this a **branch-by-length** problem rather than a loop or recursion problem:
- **0 items** → empty string
- **1 item** → the item as-is
- **2 items** → `"item1 {conjunction} item2"` (e.g., `"a and b"`)
- **3+ items** → `"item1, item2, ... {conjunction} lastItem"` (e.g., `"a, b, and c"`)

The options typically include:
- **`conjunction`** — the joining word (default: `"and"`, but could be `"or"` for alternatives)
- **`oxfordComma`** — whether to include the comma before the conjunction in 3+ item lists (`"a, b, and c"` vs `"a, b and c"`)

This is the JavaScript equivalent of Python's `", ".join()` with an Oxford comma and a conjunction for the last element. The native `Intl.ListFormat` API handles this with locale awareness, but interviewers want to see the manual implementation.

Real-world use cases:
- **UI notifications** — "Alice, Bob, and 3 others liked your post"
- **Error messages** — "The following fields are required: name, email, and password"
- **Breadcrumbs** — formatting a path array for display
- **Email templates** — "Your meeting with Alice, Bob, and Carol has been confirmed"

The interview tests string manipulation, edge case handling for each of the 4 length categories, and whether you think about the Oxford comma option unprompted.

---

## The Problem

> "Implement `listFormat(array, options)` that returns a human-readable string:
> - `[]` → `''`
> - `['a']` → `'a'`
> - `['a', 'b']` → `'a and b'`
> - `['a', 'b', 'c']` → `'a, b, and c'`"
>
> "Add options: `conjunction` (default `'and'`), `oxfordComma` (default `true`)."

---

## Thought Process

This is a pure length-dispatch:
- 0 → `''`
- 1 → `items[0]`
- 2 → `items[0] + conjunction + items[1]`
- 3+ → `items.slice(0, -1).join(', ') + comma + conjunction + last`

The Oxford comma is the comma before the conjunction in lists of 3+: `a, b, and c` (with) vs `a, b and c` (without). The default in American English is with.

---

## Step 1 — Base Cases

```js-exec
function listFormat(items, { conjunction = 'and', oxfordComma = true } = {}) {
  if (!Array.isArray(items)) return '';
  const filtered = items.filter(item => item != null);
  const len = filtered.length;

  if (len === 0) return '';
  if (len === 1) return String(filtered[0]);
  if (len === 2) return `${filtered[0]} ${conjunction} ${filtered[1]}`;

  const comma = oxfordComma ? ',' : '';
  const allButLast = filtered.slice(0, -1).join(', ');
  return `${allButLast}${comma} ${conjunction} ${filtered[len - 1]}`;
}

console.log(listFormat(['a', 'b', 'c']));
// 'a, b, and c'

console.log(listFormat(['a', 'b', 'c'], { oxfordComma: false }));
// 'a, b and c'

console.log(listFormat(['apples', 'oranges'], { conjunction: 'or' }));
// 'apples or oranges'
```

---

## Step 2 — Formatting Individual Items

The interviewer says: "What if items need to be quoted or formatted?"

```js-exec
function listFormat(items, {
  conjunction = 'and',
  oxfordComma = true,
  format = String
} = {}) {
  if (!Array.isArray(items)) return '';
  const filtered = items.filter(item => item != null).map(format);
  const len = filtered.length;

  if (len === 0) return '';
  if (len === 1) return filtered[0];
  if (len === 2) return `${filtered[0]} ${conjunction} ${filtered[1]}`;

  const comma = oxfordComma ? ',' : '';
  const allButLast = filtered.slice(0, -1).join(', ');
  return `${allButLast}${comma} ${conjunction} ${filtered[len - 1]}`;
}

console.log(listFormat(['a', 'b', 'c'], { format: s => `"${s}"` }));
// '"a", "b", and "c"'
```

---

## Step 3 — Disjunction Style (or / and)

American English uses "and" for the last item; some styles use "or". Support it:

```js-exec
console.log(listFormat(['red', 'blue', 'green'], { conjunction: 'or' }));
// 'red, blue, or green'
```

---

## Step 4 — Edge Cases

**null/undefined in array**: Filter them out — `listFormat(['a', null, 'b'])` → `'a and b'`. Skipping nulls is what `Intl.ListFormat` does.

**Numbers**: `listFormat([1, 2, 3])` → `'1, 2, and 3'`. `String()` conversion handles this.

**Single-item array**: Returns just that item as a string. `listFormat(['alone'])` → `'alone'`.

**Empty array**: Returns `''`. No items to format.

**Non-array input**: Guard at the top: `if (!Array.isArray(items)) return ''`.

---

## Full Solution

```js-exec
function listFormat(items, {
  conjunction = 'and',
  oxfordComma = true,
  format = String
} = {}) {
  if (!Array.isArray(items)) return '';

  const filtered = items.filter(item => item != null).map(format);
  const len = filtered.length;

  if (len === 0) return '';
  if (len === 1) return filtered[0];
  if (len === 2) return `${filtered[0]} ${conjunction} ${filtered[1]}`;

  const comma = oxfordComma ? ',' : '';
  const allButLast = filtered.slice(0, -1).join(', ');
  return `${allButLast}${comma} ${conjunction} ${filtered[len - 1]}`;
}
```

---

## What Interviewers Are Testing

- **Length-based dispatching** — cleanly handling 0, 1, 2, and N cases
- **Oxford comma awareness** — knowing it's a style option, not a fixed rule
- **Null filtering** — filtering out undefined/null items before formatting
- **Configurability** — making the function flexible via options

---

## Complexity

| | Time | Space |
|-|------|-------|
| listFormat | O(N) | O(N) — joined string |

---

## Interview Tips

- **Handle the four cases explicitly** — don't try to write one formula for all lengths. The 0/1/2 cases are clearer as separate branches.
- **Default to Oxford comma with an option** — "I'll default to the Oxford comma since it's standard in American English, but make it configurable."
- **Mention `Intl.ListFormat`** — "Browsers have `Intl.ListFormat` for locale-aware list formatting. This implementation gives you full control over the English output."
- **Filter nulls before formatting** — `items.filter(item => item != null)` removes both `null` and `undefined` in one pass.

---

## Related Questions

- [Implement classnames()](/articles/js-interview-classnames)
- [Implement map(), filter() & reduce()](/articles/js-interview-map-filter-reduce)
- [Implement Data Merging](/articles/js-interview-data-merging)
