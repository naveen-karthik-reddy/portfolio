Iterators and generators let you define custom iteration behavior — for lazy sequences, infinite streams, and pausable functions. This article covers `Symbol.iterator`, generator functions, `yield*`, and patterns like range and take.

**Prerequisites:** [Async #5 — async/await Under the Hood](/articles/javascript-series/js-async-await-under-hood)

---

## 1. The Iterator Protocol

An object is an **iterator** if it has a `next()` method that returns `{ value, done }`. An object is **iterable** if it has a `[Symbol.iterator]()` method that returns an iterator:

```js-exec
// Manual iterator
function createRangeIterator(start, end) {
  let current = start;

  return {
    next() {
      if (current <= end) {
        return { value: current++, done: false };
      }
      return { value: undefined, done: true };
    },
  };
}

const iter = createRangeIterator(1, 3);
console.log(iter.next()); // { value: 1, done: false }
console.log(iter.next()); // { value: 2, done: false }
console.log(iter.next()); // { value: 3, done: false }
console.log(iter.next()); // { value: undefined, done: true }
```

---

## 2. Custom Iterable — Make an Object Work with `for...of`

```js-exec
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    let current = this.from;
    const to = this.to;

    return {
      next() {
        if (current <= to) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  },
};

// Now it works with for...of and spread!
console.log("for...of:");
for (const n of range) {
  console.log(n);
}

console.log("Spread:", [...range]); // [1, 2, 3, 4, 5]
```

---

## 3. Generator Functions — `function*` and `yield`

A generator function returns a generator object that is BOTH iterable and an iterator:

```js-exec
function* simpleGenerator() {
  console.log("Generator started");
  yield 1;
  console.log("After first yield");
  yield 2;
  console.log("After second yield");
  yield 3;
  console.log("Generator done");
}

const gen = simpleGenerator();

// Each .next() runs until the next yield, then pauses
for (const value of gen) {
  console.log("Got:", value);
}
```

---

## 4. `yield*` — Delegating to Another Iterable

`yield*` delegates to another iterable — it yields every value from that iterable one by one:

```js-exec
function* flatten(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flatten(item); // Delegate to recursive call
    } else {
      yield item;
    }
  }
}

const nested = [1, [2, [3, 4], 5], 6];
console.log([...flatten(nested)]); // [1, 2, 3, 4, 5, 6]

// yield* works with any iterable:
function* combined() {
  yield* [1, 2];
  yield* "AB";
  yield* new Set([true, false]);
}

console.log([...combined()]); // [1, 2, "A", "B", true, false]
```

---

## 5. Infinite Generators — Lazy Sequences

Generators are lazy — they only compute values when asked. This enables infinite sequences:

```js-exec
function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

function* take(n, iterable) {
  let count = 0;
  for (const item of iterable) {
    if (count++ >= n) return;
    yield item;
  }
}

// Take first 10 Fibonacci numbers
const first10 = [...take(10, fibonacci())];
console.log("First 10 Fibonacci:", first10);
// [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
```

---

## 6. Two-Way Communication — Passing Values INTO a Generator

`.next(value)` passes `value` back to where `yield` paused:

```js-exec
function* twoWay() {
  const a = yield "What is a?";
  console.log("Received a:", a);

  const b = yield "What is b?";
  console.log("Received b:", b);

  return a + b;
}

const gen = twoWay();

console.log(gen.next());        // { value: "What is a?", done: false }
console.log(gen.next(10));      // "Received a: 10" → { value: "What is b?", done: false }
console.log(gen.next(20));      // "Received b: 20" → { value: 30, done: true }
```

This is what powers the `async`/`await` desugaring — the runner passes resolved promise values back via `.next()`.

---

## 7. `gen.throw()` and `gen.return()`

```js-exec
function* errorDemo() {
  try {
    yield 1;
  } catch (err) {
    console.log("Caught inside generator:", err.message);
    yield "after error";
  }
  yield 3;
}

const gen = errorDemo();

console.log(gen.next());          // { value: 1, done: false }
console.log(gen.throw(new Error("Injected error")));
// "Caught inside generator: Injected error" → { value: "after error", done: false }
console.log(gen.next());          // { value: 3, done: false }
console.log(gen.next());          // { value: undefined, done: true }

// gen.return(value) forces the generator to complete early:
function* numbers() {
  yield 1;
  yield 2;
  yield 3;
}

const g2 = numbers();
console.log(g2.next());    // { value: 1, done: false }
console.log(g2.return(99)); // { value: 99, done: true }
console.log(g2.next());     // { value: undefined, done: true }
```

---

## Key Takeaways

- **Iterable** = has `[Symbol.iterator]()` — works with `for...of`, spread, destructuring.
- **Iterator** = has `next()` returning `{ value, done }`.
- **Generator** = `function*` that is BOTH iterable AND iterator — `yield` pauses, `next()` resumes.
- **`yield*`** delegates to another iterable — cleaner than a for-loop over nested items.
- **Two-way**: `.next(value)` passes data INTO the generator; `.throw()` and `.return()` control flow.
- Generators are **lazy** — values are computed on demand, enabling infinite sequences.

---

**Next:** [Async #7 — Async Iteration](/articles/javascript-series/js-async-iteration) — `for await...of`, async generators, and async iterables.
