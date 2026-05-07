`map`, `filter`, and `reduce` are the foundation of functional array processing in JavaScript. Understanding exactly how they work — including callback signatures, `thisArg`, and sparse array handling — is the goal. This article builds polyfills for each.

**Prerequisites:** [JS Foundations #3 — Closures](/articles/javascript-series/js-closures-lexical-scope)

---

## 1. How the Real Methods Behave

Before building polyfills, understand what each method does:

```js-exec
const arr = [1, 2, 3, 4, 5];

// map — transform each element, return new array of same length
console.log("map:", arr.map((x) => x * 2)); // [2, 4, 6, 8, 10]

// filter — keep elements that pass the test
console.log("filter:", arr.filter((x) => x > 2)); // [3, 4, 5]

// reduce — accumulate into a single value
console.log("reduce:", arr.reduce((acc, x) => acc + x, 0)); // 15
```

Each callback receives `(element, index, array)`. `map` and `filter` also accept `thisArg` as the second argument.

---

## 2. Implementing `Array.prototype.map()`

```js-exec
Array.prototype.myMap = function (callback, thisArg) {
  const result = [];

  for (let i = 0; i < this.length; i++) {
    // Handle sparse arrays — skip empty slots
    if (i in this) {
      result[i] = callback.call(thisArg, this[i], i, this);
    }
    // else: leave result[i] as empty (sparse)
  }

  return result;
};

// Test
const nums = [1, 2, 3];
console.log("myMap double:", nums.myMap((x) => x * 2)); // [2, 4, 6]

// Sparse array handling
const sparse = [1, , 3]; // Middle slot is empty
console.log("myMap sparse:", sparse.myMap((x) => x * 2)); // [2, empty, 6]
console.log("Length preserved:", sparse.myMap((x) => x * 2).length); // 3

// thisArg test
const multiplier = {
  factor: 10,
  multiply(n) { return n * this.factor; },
};
console.log("With thisArg:", nums.myMap(multiplier.multiply, multiplier)); // [10, 20, 30]
```

The `i in this` check is crucial — it skips empty slots in sparse arrays, just like the native `map`.

---

## 3. Implementing `Array.prototype.filter()`

```js-exec
Array.prototype.myFilter = function (callback, thisArg) {
  const result = [];

  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      const passes = callback.call(thisArg, this[i], i, this);
      if (passes) {
        result.push(this[i]);
      }
    }
  }

  return result;
};

// Test
const numbers = [1, 2, 3, 4, 5, 6];
console.log("Evens:", numbers.myFilter((x) => x % 2 === 0)); // [2, 4, 6]
console.log("> 3:", numbers.myFilter((x) => x > 3)); // [4, 5, 6]

// Sparse array
const sparse = [1, , 3, , 5];
console.log("Filter sparse:", sparse.myFilter((x) => x > 2)); // [3, 5]

// thisArg
const threshold = { min: 3 };
console.log("With thisArg:", numbers.myFilter(function (x) {
  return x > this.min;
}, threshold)); // [4, 5, 6]
```

Filter returns a **dense** array — the result has no empty slots, unlike `map`.

---

## 4. Implementing `Array.prototype.reduce()`

`reduce` is the most flexible — all other array methods can be built from it:

```js-exec
Array.prototype.myReduce = function (callback, initialValue) {
  if (typeof callback !== "function") {
    throw new TypeError("Callback must be a function");
  }

  let accumulator;
  let startIndex = 0;

  if (arguments.length >= 2) {
    // initialValue provided
    accumulator = initialValue;
  } else {
    // No initialValue — use first element of array
    // Need to handle sparse arrays: find first existing element
    let found = false;
    for (let i = 0; i < this.length; i++) {
      if (i in this) {
        accumulator = this[i];
        startIndex = i + 1;
        found = true;
        break;
      }
    }
    if (!found) {
      throw new TypeError("Reduce of empty array with no initial value");
    }
  }

  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      accumulator = callback(accumulator, this[i], i, this);
    }
  }

  return accumulator;
};

// Test
const nums = [1, 2, 3, 4];

console.log("Sum:", nums.myReduce((acc, x) => acc + x, 0)); // 10
console.log("Product:", nums.myReduce((acc, x) => acc * x, 1)); // 24
console.log("Max:", nums.myReduce((acc, x) => Math.max(acc, x))); // 4 (no initialValue)

// Reduce to an object
const grouped = nums.myReduce((acc, x) => {
  const key = x % 2 === 0 ? "even" : "odd";
  (acc[key] ??= []).push(x);
  return acc;
}, {});
console.log("Grouped:", grouped); // { odd: [1, 3], even: [2, 4] }

// Error cases
try {
  [].myReduce((acc, x) => acc + x);
} catch (e) {
  console.log("Empty array error:", e.message);
}
```

---

## 5. Building `map` and `filter` from `reduce`

This demonstrates that `reduce` is the core primitive — everything else is a specialization:

```js-exec
// map via reduce
function mapViaReduce(arr, callback, thisArg) {
  return arr.reduce((result, item, index) => {
    result[index] = callback.call(thisArg, item, index, arr);
    return result;
  }, []);
}

// filter via reduce
function filterViaReduce(arr, callback, thisArg) {
  return arr.reduce((result, item, index) => {
    if (callback.call(thisArg, item, index, arr)) {
      result.push(item);
    }
    return result;
  }, []);
}

const arr = [1, 2, 3, 4, 5];
console.log("map via reduce:", mapViaReduce(arr, (x) => x * x)); // [1, 4, 9, 16, 25]
console.log("filter via reduce:", filterViaReduce(arr, (x) => x > 2)); // [3, 4, 5]
```

---

## 6. Classic `reduce` Interview Problems

```js-exec
const data = [
  { category: "fruit", name: "apple", price: 1 },
  { category: "fruit", name: "banana", price: 2 },
  { category: "vegetable", name: "carrot", price: 3 },
  { category: "fruit", name: "orange", price: 4 },
  { category: "vegetable", name: "potato", price: 5 },
];

// 1. Group by category
const grouped = data.reduce((acc, item) => {
  (acc[item.category] ??= []).push(item);
  return acc;
}, {});
console.log("Grouped:", grouped);

// 2. Total price
const total = data.reduce((sum, item) => sum + item.price, 0);
console.log("Total:", total); // 15

// 3. Count by category
const counts = data.reduce((acc, item) => {
  acc[item.category] = (acc[item.category] ?? 0) + 1;
  return acc;
}, {});
console.log("Counts:", counts); // { fruit: 3, vegetable: 2 }

// 4. Flatten an array of arrays (reduce as flat)
const nested = [[1, 2], [3, 4], [5]];
const flat = nested.reduce((acc, arr) => acc.concat(arr), []);
console.log("Flattened:", flat); // [1, 2, 3, 4, 5]

// 5. Pipe functions via reduce
const pipe = (...fns) => (initial) =>
  fns.reduce((value, fn) => fn(value), initial);

const addOne = (x) => x + 1;
const double = (x) => x * 2;
const square = (x) => x * x;

const pipeline = pipe(addOne, double, square);
console.log("Pipeline (3 -> 64):", pipeline(3)); // ((3+1)*2)^2 = 64
```

---

## Key Takeaways

| Method | What it does | Returns | Callback returns |
|---|---|---|---|
| `map` | Transform each element | New array (same length) | Transformed value |
| `filter` | Keep elements that pass | New array (≤ length) | Boolean |
| `reduce` | Fold into single value | Accumulator | Next accumulator |

- All three receive `(element, index, array)` — `thisArg` is the optional second argument.
- Use `i in this` to skip empty slots in sparse arrays.
- **`reduce` without `initialValue` uses the first element** — and throws on empty arrays.
- Every other array method can be built from `reduce` — it's the universal primitive.

---

**Next:** [Arrays #2 — `flat`, `flatMap`, `find`, `every`, `some` Polyfills](/articles/javascript-series/js-array-methods-polyfills-2) — build the remaining essential array methods from scratch.
