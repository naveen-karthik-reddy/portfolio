`mergeData(rows)` combines an array of user activity rows where one user appears multiple times into one row per user. It's a reduce-into-a-Map problem with a field merging strategy: concatenate arrays, sum numbers, take the first value for scalars.

---

## What is Data Merging?

Data merging (or "group-and-merge") combines multiple rows that share a common key into a single consolidated row. Given an array of user activity records where the same user appears in multiple rows, you produce one row per user with merged fields.

This is a **reduce-into-a-Map** pattern with a field-level merge strategy. The grouping key is typically a field like `userId`. For each field in the grouped rows, you need a rule:
- **Arrays** → concatenate all values into a single array
- **Numbers** → sum them
- **Strings / scalars** → keep the first occurrence's value (or the last, depending on the spec)
- **Nested objects** → recursively merge

The implementation is a two-phase pipeline: first, group rows by key using a `Map` or plain object. Second, for each group, iterate over all fields and apply the merge strategy per type. This is the same pattern used in SQL `GROUP BY` with aggregate functions, implemented in application code.

Real-world use cases:
- **ETL pipelines** — merging user sessions, purchase events, or log entries into summary records
- **API response aggregation** — combining paginated API results where the same entity appears across pages
- **Dashboard data** — merging metrics from multiple sources into a unified per-user view
- **Data import** — deduplicating and merging CSV or spreadsheet rows before inserting into a database

The interview tests `reduce` fluency, `Map` usage for grouping, type-checking for field merge logic, and the ability to handle arrays of objects with heterogeneous field types.

---

## The Problem

> "Given an array of rows where each row has a `userId` and various fields, merge rows with the same `userId` into a single row. Fields should be merged according to their type: arrays get concatenated, numbers get summed, and scalars keep the first value."

```js
const input = [
  { userId: 1, name: 'Alice', tags: ['a'], score: 10 },
  { userId: 2, name: 'Bob',   tags: ['b'], score: 20 },
  { userId: 1, name: 'Alice', tags: ['c'], score: 5 },
];

mergeData(input);
// [
//   { userId: 1, name: 'Alice', tags: ['a', 'c'], score: 15 },
//   { userId: 2, name: 'Bob',   tags: ['b'], score: 20 },
// ]
```

---

## Thought Process

You need:
1. A keyed accumulator — `Map<userId, mergedRow>`
2. For each row, check if the user exists in the map
3. If not, insert as-is
4. If yes, merge each field by type:
   - **Array** → concatenate
   - **Number** → sum
   - **String/other** → keep first (or last — ask the interviewer)

After processing all rows, convert the Map values back to an array.

---

## Step 1 — Base Implementation

```js-exec
function mergeData(rows) {
  const map = new Map();

  for (const row of rows) {
    const existing = map.get(row.userId);

    if (!existing) {
      map.set(row.userId, { ...row });
    } else {
      for (const key of Object.keys(row)) {
        if (key === 'userId') continue;

        const val = row[key];
        if (Array.isArray(val)) {
          existing[key] = [...existing[key], ...val];
        } else if (typeof val === 'number') {
          existing[key] = (existing[key] || 0) + val;
        } else {
          // Scalar — keep first value (only set if not already set)
          if (existing[key] === undefined) {
            existing[key] = val;
          }
        }
      }
    }
  }

  return Array.from(map.values());
}

// Test
const input = [
  { userId: 1, name: 'Alice', tags: ['a'], score: 10 },
  { userId: 2, name: 'Bob',   tags: ['b'], score: 20 },
  { userId: 1, name: 'Alice', tags: ['c'], score: 5 },
];

console.log(mergeData(input));
```

---

## Step 2 — Handling Conflicting Scalar Values

The interviewer says: "What if the same user has different names in different rows?"

```js-exec
const conflicting = [
  { userId: 1, name: 'Alice', active: true },
  { userId: 1, name: 'Alice Smith', active: false },
];

// Strategy: keep first
console.log(mergeData(conflicting));
// [{ userId: 1, name: 'Alice', active: true }]
```

State your strategy: first-wins, last-wins, or keep an array of all values. The most common is first-wins for identity fields (name, email) and last-wins for status fields. Ask which the interviewer prefers.

---

## Step 3 — Edge Cases

**Single row**: Returns the row unchanged in an array. Works — Map has one entry.

**Missing fields**: If row A has `{ userId: 1, score: 10 }` and row B has `{ userId: 1, tags: ['x'] }`, the merged result should have both `score` and `tags`. Our spread (`{ ...row }`) sets fields only from the first row; then the merge loop adds fields from subsequent rows.

**Empty array input**: Returns `[]`. The Map is empty.

**Non-array, non-number values overlapping**: e.g., two rows with the same boolean key. Our scalar branch keeps the first. Make this explicit.

---

## Full Solution

```js-exec
function mergeData(rows, { mergeArrays = true, sumNumbers = true, scalarStrategy = 'first' } = {}) {
  const map = new Map();

  for (const row of rows) {
    const existing = map.get(row.userId);

    if (!existing) {
      map.set(row.userId, { ...row });
    } else {
      for (const key of Object.keys(row)) {
        if (key === 'userId') continue;

        const val = row[key];
        if (mergeArrays && Array.isArray(val)) {
          existing[key] = [...(existing[key] || []), ...val];
        } else if (sumNumbers && typeof val === 'number') {
          existing[key] = (existing[key] || 0) + val;
        } else {
          if (scalarStrategy === 'last') {
            existing[key] = val;
          } else {
            // 'first': only set if not already present
            if (existing[key] === undefined) {
              existing[key] = val;
            }
          }
        }
      }
    }
  }

  return Array.from(map.values());
}
```

---

## What Interviewers Are Testing

- **Reduce-into-a-Map pattern** — keyed accumulation for grouping
- **Type-based merging logic** — dispatching on Array, number, scalar
- **Edge case thinking** — conflicting values, missing fields
- **Immutability** — creating new arrays with spread instead of mutating

---

## Complexity

| | Time | Space |
|-|------|-------|
| mergeData | O(R × F) — R rows, F avg fields | O(R × F) — merged result |

---

## Interview Tips

- **Use a Map, not a plain object** — `Map` is designed for key-value accumulation. Plus, `userId` might be a number, and object keys are always strings.
- **State your merge strategy before coding** — "For scalars, I'll keep the first value and ignore subsequent ones. For arrays, concatenate. For numbers, sum."
- **Ask about conflicting values** — "What should happen if two rows for the same user have different values for a string field?" This shows you think about ambiguity.
- **Show configurability** — adding an options parameter shows you can adapt to different merge strategies.

---

## Related Questions

- [Implement countBy()](/articles/js-interview-count-by)
- [Implement a Data Selection / Filter Engine](/articles/js-interview-data-selection)
- [Implement map(), filter() & reduce()](/articles/js-interview-map-filter-reduce)
