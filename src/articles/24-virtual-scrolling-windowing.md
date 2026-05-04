# Performance #24 - Virtual Scrolling & Windowing

Rendering 10,000 list items creates 10,000 DOM nodes. Each node has layout, style, and memory cost. Scrolling through them triggers constant layout recalculation. Even if the items themselves are simple, the sheer volume makes the page sluggish. Windowing solves this by rendering only the items currently visible in the viewport.

---

## The Problem with Long Lists

A list of 5,000 rows, each a `<div>` with a few child elements, can easily create 50,000+ DOM nodes. The browser must:
- Lay out all 50,000 elements on initial render
- Recalculate layout on every scroll event
- Paint elements that the user will never see
- Hold all nodes in memory simultaneously

The result is a slow initial render, janky scrolling, and high memory usage — even if each individual row is cheap.

---

## How Windowing Works

A windowed list renders only the visible rows plus a small buffer above and below (the "overscan"). As the user scrolls, rows leaving the viewport are unmounted and rows entering are mounted.

The container maintains the illusion of a full-height list by using an outer `div` with the total list height and an inner `div` positioned absolutely at the current scroll offset. The browser's scrollbar behaves correctly because the outer container's height equals the full content height.

```text
┌─────────────────────────────┐ ← outer container (full list height, overflow: auto)
│                             │ ← empty space above (scroll offset)
│  ┌─────────────────────┐   │
│  │ Row 47              │   │ ← only visible rows are in the DOM
│  │ Row 48              │   │
│  │ Row 49              │   │
│  └─────────────────────┘   │
│                             │ ← empty space below
└─────────────────────────────┘
```

---

## react-window

`react-window` by Brian Vaughn is the lightweight standard for fixed-size lists:

```jsx
import { FixedSizeList } from 'react-window';

// Each row receives `index` and `style` from react-window
// style MUST be applied to the root element — it contains the absolute positioning
function Row({ index, style }) {
  return (
    <div style={style}>
      {items[index].name}
    </div>
  );
}

function VirtualList() {
  return (
    <FixedSizeList
      height={600}       // viewport height in px
      itemCount={10000}  // total items in the list
      itemSize={50}      // each row is exactly 50px tall
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

The `style` prop from `react-window` contains the `position`, `top`, `height`, and `width` needed to place each row correctly. **Always apply it to the row's root element.**

For variable-height rows, use `VariableSizeList` with an `itemSize` function.

---

## @tanstack/virtual

`@tanstack/virtual` (formerly `react-virtual`) is the headless alternative — it provides the measurement and positioning logic, but you own the DOM structure. This gives full control over markup, styling, and scroll container.

```jsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList() {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: 10000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // initial estimate; measured dynamically if rows vary
  });

  return (
    // Scroll container — must have a fixed height and overflow: auto
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      {/* Inner div sized to the full list height — keeps the scrollbar accurate */}
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: virtualRow.start,    // pixel offset from top
              height: virtualRow.size,  // measured or estimated height
              width: '100%',
            }}
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

`@tanstack/virtual` supports dynamic measurement (rows that resize after render), horizontal lists, and grid layouts.

---

## When to Use Windowing

Apply windowing when:
- The list has more than ~100 items visible in a scrollable container
- Each item has meaningful DOM weight (images, nested elements)
- Profiling shows scroll jank or slow initial render

Don't apply it when:
- The list is short (< 50 items) — windowing overhead isn't worth it
- Items need to be searchable by the browser's find-in-page
- You need true DOM accessibility for all items (screen readers may not announce off-screen items)

---

## Accessibility Considerations

Windowed lists can cause issues with screen readers that rely on full DOM traversal. Use `aria-rowcount` and `aria-rowindex` on table-based lists to communicate the total count and each row's position. For generic lists, ensure focus management works correctly when items mount and unmount.

---

Windowing is one of those optimizations with a dramatic before/after — a 5,000-item list going from 3s initial render to 60ms is not unusual. But it comes with real tradeoffs in markup complexity and accessibility, so reach for it when profiling confirms the list is your bottleneck, not as a precaution.
