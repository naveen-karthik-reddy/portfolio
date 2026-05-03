const e=`# #5 — Browser Networking & Caching

Every resource on a web page — HTML, CSS, JavaScript, images, fonts — travels over the network. Understanding what happens on that journey, and how to control it with HTTP caching, is essential for reducing load times.

---

## The Journey of a Network Request

When a browser needs a resource it hasn't seen before, it goes through several stages before the first byte of content arrives.

---

## Stage 1: DNS Resolution

Before the browser can connect to \`api.example.com\`, it needs to translate that hostname into an IP address. This is DNS resolution.

The browser checks its **local cache** first, then the OS cache, then the configured DNS resolver (your ISP or a public resolver like \`8.8.8.8\`). A cold DNS lookup typically adds **20–120ms** to the first request to a new origin.

**Optimisation:** Use \`dns-prefetch\` to resolve hostnames for third-party origins early:

\`\`\`html
<link rel="dns-prefetch" href="//fonts.googleapis.com">
\`\`\`

---

## Stage 2: TCP Handshake

TCP is a reliable, ordered transport protocol. Before data can flow, the browser and server must establish a connection with a three-way handshake:

\`\`\`
Client → SYN        →  Server
Client ← SYN-ACK    ←  Server
Client → ACK        →  Server
\`\`\`

One full round trip (RTT) is consumed just to open the connection. On a 50ms RTT network, that's 50ms before a single byte of content is sent.

**Optimisation:** Use \`preconnect\` to perform the TCP (and TLS) handshake early, before the request is made:

\`\`\`html
<link rel="preconnect" href="https://fonts.googleapis.com">
\`\`\`

---

## Stage 3: TLS Handshake

For HTTPS connections (all production traffic should be HTTPS), TLS adds another 1–2 round trips on top of TCP. The browser and server negotiate cipher suites, exchange certificates, and establish encryption keys.

TLS 1.3 reduces this to a single round trip (1-RTT), and supports zero round-trip resumption (0-RTT) for repeated connections. Ensure your server supports TLS 1.3 — it's a free performance improvement.

---

## Stage 4: HTTP Request / Response

With the connection established, the browser sends the HTTP request:

\`\`\`
GET /api/data HTTP/1.1
Host: api.example.com
Accept: application/json
\`\`\`

The server processes the request and responds with headers followed by the body. **Time to First Byte (TTFB)** measures the gap between the request being sent and the first byte of the response arriving — it captures server processing time plus one network RTT.

A high TTFB points to slow server-side processing or insufficient CDN coverage.

---

## HTTP Caching: Control-Control and ETag

Once a resource is downloaded, caching determines whether the browser needs to re-download it on the next visit.

### Cache-Control

\`Cache-Control\` is the primary caching header. Set by the server, it controls how and how long a resource is cached.

\`\`\`
Cache-Control: max-age=31536000, immutable
\`\`\`

| Directive | Meaning |
|-----------|---------|
| \`max-age=N\` | Cache for N seconds |
| \`no-cache\` | Cache, but always revalidate with the server |
| \`no-store\` | Do not cache at all |
| \`immutable\` | Resource will never change; skip revalidation |
| \`public\` | Any cache (CDN, proxy) may store it |
| \`private\` | Only the browser cache (not CDN) |

**Best practice for versioned assets** (JS/CSS with content hashes in filenames):
\`\`\`
Cache-Control: public, max-age=31536000, immutable
\`\`\`

**Best practice for HTML** (must always be fresh):
\`\`\`
Cache-Control: no-cache
\`\`\`

### ETag and Conditional Requests

When \`max-age\` expires, the browser doesn't necessarily re-download the resource. It sends a **conditional request** using the \`ETag\` (a fingerprint of the resource content):

\`\`\`
GET /styles.css HTTP/1.1
If-None-Match: "abc123"
\`\`\`

If the resource hasn't changed, the server responds with \`304 Not Modified\` — no body, just confirmation. The browser uses its cached copy. This eliminates the download cost even when the cache has technically expired.

---

## CDN and Edge Delivery

A **Content Delivery Network (CDN)** places servers at dozens of locations worldwide ("Points of Presence" or PoPs). When a user requests a resource, they're served from the nearest PoP rather than the origin server.

**Benefits:**
- Reduces latency (fewer network hops, lower RTT)
- Absorbs traffic spikes (CDN handles most requests, origin sees less load)
- TCP/TLS connections are established to the nearby PoP, not the distant origin

**What to put on a CDN:**
- All static assets (JS, CSS, images, fonts) — these are immutable and cache perfectly
- HTML (for pre-rendered or SSG sites) — use short TTLs with CDN-level purging on deploy

**What to be careful with:**
- Dynamic API responses — cache only if safe (no user-specific data)
- Use \`Vary\` headers correctly when caching varies by headers like \`Accept-Encoding\` or \`Accept-Language\`

---

## The Full Request Timeline

\`\`\`
DNS lookup       ~50ms (or 0ms if cached)
TCP handshake    ~50ms (1 RTT)
TLS handshake    ~50ms (1 RTT, TLS 1.3)
TTFB             ~50ms (server processing + 1 RTT)
Download         depends on size and bandwidth
────────────────────────────────────────────
First byte       ~200ms on a 50ms RTT network (cold)
\`\`\`

Caching eliminates all of this for repeat visits. A cache hit costs nothing beyond a local lookup.

---

## Key Takeaways

- DNS, TCP, and TLS each consume at least one network round trip before content arrives. \`preconnect\` and \`dns-prefetch\` move these costs earlier.
- \`Cache-Control: max-age=31536000, immutable\` is the right setting for versioned static assets.
- \`Cache-Control: no-cache\` with ETags gives HTML the right balance — always fresh, but revalidation is cheap.
- CDNs reduce latency by serving content from servers geographically close to the user.
- TLS 1.3 reduces the TLS handshake to one round trip — ensure your server supports it.
`;export{e as default};
