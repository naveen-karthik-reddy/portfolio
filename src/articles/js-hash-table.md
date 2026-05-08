A hash table (hash map) is the data structure behind JavaScript's `Map`, objects, and `Set`. It provides O(1) average lookup by converting a key into an array index via a hash function. This article builds one with collision handling and dynamic resizing.

**Prerequisites:** [Data Structures #1 — Linked List](/articles/javascript-series/js-linked-list)

---

## 1. The Hash Function — Key to Array Index

A hash function maps arbitrary keys to valid array indices:

```js-exec
function hashString(str, bucketCount) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % bucketCount;
    // 31 is a prime — reduces collisions for string keys
  }
  return hash;
}

// Test distribution
const keys = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape"];
const bucketCount = 8;
const buckets = new Array(bucketCount).fill(0);

for (const key of keys) {
  const index = hashString(key, bucketCount);
  buckets[index]++;
  console.log(`${key.padEnd(12)} → bucket ${index}`);
}
console.log("Distribution:", buckets);
```

---

## 2. Hash Table with Separate Chaining

When two keys hash to the same bucket (collision), chain them in a linked list:

```js-exec
class HashTable {
  constructor(initialCapacity = 8) {
    this.capacity = initialCapacity;
    this.size = 0;
    this.buckets = new Array(this.capacity).fill(null).map(() => []);
    // Each bucket is an array (chain) of [key, value] pairs
  }

  _hash(key) {
    const strKey = typeof key === "string" ? key : JSON.stringify(key);
    let hash = 0;
    for (let i = 0; i < strKey.length; i++) {
      hash = (hash * 31 + strKey.charCodeAt(i)) % this.capacity;
    }
    return hash;
  }

  set(key, value) {
    const index = this._hash(key);
    const bucket = this.buckets[index];

    // Check if key already exists — update
    for (const pair of bucket) {
      if (pair[0] === key) {
        pair[1] = value;
        return this;
      }
    }

    // New key — add to chain
    bucket.push([key, value]);
    this.size++;

    // Resize if load factor exceeds 0.75
    if (this.size / this.capacity > 0.75) {
      this._resize(this.capacity * 2);
    }

    return this;
  }

  get(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];

    for (const pair of bucket) {
      if (pair[0] === key) return pair[1];
    }

    return undefined;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  delete(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket.splice(i, 1);
        this.size--;
        return true;
      }
    }

    return false;
  }

  _resize(newCapacity) {
    const oldBuckets = this.buckets;
    this.capacity = newCapacity;
    this.size = 0;
    this.buckets = new Array(newCapacity).fill(null).map(() => []);

    // Rehash all existing entries
    for (const bucket of oldBuckets) {
      for (const [key, value] of bucket) {
        this.set(key, value);
      }
    }

    console.log(`Resized to capacity ${newCapacity}`);
  }
}

// Test
const ht = new HashTable();
ht.set("name", "Naveen");
ht.set("role", "Engineer");
ht.set("age", 25);
ht.set("city", "Bangalore");

console.log("Get name:", ht.get("name")); // Naveen
console.log("Get age:", ht.get("age"));   // 25
console.log("Has city:", ht.has("city")); // true

ht.set("a", 1);
ht.set("b", 2);
ht.set("c", 3);
ht.set("d", 4); // This should trigger resize (7 items / 8 capacity = 0.875 > 0.75)

console.log("Size:", ht.size);
console.log("Capacity after resize:", ht.capacity);

ht.delete("age");
console.log("Deleted age, has age?", ht.has("age")); // false
```

---

## 3. Hash Collision Demonstration

```js-exec
function badHash(key, capacity) {
  // ❌ Bad hash — all keys go to bucket 0 or 1, creating huge chains
  return key.length % capacity;
}

function goodHash(key, capacity) {
  // ✅ Better — use prime multiplication to spread keys
  let hash = 0;
  const str = String(key);
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % capacity;
  }
  return hash;
}

const keys = ["a", "b", "c", "ab", "ba", "abc", "xyz", "hello"];

console.log("Bad hash distribution (capacity=4):");
const badBuckets = [0, 0, 0, 0];
for (const k of keys) {
  const idx = badHash(k, 4);
  badBuckets[idx]++;
  console.log(`  ${k} → bucket ${idx}`);
}
console.log("  Buckets:", badBuckets);

console.log("\nGood hash distribution (capacity=4):");
const goodBuckets = [0, 0, 0, 0];
for (const k of keys) {
  const idx = goodHash(k, 4);
  goodBuckets[idx]++;
  console.log(`  ${k} → bucket ${idx}`);
}
console.log("  Buckets:", goodBuckets);
```

---

## Key Takeaways

- Hash table = **hash function** + **array of buckets** + **collision handling**.
- Load factor = `size / capacity`. Resize (usually double) when it exceeds 0.75.
- Resizing **rehashes all entries** — O(n) operation, but amortized over many inserts.
- Chaining (linked list per bucket) is simplest. Open addressing is an alternative (store collided entries in nearby empty slots).
- JavaScript's `Map` uses a hash table internally with deterministic iteration order.

---

**Next:** [Data Structures #3 — LRU Cache](/articles/javascript-series/js-lru-cache) — hash map + doubly linked list for O(1) get and put.
