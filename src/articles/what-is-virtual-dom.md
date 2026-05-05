# What is the Virtual DOM?

The **Virtual DOM** (vDOM) is an in-memory JavaScript object tree that mirrors the structure of the real browser DOM. React keeps this copy up to date as your application state changes, then uses it to figure out the minimum set of real DOM mutations needed — before touching the actual page.

---

## Why it exists

Directly manipulating the browser DOM is expensive. Every time you add, remove, or change a node, the browser may need to recalculate styles, redo layout, repaint affected regions, and composite the result. On a complex UI where dozens of things change in response to a single user action, doing that work naively — one mutation at a time — hammers the browser's rendering engine.

The Virtual DOM exists to batch that work. Instead of touching the DOM on every state change, React:

1. Rebuilds the virtual tree in memory (cheap — it's just JavaScript objects)
2. Compares the new tree against the previous one (the "diff")
3. Collects the differences into a minimal list of real DOM mutations
4. Applies them all in one go

One flush, one layout pass, one repaint.

---

## What it looks like

When your component returns JSX, React doesn't write to the DOM immediately. It produces an object tree:

```jsx
// This JSX...
<div className="card">
  <h2>Title</h2>
  <span>42</span>
</div>

// ...becomes this plain object in memory:
{
  type: 'div',
  props: { className: 'card' },
  children: [
    { type: 'h2', props: {}, children: ['Title'] },
    { type: 'span', props: {}, children: ['42'] }
  ]
}
```

This object is cheap to create and throw away. The real DOM equivalent would require the browser to allocate layout nodes, apply styles, and potentially trigger reflows.

---

## Virtual DOM vs Real DOM

| | Virtual DOM | Real DOM |
|--|-------------|----------|
| Lives in | JavaScript memory | Browser engine |
| Cost to update | Cheap (object mutation) | Expensive (may trigger layout/paint) |
| Updated by | React | React (after diffing) |
| Queryable with | Nothing — internal to React | `document.querySelector`, etc. |

---

## The tradeoff

The Virtual DOM isn't free — diffing has a cost too. For small trees with infrequent updates, it's extra overhead. React's bet is that for most real-world UIs, the cost of diffing is lower than the cost of touching the DOM unnecessarily.

This is also why [reconciliation](/articles/what-is-reconciliation) — the diffing algorithm — is designed to run in O(n) rather than the O(n³) a naïve tree diff would require.

---

The Virtual DOM is the reason React can let you write your UI as if it re-renders from scratch on every state change, while the browser only sees the small, precise set of updates that actually changed.
