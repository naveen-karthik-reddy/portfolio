**Stale-while-revalidate** is a caching strategy where a cached (potentially outdated) response is served immediately, while a fresh copy is fetched in the background. The next request after the background fetch gets the updated version.

The goal is to eliminate cache-miss latency entirely — the user never waits for a network request to complete, even when the cached version has expired.

---

## The problem it solves

Standard HTTP caching has a cliff: once a cached response expires (`max-age` passes), the next request must wait for a fresh one from the server. During that wait, the user sees a loading state or blank content.

```
Standard cache (max-age=60):

Request at t=0  → cache miss → wait for server → 200ms response → page loads
Request at t=30 → cache hit → instant
Request at t=61 → cache EXPIRED → wait for server → 200ms response → page loads again
```

Stale-while-revalidate removes the cliff:

```
Stale-while-revalidate:

Request at t=0  → cache miss → wait for server → 200ms → page loads
Request at t=30 → cache hit → instant (stale=0s, fine)
Request at t=61 → serve stale immediately → revalidate in background → INSTANT
Request at t=62 → cache hit (freshly revalidated) → instant
```

---

## HTTP header

```
Cache-Control: max-age=60, stale-while-revalidate=3600
```

- `max-age=60` — consider the response fresh for 60 seconds
- `stale-while-revalidate=3600` — after expiry, serve stale for up to 1 hour while revalidating in the background

CDNs (Cloudflare, Fastly, Vercel Edge) and some browsers honour this header directly.

---

## Service Worker implementation

For more control — or when the browser/CDN doesn't support the header — implement it in a Service Worker:

```js
// sw.js
self.addEventListener('fetch', event => {
  event.respondWith(staleWhileRevalidate(event.request));
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open('v1');
  const cached = await cache.match(request);

  // Fetch fresh copy in the background regardless
  const networkFetch = fetch(request).then(response => {
    cache.put(request, response.clone()); // update cache
    return response;
  });

  // Return stale immediately if available, otherwise wait for network
  return cached ?? networkFetch;
}
```

---

## When to use it

| Scenario | Good fit? |
|----------|-----------|
| News feed, blog posts | ✅ Slightly stale content is fine |
| Navigation/shell HTML | ✅ Structure rarely changes |
| API responses for non-critical data | ✅ Background update is acceptable |
| User's own profile / account data | ⚠️ Showing stale personal data can confuse users |
| Prices, inventory, real-time data | ❌ Must always be fresh |
| Authentication tokens | ❌ Never serve stale |

---

## Stale-while-revalidate vs other caching strategies

**Cache-first:** Always serve from cache, fall back to network if cache misses. Never automatically revalidates.

**Network-first:** Always try the network, fall back to cache only if offline. Always fresh, but adds latency on every request.

**Stale-while-revalidate:** Always serve from cache (instant), always revalidate in background (stays fresh). Best of both for non-critical content.

---

## The trade-off

The user always gets a fast response — but they might see data that's up to `stale-while-revalidate` seconds old. The second request after expiry gets fresh data.

For content where being 60 seconds behind is acceptable, this is almost always the right caching strategy. For content where freshness is non-negotiable, it isn't.

---

Stale-while-revalidate is the closest thing caching has to a free lunch: instant responses with automatic background freshness. The only cost is accepting that some responses may be one cycle behind.
