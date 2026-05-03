export const articlesData = [
  /* ── Performance series ── */
  {
    id: "service-workers-and-caching",
    title: "Service Workers & Caching Strategies",
    excerpt: "Service workers act as a programmable network proxy. Learn Cache-First, Network-First, and Stale-While-Revalidate strategies — and when each one makes sense.",
    date: "2026-04-19",
    readTime: "10 min read",
    tags: ["Performance", "Service Worker", "Caching"],
    types: ["performance"],
  },
  {
    id: "http2-and-http3",
    title: "HTTP/2 & HTTP/3 — What Changes for Performance",
    excerpt: "HTTP/1.1's bottlenecks drove concatenation and sprites. HTTP/2 multiplexing and HTTP/3 QUIC change the rules — here's what still matters.",
    date: "2026-04-17",
    readTime: "8 min read",
    tags: ["Performance", "Network", "HTTP"],
    types: ["performance"],
  },
  {
    id: "bundle-optimization",
    title: "Bundle Optimization — Tree Shaking & Code Splitting",
    excerpt: "JavaScript is the most expensive resource on the web. Tree shaking removes dead code; code splitting loads only what each page needs.",
    date: "2026-04-15",
    readTime: "10 min read",
    tags: ["Performance", "JavaScript", "Build"],
    types: ["performance"],
  },
  {
    id: "resource-hints",
    title: "Resource Hints — Preload, Prefetch, Preconnect",
    excerpt: "Give the browser advance notice about what it will need. Used correctly, resource hints eliminate dead time in the network waterfall.",
    date: "2026-04-10",
    readTime: "7 min read",
    tags: ["Performance", "Optimization", "Network"],
    types: ["performance"],
  },
  {
    id: "lighthouse-and-rum",
    title: "Lighthouse & Real User Monitoring",
    excerpt: "Lab data tells you what's broken. Field data tells you what real users experience. Here's how Lighthouse scoring works and when RUM fills the gaps.",
    date: "2026-04-05",
    readTime: "8 min read",
    tags: ["Performance", "Lighthouse", "Metrics"],
    types: ["performance"],
  },
  {
    id: "core-web-vitals",
    title: "Core Web Vitals Explained",
    excerpt: "LCP, CLS, and INP are Google's three signals for user experience quality. This is what each one measures, what breaks them, and how to fix them.",
    date: "2026-04-01",
    readTime: "10 min read",
    tags: ["Performance", "Web Vitals", "Metrics"],
    types: ["performance"],
  },
  {
    id: "reflow-repaint-layout-thrashing",
    title: "Reflow, Repaint & Layout Thrashing",
    excerpt: "Interleaving DOM reads and writes in a loop forces the browser to recalculate layout dozens of times per frame. Here's what it is and how to stop it.",
    date: "2026-03-25",
    readTime: "8 min read",
    tags: ["Performance", "Browser", "Rendering"],
    types: ["performance"],
  },
  {
    id: "browser-networking-and-caching",
    title: "Browser Networking & Caching",
    excerpt: "Every resource travels through DNS, TCP, TLS, and HTTP before it arrives. Understanding this journey — and HTTP caching — is core to reducing load times.",
    date: "2026-03-20",
    readTime: "10 min read",
    tags: ["Performance", "Network", "Caching"],
    types: ["performance"],
  },
  {
    id: "intersection-observer-debounce-throttle",
    title: "Intersection Observer, Debouncing & Throttling",
    excerpt: "Scroll events fire hundreds of times per second. Intersection Observer, debouncing, and throttling are the tools that keep your handlers from hammering the main thread.",
    date: "2026-03-15",
    readTime: "9 min read",
    tags: ["Performance", "JavaScript", "Runtime"],
    types: ["performance"],
  },
  {
    id: "resource-loading-strategies",
    title: "Resource Loading Strategies",
    excerpt: "How you load fonts, CSS, scripts, and images is as important as what you load. This covers FOIT/FOUT, critical CSS, async JS, and lazy loading.",
    date: "2026-03-10",
    readTime: "11 min read",
    tags: ["Performance", "Loading", "Optimization"],
    types: ["performance"],
  },
  {
    id: "critical-rendering-path",
    title: "The Critical Rendering Path",
    excerpt: "The browser can't paint until CSS is parsed and blocking scripts are executed. Understanding the CRP is the first step to a fast first paint.",
    date: "2026-03-05",
    readTime: "8 min read",
    tags: ["Performance", "Browser", "CRP"],
    types: ["performance"],
  },
  {
    id: "browser-rendering-pipeline",
    title: "How the Browser Renders a Page",
    excerpt: "From HTML bytes to pixels: DOM, CSSOM, Render Tree, Layout, Paint, and Compositing — the six steps every browser frame goes through.",
    date: "2026-03-01",
    readTime: "9 min read",
    tags: ["Performance", "Browser", "Fundamentals"],
    types: ["performance"],
  },
  /* ── Other articles ── */
  {
    id: "holdings-analyzer",
    title: "Holdings Analyzer — A Portfolio Dashboard from Your Zerodha CSV",
    excerpt:
      "Upload your Zerodha Console holdings export and get a full portfolio dashboard: P&L, dividend income, valuation ratios, risk metrics, analyst ratings, and financial calculators — instantly.",
    date: "2026-05-01",
    readTime: "8 min read",
    tags: ["Finance", "React", "Portfolio", "NSE"],
    types: ["product"],
  },
  {
    id: "web-performance-planner",
    title: "Web Performance Planner — Building a Lighthouse Score Simulator",
    excerpt:
      "A guide to using the Web Performance Planner — model your Core Web Vitals before shipping, diagnose an underperforming page, and get a ranked list of what to fix first.",
    date: "2026-04-28",
    readTime: "10 min read",
    tags: ["Performance", "React", "Web Vitals", "Engineering"],
    types: ["performance", "product"],
  },
  {
    id: "claude-figma-mcp-integration",
    title: "Figma MCP Integration Guide",
    excerpt:
      "Learn how to connect Figma MCP with Claude, extract design context, and generate production-ready UI code efficiently.",
    date: "2026-04-25",
    readTime: "8 min read",
    tags: ["Figma", "Claude", "AI", "LLM"],
    types: ["llm-metrics"],
  },
  {
    id: "figma-llm-problem",
    title: "The Real Problem with Figma + LLMs",
    excerpt:
      "Why AI-generated UI code from Figma designs is often inaccurate, and how to fix it through better design structure.",
    date: "2026-04-25",
    readTime: "12 min read",
    tags: ["Design", "AI", "Engineering"],
    types: ["llm-metrics"],
  },
];

// Generate a slug from a string (title)
export const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Get article by id (legacy) or by slug derived from title
export const getArticleById = (id) => articlesData.find((a) => a.id === id);
export const getArticleBySlug = (slug) =>
  articlesData.find((a) => a.id === slug);
