`async`/`await` looks like magic — synchronous-looking code that doesn't block. Beneath the syntax sugar, it's generators combined with a Promise-driving function. This article desugars `async`/`await` step by step.

**Prerequisites:** [Async #3 — Promises from Scratch](/articles/javascript-series/js-promise-from-scratch), [Async #6 — Generators & Iterators](/articles/javascript-series/js-generators-iterators)

---

## 1. What `async`/`await` Actually Does

An `async` function always returns a Promise — whatever you `return` becomes the resolved value. Inside, `await` pauses the function's execution until a promise settles, then unpacks its resolved value:

```js-exec
async function fetchUser(id) {
  // await "pauses" here until the promise resolves, then gives us the value
  const name = await Promise.resolve(`User-${id}`);
  // The function continues with name = "User-42"
  return `Fetched: ${name}`;
}

// The async function itself returns a Promise:
fetchUser(42).then((result) => console.log("Result:", result));
```

Key points before we dig into the internals:
- **`await` only blocks THIS function**, not the whole thread. Other code keeps running.
- **`await` works on any thenable**, not just Promise — it calls `.then()` under the hood.
- **`await 42` (non-promise)** just wraps it: `Promise.resolve(42)`.
- **Errors** can be caught with `try/catch` around `await`, just like synchronous code.

---

## 2. Generators Can Pause and Resume

A generator can `yield` values and later resume from where it left off. This "pause-and-resume" is the exact mechanism `await` needs:

```js-exec
function* numberGenerator() {
  console.log("Gen: start");
  const a = yield "First yield";
  console.log("Gen: got", a);
  const b = yield "Second yield";
  console.log("Gen: got", b);
  return "done";
}

const gen = numberGenerator();

console.log(gen.next());        // "Gen: start" → { value: "First yield", done: false }
console.log(gen.next("alpha")); // "Gen: got alpha" → { value: "Second yield", done: false }
console.log(gen.next("beta"));  // "Gen: got beta" → { value: "done", done: true }
```

Every `.next(arg)` passes `arg` back to where `yield` left off. This is how we'll pass resolved promise values back into the async function.

---

## 3. Desugaring `async`/`await` to a Generator + Runner

The pattern: `yield` every promise, and a runner function calls `.next()` with each resolved value:

```js-exec
function asyncRunner(generatorFn) {
  return function (...args) {
    const gen = generatorFn(...args);

    return new Promise((resolve, reject) => {
      function step(nextFn) {
        let result;
        try {
          result = nextFn();
        } catch (err) {
          return reject(err);
        }

        if (result.done) {
          return resolve(result.value);
        }

        // The gen yielded a value — wrap it in a promise and wait
        Promise.resolve(result.value).then(
          (value) => step(() => gen.next(value)),  // Pass resolved value back in
          (reason) => step(() => gen.throw(reason)) // Propagate errors into gen
        );
      }

      step(() => gen.next());
    });
  };
}

// Use the runner: write a generator that yields promises
const fetchUser = asyncRunner(function* (id) {
  const name = yield Promise.resolve(`User-${id}`);
  const details = yield Promise.resolve(`${name} (verified)`);
  return details;
});

fetchUser(42).then((result) => console.log("Result:", result)); // "User-42 (verified)"

// What happens step by step when fetchUser(42) is called:
//
// 1. asyncRunner returns a function; calling it creates the generator
// 2. step(() => gen.next()) runs gen.next() → generator runs until first yield:
//       yield Promise.resolve("User-42") → { value: Promise<"User-42">, done: false }
// 3. Promise.resolve(result.value) wraps the yielded value → .then()
// 4. When that promise resolves with "User-42":
//       step(() => gen.next("User-42")) → generator resumes, name = "User-42"
// 5. Generator hits second yield → same pattern, details = "User-42 (verified)"
// 6. Generator hits return → { value: "User-42 (verified)", done: true }
// 7. resolve(result.value) → the outer promise resolves with the final value
```

---

## 4. Error Handling in the Desugared Version

Errors propagate naturally — the runner passes rejections to `gen.throw()`, which becomes a thrown exception at the `yield` point:

```js-exec
const mightFail = asyncRunner(function* () {
  try {
    const data = yield Promise.reject(new Error("Network failure"));
    return data; // Never reached
  } catch (err) {
    return `Caught: ${err.message}`;
  }
});

mightFail().then(console.log); // "Caught: Network failure"
```

---

## 5. Sequential vs Concurrent `await`

`await` is sequential by default — each one waits for the previous. That's often wasteful when operations are independent:

```js-exec
// ❌ Sequential — each await blocks the function until it resolves
const sequential = asyncRunner(function* () {
  const a = yield new Promise((r) => setTimeout(() => r("A"), 200));
  const b = yield new Promise((r) => setTimeout(() => r("B"), 200));
  return [a, b]; // Takes ~400ms
});

// ✅ Concurrent — start all promises, then await their results
const concurrent = asyncRunner(function* () {
  const promiseA = new Promise((r) => setTimeout(() => r("A"), 200));
  const promiseB = new Promise((r) => setTimeout(() => r("B"), 200));

  const a = yield promiseA;
  const b = yield promiseB;
  return [a, b]; // Takes ~200ms — both run in parallel
});

concurrent().then((r) => console.log("Concurrent:", r));
```

---

## 6. The `async` to Generator Transformation

In summary, this:

```js
async function foo() {
  const a = await promiseA();
  const b = await promiseB(a);
  return b;
}
```

Roughly becomes:

```js
function foo() {
  return asyncRunner(function* () {
    const a = yield promiseA();
    const b = yield promiseB(a);
    return b;
  })();
}
```

Where `asyncRunner` is our generator-driving function that chains `.then()` calls on every yielded promise.

```js-exec
// Full example with logging to show the state machine:
const demo = asyncRunner(function* () {
  console.log("Step 1: Starting");
  const x = yield Promise.resolve(10);
  console.log("Step 2: x =", x);
  const y = yield Promise.resolve(x * 2);
  console.log("Step 3: y =", y);
  return x + y;
});

demo().then((sum) => console.log("Final sum:", sum));
// Step 1 → Step 2 (10) → Step 3 (20) → Final: 30
```

---

## Key Takeaways

- `async`/`await` is **syntax sugar** over generators + a Promise-based runner.
- `yield` pauses; `.next(value)` resumes with the value — this is how resolved promise values get passed back.
- `gen.throw(error)` propagates a rejected promise into the generator as an exception → enables `try/catch` around `await`.
- The runner wraps everything in a Promise — the generator's `return` value becomes the resolved value.
- **Concurrent vs sequential**: `await` only blocks the async function, not the thread. Start promises first, then await, for concurrency.

---

**Next:** [Async #7 — Async Iteration](/articles/javascript-series/js-async-iteration) — `for await...of`, async generators, and streaming data patterns.
