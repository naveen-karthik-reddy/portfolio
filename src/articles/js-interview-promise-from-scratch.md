Building a Promise from scratch is the deepest async interview question. You need to implement the state machine, async handler queuing, `.then()` chaining, and the resolution procedure — the rule that lets a `.then()` handler return another Promise and have it "unwrap" automatically.

---

## What is a Promise?

A Promise is a state machine with three states: **pending**, **fulfilled**, and **rejected**. Once it transitions from pending, the state is locked — it can never change again.

The hard part isn't the state machine. It's two things:

1. **`.then()` must be async** — even if the promise is already settled, handlers must run asynchronously (in the microtask queue, not synchronously). This matches the Promises/A+ spec and is what makes promise behavior predictable.
2. **The resolution procedure** — when a `.then()` handler returns a thenable (another Promise, or any object with a `.then` method), the new promise must "adopt" that thenable's state rather than resolving with the thenable itself. This is what makes chaining work.

---

## The Problem

> "Implement a `MyPromise` class that behaves like the native Promise. It should support `resolve`, `reject`, `.then()` chaining, `.catch()`, and `.finally()`."

---

## Thought Process

Build it layer by layer:
1. State machine — constructor, `#resolve`, `#reject`
2. Handler queue — store `.then()` callbacks for when the promise settles
3. Async execution — use `queueMicrotask` so handlers always run after current synchronous code
4. `.then()` returns a new Promise — the result of the handler becomes the new promise's value
5. Resolution procedure — if a handler returns a thenable, adopt its state
6. `.catch()` and `.finally()` — thin wrappers around `.then()`

---

## Step 1 — State Machine

```js-exec
class MyPromise {
  #state = "pending";
  #value = undefined;
  #handlers = [];

  constructor(executor) {
    const resolve = (value) => this.#resolve(value);
    const reject  = (reason) => this.#reject(reason);

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  #resolve(value) {
    if (this.#state !== "pending") return; // once settled, ignore
    this.#state = "fulfilled";
    this.#value = value;
    this.#runHandlers();
  }

  #reject(reason) {
    if (this.#state !== "pending") return;
    this.#state = "rejected";
    this.#value = reason;
    this.#runHandlers();
  }

  #runHandlers() {
    queueMicrotask(() => {
      this.#handlers.forEach(h => this.#executeHandler(h));
      this.#handlers = [];
    });
  }
}

// Quick sanity check — state transitions
const p = new MyPromise((resolve) => resolve(42));
console.log("created"); // state is now "fulfilled" internally
```

---

## Step 2 — `.then()` with Chaining

`.then()` must return a **new** Promise. The new promise resolves with whatever the handler returns — or rejects if the handler throws.

```js-exec
class MyPromise {
  #state = "pending";
  #value = undefined;
  #handlers = [];

  constructor(executor) {
    try { executor(v => this.#resolve(v), r => this.#reject(r)); }
    catch (err) { this.#reject(err); }
  }

  #resolve(value) {
    if (this.#state !== "pending") return;
    this.#state = "fulfilled";
    this.#value = value;
    this.#flush();
  }

  #reject(reason) {
    if (this.#state !== "pending") return;
    this.#state = "rejected";
    this.#value = reason;
    this.#flush();
  }

  #flush() {
    queueMicrotask(() => {
      this.#handlers.forEach(h => this.#run(h));
      this.#handlers = [];
    });
  }

  #run({ onFulfilled, onRejected, resolve, reject }) {
    const handler = this.#state === "fulfilled" ? onFulfilled : onRejected;

    if (typeof handler !== "function") {
      // Pass-through: no handler for this state → forward value/reason
      this.#state === "fulfilled" ? resolve(this.#value) : reject(this.#value);
      return;
    }

    try {
      resolve(handler(this.#value));
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handler = { onFulfilled, onRejected, resolve, reject };

      if (this.#state === "pending") {
        this.#handlers.push(handler);
      } else {
        // Already settled — still run asynchronously
        queueMicrotask(() => this.#run(handler));
      }
    });
  }
}

// Test basic chaining
new MyPromise((resolve) => resolve(1))
  .then(v => v + 1)
  .then(v => v * 2)
  .then(v => console.log("result:", v)); // result: 4

// Test rejection pass-through
new MyPromise((_, reject) => reject(new Error("oops")))
  .then(v => v + 1) // no rejection handler — passes through
  .then(v => v * 2) // same
  .then(null, err => console.log("caught:", err.message)); // caught: oops
```

---

## Step 3 — The Resolution Procedure (Thenable Unwrapping)

The critical insight: if a `.then()` handler returns a Promise (or any thenable), the new promise should **adopt** that promise's state — not resolve with the promise object itself.

```js-exec
class MyPromise {
  #state = "pending";
  #value = undefined;
  #handlers = [];

  constructor(executor) {
    try { executor(v => this.#resolve(v), r => this.#reject(r)); }
    catch (err) { this.#reject(err); }
  }

  #resolve(value) {
    if (this.#state !== "pending") return;

    // Resolution procedure: if value is a thenable, adopt its state
    if (value !== null && (typeof value === "object" || typeof value === "function") && typeof value.then === "function") {
      try {
        value.then(
          v => this.#resolve(v),
          r => this.#reject(r)
        );
      } catch (err) {
        this.#reject(err);
      }
      return;
    }

    this.#state = "fulfilled";
    this.#value = value;
    this.#flush();
  }

  #reject(reason) {
    if (this.#state !== "pending") return;
    this.#state = "rejected";
    this.#value = reason;
    this.#flush();
  }

  #flush() {
    queueMicrotask(() => {
      this.#handlers.forEach(h => this.#run(h));
      this.#handlers = [];
    });
  }

  #run({ onFulfilled, onRejected, resolve, reject }) {
    const handler = this.#state === "fulfilled" ? onFulfilled : onRejected;
    if (typeof handler !== "function") {
      this.#state === "fulfilled" ? resolve(this.#value) : reject(this.#value);
      return;
    }
    try { resolve(handler(this.#value)); }
    catch (err) { reject(err); }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const h = { onFulfilled, onRejected, resolve, reject };
      if (this.#state === "pending") this.#handlers.push(h);
      else queueMicrotask(() => this.#run(h));
    });
  }
}

// Test: handler returns a Promise — must unwrap it
new MyPromise(resolve => resolve(1))
  .then(v => new MyPromise(res => setTimeout(() => res(v + 10), 30)))
  .then(v => console.log("unwrapped:", v)); // unwrapped: 11

// Test: returning a native Promise (cross-compatibility)
new MyPromise(resolve => resolve("start"))
  .then(v => Promise.resolve(v + "→middle"))
  .then(v => console.log(v + "→end")); // start→middle→end
```

---

## Step 4 — `.catch()`, `.finally()`, and Static Methods

```js-exec
// Complete MyPromise — adds catch, finally, static resolve/reject
class MyPromise {
  #state = "pending";
  #value = undefined;
  #handlers = [];

  constructor(executor) {
    try { executor(v => this.#resolve(v), r => this.#reject(r)); }
    catch (err) { this.#reject(err); }
  }

  #resolve(value) {
    if (this.#state !== "pending") return;
    if (value != null && typeof value.then === "function") {
      try { value.then(v => this.#resolve(v), r => this.#reject(r)); }
      catch (err) { this.#reject(err); }
      return;
    }
    this.#state = "fulfilled";
    this.#value = value;
    this.#flush();
  }

  #reject(reason) {
    if (this.#state !== "pending") return;
    this.#state = "rejected";
    this.#value = reason;
    this.#flush();
  }

  #flush() {
    queueMicrotask(() => { this.#handlers.forEach(h => this.#run(h)); this.#handlers = []; });
  }

  #run({ onFulfilled, onRejected, resolve, reject }) {
    const fn = this.#state === "fulfilled" ? onFulfilled : onRejected;
    if (typeof fn !== "function") {
      this.#state === "fulfilled" ? resolve(this.#value) : reject(this.#value);
      return;
    }
    try { resolve(fn(this.#value)); } catch (err) { reject(err); }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const h = { onFulfilled, onRejected, resolve, reject };
      if (this.#state === "pending") this.#handlers.push(h);
      else queueMicrotask(() => this.#run(h));
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(onFinally) {
    return this.then(
      value  => MyPromise.resolve(onFinally()).then(() => value),
      reason => MyPromise.resolve(onFinally()).then(() => { throw reason; })
    );
  }

  static resolve(value) { return new MyPromise(res => res(value)); }
  static reject(reason) { return new MyPromise((_, rej) => rej(reason)); }
}

// Final test suite
MyPromise.resolve(10)
  .then(v => v * 2)
  .then(v => { throw new Error(`too big: ${v}`); })
  .catch(err => console.log("caught:", err.message))   // caught: too big: 20
  .finally(() => console.log("done"))                   // done
  .then(v => console.log("after finally:", v));         // after finally: undefined
```

---

## What Interviewers Are Testing

- **State machine** — understanding that a Promise can only transition once and in one direction
- **Microtask queue** — knowing that handlers must be async (`queueMicrotask`, not `setTimeout`) and why this matters for execution order
- **The resolution procedure** — the rule that makes chaining work: if a handler returns a thenable, adopt its state
- **Pass-through** — when there's no handler for the current state, the value/reason propagates to the next `.then()`
- **`finally` semantics** — it observes but doesn't transform; if it throws, the throw wins

---

## Complexity

| | Time | Space |
|-|------|-------|
| Construction | O(1) | O(1) |
| `.then()` | O(1) | O(H) — H = handlers queued |
| Settlement | O(H) | O(1) |

---

## Interview Tips

- **Build the state machine first** — write the constructor, `#resolve`, `#reject` before worrying about `.then()`. This shows structured thinking.
- **Name the resolution procedure** — "When a handler returns a thenable, I need to adopt its state — this is the Promises/A+ resolution procedure." Naming it shows spec-level knowledge.
- **Explain `queueMicrotask` vs `setTimeout`** — microtasks run before the next macrotask. Using `setTimeout` would break execution order. Interviewers listen for this distinction.
- **Don't worry about 100% spec compliance** — a working implementation that handles chaining, pass-through, and error propagation correctly is sufficient. Mention you know the full spec exists.

---

## Related Questions

- [Implement Promise.all, race, any & allSettled](/articles/js-interview-promise-combinators)
- [Implement promisify()](/articles/js-interview-promisify)
- [Implement auto-retry with exponential backoff](/articles/js-interview-retry)
