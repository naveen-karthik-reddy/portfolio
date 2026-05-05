**Streaming SSR** is a rendering technique where the server sends HTML to the browser in chunks as each component's data resolves, rather than waiting for the full page to be ready. The browser can render and display the early chunks while slower parts are still being prepared on the server.

---

## Traditional SSR vs Streaming SSR

In **traditional SSR**, the request-response flow is all-or-nothing:

```text
Traditional SSR:
  Request → [fetch all data] → [render entire page] → [send full HTML] → Response
  The user waits for the slowest data dependency.
```

In **streaming SSR**, the server sends HTML progressively:

```text
Streaming SSR:
  Request → [render shell] → send shell HTML
             [fetch product] → render → send product HTML chunk
                [fetch reviews] → render → send reviews HTML chunk
  The user sees the shell immediately; content streams in as it resolves.
```

The slowest data dependency no longer blocks everything before it. The page appears in stages, with each section rendered as soon as its data is available.

---

## How It Works With React Suspense

React 18 introduced streaming SSR built on `Suspense`. Components wrapped in a Suspense boundary can stream independently:

```jsx
// ProductPage.jsx
export default function ProductPage() {
  return (
    <main>
      {/* The shell renders immediately — no data dependency */}
      <Header />
      <ProductDetails /> {/* renders synchronously */}

      {/* Reviews streams in when its server-side data fetch resolves */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews />
      </Suspense>

      {/* Recommendations streams in independently */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations />
      </Suspense>
    </main>
  );
}
```

The browser receives:

```html
<!-- Chunk 1: sent immediately — the shell -->
<main>
  <header>...</header>
  <div class="product">...</div>
  <div id="reviews-skeleton">Loading reviews...</div>
  <div id="recommendations-skeleton">Loading recommendations...</div>
</main>

<!-- Chunk 2: sent when Reviews data resolves -->
<template id="reviews-skeleton">...</template>  <!-- hidden -->
<div>⭐ 4.5 — 127 reviews ...</div>              <!-- replaces skeleton -->

<!-- Chunk 3: sent when Recommendations data resolves -->
<template id="recommendations-skeleton">...</template>
<div>You might also like: ...</div>
```

The server uses `renderToPipeableStream` (Node.js) to send chunks as they become ready. The client hydrates progressively, matching each streamed chunk to its Suspense boundary.

---

## What Streaming Changes

| | Traditional SSR | Streaming SSR |
|---|---|---|
| TTFB | High — server must render the full page first | Low — shell arrives immediately |
| FCP | Gated by the slowest data fetch | Fast — shell paints while data streams in |
| User perception | Blank screen until everything is ready | Progressive — content appears in stages |
| Timeout handling | Entire page fails or takes as long as the slowest component | Each Suspense boundary can have its own fallback/timeout |

---

## When to Use It

Streaming SSR is most valuable when your page has data dependencies with significantly different latencies. A product page where the product details are fast (cached, indexed DB query) but reviews are slow (needs aggregation from a separate service) is the ideal case.

It's less useful when all data resolves at roughly the same speed — the streaming overhead adds complexity without meaningful benefit.

---

## Framework Support

Next.js (App Router) and Remix support streaming SSR natively. In Next.js App Router, every `async` Server Component that uses `<Suspense>` boundaries enables streaming:

```jsx
// The page shell renders immediately
// SlowComponent streams in when its async work completes
export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<Skeleton />}>
        <SlowComponent />  {/* async Server Component — streams in */}
      </Suspense>
    </div>
  );
}
```

No configuration — the framework detects Suspense boundaries and automatically streams.

---

Streaming SSR collapses the tradeoff between SSR's fast FCP and the responsiveness of a client-rendered app. The shell arrives at TTFB speed, and the heavy parts stream in as they're ready, without blocking the parts that are already done.
