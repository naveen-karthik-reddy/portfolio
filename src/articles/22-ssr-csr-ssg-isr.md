# Performance #22 - SSR vs CSR vs SSG vs ISR

Pick the wrong rendering strategy and no amount of bundle optimization will save you. This is the highest-leverage architectural decision in web performance — where HTML is generated, when it's generated, and how much JavaScript the client has to execute before the page is usable.

---

## Client-Side Rendering (CSR)

The server sends a near-empty HTML shell. The browser downloads JavaScript, executes it, fetches data, and renders the page entirely in the client.

```html
<!-- What the server sends — the browser gets nothing to show yet -->
<div id="root"></div>
<script src="/bundle.js"></script>
```

```jsx
// Next.js: opt out of server rendering entirely
// This page only runs in the browser
'use client';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <Spinner />;
  return <DashboardView data={data} />;
}
```

**What you get:**
- Fast subsequent navigations (JS is cached, no server round-trip)
- Simple deployment (static file hosting)
- Rich interactivity without page reloads

**What you pay:**
- Slow First Contentful Paint — nothing renders until JS executes
- Bad LCP and TTI on slow devices or networks
- Poor SEO without additional work (crawlers see the empty shell)
- The full app JS bundle is required before anything is visible

CSR is appropriate for authenticated dashboards, tools, and apps where SEO doesn't matter and users are on reliable connections.

---

## Server-Side Rendering (SSR)

The server runs the application on each request, generates full HTML, and sends it. The browser displays content immediately from the HTML, then "[hydrates](/articles/what-is-hydration)" — attaches event listeners to the server-rendered markup.

```jsx
// Next.js App Router: async Server Component runs on every request
export default async function ProductPage({ params }) {
  // This fetch happens on the server — no client-side waterfall
  const product = await db.products.findById(params.id);

  return (
    <main>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCartButton productId={product.id} /> {/* client component */}
    </main>
  );
}
```

**What you get:**
- Fast First Contentful Paint and LCP — the HTML is already built
- Good SEO — crawlers see complete content
- Personalized content per request

**What you pay:**
- Higher Time to First Byte (TTFB) — the server must finish rendering before sending anything
- Hydration cost — the browser still downloads and executes the full JS bundle to make the page interactive, creating a window where content is visible but not interactive
- More complex infrastructure (you need a server, not just a CDN)

Hydration is SSR's biggest performance trap. Until hydration completes, clicking buttons does nothing. On large apps with large bundles, this gap can be several seconds.

---

## Static Site Generation (SSG)

HTML is generated once at **build time**, not per request. The resulting files are served from a CDN with no server computation.

```jsx
// Next.js Pages Router: runs once at build time
export async function getStaticProps() {
  const posts = await fetchAllBlogPosts();
  return { props: { posts } };
}

export async function getStaticPaths() {
  const slugs = await fetchAllSlugs();
  return {
    paths: slugs.map(slug => ({ params: { slug } })),
    fallback: false, // 404 for unknown paths
  };
}

export default function BlogPost({ posts }) {
  return <PostList posts={posts} />;
}
```

**What you get:**
- Minimal TTFB — files served from CDN edge nodes
- No server cost per request
- Excellent LCP and Core Web Vitals
- Scales to any traffic for free

**What you pay:**
- Content can be stale between builds
- Build times grow with page count (thousands of pages = long builds)
- Not suitable for personalized or real-time content

SSG is ideal for marketing sites, blogs, documentation, and any content that doesn't change per-user.

---

## Incremental Static Regeneration (ISR)

ISR (Next.js's term) hybridizes SSG and SSR. Pages are statically generated, but individual pages can be revalidated in the background at a configurable interval. The first visitor after expiry gets the stale page while the new version generates; subsequent visitors get the fresh version.

```js
// Next.js Pages Router ISR
export async function getStaticProps() {
  const data = await fetchData();
  return {
    props: { data },
    revalidate: 60, // regenerate at most once per 60 seconds
  };
}
```

```jsx
// Next.js App Router: time-based revalidation via fetch cache
async function ProductPage({ params }) {
  const product = await fetch(`/api/products/${params.id}`, {
    next: { revalidate: 60 }, // cache for 60s, then revalidate in background
  }).then(r => r.json());

  return <ProductView product={product} />;
}
```

**What you get:**
- CDN-speed delivery with near-fresh content
- No per-request server computation in the hot path
- Per-page control over staleness tolerance

**What you pay:**
- First visitor after expiry gets a stale page
- Requires a platform that supports ISR (Vercel, Netlify, etc.)

---

## Choosing a Strategy

| Content type | Recommended |
|---|---|
| Marketing, blog, docs | SSG |
| E-commerce product pages (thousands) | ISR |
| News, frequently updated content | SSR or ISR with short revalidate |
| Authenticated dashboard, SaaS app | CSR (or SSR for first load) |
| Real-time data (stock prices, live scores) | CSR with WebSocket/polling |

Most real applications mix strategies per route. Next.js, Remix, Astro, and SvelteKit all support per-page rendering decisions.

---

## Streaming SSR

React 18 introduced streaming SSR — the server sends HTML in chunks as each component resolves, rather than waiting for the full page. Combined with `<Suspense>`, this means the shell arrives at TTFB speed while slower parts stream in progressively.

```jsx
// The shell renders immediately; <Reviews> streams in when its data resolves
export default function ProductPage() {
  return (
    <main>
      <ProductDetails />  {/* renders synchronously */}

      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews />  {/* streams in when the DB query resolves */}
      </Suspense>
    </main>
  );
}
```

This eliminates the all-or-nothing wait of classic SSR, making SSR competitive with SSG for time-to-first-content.

---

The real-world answer is almost never "pick one" — it's "SSG for your marketing pages, ISR for your product catalog, SSR for personalized routes, CSR for the authenticated app shell." The frameworks support all of this per route, so the only mistake is defaulting to one strategy across the board.
