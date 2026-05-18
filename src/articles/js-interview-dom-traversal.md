DOM traversal questions are the same recursive tree walk applied three different ways. The interviewer gives you a root element and asks you to find descendants by className, tagName, or computed style. Master the DFS pattern once, apply it three times.

---

## What is DOM Traversal?

DOM traversal is the act of walking the DOM tree to find elements matching certain criteria — by class name, tag name, or computed style. The browser provides native methods like `getElementsByClassName()` and `querySelectorAll()`, but implementing them from scratch tests whether you understand tree recursion and DOM APIs.

The DOM is a tree where each node has children (`.children`) and siblings (`.nextElementSibling`). Traversing it means starting at a root element and recursively visiting every descendant, checking each against your match criteria. The standard approach is **depth-first search (DFS)**: dive deep into the first child, then its first child, etc., backtracking when you hit a leaf.

The three functions are the same DFS algorithm applied to different predicates:
- **`getElementsByClassName(root, className)`** — check `element.classList.contains(className)`
- **`getElementsByTagName(root, tagName)`** — check `element.tagName === tagName.toUpperCase()`
- **`getElementsByStyle(root, property, value)`** — check `getComputedStyle(element)[property] === value`

The edge cases interviewers look for: the root element itself should be checked (not just descendants), text nodes and comment nodes should be skipped, and recursion must handle deeply nested structures without stack overflow (though in practice, the DOM is rarely deep enough for this to matter).

Real-world use:
- **Polyfills** — implementing `getElementsByClassName` for older browsers before it was universally supported
- **Custom selectors** — building a CSS selector engine for a testing framework or scraper
- **Accessibility audits** — walking the DOM to find elements missing ARIA attributes or with specific computed styles

---

## The Problem

---

## Thought Process

All three follow the same pattern: a DFS walk over `root.children`, checking each element against a condition. The only difference is the match condition:

- **className**: `element.classList.contains(className)`
- **tagName**: `element.tagName.toLowerCase() === tagName.toLowerCase()`
- **style**: `getComputedStyle(element)[property] === value`

DFS preserves document order — exactly what the native methods return.

---

## Step 1 — `getElementsByClassName`

```js-exec
function getElementsByClassName(root, className) {
  const result = [];

  function walk(element) {
    if (element.classList.contains(className)) {
      result.push(element);
    }
    for (const child of element.children) {
      walk(child);
    }
  }

  // Don't include the root itself — only descendants
  for (const child of root.children) {
    walk(child);
  }

  return result;
}
```

**Multiple classes**: The native `getElementsByClassName` accepts space-separated class names — all must match. Add that:

```js-exec
function getElementsByClassName(root, classNames) {
  const required = classNames.split(/\s+/).filter(Boolean);
  const result = [];

  function walk(element) {
    if (required.every(cls => element.classList.contains(cls))) {
      result.push(element);
    }
    for (const child of element.children) {
      walk(child);
    }
  }

  for (const child of root.children) {
    walk(child);
  }

  return result;
}
```

---

## Step 2 — `getElementsByTagName`

```js-exec
function getElementsByTagName(root, tagName) {
  const result = [];
  const target = tagName.toUpperCase();
  const matchAll = target === '*';

  function walk(element) {
    if (matchAll || element.tagName === target) {
      result.push(element);
    }
    for (const child of element.children) {
      walk(child);
    }
  }

  // Include root's descendants; optionally include root itself
  for (const child of root.children) {
    walk(child);
  }

  return result;
}
```

**Why `toUpperCase`?** HTML tag names are always uppercase in `element.tagName` regardless of how they're written in the source. `'div'` → `'DIV'`.

---

## Step 3 — `getElementsByStyle`

```js-exec
function getElementsByStyle(root, property, value) {
  const result = [];

  function walk(element) {
    // Use computed style (browser-only; won't run in Node)
    if (typeof getComputedStyle !== 'undefined') {
      const style = getComputedStyle(element);
      if (style[property] === value) {
        result.push(element);
      }
    }
    for (const child of element.children) {
      walk(child);
    }
  }

  for (const child of root.children) {
    walk(child);
  }

  return result;
}
```

**Computed style vs inline style**: `getComputedStyle` returns the final applied style after all CSS rules. `element.style[property]` only returns inline styles. The interviewer wants computed style.

---

## Step 4 — Edge Cases

**Root element matches**: The native methods search descendants only — not the root. Skip the root and start walking from its children.

**No children**: The `for...of` loop over `element.children` simply doesn't execute. Returns `[]`.

**Case sensitivity**: Tag names are case-insensitive in HTML. Always compare with `.toUpperCase()`.

**Wildcard `*`**: Matches every element. Native `getElementsByTagName('*')` returns all descendants.

**DFS vs BFS**: DFS preserves document order. BFS would return elements level by level, which differs from native behavior. Use DFS.

---

## Full Solution

```js-exec
function getElementsByClassName(root, classNames) {
  const required = classNames.split(/\s+/).filter(Boolean);
  const result = [];

  function walk(element) {
    if (required.every(cls => element.classList.contains(cls))) {
      result.push(element);
    }
    for (const child of element.children) walk(child);
  }

  for (const child of root.children) walk(child);
  return result;
}

function getElementsByTagName(root, tagName) {
  const result = [];
  const target = tagName.toUpperCase();

  function walk(element) {
    if (target === '*' || element.tagName === target) result.push(element);
    for (const child of element.children) walk(child);
  }

  for (const child of root.children) walk(child);
  return result;
}

function getElementsByStyle(root, property, value) {
  const result = [];

  function walk(element) {
    if (typeof getComputedStyle !== 'undefined') {
      if (getComputedStyle(element)[property] === value) result.push(element);
    }
    for (const child of element.children) walk(child);
  }

  for (const child of root.children) walk(child);
  return result;
}
```

---

## What Interviewers Are Testing

- **Recursive tree traversal** — DFS over the DOM tree
- **Abstraction** — recognizing that all three are the same pattern with different match conditions
- **Case-insensitive tag matching** — knowing `tagName` is uppercase
- **Computed styles** — knowing the difference between `element.style` and `getComputedStyle`
- **Document order** — DFS over children preserves the order native methods return

---

## Complexity

| | Time | Space |
|-|------|-------|
| All three | O(N) — each node visited once | O(H) — call stack, H = tree depth |

---

## Interview Tips

- **State the pattern upfront** — "All three are a DFS tree walk. The only difference is the match condition. Let me write the core traversal once and apply it three ways."
- **Use `element.children`**, not `childNodes` — `children` gives only elements. `childNodes` includes text nodes and comments.
- **Handle tag case correctly** — "I'll convert to uppercase because `element.tagName` always returns uppercase."
- **Mention that `getComputedStyle` is browser-only** — these functions require a browser environment. In Node.js, you'd need a DOM implementation like jsdom.

---

## Related Questions

- [#6 — Implement _.get()](/articles/js-interview-get)
- [#12 — Implement flatten()](/articles/js-interview-flatten)
- [#22 — Implement an EventEmitter](/articles/js-interview-event-emitter)
