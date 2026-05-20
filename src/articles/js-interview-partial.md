`_.partial(fn, ...presetArgs)` pre-fills a function's leftmost arguments and returns a new function waiting for the rest. It's the simpler cousin of curry — one call, fixed positions, no arity tracking — but the placeholder extension makes it as powerful.

---

## What is `partial()`?

`partial(fn, ...presetArgs)` locks in some arguments now and returns a function that supplies the remaining ones later:

```js
const add = (a, b, c) => a + b + c;

const add5 = partial(add, 5);       // lock a = 5
add5(3, 2);                          // 10 — b=3, c=2

const add5and3 = partial(add, 5, 3); // lock a=5, b=3
add5and3(2);                          // 10
```

With a placeholder (`_`), you can fix arguments at any position — not just leftmost:

```js
const _ = partial.placeholder;

const greet = (greeting, name, punctuation) => `${greeting}, ${name}${punctuation}`;

const greetAlice = partial(greet, _, "Alice", _); // fix name, defer greeting and punctuation
greetAlice("Hello", "!");  // "Hello, Alice!"
greetAlice("Hi", ".");     // "Hi, Alice."
```

**Partial vs curry:**
- `partial` is a one-shot application — call it once with preset args, get back a plain function
- `curry` accumulates args across multiple calls and tracks remaining arity
- Use `partial` when you know which specific arguments to fix now; use `curry` for step-by-step argument supply

---

## The Problem

> "Implement `partial(fn, ...presetArgs)` that returns a new function. When called, it merges its arguments with the preset arguments from left to right and calls `fn`."

The interviewer extends:
> "Add placeholder support — `partial.placeholder` lets you skip preset positions, filling them from the later call's arguments."

---

## Thought Process

Without placeholders, this is just argument prepending: `(...laterArgs) => fn(...presetArgs, ...laterArgs)`.

With placeholders, it's the same merge operation as placeholder curry — scan `presetArgs` left-to-right, replacing `_` entries with later args in order. Any unconsumed later args are appended.

The key difference from curry: **partial doesn't count arity**. It calls `fn` immediately when you invoke the returned function — there's no "waiting until we have enough args." You get one deferred call, not a chain.

---

## Step 1 — Base Implementation

```js-exec
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

// Test
const add = (a, b, c) => a + b + c;
const add10 = partial(add, 10);
console.log(add10(3, 2));   // 15

const multiply = (x, y) => x * y;
const double = partial(multiply, 2);
const triple = partial(multiply, 3);
console.log(double(5));     // 10
console.log(triple(5));     // 15

// Preserves this context
function greet(greeting, name) {
  return `${greeting}, ${name}`;
}
const sayHello = partial(greet, "Hello");
console.log(sayHello("Alice")); // "Hello, Alice"
```

---

## Step 2 — With Placeholder Support

```js-exec
const _ = Symbol("placeholder");

function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    const next = [...laterArgs]; // consume from front

    // Replace placeholders in presetArgs with incoming laterArgs
    const merged = presetArgs.map(arg =>
      arg === _ && next.length > 0 ? next.shift() : arg
    );

    // Any unconsumed later args are appended
    return fn(...merged, ...next);
  };
}

partial.placeholder = _;

// Test
const greet = (greeting, name, punct) => `${greeting}, ${name}${punct}`;

const greetAlice = partial(greet, _, "Alice", _); // defer greeting and punct
console.log(greetAlice("Hello", "!"));  // "Hello, Alice!"
console.log(greetAlice("Hi", "."));     // "Hi, Alice."

// Mix of fixed and placeholder args
const log = (level, timestamp, message) => `[${level}] ${timestamp}: ${message}`;
const logError = partial(log, "ERROR", _); // fix level, defer timestamp and message
console.log(logError("2024-01-01", "Something broke")); // "[ERROR] 2024-01-01: Something broke"
```

---

## Step 3 — Edge Cases

```js-exec
const _ = Symbol("placeholder");

function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    const next = [...laterArgs];
    const merged = presetArgs.map(arg =>
      arg === _ && next.length > 0 ? next.shift() : arg
    );
    return fn.apply(this, [...merged, ...next]);
  };
}

partial.placeholder = _;

// No preset args — equivalent to fn.bind(null)
const identity = x => x;
const passThrough = partial(identity);
console.log(passThrough(42));   // 42

// All placeholders — equivalent to a noop wrapper
const add3 = (a, b, c) => a + b + c;
const deferred = partial(add3, _, _, _);
console.log(deferred(1, 2, 3)); // 6

// Placeholder with no later arg to fill it — stays as-is (passes undefined)
const show = (a, b) => `${a}-${b}`;
const withPlaceholder = partial(show, _, "B");
console.log(withPlaceholder("A")); // "A-B"
console.log(withPlaceholder());    // "undefined-B" — placeholder unfilled

// Preserves `this` context via apply
function Point(x, y) { this.x = x; this.y = y; }
Point.prototype.translate = function(dx, dy) {
  return { x: this.x + dx, y: this.y + dy };
};
const p = new Point(1, 2);
const moveRight = partial(Point.prototype.translate, 5);
console.log(moveRight.call(p, 0)); // { x: 6, y: 2 }
```

---

## Full Solution

```js-exec
const _ = Symbol("placeholder");

function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    const next = [...laterArgs];

    const merged = presetArgs.map(arg =>
      arg === _ && next.length > 0 ? next.shift() : arg
    );

    return fn.apply(this, [...merged, ...next]);
  };
}

partial.placeholder = _;

// Validation
const volume = (l, w, h) => l * w * h;
const _ = partial.placeholder;

console.log(partial(volume, 2)(3, 4));       // 24 — fix length
console.log(partial(volume, 2, 3)(4));       // 24 — fix l, w
console.log(partial(volume, _, 3, _)(2, 4)); // 24 — fix width, defer l and h
console.log(partial(volume, _, _, 4)(2, 3)); // 24 — fix height, defer l and w
```

---

## What Interviewers Are Testing

- **Argument prepending** — the basic case is just spread: `fn(...presetArgs, ...laterArgs)`
- **Placeholder merge** — same `_`-as-Symbol + left-to-right fill pattern as placeholder curry, but applied once
- **`apply(this, ...)` for context** — using `fn.apply(this, merged)` ensures the partially-applied function works as a method
- **Partial vs curry distinction** — partial is one-shot (call the result once to invoke); curry is multi-step (accumulates until arity satisfied)
- **`partial.placeholder` as a property** — exposing `_` so callers can import a single reference

---

## Complexity

| | Time | Space |
|-|------|-------|
| `partial(fn, ...presetArgs)` | O(1) | O(P) — stores P preset args |
| Calling the returned function | O(P + L) — merge step | O(P + L) |

---

## Interview Tips

- **State the one-sentence difference from curry** — "Partial fills the leftmost args now and returns a plain function. Curry wraps the function and chains calls until all args are accumulated."
- **Sketch the merge on a whiteboard** — `presetArgs = [_, "Alice", _]`, `laterArgs = ["Hello", "!"]` → `merged = ["Hello", "Alice", "!"]`. The visual makes the algorithm obvious.
- **Use `fn.apply(this, merged)` not `fn(...merged)`** — supports partial application on methods where `this` matters.
- **Compare to `Function.prototype.bind`** — "The built-in `bind` does the same thing: `fn.bind(null, ...presetArgs)`. `partial` adds placeholder support on top."

---

## Related Questions

- [Implement curry() — Fixed Arity](/articles/js-interview-curry)
- [Implement curry() with Placeholders](/articles/js-interview-curry-placeholder)
- [Implement compose() & pipe()](/articles/js-interview-compose-pipe)
