export const articlesData = [
  /* ═══════════════════════════════════════════════════════════════
     Performance series — 30 articles, 3-day increments
     ═══════════════════════════════════════════════════════════════ */
  {
    id: "01-browser-rendering-pipeline",
    title: "Performance #1 - How the Browser Renders a Page",
    excerpt: "From HTML bytes to pixels: DOM, CSSOM, Render Tree, Layout, Paint, and Compositing — the six steps every browser frame goes through.",
    readTime: "9 min read",
    tags: ["Performance", "Browser", "Fundamentals"],
    categories: ["performance"],
  },
  {
    id: "02-critical-rendering-path",
    title: "Performance #2 - The Critical Rendering Path",
    excerpt: "The browser can't paint until CSS is parsed and blocking scripts are executed. Understanding the CRP is the first step to a fast first paint.",
    readTime: "8 min read",
    tags: ["Performance", "Browser", "CRP"],
    categories: ["performance"],
  },
  {
    id: "03-reflow-repaint-layout-thrashing",
    title: "Performance #3 - Reflow, Repaint & Layout Thrashing",
    excerpt: "Interleaving DOM reads and writes in a loop forces the browser to recalculate layout dozens of times per frame. Here's what it is and how to stop it.",
    readTime: "8 min read",
    tags: ["Performance", "Browser", "Rendering"],
    categories: ["performance"],
  },
  {
    id: "04-css-js-animations",
    title: "Performance #4 - CSS & JS Animations — Compositor-Only Properties & rAF",
    excerpt: "Animate only transform and opacity to stay on the compositor thread. Here's why those two properties are free, and how requestAnimationFrame keeps JS animations in sync with the browser.",
    readTime: "8 min read",
    tags: ["Performance", "Animation", "CSS"],
    categories: ["performance"],
  },
  {
    id: "05-css-containment",
    title: "Performance #5 - CSS Containment & content-visibility",
    excerpt: "CSS containment tells the browser a subtree is isolated, so it can skip work it would otherwise do. content-visibility: auto can cut rendering time by 5-10x on content-heavy pages.",
    readTime: "7 min read",
    tags: ["Performance", "CSS", "Rendering"],
    categories: ["performance"],
  },
  {
    id: "06-event-loop-task-queue",
    title: "Performance #6 - The JavaScript Event Loop & Task Queue",
    excerpt: "JavaScript is single-threaded. Understanding the event loop, microtask queue, and long tasks is the foundation for knowing why pages freeze and how to fix it.",
    readTime: "9 min read",
    tags: ["Performance", "JavaScript", "Runtime"],
    categories: ["performance"],
  },
  {
    id: "07-devtools-performance-profiler",
    title: "Performance #7 - DevTools Performance Profiler",
    excerpt: "Chrome DevTools' Performance panel gives you a frame-by-frame trace of everything the browser did. Here's how to read flame charts, spot long tasks, and find layout thrashing.",
    readTime: "8 min read",
    tags: ["Performance", "DevTools", "Profiling"],
    categories: ["performance"],
  },
  {
    id: "08-core-web-vitals",
    title: "Performance #8 - Core Web Vitals Explained",
    excerpt: "LCP, CLS, and INP are Google's three signals for user experience quality. This is what each one measures, what breaks them, and how to fix them.",
    readTime: "10 min read",
    tags: ["Performance", "Web Vitals", "Metrics"],
    categories: ["performance"],
  },
  {
    id: "09-lighthouse-and-rum",
    title: "Performance #9 - Lighthouse & Real User Monitoring",
    excerpt: "Lab data tells you what's broken. Field data tells you what real users experience. Here's how Lighthouse scoring works and when RUM fills the gaps.",
    readTime: "8 min read",
    tags: ["Performance", "Lighthouse", "Metrics"],
    categories: ["performance"],
  },
  {
    id: "10-resource-loading-strategies",
    title: "Performance #10 - Resource Loading Strategies",
    excerpt: "How you load fonts, CSS, scripts, and images is as important as what you load. This covers FOIT/FOUT, critical CSS, async JS, and lazy loading.",
    readTime: "11 min read",
    tags: ["Performance", "Loading", "Optimization"],
    categories: ["performance"],
  },
  {
    id: "11-image-optimization",
    title: "Performance #11 - Image Optimization — WebP, AVIF, srcset & Lazy Loading",
    excerpt: "Images are the largest resources on most pages and the most common cause of slow LCP. Here's how to choose the right format, serve the right size, and prevent layout shift.",
    readTime: "9 min read",
    tags: ["Performance", "Images", "Optimization"],
    categories: ["performance"],
  },
  {
    id: "12-font-optimization",
    title: "Performance #12 - Font Optimization",
    excerpt: "Custom fonts cause invisible text, layout shift, and extra network round trips. font-display, self-hosting, subsetting, and variable fonts — here's what each one fixes.",
    readTime: "8 min read",
    tags: ["Performance", "Fonts", "Loading"],
    categories: ["performance"],
  },
  {
    id: "13-compression-brotli-gzip",
    title: "Performance #13 - Compression — Brotli & Gzip",
    excerpt: "Text-based resources compress by 60-75%. Brotli saves another 15-25% over Gzip. Here's how both work, how to pre-compress at build time, and what never to compress.",
    readTime: "7 min read",
    tags: ["Performance", "Network", "Compression"],
    categories: ["performance"],
  },
  {
    id: "14-browser-networking-and-caching",
    title: "Performance #14 - Browser Networking & Caching",
    excerpt: "Every resource travels through DNS, TCP, TLS, and HTTP before it arrives. Understanding this journey — and HTTP caching — is core to reducing load times.",
    readTime: "10 min read",
    tags: ["Performance", "Network", "Caching"],
    categories: ["performance"],
  },
  {
    id: "15-http2-and-http3",
    title: "Performance #15 - HTTP/2 & HTTP/3 — What Changes for Performance",
    excerpt: "HTTP/1.1's bottlenecks drove concatenation and sprites. HTTP/2 multiplexing and HTTP/3 QUIC change the rules — here's what still matters.",
    readTime: "8 min read",
    tags: ["Performance", "Network", "HTTP"],
    categories: ["performance"],
  },
  {
    id: "16-resource-hints",
    title: "Performance #16 - Resource Hints — Preload, Prefetch, Preconnect",
    excerpt: "Give the browser advance notice about what it will need. Used correctly, resource hints eliminate dead time in the network waterfall.",
    readTime: "7 min read",
    tags: ["Performance", "Optimization", "Network"],
    categories: ["performance"],
  },
  {
    id: "17-priority-hints-fetch-priority",
    title: "Performance #17 - Priority Hints & Fetch Priority",
    excerpt: "The browser's resource prioritization heuristics are good but not perfect. fetchpriority lets you correct them — boosting the LCP image, deprioritizing non-critical scripts.",
    readTime: "7 min read",
    tags: ["Performance", "Network", "Optimization"],
    categories: ["performance"],
  },
  {
    id: "18-intersection-observer-debounce-throttle",
    title: "Performance #18 - Intersection Observer, Debouncing & Throttling",
    excerpt: "Scroll events fire hundreds of times per second. Intersection Observer, debouncing, and throttling are the tools that keep your handlers from hammering the main thread.",
    readTime: "9 min read",
    tags: ["Performance", "JavaScript", "Runtime"],
    categories: ["performance"],
  },
  {
    id: "19-v8-jit-compilation",
    title: "Performance #19 - V8 & JIT Compilation — How JS Engines Optimize Your Code",
    excerpt: "V8 compiles hot functions to optimized machine code based on observed types. Hidden classes, monomorphic call sites, and deoptimization — here's what it means for how you write JS.",
    readTime: "9 min read",
    tags: ["Performance", "JavaScript", "V8"],
    categories: ["performance"],
  },
  {
    id: "20-memory-leaks-garbage-collection",
    title: "Performance #20 - Memory Leaks & Garbage Collection",
    excerpt: "JavaScript manages memory automatically — until it doesn't. The four leak patterns every SPA developer hits: forgotten listeners, detached DOM nodes, closure captures, and unbounded caches.",
    readTime: "9 min read",
    tags: ["Performance", "JavaScript", "Memory"],
    categories: ["performance"],
  },
  {
    id: "21-web-workers-offscreencanvas",
    title: "Performance #21 - Web Workers & OffscreenCanvas",
    excerpt: "Heavy computation on the main thread blocks rendering and input. Web Workers move that work to a background thread. OffscreenCanvas moves canvas rendering there too.",
    readTime: "8 min read",
    tags: ["Performance", "JavaScript", "Concurrency"],
    categories: ["performance"],
  },
  {
    id: "22-ssr-csr-ssg-isr",
    title: "Performance #22 - SSR vs CSR vs SSG vs ISR",
    excerpt: "The rendering strategy you choose determines TTFB, LCP, hydration cost, and SEO. This is the highest-leverage architectural decision in web performance.",
    readTime: "10 min read",
    tags: ["Performance", "Architecture", "Rendering"],
    categories: ["performance"],
  },
  {
    id: "23-react-performance-patterns",
    title: "Performance #23 - React Performance Patterns",
    excerpt: "React.memo, useMemo, useCallback, stable keys, React.lazy, and startTransition — when each one helps, when it hurts, and how to find what's actually slow with the React Profiler.",
    readTime: "10 min read",
    tags: ["Performance", "React", "JavaScript"],
    categories: ["performance"],
  },
  {
    id: "24-virtual-scrolling-windowing",
    title: "Performance #24 - Virtual Scrolling & Windowing",
    excerpt: "Rendering 10,000 list items creates 10,000 DOM nodes. Windowing renders only what's visible, keeping DOM count constant. Here's how react-window and @tanstack/virtual work.",
    readTime: "8 min read",
    tags: ["Performance", "React", "UI"],
    categories: ["performance"],
  },
  {
    id: "25-perceived-performance",
    title: "Performance #25 - Perceived Performance — Skeletons, Optimistic UI & Progress",
    excerpt: "A page can load in 2s and feel slow. Another takes 4s and feels fast. Skeleton screens, optimistic UI, blur-up images, and smart progress indicators close that gap.",
    readTime: "8 min read",
    tags: ["Performance", "UX", "UI"],
    categories: ["performance"],
  },
  {
    id: "26-bundle-optimization",
    title: "Performance #26 - Bundle Optimization — Tree Shaking & Code Splitting",
    excerpt: "JavaScript is the most expensive resource on the web. Tree shaking removes dead code; code splitting loads only what each page needs.",
    readTime: "10 min read",
    tags: ["Performance", "JavaScript", "Build"],
    categories: ["performance"],
  },
  {
    id: "27-third-party-scripts",
    title: "Performance #27 - Third-Party Scripts & the Facade Pattern",
    excerpt: "Third-party scripts are often the largest source of main-thread blocking time on production sites. Load-on-interaction, the facade pattern, and Partytown are your main tools.",
    readTime: "9 min read",
    tags: ["Performance", "JavaScript", "Optimization"],
    categories: ["performance"],
  },
  {
    id: "28-service-workers-and-caching",
    title: "Performance #28 - Service Workers & Caching Strategies",
    excerpt: "Service workers act as a programmable network proxy. Learn Cache-First, Network-First, and Stale-While-Revalidate strategies — and when each one makes sense.",
    readTime: "10 min read",
    tags: ["Performance", "Service Worker", "Caching"],
    categories: ["performance"],
  },
  {
    id: "29-adaptive-loading",
    title: "Performance #29 - Adaptive Loading — Network & Device-Aware Experiences",
    excerpt: "navigator.connection, deviceMemory, and hardwareConcurrency let you serve lighter experiences to constrained users. Here's how to use them without creating a degraded second-class experience.",
    readTime: "8 min read",
    tags: ["Performance", "Network", "UX"],
    categories: ["performance"],
  },
  {
    id: "30-performance-budgets",
    title: "Performance #30 - Performance Budgets & CI Enforcement",
    excerpt: "Without a budget, performance degrades silently — one PR at a time. Lighthouse CI and size-limit enforce metric and bundle-size constraints on every pull request.",
    readTime: "8 min read",
    tags: ["Performance", "CI", "Tooling"],
    categories: ["performance"],
  },

  /* ═══════════════════════════════════════════════════════════════
     JavaScript series
     ═══════════════════════════════════════════════════════════════ */
  {
    id: "settimeout-setinterval",
    title: "JavaScript Timers: setTimeout and setInterval",
    excerpt:
      "Master browser timers from scratch — schedule callbacks, repeat them, cancel them, and understand why they interact with the event loop the way they do. Every example is editable and runnable in the browser.",
    readTime: "10 min read",
    tags: ["JavaScript", "Timers", "Async", "Event Loop"],
    categories: ["javascript"],
  },

  /* ═══════════════════════════════════════════════════════════════
     React deep-dive
     ═══════════════════════════════════════════════════════════════ */
  {
    id: "react-virtual-dom-reconciliation",
    title: "How React Works Inside the Browser Pipeline",
    excerpt:
      "Virtual DOM, reconciliation, state batching, and concurrent rendering — explained in terms of the six browser pipeline steps every frame goes through.",
    readTime: "10 min read",
    tags: ["React", "Performance", "Browser", "JavaScript"],
    categories: ["react", "performance"],
  },

  /* ═══════════════════════════════════════════════════════════════
     Glossary — Browser Fundamentals
     ═══════════════════════════════════════════════════════════════ */
  {
    id: "what-is-dom",
    title: "What is the DOM?",
    excerpt: "The DOM is the browser's live, in-memory tree representation of an HTML document. Here's how it's structured, why DOM operations are expensive, and how it relates to the render tree.",
    readTime: "4 min read",
    tags: ["Browser", "Fundamentals"],
    categories: ["fundamentals"],
  },
  {
    id: "what-is-cssom",
    title: "What is the CSSOM?",
    excerpt: "The CSS Object Model is the browser's internal tree of all computed styles. It's render-blocking by design — here's why, and what that means for performance.",
    readTime: "4 min read",
    tags: ["Browser", "CSS", "Fundamentals"],
    categories: ["css", "fundamentals"],
  },
  {
    id: "what-is-css-specificity",
    title: "What is CSS Specificity?",
    excerpt: "Specificity is the four-column scoring system browsers use to decide which CSS rule wins. Inline > ID > class > element — here's how it works and why it matters.",
    readTime: "4 min read",
    tags: ["CSS", "Browser", "Fundamentals"],
    categories: ["css", "fundamentals"],
  },
  {
    id: "what-is-main-thread",
    title: "What is the Main Thread?",
    excerpt: "The browser's main thread runs JavaScript, layout, paint, and everything else — one task at a time. Here's what that means for performance and how to protect it.",
    readTime: "4 min read",
    tags: ["Browser", "Performance", "Fundamentals"],
    categories: ["performance", "fundamentals"],
  },
  {
    id: "what-is-compositor-thread",
    title: "What is the Compositor Thread?",
    excerpt: "The compositor thread assembles painted layers into the final screen image — independently of the main thread. It's why transform and opacity animations stay smooth under load.",
    readTime: "4 min read",
    tags: ["Browser", "Performance", "CSS", "Fundamentals"],
    categories: ["performance", "fundamentals"],
  },
  {
    id: "what-are-compositing-layers",
    title: "What are Compositing Layers?",
    excerpt: "Compositing layers are GPU-backed bitmaps the browser composites separately. They're why transform and opacity animations can run at 60fps without touching the main thread.",
    readTime: "5 min read",
    tags: ["Browser", "Performance", "CSS", "Fundamentals"],
    categories: ["performance", "fundamentals"],
  },
  {
    id: "what-is-preload-scanner",
    title: "What is the Preload Scanner?",
    excerpt: "The preload scanner is a secondary HTML parser that dispatches resource fetches while the main parser is blocked — it's why resources below a blocking script still load early.",
    readTime: "4 min read",
    tags: ["Browser", "Performance", "Fundamentals"],
    categories: ["performance", "fundamentals"],
  },

  /* ═══════════════════════════════════════════════════════════════
     Glossary — JavaScript & Runtime
     ═══════════════════════════════════════════════════════════════ */
  {
    id: "what-is-call-stack",
    title: "What is the Call Stack?",
    excerpt: "The call stack is the data structure the JS engine uses to track function execution. It's a single-threaded LIFO stack — here's how it works and why a busy stack freezes the page.",
    readTime: "4 min read",
    tags: ["JavaScript", "Event Loop", "Fundamentals"],
    categories: ["javascript", "fundamentals"],
  },
  {
    id: "what-is-microtask-queue",
    title: "What is the Microtask Queue?",
    excerpt: "Microtasks run after every task, before the next frame. Understanding when Promises execute — and how they can starve the task queue — requires knowing this queue.",
    readTime: "5 min read",
    tags: ["JavaScript", "Event Loop", "Fundamentals"],
    categories: ["javascript", "fundamentals"],
  },
  {
    id: "what-are-long-tasks",
    title: "What are Long Tasks?",
    excerpt: "Any main-thread task over 50ms is a long task. Here's why that threshold matters, how to find long tasks in DevTools, and how to break them up.",
    readTime: "5 min read",
    tags: ["Performance", "Browser", "Fundamentals"],
    categories: ["performance", "fundamentals"],
  },
  {
    id: "what-is-jit-compilation",
    title: "What is JIT Compilation?",
    excerpt: "JIT combines an interpreter (fast startup) with a compiler (fast execution) to make JavaScript run near native speed. Here's how V8's two-tier pipeline works.",
    readTime: "4 min read",
    tags: ["JavaScript", "V8", "Fundamentals"],
    categories: ["javascript", "fundamentals"],
  },
  {
    id: "what-is-requestanimationframe",
    title: "What is requestAnimationFrame?",
    excerpt: "requestAnimationFrame syncs your JavaScript to the display refresh rate. Here's how it works, why it's the right tool for JS animations, and how it differs from setTimeout.",
    readTime: "4 min read",
    tags: ["JavaScript", "Animation", "Browser", "Fundamentals"],
    categories: ["javascript", "fundamentals"],
  },
  {
    id: "what-is-debouncing",
    title: "What is Debouncing?",
    excerpt: "Debouncing ensures a function runs only once after a burst of rapid calls stops. Here's how it works, trailing vs leading edge, and when to use it over throttling.",
    readTime: "4 min read",
    tags: ["JavaScript", "Performance", "Fundamentals"],
    categories: ["javascript", "fundamentals"],
  },
  {
    id: "what-is-throttling",
    title: "What is Throttling?",
    excerpt: "Throttling limits a function to run at most once per interval, guaranteeing regular execution during bursts. Here's how it differs from debouncing and when each one fits.",
    readTime: "4 min read",
    tags: ["JavaScript", "Performance", "Fundamentals"],
    categories: ["javascript", "fundamentals"],
  },

  /* ═══════════════════════════════════════════════════════════════
     Glossary — React
     ═══════════════════════════════════════════════════════════════ */
  {
    id: "what-is-virtual-dom",
    title: "What is the Virtual DOM?",
    excerpt: "The Virtual DOM is an in-memory JavaScript tree React uses to batch DOM updates. Here's what it is, why it exists, and how it differs from the real DOM.",
    readTime: "4 min read",
    tags: ["React", "Browser", "Fundamentals"],
    categories: ["react", "fundamentals"],
  },
  {
    id: "what-is-reconciliation",
    title: "What is Reconciliation?",
    excerpt: "Reconciliation is how React diffs two Virtual DOM trees to find the minimum set of real DOM mutations. Here are the two assumptions that make it run in O(n).",
    readTime: "4 min read",
    tags: ["React", "Fundamentals"],
    categories: ["react", "fundamentals"],
  },
  {
    id: "what-is-react-fiber",
    title: "What is React Fiber?",
    excerpt: "Fiber is React's internal unit of work — a linked-list architecture that makes rendering interruptible, prioritisable, and resumable. It's the engine behind concurrent mode.",
    readTime: "5 min read",
    tags: ["React", "Fundamentals"],
    categories: ["react", "fundamentals"],
  },
  {
    id: "what-is-hydration",
    title: "What is Hydration?",
    excerpt: "Hydration is how React attaches event handlers to server-rendered HTML. Here's what actually happens, why it can be slow, and how React 18 makes it interruptible.",
    readTime: "5 min read",
    tags: ["React", "SSR", "Fundamentals"],
    categories: ["react", "fundamentals"],
  },
  {
    id: "what-is-react-suspense",
    title: "What is React Suspense?",
    excerpt: "Suspense lets a component wait for something before rendering — a lazy-loaded chunk, a data fetch — and shows a fallback in the meantime. Here's how the boundary works.",
    readTime: "4 min read",
    tags: ["React", "Fundamentals"],
    categories: ["react", "fundamentals"],
  },

  /* ═══════════════════════════════════════════════════════════════
     Glossary — Network & Performance Metrics
     ═══════════════════════════════════════════════════════════════ */
  {
    id: "what-is-ttfb",
    title: "What is TTFB?",
    excerpt: "Time to First Byte measures everything between sending a request and receiving the first byte — DNS, TCP, TLS, and server processing. It's the gate every other metric waits behind.",
    readTime: "4 min read",
    tags: ["Performance", "Browser", "Fundamentals"],
    categories: ["performance", "fundamentals"],
  },
  {
    id: "what-is-fcp",
    title: "What is First Contentful Paint (FCP)?",
    excerpt: "FCP measures the moment any content first appears on screen — the first visual feedback that the page is loading. Here's what delays it and how to improve it.",
    readTime: "4 min read",
    tags: ["Performance", "Metrics", "Fundamentals"],
    categories: ["performance", "fundamentals"],
  },
  {
    id: "what-is-cdn",
    title: "What is a CDN?",
    excerpt: "A CDN is a distributed network of servers that serve your content from locations close to each user. Here's how it reduces latency, what to put on it, and how it affects TTFB.",
    readTime: "4 min read",
    tags: ["Network", "Performance", "Fundamentals"],
    categories: ["performance", "fundamentals"],
  },
  {
    id: "what-is-dns",
    title: "What is DNS?",
    excerpt: "DNS translates domain names into IP addresses — and every network request starts with it. Here's how resolution works, what it costs in latency, and how to reduce that cost.",
    readTime: "4 min read",
    tags: ["Network", "Performance", "Fundamentals"],
    categories: ["performance", "fundamentals"],
  },
  {
    id: "what-is-cache-control",
    title: "What is Cache-Control?",
    excerpt: "Cache-Control is the HTTP header that controls browser and CDN caching. The right directives eliminate repeated downloads — here's what each one does and when to use it.",
    readTime: "4 min read",
    tags: ["Network", "Caching", "Performance", "Fundamentals"],
    categories: ["performance", "fundamentals"],
  },
  {
    id: "what-is-stale-while-revalidate",
    title: "What is Stale-While-Revalidate?",
    excerpt: "Serve a cached response instantly, revalidate in the background. The closest thing caching has to a free lunch — and when not to use it.",
    readTime: "5 min read",
    tags: ["Performance", "Caching", "Fundamentals"],
    categories: ["performance", "fundamentals"],
  },
  {
    id: "what-is-streaming-ssr",
    title: "What is Streaming SSR?",
    excerpt: "Streaming SSR sends HTML in chunks as each component's data resolves, rather than waiting for the full page. The shell arrives instantly; the rest streams in progressively.",
    readTime: "4 min read",
    tags: ["React", "SSR", "Performance", "Fundamentals"],
    categories: ["react", "fundamentals"],
  },

  /* ═══════════════════════════════════════════════════════════════
     Product articles
     ═══════════════════════════════════════════════════════════════ */
  {
    id: "web-performance-planner",
    title: "Web Performance Planner — Building a Lighthouse Score Simulator",
    excerpt:
      "A guide to using the Web Performance Planner — model your Core Web Vitals before shipping, diagnose an underperforming page, and get a ranked list of what to fix first.",
    readTime: "10 min read",
    tags: ["Performance", "React", "Web Vitals", "Engineering"],
    categories: ["performance", "product"],
  },
  {
    id: "holdings-analyzer",
    title: "Holdings Analyzer — A Portfolio Dashboard from Your Zerodha CSV",
    excerpt:
      "Upload your Zerodha Console holdings export and get a full portfolio dashboard: P&L, dividend income, valuation ratios, risk metrics, analyst ratings, and financial calculators — instantly.",
    readTime: "8 min read",
    tags: ["Finance", "React", "Portfolio", "NSE"],
    categories: ["product"],
  },

  /* ═══════════════════════════════════════════════════════════════
     LLM / AI
     ═══════════════════════════════════════════════════════════════ */
  {
    id: "claude-figma-mcp-integration",
    title: "Figma MCP Integration Guide",
    excerpt:
      "Learn how to connect Figma MCP with Claude, extract design context, and generate production-ready UI code efficiently.",
    readTime: "8 min read",
    tags: ["Figma", "Claude", "AI", "LLM"],
    categories: ["llm-metrics"],
  },
  {
    id: "figma-llm-problem",
    title: "The Real Problem with Figma + LLMs",
    excerpt:
      "Why AI-generated UI code from Figma designs is often inaccurate, and how to fix it through better design structure.",
    readTime: "12 min read",
    tags: ["Design", "AI", "Engineering"],
    categories: ["llm-metrics"],
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
