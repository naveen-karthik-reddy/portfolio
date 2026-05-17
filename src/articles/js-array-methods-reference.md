JavaScript arrays have 30+ built-in methods. This is a practical reference organized by what they do — not just a list of signatures. Every method includes a runnable example showing ***why*** you'd reach for it.

---

## 1. Adding & Removing Elements

### `push(...items)` / `pop()` — End of Array (Stack)

```js-exec
const arr = [1, 2];
arr.push(3, 4);
console.log(arr);         // [1, 2, 3, 4]
console.log(arr.pop());   // 4
console.log(arr);         // [1, 2, 3]
```

Both mutate the array. `push` returns the new length; `pop` returns the removed element.

### `unshift(...items)` / `shift()` — Beginning of Array (Queue)

```js-exec
const arr = [2, 3];
arr.unshift(0, 1);
console.log(arr);           // [0, 1, 2, 3]
console.log(arr.shift());   // 0
console.log(arr);           // [1, 2, 3]
```

O(N) — all elements shift. `push`/`pop` are O(1) and preferred for performance.

### `splice(start, deleteCount?, ...items)` — Insert / Remove Anywhere

```js-exec
const arr = ['a', 'b', 'c', 'd'];

// Remove 2 items at index 1
arr.splice(1, 2);
console.log(arr);  // ['a', 'd']

// Insert at index 1 (deleteCount = 0)
arr.splice(1, 0, 'x', 'y');
console.log(arr);  // ['a', 'x', 'y', 'd']

// Replace 1 item at index 2
arr.splice(2, 1, 'z');
console.log(arr);  // ['a', 'x', 'z', 'd']
```

`splice` mutates and returns the removed elements.

---

## 2. Non-Mutating Access & Slicing

### `slice(start?, end?)` — Extract a Portion

```js-exec
const arr = ['a', 'b', 'c', 'd'];
console.log(arr.slice(1, 3));    // ['b', 'c']  (index 1 to before 3)
console.log(arr.slice(1));       // ['b', 'c', 'd']  (from 1 to end)
console.log(arr.slice(-2));      // ['c', 'd']  (last 2)
console.log(arr.slice());        // ['a', 'b', 'c', 'd']  (shallow copy)
```

**Interview use**: Extracting everything except the last item (`slice(0, -1)` in listFormat), shallow cloning.

### `join(separator?)` — Array → String

```js-exec
const arr = ['a', 'b', 'c'];
console.log(arr.join());        // 'a,b,c'  (default comma)
console.log(arr.join(', '));    // 'a, b, c'
console.log(arr.join(''));      // 'abc'
```

**Interview use**: Turning class name arrays into strings (classnames), building list strings (listFormat).

### `concat(...values)` — Merge Arrays

```js-exec
const a = [1, 2];
const b = [3, 4];
console.log(a.concat(b));        // [1, 2, 3, 4]
console.log(a.concat(b, [5]));   // [1, 2, 3, 4, 5]
console.log(a.concat(5));        // [1, 2, 5]
```

Does not mutate. Spread `[...a, ...b]` is the modern alternative.

---

## 3. Searching & Finding

### `indexOf(value, fromIndex?)` / `lastIndexOf(value)` — Position

```js-exec
const arr = ['a', 'b', 'a', 'c'];
console.log(arr.indexOf('a'));      // 0
console.log(arr.indexOf('a', 1));   // 2  (search from index 1)
console.log(arr.lastIndexOf('a'));  // 2
console.log(arr.indexOf('z'));      // -1  (not found)
```

Uses `===` comparison. Cannot find `NaN` (`NaN !== NaN`).

### `includes(value, fromIndex?)` — Contains Check

```js-exec
const arr = [1, 2, NaN, 4];
console.log(arr.includes(2));     // true
console.log(arr.includes(NaN));   // true  (uses SameValueZero — finds NaN)
console.log(arr.includes(5));     // false
```

**Interview use**: Checking if a value exists (multi-value filter, class name dedup).

### `find(callback)` / `findIndex(callback)` — First Match

```js-exec
const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
console.log(users.find(u => u.name === 'Bob'));     // { id: 2, name: 'Bob' }
console.log(users.findIndex(u => u.name === 'Bob')); // 1
console.log(users.find(u => u.name === 'Eve'));      // undefined
```

Returns the first match, not all matches. Use `filter` for all matches.

### `filter(callback)` / `some(callback)` / `every(callback)` — Condition Tests

```js-exec
const nums = [1, 2, 3, 4, 5];

// All matches
console.log(nums.filter(n => n > 2));   // [3, 4, 5]

// At least one matches
console.log(nums.some(n => n > 4));     // true

// All must match
console.log(nums.every(n => n > 0));    // true
console.log(nums.every(n => n > 2));    // false
```

**Interview use**: `filter` in data selection (#30), `some` in OR filter groups, `every` for multi-class matching (#24 DOM traversal).

---

## 4. Transforming (Non-Mutating)

### `map(callback)` — Transform Each Element

```js-exec
const nums = [1, 2, 3];
console.log(nums.map(n => n * n));          // [1, 4, 9]
console.log(nums.map((n, i) => `${i}:${n}`)); // ['0:1', '1:2', '2:3']
```

Returns a new array of the same length. **Interview use**: Deep cloning arrays, transforming data, generating JSX.

### `reduce(callback, initialValue?)` — Accumulate

```js-exec
const nums = [1, 2, 3, 4];

// Sum
console.log(nums.reduce((acc, n) => acc + n, 0));  // 10

// Build object
console.log(nums.reduce((acc, n) => {
  acc[n] = n * n;
  return acc;
}, {}));  // { 1: 1, 2: 4, 3: 9, 4: 16 }

// Flatten
const nested = [[1, 2], [3, 4]];
console.log(nested.reduce((acc, arr) => acc.concat(arr), []));  // [1, 2, 3, 4]
```

**Interview use**: countBy, groupBy, data merging, flatten one-liner.

### `flat(depth?)` / `flatMap(callback)` — Flatten

```js-exec
const nested = [1, [2, [3, [4]]]];
console.log(nested.flat());       // [1, 2, [3, [4]]]  (depth 1 default)
console.log(nested.flat(2));      // [1, 2, 3, [4]]
console.log(nested.flat(Infinity)); // [1, 2, 3, 4]

// flatMap = map + flat(1)
const arr = ['hello world', 'foo bar'];
console.log(arr.flatMap(s => s.split(' ')));  // ['hello', 'world', 'foo', 'bar']
```

**Interview use**: Interview #12 flatten implementation, transforming and flattening in one pass.

---

## 5. Sorting & Ordering

### `sort(compareFn?)` — In-Place Sort

```js-exec
const arr = [3, 1, 4, 1, 5];

// Numbers need a comparator — default is string sort!
console.log([...arr].sort((a, b) => a - b));  // [1, 1, 3, 4, 5]  ascending
console.log([...arr].sort((a, b) => b - a));  // [5, 4, 3, 1, 1]  descending

// Strings sort lexicographically by default
console.log(['c', 'a', 'b'].sort());  // ['a', 'b', 'c']
```

Mutates the original. Clone first with `[...arr]` if you need immutability.

### `reverse()` — In-Place Reverse

```js-exec
const arr = [1, 2, 3];
arr.reverse();
console.log(arr);  // [3, 2, 1]
```

---

## 6. Iteration Methods

### `forEach(callback)` — Loop with Side Effects

```js-exec
const arr = ['a', 'b', 'c'];
arr.forEach((item, i) => console.log(`${i}: ${item}`));
// 0: a
// 1: b
// 2: c
```

No return value. Cannot break early. Prefer `for...of` if you need `break`/`continue`.

---

## 7. Utility Methods

### `Array.isArray(value)` — Type Check

```js-exec
console.log(Array.isArray([]));     // true
console.log(Array.isArray({}));     // false
console.log(Array.isArray('str'));  // false
```

The only reliable way to check if something is an array. `typeof []` returns `'object'`.

### `Array.from(iterable, mapFn?)` — Create from Iterable

```js-exec
console.log(Array.from('hello'));           // ['h', 'e', 'l', 'l', 'o']
console.log(Array.from(new Set([1, 2, 3]))); // [1, 2, 3]
console.log(Array.from({ length: 3 }, (_, i) => i));  // [0, 1, 2]
```

### `Array.of(...items)` — Create from Arguments

```js-exec
console.log(Array.of(1, 2, 3));  // [1, 2, 3]
console.log(Array.of(3));        // [3]  — unlike new Array(3) which creates [empty × 3]
```

---

## Mutation vs Non-Mutation Summary

| Mutates | Does NOT Mutate |
|-|-|
| push, pop, shift, unshift, splice, sort, reverse, fill, copyWithin | slice, concat, join, map, filter, reduce, find, findIndex, indexOf, includes, some, every, flat, flatMap, forEach, entries, keys, values |

---

## Interview Tips

- **Clone before mutating** — `[...arr].sort()` not `arr.sort()` if you need the original.
- **`includes` finds NaN** — `indexOf` doesn't. Know the difference.
- **`splice` is the Swiss Army knife** — insert, remove, and replace all in one call.
- **`reduce` can build anything** — objects, arrays, maps — it's the most general array method.

---

## Related Articles

- [Arrays #1 — map, filter, reduce Polyfills](/articles/js-array-methods-polyfills-1)
- [Arrays #2 — flat, flatMap, find, every, some Polyfills](/articles/js-array-methods-polyfills-2)
- [#2 — Implement map(), filter() & reduce()](/articles/js-interview-map-filter-reduce)
- [#12 — Implement flatten()](/articles/js-interview-flatten)
