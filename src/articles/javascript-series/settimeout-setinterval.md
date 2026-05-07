Browsers give you two built-in functions to schedule code in the future: **setTimeout** runs a callback once after a delay, and **setInterval** runs it repeatedly. They look simple, but understanding how they actually work — and where they fit inside the event loop — changes how you write async code.

Every example below is **editable and runnable**. Click **Edit** to modify the code, **▶ Run** to execute it, and **Stop** to halt any ongoing intervals.

---

## 1. setTimeout — Run Code Once After a Delay

`setTimeout(callback, delayMs)` schedules `callback` to run *at least* `delayMs` milliseconds from now. It returns a numeric ID you can use to cancel it.

```js-exec
console.log("Script starts");

setTimeout(() => {
  console.log("Runs after 1 second");
}, 1000);

console.log("Script ends — timer is still waiting");
```

Notice the order: "Script ends" prints before the timeout fires. The callback is queued as a **task** and only runs after the current synchronous code completes.

---

## 2. Passing Arguments to the Callback

You can pass extra arguments directly to `setTimeout` — they get forwarded to your callback:

```js-exec
function greet(name, role) {
  console.log(`Hello, ${name}! You are a ${role}.`);
}

setTimeout(greet, 800, "Naveen", "frontend engineer");
```

This avoids wrapping in an arrow function just to pass data.

---

## 3. clearTimeout — Cancel Before It Fires

`setTimeout` returns an ID. Pass it to `clearTimeout(id)` to cancel the pending callback before it runs:

```js-exec
const id = setTimeout(() => {
  console.log("This will NEVER print");
}, 2000);

clearTimeout(id);
console.log("Timer cancelled immediately");
```

If the timer has already fired, `clearTimeout` is a no-op — safe to call regardless.

---

## 4. setInterval — Repeat on a Fixed Schedule

`setInterval(callback, delayMs)` fires the callback every `delayMs` milliseconds until you stop it. It also returns a numeric ID.

```js-exec
let count = 0;

const id = setInterval(() => {
  count++;
  console.log(`Tick #${count}`);

  if (count === 5) {
    clearInterval(id);
    console.log("Stopped after 5 ticks");
  }
}, 500);
```

Always store the ID — without it you cannot stop the interval.

---

## 5. clearInterval — Stop a Running Interval

`clearInterval(id)` halts an interval. You can call it from inside the callback (as above) or from any external trigger:

```js-exec
let seconds = 0;
const id = setInterval(() => {
  seconds++;
  console.log(`Elapsed: ${seconds}s`);
}, 1000);

// Stop automatically after 4 seconds
setTimeout(() => {
  clearInterval(id);
  console.log("Interval cleared by setTimeout");
}, 4100);
```

Combining `setTimeout` + `clearInterval` is a clean pattern for "run for N seconds then stop."

---

## 6. The Event Loop — Why setTimeout(0) Isn't Instant

Both `setTimeout` and `setInterval` don't run inside the JS engine — they're **Web APIs**. When the delay expires, the browser pushes the callback into the **task queue**. The event loop only picks it up once the call stack is empty.

That means `setTimeout(fn, 0)` still runs *after* all synchronous code in the current script:

```js-exec
console.log("1 — sync start");

setTimeout(() => console.log("3 — setTimeout(0) fires last"), 0);

console.log("2 — sync end");
```

Output is always `1 → 2 → 3`. The "0ms" delay means "as soon as the stack is free," not "right now."

---

## 7. Nested setTimeout vs setInterval — The Drift Problem

`setInterval` fires every N ms from the *start* of the previous call, **regardless of how long the callback takes**. If your callback is slow, ticks can overlap or bunch up.

**Nested setTimeout** reschedules itself *after* the callback completes, giving you a guaranteed gap between runs:

```js-exec
// setInterval: fires every 300ms regardless of callback duration
let siCount = 0;
const siStart = Date.now();
const siId = setInterval(() => {
  siCount++;
  const drift = Date.now() - siStart - siCount * 300;
  console.log(`setInterval tick ${siCount} — drift: ${drift}ms`);
  if (siCount === 4) clearInterval(siId);
}, 300);

// Nested setTimeout: gap is always 300ms after previous callback ends
let nstCount = 0;
function scheduleNext() {
  setTimeout(() => {
    nstCount++;
    console.log(`nested setTimeout tick ${nstCount}`);
    if (nstCount < 4) scheduleNext();
  }, 300);
}
scheduleNext();
```

For most UI work the difference is invisible. For precise sequencing — like an animation step that does heavy work — nested `setTimeout` gives you tighter control.

---

## 8. Minimum Delay — The 4ms Floor

Browsers clamp timer delays to a **minimum of ~4ms** for nested timers (after the 5th nesting level). A delay of `0` is rounded up too. This is per the HTML spec to prevent CPU-hammering infinite loops.

```js-exec
const start = Date.now();
let count = 0;

function nested() {
  count++;
  const elapsed = Date.now() - start;
  if (count <= 6) {
    console.log(`Nesting level ${count} — ${elapsed}ms elapsed`);
    setTimeout(nested, 0);
  }
}

setTimeout(nested, 0);
```

You'll see the first few ticks fire near 0ms, then the delay starts accumulating as the browser enforces the floor.

---

## 9. Practical — Countdown Timer

A classic use case: count down from N to 0 using `setInterval`, then stop.

```js-exec
let remaining = 5;
console.log(`Starting countdown from ${remaining}...`);

const id = setInterval(() => {
  console.log(remaining);
  remaining--;

  if (remaining < 0) {
    clearInterval(id);
    console.log("Liftoff! 🚀");
  }
}, 700);
```

Try editing the starting value or the interval delay and hit **▶ Run** again. Hit **Stop** if the count runs longer than expected.

---

## Key Takeaways

| | `setTimeout` | `setInterval` |
|---|---|---|
| **Fires** | Once, after delay | Repeatedly, every delay |
| **Cancel** | `clearTimeout(id)` | `clearInterval(id)` |
| **Drift risk** | None | Yes — callback duration isn't counted |
| **Alternative** | — | Nested `setTimeout` for drift-free repeats |

- Timers are Web APIs — they schedule **tasks**, not microtasks. They run after the current call stack clears.
- `setTimeout(fn, 0)` is useful for deferring work to after a render cycle, not for "immediate" execution.
- Always clear intervals you no longer need — forgotten intervals are a classic source of memory leaks.
