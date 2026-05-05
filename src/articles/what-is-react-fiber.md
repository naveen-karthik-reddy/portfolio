**React Fiber** is the internal architecture React has used since version 16. It's the reimplementation of React's core reconciliation algorithm — built specifically to make rendering interruptible, prioritisable, and resumable.

Before Fiber, React's reconciler was recursive and synchronous. Once it started rendering a tree, it couldn't stop until it finished. On a large tree, that could block the [main thread](/articles/what-is-main-thread) for hundreds of milliseconds. Fiber was built to fix this.

---

## What a Fiber is

A **fiber** (lowercase) is a JavaScript object representing a unit of work — specifically, one component in the component tree. It holds:

- The component type (function, class, or host element like `div`)
- The component's props and state
- A reference to its parent, child, and sibling fibers (a linked list, not a tree)
- Information about what work needs to be done (effect flags)

```
App fiber
├── Header fiber
│   └── Nav fiber
├── Main fiber
│   ├── Article fiber
│   └── Sidebar fiber
└── Footer fiber
```

Each fiber is a node in a doubly-linked list that React can walk, pause, resume, and abandon.

---

## Why a linked list and not a tree?

The original recursive reconciler used the JavaScript call stack to track where it was in the component tree. If you interrupted a recursive call, you lost your place — there was no way to resume.

A linked list is different: React tracks its current position explicitly as a pointer. It can stop processing at any fiber, save the pointer, hand the thread back to the browser, and resume from the same fiber on the next frame. No call stack required.

---

## Two trees: current and work-in-progress

React maintains two fiber trees at all times:

- **Current tree** — reflects what is currently rendered on screen
- **Work-in-progress tree** — where React applies the next render

When reconciliation starts, React builds a work-in-progress fiber for each component. Once the work-in-progress tree is complete and all effects have run, it becomes the new current tree (a "commit"). This is the double-buffering pattern.

```
Current tree:         Work-in-progress tree (being built):
[App] ←────────────── [App'] (new state)
 └─ [Counter: 0]       └─ [Counter': 1]  ← only this changed
```

React only commits the work-in-progress tree to the DOM when the entire tree is ready — you never see a half-updated UI.

---

## How concurrent rendering uses Fiber

In React 18's concurrent mode, the scheduler assigns **priority lanes** to updates:

| Priority | Example |
|----------|---------|
| Synchronous | Error boundaries, flushSync |
| Default | State updates from user events |
| Transition | `startTransition` updates |
| Idle | Prefetching, background work |

React processes fibers in priority order. A high-priority update (keyboard input) can **interrupt** a low-priority render in progress (a slow search results list). React abandons the work-in-progress tree, handles the urgent update, then restarts the interrupted render.

```jsx
import { useTransition } from 'react';

function Search() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  return (
    <input
      value={query}
      onChange={e => {
        setQuery(e.target.value);              // urgent — updates input immediately

        startTransition(() => {
          updateResults(e.target.value);       // low priority — can be interrupted
        });
      }}
    />
  );
}
```

Without Fiber's interruptible linked-list model, `startTransition` and `Suspense` couldn't exist.

---

## Fiber as a concept vs. the Fiber reconciler

"Fiber" can refer to either:
1. An individual fiber object (one component's work unit)
2. The Fiber reconciler — the entire React 16+ architecture

In [reconciliation](/articles/what-is-reconciliation), React walks the fiber tree, compares each fiber to its previous version, and marks which ones need updates. Fiber is the data structure that makes this efficient and interruptible.

---

Fiber isn't something you use directly — it's the engine underneath React. But knowing it exists explains why React can pause rendering mid-tree, why concurrent features work the way they do, and why splitting work across frames is possible at all.
