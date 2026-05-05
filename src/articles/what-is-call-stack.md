The **call stack** is the data structure the JavaScript engine uses to track function execution. When you call a function, it's pushed onto the stack. When it returns, it's popped off. The stack can only hold one frame at a time — this is what "single-threaded" means.

---

## How It Works

```js
function multiply(a, b) {
  return a * b;
}

function square(n) {
  return multiply(n, n);
}

function printSquare(n) {
  const result = square(n);
  console.log(result);
}

printSquare(4);
```

The call stack over time:

```text
1. (empty)
2. printSquare(4)
3. printSquare(4) → square(4)
4. printSquare(4) → square(4) → multiply(4, 4)
5. printSquare(4) → square(4)        (multiply returns 16, popped)
6. printSquare(4)                     (square returns 16, popped)
7. (empty)                            (printSquare returns, popped)
```

Each function call creates a **stack frame** containing the function's arguments, local variables, and return address. When the function finishes, the frame is discarded. The engine always runs the topmost frame — the function currently executing.

---

## Stack Overflow

The call stack has a fixed maximum size. If functions call themselves recursively without an exit condition, the stack overflows:

```js
function ping() {
  return pong(); // ping calls pong, pong calls ping, ...
}

function pong() {
  return ping();
}

ping(); // RangeError: Maximum call stack size exceeded
```

The same error occurs with deep recursion even when the logic is correct — a recursive function that calls itself 50,000 times will overflow regardless of whether it has a base case. The limit varies by engine (typically ~10,000–50,000 frames).

---

## The Stack and the Event Loop

The call stack is directly connected to the event loop. The event loop's only job is: **when the call stack is empty, pick the next task from the queue and push it onto the stack.**

```js
console.log('1');

setTimeout(() => {
  console.log('2'); // queued as a task — only runs when the stack is empty
}, 0);

console.log('3');

// Output: 1, 3, 2
```

`setTimeout(fn, 0)` doesn't run `fn` immediately. It queues `fn` as a task, and the event loop only picks it up when the call stack is completely empty. All synchronous code must finish first.

---

## Blocking the Stack

A busy call stack blocks everything — the event loop can't pick up new tasks until the stack is clear. This is why a long-running function freezes the page:

```js
// Blocks the stack for ~2 seconds — no clicks, no scroll, no paint
function heavyWork() {
  const start = Date.now();
  while (Date.now() - start < 2000) {
    // spinning
  }
}
```

The browser can't render a frame or handle user input because the event loop is waiting for the stack to empty. This is the mechanism behind long tasks and poor INP scores.

---

## Stack Traces

When an error is thrown, the engine captures the current call stack as a **stack trace** — the sequence of function calls that led to the error, from bottom (entry point) to top (where it threw):

```text
Error: something went wrong
    at multiply (app.js:2)
    at square (app.js:6)
    at printSquare (app.js:10)
    at <anonymous> (app.js:13)
```

Each line is a stack frame. The trace reads bottom-to-top: the anonymous script called `printSquare`, which called `square`, which called `multiply`, where the error occurred.

---

The call stack is the simplest part of JavaScript's execution model, but understanding it is the prerequisite for understanding the event loop, async code, and why long tasks freeze the UI. If the stack is busy, nothing else runs — period.
