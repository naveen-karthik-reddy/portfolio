JavaScript's garbage collector automatically frees memory, but certain patterns prevent it from recognizing memory as collectible. This article covers how mark-and-sweep works, the four classic leak patterns, and how to debug memory issues.

**Prerequisites:** [V8 #1 — JIT Compilation](/articles/javascript-series/js-v8-jit-compilation), [JS Foundations #3 — Closures](/articles/javascript-series/js-closures-lexical-scope)

---

## 1. Mark-and-Sweep — How GC Works

The garbage collector periodically finds objects that are **no longer reachable** from the root (global object, call stack):

```js-exec
// Root → global scope
let user = { name: "Naveen" }; // { name: "Naveen" } is reachable via 'user'

user = null; // The object is now unreachable — eligible for GC

// The mark-and-sweep algorithm:
// 1. Mark: Start from root, mark every reachable object
// 2. Sweep: Free everything that wasn't marked
// 3. Compact (optional): Defragment memory

console.log("Set to null — the original object will be garbage collected");
```

Generational GC: V8 splits the heap into **new space** (young, short-lived objects) and **old space** (survived multiple GC cycles). Most objects die young — the scavenger (minor GC) handles them cheaply.

---

## 2. Leak Pattern #1 — Forgotten Timers and Intervals

The most common SPA leak — intervals that keep running after a component unmounts:

```js-exec
// Simulating a component that mounts and unmounts
function mountComponent() {
  let data = { items: new Array(1000).fill("x") };

  const intervalId = setInterval(() => {
    // This closure captures 'data' — the array stays alive
    if (data.items.length === 0) clearInterval(intervalId);
  }, 1000);

  // ❌ Forgot to clean up!
  // In a real SPA, if the component unmounts, this interval — and the
  // large 'data' object it references — live forever.

  return () => clearInterval(intervalId); // ✅ Always return a cleanup
}

const unmount = mountComponent();
unmount(); // Proper cleanup
console.log("Always clear intervals in componentWillUnmount or useEffect cleanup");

// ✅ Good pattern:
let timerId;
function startTimer() {
  timerId = setInterval(tick, 1000);
}
function stopTimer() {
  clearInterval(timerId);
}
stopTimer();
```

---

## 3. Leak Pattern #2 — Detached DOM Nodes

A JavaScript reference to a removed DOM element keeps the element in memory:

```js-exec
// Simulating the problem (can't actually create DOM in this sandbox):
const detachedNodes = [];

function addElement() {
  const el = { type: "div", content: "Hello" }; // Simulated DOM element
  detachedNodes.push(el); // Stored in JS array
  return el;
}

function removeElement(el) {
  // "Remove" from "DOM" — but still referenced in detachedNodes!
  console.log("Element 'removed' but still in detachedNodes:", detachedNodes.length);
}

const el = addElement();    // Element is in the "DOM" and the JS array
removeElement(el);          // Remove from "DOM" — but array still holds it!

// ✅ Fix: Remove from the tracking array when removing from DOM
detachedNodes.length = 0;
console.log("Always remove JS references when removing DOM elements");
```

---

## 4. Leak Pattern #3 — Closure Capturing Large Data

Closures capture the entire scope, not just the variables they use:

```js-exec
function processData(largeDataset) {
  const relevant = largeDataset.summary; // We only need this

  // ❌ The closure captures the ENTIRE scope, including largeDataset
  return function () {
    return relevant; // Uses summary, but largeDataset is still held in memory!
  };
}

// ✅ Fix: Only capture what you need
function processDataBetter(largeDataset) {
  const summary = largeDataset.summary; // Extract what you need
  // largeDataset can be GC'd now — we only hold a reference to summary

  return function () {
    return summary; // Only summary is captured
  };
}

const bigData = { items: new Array(1e6).fill("data"), summary: "OK" };
const getter = processDataBetter(bigData);
bigData = null; // bigData CAN be GC'd — only summary is captured

console.log("Capture only what closures actually need");
```

---

## 5. Leak Pattern #4 — Unbounded Caches

Caches that grow without limit eventually exhaust memory:

```js-exec
// ❌ Unbounded cache — grows forever
const cache = {};

function fetchResource(url) {
  if (cache[url]) return cache[url];
  const data = `Data for ${url}`;
  cache[url] = data; // Never cleaned up!
  return data;
}

// Use it for a while — cache fills up
fetchResource("/api/1");
fetchResource("/api/2");
// ...thousands more calls → memory exhausted

// ✅ Bounded cache with LRU eviction
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    this.cache.delete(key);    // Move to end (most recently used)
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest); // Evict least recently used
    }
    this.cache.set(key, value);
  }
}

const safeCache = new LRUCache(3);
safeCache.set("a", 1);
safeCache.set("b", 2);
safeCache.set("c", 3);
safeCache.set("d", 4); // "a" evicted
console.log("a evicted?", safeCache.get("a") === undefined); // true
```

---

## 6. Detecting Leaks — The Heap Snapshot Pattern

In Chrome DevTools, the Memory panel offers heap snapshots:

```js-exec
// How to find leaks:
// 1. Take a heap snapshot (Memory tab → Heap snapshot → Take snapshot)
// 2. Perform an action (e.g., navigate in your SPA)
// 3. Reverse the action (go back)
// 4. Take another heap snapshot
// 5. Compare: objects that increased from snapshot 1 → snapshot 2 are potential leaks

// Shallow size = size of the object itself
// Retained size = size of the object + all objects it keeps alive

console.log("In Chrome DevTools:");
console.log("  Memory → Heap snapshot → Take snapshot → Perform action → Take another → Compare");
```

---

## Key Takeaways

| Leak Pattern | Cause | Fix |
|---|---|---|
| Forgotten timers | `setInterval` without `clearInterval` | Cleanup in `useEffect` return / `componentWillUnmount` |
| Detached DOM | JS reference to removed element | Null out references when DOM elements are removed |
| Closure captures | Inner function captures entire outer scope | Extract only needed values before closing over |
| Unbounded caches | Map/Object that only ever grows | Use LRU cache with max size; TTL-based eviction |

- GC is **nondeterministic** — you can't force it (`window.gc()` only in dev mode with `--expose-gc`).
- Use WeakMap/WeakSet for object-associated data that shouldn't prevent GC.
- Heap snapshots are the primary debugging tool — learn to compare before/after.

---

**Next:** [Engine #1 — Hoisting & TDZ Internals](/articles/javascript-series/js-hoisting-tdz-deep) — what the engine actually does during parsing and execution.
