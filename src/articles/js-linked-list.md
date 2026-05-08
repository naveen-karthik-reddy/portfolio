A linked list is a sequence of nodes where each node points to the next. Unlike arrays, insertion and deletion at the head are O(1). This article implements singly and doubly linked lists with all standard operations.

---

## 1. Singly Linked List — Node + Basic Structure

```js-exec
class ListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  // Add to end — O(1) with tail pointer
  append(value) {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
    return this;
  }

  // Add to beginning — O(1)
  prepend(value) {
    const node = new ListNode(value);
    node.next = this.head;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.length++;
    return this;
  }

  // Delete first occurrence — O(n)
  delete(value) {
    if (!this.head) return null;

    if (this.head.value === value) {
      this.head = this.head.next;
      this.length--;
      return value;
    }

    let current = this.head;
    while (current.next && current.next.value !== value) {
      current = current.next;
    }

    if (current.next) {
      if (current.next === this.tail) this.tail = current;
      current.next = current.next.next;
      this.length--;
      return value;
    }

    return null;
  }

  // Search — O(n)
  find(value) {
    let current = this.head;
    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }
    return null;
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

// Test
const list = new LinkedList();
list.append(1).append(2).append(3);
list.prepend(0);
console.log("List:", list.toArray()); // [0, 1, 2, 3]
console.log("Find 2:", list.find(2)?.value); // 2
list.delete(1);
console.log("After delete 1:", list.toArray()); // [0, 2, 3]
```

---

## 2. Reverse a Linked List — Classic Interview Question

```js-exec
LinkedList.prototype.reverse = function () {
  let prev = null;
  let current = this.head;
  let next = null;

  this.tail = this.head; // Old head becomes new tail

  while (current) {
    next = current.next; // Save next
    current.next = prev; // Reverse the link
    prev = current;      // Move prev forward
    current = next;      // Move current forward
  }

  this.head = prev; // prev is the new head
  return this;
};

const list2 = new LinkedList();
list2.append(1).append(2).append(3).append(4);
console.log("Before reverse:", list2.toArray()); // [1, 2, 3, 4]
list2.reverse();
console.log("After reverse:", list2.toArray());  // [4, 3, 2, 1]
```

---

## 3. Detect Cycle — Floyd's Tortoise and Hare

```js-exec
LinkedList.prototype.hasCycle = function () {
  let slow = this.head;
  let fast = this.head;

  while (fast && fast.next) {
    slow = slow.next;       // Moves 1 step
    fast = fast.next.next;  // Moves 2 steps

    if (slow === fast) return true; // They met — cycle exists
  }

  return false; // Fast reached end — no cycle
};

// Create a cycle for testing
const cyclicList = new LinkedList();
cyclicList.append(1).append(2).append(3).append(4);
cyclicList.tail.next = cyclicList.head.next; // 4 → 2
console.log("Has cycle?", cyclicList.hasCycle()); // true

// Normal list
const normalList = new LinkedList();
normalList.append(1).append(2).append(3);
console.log("Has cycle?", normalList.hasCycle()); // false
```

---

## 4. Doubly Linked List

Each node has `prev` and `next` pointers:

```js-exec
class DoublyNode {
  constructor(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  append(value) {
    const node = new DoublyNode(value);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
    return this;
  }

  // Remove from end — O(1) with tail + prev
  removeLast() {
    if (!this.tail) return null;
    const value = this.tail.value;

    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else {
      this.tail = this.tail.prev;
      this.tail.next = null;
    }
    this.length--;
    return value;
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  toArrayReverse() {
    const result = [];
    let current = this.tail;
    while (current) {
      result.push(current.value);
      current = current.prev;
    }
    return result;
  }
}

const dll = new DoublyLinkedList();
dll.append(1).append(2).append(3);
console.log("Forward:", dll.toArray());        // [1, 2, 3]
console.log("Backward:", dll.toArrayReverse()); // [3, 2, 1]
console.log("Removed last:", dll.removeLast()); // 3
console.log("After remove:", dll.toArray());    // [1, 2]
```

---

## Key Takeaways

- **Singly linked**: O(1) prepend/append, O(n) search/delete. Minimal memory (one pointer per node).
- **Doubly linked**: O(1) both ends, O(n) search. Extra `prev` pointer per node.
- **Reverse**: iterate with `prev`/`current`/`next` pointers — O(n) time, O(1) space.
- **Cycle detection**: Floyd's algorithm — slow moves 1 step, fast moves 2. If they meet, cycle exists.
- Linked lists shine when you need **frequent insertion/deletion at the head** (queues, stacks). Arrays are better for random access.

---

**Next:** [Data Structures #2 — Hash Table](/articles/javascript-series/js-hash-table) — build a hash table with bucket array and collision chaining.
