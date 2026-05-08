Promise combinators orchestrate multiple promises: wait for all, race to the first, or settle independently. This article implements `Promise.all`, `allSettled`, `race`, and `any` from scratch — using the `MyPromise` class built in the previous article.

**Prerequisites:** [Async #3 — Building a Promise from Scratch](/articles/javascript-series/js-promise-from-scratch)

---

## 1. `Promise.all()` — All or Nothing

Resolves when ALL input promises resolve. Rejects immediately if ANY rejects:

```js-exec
// Using our MyPromise from the previous article
MyPromise.all = function (promises) {
  return new MyPromise((resolve, reject) => {
    if (!promises || promises.length === 0) {
      return resolve([]);
    }

    const results = new Array(promises.length);
    let completed = 0;

    for (let i = 0; i < promises.length; i++) {
      // Wrap non-promise values in a resolved promise
      MyPromise.resolve(promises[i]).then(
        (value) => {
          results[i] = value;
          completed++;

          if (completed === promises.length) {
            resolve(results);
          }
        },
        (reason) => {
          // First rejection wins — reject immediately
          reject(reason);
        }
      );
    }
  });
};

// Test
const p1 = MyPromise.resolve(1);
const p2 = new MyPromise((r) => setTimeout(() => r(2), 100));
const p3 = 3; // Non-promise value — wrapped by MyPromise.resolve()

MyPromise.all([p1, p2, p3]).then((results) => {
  console.log("all resolved:", results); // [1, 2, 3]
});

// Rejection case
const p4 = MyPromise.resolve(10);
const p5 = MyPromise.reject("Failed");
const p6 = MyPromise.resolve(30);

MyPromise.all([p4, p5, p6])
  .then((r) => console.log("Never runs"))
  .catch((err) => console.log("all rejected:", err)); // "Failed"
```

Key detail: results are in **input order**, not resolution order. Index `i` gets the value from the `i`-th input promise.

---

## 2. `Promise.allSettled()` — Wait for Everything

Waits for ALL promises to settle (fulfilled OR rejected). Never short-circuits:

```js-exec
MyPromise.allSettled = function (promises) {
  return new MyPromise((resolve) => {
    if (!promises || promises.length === 0) {
      return resolve([]);
    }

    const results = new Array(promises.length);
    let completed = 0;

    const check = () => {
      completed++;
      if (completed === promises.length) resolve(results);
    };

    for (let i = 0; i < promises.length; i++) {
      MyPromise.resolve(promises[i]).then(
        (value) => {
          results[i] = { status: "fulfilled", value };
          check();
        },
        (reason) => {
          results[i] = { status: "rejected", reason };
          check();
        }
      );
    }
  });
};

// Test
MyPromise.allSettled([
  MyPromise.resolve(42),
  MyPromise.reject("error"),
  MyPromise.resolve("hello"),
]).then((results) => {
  console.log("allSettled results:");
  for (const r of results) {
    console.log(`  ${r.status}:`, r.value ?? r.reason);
  }
});
// fulfilled: 42
// rejected: error
// fulfilled: hello
```

---

## 3. `Promise.race()` — Fastest Wins

Settles with the first promise to settle — fulfilled or rejected:

```js-exec
MyPromise.race = function (promises) {
  return new MyPromise((resolve, reject) => {
    for (const promise of promises) {
      MyPromise.resolve(promise).then(resolve, reject);
    }
    // No length check needed — if promises is empty, the promise stays pending forever
  });
};

// Test — faster rejection wins
MyPromise.race([
  new MyPromise((r) => setTimeout(() => r("slow"), 200)),
  new MyPromise((_, rj) => setTimeout(() => rj("fast reject"), 50)),
  new MyPromise((r) => setTimeout(() => r("medium"), 100)),
])
  .then((v) => console.log("race won:", v))
  .catch((e) => console.log("race lost:", e)); // "race lost: fast reject"

// Empty iterable — stays pending forever
const stuck = MyPromise.race([]);
console.log("Empty race state:", stuck.state); // "pending"
```

---

## 4. `Promise.any()` — First Success Wins

Resolves with the first fulfilled promise. Rejects only if ALL reject (with `AggregateError`):

```js-exec
MyPromise.any = function (promises) {
  return new MyPromise((resolve, reject) => {
    if (!promises || promises.length === 0) {
      return reject(new AggregateError([], "All promises were rejected"));
    }

    let rejectedCount = 0;
    const errors = new Array(promises.length);

    for (let i = 0; i < promises.length; i++) {
      MyPromise.resolve(promises[i]).then(
        (value) => {
          // First success → resolve immediately
          resolve(value);
        },
        (reason) => {
          errors[i] = reason;
          rejectedCount++;

          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, "All promises were rejected"));
          }
        }
      );
    }
  });
};

// Test — first success wins
MyPromise.any([
  MyPromise.reject("Error 1"),
  new MyPromise((r) => setTimeout(() => r("First success"), 100)),
  MyPromise.reject("Error 2"),
])
  .then((v) => console.log("any resolved:", v))
  .catch((e) => console.log("any failed:", e.message));

// All reject case
MyPromise.any([
  MyPromise.reject("A"),
  MyPromise.reject("B"),
])
  .then((v) => console.log("Never"))
  .catch((e) => {
    console.log("any all rejected:", e.message);
    console.log("Individual errors:", e.errors);
  });
```

---

## 5. Quick Comparison — All Four Combinators

```js-exec
// Summary behavior with a consistent test set:
const success = (ms, val) =>
  new MyPromise((r) => setTimeout(() => r(val), ms));
const fail = (ms, err) =>
  new MyPromise((_, rj) => setTimeout(() => rj(err), ms));

async function testAll() {
  // all: waits for all, rejects on any failure
  try {
    const r = await MyPromise.all([success(50, 1), success(100, 2)]);
    console.log("all(2 successes):", r); // [1, 2]
  } catch (e) {
    console.log("all failed:", e);
  }

  // allSettled: always waits for all
  const settled = await MyPromise.allSettled([
    success(50, "ok"),
    fail(100, "bad"),
  ]);
  console.log("allSettled:", settled.map((s) => s.status));

  // race: first to settle wins (fulfilled or rejected)
  try {
    const r = await MyPromise.race([
      fail(30, "quick fail"),
      success(100, "too slow"),
    ]);
    console.log("race:", r);
  } catch (e) {
    console.log("race caught:", e);
  }

  // any: first fulfilled wins; rejects only if all reject
  try {
    const r = await MyPromise.any([
      fail(30, "ignored"),
      success(50, "first ok"),
      fail(100, "too late"),
    ]);
    console.log("any:", r);
  } catch (e) {
    console.log("any all failed:", e);
  }
}

testAll();
```

---

## Key Takeaways

| Combinator | Resolves when | Rejects when | Short-circuits? |
|---|---|---|---|
| `all` | All resolve | Any rejects | Yes — first rejection |
| `allSettled` | All settle | Never | No |
| `race` | First settles | First settles (if rejected) | Yes — first settlement |
| `any` | First fulfills | All reject | Yes — first fulfillment |

- Results in `all` and `allSettled` maintain **input order**, not resolution order.
- `race` on an empty iterable stays **pending forever**.
- `any` rejects with an **`AggregateError`** containing all individual rejection reasons.
- Always wrap values with `Promise.resolve()` to handle non-promise items in the iterable.

---

**Next:** [Async #5 — `async`/`await` Under the Hood](/articles/javascript-series/js-async-await-under-hood) — desugar async/await to generators + Promises and understand the state machine.
