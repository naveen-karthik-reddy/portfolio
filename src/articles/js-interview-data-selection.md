A data selection engine takes an array of rows and a criteria object, returning only rows that match all conditions. It's a small in-memory query engine — exact match, range, multi-value — combined with AND logic. The interviewer wants to see condition dispatch and composability.

---

## What is a Data Selection Engine?

A data selection (or filter) engine takes an array of rows and a criteria object, and returns only the rows that satisfy **all** conditions. It's a miniature in-memory query engine — the kind that powers ORM filters, dashboard filters, and search UIs.

The criteria object defines conditions as key-value pairs. Each value's type determines the comparison strategy:
- **Scalar** (string, number, boolean) → exact match: `row[key] === value`
- **Range object** `{ min, max }` → `row[key] >= min && row[key] <= max` (either bound can be absent for one-sided ranges)
- **Set membership** `{ in: [...] }` → `array.includes(row[key])`
- **Negation** `{ ne: value }` → `row[key] !== value`

All conditions are combined with **AND logic** — a row must pass every condition to be included. The implementation dispatches each condition to the appropriate comparison function based on the value's shape (`.min`/`.max` → range; `.in` → set; `.ne` → negation; otherwise → exact match).

Real-world use cases:
- **Dashboard filters** — a table with columns for status, date, and category, filtered by user-selected criteria
- **REST API query params** — `GET /users?status=active&age[min]=18&age[max]=65&role[in]=admin,moderator` translates directly to this pattern
- **Search UIs** — building faceted search where each facet adds a condition to the criteria object
- **Test data selection** — `filterRows(testData, { scenario: "error", code: { in: [400, 500] } })` to find relevant test fixtures

The interview tests condition dispatching (type-checking the criteria value to choose the comparison), composability (AND chaining), and the ability to design an extensible filter model where new condition types can be added without restructuring the engine.

---

## The Problem

> "Implement `filterRows(rows, criteria)` that filters an array of objects based on a criteria object. Support:
> - Exact match: `{ status: 'active' }`
> - Range: `{ age: { min: 18, max: 65 } }`
> - Multi-value: `{ role: { in: ['admin', 'moderator'] } }`
>
> All criteria keys must match (AND logic). Return rows where every criterion is satisfied."

---

## Thought Process

For each row, check every key in the criteria object:
- **Exact match**: `row[key] === criteria[key]`
- **Range**: `criteria[key]` has `min` and/or `max` → check bounds
- **Multi-value**: `criteria[key]` has `in` array → check `row[key]` is included

All conditions must pass (AND). The dispatch happens per criterion — check the shape of the criterion value to decide the comparison logic.

---

## Step 1 — Exact Match

```js-exec
function filterRows(rows, criteria) {
  const keys = Object.keys(criteria);
  if (keys.length === 0) return rows;

  return rows.filter(row => {
    for (const key of keys) {
      if (row[key] !== criteria[key]) {
        return false;
      }
    }
    return true;
  });
}

const rows = [
  { name: 'Alice', age: 30, role: 'admin', active: true },
  { name: 'Bob',   age: 25, role: 'user',  active: false },
  { name: 'Carol', age: 35, role: 'admin', active: true },
];

console.log(filterRows(rows, { role: 'admin' }));
// [Alice, Carol]
console.log(filterRows(rows, { role: 'admin', active: true }));
// [Alice, Carol]
```

---

## Step 2 — Range Filters

```js-exec
function filterRows(rows, criteria) {
  const keys = Object.keys(criteria);
  if (keys.length === 0) return rows;

  return rows.filter(row => {
    for (const key of keys) {
      const criterion = criteria[key];
      const value = row[key];

      if (typeof criterion === 'object' && criterion !== null && !Array.isArray(criterion)) {
        // Range filter: { min, max }
        if (criterion.min !== undefined && value < criterion.min) return false;
        if (criterion.max !== undefined && value > criterion.max) return false;
      } else if (Array.isArray(criterion)) {
        // Will handle as multi-value next
        if (!criterion.includes(value)) return false;
      } else {
        // Exact match
        if (value !== criterion) return false;
      }
    }
    return true;
  });
}

console.log(filterRows(rows, { age: { min: 28, max: 40 } }));
// [Alice, Carol]
```

---

## Step 3 — Multi-Value (`in`)

```js-exec
function filterRows(rows, criteria) {
  const keys = Object.keys(criteria);
  if (keys.length === 0) return rows;

  return rows.filter(row => {
    for (const key of keys) {
      const criterion = criteria[key];
      const value = row[key];

      if (criterion === null) {
        if (value !== null) return false;
      } else if (typeof criterion === 'object' && !Array.isArray(criterion)) {
        // Check for 'in' first (multi-value)
        if ('in' in criterion) {
          if (!criterion.in.includes(value)) return false;
        } else {
          // Range: { min, max }
          if (criterion.min !== undefined && value < criterion.min) return false;
          if (criterion.max !== undefined && value > criterion.max) return false;
        }
      } else if (Array.isArray(criterion)) {
        if (!criterion.includes(value)) return false;
      } else {
        if (value !== criterion) return false;
      }
    }
    return true;
  });
}

console.log(filterRows(rows, { role: { in: ['admin', 'moderator'] } }));
// [Alice, Carol]
```

---

## Step 4 — Combining Criterion Types

```js-exec
// Multiple criteria of different types — all must match (AND)
console.log(filterRows(rows, {
  role: { in: ['admin', 'user'] },
  age: { min: 30 },
  active: true
}));
// Only Carol: role = admin (in list), age >= 30, active = true
```

---

## Step 5 — Extension: OR Groups

The interviewer says: "Now support OR — if the criteria value is an array, any of the sub-criteria can match."

```js-exec
function filterRows(rows, criteria) {
  const keys = Object.keys(criteria);
  if (keys.length === 0) return rows;

  return rows.filter(row => {
    for (const key of keys) {
      const criterion = criteria[key];
      const value = row[key];

      // OR group: array of sub-criteria objects
      if (Array.isArray(criterion) && criterion.length > 0 && typeof criterion[0] === 'object') {
        const anyMatch = criterion.some(subCriteria =>
          filterRows([row], { [key]: subCriteria }).length > 0
        );
        if (!anyMatch) return false;
      } else if (criterion === null) {
        if (value !== null) return false;
      } else if (typeof criterion === 'object' && !Array.isArray(criterion)) {
        if ('in' in criterion) {
          if (!criterion.in.includes(value)) return false;
        } else {
          if (criterion.min !== undefined && value < criterion.min) return false;
          if (criterion.max !== undefined && value > criterion.max) return false;
        }
      } else {
        if (value !== criterion) return false;
      }
    }
    return true;
  });
}

// OR: age less than 26 OR age greater than 32
console.log(filterRows(rows, {
  age: [{ max: 26 }, { min: 32 }]
}));
// [Bob (25), Carol (35)]
```

---

## Step 6 — Edge Cases

**Empty criteria**: `filterRows(rows, {})` → returns all rows. No conditions to fail.

**Criteria key not in row**: `row[key]` is `undefined`. Comparison with the criterion will likely return `false`, which is correct — the row doesn't have the required field.

**Null values**: Exact match on `null` needs special handling. `typeof null === 'object'`, so the criterion dispatch would mistake it for a range/in criterion. Check `criterion === null` before `typeof criterion === 'object'`.

**Zero and false as values**: Use strict equality (`===`) so `0` doesn't match `false` and vice versa.

---

## Full Solution

```js-exec
function filterRows(rows, criteria) {
  const keys = Object.keys(criteria);
  if (keys.length === 0) return rows;

  return rows.filter(row => {
    for (const key of keys) {
      const criterion = criteria[key];
      const value = row[key];

      // null check before typeof (typeof null === 'object')
      if (criterion === null) {
        if (value !== null) return false;
      }
      // OR group: array of sub-criteria objects
      else if (Array.isArray(criterion) && criterion.length > 0 && typeof criterion[0] === 'object') {
        if (!criterion.some(sub => testCriterion(value, sub))) return false;
      }
      // in: multi-value
      else if (typeof criterion === 'object' && 'in' in criterion) {
        if (!criterion.in.includes(value)) return false;
      }
      // Range: { min, max }
      else if (typeof criterion === 'object' && (criterion.min !== undefined || criterion.max !== undefined)) {
        if (criterion.min !== undefined && value < criterion.min) return false;
        if (criterion.max !== undefined && value > criterion.max) return false;
      }
      // Exact match
      else {
        if (value !== criterion) return false;
      }
    }
    return true;
  });
}

function testCriterion(value, criterion) {
  if (criterion === null) return value === null;
  if (typeof criterion === 'object' && 'in' in criterion) return criterion.in.includes(value);
  if (typeof criterion === 'object' && (criterion.min !== undefined || criterion.max !== undefined)) {
    if (criterion.min !== undefined && value < criterion.min) return false;
    if (criterion.max !== undefined && value > criterion.max) return false;
    return true;
  }
  return value === criterion;
}
```

---

## What Interviewers Are Testing

- **Condition dispatch** — dispatching on the shape of the criterion value
- **AND logic composition** — combining multiple criteria checks
- **Range and set operations** — min/max bounds and `in` list membership
- **OR extension** — adding disjunction without breaking the AND structure
- **Null safety** — checking `null` before `typeof` since `typeof null === 'object'`

---

## Complexity

| | Time | Space |
|-|------|-------|
| filterRows | O(R × C) — R rows, C criteria | O(1) — filter returns new array reference |

Where R is row count and C is the number of criteria keys.

---

## Interview Tips

- **Dispatch on criterion shape, not type** — "I'll check if the criterion has `min`/`max` keys for range, `in` array for multi-value, or is a plain value for exact match."
- **Handle null before typeof** — "I'll check `criterion === null` before `typeof criterion === 'object'` because `typeof null` is `'object'`."
- **Build incrementally** — start with exact match, add range, add `in`, then OR. Each step adds one branch to the dispatch.
- **Show AND → OR without rewriting** — the OR extension should compose with the existing filtering logic, not replace it.

---

## Related Questions

- [#25 — Implement Data Merging](/articles/js-interview-data-merging)
- [#26 — Implement countBy()](/articles/js-interview-count-by)
- [#2 — Implement map(), filter() & reduce()](/articles/js-interview-map-filter-reduce)
