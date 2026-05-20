`mapAsync` runs an async function over every element in an array. The real interview question is `mapAsyncLimit` — do the same thing but never have more than N operations running at once. It's the concurrency pool pattern.

**Related deep-dive:** [Async #8 — Concurrency Control & Retry Patterns](/articles/js-concurrency-limits)

---

## What is `mapAsync()`?

`mapAsync(array, asyncFn)` is the async equivalent of `Array.prototype.map`. It applies an async function to every element and returns a Promise that resolves with the results array, preserving input order. The simple version is `Promise.all(array.map(asyncFn))` — but the real interview question is `mapAsyncLimit`.

`mapAsyncLimit(array, limit, asyncFn)` adds **concurrency control**: it ensures at most `limit` async operations run simultaneously. This is the **concurrency pool pattern** — you have N items to process but only K workers, and you need to keep all K workers saturated until the queue is drained.

This is a fundamental async pattern that appears everywhere:
- **API rate limiting** — never send more than 3 concurrent requests to a rate-limited endpoint
- **File processing** — process a directory of 10,000 files with at most 50 concurrent `fs.readFile` calls to avoid exhausting file descriptors
- **Browser resource limits** — browsers cap concurrent requests to the same origin (typically 6); `mapAsyncLimit` lets you control your own concurrency below that
- **Database connection pools** — run queries with concurrency matching your pool size to maximize throughput without queuing

The implementation is more involved than `mapAsync`. You need an active count tracker, a result array with index-based assignment, and a dispatch loop that launches new work as slots free up. The standard approach is either a manual loop with `.then()` chaining or an async generator that pulls from a queue.

---

## The Problem

> "Implement `mapAsync(array, asyncFn)` that applies an async function to every element and returns a promise resolving with the results array."
>
> "Now implement `mapAsyncLimit(array, asyncFn, limit)` — same thing, but at most `limit` operations can run concurrently."

---

## Thought Process

**Version 1** is trivial: `Promise.all(array.map(asyncFn))`. Done.

**Version 2** is about the concurrency pool pattern:
1. Maintain a count of in-flight operations
2. Maintain a queue of pending items
3. When an operation completes, decrement the count and start the next one from the queue
4. Resolve the outer promise when all items have been processed

Alternative approaches:
- **Chunk-based**: split the array into chunks of size `limit`, process each chunk sequentially. Flaw: a slow item in a chunk holds up the entire next chunk.
- **Running-count**: start `limit` items immediately; as each finishes, start the next. This is the correct approach.

---

## Step 1 — `mapAsync` (Unlimited Concurrency)

```js-exec
function mapAsync(array, asyncFn) {
  return Promise.all(array.map(asyncFn));
}

// Test
const square = async (n) => {
  await new Promise(r => setTimeout(r, 10));
  return n * n;
};

mapAsync([1, 2, 3], square).then(console.log);  // [1, 4, 9]
```

---

## Step 2 — `mapAsyncLimit` (Running-Count Approach)

```js-exec
function mapAsyncLimit(array, asyncFn, limit) {
  return new Promise((resolve) => {
    const results = new Array(array.length);
    let running = 0;
    let nextIndex = 0;
    let completed = 0;

    function runNext() {
      // While we have capacity and items left, start more
      while (running < limit && nextIndex < array.length) {
        const i = nextIndex++;
        running++;

        Promise.resolve(asyncFn(array[i], i, array)).then(value => {
          results[i] = value;
          running--;
          completed++;

          if (completed === array.length) {
            resolve(results);
          } else {
            runNext();  // try to start the next pending item
          }
        });
      }
    }

    if (array.length === 0) {
      resolve(results);
      return;
    }

    runNext();
  });
}

// Test — simulate tasks with varying durations
const delay = (ms) => new Promise(r => setTimeout(r, ms));
const tasks = [
  () => delay(200).then(() => 'a'),
  () => delay(100).then(() => 'b'),
  () => delay(150).then(() => 'c'),
  () => delay(50).then(() => 'd'),
  () => delay(180).then(() => 'e'),
];

mapAsyncLimit(tasks, (fn) => fn(), 2).then(console.log);
// ['a', 'b', 'c', 'd', 'e'] — but with only 2 running at a time
```

---

## Step 3 — Error Handling

The interviewer asks: "What if one of the async functions rejects?"

```js-exec
function mapAsyncLimit(array, asyncFn, limit) {
  return new Promise((resolve, reject) => {
    const results = new Array(array.length);
    let running = 0;
    let nextIndex = 0;
    let completed = 0;
    let rejected = false;

    function runNext() {
      while (running < limit && nextIndex < array.length && !rejected) {
        const i = nextIndex++;
        running++;

        Promise.resolve(asyncFn(array[i], i, array)).then(
          value => {
            if (rejected) return;
            results[i] = value;
            running--;
            completed++;

            if (completed === array.length) {
              resolve(results);
            } else {
              runNext();
            }
          },
          err => {
            if (rejected) return;
            rejected = true;
            reject(err);
          }
        );
      }
    }

    if (array.length === 0) resolve(results);
    else runNext();
  });
}
```

---

## Step 4 — Edge Cases

**`limit > array.length`**: All items start immediately — effectively `mapAsync`.

**`limit = 1`**: Sequential execution. Each item waits for the previous one to finish.

**`limit = 0`**: No items ever start; the promise never settles. Guard against this at the top.

**Empty array**: Return resolved promise with `[]`.

**Non-promise return**: `Promise.resolve(asyncFn(...))` handles sync returns.

---

## Full Solution

```js-exec
function mapAsync(array, asyncFn) {
  return Promise.all(array.map(asyncFn));
}

function mapAsyncLimit(array, asyncFn, limit) {
  return new Promise((resolve, reject) => {
    if (array.length === 0) return resolve([]);
    if (limit < 1) return reject(new Error('Limit must be >= 1'));

    const results = new Array(array.length);
    let running = 0;
    let nextIndex = 0;
    let completed = 0;
    let rejected = false;

    function runNext() {
      while (running < limit && nextIndex < array.length && !rejected) {
        const i = nextIndex++;
        running++;

        Promise.resolve(asyncFn(array[i], i, array)).then(
          value => {
            if (rejected) return;
            results[i] = value;
            running--;
            completed++;
            if (completed === array.length) resolve(results);
            else runNext();
          },
          err => {
            if (rejected) return;
            rejected = true;
            reject(err);
          }
        );
      }
    }

    runNext();
  });
}
```

---

## What Interviewers Are Testing

- **Concurrency control** — capping in-flight operations with a running count
- **Promise wrapping** — `Promise.resolve()` to handle sync and async return values
- **Index tracking** — preserving result order despite out-of-order completion
- **Error propagation** — rejecting the outer promise while allowing in-flight operations to finish (or short-circuiting)
- **Queue vs chunk distinction** — knowing why a dynamic queue beats fixed chunks

---

## Complexity

| | Time | Space |
|-|------|-------|
| mapAsync | O(N) — all run in parallel | O(N) — results array |
| mapAsyncLimit | O(N × T/limit) — T is avg task time | O(N) — results + O(limit) in-flight |

---

## Interview Tips

- **Write `mapAsync` in one line first** — "`Promise.all(array.map(asyncFn))` is the unlimited version." Then explain why you need limits.
- **Name the "running count" pattern** — "This is the concurrency pool pattern — maintain a count of in-flight operations, and start a new one every time one finishes."
- **Explain why chunks are wrong** — "Splitting into fixed chunks means a slow item blocks the next chunk. The pool approach starts the next item as soon as any slot frees up."
- **Ask about error behavior** — "On rejection, should I wait for in-flight operations to finish, or reject immediately?" Shows awareness of the design decision.

---

## Related Questions

- [Implement Promise.all, race, any & allSettled](/articles/js-interview-promise-combinators)
- [Implement promiseTimeout()](/articles/js-interview-promise-timeout)
- [Implement promisify()](/articles/js-interview-promisify)
