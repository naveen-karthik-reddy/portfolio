`Cache-Control` is the HTTP header that tells browsers and intermediate caches (CDNs, proxies) how to store and reuse a response. Getting it right means returning users load your page without a single network request. Getting it wrong means re-downloading resources that haven't changed, or worse, showing stale data that has.

---

## How the Browser Cache Works

On the first request, the browser downloads the resource and stores it in its HTTP cache (disk or memory, depending on size and usage). On subsequent requests, the browser checks its cache first:

```text
First visit:
  Browser → Network → Server → Response (store in cache)

Second visit:
  Browser → [check cache] → if valid → served from cache (0ms)
                           → if expired → conditional request to server
                           → if not cached → full network request
```

`Cache-Control` controls every decision in that flow: whether to cache, how long to cache, and whether to revalidate before using.

---

## Key Directives

### `max-age=N`

Cache the response for N seconds. The browser uses the cached copy without contacting the server until the time expires.

```http
# Cache this resource for one year — use for versioned static assets
Cache-Control: public, max-age=31536000, immutable

# Cache for 60 seconds — use for frequently updated data
Cache-Control: public, max-age=60
```

### `no-cache`

Cache the response, but **always revalidate** with the server before using it. The browser sends a conditional request (using `ETag` or `Last-Modified`). If the server responds `304 Not Modified`, the cached copy is used. If the resource changed, the server sends the full response.

```http
# Best for HTML — always check for updates, but avoid full download if unchanged
Cache-Control: no-cache
```

### `no-store`

Do not cache at all. Every request goes to the server.

```http
# Sensitive data — never store anywhere
Cache-Control: no-store
```

### `immutable`

The resource will never change during its `max-age`. The browser skips the revalidation request entirely — even when the user hits Refresh. Only use with versioned filenames (`app.abc123.js`).

```http
Cache-Control: public, max-age=31536000, immutable
```

### `public` vs `private`

`public` allows shared caches (CDNs, proxies) to store the response. `private` restricts caching to the browser only.

```http
# CDN can serve this to other users — use for static assets
Cache-Control: public, max-age=31536000

# Only this user's browser — use for personalized data
Cache-Control: private, max-age=60
```

### `stale-while-revalidate=N`

Serve the cached (stale) response immediately, then fetch a fresh version in the background for the next request:

```http
# Cache for 1 hour, serve stale for up to 1 day while revalidating
Cache-Control: max-age=3600, stale-while-revalidate=86400
```

---

## ETag: Conditional Revalidation

When `max-age` expires, the browser doesn't necessarily re-download. It sends a conditional request:

```http
# Browser sends
GET /styles.css HTTP/1.1
If-None-Match: "abc123"

# Server responds — no body, just confirmation the cache is still valid
HTTP/1.1 304 Not Modified
ETag: "abc123"
```

The `ETag` is a fingerprint of the response content — like a hash. If it matches, the server returns `304 Not Modified` and the browser uses its cached copy. No body is transferred.

---

## Cache Strategy by Resource Type

| Resource | Strategy | Header |
|----------|----------|--------|
| Versioned JS/CSS (`app.abc123.js`) | Cache forever | `max-age=31536000, immutable` |
| HTML document | Always revalidate | `no-cache` |
| API response (public data) | Short cache, stale fallback | `max-age=60, stale-while-revalidate=300` |
| API response (user data) | Private, short-lived | `private, max-age=0` |
| Fonts, images (versioned) | Cache forever | `max-age=31536000, immutable` |

---

`Cache-Control` is the highest-leverage performance header. One correct response header on your static assets eliminates every subsequent network request for that resource. The key distinction is versioned (immutable, forever cache) vs unversioned (revalidate) — once you design your asset pipeline around content hashes in filenames, caching becomes a simple rule with no edge cases.
