Ten entry-level output questions sampling one fundamental concept from each major area — scope, closures, event loop, this, coercion, promises, chaining, combinators, async/await, and setTimeout interleaving. If you can answer all ten cold, your JS async fundamentals are interview-ready.

---

## Q1 — var hoisting

```js-exec
console.log(x);
var x = 5;
console.log(x);
```

<details>
<summary>Show answer</summary>

**Output:**
```
undefined
5
```

**Why:** `var x` is hoisted to the top of its scope and initialized to `undefined`. So the first `console.log(x)` sees `undefined` — not a `ReferenceError` (which is what `let`/`const` would give). The assignment `x = 5` runs inline, so the second log sees `5`.

</details>

---

## Q2 — Classic var loop + setTimeout

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

**Why:** `var i` is function-scoped — there is only one `i`. By the time the `setTimeout` callbacks run (macrotasks), the loop has finished and `i` is `3`. All three callbacks close over the same `i` variable and log its current value: `3`. Change `var` to `let` and you get `0, 1, 2`.

</details>

---

## Q3 — setTimeout(0) vs Promise.then

```js-exec
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
```

<details>
<summary>Show answer</summary>

**Output:**
```
A
D
C
B
```

**Why:** Sync code first: `"A"`, `"D"`. Then microtask queue is drained: `"C"` (`.then()` callback). Then the macrotask queue runs: `"B"` (`setTimeout` callback). Key rule: synchronous → microtasks → macrotasks. Promise `.then()` always beats `setTimeout(0)`.

</details>

---

## Q4 — this binding — method extracted and called standalone

```js-exec
const obj = {
  name: "Alice",
  greet() { console.log(this.name); },
};

const fn = obj.greet;
fn();
```

<details>
<summary>Show answer</summary>

**Output:**
```
undefined
```

**Why:** `fn` is called as a standalone function, not as a method of `obj`. In non-strict mode, `this` would be the global object (and `this.name` would be `undefined` unless there's a global `name`). In strict mode / ES modules, `this` is `undefined` and `this.name` throws `TypeError`. The key rule: `this` is determined by the call-site, not the original object.

</details>

---

## Q5 — Type coercion with +

```js-exec
console.log(1 + "2");
console.log("3" - 1);
console.log(5 + 5 + "5");
```

<details>
<summary>Show answer</summary>

**Output:**
```
12
2
105
```

**Why:** `+` with a string operand triggers **string concatenation**: `1 + "2"` → `"12"`. `-` always coerces to numbers: `"3" - 1` → `2`. Chained `+` is left-to-right: `5 + 5` → `10`, then `10 + "5"` → `"105"`.

</details>

---

## Q6 — Promise executor is synchronous

```js-exec
console.log("start");
new Promise((resolve) => {
  console.log("executor");
  resolve("done");
});
console.log("end");
```

<details>
<summary>Show answer</summary>

**Output:**
```
start
executor
end
```

**Why:** The Promise executor function runs **synchronously** at construction time. `"executor"` logs between `"start"` and `"end"`. The resolved value `"done"` goes nowhere because there is no `.then()` — but the executor body itself is synchronous.

</details>

---

## Q7 — .catch() recovery

```js-exec
Promise.reject("error")
  .catch(e => {
    console.log("caught:", e);
    return "recovered";
  })
  .then(v => console.log("then:", v));
```

<details>
<summary>Show answer</summary>

**Output:**
```
caught: error
then: recovered
```

**Why:** `.catch()` that returns a plain value converts the chain back to the resolved track. The `.then()` after `.catch()` runs normally and receives `"recovered"`. This is the recovery pattern — handle the error, return a fallback, and the chain continues.

</details>

---

## Q8 — Promise.all preserves input order

```js-exec
async function main() {
  const results = await Promise.all([
    Promise.resolve("first"),
    Promise.resolve("second"),
    Promise.resolve("third"),
  ]);
  console.log(results);
}

main();
```

<details>
<summary>Show answer</summary>

**Output:**
```
["first", "second", "third"]
```

**Why:** `Promise.all` returns values in **input order**, not resolution order. Even if the third Promise resolved first, the output array mirrors the input array. This matters when Promises have different resolve times — the array position is always preserved.

</details>

---

## Q9 — return vs return await in try/catch

```js-exec
async function withoutAwait() {
  try {
    return Promise.reject("fail");
  } catch (e) {
    console.log("caught without await:", e);
  }
}

async function withAwait() {
  try {
    return await Promise.reject("fail");
  } catch (e) {
    console.log("caught with await:", e);
  }
}

withoutAwait().catch(() => {});  // to suppress unhandled rejection
withAwait();
```

<details>
<summary>Show answer</summary>

**Output:**
```
caught with await: fail
```

**Why:** `return Promise.reject("fail")` exits the `try` block immediately — the `catch` never runs. `return await Promise.reject("fail")` stays inside the `try`, the `await` unwraps the rejection into a throw, and the `catch` intercepts it. `withoutAwait()` returns a rejected Promise that the caller must handle; `withAwait()` recovers inside the function.

</details>

---

## Q10 — Promise inside setTimeout

```js-exec
setTimeout(() => {
  console.log("T");
  Promise.resolve().then(() => console.log("P inside T"));
}, 0);

Promise.resolve().then(() => console.log("P"));
```

<details>
<summary>Show answer</summary>

**Output:**
```
P
T
P inside T
```

**Why:** Microtask `"P"` runs first (after sync). Then the macrotask fires: `"T"`, then queues `"P inside T"` as a microtask. After that macrotask exits, microtasks drain again: `"P inside T"`. The golden rule: after every macrotask, all microtasks are drained before the next macrotask — including microtasks created by the macrotask itself.

</details>

---

## Key Rules

| Topic | Rule |
|---|---|
| Scope | `var` is hoisted to `undefined`; `let`/`const` hit TDZ |
| Closures | Close over variables, not values; `var` in loop → all share the same binding |
| Event Loop | Sync → microtasks (Promise, queueMicrotask) → macrotasks (setTimeout) |
| this | Determined by call-site; extracted method loses its object binding |
| Coercion | `+` with string → concatenation; `-`/`*`/`/` → numeric coercion |
| Promises | Executor sync; `.then()` / `.catch()` are microtasks |
| .catch() | Returning a value converts chain back to resolved |
| Promise.all | Values in input order; fail-fast on first rejection |
| async/await | `return` exits `try`; `return await` stays and lets `catch` intercept |
| setTimeout + Promise | Microtask from macrotask runs before next macrotask |

---

## Go Deeper

- [Output Quiz #1 — Scope, Hoisting & the TDZ](/articles/js-output-scope-hoisting) — Q1, Q2 topics
- [Output Quiz #3 — The Event Loop & Task Ordering](/articles/js-output-event-loop) — Q3 topic
- [Output Quiz #6 — Promises & async/await Ordering](/articles/js-output-promises-async) — Q6 topic
- [Output Quiz #7 — Promise Chaining & .catch() Recovery](/articles/js-output-promise-chaining) — Q7 topic
- [Output Quiz #9 — async/await Patterns & return vs return await](/articles/js-output-async-patterns) — Q9 topic
- [Output Quiz #14 — Mixed Async Topics (Hard)](/articles/js-output-mixed-hard) — the hard sampler
