A **CDN** (Content Delivery Network) is a distributed network of servers placed at strategic locations worldwide. When a user requests your page, the CDN serves it from the server closest to them — not from your origin server, which might be thousands of miles away.

---

## How a CDN Works

Without a CDN, every user on the planet connects to your origin server:

```text
User in Mumbai ──── 150ms RTT ──── Origin server in Virginia, USA
User in London ────  80ms RTT ──── Origin server in Virginia, USA
User in Sydney ──── 220ms RTT ──── Origin server in Virginia, USA
```

With a CDN, each user connects to a nearby **Point of Presence (PoP)** — a CDN server in their region:

```text
User in Mumbai ── 10ms RTT ── CDN PoP (Mumbai)    ── Origin (only if needed)
User in London ── 5ms RTT  ── CDN PoP (London)    ── Origin (only if needed)
User in Sydney ── 8ms RTT  ── CDN PoP (Sydney)    ── Origin (only if needed)
```

The CDN PoP caches your content. Most requests never reach the origin server at all.

---

## What CDNs Do

**Reduce latency.** Fewer network hops and shorter physical distances mean lower RTT. DNS, TCP, and TLS handshakes all complete faster to a nearby PoP.

**Absorb traffic.** The CDN handles most requests. Your origin server only receives cache misses — typically a small fraction of total traffic.

**Handle TLS termination.** TLS handshakes happen at the CDN edge, close to the user. The CDN-to-origin connection uses a separate, often pre-established encrypted channel.

**Compress content.** CDNs automatically apply Gzip or Brotli compression and often convert images to modern formats (WebP, AVIF) on the fly.

---

## What Goes on a CDN

| Asset type | CDN strategy |
|-----------|-------------|
| Static assets (JS, CSS, fonts, images) | **Always.** These are versioned (content hashes in filenames) and immutable — cache forever at the edge. |
| HTML (SSG / pre-rendered) | **Yes.** Short TTL with CDN-level cache purging on deploy. |
| API responses | **Sometimes.** Only for non-personalized, cacheable data. Use `Cache-Control` headers carefully. |
| User-specific data | **Never.** Private responses (`Cache-Control: private`) must not be cached on a shared CDN. |

---

## CDN and TTFB

TTFB (Time to First Byte) is the metric most directly affected by CDN usage. A user connecting to an origin server on another continent pays 100-300ms in round-trip time alone. A CDN PoP nearby drops that to 5-30ms.

This improvement cascades through every subsequent metric. Lower TTFB means earlier HTML delivery, earlier resource discovery, earlier FCP and LCP. The CDN doesn't just move one metric — it shifts the entire loading timeline earlier.

---

## Common CDNs

Most modern CDNs are bundled with hosting platforms. Cloudflare, Fastly, Akamai, and CloudFront (AWS) are the major standalone options. Vercel, Netlify, and similar platforms have integrated CDNs — you deploy, and the CDN is configured automatically. For most projects, the platform's built-in CDN is sufficient.

---

A CDN is one of the highest-leverage performance investments available. It requires no code changes, applies to every resource on your domain, and benefits every user regardless of device or network speed. The only cost is configuration — once the CDN is set up, the latency savings are permanent.
