`map`, `filter`, and `reduce` appear in nearly every frontend interview. The question is rarely "do you know how to use them" — it's "implement them from scratch." Here's how to build polyfills that handle every edge case an interviewer will throw at you.

**Related deep-dive:** [Arrays #1 — map, filter, reduce Polyfills](/articles/js-array-methods-polyfills-1)

---

## The Problem

> "Implement `Array.prototype.myMap`, `myFilter`, and `myReduce` from scratch. Each must match the native method's behavior: callback signature, `thisArg`, and sparse array handling."

---

## Thought Process

All three follow the same skeleton:

```
1. Check that `this` is a valid array (or array-like)
2. Check that the callback is callable
3. Iterate over the array (skipping holes in sparse arrays)
4. Call the callback with (element, index, array)
5. Build and return the result
```

The differences are in step 5:
- **map**: return a new array of the same length with transformed values
- **filter**: return a new array with only elements that pass the test
- **reduce**: accumulate into a single value

---

## Step 1 — `myMap`

```js-exec
Array.prototype.myMap = function (callback, thisArg) {
  if (typeof callback !== "function") {
    throw new TypeError("callback is not a function");
  }

  const arr = this;          // `this` is the array being mapped
  const result = new Array(arr.length);

  for (let i = 0; i < arr.length; i++) {
    // Skip holes in sparse arrays
    if (i in arr) {
      result[i] = callback.call(thisArg, arr[i], i, arr);
    }
    // holes stay as empty slots in the result (native map behavior)
  }

  return result;
};

// Test
const nums = [1, 2, 3];
const doubled = nums.myMap((n) => n * 2);
console.log(doubled);  // [2, 4, 6]

// thisArg test
const multiplier = {
  factor: 10,
  multiply(n) { return n * this.factor; }
};
console.log([1, 2, 3].myMap(multiplier.multiply, multiplier));
// [10, 20, 30]
```

The `i in arr` check is crucial. In a sparse array like `[1, , 3]`, index 1 doesn't exist. `arr[1]` would be `undefined`, but the native `map` skips it entirely. Using `i in arr` correctly detects holes vs. actual `undefined` values.

---

## Step 2 — `myFilter`

Same structure, but we push matching elements instead of transforming every element:

```js-exec
Array.prototype.myFilter = function (callback, thisArg) {
  if (typeof callback !== "function") {
    throw new TypeError("callback is not a function");
  }

  const arr = this;
  const result = [];

  for (let i = 0; i < arr.length; i++) {
    if (i in arr) {
      const value = arr[i];
      if (callback.call(thisArg, value, i, arr)) {
        result.push(value);
      }
    }
  }

  return result;
};

// Test
console.log([1, 2, 3, 4, 5].myFilter((n) => n % 2 === 0));
// [2, 4]

// Sparse array test
const sparse = [1, , 3];
console.log(sparse.myFilter(() => true));  // [1, 3] — hole skipped
```

---

## Step 3 — `myReduce`

`reduce` has one unique edge case: the `initialValue` parameter. If it's not provided, the first element of the array becomes the initial accumulator, and iteration starts from index 1. If the array is empty and no `initialValue` is given, `reduce` throws a `TypeError`.

```js-exec
Array.prototype.myReduce = function (callback, initialValue) {
  if (typeof callback !== "function") {
    throw new TypeError("callback is not a function");
  }

  const arr = this;
  const len = arr.length;

  // Determine start index and accumulator
  let accumulator;
  let startIndex = 0;

  if (arguments.length >= 2) {
    // initialValue was provided (could be undefined)
    accumulator = initialValue;
  } else {
    // No initialValue — find the first non-hole element
    if (len === 0) {
      throw new TypeError("Reduce of empty array with no initial value");
    }

    // Skip holes to find first real element
    while (startIndex < len && !(startIndex in arr)) {
      startIndex++;
    }

    if (startIndex >= len) {
      throw new TypeError("Reduce of empty array with no initial value");
    }

    accumulator = arr[startIndex];
    startIndex++;
  }

  for (let i = startIndex; i < len; i++) {
    if (i in arr) {
      accumulator = callback.call(undefined, accumulator, arr[i], i, arr);
    }
  }

  return accumulator;
};

// Test
console.log([1, 2, 3, 4].myReduce((acc, n) => acc + n, 0));   // 10
console.log([1, 2, 3, 4].myReduce((acc, n) => acc + n));      // 10 — no initialValue
console.log([1, 2, 3, 4].myReduce((acc, n) => acc * n, 1));   // 24 — factorial

// Empty array with initialValue
console.log([].myReduce((acc, n) => acc + n, 0));  // 0

// Empty array without initialValue — throws
try {
  [].myReduce((acc, n) => acc + n);
} catch (e) {
  console.log(e.message);  // Reduce of empty array with no initial value
}
```

---

## Step 4 — Edge Cases the Interviewer Will Test

**Sparse arrays**: `[1, , 3]` — all three methods must skip the hole, not treat it as `undefined`.

**`thisArg` with `myReduce`**: The native `reduce` passes `undefined` as the `this` for the callback. Our implementation does the same with `callback.call(undefined, ...)`.

**Callback that mutates the array**: The native methods iterate based on the array's length at the time they're called, but they do read current values. If the callback pushes to the array, `map` and `filter` won't iterate the new elements. If it removes elements, the length doesn't shrink mid-iteration.

**No callback provided**: All three should throw a `TypeError`.

---

## Step 5 — Full Solution

```js-exec
Array.prototype.myMap = function (callback, thisArg) {
  if (typeof callback !== "function") throw new TypeError("callback is not a function");
  const arr = this;
  const result = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    if (i in arr) result[i] = callback.call(thisArg, arr[i], i, arr);
  }
  return result;
};

Array.prototype.myFilter = function (callback, thisArg) {
  if (typeof callback !== "function") throw new TypeError("callback is not a function");
  const arr = this;
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (i in arr && callback.call(thisArg, arr[i], i, arr)) result.push(arr[i]);
  }
  return result;
};

Array.prototype.myReduce = function (callback, initialValue) {
  if (typeof callback !== "function") throw new TypeError("callback is not a function");
  const arr = this;
  const len = arr.length;
  let acc, i = 0;

  if (arguments.length >= 2) {
    acc = initialValue;
  } else {
    if (len === 0) throw new TypeError("Reduce of empty array with no initial value");
    while (i < len && !(i in arr)) i++;
    if (i >= len) throw new TypeError("Reduce of empty array with no initial value");
    acc = arr[i++];
  }

  for (; i < len; i++) {
    if (i in arr) acc = callback.call(undefined, acc, arr[i], i, arr);
  }
  return acc;
};
```

---

## What Interviewers Are Testing

- **Callback signature** — you know it's `(element, index, array)`, not just `(element)`
- **`thisArg`** — you pass it to `callback.call(thisArg, ...)` so the callback's `this` is correct
- **Sparse array handling** — `i in arr` vs checking `arr[i] !== undefined`
- **`reduce` initialValue logic** — the two-path initialization: with vs without initial value
- **Type checking** — throwing `TypeError` when the callback isn't a function

---

## Complexity

| Method | Time | Space |
|--------|------|-------|
| `myMap` | O(n) | O(n) |
| `myFilter` | O(n) | O(n) |
| `myReduce` | O(n) | O(1) |

---

## Interview Tips

- **Write `myMap` first and talk through it** — it establishes the pattern. Then say "`myFilter` is almost the same but with a condition check" and write it quickly.
- **Don't rush `myReduce`** — the initialValue logic is what interviewers want to see. Say "there are two cases for the accumulator initialization" before you start coding.
- **Mention `i in arr` out loud** — "I'm using `i in arr` rather than comparing to `undefined` because sparse arrays have actual holes, and the callback should not be called for them."
- **Know the TypeError message** — "Reduce of empty array with no initial value" is the exact wording. Reciting the correct error shows deep familiarity.

---

## Related Questions

- [#1 — Implement call(), apply() & bind()](/articles/js-interview-call-apply-bind)
- [#12 — Implement Array flatten()](/articles/js-interview-flatten)
- [#26 — Implement countBy()](/articles/js-interview-count-by)
