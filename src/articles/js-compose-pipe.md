Function composition is the core of functional programming — combining simple functions to build complex transformations. `compose` runs right-to-left, `pipe` runs left-to-right. This article implements both and shows real-world transformation pipelines.

**Prerequisites:** [Functions #2 — Currying](/articles/javascript-series/js-currying-partial-application)

---

## 1. `compose()` — Right-to-Left

`compose(f, g)(x)` means `f(g(x))` — apply g first, then f:

```js-exec
function compose(...fns) {
  return function (value) {
    return fns.reduceRight((acc, fn) => fn(acc), value);
  };
}

const addOne = (x) => x + 1;
const double = (x) => x * 2;
const square = (x) => x * x;

// compose(square, double, addOne)(3)
// = square(double(addOne(3)))
// = square(double(4))
// = square(8)
// = 64
const transform = compose(square, double, addOne);
console.log("compose:", transform(3)); // 64
```

---

## 2. `pipe()` — Left-to-Right (More Readable)

`pipe(f, g)(x)` means `g(f(x))` — execution order matches reading order:

```js-exec
function pipe(...fns) {
  return function (value) {
    return fns.reduce((acc, fn) => fn(acc), value);
  };
}

// pipe(addOne, double, square)(3)
// = square(double(addOne(3)))
// Same result, but reads left-to-right
const transform = pipe(addOne, double, square);
console.log("pipe:", transform(3)); // 64

// pipe is often more readable for multi-step transformations:
const process = pipe(
  (str) => str.trim(),
  (str) => str.toLowerCase(),
  (str) => str.replace(/\s+/g, "-"),
  (str) => `slug-${str}`
);

console.log("Processed:", process("  Hello WORLD  ")); // "slug-hello-world"
```

---

## 3. Handling Multiple Arguments — Pipe with First Function

```js-exec
function pipeMulti(...fns) {
  return function (...args) {
    // First function receives all arguments
    let result = fns[0].apply(this, args);

    // Remaining functions receive the previous result
    for (let i = 1; i < fns.length; i++) {
      result = fns[i](result);
    }

    return result;
  };
}

const sum = (a, b) => a + b;
const format = (n) => `Total: $${n}`;

const calculate = pipeMulti(sum, double, format);
console.log(calculate(10, 20)); // "Total: $60" — sum(10,20)=30, double(30)=60, format(60)
```

---

## 4. Async Pipe — Chain Async Functions

```js-exec
function asyncPipe(...fns) {
  return async function (value) {
    let result = value;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
}

// Test with fake async operations
const fetchUser = async (id) => {
  console.log(`Fetching user ${id}...`);
  return { id, name: "Naveen", posts: [1, 2, 3] };
};

const fetchPosts = async (user) => {
  console.log(`Fetching posts for ${user.name}...`);
  return { ...user, posts: user.posts.map((id) => `Post #${id}`) };
};

const formatResponse = async (data) => ({
  status: "ok",
  data,
});

const getUserWithPosts = asyncPipe(fetchUser, fetchPosts, formatResponse);

getUserWithPosts(42).then(console.log);
// { status: "ok", data: { id: 42, name: "Naveen", posts: ["Post #1", "Post #2", "Post #3"] } }
```

---

## 5. Pipe with Error Handling — Railway Pattern

```js-exec
function safePipe(...fns) {
  return function (value) {
    try {
      return fns.reduce((acc, fn) => {
        // If previous step returned an Error, stop processing
        if (acc instanceof Error) return acc;
        return fn(acc);
      }, value);
    } catch (err) {
      return err;
    }
  };
}

const parseJSON = (str) => JSON.parse(str);
const getUserId = (obj) => obj.user.id;
const formatDisplay = (id) => `User #${id}`;

const pipeline = safePipe(parseJSON, getUserId, formatDisplay);

console.log(pipeline('{"user":{"id":42}}')); // "User #42"
console.log(pipeline('invalid json'));        // SyntaxError (not thrown — returned)
console.log(pipeline('{"noUser":true}'));    // TypeError (not thrown — returned)
```

---

## Key Takeaways

- **`compose(f, g, h)(x)`** = `f(g(h(x)))` — right-to-left execution.
- **`pipe(f, g, h)(x)`** = `h(g(f(x)))` — left-to-right, reads in natural order.
- Use `reduce`/`reduceRight` for the implementation — concise and correct.
- **Async pipe** chains promise-returning functions sequentially.
- **Safe pipe** stops on error — the foundation of the Either monad and railway-oriented programming.

---

**Next:** [FP #2 — `transduce()` — Map + Filter in One Pass](/articles/javascript-series/js-transduce) — fuse map and filter into a single reduction for better performance.
