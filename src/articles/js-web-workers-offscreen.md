JavaScript is single-threaded — there's only one chef in the kitchen. If the chef spends 5 minutes chopping vegetables, no orders get taken, no food gets served, and customers (users) wait. **Web Workers** are like hiring a prep cook — you hand off the chopping (`postMessage`), and the chef keeps taking orders while the prep cook does the heavy lifting. When the prep cook is done, they hand the vegetables back (`onmessage`), and the chef plates the dish.

This article covers dedicated workers, `postMessage`, and transferables.

**Prerequisites:** [Async #1 — The Event Loop](/articles/javascript-series/js-event-loop-in-depth)

---

## 1. The Problem — Main Thread Blocking

```js-exec
// This blocks the page for ~2 seconds — no clicks, no scrolling, nothing
function heavyComputation() {
  console.log("Starting heavy computation...");
  const start = Date.now();

  // Simulate CPU-intensive work
  let result = 0;
  for (let i = 0; i < 1e7; i++) {
    result += Math.sqrt(i);
  }

  console.log(`Computation took ${Date.now() - start}ms, result: ${result.toFixed(2)}`);
}

// In a real page, this would freeze the UI
heavyComputation();
```

---

## 2. Creating a Worker — Move Work Off the Main Thread

```js-exec
// Worker code is in a separate file or blob URL:
const workerCode = `
  self.onmessage = function (event) {
    console.log('Worker received:', event.data);

    // Do heavy work here — this doesn't block the main thread!
    let result = 0;
    for (let i = 0; i < event.data.iterations; i++) {
      result += Math.sqrt(i);
    }

    // Send result back to the main thread
    self.postMessage({ result: result.toFixed(2) });
  };
`;

// Create worker from blob (in production, use a separate .js file)
const blob = new Blob([workerCode], { type: "application/javascript" });
const worker = new Worker(URL.createObjectURL(blob));

// Listen for messages from the worker
worker.onmessage = (event) => {
  console.log("Main thread received:", event.data);
};

worker.onerror = (err) => {
  console.error("Worker error:", err.message);
};

// Send work to the worker
worker.postMessage({ iterations: 1e7 });
console.log("Main thread is still responsive — immediate log after postMessage!");

// Clean up when done
setTimeout(() => {
  worker.terminate();
  console.log("Worker terminated");
}, 2000);
```

---

## 3. Transferable Objects — Zero-Copy Data Transfer

Transferables transfer ownership to the worker — the main thread loses access:

```js-exec
const transferWorkerCode = `
  self.onmessage = function (event) {
    // event.data is now owned by the worker — the main thread can't use it
    const buffer = event.data;
    const view = new Uint8Array(buffer);

    // Modify the data
    for (let i = 0; i < view.length; i++) {
      view[i] = view[i] * 2;
    }

    // Send back (transfer ownership back to main thread)
    self.postMessage(buffer, [buffer]);
  };
`;

const tBlob = new Blob([transferWorkerCode], { type: "application/javascript" });
const tWorker = new Worker(URL.createObjectURL(tBlob));

// Create a buffer
const buffer = new ArrayBuffer(4);
const view = new Uint8Array(buffer);
view[0] = 10;
view[1] = 20;

console.log("Before worker:", [...new Uint8Array(buffer)]);

tWorker.onmessage = (event) => {
  console.log("After worker:", [...new Uint8Array(event.data)]);
  // Original buffer is now unusable (transferred, not copied)
  // console.log(buffer.byteLength); // 0 — transferred away!
  tWorker.terminate();
};

// Transfer the buffer — zero copy, very fast for large data
tWorker.postMessage(buffer, [buffer]);
```

---

## 4. Worker Types Comparison

```js-exec
console.log("│ Type          │ Access           │ Shared scope? │ Lifecycle      │");
console.log("│───────────────│──────────────────│───────────────│────────────────│");
console.log("│ Dedicated     │ One page          │ No            │ Page lifetime  │");
console.log("│ Shared        │ Multiple pages    │ Shared state  │ Until all      │");
console.log("│               │ / iframes         │               │ pages close    │");
console.log("│ Service       │ Network proxy     │ No            │ Independent    │");
console.log("│               │ (caching, push)   │               │ (wakes up)     │");

// Shared Worker pattern:
// const sharedWorker = new SharedWorker("shared.js");
// sharedWorker.port.postMessage(data);
// sharedWorker.port.onmessage = (e) => console.log(e.data);
```

---

## 5. Worker Limitations

```js-exec
console.log("Workers CANNOT:");
console.log("  ✗ Access the DOM (no document, no window)");
console.log("  ✗ Use localStorage directly");
console.log("  ✗ Access the parent page's variables");
console.log("");
console.log("Workers CAN:");
console.log("  ✓ Use fetch(), WebSocket, IndexedDB");
console.log("  ✓ Use navigator (some properties)");
console.log("  ✓ Import other scripts via importScripts()");
console.log("  ✓ Use postMessage() to communicate with main thread");
```

---

## Key Takeaways

- Workers run on a **separate thread** — no shared scope, no DOM access.
- Communication is via **`postMessage`** — structured clone (copy) by default.
- Use **transferable objects** (`ArrayBuffer`, `MessagePort`) for zero-copy — the sender loses access.
- **Dedicated Workers** = one page. **Shared Workers** = multiple pages/tabs. **Service Workers** = network proxy.
- Workers are ideal for: heavy computation, image processing, parsing large files, cryptographic operations.
- Always call `worker.terminate()` when done to free resources.

---

**Next:** [Web APIs #3 — Intersection Observer](/articles/javascript-series/js-intersection-observer) — lazy load images and infinite scroll without scroll handlers.
