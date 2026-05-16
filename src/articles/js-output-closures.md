Closures are the most tested topic in JS interviews — and the output questions around them are deceptively simple until you understand exactly when a variable's value is captured. Ten questions covering the classic loop problem, stale references, and private state.

---

## Q1 — The classic var loop

```js-exec
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

<details>
<summary>Show answer</summary>

**Output:**
```
3
3
3
```

**Why:** All three `setTimeout` callbacks close over the *same* `i` variable — there is only one `i` because `var` is function-scoped. By the time the callbacks run (after the loop finishes), `i` is `3`. Each callback logs the current value of `i`, which is `3` for all of them.

</details>

---

## Q2 — Fix with let

```js-exec
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

<details>
<summary>Show answer</summary>

**Output:**
```
0
1
2
```

**Why:** `let` in a `for` loop creates a **new binding for each iteration**. Each callback closes over its own copy of `i` — not a shared variable. When the callbacks run, each one reads its own frozen value (`0`, `1`, `2`).

</details>

---

## Q3 — Fix with IIFE

```js-exec
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}
```

<details>
<summary>Show answer</summary>

**Output:**
```
0
1
2
```

**Why:** The IIFE is called immediately on each iteration, passing the current value of `i` as `j`. Each callback closes over its own `j` parameter (a new variable in each IIFE invocation), not the shared `i`. This was the standard pre-`let` workaround.

</details>

---

## Q4 — Stale closure reference

```js-exec
function makeCounter() {
  let count = 0;
  return {
    increment() { count++; },
    getCount() { return count; },
  };
}

const counter = makeCounter();
counter.increment();
counter.increment();
console.log(counter.getCount());

const snap = counter.getCount;
counter.increment();
console.log(snap());
```

<details>
<summary>Show answer</summary>

**Output:**
```
2
3
```

**Why:** Both `increment` and `getCount` close over the *same* `count` variable in the outer `makeCounter` scope — they share live access to it, not a snapshot. `snap` is just another reference to the same `getCount` function. Calling `snap()` after a third `increment()` still reads the current value of `count`, which is now `3`.

</details>

---

## Q5 — Closure over a reassigned variable

```js-exec
let value = "original";

function read() {
  return value;
}

value = "updated";

console.log(read());
```

<details>
<summary>Show answer</summary>

**Output:**
```
updated
```

**Why:** `read` closes over the variable `value` itself, not the string `"original"`. When `value` is reassigned to `"updated"` before `read()` is called, the closure sees the new value. Closures capture *variables*, not *values* — this is the root cause of the classic loop problem too.

</details>

---

## Q6 — Each call gets its own scope

```js-exec
function makeAdder(x) {
  return function(y) {
    return x + y;
  };
}

const add5 = makeAdder(5);
const add10 = makeAdder(10);

console.log(add5(3));
console.log(add10(3));
console.log(add5 === add10);
```

<details>
<summary>Show answer</summary>

**Output:**
```
8
13
false
```

**Why:** Each call to `makeAdder` creates a brand new execution context with its own `x` binding. `add5` closes over `x = 5`; `add10` closes over `x = 10`. They are entirely independent function objects — `add5 === add10` is `false`.

</details>

---

## Q7 — Closure in an object method

```js-exec
function createObj() {
  let secret = 42;
  return {
    reveal() { return secret; },
    double() { secret *= 2; },
  };
}

const obj = createObj();
console.log(obj.reveal());
obj.double();
console.log(obj.reveal());
```

<details>
<summary>Show answer</summary>

**Output:**
```
42
84
```

**Why:** Both `reveal` and `double` are closures over the same `secret` variable. `double` mutates it; `reveal` reads it. Since they share the same lexical scope, changes made by `double` are immediately visible to `reveal`. `secret` is private — it can't be accessed directly from outside `createObj`.

</details>

---

## Q8 — Loop with array push

```js-exec
const fns = [];

for (var i = 0; i < 3; i++) {
  fns.push(() => i);
}

console.log(fns[0]());
console.log(fns[1]());
console.log(fns[2]());
```

<details>
<summary>Show answer</summary>

**Output:**
```
3
3
3
```

**Why:** Same root cause as Q1 — all three arrow functions close over the single `var i`. The loop runs to completion (`i` becomes `3`) before any function is called. All three calls return `3`. Change `var` to `let` and you get `0`, `1`, `2`.

</details>

---

## Q9 — Closure lifespan

```js-exec
function outer() {
  let x = 10;

  function inner() {
    x++;
    return x;
  }

  return inner;
}

const fn1 = outer();
const fn2 = outer();

console.log(fn1());
console.log(fn1());
console.log(fn2());
```

<details>
<summary>Show answer</summary>

**Output:**
```
11
12
11
```

**Why:** Each call to `outer()` creates an independent closure environment with its own `x`. `fn1` and `fn2` do not share `x`. `fn1()` called twice increments its own `x` from `10` to `11`, then `12`. `fn2()` starts its own `x` fresh at `10`, increments to `11`.

</details>

---

## Q10 — Immediately-returned closure

```js-exec
const result = (function() {
  let count = 0;
  return function() {
    return ++count;
  };
})();

console.log(result());
console.log(result());
console.log(result());
```

<details>
<summary>Show answer</summary>

**Output:**
```
1
2
3
```

**Why:** The IIFE runs once, creating a `count` variable and returning the inner function. `result` holds that inner function. Each call to `result()` increments and returns `count`. Because the IIFE has already run, there's no way to reset `count` from outside — it's private state managed by the closure. This is the **module pattern**.

</details>

---

## Key Rules

| Pattern | What the closure captures |
|---|---|
| `var` in a loop | One shared variable — all callbacks see the final value |
| `let` in a loop | A new binding per iteration — each callback sees its own value |
| IIFE workaround | Parameter of the IIFE is a new variable — same effect as `let` |
| Closure over outer var | The variable itself, not a snapshot — reassignment is visible |
| Multiple closures, same scope | All share the same live variable |
| Multiple calls to outer fn | Each call creates an independent scope |

---

## Go Deeper

- [JS Foundations #3 — Closures & Lexical Scope](/articles/js-closures-lexical-scope) — how closures work at the memory level
- [Output Quiz #1 — Scope, Hoisting & the TDZ](/articles/js-output-scope-hoisting) — the previous quiz
- [Output Quiz #3 — The Event Loop & Task Ordering](/articles/js-output-event-loop) — the next quiz
