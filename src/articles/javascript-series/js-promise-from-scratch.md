Promises are the foundation of modern async JavaScript. Every `fetch` call, every `async` function, every `await` — they all depend on Promises. Building one from scratch reveals exactly how `then`, `catch`, `finally`, and chaining work at the microtask level.

**Prerequisites:** [Async #1 — The Event Loop](/articles/javascript-series/js-event-loop-in-depth)

---

## 1. The Promise State Machine

A Promise is always in one of three states:

- **Pending** — initial state, waiting for resolution
- **Fulfilled** — operation succeeded, a value is available
- **Rejected** — operation failed, a reason is available

Once fulfilled or rejected, a Promise is **settled** — it can never change state again.

```js-exec
const p1 = new Promise(() => {}); // Stays pending forever
console.log("Pending:", p1);

const p2 = Promise.resolve(42);  // Immediately fulfilled
console.log("Fulfilled:", p2);

const p3 = Promise.reject("err"); // Immediately rejected
console.log("Rejected:", p3);
```

---

## 2. Building `MyPromise` — Constructor

```js-exec
class MyPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;

    // Queues for .then() callbacks — we need arrays because
    // multiple .then()s can be registered on the same promise
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      // Only the first call counts
      if (this.state !== "pending") return;

      // If value is a thenable, wait for it to settle
      if (value && typeof value.then === "function") {
        value.then(resolve, reject);
        return;
      }

      this.state = "fulfilled";
      this.value = value;
      this.onFulfilledCallbacks.forEach((fn) => fn());
    };

    const reject = (reason) => {
      if (this.state !== "pending") return;
      this.state = "rejected";
      this.reason = reason;
      this.onRejectedCallbacks.forEach((fn) => fn());
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
}

// Test the constructor
const p = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve("done"), 100);
});

// We can inspect but .then() isn't built yet...
console.log("State after construction:", p.state); // "pending"
```

---

## 3. Implementing `.then()` and `.catch()`

`.then()` registers callbacks and returns a NEW promise for chaining:

```js-exec
// Continuing MyPromise class...

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  // Default handlers — pass through if not provided
  onFulfilled =
    typeof onFulfilled === "function" ? onFulfilled : (value) => value;
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : (reason) => {
          throw reason;
        };

  const promise2 = new MyPromise((resolve, reject) => {
    const fulfillTask = () => {
      queueMicrotask(() => {
        try {
          const result = onFulfilled(this.value);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    };

    const rejectTask = () => {
      queueMicrotask(() => {
        try {
          const result = onRejected(this.reason);
          // If onRejected doesn't throw, we RESOLVE (not reject)
          // This is how .catch() recovers the chain
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    };

    if (this.state === "fulfilled") {
      fulfillTask();
    } else if (this.state === "rejected") {
      rejectTask();
    } else {
      // Still pending — queue for later
      this.onFulfilledCallbacks.push(fulfillTask);
      this.onRejectedCallbacks.push(rejectTask);
    }
  });

  return promise2;
};

MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};

// Test it!
const success = new MyPromise((resolve) =>
  setTimeout(() => resolve("Success!"), 50)
);

success.then((val) => console.log("then:", val));

const failure = new MyPromise((_, reject) =>
  setTimeout(() => reject(new Error("Failed!")), 50)
);

failure
  .then((val) => console.log("Never runs"))
  .catch((err) => console.log("catch:", err.message));
```

---

## 4. `.finally()` — Runs Regardless

`finally` always runs but doesn't receive the value/reason, and passes through the original resolution:

```js-exec
MyPromise.prototype.finally = function (onFinally) {
  return this.then(
    (value) => {
      onFinally();
      return value; // Pass through resolved value
    },
    (reason) => {
      onFinally();
      throw reason; // Pass through rejection
    }
  );
};

// Test
new MyPromise((resolve) => resolve("data"))
  .finally(() => console.log("Cleanup"))
  .then((val) => console.log("Got:", val));

new MyPromise((_, reject) => reject("error"))
  .finally(() => console.log("Cleanup (error case)"))
  .catch((err) => console.log("Caught:", err));
```

---

## 5. Static Methods — `MyPromise.resolve()` and `MyPromise.reject()`

```js-exec
MyPromise.resolve = function (value) {
  // If it's already a MyPromise, return it
  if (value instanceof MyPromise) return value;

  return new MyPromise((resolve) => resolve(value));
};

MyPromise.reject = function (reason) {
  return new MyPromise((_, reject) => reject(reason));
};

// Test
MyPromise.resolve(42).then(console.log); // 42
MyPromise.reject("bad").catch(console.log); // "bad"
```

---

## 6. Chaining and the Flattening Trick

The key to promise chaining: when `onFulfilled` returns a promise, the `.then()` wrapper waits for that promise. Our `resolve(value)` in the constructor already handles thenables — so `resolve(result)` in the `fulfillTask` auto-flattens:

```js-exec
// Test chaining with our implementation
new MyPromise((resolve) => {
  console.log("Step 1: Start");
  resolve(1);
})
  .then((n) => {
    console.log("Step 2:", n);
    return n + 1;
  })
  .then((n) => {
    console.log("Step 3:", n);
    // Return a new promise — .then() will wait for it
    return new MyPromise((resolve) =>
      setTimeout(() => resolve(n * 10), 200)
    );
  })
  .then((n) => {
    console.log("Step 4 (after delay):", n);
  });
```

---

## 7. Full Minimal Implementation

Here's the complete self-contained implementation for reference:

```js-exec
class MyPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state !== "pending") return;
      if (value && typeof value.then === "function") {
        value.then(resolve, reject);
        return;
      }
      this.state = "fulfilled";
      this.value = value;
      this.onFulfilledCallbacks.forEach((fn) => fn());
    };

    const reject = (reason) => {
      if (this.state !== "pending") return;
      this.state = "rejected";
      this.reason = reason;
      this.onRejectedCallbacks.forEach((fn) => fn());
    };

    try { executor(resolve, reject); } catch (err) { reject(err); }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    onRejected = typeof onRejected === "function" ? onRejected : (e) => { throw e; };

    return new MyPromise((resolve, reject) => {
      const schedule = (handler, value) => {
        queueMicrotask(() => {
          try { resolve(handler(value)); } catch (err) { reject(err); }
        });
      };

      if (this.state === "fulfilled") schedule(onFulfilled, this.value);
      else if (this.state === "rejected") schedule(onRejected, this.reason);
      else {
        this.onFulfilledCallbacks.push(() => schedule(onFulfilled, this.value));
        this.onRejectedCallbacks.push(() => schedule(onRejected, this.reason));
      }
    });
  }

  catch(onRejected) { return this.then(null, onRejected); }

  finally(onFinally) {
    return this.then(
      (v) => { onFinally(); return v; },
      (e) => { onFinally(); throw e; }
    );
  }

  static resolve(value) { return new MyPromise((r) => r(value)); }
  static reject(reason) { return new MyPromise((_, rj) => rj(reason)); }
}

// Verification
MyPromise.resolve(1)
  .then((n) => n + 1)
  .then((n) => console.log("MyPromise result:", n)); // 2
```

---

## Key Takeaways

- A Promise is a **state machine**: pending → fulfilled (value) or pending → rejected (reason).
- `.then()` returns a **new Promise** — this is what enables chaining.
- Callbacks run via **microtasks** (`queueMicrotask`), not synchronously.
- **Resolve-thenable flattening**: if `resolve(value)` gets a thenable, the promise adopts that thenable's state.
- **`.catch()` recovers**: if `onRejected` doesn't throw, the chain continues as fulfilled.
- **`constructor`, `then`, `resolve`, `reject`, `queueMicrotask`** — these are the five pieces you need.

---

**Next:** [Async #4 — `Promise.all`, `allSettled`, `race`, `any` ](/articles/javascript-series/js-promise-combinators) — implement all four combinators from scratch.
