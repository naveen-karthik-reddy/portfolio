`promisify(fn)` converts a Node.js-style callback function `(arg, cb)` into a Promise-returning function `(arg) => Promise`. The callback convention is `(err, result)` — error-first. Build the base version, then extend it so the original function can override the resolved value.

---

## What is `promisify()`?

`promisify(fn)` converts a **callback-based function** into a **Promise-based function**. Specifically, it targets Node.js-style error-first callbacks where the function signature is `fn(arg, (err, result) => {})`. The returned function takes the same arguments (minus the callback) and returns a Promise that resolves with `result` or rejects with `err`.

This is the **callback-to-Promise adapter pattern**. Before Promises and `async/await` became standard, the entire Node.js ecosystem used error-first callbacks — `fs.readFile(path, (err, data) => {})`, `db.query(sql, (err, rows) => {})`, etc. `promisify` bridges that legacy world to modern async code.

Node.js ships with `util.promisify()` for exactly this purpose, but interviewers want to see you build it from scratch because it tests:
1. **Understanding the error-first callback convention** — `(err, result)` where the first argument signals failure
2. **Dynamic function wrapping** — returning a function with `...args` that internally calls the original with an added callback
3. **Promise construction** — creating a Promise that resolves/rejects based on the callback's parameters

Real-world use cases:
- Wrapping legacy Node.js APIs: `const readFile = promisify(fs.readFile); await readFile("data.json")`
- Adapting third-party callback-based SDKs to modern async patterns
- Building async middleware that bridges old and new code styles during migration

The interview often extends to version II: the original function can return a value that overrides the callback result (a pattern seen in some libraries). This tests whether you can handle the edge case where both the return value and the callback compete to settle the Promise.

---

## The Problem

> "Implement `promisify(fn)` that takes a function following the Node.js error-first callback convention `fn(arg, (err, result) => {})` and returns a function that returns a Promise."
>
> "Version II: Support a special return value from the original function that can override the callback result."

---

## Thought Process

The pattern is:
1. Return a new function that returns a Promise
2. Inside, call the original function with the provided arguments + a custom callback
3. The callback resolves or rejects the Promise based on `err`

The tricky part: the original function might pass extra arguments after `err` and `result`. Handle them by slicing `arguments`.

---

## Step 1 — Base Implementation

```js-exec
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };
}

// Simulate a callback-based function
function readFile(path, callback) {
  setTimeout(() => {
    if (path === 'bad.txt') {
      callback(new Error('File not found'));
    } else {
      callback(null, `Contents of ${path}`);
    }
  }, 10);
}

const readFilePromise = promisify(readFile);

readFilePromise('hello.txt').then(console.log);  // "Contents of hello.txt"
readFilePromise('bad.txt').catch(console.error); // Error: File not found
```

---

## Step 2 — Preserving `this` Context

The interviewer says: "What if the original function uses `this`?"

```js-exec
const db = {
  name: 'users',
  query(sql, callback) {
    callback(null, `${sql} on ${this.name}`);
  }
};

const queryPromise = promisify(db.query);

// We need .bind(db) or db.query.call(db, ...)
// The base version already uses fn.call(this, ...) which works
// when called as method: db.queryPromise = promisify(db.query.bind(db));
```

**The fix**: If `promisify` is used as a method decorator, the caller needs to `.bind()` the original function. This is the same behavior as the native `util.promisify`.

---

## Step 3 — Multiple Success Values

Node-style callbacks sometimes pass more than two arguments: `callback(null, arg1, arg2)`. Handle this by collecting all success arguments:

```js-exec
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, ...results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length <= 1 ? results[0] : results);
        }
      });
    });
  };
}

function multiCallback(input, cb) {
  cb(null, input, input.length, input.toUpperCase());
}

const multiPromise = promisify(multiCallback);
multiPromise('hello').then(console.log);  // ['hello', 5, 'HELLO']
```

---

## Step 4 — Version II: Custom Resolve Override

Some libraries (like Node's `fs.exists`) don't follow the error-first convention. The original function can return `true` to override the callback's result:

```js-exec
function promisify(fn) {
  const customSymbol = Symbol('customPromisify');

  return function (...args) {
    return new Promise((resolve, reject) => {
      const callback = (err, ...results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length <= 1 ? results[0] : results);
        }
      };
      callback[customSymbol] = true;

      const result = fn.call(this, ...args, callback);

      // If fn returns a non-undefined value (besides the callback), use it
      if (result !== undefined && result !== callback) {
        resolve(result);
      }
    });
  };
}

function syncStyle(input, callback) {
  if (input === 'sync') return 'immediate';
  callback(null, `async: ${input}`);
}

const fn = promisify(syncStyle);
fn('sync').then(console.log);   // 'immediate'
fn('async').then(console.log);  // 'async: async'
```

---

## Step 5 — Edge Cases

**Synchronous throw**: If `fn` throws synchronously (not via the callback), the Promise constructor catches it — no special handling needed.

**No callback called**: If `fn` never calls the callback, the Promise hangs — same as native `util.promisify`. This is by design.

**Extra arguments after err**: `callback(null, ...results)` collects them all. Single result → resolve as value; multiple → resolve as array.

---

## Full Solution

```js-exec
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, ...results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length <= 1 ? results[0] : results);
        }
      });
    });
  };
}
```

---

## What Interviewers Are Testing

- **Error-first callback convention** — understanding the `(err, result)` pattern
- **Promise construction** — wrapping callback-based APIs in Promises
- **`this` forwarding** — preserving context with `.call(this, ...)`
- **Rest parameters** — using `...args` for flexible argument passing
- **Multiple success values** — handling `callback(null, a, b, c)`

---

## Complexity

| | Time | Space |
|-|------|-------|
| promisify | O(1) — just creates a wrapper | O(1) |

---

## Interview Tips

- **Nail the callback signature** — "The callback is error-first: `(err, result)`. If `err` is truthy, reject; otherwise resolve."
- **Use rest params** — `...args` captures all arguments the wrapper receives and forwards them to the original function.
- **Handle multiple success values** — "I'll use `...results` to capture all non-error arguments. If there's only one, resolve with it directly; otherwise resolve with the array."
- **Mention `util.promisify`** — Node.js has this built-in. The interviewer wants to know you understand why you'd build it vs use the native one (e.g., custom behavior).

---

## Related Questions

- [Implement Promise.all, race, any & allSettled](/articles/js-interview-promise-combinators)
- [Implement promiseTimeout()](/articles/js-interview-promise-timeout)
- [Implement mapAsync() and mapAsyncLimit()](/articles/js-interview-map-async)
