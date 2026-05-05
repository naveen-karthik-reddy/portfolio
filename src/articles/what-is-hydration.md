# What is Hydration?

**Hydration** is the process of taking server-rendered HTML and making it interactive by attaching JavaScript event handlers to the existing DOM nodes — without re-rendering or replacing the markup.

When a server sends a fully rendered HTML page, the browser can display it immediately. But the page is static — buttons don't respond, forms don't submit, state doesn't update. Hydration is what bridges that gap.

---

## Why it exists

In a purely client-rendered React app, the browser receives a nearly empty HTML file and JavaScript bundles. React runs, builds the virtual DOM, and renders everything from scratch. Users see nothing until JavaScript has downloaded, parsed, and executed.

Server-side rendering (SSR) flips this: the server runs React and sends complete HTML. The browser paints instantly. But React still needs to run on the client to wire up event listeners and take over state management. That client-side "take over" is hydration.

```
Server → sends full HTML → browser paints page immediately
                         ↓
           JavaScript downloads and parses
                         ↓
           React walks the server HTML, attaches handlers
                         ↓
           Page is now interactive (hydrated)
```

---

## What React does during hydration

React doesn't re-render the page. Instead it:

1. Renders the virtual DOM tree (same as what the server produced)
2. **Walks the existing real DOM** and matches each node to the virtual tree
3. **Attaches event listeners** to the matched nodes
4. Takes over state management

If the server-rendered HTML matches what React would have produced client-side, hydration is transparent to the user. If there's a mismatch — a hydration error — React typically discards the server HTML and re-renders from scratch, which is slow and can cause a visible flash.

```jsx
// A mismatch happens when server and client render differently
// Common cause: accessing browser-only APIs during render

function BadComponent() {
  // ❌ window is undefined on the server — renders nothing there,
  //    renders "1920" on the client → hydration mismatch
  return <p>Width: {typeof window !== 'undefined' ? window.innerWidth : ''}</p>;
}

function GoodComponent() {
  const [width, setWidth] = useState(null);

  // ✅ Reads window only after mount — same output on server and client
  useEffect(() => setWidth(window.innerWidth), []);

  return <p>Width: {width ?? '...'}</p>;
}
```

---

## The hydration cost

Hydration runs on the [main thread](/articles/what-is-main-thread). On a slow device, it can take hundreds of milliseconds — during which the page looks interactive but isn't. Clicking a button before hydration completes either does nothing or fires the event after a noticeable delay.

This is one of the biggest criticisms of traditional SSR: the gap between "page looks ready" and "page is actually ready" can be substantial.

---

## React 18: selective hydration

React 18 introduced **selective hydration** — hydration is broken into chunks (using [React Fiber](/articles/what-is-react-fiber)) and can be interrupted. If the user interacts with part of the page, React prioritises hydrating that part first.

```jsx
import { Suspense } from 'react';

// ✅ Each Suspense boundary hydrates independently
// React hydrates the part the user interacts with first
function App() {
  return (
    <>
      <Suspense fallback={<NavSkeleton />}>
        <Nav />
      </Suspense>
      <Suspense fallback={<FeedSkeleton />}>
        <Feed />           {/* user clicks here → hydrated first */}
      </Suspense>
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
    </>
  );
}
```

---

## Hydration vs React Server Components

React Server Components (RSC) take a different approach: server components never ship JavaScript to the client at all, so they don't need to hydrate. Only client components (marked `'use client'`) go through hydration. This reduces the hydration cost significantly for apps that use RSC.

---

Hydration is the invisible seam between a fast first paint and a responsive page. Understanding it explains why SSR apps can feel slow to interact with even after the content is visible — and why React 18's concurrent hydration model is such a meaningful improvement.
