`listFormat(array)` converts an array into a human-readable list string: `['a', 'b', 'c']` → `"a, b, and c"`. The logic depends on the length — 0, 1, 2, and 3+ items each have different formatting. Support custom conjunctions and an Oxford comma option.

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

- [#23 — Implement classnames()](/articles/js-interview-classnames)
- [#2 — Implement map(), filter() & reduce()](/articles/js-interview-map-filter-reduce)
- [#25 — Implement Data Merging](/articles/js-interview-data-merging)
