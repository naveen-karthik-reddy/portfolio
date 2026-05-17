Regular expressions are JavaScript's pattern-matching engine. You'll need them for path parsing, string escaping, input validation, and search-and-replace. This article covers the syntax, flags, methods, and common patterns interviewers expect you to know.

---

## 1. Two Ways to Create a Regex

```js-exec
// Literal — preferred for static patterns
const re1 = /hello/gi;

// Constructor — needed for dynamic patterns
const word = 'hello';
const re2 = new RegExp(word, 'gi');

console.log(re1.source);  // 'hello'
console.log(re1.flags);   // 'gi'
```

Use the constructor when the pattern comes from a variable or includes user input (which must be escaped).

---

## 2. Flags

| Flag | Name | What It Does |
|-|-|-|
| `g` | Global | Find all matches, not just the first |
| `i` | Case-insensitive | Ignore case |
| `m` | Multiline | `^` and `$` match line boundaries |
| `s` | DotAll | `.` matches `\n` too |
| `u` | Unicode | Enable Unicode features |
| `y` | Sticky | Match at `lastIndex` exactly |

```js-exec
console.log('Hello hello'.match(/hello/));    // ['Hello'] — first match only
console.log('Hello hello'.match(/hello/gi));  // ['Hello', 'hello'] — all, case-insensitive
console.log('Hello hello'.match(/hello/g));   // ['hello'] — only lowercase (no `i` flag)
```

---

## 3. test() — Returns Boolean

```js-exec
console.log(/hello/.test('hello world'));  // true
console.log(/hello/.test('goodbye'));      // false
```

With the `g` flag, `test()` advances `lastIndex` — a surprising stateful behavior:

```js-exec
const re = /hello/g;
console.log(re.test('hello hello'));  // true  (lastIndex → 5)
console.log(re.test('hello hello'));  // true  (lastIndex → 11)
console.log(re.test('hello hello'));  // false (lastIndex → 0, resets)
```

When using `g` with `test`, reset `lastIndex` or avoid `g` if you just want a boolean.

---

## 4. exec() — Returns Match Details

```js-exec
const re = /(\w+)@(\w+)/;
const result = re.exec('Email: alice@example');
console.log(result[0]);    // 'alice@example'  (full match)
console.log(result[1]);    // 'alice'          (group 1)
console.log(result[2]);    // 'example'        (group 2)
console.log(result.index); // 7                (position of match)
```

With the `g` flag, `exec()` advances `lastIndex` — call it repeatedly to get all matches.

---

## 5. String Methods That Accept Regex

### `match(regex)` — Find Matches

```js-exec
const str = 'cat hat bat';

// Without g — returns first match with details
console.log(str.match(/(.)at/));
// ['cat', 'c', index: 0, ...]

// With g — returns array of full matches only
console.log(str.match(/(.)at/g));
// ['cat', 'hat', 'bat']
```

### `matchAll(regex)` — All Matches with Details

```js-exec
const str = 'cat hat bat';
for (const m of str.matchAll(/(.)at/g)) {
  console.log(m[0], m[1]);
}
// cat c
// hat h
// bat b
```

### `replace(regex, replacement)` — Replace Matches

```js-exec
const str = 'a-b-c';
console.log(str.replace(/-/g, '.'));       // 'a.b.c'

// With capture groups
console.log('first last'.replace(/(\w+) (\w+)/, '$2, $1'));  // 'last, first'

// With function
console.log('a1b2c3'.replace(/\d/g, m => String(Number(m) * 2)));  // 'a2b4c6'
```

**Interview use**: Path notation conversion (#16 — `[0]` → `.0`), JSON string escaping (#17).

### `search(regex)` — Index of First Match

```js-exec
console.log('hello 123'.search(/\d/));  // 6
console.log('hello'.search(/\d/));      // -1
```

### `split(regex)` — Split by Pattern

```js-exec
console.log('a.b.c'.split('.'));      // ['a', 'b', 'c']
console.log('a, b; c'.split(/[,;]\s*/));  // ['a', 'b', 'c']
```

**Interview use**: Parsing dot/bracket paths (#6), parsing multi-class strings (#24).

---

## 6. Character Classes

```js-exec
// Built-in classes
console.log(/\d/.test('5'));     // true  — digit [0-9]
console.log(/\w/.test('a'));     // true  — word [a-zA-Z0-9_]
console.log(/\s/.test(' '));     // true  — whitespace
console.log(/\D/.test('a'));     // true  — NOT digit
console.log(/\W/.test('!'));     // true  — NOT word
console.log(/\S/.test('a'));     // true  — NOT whitespace

// Custom character classes
console.log(/[aeiou]/.test('a'));  // true  — vowel
console.log(/[^aeiou]/.test('z')); // true  — NOT vowel (negated class)
```

---

## 7. Quantifiers

```js-exec
console.log(/a{3}/.test('aaa'));    // true  — exactly 3
console.log(/a{2,}/.test('aaa'));   // true  — 2 or more
console.log(/a{2,4}/.test('aa'));   // true  — 2 to 4
console.log(/a+/.test('a'));        // true  — 1 or more  ({1,})
console.log(/a*/.test(''));         // true  — 0 or more  ({0,})
console.log(/a?/.test(''));         // true  — 0 or 1     ({0,1})

// Greedy (default) vs lazy
console.log('aaaa'.match(/a+/)[0]);   // 'aaaa'  (greedy — take all)
console.log('aaaa'.match(/a+?/)[0]);  // 'a'     (lazy — take minimum)
```

---

## 8. Anchors and Boundaries

```js-exec
console.log(/^hello/.test('hello world'));  // true  — start of string
console.log(/world$/.test('hello world'));  // true  — end of string
console.log(/\bcat\b/.test('the cat'));     // true  — word boundary
console.log(/\bcat\b/.test('category'));    // false — 'cat' inside word
```

---

## 9. Groups and Alternation

```js-exec
// Alternation
console.log(/cat|dog/.test('dog'));         // true

// Capturing group
console.log('2024-01-15'.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1'));
// '15/01/2024'

// Non-capturing group
console.log(/(?:cat|dog)s/.test('cats'));   // true  — group doesn't capture

// Named groups (ES2018)
const re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const m = '2024-01-15'.match(re);
console.log(m.groups.year);   // '2024'
console.log(m.groups.month);  // '01'
console.log(m.groups.day);    // '15'
```

---

## 10. Lookahead and Lookbehind

```js-exec
// Lookahead: X(?=Y) — X followed by Y (but Y is not part of the match)
console.log('100px'.match(/\d+(?=px)/)[0]);   // '100'

// Negative lookahead: X(?!Y) — X NOT followed by Y
console.log('100em'.match(/\d+(?!px)/)[0]);   // '100'

// Lookbehind (ES2018): (?<=Y)X — X preceded by Y
console.log('$100'.match(/(?<=\$)\d+/)[0]);   // '100'
```

---

## 11. Common Patterns

### Bracket Notation Parsing (#6, #16)

```js-exec
// Convert 'a[0].b[1].c' to ['a', '0', 'b', '1', 'c']
const path = 'a[0].b[1].c';
const keys = path
  .replace(/\[(\d+)\]/g, '.$1')  // [0] → .0
  .split('.');
console.log(keys);  // ['a', '0', 'b', '1', 'c']
```

### JSON String Escaping (#17)

```js-exec
function escapeString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}
console.log(escapeString('line1\nline2\t"quoted"'));
// line1\nline2\t\"quoted\"
```

### Email Validation (Basic)

```js-exec
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
console.log(emailRe.test('user@example.com'));   // true
console.log(emailRe.test('not-an-email'));       // false
```

---

## Quick Reference

| Pattern | Meaning |
|-|-|
| `.` | Any character except `\n` (all with `s` flag) |
| `\d` | Digit `[0-9]` |
| `\w` | Word `[a-zA-Z0-9_]` |
| `\s` | Whitespace |
| `\D`, `\W`, `\S` | Negations |
| `[abc]` | One of a, b, c |
| `[^abc]` | NOT one of a, b, c |
| `+` | 1 or more |
| `*` | 0 or more |
| `?` | 0 or 1 |
| `{n}` | Exactly n |
| `{n,}` | n or more |
| `{n,m}` | n to m |
| `^` | Start of string/line |
| `$` | End of string/line |
| `\b` | Word boundary |
| `(x\|y)` | Alternation |
| `(x)` | Capturing group |
| `(?:x)` | Non-capturing group |
| `(?<name>x)` | Named group |
| `x(?=y)` | Lookahead |
| `(?<=y)x` | Lookbehind |

---

## Interview Tips

- **Use literal syntax for static patterns** — `/pattern/flags` is cleaner and more performant.
- **Use constructor for dynamic patterns** — `new RegExp(variable, 'g')`.
- **Remember that `g` flag makes `test` and `exec` stateful** — either avoid `g` for simple checks or reset `lastIndex`.
- **Use `matchAll` instead of `exec` loops** — cleaner for iterating all matches with groups.

---

## Related Articles

- [#6 — Implement _.get()](/articles/js-interview-get)
- [#17 — Implement JSON.stringify()](/articles/js-interview-json-stringify)
- [String Methods Reference](/articles/js-string-methods)
