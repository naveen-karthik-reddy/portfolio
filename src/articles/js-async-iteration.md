Async iteration combines Promises with the iterator protocol, letting you loop over data that arrives asynchronously — paginated API responses, streaming chunks, event sequences. This article covers `for await...of`, async generators, and `Symbol.asyncIterator`.

**Prerequisites:** [Async #3 — Promises](/articles/javascript-series/js-promise-from-scratch), [Async #6 — Generators](/articles/javascript-series/js-generators-iterators)

---

## 1. The Problem — Iterating Over Async Data

Regular iteration (`for...of`) expects synchronous values. When each value requires an async operation, you need something different:

```js-exec
// ❌ This doesn't work — for...of expects sync iteration
// for (const item of fetchAllPages()) { ... }

// ✅ Old way: manual recursion with .then()
function fetchPage(n) {
  return Promise.resolve({ items: [`item-${n}-a`, `item-${n}-b`], next: n < 3 ? n + 1 : null });
}

function fetchAllPages() {
  const allItems = [];

  function fetchNext(page) {
    return fetchPage(page).then(({ items, next }) => {
      allItems.push(...items);
      if (next) return fetchNext(next);
      return allItems;
    });
  }

  return fetchNext(1);
}

fetchAllPages().then((items) => console.log("Old way:", items));
```

---

## 2. Async Iterables — `Symbol.asyncIterator`

An async iterable uses `Symbol.asyncIterator` instead of `Symbol.iterator`, and its `next()` returns a **Promise** of `{ value, done }`:

```js-exec
const asyncRange = {
  from: 1,
  to: 5,

  [Symbol.asyncIterator]() {
    let current = this.from;
    const to = this.to;

    return {
      async next() {
        // Simulate async delay
        await new Promise((r) => setTimeout(r, 100));

        if (current <= to) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  },
};

// Use for await...of — works in async functions
(async () => {
  console.log("Async range:");
  for await (const n of asyncRange) {
    console.log(n);
  }
  console.log("Done!");
})();
```

---

## 3. Async Generators — `async function*`

Async generators combine generators with async: `yield` produces values, `await` pauses for promises:

```js-exec
async function* paginatedAPI(baseUrl) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    console.log(`Fetching page ${page}...`);

    // Simulate API call
    const data = await new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            items: [`${baseUrl}?page=${page}-item1`, `${baseUrl}?page=${page}-item2`],
            hasMore: page < 3,
          }),
        200
      )
    );

    yield* data.items;
    hasMore = data.hasMore;
    page++;
  }
}

(async () => {
  const items = [];
  for await (const item of paginatedAPI("/api/users")) {
    items.push(item);
  }
  console.log("All items:", items);
  // 6 items from 3 pages
})();
```

---

## 4. Building an Async Iterator Manually

```js-exec
function createAsyncCounter(max) {
  let count = 0;

  return {
    [Symbol.asyncIterator]() {
      return this; // The object itself is the iterator
    },
    async next() {
      await new Promise((r) => setTimeout(r, 50)); // Simulate work
      count++;
      if (count <= max) {
        return { value: count, done: false };
      }
      return { value: undefined, done: true };
    },
  };
}

(async () => {
  const counter = createAsyncCounter(3);
  for await (const n of counter) {
    console.log("Tick:", n);
  }
})();
```

---

## 5. Converting an Async Iterable to an Array

There's no spread for async iterables (`[...asyncIterable]` doesn't work). Build a helper:

```js-exec
async function asyncIterableToArray(asyncIterable) {
  const result = [];
  for await (const item of asyncIterable) {
    result.push(item);
  }
  return result;
}

// Use it
async function* gen() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
  yield await Promise.resolve(3);
}

(async () => {
  const arr = await asyncIterableToArray(gen());
  console.log("Array:", arr); // [1, 2, 3]
})();
```

---

## 6. Async `map`, `filter`, `reduce` Over Async Iterables

```js-exec
async function* asyncMap(asyncIterable, callback) {
  for await (const item of asyncIterable) {
    yield callback(item);
  }
}

async function* asyncFilter(asyncIterable, predicate) {
  for await (const item of asyncIterable) {
    if (await predicate(item)) {
      yield item;
    }
  }
}

async function* source() {
  for (let i = 1; i <= 5; i++) {
    yield await Promise.resolve(i);
  }
}

(async () => {
  // Only even numbers, doubled
  const filtered = asyncFilter(source(), (n) => n % 2 === 0);
  const mapped = asyncMap(filtered, (n) => n * 10);

  for await (const val of mapped) {
    console.log("Processed:", val); // 20, 40
  }
})();
```

---

## Key Takeaways

- **`Symbol.asyncIterator`** enables `for await...of` — `next()` returns a `Promise<{ value, done }>`.
- **`async function*`** creates an async generator — `yield` produces values and `await` pauses.
- `yield*` works with both sync and async iterables inside async generators.
- No spread for async iterables — use `for await...of` + array push, or a helper.
- Async iteration is the natural way to consume: paginated APIs, streaming responses, event sequences, queues.

---

**Next:** [Async #8 — Concurrency Control & Retry Patterns](/articles/javascript-series/js-concurrency-limits) — execute tasks sequentially, with a concurrency pool, and retry with backoff.
