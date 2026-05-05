# What is Reconciliation?

**Reconciliation** is React's process of figuring out what changed between two renders and updating the real DOM to match — with as few mutations as possible.

When state or props change, React re-runs your component to produce a new [Virtual DOM](/articles/what-is-virtual-dom) tree. Reconciliation is what happens next: React compares the new tree against the previous one, finds the differences, and generates a minimal list of DOM mutations to apply.

---

## The naive approach and why React doesn't use it

Comparing two arbitrary trees to find the minimum edit distance is an O(n³) problem. On a tree with 1,000 nodes, that's a billion comparisons per render — far too slow for interactive UIs.

React's reconciler makes two pragmatic assumptions that bring this down to O(n):

**1. Elements of different types produce completely different trees.**

If a `<div>` becomes a `<section>`, React tears down the entire subtree and builds a fresh one. It doesn't try to patch the existing nodes.

```jsx
// Before
<div>
  <Counter />
</div>

// After — different element type: React unmounts Counter,
// destroys the div, builds a new section from scratch
<section>
  <Counter />
</section>
```

**2. The `key` prop identifies which list items are the same across renders.**

Without keys, React matches list children by position. If items reorder, React re-renders every item. With stable keys, React tracks identity — it knows item `#42` moved from position 3 to position 1 and only updates the DOM order.

```jsx
// ❌ React matches by index — reordering re-renders everything
{items.map(item => <Row data={item} />)}

// ✅ React tracks by identity — only the moved node is touched
{items.map(item => <Row key={item.id} data={item} />)}
```

---

## What reconciliation produces

The output of reconciliation is a **list of DOM operations**:
- Insert node
- Update node attributes / text content
- Move node
- Remove node

React hands this list to the renderer (ReactDOM for the browser), which applies all the mutations in one batch. One flush, one layout pass, one repaint — regardless of how many virtual nodes changed.

---

## Reconciliation in React 18

React 17's reconciler was synchronous: once it started, it ran to completion. A large tree on a slow device could block the [main thread](/articles/what-is-main-thread) for hundreds of milliseconds.

React 18's **concurrent reconciler** can pause mid-way through a render, yield the main thread back to the browser (so it can handle input or draw a frame), then resume where it left off. This is what `useTransition` and `Suspense` build on — they let React deprioritise certain updates so urgent work (like responding to keyboard input) always gets through first.

---

Reconciliation is why React can let you think about your UI as a pure function of state — "given this data, render this" — while the browser only ever sees the small, precise updates that actually changed.
