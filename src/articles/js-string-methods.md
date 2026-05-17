JavaScript strings have 30+ methods. This is a practical reference for the ones you'll use in interviews: searching, slicing, transforming, and pattern matching. Every method includes a runnable example.

---

## 1. Accessing Characters

### `charAt(index)` / Bracket Notation `[index]`

```js-exec
const str = 'hello';
console.log(str.charAt(0));   // 'h'
console.log(str[0]);          // 'h'  (modern, but read-only)
console.log(str.charAt(99));  // ''   (empty string, not undefined)
console.log(str[99]);         // undefined
```

Difference: `charAt` returns `''` for out-of-bounds; bracket notation returns `undefined`.

### `at(index)` — Negative Index Support

```js-exec
const str = 'hello';
console.log(str.at(0));    // 'h'
console.log(str.at(-1));   // 'o'  (last character)
console.log(str.at(-2));   // 'l'
```

---

## 2. Searching

### `indexOf(substring, fromIndex?)` / `lastIndexOf(substring)` — Find Position

```js-exec
const str = 'hello world hello';
console.log(str.indexOf('hello'));       // 0  (first occurrence)
console.log(str.indexOf('hello', 5));    // 12 (search from index 5)
console.log(str.lastIndexOf('hello'));   // 12
console.log(str.indexOf('xyz'));         // -1 (not found)
```

### `includes(substring, fromIndex?)` — Contains Check

```js-exec
const str = 'hello world';
console.log(str.includes('world'));   // true
console.log(str.includes('xyz'));     // false
```

### `startsWith(substring, fromIndex?)` / `endsWith(substring, length?)` — Edge Checks

```js-exec
const str = 'hello world';
console.log(str.startsWith('hello'));  // true
console.log(str.startsWith('world'));  // false
console.log(str.endsWith('world'));    // true
console.log(str.endsWith('hello'));    // false
```

---

## 3. Extracting Substrings

### `slice(start, end?)` — Extract by Index

```js-exec
const str = 'hello world';
console.log(str.slice(0, 5));     // 'hello'
console.log(str.slice(6));        // 'world'
console.log(str.slice(-5));       // 'world'  (last 5)
console.log(str.slice(0, -6));    // 'hello'
```

**Interview use**: Getting all but the last part of a path, extracting segments.

### `substring(start, end)` — Similar to Slice

```js-exec
const str = 'hello';
console.log(str.substring(0, 3));  // 'hel'
```

Doesn't support negative indices. `slice` is preferred.

### `split(separator, limit?)` — String → Array

```js-exec
const str = 'a.b.c.d';
console.log(str.split('.'));       // ['a', 'b', 'c', 'd']
console.log(str.split('.', 2));    // ['a', 'b']  (limit)
console.log('hello'.split(''));    // ['h', 'e', 'l', 'l', 'o']
```

**Interview use**: Path parsing in `_.get()` (#6), squashing/unsquashing keys (#16), multi-class splitting (#24).

---

## 4. Transforming

### `toLowerCase()` / `toUpperCase()` — Case Conversion

```js-exec
console.log('Hello'.toLowerCase());  // 'hello'
console.log('Hello'.toUpperCase());  // 'HELLO'
```

**Interview use**: Case-insensitive tag comparison in DOM traversal (#24).

### `trim()` / `trimStart()` / `trimEnd()` — Whitespace Removal

```js-exec
console.log('  hello  '.trim());        // 'hello'
console.log('  hello  '.trimStart());   // 'hello  '
console.log('  hello  '.trimEnd());     // '  hello'
```

### `repeat(count)` — Duplicate

```js-exec
console.log('ha'.repeat(3));  // 'hahaha'
```

### `padStart(length, padString?)` / `padEnd(length, padString?)` — Padding

```js-exec
console.log('42'.padStart(5, '0'));   // '00042'
console.log('abc'.padEnd(6, '...'));  // 'abc...'
```

---

## 5. Replace & Match (Without Regex)

### `replace(substring, newValue)` — Replace First Occurrence

```js-exec
const str = 'hello hello';
console.log(str.replace('hello', 'hi'));  // 'hi hello'  (only first!)
```

To replace all without regex, use `replaceAll`.

### `replaceAll(substring, newValue)` — Replace All

```js-exec
console.log('hello hello'.replaceAll('hello', 'hi'));  // 'hi hi'
```

**Interview use**: Escaping special characters for JSON.stringify (#17), bracket-notation to dot-notation conversion (#16).

---

## 6. String Concatenation

### `concat(...strings)` — Join Strings

```js-exec
console.log('hello'.concat(' ', 'world'));  // 'hello world'
```

Template literals `` `${a} ${b}` `` are preferred for readability.

---

## 7. Regex-Based Methods

### `match(regex)` — Find Matches

```js-exec
const str = 'the cat and the hat';
console.log(str.match(/[ch]at/g));  // ['cat', 'hat']
```

Without the `g` flag, returns match details (groups, index). With `g`, returns all matches as an array.

### `search(regex)` — Find Index of First Match

```js-exec
console.log('hello 123'.search(/\d/));  // 6
```

### `replace(regex, replacement)` — Regex Replace

```js-exec
console.log('a-b-c'.replace(/-/g, '.'));  // 'a.b.c'

// With function — dynamic replacement
console.log('a1b2c3'.replace(/\d/g, m => parseInt(m) * 2));  // 'a2b4c6'
```

**Interview use**: Path parsing with dot/bracket notation (#6, #16), JSON string escaping (#17), bracket index extraction (#16).

---

## Quick Reference

| Method | What It Does |
|-|-|
| `charAt(i)` / `[i]` | Character at index |
| `at(i)` | Character at index (supports negative) |
| `indexOf(s)` | First occurrence index, or -1 |
| `lastIndexOf(s)` | Last occurrence index |
| `includes(s)` | Contains check (boolean) |
| `startsWith(s)` | Starts with check |
| `endsWith(s)` | Ends with check |
| `slice(s, e)` | Extract substring by index |
| `split(sep)` | Split into array |
| `toLowerCase()` | Lowercase |
| `toUpperCase()` | Uppercase |
| `trim()` | Remove surrounding whitespace |
| `replace(s, r)` | Replace first occurrence |
| `replaceAll(s, r)` | Replace all occurrences |
| `repeat(n)` | Repeat string n times |
| `padStart(n, s)` | Pad from start |
| `padEnd(n, s)` | Pad from end |
| `match(regex)` | Regex match |
| `search(regex)` | Regex search index |
| `concat(...s)` | Concatenate |

---

## Interview Tips

- **Use `split` for path parsing** — `'a.b.c'.split('.')` is cleaner than manual iteration.
- **Use `replaceAll` for bulk replacement** — no need for regex unless the pattern is complex.
- **Use `slice` with negatives** — `str.slice(-1)` for last char, `str.slice(0, -1)` for all but last.
- **Case-insensitive comparison** — `.toLowerCase()` both strings before comparing.

---

## Related Articles

- [#6 — Implement _.get()](/articles/js-interview-get)
- [#16 — Implement squash()](/articles/js-interview-squash-object)
- [#17 — Implement JSON.stringify()](/articles/js-interview-json-stringify)
- [Regular Expressions in JavaScript](/articles/js-regex-basics)
