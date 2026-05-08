Running 1000 `fetch` calls in parallel can overwhelm your server or hit rate limits. This article covers three patterns: sequential execution, pooled concurrency (N at a time), and retry with exponential backoff.

**Prerequisites:** [Async #3 — Promises](/articles/javascript-series/js-promise-from-scratch), [Async #4 — Promise Combinators](/articles/javascript-series/js-promise-combinators)

---

## 1. Execute Async Tasks in Sequence

Run an array of async functions one after another — each waits for the previous to complete:

```js-exec
async function runSequentially(tasks) {
  const results = [];
  for (const task of tasks) {
    console.log("Starting next task...");
    const result = await task();
    results.push(result);
  }
  return results;
}

// Simulate tasks with varying durations
const tasks = [
  () => new Promise((r) => setTimeout(() => r("Task 1"), 200)),
  () => new Promise((r) => setTimeout(() => r("Task 2"), 100)),
  () => new Promise((r) => setTimeout(() => r("Task 3"), 300)),
];

runSequentially(tasks).then((results) => {
  console.log("Sequential results:", results);
  // ["Task 1", "Task 2", "Task 3"] — order preserved, total ~600ms
});
```

`Promise.all` would run them concurrently (~300ms) but with no concurrency control.

---

## 2. Concurrency Pool — Run N at a Time

Run tasks with a maximum concurrency limit:

```js-exec
async function runWithConcurrencyLimit(tasks, limit) {
  const results = new Array(tasks.length);
  let index = 0;

  async function worker(workerId) {
    while (index < tasks.length) {
      const currentIndex = index++;
      console.log(`Worker ${workerId} starting task ${currentIndex}`);
      results[currentIndex] = await tasks[currentIndex]();
      console.log(`Worker ${workerId} finished task ${currentIndex}`);
    }
  }

  // Start 'limit' workers
  const workers = [];
  for (let i = 0; i < limit; i++) {
    workers.push(worker(i));
  }

  // Wait for all workers to finish
  await Promise.all(workers);
  return results;
}

// 6 tasks, max 2 concurrent
const allTasks = Array.from({ length: 6 }, (_, i) => {
  const delay = 100 + Math.random() * 300;
  return () =>
    new Promise((resolve) =>
      setTimeout(() => resolve(`Result-${i + 1}`), delay)
    );
});

runWithConcurrencyLimit(allTasks, 2).then((results) => {
  console.log("Pool results:", results);
});
// Only 2 tasks run at any given time
```

---

## 3. Simpler Pool Using Promise.race

An alternative implementation — start `limit` tasks, then replace each as it completes:

```js-exec
async function pool(tasks, limit) {
  const results = [];
  const executing = new Set();
  let index = 0;

  for (const task of tasks) {
    const promise = Promise.resolve().then(() => task()).then((result) => {
      executing.delete(promise);
      results.push(result);
    });

    executing.add(promise);

    if (executing.size >= limit) {
      // Wait for one of the in-flight tasks to complete
      await Promise.race(executing);
    }
  }

  // Wait for remaining in-flight tasks
  await Promise.all(executing);
  return results;
}

const tasks = [
  () => new Promise((r) => setTimeout(() => r("A"), 300)),
  () => new Promise((r) => setTimeout(() => r("B"), 100)),
  () => new Promise((r) => setTimeout(() => r("C"), 200)),
  () => new Promise((r) => setTimeout(() => r("D"), 50)),
];

pool(tasks, 2).then((results) => console.log("Pool (race):", results));
```

---

## 4. Retry with Exponential Backoff

When an operation can fail transiently (network, rate limits), retry with increasing delays:

```js-exec
async function retry(fn, { maxAttempts = 3, baseDelay = 200, maxDelay = 5000 } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxAttempts}...`);
      return await fn();
    } catch (err) {
      lastError = err;
      console.log(`  Failed: ${err.message}`);

      if (attempt === maxAttempts) break;

      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      const jitter = delay * (0.5 + Math.random() * 0.5); // 50-100% of delay
      console.log(`  Retrying in ${Math.round(jitter)}ms...`);

      await new Promise((r) => setTimeout(r, jitter));
    }
  }

  throw lastError;
}

// Simulate a flaky API
let callCount = 0;
async function flakyAPI() {
  callCount++;
  if (callCount < 3) throw new Error("Temporary failure");
  return "Success!";
}

retry(flakyAPI, { maxAttempts: 4, baseDelay: 100 })
  .then((result) => console.log("Retry result:", result))
  .catch((err) => console.log("All retries failed:", err.message));
```

---

## 5. Retry + Concurrency Pool Combined

Real-world scenario: process a list of URLs with concurrency control AND per-item retry:

```js-exec
async function processWithConcurrency(items, handler, { limit = 3, retries = 2 } = {}) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      try {
        results[i] = await retry(() => handler(items[i]), {
          maxAttempts: retries + 1,
        });
        console.log(`✓ Item ${i} done`);
      } catch (err) {
        results[i] = { error: err.message };
        console.log(`✗ Item ${i} failed: ${err.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}

// Test with simulated flaky processing
const items = ["url1", "url2", "url3", "url4", "url5"];
let processCallCount = {};

processWithConcurrency(
  items,
  async (url) => {
    processCallCount[url] = (processCallCount[url] ?? 0) + 1;
    if (processCallCount[url] < 2) throw new Error(`${url} temp error`);
    return `${url} processed`;
  },
  { limit: 2, retries: 2 }
).then((results) => console.log("Final:", results));
```

---

## 6. Timeout Wrapping

Add a timeout to any async operation — reject if it takes too long:

```js-exec
async function withTimeout(promise, timeoutMs, message = "Operation timed out") {
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), timeoutMs)
    ),
  ]);
}

// Test
withTimeout(
  new Promise((r) => setTimeout(() => r("Completed"), 200)),
  100,
  "Too slow!"
)
  .then(console.log)
  .catch((err) => console.log("Timeout:", err.message)); // "Timeout: Too slow!"

withTimeout(
  new Promise((r) => setTimeout(() => r("Completed"), 50)),
  200
)
  .then(console.log); // "Completed"
```

---

## Key Takeaways

- **Sequential**: `for...of` + `await` — simplest, preserves order, no concurrency overhead.
- **Pool (N at a time)**: worker pattern — good when you need to limit load on server/DB.
- **Promise.race approach**: start tasks, replace as they complete — elegant alternative to worker pattern.
- **Retry with backoff**: exponential delay + jitter prevents thundering herd on recovery.
- **Timeout wrapping**: `Promise.race(promise, timeoutPromise)` — reject if the operation exceeds the limit.

---

**Next:** [Async #9 — `AbortController` & Cancelable Async](/articles/javascript-series/js-abort-controller) — cancel fetch requests, remove listeners, and abort async work.
