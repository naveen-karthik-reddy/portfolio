Running async tasks in series means starting each one only after the previous completes. It's the sequential counterpart to `mapAsync` — and the contrast between the two reveals how well you understand Promise chaining and concurrency.

---

## What is "async tasks in series"?

Given an array of async functions (tasks), run them **one at a time** in order. Wait for each to finish before starting the next. Collect all results and return them.

This is the opposite of `mapAsync` (parallel) and `Promise.race` (first wins). Series execution is intentionally slower — you use it when:
- **Order matters and tasks are dependent** — each task needs the previous result
- **Rate limiting** — hitting an API that allows only one request at a time
- **Side effects must be sequential** — database migrations, file writes, audit logs

The interview typically asks for three variants:
1. `runSeries(tasks)` — array of zero-arg async functions, collect all results
2. `mapSeries(arr, fn)` — like `Array.map` but async and sequential (mirrors `mapAsync`)
3. Reduce-based implementation — shows you know the functional equivalent

---

## The Problem

> "Implement `runSeries(tasks)` where `tasks` is an array of async functions. Run them one at a time in order and return an array of results."

The interviewer extends:
> "Now implement `mapSeries(arr, fn)` — same idea but like an async map. Compare it to your parallel `mapAsync` implementation."

---

## Thought Process

For series execution, a `for...of` loop with `await` inside is the canonical solution. Each `await` suspends the loop until the current task resolves — naturally enforcing sequential execution.

The `reduce` approach builds a promise chain: each `.then()` waits for the previous promise to settle before starting the next task. It's functionally identical but shows FP thinking.

**Key contrast with parallel:**
```
// Parallel — all tasks start immediately
const results = await Promise.all(tasks.map(t => t()));

// Series — each task waits for the previous
const results = [];
for (const task of tasks) results.push(await task());
```

---

## Step 1 — `runSeries`: Sequential Task Runner

```js-exec
async function runSeries(tasks) {
  const results = [];

  for (const task of tasks) {
    results.push(await task());
  }

  return results;
}

// Test — tasks run one after another
const delay = (ms, val) => new Promise(r => setTimeout(() => r(val), ms));

const tasks = [
  () => delay(30, "first"),
  () => delay(10, "second"), // faster, but starts last
  () => delay(20, "third"),
];

const start = Date.now();
runSeries(tasks).then(results => {
  console.log("results:", results);          // ["first", "second", "third"]
  console.log("time:", Date.now() - start);  // ~60ms (30+10+20), NOT ~30ms
});
```

---

## Step 2 — `mapSeries`: Async Map in Series

`mapSeries` mirrors `Array.map` — it takes an array of values and a mapping function, applying the function to each element sequentially:

```js-exec
async function mapSeries(arr, fn) {
  const results = [];

  for (let i = 0; i < arr.length; i++) {
    results.push(await fn(arr[i], i, arr));
  }

  return results;
}

// Test
const ids = [3, 1, 2];
const fetchUser = async (id) => {
  await new Promise(r => setTimeout(r, id * 10)); // simulate variable latency
  return { id, name: `User ${id}` };
};

mapSeries(ids, fetchUser).then(users => {
  console.log(users.map(u => u.name)); // ["User 3", "User 1", "User 2"]
  // Order preserved — and requests ran 3 → 1 → 2 sequentially
});
```

---

## Step 3 — Reduce-Based Implementation

The same result expressed as a promise chain — each `.then()` gates the next task:

```js-exec
async function runSeriesReduce(tasks) {
  return tasks.reduce(
    async (chainPromise, task) => {
      const results = await chainPromise; // wait for all previous
      const result = await task();        // then run this one
      return [...results, result];
    },
    Promise.resolve([])                   // start with empty results
  );
}

// Same behavior as runSeries
const delay = (ms, val) => new Promise(r => setTimeout(() => r(val), ms));

runSeriesReduce([
  () => delay(20, "a"),
  () => delay(10, "b"),
  () => delay(30, "c"),
]).then(console.log); // ["a", "b", "c"]
```

The `for...of` version is clearer; the `reduce` version shows functional composition.

---

## Step 4 — Parallel vs Series Comparison

```js-exec
const delay = (ms, val) => new Promise(r => setTimeout(() => r(val), ms));

const tasks = [
  () => delay(50, "A"),
  () => delay(50, "B"),
  () => delay(50, "C"),
];

async function compare() {
  // Parallel — all start at once, done in ~50ms
  const t1 = Date.now();
  await Promise.all(tasks.map(t => t()));
  console.log("parallel:", Date.now() - t1, "ms"); // ~50ms

  // Series — one at a time, done in ~150ms
  const t2 = Date.now();
  for (const task of tasks) await task();
  console.log("series: ", Date.now() - t2, "ms");  // ~150ms
}

compare();
```

---

## Full Solution

```js-exec
// Series task runner — array of zero-arg async functions
async function runSeries(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

// Series map — array of values + async transform function
async function mapSeries(arr, fn) {
  const results = [];
  for (let i = 0; i < arr.length; i++) {
    results.push(await fn(arr[i], i, arr));
  }
  return results;
}

console.log("series utilities ready");
```

---

## What Interviewers Are Testing

- **`await` inside a loop** — knowing that `await` inside `for...of` is sequential; `Promise.all(arr.map(...))` is parallel
- **Contrast with `mapAsync`** — being able to explain when to choose series vs parallel
- **Reduce-based chain** — shows you understand that a promise chain is an implicit series
- **Order preservation** — results array index matches input array index

---

## Complexity

| | Time | Space |
|-|------|-------|
| `runSeries(N tasks)` | O(T₁ + T₂ + ... + Tₙ) — sum of all task times | O(N) for results |
| `mapAsync(N tasks)` | O(max(T₁, T₂, ..., Tₙ)) — longest task | O(N) for results |

---

## Interview Tips

- **Lead with the trade-off** — "Series adds total latency but avoids concurrency. The right choice depends on whether tasks are independent."
- **Show `await` inside `for...of` explicitly** — some candidates write `tasks.forEach(async t => await t())` which doesn't serialize — `forEach` doesn't await the returned promises. Use `for...of`.
- **Name the reduce pattern** — "This is a promise chain — each `.then()` gates the next task. The reduce just builds the chain programmatically."

---

## Related Questions

- [Implement mapAsync() and mapAsyncLimit()](/articles/js-interview-map-async)
- [Implement Promise.all, race, any & allSettled](/articles/js-interview-promise-combinators)
- [Implement auto-retry with exponential backoff](/articles/js-interview-retry)
