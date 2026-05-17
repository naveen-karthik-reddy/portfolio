JavaScript has a rich error system beyond `try/catch`. This article focuses on the patterns interviewers ask about: `AggregateError`, the error-first callback convention, custom error hierarchies, and how errors flow through Promises.

**Prerequisite:** [JS Foundations #6 — Error Handling](/articles/js-error-handling) covers `try/catch/finally`, custom error classes, and global error listeners.

---

## 1. `AggregateError` — Multiple Errors at Once

`AggregateError` bundles multiple errors into one. It's used by `Promise.any` when all promises reject.

```js-exec
const errors = [
  new Error('API 1 failed'),
  new Error('API 2 failed'),
  new Error('API 3 failed'),
];

const agg = new AggregateError(errors, 'All APIs failed');
console.log(agg.name);     // 'AggregateError'
console.log(agg.message);  // 'All APIs failed'
console.log(agg.errors);   // [Error, Error, Error] — the individual errors
console.log(agg.errors.length);  // 3

// Examining individual errors
for (const err of agg.errors) {
  console.log(err.message);
}
```

**Constructor**: `new AggregateError(errors, message?, options?)` — `errors` is an iterable of Error objects.

**Interview use**: Implementing `Promise.any` (#18). When all promises reject, reject with an `AggregateError` containing all the individual rejection reasons.

---

## 2. Error-First Callback Convention

Node.js APIs use the pattern `callback(err, result)`:
- If the operation succeeds, `err` is `null`/`undefined` and `result` holds the value.
- If it fails, `err` is an Error and `result` is ignored.

```js-exec
// Example: callback-based readFile
function readFile(path, callback) {
  setTimeout(() => {
    if (path === 'bad.txt') {
      callback(new Error('ENOENT: file not found'));
    } else {
      callback(null, `Contents of ${path}`);
    }
  }, 10);
}

// Consuming it
readFile('hello.txt', (err, data) => {
  if (err) {
    console.error('Failed:', err.message);
  } else {
    console.log('Read:', data);
  }
});
```

**Interview use**: Implementing `promisify()` (#19) — wrapping a callback-based function so it returns a Promise.

---

## 3. Custom Error Hierarchies

Creating a family of related errors lets callers catch by type:

```js-exec
class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class NetworkError extends AppError {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}

class TimeoutError extends AppError {
  constructor(ms) {
    super(`Timed out after ${ms}ms`);
    this.timeoutMs = ms;
  }
}

// Usage: catch specific types
async function fetchWithTimeout(url, ms) {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(new TimeoutError(ms)), ms)
  );
  const response = await Promise.race([fetch(url), timer]);
  if (!response.ok) throw new NetworkError(response.statusText, response.status);
  return response.json();
}
```

**Interview use**: `promiseTimeout()` (#20) uses `TimeoutError` so callers can distinguish timeout from other failures.

---

## 4. Errors in Promise Chains

### `.then(onFulfilled, onRejected)` — Two Handlers

```js-exec
Promise.reject(new Error('fail'))
  .then(
    value => console.log('Got:', value),     // skipped
    err => console.log('Caught:', err.message) // 'Caught: fail'
  );
```

### `.catch(onRejected)` — Shorthand for `.then(null, onRejected)`

```js-exec
Promise.reject(new Error('fail'))
  .then(value => console.log('Got:', value))
  .catch(err => console.log('Caught:', err.message));  // 'Caught: fail'
```

### Error Recovery in `.catch()`

`.catch()` can recover by returning a value:

```js-exec
Promise.reject(new Error('fail'))
  .catch(err => {
    console.log('Recovering from:', err.message);
    return 'default value';  // becomes a resolved promise
  })
  .then(value => console.log('Result:', value));  // 'Result: default value'
```

### Rethrowing in `.catch()`

To handle only a specific error and let others propagate:

```js-exec
Promise.reject(new TypeError('wrong type'))
  .catch(err => {
    if (err instanceof TypeError) {
      return 'handled TypeError';
    }
    throw err;  // rethrow — passes to next catch
  })
  .catch(err => console.log('Unhandled:', err.message));
```

**Interview use**: Error propagation in `mapAsyncLimit` (#21) — reject the outer promise on first error but allow in-flight operations to complete (or short-circuit).

---

## 5. Unhandled Promise Rejections

When a promise rejects and nothing catches it:

```js-exec
// This would cause an "unhandled rejection" warning in Node / browsers:
// Promise.reject(new Error('nobody catches me'));

// In browsers, listen globally:
// window.addEventListener('unhandledrejection', event => {
//   console.error('Unhandled:', event.reason);
//   event.preventDefault();  // suppress console error
// });

// In Node:
// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled:', reason);
// });
```

---

## 6. Error Cause (ES2022)

The `cause` option lets you chain errors — useful for wrapping low-level errors with context:

```js-exec
async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`, { cause: response.statusText });
    }
    return response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      // Network error — wrap with URL context
      throw new Error(`Failed to fetch ${url}`, { cause: err });
    }
    throw err;
  }
}

// fetchJSON('https://bad-url.example').catch(err => {
//   console.log(err.message);   // 'Failed to fetch https://bad-url.example'
//   console.log(err.cause);     // original TypeError
// });
```

---

## 7. Synchronous Throw in Promise Constructors

Throwing inside the Promise executor is automatically caught and rejects the promise:

```js-exec
const promise = new Promise((resolve, reject) => {
  throw new Error('synchronous throw');
  // Equivalent to: reject(new Error('synchronous throw'))
});

promise.catch(err => console.log('Caught:', err.message));  // 'Caught: synchronous throw'
```

**Interview use**: `promisify()` (#19) — if the original callback-based function throws synchronously, the Promise constructor catches it.

---

## Quick Reference

| Pattern | Use |
|-|-|
| `AggregateError(errors, msg)` | Bundle multiple errors (Promise.any) |
| Error-first callback `(err, result)` | Node.js async convention |
| `class X extends Error` | Custom error types |
| `.catch(err => ...)` in Promise chains | Error handling and recovery |
| `throw err` inside `.catch` | Rethrow after selective handling |
| `new Error(msg, { cause: err })` | Error chaining with context |
| `unhandledrejection` event | Global unhandled promise listener |

---

## Interview Tips

- **Use `AggregateError` for `Promise.any`** — it's the only combinator that uses it. Know the constructor: `new AggregateError(errorsArray, message)`.
- **Distinguish error types with `instanceof`** — not `err.name` or `err.message` parsing.
- **Catch in Promise chains, not in `try/catch`** — `try/catch` around an async function without `await` won't catch Promise rejections.
- **Rethrow to let other handlers work** — only catch what you can handle.

---

## Related Articles

- [#18 — Promise Combinators](/articles/js-interview-promise-combinators)
- [#19 — Implement promisify()](/articles/js-interview-promisify)
- [#20 — Implement promiseTimeout()](/articles/js-interview-promise-timeout)
- [JS Foundations #6 — Error Handling](/articles/js-error-handling)
