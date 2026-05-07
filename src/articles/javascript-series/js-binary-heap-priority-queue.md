A binary heap is a complete binary tree stored in an array where every parent is smaller (min-heap) or larger (max-heap) than its children. It's the data structure behind priority queues, used in Dijkstra's algorithm, task schedulers, and event loops.

---

## 1. The Array Layout — Parent/Child Index Math

The heap is stored as an array where for any node at index `i`:

- **Parent**: `Math.floor((i - 1) / 2)`
- **Left child**: `2 * i + 1`
- **Right child**: `2 * i + 2`

```js-exec
// Visual heap:      1
//                  /   \
//                 3     5
//                / \   /
//               7   9 8
//
// Array: [1, 3, 5, 7, 9, 8]

const heap = [1, 3, 5, 7, 9, 8];

function parent(i) { return Math.floor((i - 1) / 2); }
function left(i) { return 2 * i + 1; }
function right(i) { return 2 * i + 2; }

console.log("Parent of index 4 (value 9):", heap[parent(4)]); // 3
console.log("Children of index 1 (value 3):", heap[left(1)], heap[right(1)]); // 7, 9
```

---

## 2. Min-Heap Implementation

```js-exec
class MinHeap {
  constructor() {
    this.heap = [];
  }

  get size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0] ?? null;
  }

  insert(value) {
    this.heap.push(value);
    this._bubbleUp(this.heap.length - 1);
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop(); // Move last to root
    this._sinkDown(0);
    return min;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.heap[index] >= this.heap[parentIdx]) break;
      [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]];
      index = parentIdx;
    }
  }

  _sinkDown(index) {
    const length = this.heap.length;

    while (true) {
      const leftIdx = 2 * index + 1;
      const rightIdx = 2 * index + 2;
      let smallest = index;

      if (leftIdx < length && this.heap[leftIdx] < this.heap[smallest]) {
        smallest = leftIdx;
      }
      if (rightIdx < length && this.heap[rightIdx] < this.heap[smallest]) {
        smallest = rightIdx;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

// Test
const heap = new MinHeap();
[5, 3, 8, 1, 2, 7, 6, 4].forEach((n) => heap.insert(n));

console.log("Heap array:", heap.heap);
console.log("Extract min sequence:");
while (heap.size > 0) {
  console.log(" ", heap.extractMin()); // 1, 2, 3, 4, 5, 6, 7, 8
}
```

---

## 3. Priority Queue Built on Min-Heap

```js-exec
class PriorityQueue {
  constructor() {
    this.heap = []; // Each element: { value, priority }
  }

  enqueue(value, priority) {
    this.heap.push({ value, priority });
    this._bubbleUp(this.heap.length - 1);
  }

  dequeue() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop().value;

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._sinkDown(0);
    return min.value;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.heap[index].priority >= this.heap[parentIdx].priority) break;
      [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]];
      index = parentIdx;
    }
  }

  _sinkDown(index) {
    const length = this.heap.length;
    while (true) {
      const leftIdx = 2 * index + 1;
      const rightIdx = 2 * index + 2;
      let smallest = index;

      if (leftIdx < length && this.heap[leftIdx].priority < this.heap[smallest].priority) {
        smallest = leftIdx;
      }
      if (rightIdx < length && this.heap[rightIdx].priority < this.heap[smallest].priority) {
        smallest = rightIdx;
      }

      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

// Test — emergency room triage (lower number = higher priority)
const er = new PriorityQueue();
er.enqueue("Broken arm", 3);
er.enqueue("Heart attack", 1);
er.enqueue("Headache", 5);
er.enqueue("Stroke", 1);   // Same priority as heart attack
er.enqueue("Sprain", 4);

console.log("Treatment order:");
while (er.heap.length > 0) {
  console.log(`  Treating: ${er.dequeue()}`);
}
// Heart attack, Stroke, Broken arm, Sprain, Headache
```

---

## 4. Heapify — Build a Heap from an Array in O(n)

```js-exec
function heapify(arr) {
  // Start from last non-leaf node and sink down each
  const lastNonLeaf = Math.floor(arr.length / 2) - 1;

  for (let i = lastNonLeaf; i >= 0; i--) {
    sinkDown(arr, i, arr.length);
  }

  return arr;
}

function sinkDown(arr, index, length) {
  while (true) {
    const left = 2 * index + 1;
    const right = 2 * index + 2;
    let smallest = index;

    if (left < length && arr[left] < arr[smallest]) smallest = left;
    if (right < length && arr[right] < arr[smallest]) smallest = right;
    if (smallest === index) break;

    [arr[index], arr[smallest]] = [arr[smallest], arr[index]];
    index = smallest;
  }
}

const unsorted = [9, 4, 7, 1, 8, 3, 6, 2, 5];
heapify(unsorted);
console.log("Heapified:", unsorted);
// Unsorted is now a valid min-heap (not sorted, but parent < children)
```

---

## Key Takeaways

- Heap is stored as an **array** — no pointers needed. Parent at `(i-1)/2`, children at `2i+1` and `2i+2`.
- **Insert**: push to end, bubble up — O(log n).
- **Extract min**: swap root with last, pop, sink down — O(log n).
- **Heapify**: build heap from unsorted array in O(n) — start from last non-leaf and sink down.
- Priority queue = min-heap where each element has a priority value.
- JavaScript has no built-in heap/priority queue — this implementation is commonly needed for LeetCode problems.

---

**Next:** [Data Structures #5 — Trie (Prefix Tree)](/articles/javascript-series/js-trie-prefix-tree) — `insert`, `search`, `startsWith`, and autocomplete.
