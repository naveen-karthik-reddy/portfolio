A Trie (prefix tree) stores strings character by character, sharing common prefixes. It enables O(k) lookup where k is the key length — independent of how many keys you've stored. Tries power autocomplete, spell checkers, and IP routing.

---

## 1. Basic Trie — Insert, Search, startsWith

```js-exec
class TrieNode {
  constructor() {
    this.children = {};     // char → TrieNode
    this.isEnd = false;     // Marks end of a complete word
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEnd = true;
  }

  search(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEnd;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return true;
  }
}

// Test
const trie = new Trie();
["apple", "app", "application", "apt", "bat", "batch", "banana"].forEach((w) => trie.insert(w));

console.log("Search 'apple':", trie.search("apple"));       // true
console.log("Search 'app':", trie.search("app"));           // true
console.log("Search 'appl':", trie.search("appl"));         // false — not a word
console.log("startsWith 'app':", trie.startsWith("app"));   // true
console.log("startsWith 'bat':", trie.startsWith("bat"));   // true
console.log("startsWith 'cat':", trie.startsWith("cat"));   // false
```

---

## 2. Autocomplete — Find All Words with a Prefix

```js-exec
Trie.prototype.autocomplete = function (prefix) {
  // Navigate to the prefix node
  let node = this.root;
  for (const char of prefix) {
    if (!node.children[char]) return [];
    node = node.children[char];
  }

  // DFS from this node to collect all complete words
  const results = [];
  this._collect(node, prefix, results);
  return results;
};

Trie.prototype._collect = function (node, prefix, results) {
  if (node.isEnd) {
    results.push(prefix);
  }

  for (const [char, childNode] of Object.entries(node.children)) {
    this._collect(childNode, prefix + char, results);
  }
};

// Test
const trie2 = new Trie();
["car", "card", "care", "careful", "cat", "category", "cater", "dog", "door"].forEach((w) => trie2.insert(w));

console.log("Autocomplete 'ca':", trie2.autocomplete("ca"));     // car, card, care, careful, cat, category, cater
console.log("Autocomplete 'car':", trie2.autocomplete("car"));   // car, card, care, careful
console.log("Autocomplete 'cat':", trie2.autocomplete("cat"));   // cat, category, cater
console.log("Autocomplete 'do':", trie2.autocomplete("do"));     // dog, door
console.log("Autocomplete 'z':", trie2.autocomplete("z"));       // []
```

---

## 3. Delete a Word from a Trie

```js-exec
Trie.prototype.delete = function (word) {
  this._deleteHelper(this.root, word, 0);
};

Trie.prototype._deleteHelper = function (node, word, index) {
  if (index === word.length) {
    if (!node.isEnd) return false; // Word doesn't exist
    node.isEnd = false;
    // Return true if this node has no children (can be pruned)
    return Object.keys(node.children).length === 0;
  }

  const char = word[index];
  if (!node.children[char]) return false;

  const shouldPruneChild = this._deleteHelper(node.children[char], word, index + 1);

  if (shouldPruneChild) {
    delete node.children[char];
    // Return true if this node is NOT an end AND has no more children
    return !node.isEnd && Object.keys(node.children).length === 0;
  }

  return false;
};

// Test
const trie3 = new Trie();
trie3.insert("car");
trie3.insert("card");
trie3.insert("care");

console.log("Before delete — 'car':", trie3.search("car")); // true
trie3.delete("car");
console.log("After delete — 'car':", trie3.search("car"));  // false
console.log("But 'card' still:", trie3.search("card"));      // true
console.log("And 'care' still:", trie3.search("care"));      // true
```

---

## 4. Count Words with a Given Prefix

```js-exec
Trie.prototype.countPrefix = function (prefix) {
  let node = this.root;
  for (const char of prefix) {
    if (!node.children[char]) return 0;
    node = node.children[char];
  }

  return this._countWords(node);
};

Trie.prototype._countWords = function (node) {
  let count = node.isEnd ? 1 : 0;

  for (const childNode of Object.values(node.children)) {
    count += this._countWords(childNode);
  }

  return count;
};

const trie4 = new Trie();
trie4.insert("apple");
trie4.insert("application");
trie4.insert("apply");
trie4.insert("aptitude");
trie4.insert("banana");

console.log("Words starting with 'app':", trie4.countPrefix("app")); // 3 (apple, application, apply)
console.log("Words starting with 'apt':", trie4.countPrefix("apt")); // 1 (aptitude)
console.log("Words starting with 'b':", trie4.countPrefix("b"));     // 1 (banana)
console.log("Words starting with 'c':", trie4.countPrefix("c"));     // 0
```

---

## 5. When to Use a Trie vs Hash Map

```js-exec
console.log("│ Operation      │ Trie            │ Hash Map        │");
console.log("│────────────────│─────────────────│─────────────────│");
console.log("│ Lookup         │ O(k)            │ O(1) avg        │");
console.log("│ Prefix search  │ O(k)            │ O(n) — scan all │");
console.log("│ Autocomplete   │ O(k + m)        │ N/A             │");
console.log("│ Space          │ Shared prefixes │ Per-key storage  │");
console.log("│ Keys sorted    │ Alphabetically  │ No ordering     │");
console.log("");
console.log("Use Trie when you need prefix operations.");
console.log("Use Hash Map for exact-key lookup.");
console.log("k = key length, m = number of matching keys");
```

---

## Key Takeaways

- Trie = tree where each **character** is a node, and `isEnd` marks complete words.
- **insert/search/startsWith** are all O(k) where k = key length.
- **Autocomplete**: navigate to prefix node, then DFS to collect all complete words.
- **Delete**: unset `isEnd`, prune nodes that have no children and aren't an end.
- Memory-heavy for large alphabets — compress with radix tree (Patricia trie) if needed.
- Tries shine for prefix search, autocomplete, spell checkers, and IP routing tables.

---

**Next:** [FP #1 — `compose()` & `pipe()` ](/articles/javascript-series/js-compose-pipe) — implement function composition and build transformation pipelines.
