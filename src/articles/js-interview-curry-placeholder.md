Curry with placeholders lets you fix arguments at any position, not just left-to-right. `curry(fn)(_, b)(a)` fills the second argument now and the first later. This tests whether you truly understand argument accumulation — not just the basic recursive pattern.

---

## What is curry with placeholders?

Standard `curry(add)(1)(2)(3)` only works left-to-right — you must supply arguments in order. Placeholder curry lets you **skip positions** using a sentinel value (`_`), filling them in on later calls:

```js
const _ = curry.placeholder;
const add3 = (a, b, c) => a + b + c;

curry(add3)(_, 2, 3)(1)     // fix b and c now, a later → 6
curry(add3)(1, _, 3)(2)     // fix a and c now, b later → 6
curry(add3)(_, _, _)(1)(2)(3) // defer all three           → 6
```

This is how Ramda and similar FP libraries implement curry. The placeholder `_` is a sentinel — a unique symbol that marks "fill this slot later."

The mechanism: when called, merge new arguments into existing slots. For each position in the accumulated args, if it's `_` and a new arg is available, substitute it. Leftover new args go after the existing ones.

---

## The Problem

> "Implement `curry(fn)` where `curry.placeholder` (exposed as `_`) can be used to skip argument positions, filling them on later calls."

---

## Thought Process

The key insight: instead of just counting how many args you have, you need to track **which positions are still unfilled** (have a `_`). A call is "complete" when:
1. You have at least `fn.length` accumulated arguments, AND
2. None of the first `fn.length` positions is a `_`

On each new call, merge incoming args with accumulated args: scan the accumulated array left-to-right, replacing `_` entries with incoming args in order. Any leftover incoming args are appended.

---

## Step 1 — The Placeholder Sentinel

```js-exec
// _ must be a unique value — Symbol prevents accidental matches
const _ = Symbol("placeholder");

// Or as a property on curry:
function curry(fn) { /* ... */ }
curry.placeholder = Symbol("placeholder");

// Test: _ is unique
console.log(_ === Symbol("placeholder")); // false — every Symbol() is unique
console.log(_ === _);                      // true — same reference
```

---

## Step 2 — Merging Arguments

The core operation: given current accumulated args and new incoming args, produce a merged list.

```js-exec
const _ = Symbol("placeholder");

function mergeArgs(current, incoming) {
  const next = [...incoming]; // consume from front

  const merged = current.map(arg =>
    arg === _ && next.length > 0 ? next.shift() : arg
  );

  // Any unconsumed incoming args are appended
  return [...merged, ...next];
}

// Test
console.log(mergeArgs([_, 2, _], [1, 3]));     // [1, 2, 3]
console.log(mergeArgs([_, 2, 3], [1]));         // [1, 2, 3]
console.log(mergeArgs([1, _, _], [2, 3]));      // [1, 2, 3]
console.log(mergeArgs([1, 2], [3]));            // [1, 2, 3] — appended
```

---

## Step 3 — Full Implementation

```js-exec
const _ = Symbol("placeholder");

function curry(fn, arity = fn.length) {
  curry.placeholder = _;

  function curried(...args) {
    // Check if call is complete: enough args and no placeholders in first `arity` slots
    const satisfied = args.length >= arity &&
      args.slice(0, arity).every(a => a !== _);

    if (satisfied) {
      return fn(...args);
    }

    // Return a function that merges new args with current accumulated args
    return function(...newArgs) {
      const next = [...newArgs];
      const merged = args.map(arg =>
        arg === _ && next.length > 0 ? next.shift() : arg
      );
      return curried(...merged, ...next);
    };
  }

  return curried;
}

// Test
const add3 = (a, b, c) => a + b + c;
const cAdd = curry(add3);

console.log(cAdd(1)(2)(3));           // 6 — normal left-to-right
console.log(cAdd(_, 2, 3)(1));        // 6 — fix b,c first
console.log(cAdd(1, _, 3)(2));        // 6 — fix a,c first
console.log(cAdd(_, _, 3)(1)(2));     // 6 — defer a and b
console.log(cAdd(_, _, _)(1)(2)(3));  // 6 — defer all
console.log(cAdd(1, 2, 3));           // 6 — all at once still works
```

---

## Step 4 — Edge Cases

```js-exec
const _ = Symbol("placeholder");

function curry(fn, arity = fn.length) {
  function curried(...args) {
    const satisfied = args.length >= arity &&
      args.slice(0, arity).every(a => a !== _);

    if (satisfied) return fn(...args);

    return function(...newArgs) {
      const next = [...newArgs];
      const merged = args.map(arg =>
        arg === _ && next.length > 0 ? next.shift() : arg
      );
      return curried(...merged, ...next);
    };
  }
  return curried;
}
curry.placeholder = _;

// Zero-arity function
const greet = () => "hello";
console.log(curry(greet)());          // "hello"

// Multiple placeholders, filled in batches
const sub = (a, b, c) => a - b - c;
const cSub = curry(sub);
console.log(cSub(10, _, _)(3, _)(2)); // 10-3-2 = 5
// Step 1: [10, _, _] — 2 unfilled
// Step 2: [10, 3, _] — 1 unfilled
// Step 3: [10, 3, 2] — done → 5

// Placeholder doesn't fill a non-placeholder slot
console.log(cSub(10)(3)(2));          // 5 — normal left-to-right
```

---

## Full Solution

```js-exec
const _ = Symbol("placeholder");

function curry(fn, arity = fn.length) {
  function curried(...args) {
    const satisfied = args.length >= arity &&
      args.slice(0, arity).every(a => a !== _);

    if (satisfied) return fn(...args);

    return function(...newArgs) {
      const next = [...newArgs];
      const merged = args.map(arg =>
        arg === _ && next.length > 0 ? next.shift() : arg
      );
      return curried(...merged, ...next);
    };
  }
  return curried;
}

curry.placeholder = _;

// Quick validation
const mul = (a, b, c) => a * b * c;
const cMul = curry(mul);
console.log(cMul(2)(_, 4)(3));   // 2*3*4 = 24
console.log(cMul(_, 3, 4)(2));   // 2*3*4 = 24
console.log(cMul(2, 3, 4));      // 24
```

---

## What Interviewers Are Testing

- **Sentinel value design** — using a `Symbol` so `_` can't accidentally match user data
- **Merge logic** — understanding that args are filled left-to-right: each `_` in the accumulated array gets the next incoming arg
- **Completion check** — both conditions must hold: `args.length >= arity` AND no `_` in the first `arity` slots
- **Leftover args** — new args that didn't fill any placeholder are appended, not discarded

---

## Complexity

| | Time | Space |
|-|------|-------|
| Per partial call | O(N) — N = accumulated arg count | O(N) |
| Final call | O(1) | O(N) |

---

## Interview Tips

- **Define `_` as a Symbol first** — state why: "I need a sentinel that can never accidentally match a real argument. Symbol is perfect for this."
- **Draw the merge step** — write `[_, 2, _] + [1, 3]` → `[1, 2, 3]` on the whiteboard/editor before writing code. The merge logic is the core of the problem.
- **Separate the completion check from the merge** — two distinct concerns. Mixing them makes the code hard to reason about.
- **Compare to standard curry** — "Standard curry only works left-to-right. Placeholder curry adds positional flexibility at the cost of more complex merge logic."

---

## Related Questions

- [Implement curry() — Fixed Arity](/articles/js-interview-curry)
- [Variadic curry() — Call with Any Number of Args](/articles/js-interview-curry-variadic)
- [Implement compose() & pipe()](/articles/js-interview-compose-pipe)
