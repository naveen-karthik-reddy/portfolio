Implementing a browser history stack tests class design and the edge case that makes it non-trivial: pushing a new page while you're in the middle of the history should discard all forward entries — exactly how real browsers behave.

---

## What is a Browser History?

A browser history tracks visited URLs as a stack with a pointer. Three operations:
- `push(url)` — navigate to a new URL, discarding any forward history
- `back()` — move the pointer one step backward
- `forward()` — move the pointer one step forward

The pointer (current index) is what makes this different from a plain stack. You're not always at the top — you can go back, then forward, or push a new page from the middle.

The critical rule: **pushing from a non-top position truncates forward history**. If you go Back → Back → push("/new"), the two forward entries are gone. This matches the real browser's History API.

---

## The Problem

> "Implement a `BrowserHistory` class with `push(url)`, `back()`, `forward()`, and a `current` property. `push` from a non-top position should discard forward entries."

The interviewer extends:
> "Add a `go(n)` method — `go(-2)` goes 2 steps back, `go(1)` goes 1 step forward. Add `canGoBack` and `canGoForward` boolean properties."

---

## Thought Process

The data structure is an array with a pointer (`index`):
- `push`: truncate array at `index + 1`, append new URL, advance index
- `back`: `index--` (bounded at 0)
- `forward`: `index++` (bounded at `history.length - 1`)
- `go(n)`: `index = clamp(index + n, 0, length - 1)`
- `current`: `history[index]`

Use private fields (`#`) to prevent external mutation of the history array.

---

## Step 1 — Base Implementation

```js-exec
class BrowserHistory {
  #history = [];
  #index = -1;

  constructor(initialUrl) {
    if (initialUrl) this.push(initialUrl);
  }

  get current() {
    return this.#index >= 0 ? this.#history[this.#index] : null;
  }

  push(url) {
    // Discard forward entries — truncate everything after current position
    this.#history = this.#history.slice(0, this.#index + 1);
    this.#history.push(url);
    this.#index++;
    return this; // enable chaining
  }

  back() {
    if (this.#index > 0) this.#index--;
    return this.current;
  }

  forward() {
    if (this.#index < this.#history.length - 1) this.#index++;
    return this.current;
  }
}

// Test
const h = new BrowserHistory("/home");
h.push("/about");
h.push("/contact");

console.log(h.current);   // "/contact"
console.log(h.back());    // "/about"
console.log(h.back());    // "/home"
console.log(h.forward()); // "/about"

// Push from middle — discards "/contact"
h.push("/new");
console.log(h.current);   // "/new"
console.log(h.forward()); // "/new" — no forward history to go to
```

---

## Step 2 — `go(n)`, `canGoBack`, `canGoForward`

```js-exec
class BrowserHistory {
  #history = [];
  #index = -1;

  constructor(initialUrl) {
    if (initialUrl) this.push(initialUrl);
  }

  get current() {
    return this.#index >= 0 ? this.#history[this.#index] : null;
  }

  get canGoBack()    { return this.#index > 0; }
  get canGoForward() { return this.#index < this.#history.length - 1; }

  push(url) {
    this.#history = this.#history.slice(0, this.#index + 1);
    this.#history.push(url);
    this.#index++;
    return this;
  }

  back()    { return this.go(-1); }
  forward() { return this.go(1); }

  go(delta) {
    this.#index = Math.max(0, Math.min(this.#history.length - 1, this.#index + delta));
    return this.current;
  }
}

// Test
const h = new BrowserHistory("/");
h.push("/a").push("/b").push("/c").push("/d");
// history: ["/", "/a", "/b", "/c", "/d"], index: 4

console.log(h.go(-2));       // "/b" — two steps back
console.log(h.canGoBack);    // true
console.log(h.canGoForward); // true
console.log(h.go(1));        // "/c"
console.log(h.go(100));      // "/d" — clamped to end
console.log(h.go(-100));     // "/" — clamped to start
console.log(h.canGoBack);    // false
```

---

## Step 3 — Edge Cases

```js-exec
class BrowserHistory {
  #history = [];
  #index = -1;

  constructor(initialUrl) { if (initialUrl) this.push(initialUrl); }
  get current()      { return this.#index >= 0 ? this.#history[this.#index] : null; }
  get canGoBack()    { return this.#index > 0; }
  get canGoForward() { return this.#index < this.#history.length - 1; }
  push(url)  { this.#history = this.#history.slice(0, this.#index + 1); this.#history.push(url); this.#index++; return this; }
  go(delta)  { this.#index = Math.max(0, Math.min(this.#history.length - 1, this.#index + delta)); return this.current; }
  back()     { return this.go(-1); }
  forward()  { return this.go(1); }
}

// Empty history
const empty = new BrowserHistory();
console.log(empty.current);    // null
console.log(empty.back());     // null — no-op
console.log(empty.canGoBack);  // false

// Single entry
const single = new BrowserHistory("/only");
console.log(single.back());    // "/only" — stays put
console.log(single.forward()); // "/only" — stays put
console.log(single.canGoBack);    // false
console.log(single.canGoForward); // false

// Duplicate pushes are allowed — same URL can appear twice
const dup = new BrowserHistory("/home");
dup.push("/home");
console.log(dup.back()); // "/home" — still goes back
```

---

## Full Solution

```js-exec
class BrowserHistory {
  #history = [];
  #index = -1;

  constructor(initialUrl) {
    if (initialUrl) this.push(initialUrl);
  }

  get current()      { return this.#index >= 0 ? this.#history[this.#index] : null; }
  get canGoBack()    { return this.#index > 0; }
  get canGoForward() { return this.#index < this.#history.length - 1; }

  push(url) {
    this.#history = this.#history.slice(0, this.#index + 1);
    this.#history.push(url);
    this.#index++;
    return this;
  }

  go(delta) {
    this.#index = Math.max(0, Math.min(this.#history.length - 1, this.#index + delta));
    return this.current;
  }

  back()    { return this.go(-1); }
  forward() { return this.go(1); }
}

const h = new BrowserHistory("/home");
h.push("/about").push("/contact");
console.log(h.back(), h.back()); // "/about" "/home"
h.push("/new");
console.log(h.canGoForward);     // false — forward history was cleared
```

---

## What Interviewers Are Testing

- **Truncation on push** — the non-trivial rule: `push` from a non-top position discards forward entries. Missing this is the most common mistake.
- **Private fields** — using `#` to prevent external tampering with the history array
- **`go(n)` generalization** — implementing `back` and `forward` as `go(-1)` / `go(1)` shows you recognize the abstraction
- **Boundary clamping** — `go(-100)` should stop at the beginning, not go negative
- **Getters for `canGoBack/Forward`** — boolean properties computed on-demand, not stored state

---

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `push` | O(H) — slice to truncate | O(H) total |
| `back`, `forward`, `go` | O(1) | O(1) |

---

## Interview Tips

- **State the truncation rule immediately** — "The tricky part is that `push` from a non-top position discards all forward entries. I'll handle that with `slice(0, index + 1)` before appending."
- **Use private fields** — shows modern JS knowledge and good encapsulation. "I'm using `#history` so nothing outside the class can corrupt the array."
- **Implement `go(n)` first, then delegate** — cleaner than implementing `back` and `forward` independently with duplicate logic.
- **Mention the real API** — "This mirrors the browser's `window.history.pushState()`, `history.back()`, `history.forward()`, and `history.go(n)`."

---

## Related Questions

- [Implement an EventEmitter with on, off, emit & once](/articles/js-interview-event-emitter)
- [Implement squash() — Flatten Nested Objects to Dot Paths](/articles/js-interview-squash-object)
- [Implement deepEqual() for Structural Comparison](/articles/js-interview-deep-equal)
