Normally, `arr.map(f).filter(g)` creates two intermediate arrays. A **transducer** fuses map and filter into a single reduction pass — composing transformers that run per-element without intermediate collections. This article builds transducers from scratch.

**Prerequisites:** [Arrays #1 — map/filter/reduce](/articles/javascript-series/js-array-methods-polyfills-1), [FP #1 — compose/pipe](/articles/javascript-series/js-compose-pipe)

---

## 1. The Problem — Intermediate Arrays

```js-exec
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// This creates 3 arrays: [1..10] → [2,4,6,8,10,12,...] → [12,14,16,18,20] → [...]
const result = numbers
  .map((x) => x * 2)           // Creates array #1
  .filter((x) => x > 10)       // Creates array #2
  .map((x) => x * x);          // Creates array #3

console.log("Result:", result); // [144, 196, 256, 324, 400]
// 10 items → 10 mapped → 5 filtered → 5 mapped = 3 intermediate arrays
```

For 10 items, no problem. For 10 million items, 3 intermediate allocations matter.

---

## 2. Transducer Building Blocks — Reducing Functions

A transducer is a function that transforms one **reducer** into another reducer:

```js-exec
// A reducer takes (accumulator, current) and returns new accumulator
// Step function signature: (acc, x) → acc

// Map transducer: transforms a reducer by applying 'fn' before passing to it
function mapping(fn) {
  return function (step) {
    return function (acc, x) {
      return step(acc, fn(x)); // Apply fn, then pass to the next step
    };
  };
}

// Filter transducer: only passes items that satisfy 'predicate'
function filtering(predicate) {
  return function (step) {
    return function (acc, x) {
      return predicate(x) ? step(acc, x) : acc;
    };
  };
}

// Compose transducers
function composeT(...transducers) {
  return transducers.reduceRight(
    (combined, transducer) => transducer(combined)
  );
}

// transduce: run a composed transducer over a collection
function transduce(transducer, step, initial, collection) {
  const xf = transducer(step); // Apply transducer to the step function
  let acc = initial;

  for (const item of collection) {
    acc = xf(acc, item);
  }

  return step(acc); // Finalize
}
```

---

## 3. Putting It All Together

```js-exec
// Reuse the functions from above (mapping, filtering, composeT, transduce)

// Same operation as earlier: map *2, filter >10, map square
const transform = composeT(
  mapping((x) => x * 2),      // Step 1
  filtering((x) => x > 10),    // Step 2
  mapping((x) => x * x)        // Step 3
);

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const result = transduce(
  transform,
  (acc, x) => { acc.push(x); return acc; }, // Conj step
  [],
  numbers
);

console.log("Transduced result:", result);
// [144, 196, 256, 324, 400] — same result, ZERO intermediate arrays!
```

---

## 4. Visual Comparison

```js-exec
console.log("┌─────────────────────────────────────────────────────────┐");
console.log("│  Without transducers (map + filter):                    │");
console.log("│  [1,2,3] → map*2 → [2,4,6] → filter>3 → [4,6] → map²  │");
console.log("│  2 intermediate arrays created                          │");
console.log("│                                                         │");
console.log("│  With transducers:                                      │");
console.log("│  1 → map*2=2 → filter>3? NO  → skip                    │");
console.log("│  2 → map*2=4 → filter>3? YES → map²=16 → [16]          │");
console.log("│  3 → map*2=6 → filter>3? YES → map²=36 → [16,36]       │");
console.log("│  Zero intermediate collections — one pass!              │");
console.log("└─────────────────────────────────────────────────────────┘");
```

---

## 5. Complete Minimal Transducer Library

```js-exec
const T = {
  map: (fn) => (step) => (acc, x) => step(acc, fn(x)),

  filter: (pred) => (step) => (acc, x) => pred(x) ? step(acc, x) : acc,

  take: (n) => {
    let count = 0;
    return (step) => (acc, x) => {
      if (count >= n) return acc;
      count++;
      return step(acc, x);
    };
  },

  compose: (...ts) => ts.reduceRight((combined, t) => t(combined)),

  into: (collection, transducer) => {
    const isArray = Array.isArray(collection);
    const step = isArray
      ? (acc, x) => { acc.push(x); return acc; }
      : (acc, x) => acc.add(x);
    const initial = isArray ? [] : new Set();

    return require('./transduce-registry').run(
      transducer,
      step,
      initial,
      collection
    );
  },
};

// Instead of importing, inline run:
function run(transducer, step, initial, collection) {
  return collection.reduce(transducer(step), initial);
}

const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const result = run(
  T.compose(
    T.filter((x) => x % 2 === 0),   // Only even
    T.map((x) => x * 10),           // Multiply by 10
    T.take(3)                       // Take first 3
  ),
  (acc, x) => { acc.push(x); return acc; },
  [],
  nums
);

console.log("Composed transducer result:", result); // [20, 40, 60]
```

---

## Key Takeaways

- A **transducer** is `(reducer) → reducer` — it transforms how you accumulate.
- `mapping(fn)` → applies `fn` before passing to the next reducer.
- `filtering(pred)` → skips items that don't pass before passing to next reducer.
- **Composition** of transducers happens at the reducer level — items flow through all transforms in a single pass.
- Transducers are the foundation of Clojure's sequence operations and are available in JS via Ramda and other FP libraries.

---

**Next:** [FP #3 — Maybe & Either Monads](/articles/javascript-series/js-maybe-either-monad) — build error-safe pipelines without null checks or try/catch.
