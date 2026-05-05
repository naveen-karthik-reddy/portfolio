# What is TTFB?

**TTFB (Time to First Byte)** measures the time from when the browser sends an HTTP request to when it receives the first byte of the response. It captures everything that happens on the server's side of the wire before any content arrives.

---

## What TTFB includes

```
Browser                          Server
  │                                │
  │──── HTTP request sent ────────►│
  │                                │  DNS lookup
  │                                │  TCP handshake
  │                                │  TLS negotiation
  │                                │  Server processing
  │                                │  (DB queries, rendering, etc.)
  │◄─── first byte of response ────│
  │
  TTFB = time between those two events
```

TTFB is a compound metric. It includes:
- **DNS lookup** — resolving the domain to an IP address
- **TCP connection** — the three-way handshake
- **TLS negotiation** — if HTTPS (usually 1–2 extra round trips)
- **Server processing time** — generating the response (database queries, template rendering, auth checks)
- **Network latency** — the actual physical round trip

A good TTFB is under **800ms** (Google's Core Web Vitals threshold). Under 200ms is excellent.

---

## Why TTFB matters

TTFB is the gate at the start of every other metric. Nothing else — no CSS parsing, no JavaScript execution, no rendering — can begin until the first byte arrives. A high TTFB delays:

- **FCP (First Contentful Paint)** — because the HTML hasn't arrived yet
- **LCP (Largest Contentful Paint)** — the page is still blank
- **Everything downstream** — all resources referenced in the HTML can't be discovered until the HTML starts arriving

A 1-second TTFB means the user stares at a blank page for a full second before anything can happen, regardless of how optimised everything else is.

---

## Common causes of high TTFB

| Cause | Fix |
|-------|-----|
| No CDN — server is geographically far from user | Add a CDN or edge network |
| Slow database queries | Add indexes, cache query results |
| No server-side caching | Cache rendered HTML or API responses |
| Cold start (serverless functions) | Use warm instances or edge runtime |
| Expensive server-side rendering | Cache SSR output, use streaming SSR |
| Unoptimised TLS setup | Enable TLS session resumption, use HTTP/2 or HTTP/3 |

---

## Measuring TTFB

**In DevTools:** Network tab → click any request → "Timing" section → look for "Waiting (TTFB)". The time before "Content Download" starts is TTFB.

**With the API:**
```js
const [nav] = performance.getEntriesByType('navigation');
const ttfb = nav.responseStart - nav.requestStart;
console.log('TTFB:', ttfb.toFixed(0), 'ms');
```

**In Lighthouse:** TTFB appears under "Server response times" in the diagnostics section.

---

## The CDN fix

The most reliable way to reduce TTFB for static and cacheable content is a CDN (Content Delivery Network). A CDN caches responses at edge nodes geographically close to users, so requests never reach the origin server.

```
Without CDN:
User (Tokyo) ──────────────────────► Origin (US East) → 200ms RTT → high TTFB

With CDN:
User (Tokyo) ──────► CDN edge (Tokyo) → cached response → ~10ms TTFB
```

For dynamic content that can't be cached, edge computing (running server code at CDN nodes) achieves a similar effect by moving the compute itself closer to the user.

---

TTFB is the metric closest to "how fast is your server?" Low TTFB means every subsequent metric starts earlier. When optimising page load performance, TTFB is always worth checking first — everything else is downstream of it.
