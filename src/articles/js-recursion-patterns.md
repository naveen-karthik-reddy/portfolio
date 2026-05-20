Recursion is a function that calls itself. It's the natural way to process trees, generate combinations, and traverse nested structures. This article covers core recursive patterns, the stack overflow problem, tail-call optimization, and iterative alternatives.

---

## 1. The Anatomy of a Recursive Function

Every recursive function has two parts: a **base case** (stop condition) and a **recursive case** (call itself with a smaller problem):

```js-exec
function countdown(n) {
  // Base case: stop
  if (n <= 0) {
    console.log("Liftoff!");
    return;
  }

  // Recursive case: work + smaller call
  console.log(n);
  countdown(n - 1);
}

countdown(5);
```

Without a base case, you get infinite recursion → stack overflow. Every function call consumes stack memory, and the stack is finite.

---

## 2. Deep Flatten — Recursive vs Iterative

```js-exec
// Recursive flatten (can overflow on very deep structures)
function flattenRecursive(arr, depth = Infinity) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flattenRecursive(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  return result;
}

// Iterative flatten (stack-safe — can handle any depth)
function flattenIterative(arr, depth = Infinity) {
  const result = [];
  const stack = arr.map((item) => ({ item, depth }));

  while (stack.length > 0) {
    const { item, depth: d } = stack.shift();
    if (Array.isArray(item) && d > 0) {
      stack.unshift(...item.map((sub) => ({ item: sub, depth: d - 1 })));
    } else {
      result.push(item);
    }
  }

  return result;
}

const nested = [1, [2, [3, [4, [5]]]]];
console.log("Recursive:", flattenRecursive(nested, 2));  // [1, 2, 3, [4, [5]]]
console.log("Iterative:", flattenIterative(nested, 2));  // [1, 2, 3, [4, [5]]]
```

---

## 3. Fibonacci — Three Ways

```js-exec
// 1. Pure recursive (O(2^n)) — terribly slow
function fibRecursive(n) {
  if (n <= 1) return n;
  return fibRecursive(n - 1) + fibRecursive(n - 2);
}

// 2. Memoized (O(n)) — fast
const fibMemo = (function () {
  const cache = { 0: 0, 1: 1 };
  return function fib(n) {
    if (n in cache) return cache[n];
    cache[n] = fib(n - 1) + fib(n - 2);
    return cache[n];
  };
})();

// 3. Iterative (O(n), O(1) space) — fastest
function fibIterative(n) {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

console.log("Memoized(35):", fibMemo(35));     // Instant
console.log("Iterative(50):", fibIterative(50)); // Instant
// fibRecursive(50) would take forever
```

---

## 4. Tree Traversal

```js-exec
const fileSystem = {
  name: "root",
  children: [
    {
      name: "src",
      children: [
        { name: "index.js" },
        { name: "App.jsx" },
        {
          name: "components",
          children: [{ name: "Header.jsx" }, { name: "Footer.jsx" }],
        },
      ],
    },
    { name: "package.json" },
  ],
};

// DFS — recursive (natural for trees)
function walkTree(node, indent = 0) {
  console.log("  ".repeat(indent) + node.name);

  if (node.children) {
    for (const child of node.children) {
      walkTree(child, indent + 1);
    }
  }
}

console.log("File tree:");
walkTree(fileSystem);
```

---

## 5. Generating All Permutations

```js-exec
function permutations(arr) {
  if (arr.length <= 1) return [arr];

  const result = [];

  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];

    const permsOfRemaining = permutations(remaining);

    for (const perm of permsOfRemaining) {
      result.push([current, ...perm]);
    }
  }

  return result;
}

console.log("Permutations of [1,2,3]:");
const perms = permutations([1, 2, 3]);
perms.forEach((p) => console.log(" ", p));
console.log("Count:", perms.length); // 6 = 3!
```

---

## 6. Generating All Combinations (Powerset)

```js-exec
function combinations(arr) {
  if (arr.length === 0) return [[]];

  const [first, ...rest] = arr;
  const withoutFirst = combinations(rest);
  const withFirst = withoutFirst.map((combo) => [first, ...combo]);

  return [...withoutFirst, ...withFirst];
}

console.log("Combinations of [1,2,3]:");
const combos = combinations([1, 2, 3]);
combos.forEach((c) => console.log(" ", c));
console.log("Count:", combos.length); // 8 = 2^3
```

---

## 7. Tail-Call Optimization (TCO)

A recursive call is in **tail position** if it's the very last thing the function does. JavaScript engines *can* optimize tail calls to avoid stack growth, but only Safari/JSC currently implements TCO:

```js-exec
// Non-tail-recursive — stack grows with each call
function factorialNonTail(n) {
  if (n <= 1) return 1;
  return n * factorialNonTail(n - 1); // NOT in tail position — * after return
}

// Tail-recursive version — accumulator carries the result
function factorialTail(n, acc = 1) {
  if (n <= 1) return acc;
  return factorialTail(n - 1, n * acc); // Tail position — nothing after call
}

// Without TCO, both overflow. With TCO, factorialTail uses constant stack.
try {
  console.log(factorialNonTail(5)); // 120
  // factorialNonTail(100000) would overflow
} catch (e) {
  console.log(e.message);
}
```

---

## 8. Trampolining — Manual TCO When the Engine Doesn't Support It

```js-exec
function trampoline(fn) {
  return function (...args) {
    let result = fn(...args);
    while (typeof result === "function") {
      result = result();
    }
    return result;
  };
}

function factorialTrampolined(n, acc = 1) {
  if (n <= 1) return acc;
  // Instead of calling itself, return a thunk
  return () => factorialTrampolined(n - 1, n * acc);
}

const safeFactorial = trampoline(factorialTrampolined);
console.log(safeFactorial(5)); // 120
// safeFactorial(100000) works too — no stack overflow!
```

---

## Key Takeaways

- Every recursive function needs a **base case** — without it, stack overflow.
- **Deep recursion is elegant** but can overflow the call stack on large/deep inputs.
- **Memoization** turns exponential recursive algorithms (Fibonacci) into O(n).
- **Iterative + stack** is the stack-safe alternative when the engine doesn't do TCO.
- **Trampolining** enables unbounded recursion by returning thunks a trampoline function executes in a loop.

---

**Next:** [Data #1 — Deep Clone & Deep Compare](/articles/javascript-series/js-deep-clone-compare) — structural clone handling circular references and deep equality checking.
