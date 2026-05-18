`flatten(arr)` takes a nested array and returns a single-level array. The interviewer starts with "flatten completely," then tightens it to "flatten to depth N" — then asks you to do it without recursion. Three approaches, same core idea.

**Related deep-dive:** [Arrays #2 — flat, flatMap, find, every, some Polyfills](/articles/js-array-methods-polyfills-2)

---

## What is `flatten()`?

`flatten(arr)` takes a nested array like `[1, [2, [3, 4]]]` and returns a single-level array `[1, 2, 3, 4]`. Each element is checked: if it's an array, recurse into it; otherwise, push it directly to the result. The native equivalent is `Array.prototype.flat(depth)`.

The core operation is a **tree walk** over a nested list structure. At each position, you either descend deeper (if you hit another array) or emit a leaf value. The result preserves the relative ordering of elements — flattening is a depth-first traversal, not a breadth-first one.

The depth-limited variant (`flatten(arr, depth)`) adds a counter that decrements each time you descend. When `depth === 0`, stop recursing and push the array itself as-is. This mirrors the native `arr.flat(depth)` behavior where `arr.flat(1)` flattens one level, `arr.flat(2)` flattens two, and `arr.flat(Infinity)` flattens entirely.

Real-world use cases:
- **API responses** — flattening a nested list of categories (each containing sub-items) into a single array for rendering
- **Tree flattening** — converting hierarchical data (comments with replies, folder structures) into a flat list for searching or sorting
- **Adjacency cleanup** — removing one level of nesting from `[resultSet]` when the outer array is a wrapper

The interview tests recursion with a natural base case (non-array element). The depth-controlled variant tests parameter threading. The iterative variant (using an explicit stack) tests your ability to convert recursion to iteration — a classic follow-up.

---

## The Problem

> "Implement `flatten(arr)` that takes a nested array and returns a flat array with all nested arrays unwound."

The interviewer will then say:
> "Now add a `depth` parameter — only flatten up to that depth."
>
> "Can you do it iteratively, without recursion?"

---

## Thought Process

The core operation is: walk the array, if an element is an array, recurse into it; otherwise push it to the result.

For depth-limited flatten, pass a decreasing depth counter. When depth reaches 0, stop recursing — push the array itself (or its elements) as-is.

For the iterative version, use an explicit stack instead of the call stack. Each stack entry tracks the array and the current depth.

---

## Step 1 — Full Flatten (Recursive)

```js-exec
function flatten(arr) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

console.log(flatten([1, [2, [3, [4]], 5]]));
// [1, 2, 3, 4, 5]
```

---

## Step 2 — Depth-Limited Flatten

The interviewer says: "Now only flatten to depth N."

```js-exec
function flattenDepth(arr, depth = 1) {
  if (depth < 1) return arr.slice();
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flattenDepth(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  return result;
}

const nested = [1, [2, [3, [4]], 5]];
console.log(flattenDepth(nested, 1));  // [1, 2, [3, [4]], 5]
console.log(flattenDepth(nested, 2));  // [1, 2, 3, [4], 5]
console.log(flattenDepth(nested, Infinity)); // [1, 2, 3, 4, 5]
```

---

## Step 3 — Iterative (Stack-Based)

The interviewer says: "No recursion — use a stack."

```js-exec
function flattenIterative(arr, depth = Infinity) {
  const result = [];
  // Each stack entry: [array, depth]
  const stack = [[arr, depth]];

  while (stack.length) {
    const [current, d] = stack.pop();
    for (let i = current.length - 1; i >= 0; i--) {
      const item = current[i];
      if (Array.isArray(item) && d > 0) {
        stack.push([item, d - 1]);
      } else {
        result.push(item);
      }
    }
  }

  return result;
}

console.log(flattenIterative([1, [2, [3, [4]], 5]], 2));
// [1, 2, 3, [4], 5]
```

**Why reverse iterate?** Because we're using `.pop()` (LIFO), reversing the iteration preserves the original left-to-right order.

---

## Step 4 — Edge Cases

**Non-array elements deep inside**: Already handled — `Array.isArray` filters them.

**Empty arrays**: `[]` gets skipped correctly since the inner loop has nothing to iterate.

**Very deep nesting**: The recursive version can blow the call stack. The iterative version uses heap memory instead — mention this trade-off.

**Non-array input**: Guard with a check at the top: `if (!Array.isArray(arr)) return arr;`

---

## Full Solution

```js-exec
function flatten(arr, depth = Infinity) {
  if (!Array.isArray(arr)) return arr;

  const result = [];
  const stack = [[arr, depth]];

  while (stack.length) {
    const [current, d] = stack.pop();
    for (let i = current.length - 1; i >= 0; i--) {
      const item = current[i];
      if (Array.isArray(item) && d > 0) {
        stack.push([item, d - 1]);
      } else {
        result.push(item);
      }
    }
  }

  return result;
}
```

---

## What Interviewers Are Testing

- **Recursion comfort** — can you think in terms of "if it's an array, recurse; else push"
- **Depth tracking** — passing a decreasing counter through recursive calls
- **Iterative alternative** — replacing the call stack with an explicit stack
- **Order preservation** — maintaining left-to-right order with stack-based traversal

---

## Complexity

| | Time | Space |
|-|------|-------|
| Recursive | O(N) — each element visited once | O(D) — call stack, D = max depth |
| Iterative | O(N) | O(N) — stack can hold all elements |

---

## Interview Tips

- **Start with recursion** — it's simpler and shows you can think recursively. Then offer the iterative version.
- **State the depth parameter upfront** — ask "should this flatten completely or to a specific depth?" before writing.
- **If they say "no recursion"**, reach for the stack pattern — it's the standard answer.
- **Mention `Array.prototype.flat(depth)`** as the native equivalent — shows you know the platform.

---

## Related Questions

- [#13 — Implement deepClone()](/articles/js-interview-deep-clone)
- [#16 — Implement squash()](/articles/js-interview-squash-object)
- [#2 — Implement map(), filter() & reduce()](/articles/js-interview-map-filter-reduce)
