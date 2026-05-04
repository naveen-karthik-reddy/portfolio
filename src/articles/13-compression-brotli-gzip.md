# Performance #13 - Compression — Brotli & Gzip

If your server isn't compressing text responses, you're sending 60–75% more bytes than necessary on every uncached load. A 500KB JS bundle that compresses to 150KB saves 350KB of bandwidth — which on a 3G connection is the difference between a usable app and one that times out. This is one of the lowest-effort wins in web performance.

---

## How Compression Works

Both Gzip and Brotli use variations of the **LZ77** algorithm combined with **Huffman coding**. The compressor builds a dictionary of repeated byte sequences and replaces subsequent occurrences with references to earlier positions. Longer files with more repetition compress more aggressively.

JavaScript compresses particularly well because of repeated keywords (`function`, `return`, `const`), consistent indentation, and variable name patterns.

---

## Gzip vs Brotli

| | Gzip | Brotli |
|---|---|---|
| Introduced | 1992 | 2015 (Google) |
| Browser support | Universal | All modern browsers |
| Typical JS savings | 60–70% | 65–75% |
| Compression speed | Fast | Slower at max levels |
| Content-Encoding header | `gzip` | `br` |

**Brotli** consistently achieves 15–25% better compression than Gzip at equivalent quality settings. The decompression speed is comparable, so the client pays no meaningful penalty.

The browser signals what it accepts via the `Accept-Encoding` request header:

```http
Accept-Encoding: gzip, deflate, br
```

The server responds with the compressed version and sets the `Content-Encoding` header accordingly:

```http
HTTP/2 200 OK
Content-Encoding: br
Content-Type: application/javascript
Content-Length: 42318
```

---

## Static vs Dynamic Compression

**Dynamic compression** compresses files on each request. It works for any response but adds CPU overhead per request. Use it only at lower compression levels (Gzip 1–6) to keep latency reasonable.

**Static (pre-compression)** generates compressed files at build time and serves them directly. This is the correct approach for production. You can use Brotli at level 11 (maximum) with no request-time cost because the heavy computation was done once at build.

Most build tools support this:

```js
// vite.config.js — using vite-plugin-compression
import compression from 'vite-plugin-compression';

export default {
  plugins: [
    // Generates .br files alongside each asset
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
    // Generates .gz files as fallback for older servers/proxies
    compression({ algorithm: 'gzip', ext: '.gz' }),
  ],
};
```

---

## Server Configuration

**Nginx** — serve pre-compressed files:

```nginx
# Serve pre-built .br files, fall back to .gz, then uncompressed
gzip_static on;
brotli_static on; # requires ngx_brotli module
```

**Apache** — static compression with `mod_deflate` or `mod_brotli`.

**Node/Express** — use the `compression` middleware for dynamic compression or configure your CDN to handle it.

Most CDNs (Cloudflare, Vercel, Netlify, AWS CloudFront) automatically apply Brotli compression. If you're on a CDN, verify it's enabled — it often is but not always at the Brotli level.

---

## What to Compress (and What Not To)

**Compress:** HTML, CSS, JavaScript, JSON, XML, SVG, plain text, web fonts (WOFF — note: WOFF2 is already compressed internally).

**Don't compress:** JPEG, PNG, WebP, AVIF, GIF, MP4, ZIP, WASM (already compressed), PDF. These formats have built-in compression; re-compressing adds CPU cost for minimal or no size reduction, and can sometimes increase file size.

---

## Checking Compression in DevTools

Open DevTools → Network tab. Click any text resource. In the **Headers** tab, look for `Content-Encoding: br` or `Content-Encoding: gzip`. The **Size** column shows two numbers: transferred size / resource size. If they differ significantly, compression is working.

```text
Size: 42.3 kB / 158 kB  ← 42.3kB transferred, 158kB uncompressed
```

If those two numbers match, compression is off for that resource.

---

Compression is infrastructure, not code — set it up once and it silently helps every asset on every load. The only real decision is whether you're pre-compressing at build time (you should be) or relying on your CDN (verify it, don't assume). Brotli at maximum level on pre-built assets is the goal; Gzip is just the fallback you keep around for older proxies.
