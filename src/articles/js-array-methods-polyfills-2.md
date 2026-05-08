Building on `map`, `filter`, and `reduce`, this article implements `flat`, `flatMap`, `find`, `findIndex`, `every`, and `some` — the remaining essential array methods — from scratch.

**Prerequisites:** [Arrays #1 — `map`, `filter`, `reduce`](/articles/javascript-series/js-array-methods-polyfills-1)

---

## 1. Implementing `Array.prototype.flat(depth)`

`flat` recursively flattens nested arrays up to a specified depth (default 1, `Infinity` for complete flattening):

```js-exec
Array.prototype.myFlat = function (depth = 1) {
  const result = [];

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      const item = this[i];
      if (Array.isArray(item) && depth > 0) {
        // Recursively flatten this sub-array with depth - 1
        const flattened = item.myFlat(depth - 1);
        result.push(...flattened);
      } else {
        result.push(item);
      }
    }
  }

  /**
   * Note: this iter. approach skips empty slots from result.
   * A push-only result means we produce dense arrays — matching native flat.
   */
  return result;
};

// Test
const nested = [1, [2, 3], [4, [5, 6]]];
console.log("depth 1:", nested.myFlat());       // [1, 2, 3, 4, [5, 6]]
console.log("depth 2:", nested.myFlat(2));       // [1, 2, 3, 4, 5, 6]
console.log("Infinity:", nested.myFlat(Infinity)); // [1, 2, 3, 4, 5, 6]

// Sparse arrays — empty slots are removed
const sparse = [1, , [3, , 4]];
console.log("Sparse flat:", sparse.myFlat());   // [1, 3, 4]
```

---

## 2. Implementing `Array.prototype.flatMap()`

`flatMap` is `map` followed by `flat(1)` — but more efficient because it's done in one pass:

```js-exec
Array.prototype.myFlatMap = function (callback, thisArg) {
  const result = [];

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      const mapped = callback.call(thisArg, this[i], i, this);

      // If callback returns an array, flatten it by one level
      if (Array.isArray(mapped)) {
        result.push(...mapped);
      } else {
        result.push(mapped);
      }
    }
  }

  return result;
};

// Test
const arr = [1, 2, 3];

// map would produce [[1], [2, 2], [3, 3, 3]]
// flatMap flattens the result by one level
const result = arr.myFlatMap((x) => Array(x).fill(x));
console.log("flatMap:", result); // [1, 2, 2, 3, 3, 3]

// Classic use: filter + map in one pass
const words = ["hello world", "goodbye moon"];
const letters = words.myFlatMap((sentence) => sentence.split(" "));
console.log("Words:", letters); // ["hello", "world", "goodbye", "moon"]

// Return non-arrays — they're added as-is
const mixed = [1, 2, 3].myFlatMap((x) => (x > 1 ? [x, x * 10] : x));
console.log("Mixed:", mixed); // [1, 2, 20, 3, 30]
```

---

## 3. Implementing `Array.prototype.find()` and `findIndex()`

`find` returns the first element that passes the test; `findIndex` returns its index:

```js-exec
Array.prototype.myFind = function (callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      return this[i];
    }
  }
  return undefined;
};

Array.prototype.myFindIndex = function (callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      return i;
    }
  }
  return -1;
};

// Test
const users = [
  { id: 1, name: "Alice", active: false },
  { id: 2, name: "Bob", active: true },
  { id: 3, name: "Carol", active: true },
];

console.log("find:", users.myFind((u) => u.active));      // { id: 2, ... }
console.log("findIndex:", users.myFindIndex((u) => u.active)); // 1
console.log("not found:", users.myFind((u) => u.id === 99));   // undefined
console.log("not found idx:", users.myFindIndex((u) => u.id === 99)); // -1
```

---

## 4. Implementing `Array.prototype.every()` and `some()`

`every` checks if ALL elements pass the test. `some` checks if AT LEAST ONE passes. Both short-circuit:

```js-exec
Array.prototype.myEvery = function (callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      if (!callback.call(thisArg, this[i], i, this)) {
        return false; // Short-circuit on first failure
      }
    }
  }
  return true; // Empty array returns true (vacuous truth)
};

Array.prototype.mySome = function (callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      if (callback.call(thisArg, this[i], i, this)) {
        return true; // Short-circuit on first success
      }
    }
  }
  return false; // Empty array returns false
};

// Test
const nums = [2, 4, 6, 8];

console.log("every even:", nums.myEvery((x) => x % 2 === 0)); // true
console.log("every > 5:", nums.myEvery((x) => x > 5));        // false — 2 fails
console.log("some > 5:", nums.mySome((x) => x > 5));          // true — 6 and 8
console.log("some > 10:", nums.mySome((x) => x > 10));        // false — none

// Edge case: empty arrays
console.log("[].every: ", [].myEvery(() => false)); // true (always)
console.log("[].some: ", [].mySome(() => true));    // false (always)
```

---

## 5. Implementing `Array.prototype.forEach()`

`forEach` is like `map` but returns `undefined` — it's for side effects, not transformation:

```js-exec
Array.prototype.myForEach = function (callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      callback.call(thisArg, this[i], i, this);
    }
  }
  // Returns undefined (implicit)
};

// Test
const arr = ["a", "b", "c"];
let concat = "";

arr.myForEach((item, i) => {
  concat += `${i}:${item}, `;
});

console.log(concat); // "0:a, 1:b, 2:c, "

// vs map — forEach returns undefined
const mapped = arr.map((x) => x.toUpperCase());
const eachResult = arr.myForEach((x) => x.toUpperCase());

console.log("map returns:", mapped);       // ["A", "B", "C"]
console.log("forEach returns:", eachResult); // undefined
```

---

## 6. Quick Reference — All Array Methods

```js-exec
const arr = [1, 2, 3, 4, 5];

// Transformation
console.log("map:", arr.myMap((x) => x * 2));           // [2, 4, 6, 8, 10]
console.log("filter:", arr.myFilter((x) => x > 2));      // [3, 4, 5]
console.log("reduce:", arr.myReduce((a, x) => a + x, 0)); // 15
console.log("flatMap:", arr.myFlatMap((x) => [x, x]));    // [1,1,2,2,3,3,4,4,5,5]

// Search
console.log("find:", arr.myFind((x) => x > 3));           // 4
console.log("findIndex:", arr.myFindIndex((x) => x > 3));  // 3

// Test
console.log("every < 10:", arr.myEvery((x) => x < 10));    // true
console.log("some > 4:", arr.mySome((x) => x > 4));        // true
```

---

## Key Takeaways

- `flat(depth)` recursively flattens — `Infinity` flattens everything, sparse slots are removed.
- `flatMap` is `map` + `flat(1)` in one pass — use when your map returns arrays.
- `find`/`findIndex` return on the first match — `undefined`/`-1` if none.
- `every` short-circuits on `false`; `some` short-circuits on `true`.
- `forEach` is for side effects — it always returns `undefined`.
- All methods skip empty slots via the `i in this` check.

---

**Next:** [Functions #4 — `memoize()` & `once()` ](/articles/javascript-series/js-memoize-once) — cache function results and ensure a function runs only once.
