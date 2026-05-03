# #12 — Service Workers & Caching Strategies

Service workers are a JavaScript file that runs in a separate thread from the page and acts as a programmable network proxy. Every request made by pages under its scope passes through it. This makes service workers the right place to implement sophisticated caching strategies, offline support, and background sync.

---

## What Is a Service Worker?

A service worker is registered by a page, but it lives independently of it:

```js
// main.js — register the service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

```js
// sw.js — the service worker itself
self.addEventListener('fetch', (event) => {
  // intercept every network request
});
```

**Key properties:**
- Runs in its own thread — can't block the page or access the DOM
- Persists between page loads — continues running after the tab is closed (until the browser terminates it)
- Only works over HTTPS (or localhost)
- Has access to the Cache API — a key-value store for Request/Response pairs

---

## The Service Worker Lifecycle

Understanding the lifecycle is essential for deploying updates without breaking cached resources.

**1. Install**

Triggered when the browser downloads a new or updated `sw.js`. The `install` event is typically used to pre-cache critical assets:

```js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) =>
      cache.addAll(['/index.html', '/styles.css', '/app.js'])
    )
  );
});
```

**2. Activate**

After installation, the new service worker waits until all tabs using the old worker are closed. On activation, old caches are cleaned up:

```js
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== 'v1').map((k) => caches.delete(k)))
    )
  );
});
```

Call `self.skipWaiting()` in `install` and `clients.claim()` in `activate` if you want the new service worker to take control immediately without waiting for old tabs to close — useful for bug fixes, but be careful with breaking changes.

**3. Fetch**

Once active, the service worker intercepts all fetches from pages in its scope.

---

## Caching Strategies

Different resources need different caching strategies. The choice depends on how often the resource changes and how critical freshness is.

### Cache-First

Check the cache first; fetch from the network only if not cached. Returns stale content if available.

```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached ?? fetch(event.request)
    )
  );
});
```

**Best for:** versioned static assets (JS bundles, fonts, images with content hashes). These never change at a given URL, so cached content is always correct.

### Network-First

Try the network; fall back to cache if the network fails.

```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
```

**Best for:** HTML pages, API responses where freshness matters but offline fallback is valuable. Users get up-to-date content when online and a fallback when offline.

### Stale-While-Revalidate

Return the cached response immediately, then fetch an update in the background for the next request.

```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('dynamic').then(async (cache) => {
      const cached = await cache.match(event.request);
      const fetchPromise = fetch(event.request).then((response) => {
        cache.put(event.request, response.clone());
        return response;
      });
      return cached ?? fetchPromise;
    })
  );
});
```

**Best for:** resources that update occasionally but where returning slightly stale content is acceptable — news feeds, product listings, non-critical API data. The user always gets a fast response; the cache is kept fresh in the background.

### Cache-Then-Network

Return the cached response immediately and also start a network request. When the network responds, update the UI if the response differs.

This pattern requires coordination with the page (the page listens for updates from the service worker), making it more complex to implement. It's best suited for real-time data where you want instant display but always-fresh content.

---

## When to Use Service Workers

Service workers are worth the complexity when:

- You need **offline functionality** — core features should work without a network connection
- You have **frequently visited users** who benefit from near-instant cache-first loads
- Your app has a reliable **deploy/cache-invalidation process** — versioned asset URLs, cache-busting on deploy

They add complexity and are not always the right tool. For simple static sites served from a CDN with good `Cache-Control` headers, HTTP caching alone is often sufficient.

---

## Limitations and Gotchas

**Debugging:** Service workers intercept all requests, which can hide network errors. DevTools → Application → Service Workers shows the current registration and allows bypassing the SW for debugging.

**Cache storage limits:** Cache API storage is limited (varies by browser and available disk space) and can be evicted by the browser under storage pressure. Don't cache everything.

**Byte-for-byte update check:** The browser re-fetches `sw.js` on every page load and installs a new service worker if the file has changed by even one byte. Keep the service worker URL stable and version your cache names.

**HTTPS only:** Service workers require HTTPS in production. This is non-negotiable — a service worker with the ability to intercept all requests on an insecure connection would be a serious security risk.

**Don't cache HTML with a long-lived cache-first strategy.** If a user's browser caches your shell HTML forever and you push an update, they'll get stale HTML. Use network-first or stale-while-revalidate for HTML.
