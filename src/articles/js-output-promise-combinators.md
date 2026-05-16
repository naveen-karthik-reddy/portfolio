Promise.all, race, allSettled, and any all behave differently when rejections appear — and interviewers test exactly those edges. Ten questions covering when each combinator resolves, what shape its value has, and the key difference between race and any on the first rejection.

---

## Q1 — Promise.all with all resolved — order is input order

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

**Why:** `Promise.all` waits for every Promise in the array and returns their values in **input order**, not resolution order. Even if the second Promise resolved before the first, the array position is preserved. Here all three are already resolved, so the array is `["first", "second", "third"]`.

</details>

---

## Q2 — Promise.all with one rejection

```js-exec
async function main() {
  try {
    const results = await Promise.all([
      Promise.resolve(1),
      Promise.reject("error"),
      Promise.resolve(3),
    ]);
    console.log(results);
  } catch (e) {
    console.log("caught:", e);
  }
}

main();
```

<details>
<summary>Show answer</summary>

**Output:**
```
caught: error
```

**Why:** `Promise.all` is **fail-fast** — as soon as any Promise rejects, the whole thing rejects with that reason. The values from `1` and `3` are discarded. The `.catch()` (or `try/catch` with `await`) fires with `"error"`. The other Promises are not cancelled — they continue running — but their results are ignored.

</details>

---

## Q3 — Promise.all with an empty array

```js-exec
async function main() {
  const results = await Promise.all([]);
  console.log(results);
  console.log(results.length);
}

main();
```

<details>
<summary>Show answer</summary>

**Output:**
```
[]
0
```

**Why:** `Promise.all([])` resolves **immediately** with an empty array — there are no Promises to wait for. This is a useful edge case when you're building the array dynamically and it might be empty. No microtask tick is needed; the resolution is synchronous within the Promise machinery.

</details>

---

## Q4 — Promise.race — first settled wins

```js-exec
const slow = new Promise(resolve => setTimeout(() => resolve("slow"), 200));
const fast = new Promise(resolve => setTimeout(() => resolve("fast"), 100));

Promise.race([slow, fast]).then(v => console.log(v));
```

<details>
<summary>Show answer</summary>

**Output:**
```
fast
```

**Why:** `Promise.race` resolves (or rejects) with the **first Promise that settles** — regardless of whether it resolved or rejected. `fast` resolves after 100ms, `slow` after 200ms. `fast` wins. Once `race` has settled, the result of `slow` is permanently ignored.

</details>

---

## Q5 — Promise.race where the first settles as a rejection

```js-exec
const rejected = new Promise((_, reject) => setTimeout(() => reject("fail"), 100));
const resolved = new Promise(resolve => setTimeout(() => resolve("ok"), 200));

Promise.race([rejected, resolved])
  .then(v => console.log("then:", v))
  .catch(e => console.log("catch:", e));
```

<details>
<summary>Show answer</summary>

**Output:**
```
catch: fail
```

**Why:** `Promise.race` doesn't prefer resolved Promises — it picks whichever settles first, including rejections. `rejected` settles at 100ms with a rejection, so the race result is a rejection. `resolved` settles later at 200ms but its result is ignored. Many developers assume `race` only picks resolved Promises — it doesn't.

</details>

---

## Q6 — Promise.allSettled never rejects

```js-exec
async function main() {
  const results = await Promise.allSettled([
    Promise.resolve("ok"),
    Promise.reject("fail"),
    Promise.resolve("also ok"),
  ]);
  console.log(results.length);
  console.log(results[1].status);
  console.log(results[1].reason);
}

main();
```

<details>
<summary>Show answer</summary>

**Output:**
```
3
rejected
fail
```

**Why:** `Promise.allSettled` **never rejects**. It waits for all Promises to settle and returns an array of descriptor objects — one per Promise, in input order. Fulfilled Promises give `{status: "fulfilled", value: ...}`. Rejected Promises give `{status: "rejected", reason: ...}`. This is the right tool when you want all results regardless of failures.

</details>

---

## Q7 — Promise.allSettled output shape in full

```js-exec
async function main() {
  const results = await Promise.allSettled([
    Promise.resolve(42),
    Promise.reject("oops"),
  ]);
  results.forEach(r => console.log(JSON.stringify(r)));
}

main();
```

<details>
<summary>Show answer</summary>

**Output:**
```
{"status":"fulfilled","value":42}
{"status":"rejected","reason":"oops"}
```

**Why:** The shape is fixed: fulfilled descriptors have `status` and `value`; rejected descriptors have `status` and `reason`. There is no `value` key on rejected descriptors and no `reason` key on fulfilled ones. This is important when you consume `allSettled` results — always check `status` before accessing `value` or `reason`.

</details>

---

## Q8 — Promise.any — first fulfilled wins, skips rejections

```js-exec
Promise.any([
  Promise.reject("first reject"),
  Promise.resolve("first resolve"),
  Promise.resolve("second resolve"),
])
  .then(v => console.log("any:", v))
  .catch(e => console.log("error:", e));
```

<details>
<summary>Show answer</summary>

**Output:**
```
any: first resolve
```

**Why:** `Promise.any` returns the **first fulfilled** Promise, ignoring rejections. The first element is a rejection — `any` skips it and waits for the next fulfillment. `"first resolve"` is the first to fulfill, so that's the result. Unlike `Promise.race`, a rejection does not settle `any`.

</details>

---

## Q9 — Promise.any when all reject — AggregateError

```js-exec
Promise.any([
  Promise.reject("e1"),
  Promise.reject("e2"),
  Promise.reject("e3"),
])
  .then(v => console.log("then:", v))
  .catch(e => {
    console.log(e instanceof AggregateError);
    console.log(e.errors);
  });
```

<details>
<summary>Show answer</summary>

**Output:**
```
true
["e1", "e2", "e3"]
```

**Why:** When all Promises passed to `Promise.any` reject, it rejects with an `AggregateError` — a special Error subtype that holds all the rejection reasons in its `.errors` array, in input order. This is the only way `Promise.any` ever rejects. `e.message` is `"All promises were rejected"`.

</details>

---

## Q10 — Promise.any vs Promise.race when the first settles as rejection

```js-exec
const first = Promise.reject("rejected first");
const second = new Promise(resolve => setTimeout(() => resolve("resolved second"), 100));

Promise.race([first, second])
  .then(v => console.log("race:", v))
  .catch(e => console.log("race catch:", e));

Promise.any([first, second])
  .then(v => console.log("any:", v))
  .catch(e => console.log("any catch:", e));
```

<details>
<summary>Show answer</summary>

**Output:**
```
race catch: rejected first
any: resolved second
```

**Why:** This is the critical difference between the two:

- `Promise.race` stops on the **first settlement** — resolved or rejected. `first` is already rejected synchronously (the executor runs sync), so `race` immediately rejects with `"rejected first"`.
- `Promise.any` stops on the **first fulfillment**. It skips the rejection and waits for `second` to resolve after 100ms, then fulfills with `"resolved second"`.

Use `race` when you want the fastest result regardless. Use `any` when you want the fastest *success*.

</details>

---

## Key Rules

| Combinator | Resolves when | Rejects when | Value shape |
|---|---|---|---|
| `Promise.all` | All resolve | Any one rejects (fail-fast) | Array in input order |
| `Promise.race` | First settles (resolve OR reject) | First settles as rejection | That one value/reason |
| `Promise.allSettled` | All settle (never rejects) | Never | Array of `{status,value}` or `{status,reason}` |
| `Promise.any` | First **resolves** | All reject | That one value / `AggregateError` |

**Key distinction — race vs any:**
- `race`: first to settle wins, including rejections
- `any`: first to **fulfil** wins; rejections are skipped until all reject

---

## Go Deeper

- [Output Quiz #7 — Promise Chaining & the .catch() Recovery Rules](/articles/js-output-promise-chaining) — the previous quiz
- [Output Quiz #9 — async/await Patterns & the return vs return await Trap](/articles/js-output-async-patterns) — the next quiz
- [Output Quiz #6 — Promises & async/await Ordering](/articles/js-output-promises-async) — basics: executor timing, .then() as microtask
