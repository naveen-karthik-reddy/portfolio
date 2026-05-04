# Performance #21 - Web Workers & OffscreenCanvas

The main thread does everything: parse HTML, run JavaScript, handle input, calculate layout, paint. Every heavy computation you run there delays all of those other tasks. Web Workers move computation to a background thread, keeping the main thread free for the things only it can do.

---

## What Web Workers Are

A Web Worker is a JavaScript file running in a background thread. It has no access to the DOM, `window`, or `document` — it operates in isolation. Communication with the main thread happens through message passing.

```js
// main.js
const worker = new Worker('/workers/heavy.js');

worker.postMessage({ data: largeArray });

worker.onmessage = (event) => {
  console.log('Result:', event.data.result);
};

// workers/heavy.js
self.onmessage = (event) => {
  const result = expensiveComputation(event.data.data);
  self.postMessage({ result });
};
```

`postMessage` serializes data via the structured clone algorithm. For large payloads, this serialization cost can be significant.

---

## Transferable Objects

To avoid serialization overhead for large binary data (ArrayBuffers, ImageBitmaps), use **Transferable Objects**. Ownership is transferred to the worker — the original reference becomes unusable, but no copying occurs.

```js
const buffer = new ArrayBuffer(1024 * 1024 * 10); // 10MB

// ❌ Default: structured clone copies the entire 10MB buffer
worker.postMessage({ buffer });

// ✅ Transfer: zero-copy, ownership moves to the worker
worker.postMessage({ buffer }, [buffer]);

// buffer is now detached (unusable) in the main thread
console.log(buffer.byteLength); // 0
```

This is essential for image processing, audio worklets, and data pipelines passing large arrays between threads.

---

## What to Move to a Worker

Good candidates:
- JSON parsing of large API responses (`JSON.parse` on 5MB+ payloads)
- Cryptographic operations (hashing, encryption)
- Image processing and filtering
- CSV/spreadsheet parsing
- Physics simulations and complex calculations
- Compression/decompression

Bad candidates:
- Anything that needs the DOM
- Short, fast operations where message-passing overhead exceeds the computation time
- Code that needs synchronous access to shared state

Here's a concrete example of offloading JSON parsing — a common bottleneck on data-heavy dashboards:

```js
// ❌ Blocks main thread: parsing 8MB of JSON freezes the UI for ~200ms
const data = JSON.parse(hugeJsonString);
renderChart(data);

// ✅ Worker handles the parse; main thread stays responsive
// workers/json-parser.js
self.onmessage = ({ data: raw }) => {
  // JSON.parse runs in the worker thread, not blocking input/paint
  self.postMessage(JSON.parse(raw));
};

// main.js
const parser = new Worker('/workers/json-parser.js');
parser.postMessage(hugeJsonString);
parser.onmessage = ({ data }) => renderChart(data);
```

---

## Shared Workers and Service Workers

**Shared Workers** are shared across multiple tabs of the same origin. Useful for shared state like a WebSocket connection that all tabs read from.

**Service Workers** are a different concept — they intercept network requests and manage caching. They don't run heavy computation; they proxy the network.

---

## OffscreenCanvas

`OffscreenCanvas` moves canvas rendering to a Web Worker. This is the tool for heavy canvas operations (games, charts, video processing) that would otherwise block the main thread on every frame.

```js
// main.js — hand off the canvas to a worker
const canvas = document.getElementById('myCanvas');
const offscreen = canvas.transferControlToOffscreen();

const worker = new Worker('/workers/renderer.js');
// Transfer ownership — main thread can no longer draw to this canvas
worker.postMessage({ canvas: offscreen }, [offscreen]);
```

```js
// workers/renderer.js — all drawing happens off the main thread
self.onmessage = (event) => {
  const canvas = event.data.canvas;
  const ctx = canvas.getContext('2d');

  let x = 0;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x, 50, 50, 50);
    x = (x + 2) % canvas.width; // animate

    // requestAnimationFrame is available on self in workers
    self.requestAnimationFrame(render);
  }

  self.requestAnimationFrame(render);
};
```

Once `transferControlToOffscreen` is called, the main thread can no longer draw to that canvas. The worker owns it entirely — which means a 60fps animation loop in the worker never competes with user input handling on the main thread.

---

## Module Workers

Modern browsers support ES module syntax in workers via `{ type: 'module' }`:

```js
const worker = new Worker('/workers/processor.js', { type: 'module' });
```

This enables `import` statements inside the worker, making it easier to share utility code between the main thread and workers.

---

## Worker Pools

For tasks that recur frequently (processing a stream of items), creating a new Worker per task is expensive. A **worker pool** maintains a fixed set of workers and distributes work across them.

Libraries like `comlink` and `workerpool` handle this pattern, including promise-based message passing that removes the manual `onmessage` boilerplate.

```js
// comlink turns a worker module into a plain async API
// workers/processor.js
import { expose } from 'comlink';
const api = { process: (data) => expensiveComputation(data) };
expose(api);

// main.js
import { wrap } from 'comlink';
const worker = new Worker('/workers/processor.js', { type: 'module' });
const api = wrap(worker);

// Feels like a regular async function call
const result = await api.process(inputData);
```

The manual `postMessage` / `onmessage` dance is gone. Comlink handles the message routing and wraps everything in promises.

Workers are one of those tools that feel overly complex until you actually need them — then you can't imagine shipping without them.
