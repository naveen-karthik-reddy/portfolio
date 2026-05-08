An LRU (Least Recently Used) cache combines a hash map with a doubly linked list to achieve O(1) get and put, evicting the least recently accessed item when at capacity. It's one of the most practical data structures — used in browsers, databases, and CDNs.

**Prerequisites:** [Data Structures #1 — Linked List](/articles/javascript-series/js-linked-list), [Data Structures #2 — Hash Table](/articles/javascript-series/js-hash-table)

---

## 1. The Key Insight — Two Data Structures Working Together

The hash map gives O(1) lookup by key. The doubly linked list maintains access order with O(1) move-to-front and remove-from-end. Together: O(1) for all operations.

```
Hash Map:                          Doubly Linked List:
{                                  HEAD (MRU)
  "a" → Node("a"),                  ↓
  "b" → Node("b"),                 Node("c")  ← most recently used
  "c" → Node("c"),                  ↓
}                                  Node("a")
                                    ↓
                                   Node("b")  ← least recently used
                                    ↓
                                   TAIL
```

---

## 2. Full LRU Cache Implementation

```js-exec
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // key → ListNode

    // Dummy head and tail simplify edge cases
    this.head = { key: null, value: null, prev: null, next: null };
    this.tail = { key: null, value: null, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _addToFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    if (!this.map.has(key)) return -1;

    const node = this.map.get(key);

    // Move to front (mark as most recently used)
    this._removeNode(node);
    this._addToFront(node);

    return node.value;
  }

  put(key, value) {
    // If key exists, update value and move to front
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      this._removeNode(node);
      this._addToFront(node);
      return;
    }

    // If at capacity, evict LRU (node before tail)
    if (this.map.size >= this.capacity) {
      const lru = this.tail.prev;
      this._removeNode(lru);
      this.map.delete(lru.key);
      console.log(`Evicted: ${lru.key}`);
    }

    // Add new node at front
    const node = { key, value, prev: null, next: null };
    this._addToFront(node);
    this.map.set(key, node);
  }

  print() {
    const items = [];
    let current = this.head.next;
    while (current !== this.tail) {
      items.push(`${current.key}:${current.value}`);
      current = current.next;
    }
    console.log("Cache:", items.join(" → "), "| Size:", this.map.size);
  }
}

// Test
const cache = new LRUCache(3);

cache.put("a", 1);
cache.put("b", 2);
cache.put("c", 3);
cache.print(); // c:3 → b:2 → a:1

console.log("Get 'a':", cache.get("a")); // 1 — a is now MRU
cache.print(); // a:1 → c:3 → b:2

cache.put("d", 4); // Evicts 'b' (LRU)
cache.print(); // d:4 → a:1 → c:3

console.log("Get 'b':", cache.get("b")); // -1 (evicted)
console.log("Get 'c':", cache.get("c")); // 3
```

---

## 3. LRU Using JavaScript `Map` (Simplest Implementation)

`Map` iterates in insertion order — you can abuse this for an LRU in just a few lines:

```js-exec
class LRUCacheSimple {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);    // Remove from current position
    this.map.set(key, value); // Re-insert at end (most recent)
    return value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      // First key in Map iteration order is the LRU
      const lru = this.map.keys().next().value;
      this.map.delete(lru);
      console.log(`Evicted: ${lru}`);
    }
    this.map.set(key, value);
  }

  print() {
    const items = [];
    for (const [k, v] of this.map) {
      items.push(`${k}:${v}`);
    }
    console.log("Cache:", items.join(" → "));
  }
}

const simpleCache = new LRUCacheSimple(3);
simpleCache.put("x", 10);
simpleCache.put("y", 20);
simpleCache.put("z", 30);
simpleCache.print(); // x:10 → y:20 → z:30

simpleCache.get("x"); // Make x MRU
simpleCache.put("w", 40); // Evict y (now LRU)
simpleCache.print(); // z:30 → x:10 → w:40
```

---

## 4. Why Doubly Linked List + Hash Map?

```js-exec
console.log("Operation     | Array        | Map-only (simple) | DLL + Map");
console.log("──────────────│──────────────│───────────────────│───────────");
console.log("get(key)      | O(n)         | O(1)              | O(1)");
console.log("put(key,val)  | O(n)         | O(1)              | O(1)");
console.log("evict LRU     | O(n)         | O(1)              | O(1)");
console.log("move-to-front | O(n)         | O(1)*             | O(1)");
console.log("");
console.log("* Map.delete + Map.set reorders — but it's 2 operations vs 1");
console.log("The Map-only version is fine for most real-world JS cases!");
```

---

## Key Takeaways

- LRU = Hash Map (O(1) lookup) + Doubly Linked List (O(1) reorder + O(1) evict from end).
- Dummy head/tail nodes eliminate null-check edge cases.
- JavaScript's `Map` iterates in insertion order — you can build an LRU with just `Map` in ~15 lines.
- Use `Map.keys().next().value` to get the least recently used key in a Map-based LRU.
- LRU caches are everywhere: browser cache, database buffer pool, CDN edge caches, Redis eviction.

---

**Next:** [Data Structures #4 — Binary Heap & Priority Queue](/articles/javascript-series/js-binary-heap-priority-queue) — implement a min-heap and priority queue with O(log n) operations.
