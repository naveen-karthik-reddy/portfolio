# Articles Reference

> Single source of truth for all articles. Update this file whenever an article is added, removed, or significantly changed.

---

## Table of Contents

### Performance Series
- [Performance #1 - How the Browser Renders a Page](#article-01-browser-rendering-pipeline)
- [Performance #2 - The Critical Rendering Path](#article-02-critical-rendering-path)
- [Performance #3 - Reflow, Repaint & Layout Thrashing](#article-03-reflow-repaint-layout-thrashing)
- [Performance #4 - CSS & JS Animations — Compositor-Only Properties & rAF](#article-04-css-js-animations)
- [Performance #5 - CSS Containment & content-visibility](#article-05-css-containment)
- [Performance #6 - The JavaScript Event Loop & Task Queue](#article-06-event-loop-task-queue)
- [Performance #7 - DevTools Performance Profiler](#article-07-devtools-performance-profiler)
- [Performance #8 - Core Web Vitals & The Full Metrics Stack](#article-08-core-web-vitals)
- [Performance #9 - Lighthouse & Real User Monitoring](#article-09-lighthouse-and-rum)
- [Performance #10 - Resource Loading Strategies](#article-10-resource-loading-strategies)
- [Performance #11 - Image Optimization — WebP, AVIF, srcset & Lazy Loading](#article-11-image-optimization)
- [Performance #12 - Font Optimization](#article-12-font-optimization)
- [Performance #13 - Compression — Brotli & Gzip](#article-13-compression-brotli-gzip)
- [Performance #14 - Browser Networking & Caching](#article-14-browser-networking-and-caching)
- [Performance #15 - HTTP/2 & HTTP/3 — What Changes for Performance](#article-15-http2-and-http3)
- [Performance #16 - Resource Hints — Preload, Prefetch, Preconnect](#article-16-resource-hints)
- [Performance #17 - Priority Hints & Fetch Priority](#article-17-priority-hints-fetch-priority)
- [Performance #18 - Intersection Observer, Debouncing & Throttling](#article-18-intersection-observer-debounce-throttle)
- [Performance #19 - V8 & JIT Compilation — How JS Engines Optimize Your Code](#article-19-v8-jit-compilation)
- [Performance #20 - Memory Leaks & Garbage Collection](#article-20-memory-leaks-garbage-collection)
- [Performance #21 - Web Workers & OffscreenCanvas](#article-21-web-workers-offscreencanvas)
- [Performance #22 - SSR vs CSR vs SSG vs ISR](#article-22-ssr-csr-ssg-isr)
- [Performance #23 - React Performance Patterns](#article-23-react-performance-patterns)
- [Performance #24 - Virtual Scrolling & Windowing](#article-24-virtual-scrolling-windowing)
- [Performance #25 - Perceived Performance — Skeletons, Optimistic UI & Progress](#article-25-perceived-performance)
- [Performance #26 - Bundle Optimization — Tree Shaking & Code Splitting](#article-26-bundle-optimization)
- [Performance #27 - Third-Party Scripts & the Facade Pattern](#article-27-third-party-scripts)
- [Performance #28 - Service Workers & Caching Strategies](#article-28-service-workers-and-caching)
- [Performance #29 - Adaptive Loading — Network & Device-Aware Experiences](#article-29-adaptive-loading)
- [Performance #30 - Performance Budgets & CI Enforcement](#article-30-performance-budgets)

### JS Foundations (Level 1)
- [JS Foundations #1 — Variables, Scope & Hoisting](#article-js-variables-scope-hoisting)
- [JS Foundations #2 — this Demystified](#article-js-this-demystified)
- [JS Foundations #3 — Closures & Lexical Scope](#article-js-closures-lexical-scope)
- [JS Foundations #4 — Prototypes & Inheritance](#article-js-prototypes-inheritance)
- [JS Foundations #5 — Equality & Type Coercion](#article-js-equality-coercion)
- [JS Foundations #6 — Error Handling](#article-js-error-handling)
- [JS Foundations #7 — Destructuring, Spread & Rest](#article-js-destructuring-spread-rest)
- [JS Foundations #8 — Template Literals & Tagged Templates](#article-js-template-literals)
- [JS Foundations #9 — Data Types & Type Checking](#article-js-data-types)
- [Type Checking Quick Reference](#article-js-type-checking)
- [JS Foundations #10 — Numbers & Math](#article-js-numbers-math)
- [JS Foundations #11 — String Methods Reference](#article-js-string-methods)
- [JS Foundations #12 — Regular Expressions](#article-js-regex-basics)
- [JS Foundations #13 — Date & Time](#article-js-date-time)
- [Error Handling #2 — AggregateError, Error-First Callbacks & Promise Errors](#article-js-error-patterns)

### Functions & Arrays (Level 2)
- [Functions #1 — call(), apply() & bind() Polyfills](#article-js-call-apply-bind)
- [Functions #2 — Currying & Partial Application](#article-js-currying-partial-application)
- [Functions #3 — Debounce & Throttle](#article-js-debounce-throttle)
- [Arrays #1 — map, filter, reduce Polyfills](#article-js-array-methods-polyfills-1)
- [Arrays #2 — flat, flatMap, find, every, some Polyfills](#article-js-array-methods-polyfills-2)
- [Arrays #3 — Array Methods Usage Reference](#article-js-array-methods-reference)
- [Functions #4 — memoize() & once()](#article-js-memoize-once)
- [Recursion Patterns — Tree Walk, Permutations & More](#article-js-recursion-patterns)
- [Data #1 — Deep Clone & Deep Compare](#article-js-deep-clone-compare)
- [Data #2 — Flatten & Unflatten Nested Objects](#article-js-flatten-unflatten-object)
- [Data #2.5 — Object Methods & Utilities](#article-js-object-methods)

### Async JavaScript (Level 3)
- [Async #1 — The Event Loop in Depth](#article-js-event-loop-in-depth)
- [Async #2 — setTimeout & setInterval Deep Dive](#article-settimeout-setinterval)
- [Async #3 — Building a Promise from Scratch](#article-js-promise-from-scratch)
- [Async #4 — Promise.all, allSettled, race, any](#article-js-promise-combinators)
- [Async #5 — async/await Under the Hood](#article-js-async-await-under-hood)
- [Async #6 — Generators & Iterators](#article-js-generators-iterators)
- [Async #7 — Async Iteration](#article-js-async-iteration)
- [Async #8 — Concurrency Control & Retry Patterns](#article-js-concurrency-limits)
- [Async #9 — AbortController & Cancelable Async](#article-js-abort-controller)

### Objects & Data (Level 4)
- [Data #3 — Map, Set, WeakMap, WeakSet Polyfills](#article-js-map-set-weakmap-weakset)
- [Data #3a — Map in JavaScript](#article-js-map)
- [Data #3b — Set in JavaScript](#article-js-set)
- [Prototypes #2 — Object.create() & instanceof Polyfills](#article-js-object-create-instanceof)
- [Symbols — Well-Known Symbols, Hidden Properties & More](#article-js-symbols-in-depth)
- [Proxy & Reflect — Validation, Observables & Traps](#article-js-proxy-reflect-api)
- [Parsing #1 — Building a Simple JSON.stringify()](#article-js-json-stringify-parser)
- [Parsing #2 — URL & Query String Parsing](#article-js-url-query-parser)
- [Parsing #3 — Building a Template Engine](#article-js-string-templating-engine)

### Engine Internals (Level 5)
- [V8 #1 — JIT Compilation & Hidden Classes](#article-js-v8-jit-compilation)
- [V8 #2 — Memory Leaks & Garbage Collection](#article-js-memory-leaks-gc)
- [Engine #1 — Hoisting & TDZ: What the Engine Actually Does](#article-js-hoisting-tdz-deep)
- [Modules — IIFE, CommonJS, AMD, ESM](#article-js-module-systems)
- [Classes Under the Hood — Desugaring to Prototypes](#article-js-classes-under-hood)
- [Classes — Practical Guide](#article-js-classes-practical)
- [V8 #3 — Deoptimization Patterns](#article-js-deopt-patterns)

### Design Patterns & Data Structures (Level 6)
- [Patterns #1 — Event Emitter / Pub-Sub](#article-js-event-emitter)
- [Patterns #2 — Observer Pattern & Reactive Primitives](#article-js-observer-pattern)
- [Patterns #3 — Singleton, Factory & Constructor](#article-js-singleton-factory-patterns)
- [Data Structures #1 — Linked List](#article-js-linked-list)
- [Data Structures #2 — Hash Table](#article-js-hash-table)
- [Data Structures #3 — LRU Cache](#article-js-lru-cache)
- [Data Structures #4 — Binary Heap & Priority Queue](#article-js-binary-heap-priority-queue)
- [Data Structures #5 — Trie (Prefix Tree)](#article-js-trie-prefix-tree)

### Functional Programming (Level 7)
- [FP #1 — compose() & pipe()](#article-js-compose-pipe)
- [FP #2 — transduce() — Map + Filter in One Pass](#article-js-transduce)
- [FP #3 — Maybe & Either Monads](#article-js-maybe-either-monad)
- [FP #4 — Point-Free Style & Referential Transparency](#article-js-point-free-style)
- [FP #5 — Immutability Patterns](#article-js-immutability-patterns)

### Browser & Web APIs (Level 8)
- [DOM Basics — Element Selection, Traversal & Styles](#article-js-dom-basics)
- [Web APIs #1 — requestAnimationFrame & requestIdleCallback](#article-js-requestanimationframe-idlecallback)
- [Web APIs #2 — Web Workers & OffscreenCanvas](#article-js-web-workers-offscreen)
- [Web APIs #3 — Intersection Observer](#article-js-intersection-observer)
- [DOM Events #1 — Event Delegation & Bubbling](#article-js-event-delegation-bubbling)
- [DOM Events #2 — Drag & Drop](#article-js-drag-and-drop)
- [Web APIs #4 — localStorage, Cookies, sessionStorage & IndexedDB](#article-js-storage-cookies-indexeddb)

### Interview Implementation Problems
- [Interview #1 — Implement call(), apply() & bind() from Scratch](#article-js-interview-call-apply-bind)
- [Interview #2 — Implement map(), filter() & reduce() from Scratch](#article-js-interview-map-filter-reduce)
- [Interview #3 — Make Counter: The Classic Closure Question](#article-js-interview-make-counter)
- [Interview #4 — Implement once() — A Function That Runs At Most Once](#article-js-interview-once)
- [Interview #5 — Type Utilities: typeof, instanceof & Custom Type Checks](#article-js-interview-type-utilities)
- [Interview #6 — Implement Lodash's _.get() for Safe Nested Access](#article-js-interview-get)
- [Interview #7 — Implement sleep() — Pausing Execution with Promises](#article-js-interview-sleep)
- [Interview #8 — Implement debounce() with cancel() and flush()](#article-js-interview-debounce)
- [Interview #9 — Implement throttle() with Trailing Edge](#article-js-interview-throttle)
- [Interview #10 — Implement memoize() with Custom Key Resolver](#article-js-interview-memoize)
- [Interview #11 — Implement curry() — Fixed Arity and Variadic](#article-js-interview-curry)
- [Interview #12 — Implement Array flatten() with Depth Control](#article-js-interview-flatten)
- [Interview #13 — Implement deepClone() for JSON-Serializable Values](#article-js-interview-deep-clone)
- [Interview #14 — Implement deepEqual() for Structural Comparison](#article-js-interview-deep-equal)
- [Interview #15 — Implement deepOmit() — Remove Keys from Nested Objects](#article-js-interview-deep-omit)
- [Interview #16 — Implement squash() — Flatten Nested Objects to Dot Paths](#article-js-interview-squash-object)
- [Interview #17 — Implement a Simplified JSON.stringify()](#article-js-interview-json-stringify)
- [Interview #18 — Implement Promise.all, race, any & allSettled](#article-js-interview-promise-combinators)
- [Interview #19 — Implement promisify() — Convert Callbacks to Promises](#article-js-interview-promisify)
- [Interview #20 — Implement promiseTimeout() — Race a Promise Against a Deadline](#article-js-interview-promise-timeout)
- [Interview #21 — Implement mapAsync() and mapAsyncLimit()](#article-js-interview-map-async)
- [Interview #22 — Implement an EventEmitter with on, off, emit & once](#article-js-interview-event-emitter)
- [Interview #23 — Implement classnames() — Conditional CSS Class Joining](#article-js-interview-classnames)
- [Interview #24 — Implement getElementsByClassName, TagName & Style](#article-js-interview-dom-traversal)
- [Interview #25 — Implement Data Merging — Combine Rows by User](#article-js-interview-data-merging)
- [Interview #26 — Implement countBy() — Group and Count Array Elements](#article-js-interview-count-by)
- [Interview #27 — Implement listFormat() — Human-Readable List Strings](#article-js-interview-list-format)
- [Interview #28 — Deep Clone with Circular Reference Handling](#article-js-interview-deep-clone-circular)
- [Interview #29 — Variadic curry() — Call with Any Number of Args](#article-js-interview-curry-variadic)
- [Interview #30 — Implement a Data Selection / Filter Engine](#article-js-interview-data-selection)

### Interview Output Problems
- [Output Quiz #1 — Scope, Hoisting & the TDZ](#article-js-output-scope-hoisting)
- [Output Quiz #2 — Closures & the Loop Problem](#article-js-output-closures)
- [Output Quiz #3 — The Event Loop & Task Ordering](#article-js-output-event-loop)
- [Output Quiz #4 — this Binding & Arrow Functions](#article-js-output-this-binding)
- [Output Quiz #5 — Type Coercion & Equality Traps](#article-js-output-type-coercion)
- [Output Quiz #6 — Promises & async/await Ordering](#article-js-output-promises-async)
- [Output Quiz #7 — Promise Chaining & the .catch() Recovery Rules](#article-js-output-promise-chaining)
- [Output Quiz #8 — Promise.all, race, allSettled & any](#article-js-output-promise-combinators)
- [Output Quiz #9 — async/await Patterns & the return vs return await Trap](#article-js-output-async-patterns)
- [Output Quiz #10 — setTimeout + Promises: Real-World Interleaving](#article-js-output-settimeout-promise)
- [Output Quiz #11 — Async Error Propagation](#article-js-output-async-errors)
- [Output Quiz #12 — Microtask Queue: Breadth-First Ordering](#article-js-output-microtask-order)
- [Output Quiz #13 — Mixed Async Topics (Easy)](#article-js-output-mixed-easy)
- [Output Quiz #14 — Mixed Async Topics (Hard)](#article-js-output-mixed-hard)

### React Deep-Dive
- [How React Works Inside the Browser Pipeline](#article-react-virtual-dom-reconciliation)

### Glossary — React
- [What is the Virtual DOM?](#article-what-is-virtual-dom)
- [What is Reconciliation?](#article-what-is-reconciliation)
- [What is React Fiber?](#article-what-is-react-fiber)
- [What is Hydration?](#article-what-is-hydration)
- [What is React Suspense?](#article-what-is-react-suspense)
- [What is Streaming SSR?](#article-what-is-streaming-ssr)

### Glossary — Browser Fundamentals
- [What is the DOM?](#article-what-is-dom)
- [What is the CSSOM?](#article-what-is-cssom)
- [What is CSS Specificity?](#article-what-is-css-specificity)
- [What is the Main Thread?](#article-what-is-main-thread)
- [What is the Compositor Thread?](#article-what-is-compositor-thread)
- [What are Compositing Layers?](#article-what-are-compositing-layers)
- [What is the Preload Scanner?](#article-what-is-preload-scanner)
- [What is Parsing?](#article-what-is-parsing)
- [What is Rendering?](#article-what-is-rendering)

### Glossary — JavaScript & Runtime
- [What is the Call Stack?](#article-what-is-call-stack)
- [What is the Microtask Queue?](#article-what-is-microtask-queue)
- [What are Long Tasks?](#article-what-are-long-tasks)
- [What is JIT Compilation?](#article-what-is-jit-compilation)
- [What is requestAnimationFrame?](#article-what-is-requestanimationframe)
- [What is Debouncing?](#article-what-is-debouncing)
- [What is Throttling?](#article-what-is-throttling)

### Glossary — Network & Performance Metrics
- [What is TTFB?](#article-what-is-ttfb)
- [What is First Contentful Paint (FCP)?](#article-what-is-fcp)
- [What is a CDN?](#article-what-is-cdn)
- [What is DNS?](#article-what-is-dns)
- [What is Cache-Control?](#article-what-is-cache-control)
- [What is Stale-While-Revalidate?](#article-what-is-stale-while-revalidate)

### Product Articles
- [Web Performance Planner — Building a Lighthouse Score Simulator](#article-web-performance-planner)
- [Holdings Analyzer — A Portfolio Dashboard from Your Zerodha CSV](#article-holdings-analyzer)

### LLM / AI
- [Figma MCP Integration Guide](#article-claude-figma-mcp-integration)
- [The Real Problem with Figma + LLMs](#article-figma-llm-problem)


---

---

<a name="article-01-browser-rendering-pipeline"></a>

## Article: Performance #1 - How the Browser Renders a Page

| Field | Value |
|-------|-------|
| **ID / Slug** | `01-browser-rendering-pipeline` |
| **URL** | `/articles/01-browser-rendering-pipeline` |
| **Series / Category** | performance |
| **Tags** | Performance, Browser, Fundamentals |
| **Read Time** | 9 min read |
| **Previous** | — |
| **Next** | `02-critical-rendering-path` — Performance #2 - The Critical Rendering Path |

**Excerpt:** From HTML bytes to pixels: DOM, CSSOM, Render Tree, Layout, Paint, and Compositing — the six steps every browser frame goes through.

**Sections:**
- From Bytes to Pixels: The Six Steps
- Step 1: Parsing HTML → DOM
- Step 2: Parsing CSS → CSSOM
- Step 3: Combining Them → Render Tree
- Step 4: Layout
- Step 5: Paint
- Step 6: Compositing
- The Main Thread vs the Compositor
- Frame Budget
- Where to Go Next

**External Links:** None

---

<a name="article-02-critical-rendering-path"></a>

## Article: Performance #2 - The Critical Rendering Path

| Field | Value |
|-------|-------|
| **ID / Slug** | `02-critical-rendering-path` |
| **URL** | `/articles/02-critical-rendering-path` |
| **Series / Category** | performance |
| **Tags** | Performance, Browser, CRP |
| **Read Time** | 8 min read |
| **Previous** | `01-browser-rendering-pipeline` — Performance #1 - How the Browser Renders a Page |
| **Next** | `03-reflow-repaint-layout-thrashing` — Performance #3 - Reflow, Repaint & Layout Thrashing |

**Excerpt:** The browser can't paint until CSS is parsed and blocking scripts are executed. Understanding the CRP is the first step to a fast first paint.

**Sections:**
- What Makes a Resource "Render-Blocking"?
- Why CSS Blocks Rendering
- Why JavaScript Blocks the Parser
- async and defer: Breaking the Block
- Preload Scanner
- Measuring the CRP
- CRP Optimisation Checklist

**External Links:** None

---

<a name="article-03-reflow-repaint-layout-thrashing"></a>

## Article: Performance #3 - Reflow, Repaint & Layout Thrashing

| Field | Value |
|-------|-------|
| **ID / Slug** | `03-reflow-repaint-layout-thrashing` |
| **URL** | `/articles/03-reflow-repaint-layout-thrashing` |
| **Series / Category** | performance |
| **Tags** | Performance, Browser, Rendering |
| **Read Time** | 8 min read |
| **Previous** | `02-critical-rendering-path` — Performance #2 - The Critical Rendering Path |
| **Next** | `04-css-js-animations` — Performance #4 - CSS & JS Animations — Compositor-Only Properties & rAF |

**Excerpt:** Interleaving DOM reads and writes in a loop forces the browser to recalculate layout dozens of times per frame. Here's what it is and how to stop it.

**Sections:**
- Reflow vs Repaint: What's the Difference?
- The "Dirty Bit" — Why Forced Sync Layout Happens
- What Is Layout Thrashing?
- Layout-Triggering Properties
- The Main Thread and Long Tasks
- Practical Fixes

**External Links:** None

---

<a name="article-04-css-js-animations"></a>

## Article: Performance #4 - CSS & JS Animations — Compositor-Only Properties & rAF

| Field | Value |
|-------|-------|
| **ID / Slug** | `04-css-js-animations` |
| **URL** | `/articles/04-css-js-animations` |
| **Series / Category** | performance |
| **Tags** | Performance, Animation, CSS |
| **Read Time** | 8 min read |
| **Previous** | `03-reflow-repaint-layout-thrashing` — Performance #3 - Reflow, Repaint & Layout Thrashing |
| **Next** | `05-css-containment` — Performance #5 - CSS Containment & content-visibility |

**Excerpt:** Animate only transform and opacity to stay on the compositor thread. Here's why those two properties are free, and how requestAnimationFrame keeps JS animations in sync with the browser.

**Sections:**
- The Rendering Cost of Animations
- Compositor-Only Properties
- CSS Transitions vs CSS Animations vs JS Animations
- requestAnimationFrame
- The `will-change` Property
- Accessibility: `prefers-reduced-motion`
- Detecting Jank

**External Links:** None

---

<a name="article-05-css-containment"></a>

## Article: Performance #5 - CSS Containment & content-visibility

| Field | Value |
|-------|-------|
| **ID / Slug** | `05-css-containment` |
| **URL** | `/articles/05-css-containment` |
| **Series / Category** | performance |
| **Tags** | Performance, CSS, Rendering |
| **Read Time** | 7 min read |
| **Previous** | `04-css-js-animations` — Performance #4 - CSS & JS Animations — Compositor-Only Properties & rAF |
| **Next** | `06-event-loop-task-queue` — Performance #6 - The JavaScript Event Loop & Task Queue |

**Excerpt:** CSS containment tells the browser a subtree is isolated, so it can skip work it would otherwise do. content-visibility: auto can cut rendering time by 5-10x on content-heavy pages.

**Sections:**
- What CSS Containment Does
- content-visibility: auto
- When to Use Each
- Real-World Impact
- Caveats
- Measuring the Impact

**External Links:**
- [CSS Containment spec](https://www.w3.org/TR/css-contain-2/)

---

<a name="article-06-event-loop-task-queue"></a>

## Article: Performance #6 - The JavaScript Event Loop & Task Queue

| Field | Value |
|-------|-------|
| **ID / Slug** | `06-event-loop-task-queue` |
| **URL** | `/articles/06-event-loop-task-queue` |
| **Series / Category** | performance |
| **Tags** | Performance, JavaScript, Runtime |
| **Read Time** | 9 min read |
| **Previous** | `05-css-containment` — Performance #5 - CSS Containment & content-visibility |
| **Next** | `07-devtools-performance-profiler` — Performance #7 - DevTools Performance Profiler |

**Excerpt:** JavaScript is single-threaded. Understanding the event loop, microtask queue, and long tasks is the foundation for knowing why pages freeze and how to fix it.

**Sections:**
- The Call Stack
- Web APIs and the Task Queue
- Microtasks vs Macrotasks
- Long Tasks
- Breaking Up Long Tasks
- requestIdleCallback

**External Links:** None

---

<a name="article-07-devtools-performance-profiler"></a>

## Article: Performance #7 - DevTools Performance Profiler

| Field | Value |
|-------|-------|
| **ID / Slug** | `07-devtools-performance-profiler` |
| **URL** | `/articles/07-devtools-performance-profiler` |
| **Series / Category** | performance |
| **Tags** | Performance, DevTools, Profiling |
| **Read Time** | 8 min read |
| **Previous** | `06-event-loop-task-queue` — Performance #6 - The JavaScript Event Loop & Task Queue |
| **Next** | `08-core-web-vitals` — Performance #8 - Core Web Vitals & The Full Metrics Stack |

**Excerpt:** Chrome DevTools' Performance panel gives you a frame-by-frame trace of everything the browser did. Here's how to read flame charts, spot long tasks, and find layout thrashing.

**Sections:**
- Recording a Trace
- The Timeline Overview
- Reading the Flame Chart
- Long Tasks
- Layout Thrashing in the Trace
- Memory Timeline
- The Rendering Tab

**External Links:** None

---

<a name="article-08-core-web-vitals"></a>

## Article: Performance #8 - Core Web Vitals & The Full Metrics Stack

| Field | Value |
|-------|-------|
| **ID / Slug** | `08-core-web-vitals` |
| **URL** | `/articles/08-core-web-vitals` |
| **Series / Category** | performance |
| **Tags** | Performance, Web Vitals, Metrics |
| **Read Time** | 12 min read |
| **Previous** | `07-devtools-performance-profiler` — Performance #7 - DevTools Performance Profiler |
| **Next** | `09-lighthouse-and-rum` — Performance #9 - Lighthouse & Real User Monitoring |

**Excerpt:** LCP, CLS, INP are the ranking signals — but TTFB, FCP, TBT, TTI, and Speed Index explain why they fail. This covers all web vitals: what each measures, how they relate, and how to fix them.

**Sections:**
- The Two Tiers
- Core Web Vitals
- Other Web Vitals — Diagnostic Metrics
- How the Metrics Relate
- Field Data vs Lab Data
- Prioritising Fixes
- Where to Go Next

**External Links:** None

---

<a name="article-09-lighthouse-and-rum"></a>

## Article: Performance #9 - Lighthouse & Real User Monitoring

| Field | Value |
|-------|-------|
| **ID / Slug** | `09-lighthouse-and-rum` |
| **URL** | `/articles/09-lighthouse-and-rum` |
| **Series / Category** | performance |
| **Tags** | Performance, Lighthouse, Metrics |
| **Read Time** | 8 min read |
| **Previous** | `08-core-web-vitals` — Performance #8 - Core Web Vitals & The Full Metrics Stack |
| **Next** | `10-resource-loading-strategies` — Performance #10 - Resource Loading Strategies |

**Excerpt:** Lab data tells you what's broken. Field data tells you what real users experience. Here's how Lighthouse scoring works and when RUM fills the gaps.

**Sections:**
- Lab Data vs Field Data
- How Lighthouse Works
- The Scoring Model
- Beyond the Score: Audits, Opportunities & Diagnostics
- Lighthouse Modes
- Lighthouse's Limitations
- Real User Monitoring (RUM)
- Using Both Together

**External Links:** None

---

<a name="article-10-resource-loading-strategies"></a>

## Article: Performance #10 - Resource Loading Strategies

| Field | Value |
|-------|-------|
| **ID / Slug** | `10-resource-loading-strategies` |
| **URL** | `/articles/10-resource-loading-strategies` |
| **Series / Category** | performance |
| **Tags** | Performance, Loading, Optimization |
| **Read Time** | 11 min read |
| **Previous** | `09-lighthouse-and-rum` — Performance #9 - Lighthouse & Real User Monitoring |
| **Next** | `11-image-optimization` — Performance #11 - Image Optimization — WebP, AVIF, srcset & Lazy Loading |

**Excerpt:** How you load fonts, CSS, scripts, and images is as important as what you load. This covers FOIT/FOUT, critical CSS, async JS, and lazy loading.

**Sections:**
- Font Loading: FOIT, FOUT, and font-display
- Critical CSS vs Non-Critical CSS
- JavaScript Loading Patterns
- Lazy Loading: Images, Components, and Routes
- Putting It All Together

**External Links:**
- [critical](https://github.com/addyosmani/critical)

---

<a name="article-11-image-optimization"></a>

## Article: Performance #11 - Image Optimization — WebP, AVIF, srcset & Lazy Loading

| Field | Value |
|-------|-------|
| **ID / Slug** | `11-image-optimization` |
| **URL** | `/articles/11-image-optimization` |
| **Series / Category** | performance |
| **Tags** | Performance, Images, Optimization |
| **Read Time** | 9 min read |
| **Previous** | `10-resource-loading-strategies` — Performance #10 - Resource Loading Strategies |
| **Next** | `12-font-optimization` — Performance #12 - Font Optimization |

**Excerpt:** Images are the largest resources on most pages and the most common cause of slow LCP. Here's how to choose the right format, serve the right size, and prevent layout shift.

**Sections:**
- Choosing the Right Format
- Responsive Images with srcset and sizes
- Preventing Layout Shift
- Native Lazy Loading
- Decoding
- The LCP Image

**External Links:** None

---

<a name="article-12-font-optimization"></a>

## Article: Performance #12 - Font Optimization

| Field | Value |
|-------|-------|
| **ID / Slug** | `12-font-optimization` |
| **URL** | `/articles/12-font-optimization` |
| **Series / Category** | performance |
| **Tags** | Performance, Fonts, Loading |
| **Read Time** | 8 min read |
| **Previous** | `11-image-optimization` — Performance #11 - Image Optimization — WebP, AVIF, srcset & Lazy Loading |
| **Next** | `13-compression-brotli-gzip` — Performance #13 - Compression — Brotli & Gzip |

**Excerpt:** Custom fonts cause invisible text, layout shift, and extra network round trips. font-display, self-hosting, subsetting, and variable fonts — here's what each one fixes.

**Sections:**
- How Fonts Load
- font-display
- Self-Hosting vs Google Fonts
- Subsetting
- Preloading Critical Fonts
- Variable Fonts

**External Links:**
- [Font Style Matcher](https://meowni.ca/font-style-matcher/)

---

<a name="article-13-compression-brotli-gzip"></a>

## Article: Performance #13 - Compression — Brotli & Gzip

| Field | Value |
|-------|-------|
| **ID / Slug** | `13-compression-brotli-gzip` |
| **URL** | `/articles/13-compression-brotli-gzip` |
| **Series / Category** | performance |
| **Tags** | Performance, Network, Compression |
| **Read Time** | 7 min read |
| **Previous** | `12-font-optimization` — Performance #12 - Font Optimization |
| **Next** | `14-browser-networking-and-caching` — Performance #14 - Browser Networking & Caching |

**Excerpt:** Text-based resources compress by 60-75%. Brotli saves another 15-25% over Gzip. Here's how both work, how to pre-compress at build time, and what never to compress.

**Sections:**
- How Compression Works
- Gzip vs Brotli
- Static vs Dynamic Compression
- Server Configuration
- What to Compress (and What Not To)
- Checking Compression in DevTools

**External Links:** None

---

<a name="article-14-browser-networking-and-caching"></a>

## Article: Performance #14 - Browser Networking & Caching

| Field | Value |
|-------|-------|
| **ID / Slug** | `14-browser-networking-and-caching` |
| **URL** | `/articles/14-browser-networking-and-caching` |
| **Series / Category** | performance |
| **Tags** | Performance, Network, Caching |
| **Read Time** | 10 min read |
| **Previous** | `13-compression-brotli-gzip` — Performance #13 - Compression — Brotli & Gzip |
| **Next** | `15-http2-and-http3` — Performance #15 - HTTP/2 & HTTP/3 — What Changes for Performance |

**Excerpt:** Every resource travels through DNS, TCP, TLS, and HTTP before it arrives. Understanding this journey — and HTTP caching — is core to reducing load times.

**Sections:**
- The Journey of a Network Request
- Stage 1: DNS Resolution
- Stage 2: TCP Handshake
- Stage 3: TLS Handshake
- Stage 4: HTTP Request / Response
- HTTP Caching: Cache-Control and ETag
- CDN and Edge Delivery
- The Full Request Timeline

**External Links:** None

---

<a name="article-15-http2-and-http3"></a>

## Article: Performance #15 - HTTP/2 & HTTP/3 — What Changes for Performance

| Field | Value |
|-------|-------|
| **ID / Slug** | `15-http2-and-http3` |
| **URL** | `/articles/15-http2-and-http3` |
| **Series / Category** | performance |
| **Tags** | Performance, Network, HTTP |
| **Read Time** | 8 min read |
| **Previous** | `14-browser-networking-and-caching` — Performance #14 - Browser Networking & Caching |
| **Next** | `16-resource-hints` — Performance #16 - Resource Hints — Preload, Prefetch, Preconnect |

**Excerpt:** HTTP/1.1's bottlenecks drove concatenation and sprites. HTTP/2 multiplexing and HTTP/3 QUIC change the rules — here's what still matters.

**Sections:**
- The HTTP/1.1 Bottleneck
- HTTP/2: Multiplexing and More
- What Changes for Optimisation with HTTP/2
- HTTP/3 and QUIC
- What HTTP/3 Changes for Optimisation

**External Links:** None

---

<a name="article-16-resource-hints"></a>

## Article: Performance #16 - Resource Hints — Preload, Prefetch, Preconnect

| Field | Value |
|-------|-------|
| **ID / Slug** | `16-resource-hints` |
| **URL** | `/articles/16-resource-hints` |
| **Series / Category** | performance |
| **Tags** | Performance, Optimization, Network |
| **Read Time** | 7 min read |
| **Previous** | `15-http2-and-http3` — Performance #15 - HTTP/2 & HTTP/3 — What Changes for Performance |
| **Next** | `17-priority-hints-fetch-priority` — Performance #17 - Priority Hints & Fetch Priority |

**Excerpt:** Give the browser advance notice about what it will need. Used correctly, resource hints eliminate dead time in the network waterfall.

**Sections:**
- dns-prefetch: Resolve Early
- preconnect: Skip the Handshake
- preload: Fetch Critical Assets Now
- prefetch: Fetch for the Next Page
- modulepreload: ES Module Optimisation
- Summary: Which Hint to Use
- Common Mistakes

**External Links:** None

---

<a name="article-17-priority-hints-fetch-priority"></a>

## Article: Performance #17 - Priority Hints & Fetch Priority

| Field | Value |
|-------|-------|
| **ID / Slug** | `17-priority-hints-fetch-priority` |
| **URL** | `/articles/17-priority-hints-fetch-priority` |
| **Series / Category** | performance |
| **Tags** | Performance, Network, Optimization |
| **Read Time** | 7 min read |
| **Previous** | `16-resource-hints` — Performance #16 - Resource Hints — Preload, Prefetch, Preconnect |
| **Next** | `18-intersection-observer-debounce-throttle` — Performance #18 - Intersection Observer, Debouncing & Throttling |

**Excerpt:** The browser's resource prioritization heuristics are good but not perfect. fetchpriority lets you correct them — boosting the LCP image, deprioritizing non-critical scripts.

**Sections:**
- How the Browser Prioritizes Resources
- The fetchpriority Attribute
- The LCP Image Use Case
- Deprioritizing Non-Critical Resources
- fetch() API
- How Priority Tiers Work
- Verifying in DevTools
- What It Doesn't Do

**External Links:** None

---

<a name="article-18-intersection-observer-debounce-throttle"></a>

## Article: Performance #18 - Intersection Observer, Debouncing & Throttling

| Field | Value |
|-------|-------|
| **ID / Slug** | `18-intersection-observer-debounce-throttle` |
| **URL** | `/articles/18-intersection-observer-debounce-throttle` |
| **Series / Category** | performance |
| **Tags** | Performance, JavaScript, Runtime |
| **Read Time** | 9 min read |
| **Previous** | `17-priority-hints-fetch-priority` — Performance #17 - Priority Hints & Fetch Priority |
| **Next** | `19-v8-jit-compilation` — Performance #19 - V8 & JIT Compilation — How JS Engines Optimize Your Code |

**Excerpt:** Scroll events fire hundreds of times per second. Intersection Observer, debouncing, and throttling are the tools that keep your handlers from hammering the main thread.

**Sections:**
- The Scroll Handler Problem
- Intersection Observer: Visibility-Driven Logic
- [Debouncing](/articles/what-is-debouncing): Delay Until Things Settle
- [Throttling](/articles/what-is-throttling): Enforce a Rate Limit
- Debounce vs Throttle: When to Use Which
- Combining Techniques

**External Links:** None

---

<a name="article-19-v8-jit-compilation"></a>

## Article: Performance #19 - V8 & JIT Compilation — How JS Engines Optimize Your Code

| Field | Value |
|-------|-------|
| **ID / Slug** | `19-v8-jit-compilation` |
| **URL** | `/articles/19-v8-jit-compilation` |
| **Series / Category** | performance |
| **Tags** | Performance, JavaScript, V8 |
| **Read Time** | 9 min read |
| **Previous** | `18-intersection-observer-debounce-throttle` — Performance #18 - Intersection Observer, Debouncing & Throttling |
| **Next** | `20-memory-leaks-garbage-collection` — Performance #20 - Memory Leaks & Garbage Collection |

**Excerpt:** V8 compiles hot functions to optimized machine code based on observed types. Hidden classes, monomorphic call sites, and deoptimization — here's what it means for how you write JS.

**Sections:**
- V8's Compilation Pipeline
- Hidden Classes
- Monomorphic vs Polymorphic Call Sites
- Deoptimization
- Practical Rules for JIT-Friendly Code

**External Links:** None

---

<a name="article-20-memory-leaks-garbage-collection"></a>

## Article: Performance #20 - Memory Leaks & Garbage Collection

| Field | Value |
|-------|-------|
| **ID / Slug** | `20-memory-leaks-garbage-collection` |
| **URL** | `/articles/20-memory-leaks-garbage-collection` |
| **Series / Category** | performance |
| **Tags** | Performance, JavaScript, Memory |
| **Read Time** | 9 min read |
| **Previous** | `19-v8-jit-compilation` — Performance #19 - V8 & JIT Compilation — How JS Engines Optimize Your Code |
| **Next** | `21-web-workers-offscreencanvas` — Performance #21 - Web Workers & OffscreenCanvas |

**Excerpt:** JavaScript manages memory automatically — until it doesn't. The four leak patterns every SPA developer hits: forgotten listeners, detached DOM nodes, closure captures, and unbounded caches.

**Sections:**
- How Garbage Collection Works
- The Four Common Leak Patterns
- WeakRef and FinalizationRegistry
- Finding Leaks with DevTools
- GC Pauses

**External Links:** None

---

<a name="article-21-web-workers-offscreencanvas"></a>

## Article: Performance #21 - Web Workers & OffscreenCanvas

| Field | Value |
|-------|-------|
| **ID / Slug** | `21-web-workers-offscreencanvas` |
| **URL** | `/articles/21-web-workers-offscreencanvas` |
| **Series / Category** | performance |
| **Tags** | Performance, JavaScript, Concurrency |
| **Read Time** | 8 min read |
| **Previous** | `20-memory-leaks-garbage-collection` — Performance #20 - Memory Leaks & Garbage Collection |
| **Next** | `22-ssr-csr-ssg-isr` — Performance #22 - SSR vs CSR vs SSG vs ISR |

**Excerpt:** Heavy computation on the main thread blocks rendering and input. Web Workers move that work to a background thread. OffscreenCanvas moves canvas rendering there too.

**Sections:**
- What Web Workers Are
- Transferable Objects
- What to Move to a Worker
- Shared Workers and Service Workers
- OffscreenCanvas
- Module Workers
- Worker Pools

**External Links:** None

---

<a name="article-22-ssr-csr-ssg-isr"></a>

## Article: Performance #22 - SSR vs CSR vs SSG vs ISR

| Field | Value |
|-------|-------|
| **ID / Slug** | `22-ssr-csr-ssg-isr` |
| **URL** | `/articles/22-ssr-csr-ssg-isr` |
| **Series / Category** | performance |
| **Tags** | Performance, Architecture, Rendering |
| **Read Time** | 10 min read |
| **Previous** | `21-web-workers-offscreencanvas` — Performance #21 - Web Workers & OffscreenCanvas |
| **Next** | `23-react-performance-patterns` — Performance #23 - React Performance Patterns |

**Excerpt:** The rendering strategy you choose determines TTFB, LCP, hydration cost, and SEO. This is the highest-leverage architectural decision in web performance.

**Sections:**
- Client-Side Rendering (CSR)
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- Incremental Static Regeneration (ISR)
- Choosing a Strategy
- Streaming SSR

**External Links:** None

---

<a name="article-23-react-performance-patterns"></a>

## Article: Performance #23 - React Performance Patterns

| Field | Value |
|-------|-------|
| **ID / Slug** | `23-react-performance-patterns` |
| **URL** | `/articles/23-react-performance-patterns` |
| **Series / Category** | performance |
| **Tags** | Performance, React, JavaScript |
| **Read Time** | 10 min read |
| **Previous** | `22-ssr-csr-ssg-isr` — Performance #22 - SSR vs CSR vs SSG vs ISR |
| **Next** | `24-virtual-scrolling-windowing` — Performance #24 - Virtual Scrolling & Windowing |

**Excerpt:** React.memo, useMemo, useCallback, stable keys, React.lazy, and startTransition — when each one helps, when it hurts, and how to find what's actually slow with the React Profiler.

**Sections:**
- How React Decides to Re-render
- React.memo
- useMemo
- useCallback
- The Key Prop and Reconciliation
- Code Splitting with React.lazy and Suspense
- startTransition for Non-Urgent Updates
- React DevTools Profiler

**External Links:** None

---

<a name="article-24-virtual-scrolling-windowing"></a>

## Article: Performance #24 - Virtual Scrolling & Windowing

| Field | Value |
|-------|-------|
| **ID / Slug** | `24-virtual-scrolling-windowing` |
| **URL** | `/articles/24-virtual-scrolling-windowing` |
| **Series / Category** | performance |
| **Tags** | Performance, React, UI |
| **Read Time** | 8 min read |
| **Previous** | `23-react-performance-patterns` — Performance #23 - React Performance Patterns |
| **Next** | `25-perceived-performance` — Performance #25 - Perceived Performance — Skeletons, Optimistic UI & Progress |

**Excerpt:** Rendering 10,000 list items creates 10,000 DOM nodes. Windowing renders only what's visible, keeping DOM count constant. Here's how react-window and @tanstack/virtual work.

**Sections:**
- The Problem with Long Lists
- How Windowing Works
- react-window
- @tanstack/virtual
- When to Use Windowing
- Accessibility Considerations

**External Links:** None

---

<a name="article-25-perceived-performance"></a>

## Article: Performance #25 - Perceived Performance — Skeletons, Optimistic UI & Progress

| Field | Value |
|-------|-------|
| **ID / Slug** | `25-perceived-performance` |
| **URL** | `/articles/25-perceived-performance` |
| **Series / Category** | performance |
| **Tags** | Performance, UX, UI |
| **Read Time** | 8 min read |
| **Previous** | `24-virtual-scrolling-windowing` — Performance #24 - Virtual Scrolling & Windowing |
| **Next** | `26-bundle-optimization` — Performance #26 - Bundle Optimization — Tree Shaking & Code Splitting |

**Excerpt:** A page can load in 2s and feel slow. Another takes 4s and feels fast. Skeleton screens, optimistic UI, blur-up images, and smart progress indicators close that gap.

**Sections:**
- Why Perception Matters
- Skeleton Screens
- Optimistic UI
- Progress Indicators
- Blur-Up Image Loading
- Instant Navigation with Prefetching

**External Links:** None

---

<a name="article-26-bundle-optimization"></a>

## Article: Performance #26 - Bundle Optimization — Tree Shaking & Code Splitting

| Field | Value |
|-------|-------|
| **ID / Slug** | `26-bundle-optimization` |
| **URL** | `/articles/26-bundle-optimization` |
| **Series / Category** | performance |
| **Tags** | Performance, JavaScript, Build |
| **Read Time** | 10 min read |
| **Previous** | `25-perceived-performance` — Performance #25 - Perceived Performance — Skeletons, Optimistic UI & Progress |
| **Next** | `27-third-party-scripts` — Performance #27 - Third-Party Scripts & the Facade Pattern |

**Excerpt:** JavaScript is the most expensive resource on the web. Tree shaking removes dead code; code splitting loads only what each page needs.

**Sections:**
- Why Bundle Size Matters
- Tree Shaking: Dead Code Elimination
- Code Splitting: Load What You Need
- Shared Chunks
- Analysing Your Bundle
- Further Optimisations

**External Links:** None

---

<a name="article-27-third-party-scripts"></a>

## Article: Performance #27 - Third-Party Scripts & the Facade Pattern

| Field | Value |
|-------|-------|
| **ID / Slug** | `27-third-party-scripts` |
| **URL** | `/articles/27-third-party-scripts` |
| **Series / Category** | performance |
| **Tags** | Performance, JavaScript, Optimization |
| **Read Time** | 9 min read |
| **Previous** | `26-bundle-optimization` — Performance #26 - Bundle Optimization — Tree Shaking & Code Splitting |
| **Next** | `28-service-workers-and-caching` — Performance #28 - Service Workers & Caching Strategies |

**Excerpt:** Third-party scripts are often the largest source of main-thread blocking time on production sites. Load-on-interaction, the facade pattern, and Partytown are your main tools.

**Sections:**
- The Real Cost of Third-Party Scripts
- Measuring Third-Party Impact
- Loading Strategies
- The Facade Pattern
- Partytown
- Connection Warming

**External Links:**
- [Partytown](https://partytown.builder.io/)

---

<a name="article-28-service-workers-and-caching"></a>

## Article: Performance #28 - Service Workers & Caching Strategies

| Field | Value |
|-------|-------|
| **ID / Slug** | `28-service-workers-and-caching` |
| **URL** | `/articles/28-service-workers-and-caching` |
| **Series / Category** | performance |
| **Tags** | Performance, Service Worker, Caching |
| **Read Time** | 10 min read |
| **Previous** | `27-third-party-scripts` — Performance #27 - Third-Party Scripts & the Facade Pattern |
| **Next** | `29-adaptive-loading` — Performance #29 - Adaptive Loading — Network & Device-Aware Experiences |

**Excerpt:** Service workers act as a programmable network proxy. Learn Cache-First, Network-First, and Stale-While-Revalidate strategies — and when each one makes sense.

**Sections:**
- What Is a Service Worker?
- The Service Worker Lifecycle
- Caching Strategies
- When to Use Service Workers
- Limitations and Gotchas

**External Links:**
- [Workbox](https://developer.chrome.com/docs/workbox/)

---

<a name="article-29-adaptive-loading"></a>

## Article: Performance #29 - Adaptive Loading — Network & Device-Aware Experiences

| Field | Value |
|-------|-------|
| **ID / Slug** | `29-adaptive-loading` |
| **URL** | `/articles/29-adaptive-loading` |
| **Series / Category** | performance |
| **Tags** | Performance, Network, UX |
| **Read Time** | 8 min read |
| **Previous** | `28-service-workers-and-caching` — Performance #28 - Service Workers & Caching Strategies |
| **Next** | `30-performance-budgets` — Performance #30 - Performance Budgets & CI Enforcement |

**Excerpt:** navigator.connection, deviceMemory, and hardwareConcurrency let you serve lighter experiences to constrained users.

**Sections:**
- The Network Information API
- The Device Memory API
- Hardware Concurrency
- Practical Adaptive Loading Patterns
- CSS Media Query: prefers-reduced-data
- prefers-reduced-motion
- React Adaptive Hooks
- What Adaptive Loading Is Not

**External Links:** None

---

<a name="article-30-performance-budgets"></a>

## Article: Performance #30 - Performance Budgets & CI Enforcement

| Field | Value |
|-------|-------|
| **ID / Slug** | `30-performance-budgets` |
| **URL** | `/articles/30-performance-budgets` |
| **Series / Category** | performance |
| **Tags** | Performance, CI, Tooling |
| **Read Time** | 8 min read |
| **Previous** | `29-adaptive-loading` — Performance #29 - Adaptive Loading — Network & Device-Aware Experiences |
| **Next** | `js-variables-scope-hoisting` — JS Foundations #1 — Variables, Scope & Hoisting |

**Excerpt:** Without a budget, performance degrades silently — one PR at a time. Lighthouse CI and size-limit enforce metric and bundle-size constraints on every pull request.

**Sections:**
- What a Performance Budget Covers
- Lighthouse CI
- Bundle Size Budgets with size-limit
- bundlesize (Alternative)
- Setting Realistic Budgets
- Budget Violations as Learning Opportunities

**External Links:** None

---

<a name="article-js-variables-scope-hoisting"></a>

## Article: JS Foundations #1 — Variables, Scope & Hoisting

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-variables-scope-hoisting` |
| **URL** | `/articles/js-variables-scope-hoisting` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Fundamentals, Scope, ES6 |
| **Read Time** | 10 min read |
| **Previous** | `30-performance-budgets` — Performance #30 - Performance Budgets & CI Enforcement |
| **Next** | `js-this-demystified` — JS Foundations #2 — this Demystified |

**Excerpt:** Understand var, let, const, block scope vs function scope, hoisting mechanics, and the Temporal Dead Zone — with executable examples you can edit and run.

**Sections:**
- 0. What Is a Variable?
- 1. The Three Ways to Declare Variables
- 2. Function Scope vs Block Scope
- 3. Global Scope — The `window` Difference
- 4. Redeclaration Rules
- 5. Hoisting — What Gets Lifted
- 6. Function Declarations vs Function Expressions
- 7. Shadowing — When Inner Blocks Hide Outer Variables
- 8. The Scope Chain — How the Engine Looks Up Variables
- 9. `var` Hoisting in Functions
- Key Takeaways

**External Links:** None

---

<a name="article-js-this-demystified"></a>

## Article: JS Foundations #2 — this Demystified

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-this-demystified` |
| **URL** | `/articles/js-this-demystified` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Fundamentals, this |
| **Read Time** | 11 min read |
| **Previous** | `js-variables-scope-hoisting` — JS Foundations #1 — Variables, Scope & Hoisting |
| **Next** | `js-closures-lexical-scope` — JS Foundations #3 — Closures & Lexical Scope |

**Excerpt:** Master the four binding rules (default, implicit, explicit, new), arrow function this, and common gotchas — every example is editable and runnable.

**Sections:**
- 1. What `this` Is NOT
- 2. `this` at the Global Level
- 3. The Four Binding Rules
- 4. Precedence Order — Tested on the Hardest Case
- 5. Arrow Functions — The Exception to Everything
- 6. `this` in Classes
- 7. `this` in Event Handlers
- 8. Quick Reference — The Four Rules
- Key Takeaways

**External Links:** None

---

<a name="article-js-closures-lexical-scope"></a>

## Article: JS Foundations #3 — Closures & Lexical Scope

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-closures-lexical-scope` |
| **URL** | `/articles/js-closures-lexical-scope` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Fundamentals, Closures |
| **Read Time** | 11 min read |
| **Previous** | `js-this-demystified` — JS Foundations #2 — this Demystified |
| **Next** | `js-prototypes-inheritance` — JS Foundations #4 — Prototypes & Inheritance |

**Excerpt:** How closures work at the memory level, why they power module patterns, memoization, and function factories — plus the classic setTimeout-in-a-loop interview question.

**Sections:**
- 1. What is a Closure?
- 2. The Scope Chain in Closures
- 3. Private State with Closures
- 4. Closure for Memoization
- 5. once() — Ensure a Function Runs Only Once
- 6. Function Factories
- 7. The Loop + `setTimeout` Closure Bug
- 8. Releasing Closures for Garbage Collection
- 9. Closure Performance Tip
- Key Takeaways

**External Links:** None

---

<a name="article-js-prototypes-inheritance"></a>

## Article: JS Foundations #4 — Prototypes & Inheritance

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-prototypes-inheritance` |
| **URL** | `/articles/js-prototypes-inheritance` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Fundamentals, Prototypes |
| **Read Time** | 11 min read |
| **Previous** | `js-closures-lexical-scope` — JS Foundations #3 — Closures & Lexical Scope |
| **Next** | `js-equality-coercion` — JS Foundations #5 — Equality & Type Coercion |

**Excerpt:** Understand __proto__ vs prototype, the prototype chain, what new actually does, and how class extends desugars to prototypes.

**Sections:**
- 1. `__proto__` vs `prototype` — The Most Confused Concept
- 2. The Prototype Chain — How Property Lookup Works
- 3. Setting Properties on the Prototype
- 4. What `new` Actually Does (Step by Step)
- 5. Constructor Property
- 6. Inheritance Without Classes
- 7. `Object.create()` — The Purest Form of Prototypal Inheritance
- 8. `instanceof` — Checking the Prototype Chain
- 9. `for...in` vs `hasOwnProperty` — Why It Matters
- 10. `Object.create(null)` — An Object with No Prototype
- 11. `class` — Syntax Sugar Over Prototypes
- Key Takeaways

**External Links:** None

---

<a name="article-js-equality-coercion"></a>

## Article: JS Foundations #5 — Equality & Type Coercion

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-equality-coercion` |
| **URL** | `/articles/js-equality-coercion` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Fundamentals, Coercion |
| **Read Time** | 10 min read |
| **Previous** | `js-prototypes-inheritance` — JS Foundations #4 — Prototypes & Inheritance |
| **Next** | `js-error-handling` — JS Foundations #6 — Error Handling |

**Excerpt:** Abstract equality algorithm, implicit coercion rules, == vs === edge cases, Object.is, and why [] == ![] is true — all explained with diagrams and runnable examples.

**Sections:**
- 1. `==` vs `===` — The Core Difference
- 2. The Abstract Equality Algorithm (The Rules for `==`)
- 3. The Infamous `[] == ![]` — Step by Step
- 4. The `+` Operator — Addition or Concatenation?
- 5. Other Arithmetic Operators — `-`, `*`, `/`, `%`
- 6. The Unary `+` and `-` Operators
- 7. Comparison Operators — `<`, `>`, `<=`, `>=`
- 8. Explicit Coercion — You're in Control
- 9. ToPrimitive — How Objects Become Primitives
- 10. `Object.is()` — Better Strict Equality
- 11. Truthy and Falsy
- Key Takeaways

**External Links:** None

---

<a name="article-js-error-handling"></a>

## Article: JS Foundations #6 — Error Handling

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-error-handling` |
| **URL** | `/articles/js-error-handling` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Fundamentals, Error Handling |
| **Read Time** | 9 min read |
| **Previous** | `js-equality-coercion` — JS Foundations #5 — Equality & Type Coercion |
| **Next** | `js-destructuring-spread-rest` — JS Foundations #7 — Destructuring, Spread & Rest |

**Excerpt:** try/catch/finally, custom error classes, unhandled rejection events, global error handlers, and error propagation patterns — with runnable examples.

**Sections:**
- 1. `throw` — Starting an Error
- 2. `try/catch/finally` — The Basics
- 3. The Error Object
- 4. Custom Error Classes
- 5. `finally` Always Runs — Even After `return`
- 6. Re-throwing Errors
- 7. Catching Async Errors
- 8. Unhandled Promise Rejections
- 9. Global Error Handling
- 10. Error Boundary Pattern
- 11. Throwing Non-Error Values
- Key Takeaways

**External Links:** None

---

<a name="article-js-destructuring-spread-rest"></a>

## Article: JS Foundations #7 — Destructuring, Spread & Rest

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-destructuring-spread-rest` |
| **URL** | `/articles/js-destructuring-spread-rest` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, ES6, Destructuring |
| **Read Time** | 10 min read |
| **Previous** | `js-error-handling` — JS Foundations #6 — Error Handling |
| **Next** | `js-template-literals` — JS Foundations #8 — Template Literals & Tagged Templates |

**Excerpt:** Array and object destructuring, nested destructuring with defaults, spread for copying/merging, rest parameters, and the difference between spread and rest syntax.

**Sections:**
- 1. Array Destructuring — Positional Extraction
- 2. Object Destructuring — Named Extraction
- 3. Nested Destructuring
- 4. Destructuring in Function Parameters
- 5. Spread Operator — Copy and Merge
- 6. Spread for Immutable Updates
- 7. Rest Parameters — Collect Remaining Arguments
- 8. Spread vs Rest — Same Syntax, Different Context
- Key Takeaways

**External Links:** None

---

<a name="article-js-template-literals"></a>

## Article: JS Foundations #8 — Template Literals & Tagged Templates

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-template-literals` |
| **URL** | `/articles/js-template-literals` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, ES6, Template Literals |
| **Read Time** | 8 min read |
| **Previous** | `js-destructuring-spread-rest` — JS Foundations #7 — Destructuring, Spread & Rest |
| **Next** | `js-data-types` — JS Foundations #9 — Data Types & Type Checking |

**Excerpt:** Template literal syntax, multiline strings, expression interpolation, tagged templates, and building a styled-components-like function from scratch.

**Sections:**
- 1. Basic Template Literals — Interpolation
- 2. Multiline Strings
- 3. Nesting Template Literals
- 4. Tagged Templates — Processing with a Function
- 5. Practical Tag — Building a Styled-Components–like Function
- 6. Practical Tag — Safe HTML Escaping
- 7. Practical Tag — Styled Components Lite
- 8. `String.raw` — Raw Strings
- Key Takeaways

**External Links:** None

---

<a name="article-js-data-types"></a>

## Article: JS Foundations #9 — Data Types & Type Checking

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-data-types` |
| **URL** | `/articles/js-data-types` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Fundamentals, Types, typeof |
| **Read Time** | 10 min read |
| **Previous** | `js-template-literals` — JS Foundations #8 — Template Literals & Tagged Templates |
| **Next** | `js-type-checking` — Type Checking Quick Reference |

**Excerpt:** JavaScript's 8 types, typeof quirks (null, arrays), instanceof prototype chain walk, Object.prototype.toString.call, and the reliable type-checking toolkit for every built-in type.

**Sections:**
- 1. The 8 Types
- 2. `typeof` — The Primary Tool
- 3. `instanceof` — Prototype Chain Check
- 4. `Object.prototype.toString.call(value)` — Most Reliable
- 5. `Array.isArray(value)` — Array-Specific Check
- 6. Checking for Specific Primitive Types
- 7. NaN, Infinity, and -0
- 8. `Object.is(a, b)` — Most Precise Equality
- Quick Reference
- Interview Tips
- Related Articles

**External Links:** None

---

<a name="article-js-type-checking"></a>

## Article: Type Checking Quick Reference

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-type-checking` |
| **URL** | `/articles/js-type-checking` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Fundamentals, Types, typeof |
| **Read Time** | 4 min read |
| **Previous** | `js-data-types` — JS Foundations #9 — Data Types & Type Checking |
| **Next** | `js-numbers-math` — JS Foundations #10 — Numbers & Math |

**Excerpt:** The right way to check every JavaScript type — typeof for primitives, Array.isArray for arrays, instanceof for built-ins, and Object.prototype.toString for everything else.

**Sections:**
- Primitives
- `null` — the special case
- Arrays — `Array.isArray()`
- Functions
- Plain objects
- Built-in objects — `instanceof`
- The universal tool — `Object.prototype.toString`
- Summary table

**External Links:** None

---

<a name="article-js-numbers-math"></a>

## Article: JS Foundations #10 — Numbers & Math

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-numbers-math` |
| **URL** | `/articles/js-numbers-math` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Fundamentals, Numbers, Math |
| **Read Time** | 8 min read |
| **Previous** | `js-type-checking` — Type Checking Quick Reference |
| **Next** | `js-string-methods` — JS Foundations #11 — String Methods Reference |

**Excerpt:** IEEE 754 floating point, NaN, Infinity, +0/-0, Number.isNaN vs isNaN, Number.isFinite, and every Math method you'll reach for — with the traps interviewers test.

**Sections:**
- 1. Number Representation
- 2. `NaN` — Not a Number
- 3. Infinity and Finite Checks
- 4. `+0` and `-0`
- 5. Floating-Point Precision
- 6. `Number` Static Methods
- 7. The `Math` Object
- Quick Reference
- Interview Tips
- Related Articles

**External Links:** None

---

<a name="article-js-string-methods"></a>

## Article: JS Foundations #11 — String Methods Reference

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-string-methods` |
| **URL** | `/articles/js-string-methods` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Fundamentals, Strings |
| **Read Time** | 10 min read |
| **Previous** | `js-numbers-math` — JS Foundations #10 — Numbers & Math |
| **Next** | `js-regex-basics` — JS Foundations #12 — Regular Expressions |

**Excerpt:** Every string method used in interviews: split, slice, replace, indexOf, includes, trim, toUpperCase, padStart, and more — with runnable examples for each.

**Sections:**
- 1. Accessing Characters
- 2. Searching
- 3. Extracting Substrings
- 4. Transforming
- 5. Replace & Match (Without Regex)
- 6. String Concatenation
- 7. Regex-Based Methods
- Quick Reference
- Interview Tips
- Related Articles

**External Links:** None

---

<a name="article-js-regex-basics"></a>

## Article: JS Foundations #12 — Regular Expressions

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-regex-basics` |
| **URL** | `/articles/js-regex-basics` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Fundamentals, Regex |
| **Read Time** | 10 min read |
| **Previous** | `js-string-methods` — JS Foundations #11 — String Methods Reference |
| **Next** | `js-date-time` — JS Foundations #13 — Date & Time |

**Excerpt:** Regex syntax, flags, test/exec/match/replace, character classes, quantifiers, anchors, capturing groups, lookahead, and the common patterns used in interview problems.

**Sections:**
- 1. Two Ways to Create a Regex
- 2. Flags
- 3. test() — Returns Boolean
- 4. exec() — Returns Match Details
- 5. String Methods That Accept Regex
- 6. Character Classes
- 7. Quantifiers
- 8. Anchors and Boundaries
- 9. Groups and Alternation
- 10. Lookahead and Lookbehind
- 11. Common Patterns
- Quick Reference
- Interview Tips
- Related Articles

**External Links:** None

---

<a name="article-js-date-time"></a>

## Article: JS Foundations #13 — Date & Time

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-date-time` |
| **URL** | `/articles/js-date-time` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Fundamentals, Date |
| **Read Time** | 7 min read |
| **Previous** | `js-regex-basics` — JS Foundations #12 — Regular Expressions |
| **Next** | `js-error-patterns` — Error Handling #2 — AggregateError, Error-First Callbacks & Promise Errors |

**Excerpt:** Date constructor (beware month is 0-based), getTime, Date.now, formatting with toISOString/toLocaleDateString, date arithmetic, and performance.now for high-res timing.

**Sections:**
- 1. Creating Dates
- 2. Getting Timestamps
- 3. Getting Date Components
- 4. Setting Date Components
- 5. Date Arithmetic
- 6. Formatting Dates
- 7. `performance.now()` — High-Resolution Timing
- 8. Parsing Dates Reliably
- 9. Checking Validity
- Quick Reference
- Interview Tips
- Related Articles

**External Links:** None

---

<a name="article-js-error-patterns"></a>

## Article: Error Handling #2 — AggregateError, Error-First Callbacks & Promise Errors

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-error-patterns` |
| **URL** | `/articles/js-error-patterns` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Error Handling, Patterns, Promises |
| **Read Time** | 9 min read |
| **Previous** | `js-date-time` — JS Foundations #13 — Date & Time |
| **Next** | `js-call-apply-bind` — Functions #1 — call(), apply() & bind() Polyfills |

**Excerpt:** AggregateError for Promise.any, error-first callback convention, custom error hierarchies, error recovery in .catch(), Error.cause chaining, and unhandled rejection handling.

**Sections:**
- 1. `AggregateError` — Multiple Errors at Once
- 2. Error-First Callback Convention
- 3. Custom Error Hierarchies
- 4. Errors in Promise Chains
- 5. Unhandled Promise Rejections
- 6. Error Cause (ES2022)
- 7. Synchronous Throw in Promise Constructors
- Quick Reference
- Interview Tips
- Related Articles

**External Links:** None

---

<a name="article-js-call-apply-bind"></a>

## Article: Functions #1 — call(), apply() & bind() Polyfills

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-call-apply-bind` |
| **URL** | `/articles/js-call-apply-bind` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Functions, this, Polyfill |
| **Read Time** | 12 min read |
| **Previous** | `js-error-patterns` — Error Handling #2 — AggregateError, Error-First Callbacks & Promise Errors |
| **Next** | `js-currying-partial-application` — Functions #2 — Currying & Partial Application |

**Excerpt:** Implement Function.prototype.call, apply, and bind from scratch. Understand how each borrows this, and why bind returns a bound function you can't rebind.

**Sections:**
- 1. The Three Methods at a Glance
- 2. Implementing `call()` — Step by Step
- 3. Implementing `apply()` — Arguments as an Array
- 4. `call` vs `apply` — When to Use Which
- 5. Implementing `bind()` — Return a Bound Function
- 6. `bind` + `new` — The Edge Case
- 7. Partial Application with `bind`
- 8. Quick Reference — Implementing All Three Manually
- Key Takeaways

**External Links:** None

---

<a name="article-js-currying-partial-application"></a>

## Article: Functions #2 — Currying & Partial Application

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-currying-partial-application` |
| **URL** | `/articles/js-currying-partial-application` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Functions, Currying, Closures |
| **Read Time** | 10 min read |
| **Previous** | `js-call-apply-bind` — Functions #1 — call(), apply() & bind() Polyfills |
| **Next** | `js-debounce-throttle` — Functions #3 — Debounce & Throttle |

**Excerpt:** Transform f(a,b,c) into f(a)(b)(c), implement infinite currying sum(1)(2)(3)(), and understand partial application vs currying.

**Sections:**
- 1. What is Currying?
- 2. Implementing a Generic `curry()`
- 3. Infinite Currying — `sum(1)(2)(3)()`
- 4. Partial Application — Fix Arguments Upfront
- 5. Currying vs Partial Application
- 6. Real-World Use Cases
- Key Takeaways

**External Links:** None

---

<a name="article-js-debounce-throttle"></a>

## Article: Functions #3 — Debounce & Throttle

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-debounce-throttle` |
| **URL** | `/articles/js-debounce-throttle` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Functions, Performance |
| **Read Time** | 12 min read |
| **Previous** | `js-currying-partial-application` — Functions #2 — Currying & Partial Application |
| **Next** | `js-array-methods-polyfills-1` — Arrays #1 — map, filter, reduce Polyfills |

**Excerpt:** Implement debounce (leading, trailing, immediate) and throttle (with trailing edge). Understand when each fits, with runnable scroll/resize simulation examples.

**Sections:**
- 1. Debounce — Wait for the Pause
- 2. Debounce — Trailing vs Leading Edge
- 3. Throttle — Enforce a Rate Limit
- 4. Throttle with Trailing Edge
- 5. Debounce vs Throttle — When to Use Which
- 6. A Combined "Smart" Utility
- Key Takeaways

**External Links:** None

---

<a name="article-js-array-methods-polyfills-1"></a>

## Article: Arrays #1 — map, filter, reduce Polyfills

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-array-methods-polyfills-1` |
| **URL** | `/articles/js-array-methods-polyfills-1` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Arrays, Polyfill |
| **Read Time** | 12 min read |
| **Previous** | `js-debounce-throttle` — Functions #3 — Debounce & Throttle |
| **Next** | `js-array-methods-polyfills-2` — Arrays #2 — flat, flatMap, find, every, some Polyfills |

**Excerpt:** Build Array.prototype.map, filter, and reduce from scratch. Understand callback signatures, thisArg, sparse array handling, and edge cases.

**Sections:**
- 1. How the Real Methods Behave
- 2. Implementing `Array.prototype.map()`
- 3. Implementing `Array.prototype.filter()`
- 4. Implementing `Array.prototype.reduce()`
- 5. Building `map` and `filter` from `reduce`
- 6. Classic `reduce` Interview Problems
- Key Takeaways

**External Links:** None

---

<a name="article-js-array-methods-polyfills-2"></a>

## Article: Arrays #2 — flat, flatMap, find, every, some Polyfills

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-array-methods-polyfills-2` |
| **URL** | `/articles/js-array-methods-polyfills-2` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Arrays, Polyfill |
| **Read Time** | 11 min read |
| **Previous** | `js-array-methods-polyfills-1` — Arrays #1 — map, filter, reduce Polyfills |
| **Next** | `js-array-methods-reference` — Arrays #3 — Array Methods Usage Reference |

**Excerpt:** Implement Array.prototype.flat with depth, flatMap, find, findIndex, every, and some — with sparse array handling and edge cases.

**Sections:**
- 1. Implementing `Array.prototype.flat(depth)`
- 2. Implementing `Array.prototype.flatMap()`
- 3. Implementing `Array.prototype.find()` and `findIndex()`
- 4. Implementing `Array.prototype.every()` and `some()`
- 5. Implementing `Array.prototype.forEach()`
- 6. Quick Reference — All Array Methods
- Key Takeaways

**External Links:** None

---

<a name="article-js-array-methods-reference"></a>

## Article: Arrays #3 — Array Methods Usage Reference

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-array-methods-reference` |
| **URL** | `/articles/js-array-methods-reference` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Arrays, Reference |
| **Read Time** | 12 min read |
| **Previous** | `js-array-methods-polyfills-2` — Arrays #2 — flat, flatMap, find, every, some Polyfills |
| **Next** | `js-memoize-once` — Functions #4 — memoize() & once() |

**Excerpt:** Every array method organized by purpose: add/remove, slice, search, transform, sort, iterate. Practical runnable examples for all 30+ methods — not a polyfill, a usage guide.

**Sections:**
- 1. Adding & Removing Elements
- 2. Non-Mutating Access & Slicing
- 3. Searching & Finding
- 4. Transforming (Non-Mutating)
- 5. Sorting & Ordering
- 6. Iteration Methods
- 7. Utility Methods
- Mutation vs Non-Mutation Summary
- Interview Tips
- Related Articles

**External Links:** None

---

<a name="article-js-memoize-once"></a>

## Article: Functions #4 — memoize() & once()

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-memoize-once` |
| **URL** | `/articles/js-memoize-once` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Functions, Closures, Cache |
| **Read Time** | 9 min read |
| **Previous** | `js-array-methods-reference` — Arrays #3 — Array Methods Usage Reference |
| **Next** | `js-recursion-patterns` — Recursion Patterns — Tree Walk, Permutations & More |

**Excerpt:** Implement memoize with custom key resolver, once that runs a function at most one time, and understand how closures make both possible.

**Sections:**
- 1. Basic `memoize()` — Cache by First Argument
- 2. `memoize()` with Custom Resolver — Multi-Argument Cache Key
- 3. Recursive Functions and Memoization
- 4. `once()` — Run at Most Once
- 5. `memoize` with Cache Eviction (TTL)
- 6. Real-World Examples
- Key Takeaways

**External Links:** None

---

<a name="article-js-recursion-patterns"></a>

## Article: Recursion Patterns — Tree Walk, Permutations & More

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-recursion-patterns` |
| **URL** | `/articles/js-recursion-patterns` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Recursion, Algorithms |
| **Read Time** | 11 min read |
| **Previous** | `js-memoize-once` — Functions #4 — memoize() & once() |
| **Next** | `js-deep-clone-compare` — Data #1 — Deep Clone & Deep Compare |

**Excerpt:** Deep flatten, Fibonacci (recursive, memoized, iterative), generating all permutations and combinations, and tail-call optimization explained.

**Sections:**
- 1. The Anatomy of a Recursive Function
- 2. Deep Flatten — Recursive vs Iterative
- 3. Fibonacci — Three Ways
- 4. Tree Traversal
- 5. Generating All Permutations
- 6. Generating All Combinations (Powerset)
- 7. Tail-Call Optimization (TCO)
- 8. Trampolining — Manual TCO When the Engine Doesn't Support It
- Key Takeaways

**External Links:** None

---

<a name="article-js-deep-clone-compare"></a>

## Article: Data #1 — Deep Clone & Deep Compare

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-deep-clone-compare` |
| **URL** | `/articles/js-deep-clone-compare` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Data, Clone, Equality |
| **Read Time** | 12 min read |
| **Previous** | `js-recursion-patterns` — Recursion Patterns — Tree Walk, Permutations & More |
| **Next** | `js-flatten-unflatten-object` — Data #2 — Flatten & Unflatten Nested Objects |

**Excerpt:** Structural clone handling Date, RegExp, Map, Set, Array, plain objects, and circular references. Plus deep equality that handles NaN, +0/-0, and all edge cases.

**Sections:**
- 1. The Problem with Shallow Copying
- 2. Deep Clone — Handling Primitives, Arrays, Objects
- 3. Deep Equality — `deepEquals(a, b)`
- 4. `Object.is()` — The Built-in Strict Comparison
- 5. `structuredClone()` — The Modern Native Solution
- Key Takeaways

**External Links:** None

---

<a name="article-js-flatten-unflatten-object"></a>

## Article: Data #2 — Flatten & Unflatten Nested Objects

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-flatten-unflatten-object` |
| **URL** | `/articles/js-flatten-unflatten-object` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Data, Objects, Recursion |
| **Read Time** | 9 min read |
| **Previous** | `js-deep-clone-compare` — Data #1 — Deep Clone & Deep Compare |
| **Next** | `js-object-methods` — Data #2.5 — Object Methods & Utilities |

**Excerpt:** Convert { a: { b: { c: 1 } } } to { 'a.b.c': 1 } and back. Recursive and iterative approaches with custom separator support.

**Sections:**
- 1. Flatten an Object — Recursive Approach
- 2. Flatten with Configurable Separator and Array Handling
- 3. Unflatten — Convert Flat Keys Back to Nested Objects
- 4. Iterative Flatten — Stack-Safe for Deep Objects
- 5. Real-World Use — Form Data to Nested Payload
- Key Takeaways

**External Links:** None

---

<a name="article-js-object-methods"></a>

## Article: Data #2.5 — Object Methods & Utilities

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-object-methods` |
| **URL** | `/articles/js-object-methods` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Objects, Reference |
| **Read Time** | 10 min read |
| **Previous** | `js-flatten-unflatten-object` — Data #2 — Flatten & Unflatten Nested Objects |
| **Next** | `js-event-loop-in-depth` — Async #1 — The Event Loop in Depth |

**Excerpt:** Object.keys, values, entries, fromEntries, assign, create, freeze, seal, defineProperty, hasOwnProperty, toString.call — every Object.* method with runnable examples.

**Sections:**
- 1. `Object.keys(obj)` — Get Own Enumerable Keys
- 2. `Object.values(obj)` — Get Own Enumerable Values
- 3. `Object.entries(obj)` — Get [key, value] Pairs
- 4. `Object.fromEntries(entries)` — Array → Object
- 5. `Object.assign(target, ...sources)` — Copy Properties
- 6. `Object.create(proto, descriptors?)` — Create with Custom Prototype
- 7. `Object.freeze(obj)` & `Object.seal(obj)` — Immutability
- 8. `Object.defineProperty(obj, key, descriptor)` — Precise Control
- 9. `Object.prototype.hasOwnProperty(key)` — Own Property Check
- 10. `Object.prototype.toString.call(value)` — Reliable Type Check
- Quick Reference
- Related Articles

**External Links:** None

---

<a name="article-js-event-loop-in-depth"></a>

## Article: Async #1 — The Event Loop in Depth

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-event-loop-in-depth` |
| **URL** | `/articles/js-event-loop-in-depth` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Async, Event Loop, Runtime |
| **Read Time** | 12 min read |
| **Previous** | `js-object-methods` — Data #2.5 — Object Methods & Utilities |
| **Next** | `settimeout-setinterval` — Async #2 — setTimeout & setInterval Deep Dive |

**Excerpt:** Call stack, microtask queue (Promise.then, queueMicrotask), macrotask queue (setTimeout, events), render steps, and starvation — the complete execution model.

**Sections:**
- 1. The Call Stack — JavaScript's To-Do List
- 2. The Event Loop — How Async Work Actually Happens
- 3. Microtask Queue — Promises, `queueMicrotask`, `await`
- 4. Microtask Starvation — The Infinite Loop Trap
- 5. Complete Task Ordering — Everything in Sequence
- 6. The Render Step — Where rAF Fits
- 7. Visualizing the Event Loop
- Key Takeaways

**External Links:** None

---

<a name="article-settimeout-setinterval"></a>

## Article: Async #2 — setTimeout & setInterval Deep Dive

| Field | Value |
|-------|-------|
| **ID / Slug** | `settimeout-setinterval` |
| **URL** | `/articles/settimeout-setinterval` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Timers, Async, Event Loop |
| **Read Time** | 10 min read |
| **Previous** | `js-event-loop-in-depth` — Async #1 — The Event Loop in Depth |
| **Next** | `js-promise-from-scratch` — Async #3 — Building a Promise from Scratch |

**Excerpt:** Master browser timers — schedule callbacks, repeat them, cancel them, understand the drift problem, and learn nested setTimeout vs setInterval. Every example is editable and runnable.

**Sections:**
- 1. setTimeout — Run Code Once After a Delay
- 2. Passing Arguments to the Callback
- 3. clearTimeout — Cancel Before It Fires
- 4. setInterval — Repeat on a Fixed Schedule
- 5. clearInterval — Stop a Running Interval
- 6. The Event Loop — Why setTimeout(0) Isn't Instant
- 7. Nested setTimeout vs setInterval — The Drift Problem
- 8. Minimum Delay — The 4ms Floor
- 9. Practical — Countdown Timer
- Key Takeaways

**External Links:** None

---

<a name="article-js-promise-from-scratch"></a>

## Article: Async #3 — Building a Promise from Scratch

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-promise-from-scratch` |
| **URL** | `/articles/js-promise-from-scratch` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Async, Promise, Polyfill |
| **Read Time** | 14 min read |
| **Previous** | `settimeout-setinterval` — Async #2 — setTimeout & setInterval Deep Dive |
| **Next** | `js-promise-combinators` — Async #4 — Promise.all, allSettled, race, any |

**Excerpt:** Implement the Promise constructor, then, catch, finally, resolve, reject — with state machine (pending/fulfilled/rejected), chaining, and microtask scheduling.

**Sections:**
- 1. The Promise State Machine
- 2. Building `MyPromise` — Constructor
- 3. Implementing `.then()` and `.catch()`
- 4. `.finally()` — Runs Regardless
- 5. Static Methods — `MyPromise.resolve()` and `MyPromise.reject()`
- 6. Chaining and the Flattening Trick
- 7. Full Minimal Implementation
- Key Takeaways

**External Links:** None

---

<a name="article-js-promise-combinators"></a>

## Article: Async #4 — Promise.all, allSettled, race, any

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-promise-combinators` |
| **URL** | `/articles/js-promise-combinators` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Async, Promise, Polyfill |
| **Read Time** | 12 min read |
| **Previous** | `js-promise-from-scratch` — Async #3 — Building a Promise from Scratch |
| **Next** | `js-async-await-under-hood` — Async #5 — async/await Under the Hood |

**Excerpt:** Implement all four Promise combinators from scratch. Understand the subtle differences: short-circuit rejection, AggregateError, and the order of resolution.

**Sections:**
- 1. `Promise.all()` — All or Nothing
- 2. `Promise.allSettled()` — Wait for Everything
- 3. `Promise.race()` — Fastest Wins
- 4. `Promise.any()` — First Success Wins
- 5. Quick Comparison — All Four Combinators
- Key Takeaways

**External Links:** None

---

<a name="article-js-async-await-under-hood"></a>

## Article: Async #5 — async/await Under the Hood

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-async-await-under-hood` |
| **URL** | `/articles/js-async-await-under-hood` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Async, Generators |
| **Read Time** | 12 min read |
| **Previous** | `js-promise-combinators` — Async #4 — Promise.all, allSettled, race, any |
| **Next** | `js-generators-iterators` — Async #6 — Generators & Iterators |

**Excerpt:** Desugar async/await to generators + Promises. Understand paused execution, .next() driving the state machine, and why await blocks but doesn't freeze the thread.

**Sections:**
- 1. What `async`/`await` Actually Does
- 2. Generators Can Pause and Resume
- 3. Desugaring `async`/`await` to a Generator + Runner
- 4. Error Handling in the Desugared Version
- 5. Sequential vs Concurrent `await`
- 6. The `async` to Generator Transformation
- Key Takeaways

**External Links:** None

---

<a name="article-js-generators-iterators"></a>

## Article: Async #6 — Generators & Iterators

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-generators-iterators` |
| **URL** | `/articles/js-generators-iterators` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Async, Generators, Iterators |
| **Read Time** | 11 min read |
| **Previous** | `js-async-await-under-hood` — Async #5 — async/await Under the Hood |
| **Next** | `js-async-iteration` — Async #7 — Async Iteration |

**Excerpt:** Symbol.iterator, generator functions, yield and yield*, custom iterables, range generators, and pausing function execution with .next().

**Sections:**
- 1. The Iterator Protocol
- 2. Custom Iterable — Make an Object Work with `for...of`
- 3. Generator Functions — `function*` and `yield`
- 4. `yield*` — Delegating to Another Iterable
- 5. Infinite Generators — Lazy Sequences
- 6. Two-Way Communication — Passing Values INTO a Generator
- 7. `gen.throw()` and `gen.return()`
- 8. Practical Use — State Machines
- Key Takeaways

**External Links:** None

---

<a name="article-js-async-iteration"></a>

## Article: Async #7 — Async Iteration

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-async-iteration` |
| **URL** | `/articles/js-async-iteration` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Async, Iteration |
| **Read Time** | 10 min read |
| **Previous** | `js-generators-iterators` — Async #6 — Generators & Iterators |
| **Next** | `js-concurrency-limits` — Async #8 — Concurrency Control & Retry Patterns |

**Excerpt:** for await...of, async generators, async iterators, and building a paginated API consumer that iterates over pages lazily.

**Sections:**
- 1. The Problem — Iterating Over Async Data
- 2. Async Iterables — `Symbol.asyncIterator`
- 3. Async Generators — `async function*`
- 4. Building an Async Iterator Manually
- 5. Converting an Async Iterable to an Array
- 6. Async `map`, `filter`, `reduce` Over Async Iterables
- Key Takeaways

**External Links:** None

---

<a name="article-js-concurrency-limits"></a>

## Article: Async #8 — Concurrency Control & Retry Patterns

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-concurrency-limits` |
| **URL** | `/articles/js-concurrency-limits` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Async, Concurrency, Patterns |
| **Read Time** | 12 min read |
| **Previous** | `js-async-iteration` — Async #7 — Async Iteration |
| **Next** | `js-abort-controller` — Async #9 — AbortController & Cancelable Async |

**Excerpt:** Execute async tasks sequentially, with a concurrency pool, retry with exponential backoff, and cancel in-flight operations — all with runnable examples.

**Sections:**
- 1. Execute Async Tasks in Sequence
- 2. Concurrency Pool — Run N at a Time
- 3. Simpler Pool Using Promise.race
- 4. Retry with Exponential Backoff
- 5. Retry + Concurrency Pool Combined
- 6. Timeout Wrapping
- Key Takeaways

**External Links:** None

---

<a name="article-js-abort-controller"></a>

## Article: Async #9 — AbortController & Cancelable Async

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-abort-controller` |
| **URL** | `/articles/js-abort-controller` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Async, Web API, Cleanup |
| **Read Time** | 9 min read |
| **Previous** | `js-concurrency-limits` — Async #8 — Concurrency Control & Retry Patterns |
| **Next** | `js-map-set-weakmap-weakset` — Data #3 — Map, Set, WeakMap, WeakSet Polyfills |

**Excerpt:** Cancel fetch requests, remove event listeners, abort async work, and wire AbortSignal through custom functions — the standard way to clean up in-flight work.

**Sections:**
- 1. The Basic Pattern — Controller + Signal
- 2. Canceling `fetch` Requests
- 3. Wiring `AbortSignal` Into Custom Async Functions
- 4. Removing Event Listeners with `AbortSignal`
- 5. Aborting Multiple Operations
- 6. `AbortSignal.timeout()` — Static Convenience
- 7. Composing Signals — `AbortSignal.any()`
- Key Takeaways

**External Links:** None

---

<a name="article-js-map-set-weakmap-weakset"></a>

## Article: Data #3 — Map, Set, WeakMap, WeakSet Polyfills

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-map-set-weakmap-weakset` |
| **URL** | `/articles/js-map-set-weakmap-weakset` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Data, ES6, Polyfill |
| **Read Time** | 11 min read |
| **Previous** | `js-abort-controller` — Async #9 — AbortController & Cancelable Async |
| **Next** | `js-map` — Data #3a — Map in JavaScript |

**Excerpt:** Implement Map (hash map), Set, WeakMap (garbage-collectable keys), and WeakSet — understand when to use each over plain objects and arrays.

**Sections:**
- 1. Why We Need `Map` — The Problems with Objects as Dictionaries
- 2. Implementing a Simple `Map` Polyfill
- 3. `Set` — Unique Values
- 4. `WeakMap` — Garbage-Collectable Keys
- 5. `WeakSet` — Weak Collection of Objects
- 6. Quick Comparison
- Key Takeaways

**External Links:** None

---

<a name="article-js-map"></a>

## Article: Data #3a — Map in JavaScript

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-map` |
| **URL** | `/articles/js-map` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Map, Data, ES6 |
| **Read Time** | 10 min read |
| **Previous** | `js-map-set-weakmap-weakset` — Data #3 — Map, Set, WeakMap, WeakSet Polyfills |
| **Next** | `js-set` — Data #3b — Set in JavaScript |

**Excerpt:** Map is the true key-value store — any type as key, insertion-ordered iteration, O(1) lookups. Practical guide with patterns for frequency counters, caches, event registries, and data merging.

**Sections:**
- 1. Why Map Over Object?
- 2. Creating a Map
- 3. Basic Operations
- 4. Iteration
- 5. Object Keys
- 6. NaN and -0 as Keys
- 7. Map vs Object Decision Guide
- 8. Common Interview Patterns
- Quick Reference
- Interview Tips
- Related Articles

**External Links:** None

---

<a name="article-js-set"></a>

## Article: Data #3b — Set in JavaScript

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-set` |
| **URL** | `/articles/js-set` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Set, Data, ES6 |
| **Read Time** | 9 min read |
| **Previous** | `js-map` — Data #3a — Map in JavaScript |
| **Next** | `js-object-create-instanceof` — Prototypes #2 — Object.create() & instanceof Polyfills |

**Excerpt:** Set stores unique values with O(1) membership checks. Practical guide with patterns for deduplication, visited tracking, set operations (union/intersection/difference), and circular reference detection.

**Sections:**
- 1. Why Set Over Array?
- 2. Creating a Set
- 3. Basic Operations
- 4. Iteration
- 5. Object Values and Reference Equality
- 6. NaN and -0
- 7. Common Interview Patterns
- 8. Converting Between Set and Array
- 9. WeakSet — When References Shouldn't Prevent GC
- Quick Reference
- Interview Tips
- Related Articles

**External Links:** None

---

<a name="article-js-object-create-instanceof"></a>

## Article: Prototypes #2 — Object.create() & instanceof Polyfills

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-object-create-instanceof` |
| **URL** | `/articles/js-object-create-instanceof` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Prototypes, Polyfill |
| **Read Time** | 10 min read |
| **Previous** | `js-set` — Data #3b — Set in JavaScript |
| **Next** | `js-symbols-in-depth` — Symbols — Well-Known Symbols, Hidden Properties & More |

**Excerpt:** Implement Object.create(proto, descriptors) and the instanceof operator from scratch. Understand the prototype chain walk in each.

**Sections:**
- 1. What `Object.create()` Does
- 2. Implementing `Object.create()` Polyfill
- 3. What `instanceof` Does
- 4. Implementing `instanceof` — Walking the Prototype Chain
- 5. `Symbol.hasInstance` — Customizing `instanceof`
- 6. `isPrototypeOf()` — The Other Direction
- Key Takeaways

**External Links:** None

---

<a name="article-js-symbols-in-depth"></a>

## Article: Symbols — Well-Known Symbols, Hidden Properties & More

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-symbols-in-depth` |
| **URL** | `/articles/js-symbols-in-depth` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, ES6, Symbols, Meta |
| **Read Time** | 10 min read |
| **Previous** | `js-object-create-instanceof` — Prototypes #2 — Object.create() & instanceof Polyfills |
| **Next** | `js-proxy-reflect-api` — Proxy & Reflect — Validation, Observables & Traps |

**Excerpt:** Every well-known Symbol (Symbol.iterator, Symbol.toPrimitive, Symbol.hasInstance, etc.), private-like properties, and custom toString/valueOf behavior.

**Sections:**
- 1. Creating Symbols — Guaranteed Unique
- 2. Symbols as Object Keys — Hidden Properties
- 3. Global Symbol Registry — `Symbol.for()` and `Symbol.keyFor()`
- 4. Well-Known Symbols — Hooking Into JavaScript
- 5. All Well-Known Symbols at a Glance
- Key Takeaways

**External Links:** None

---

<a name="article-js-proxy-reflect-api"></a>

## Article: Proxy & Reflect — Validation, Observables & Traps

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-proxy-reflect-api` |
| **URL** | `/articles/js-proxy-reflect-api` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, ES6, Proxy, Meta |
| **Read Time** | 12 min read |
| **Previous** | `js-symbols-in-depth` — Symbols — Well-Known Symbols, Hidden Properties & More |
| **Next** | `js-json-stringify-parser` — Parsing #1 — Building a Simple JSON.stringify() |

**Excerpt:** Build a validation proxy, a negative-array-index proxy, an observable object, and understand all 13 proxy traps with Reflect counterparts.

**Sections:**
- 1. Proxy Basics — Intercepting Property Access
- 2. Why `Reflect`? — Not Just Convenience
- 3. Validation Proxy — Enforce Rules on Assignment
- 4. Negative Array Index Proxy
- 5. Observable Object — Track Changes
- 6. All 13 Proxy Traps
- 7. Revocable Proxy
- 8. Proxy Limitations — What CAN'T Be Intercepted
- Key Takeaways

**External Links:** None

---

<a name="article-js-json-stringify-parser"></a>

## Article: Parsing #1 — Building a Simple JSON.stringify()

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-json-stringify-parser` |
| **URL** | `/articles/js-json-stringify-parser` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Parsing, JSON, Recursion |
| **Read Time** | 11 min read |
| **Previous** | `js-proxy-reflect-api` — Proxy & Reflect — Validation, Observables & Traps |
| **Next** | `js-url-query-parser` — Parsing #2 — URL & Query String Parsing |

**Excerpt:** Understand the JSON grammar and build a simplified stringify that handles primitives, arrays, objects, and nested structures. Handles circular reference detection.

**Sections:**
- 1. What `JSON.stringify()` Handles
- 2. Basic `stringify` — Primitives, Objects, Arrays
- 3. Circular Reference Detection
- 4. The `toJSON()` Method — Custom Serialization
- 5. The `replacer` Parameter — Filter and Transform
- 6. Building a Minimal `JSON.parse()` (Bonus)
- Key Takeaways

**External Links:** None

---

<a name="article-js-url-query-parser"></a>

## Article: Parsing #2 — URL & Query String Parsing

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-url-query-parser` |
| **URL** | `/articles/js-url-query-parser` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Parsing, URL, Utilities |
| **Read Time** | 9 min read |
| **Previous** | `js-json-stringify-parser` — Parsing #1 — Building a Simple JSON.stringify() |
| **Next** | `js-string-templating-engine` — Parsing #3 — Building a Template Engine |

**Excerpt:** Parse query strings into objects (handling arrays, nested keys, and encoding), build URL query strings, and implement a lightweight template engine.

**Sections:**
- 1. Parse Query String → Object
- 2. Object → Query String
- 3. Parse Nested Query Keys (Bracket Notation)
- 4. Parse URL — Extract Protocol, Host, Path, Query
- 5. Full URL Builder
- Key Takeaways

**External Links:** None

---

<a name="article-js-string-templating-engine"></a>

## Article: Parsing #3 — Building a Template Engine

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-string-templating-engine` |
| **URL** | `/articles/js-string-templating-engine` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Parsing, Templating, Strings |
| **Read Time** | 10 min read |
| **Previous** | `js-url-query-parser` — Parsing #2 — URL & Query String Parsing |
| **Next** | `js-v8-jit-compilation` — V8 #1 — JIT Compilation & Hidden Classes |

**Excerpt:** Build a Handlebars-style template engine that replaces {{ variables }}, handles nested objects, loops, and conditionals — using regex and string parsing.

**Sections:**
- 1. Simple Variable Replacement — `{{ var }}`
- 2. Conditionals — `{{#if}}` and `{{/if}}`
- 3. Loops — `{{#each}}` and `{{/each}}`
- 4. Full Engine — if, unless, each, and variables
- 5. Escaping — Preventing HTML Injection
- Key Takeaways

**External Links:** None

---

<a name="article-js-v8-jit-compilation"></a>

## Article: V8 #1 — JIT Compilation & Hidden Classes

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-v8-jit-compilation` |
| **URL** | `/articles/js-v8-jit-compilation` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, V8, Engine, Performance |
| **Read Time** | 12 min read |
| **Previous** | `js-string-templating-engine` — Parsing #3 — Building a Template Engine |
| **Next** | `js-memory-leaks-gc` — V8 #2 — Memory Leaks & Garbage Collection |

**Excerpt:** How V8's interpreter (Ignition) and optimizing compiler (TurboFan) work. Hidden classes, inline caching, and monomorphic vs megamorphic call sites.

**Sections:**
- 1. The Two-Compiler Pipeline
- 2. Hidden Classes (Shape) — How V8 Optimizes Objects
- 3. Inline Caching (IC) — Remembering Property Locations
- 4. Polymorphic and Megamorphic — When Caching Fails
- 5. The Optimization / Deoptimization Cycle
- 6. What Stays Fast in V8
- Key Takeaways

**External Links:** None

---

<a name="article-js-memory-leaks-gc"></a>

## Article: V8 #2 — Memory Leaks & Garbage Collection

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-memory-leaks-gc` |
| **URL** | `/articles/js-memory-leaks-gc` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Memory, GC, Performance |
| **Read Time** | 12 min read |
| **Previous** | `js-v8-jit-compilation` — V8 #1 — JIT Compilation & Hidden Classes |
| **Next** | `js-hoisting-tdz-deep` — Engine #1 — Hoisting & TDZ: What the Engine Actually Does |

**Excerpt:** Mark-and-sweep, generational GC, the four leak patterns (forgotten timers, detached DOM, closure captures, unbounded caches), and heap snapshot debugging.

**Sections:**
- 1. Mark-and-Sweep — How GC Works
- 2. Leak Pattern #1 — Forgotten Timers and Intervals
- 3. Leak Pattern #2 — Detached DOM Nodes
- 4. Leak Pattern #3 — Closure Capturing Large Data
- 5. Leak Pattern #4 — Unbounded Caches
- 6. Detecting Leaks — The Heap Snapshot Pattern
- Key Takeaways

**External Links:** None

---

<a name="article-js-hoisting-tdz-deep"></a>

## Article: Engine #1 — Hoisting & TDZ: What the Engine Actually Does

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-hoisting-tdz-deep` |
| **URL** | `/articles/js-hoisting-tdz-deep` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Engine, Hoisting, Internals |
| **Read Time** | 10 min read |
| **Previous** | `js-memory-leaks-gc` — V8 #2 — Memory Leaks & Garbage Collection |
| **Next** | `js-module-systems` — Modules — IIFE, CommonJS, AMD, ESM |

**Excerpt:** How the parser creates execution contexts, hoists declarations, initializes let/const in the TDZ, and why typeof is not safe for TDZ variables.

**Sections:**
- 1. The Two Phases — Creation vs Execution
- 2. Environment Records — Where Variables Actually Live
- 3. The Temporal Dead Zone — Why It Exists
- 4. Function Declarations in Blocks — The Surprising Case
- 5. Class Hoisting — Classes are NOT Fully Hoisted
- 6. Summary — Hoisting Rules by Declaration Type
- Key Takeaways

**External Links:** None

---

<a name="article-js-module-systems"></a>

## Article: Modules — IIFE, CommonJS, AMD, ESM

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-module-systems` |
| **URL** | `/articles/js-module-systems` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Modules, ESM, History |
| **Read Time** | 10 min read |
| **Previous** | `js-hoisting-tdz-deep` — Engine #1 — Hoisting & TDZ: What the Engine Actually Does |
| **Next** | `js-classes-under-hood` — Classes Under the Hood — Desugaring to Prototypes |

**Excerpt:** The evolution from IIFE module pattern to CommonJS to AMD to ES Modules. Understand each system's syntax, scope rules, and loading semantics.

**Sections:**
- 1. The IIFE Module Pattern (Pre-ES6)
- 2. The Revealing Module Pattern
- 3. CommonJS — The Node.js Standard
- 4. AMD — Asynchronous Module Definition (Browser)
- 5. ES Modules — The Official Standard
- 6. Comparing the Module Systems
- Key Takeaways

**External Links:** None

---

<a name="article-js-classes-under-hood"></a>

## Article: Classes Under the Hood — Desugaring to Prototypes

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-classes-under-hood` |
| **URL** | `/articles/js-classes-under-hood` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Classes, Prototypes, ES6 |
| **Read Time** | 11 min read |
| **Previous** | `js-module-systems` — Modules — IIFE, CommonJS, AMD, ESM |
| **Next** | `js-classes-practical` — Classes — Practical Guide |

**Excerpt:** Every class feature (constructor, methods, getters/setters, static, extends, super, private fields) desugared to ES5 prototypes and closures.

**Sections:**
- 1. Basic Class → Constructor + Prototype
- 2. Getters and Setters
- 3. Static Methods
- 4. `extends` and `super` — The Full Desugar
- 5. Private Fields — `#` Syntax
- 6. Full Checklist — What Desugars to What
- Key Takeaways

**External Links:** None

---

<a name="article-js-classes-practical"></a>

## Article: Classes — Practical Guide

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-classes-practical` |
| **URL** | `/articles/js-classes-practical` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Classes, Patterns |
| **Read Time** | 10 min read |
| **Previous** | `js-classes-under-hood` — Classes Under the Hood — Desugaring to Prototypes |
| **Next** | `js-deopt-patterns` — V8 #3 — Deoptimization Patterns |

**Excerpt:** Class syntax, constructor, getters/setters, static methods, extends/super, private fields (#), this binding gotchas, and common patterns (Builder, Registry, EventEmitter).

**Sections:**
- 1. Basic Class Syntax
- 2. `extends` — Inheritance
- 3. Private Fields (ES2022)
- 4. `this` in Class Methods
- 5. Instance vs Prototype Methods
- 6. `instanceof` with Classes
- 7. Common Patterns
- Quick Reference
- Interview Tips
- Related Articles

**External Links:** None

---

<a name="article-js-deopt-patterns"></a>

## Article: V8 #3 — Deoptimization Patterns

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-deopt-patterns` |
| **URL** | `/articles/js-deopt-patterns` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, V8, Performance, Engine |
| **Read Time** | 10 min read |
| **Previous** | `js-classes-practical` — Classes — Practical Guide |
| **Next** | `js-event-emitter` — Patterns #1 — Event Emitter / Pub-Sub |

**Excerpt:** What deopts a function in V8: delete, arguments object, polymorphic property access, try/catch in hot functions, and changing object shape — with before/after examples.

**Sections:**
- 1. The `delete` Operator — Changing Object Shape
- 2. The `arguments` Object — Hidden Side Effects
- 3. Polymorphic Property Access — Too Many Shapes
- 4. `try/catch` in Hot Functions
- 5. Mixed Types in the Same Variable
- 6. Adding Properties After Object Creation
- 7. Deopt Pattern Summary
- Key Takeaways

**External Links:** None

---

<a name="article-js-event-emitter"></a>

## Article: Patterns #1 — Event Emitter / Pub-Sub

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-event-emitter` |
| **URL** | `/articles/js-event-emitter` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Patterns, Event Emitter |
| **Read Time** | 10 min read |
| **Previous** | `js-deopt-patterns` — V8 #3 — Deoptimization Patterns |
| **Next** | `js-observer-pattern` — Patterns #2 — Observer Pattern & Reactive Primitives |

**Excerpt:** Implement on, off, emit, and once from scratch. Handle multiple listeners per event, once-only listeners, and wildcard events.

**Sections:**
- 1. Basic Event Emitter — `on`, `emit`
- 2. `once()` — Listen for Exactly One Event
- 3. `removeAllListeners` and `listenerCount`
- 4. Wildcard / Catch-All Events — `"*"`
- 5. Max Listeners Warning (Node.js Convention)
- Key Takeaways

**External Links:** None

---

<a name="article-js-observer-pattern"></a>

## Article: Patterns #2 — Observer Pattern & Reactive Primitives

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-observer-pattern` |
| **URL** | `/articles/js-observer-pattern` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Patterns, Observer, Reactive |
| **Read Time** | 10 min read |
| **Previous** | `js-event-emitter` — Patterns #1 — Event Emitter / Pub-Sub |
| **Next** | `js-singleton-factory-patterns` — Patterns #3 — Singleton, Factory & Constructor |

**Excerpt:** Build a basic observable with subscribe/unsubscribe/notify, computed values, and a simple reactive store — the patterns behind RxJS and Redux.

**Sections:**
- 1. Basic Observable — Subscribe, Unsubscribe, Notify
- 2. Observable with State — Basic Store
- 3. Computed Values — Derived State
- 4. Simple Signal Implementation
- 5. Observer vs Event Emitter vs Pub-Sub
- Key Takeaways

**External Links:** None

---

<a name="article-js-singleton-factory-patterns"></a>

## Article: Patterns #3 — Singleton, Factory & Constructor

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-singleton-factory-patterns` |
| **URL** | `/articles/js-singleton-factory-patterns` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Patterns, Design |
| **Read Time** | 9 min read |
| **Previous** | `js-observer-pattern` — Patterns #2 — Observer Pattern & Reactive Primitives |
| **Next** | `js-linked-list` — Data Structures #1 — Linked List |

**Excerpt:** Singleton via closures and ES modules, factory functions vs constructor functions vs class, and when each pattern makes sense.

**Sections:**
- 1. Singleton — One Instance, Guaranteed
- 2. Factory Function — Create Objects Without `new`
- 3. Constructor Function vs Factory Function
- 4. When to Use Which
- Key Takeaways

**External Links:** None

---

<a name="article-js-linked-list"></a>

## Article: Data Structures #1 — Linked List

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-linked-list` |
| **URL** | `/articles/js-linked-list` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Data Structures, Linked List |
| **Read Time** | 11 min read |
| **Previous** | `js-singleton-factory-patterns` — Patterns #3 — Singleton, Factory & Constructor |
| **Next** | `js-hash-table` — Data Structures #2 — Hash Table |

**Excerpt:** Implement singly and doubly linked lists with insert, delete, search, reverse, and detect-cycle methods. Understand O(1) vs O(n) trade-offs.

**Sections:**
- 1. Singly Linked List — Node + Basic Structure
- 2. Reverse a Linked List — Classic Interview Question
- 3. Detect Cycle — Floyd's Tortoise and Hare
- 4. Doubly Linked List
- Key Takeaways

**External Links:** None

---

<a name="article-js-hash-table"></a>

## Article: Data Structures #2 — Hash Table

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-hash-table` |
| **URL** | `/articles/js-hash-table` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Data Structures, Hash Table |
| **Read Time** | 11 min read |
| **Previous** | `js-linked-list` — Data Structures #1 — Linked List |
| **Next** | `js-lru-cache` — Data Structures #3 — LRU Cache |

**Excerpt:** Build a hash table with bucket array, collision chaining, dynamic resizing, and a basic hash function. Understand load factor and rehashing.

**Sections:**
- 1. The Hash Function — Key to Array Index
- 2. Hash Table with Separate Chaining
- 3. Hash Collision Demonstration
- Key Takeaways

**External Links:** None

---

<a name="article-js-lru-cache"></a>

## Article: Data Structures #3 — LRU Cache

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-lru-cache` |
| **URL** | `/articles/js-lru-cache` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Data Structures, LRU, Cache |
| **Read Time** | 10 min read |
| **Previous** | `js-hash-table` — Data Structures #2 — Hash Table |
| **Next** | `js-binary-heap-priority-queue` — Data Structures #4 — Binary Heap & Priority Queue |

**Excerpt:** Least Recently Used cache combining a hash map with a doubly linked list for O(1) get and put. With capacity eviction and usage examples.

**Sections:**
- 1. The Key Insight — Two Data Structures Working Together
- 2. Full LRU Cache Implementation
- 3. LRU Using JavaScript `Map` (Simplest Implementation)
- 4. Why Doubly Linked List + Hash Map?
- Key Takeaways

**External Links:** None

---

<a name="article-js-binary-heap-priority-queue"></a>

## Article: Data Structures #4 — Binary Heap & Priority Queue

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-binary-heap-priority-queue` |
| **URL** | `/articles/js-binary-heap-priority-queue` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Data Structures, Heap, Queue |
| **Read Time** | 11 min read |
| **Previous** | `js-lru-cache` — Data Structures #3 — LRU Cache |
| **Next** | `js-trie-prefix-tree` — Data Structures #5 — Trie (Prefix Tree) |

**Excerpt:** Implement a min-heap (array-based), bubble-up and sink-down, and a priority queue with O(log n) enqueue and dequeue.

**Sections:**
- 1. The Array Layout — Parent/Child Index Math
- 2. Min-Heap Implementation
- 3. Priority Queue Built on Min-Heap
- 4. Heapify — Build a Heap from an Array in O(n)
- Key Takeaways

**External Links:** None

---

<a name="article-js-trie-prefix-tree"></a>

## Article: Data Structures #5 — Trie (Prefix Tree)

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-trie-prefix-tree` |
| **URL** | `/articles/js-trie-prefix-tree` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Data Structures, Trie, Strings |
| **Read Time** | 10 min read |
| **Previous** | `js-binary-heap-priority-queue` — Data Structures #4 — Binary Heap & Priority Queue |
| **Next** | `js-compose-pipe` — FP #1 — compose() & pipe() |

**Excerpt:** Build insert, search, startsWith, and autocomplete on a Trie. Handle deletion and understand space/time trade-offs vs hash maps.

**Sections:**
- 1. Basic Trie — Insert, Search, startsWith
- 2. Autocomplete — Find All Words with a Prefix
- 3. Delete a Word from a Trie
- 4. Count Words with a Given Prefix
- 5. When to Use a Trie vs Hash Map
- Key Takeaways

**External Links:** None

---

<a name="article-js-compose-pipe"></a>

## Article: FP #1 — compose() & pipe()

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-compose-pipe` |
| **URL** | `/articles/js-compose-pipe` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Functional, Composition |
| **Read Time** | 10 min read |
| **Previous** | `js-trie-prefix-tree` — Data Structures #5 — Trie (Prefix Tree) |
| **Next** | `js-transduce` — FP #2 — transduce() — Map + Filter in One Pass |

**Excerpt:** Implement right-to-left compose and left-to-right pipe. Handle multiple arguments, async pipes, and real-world transformation pipelines.

**Sections:**
- 1. `compose()` — Right-to-Left
- 2. `pipe()` — Left-to-Right (More Readable)
- 3. Handling Multiple Arguments — Pipe with First Function
- 4. Async Pipe — Chain Async Functions
- 5. Pipe with Error Handling — Railway Pattern
- Key Takeaways

**External Links:** None

---

<a name="article-js-transduce"></a>

## Article: FP #2 — transduce() — Map + Filter in One Pass

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-transduce` |
| **URL** | `/articles/js-transduce` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Functional, Transducer |
| **Read Time** | 11 min read |
| **Previous** | `js-compose-pipe` — FP #1 — compose() & pipe() |
| **Next** | `js-maybe-either-monad` — FP #3 — Maybe & Either Monads |

**Excerpt:** Build a transducer that fuses map and filter into a single reduction pass. Understand the reducer-transform pattern and when it matters.

**Sections:**
- 1. The Problem — Intermediate Arrays
- 2. Transducer Building Blocks — Reducing Functions
- 3. Putting It All Together
- 4. Visual Comparison
- 5. Complete Minimal Transducer Library
- Key Takeaways

**External Links:** None

---

<a name="article-js-maybe-either-monad"></a>

## Article: FP #3 — Maybe & Either Monads

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-maybe-either-monad` |
| **URL** | `/articles/js-maybe-either-monad` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Functional, Monad, Error Handling |
| **Read Time** | 12 min read |
| **Previous** | `js-transduce` — FP #2 — transduce() — Map + Filter in One Pass |
| **Next** | `js-point-free-style` — FP #4 — Point-Free Style & Referential Transparency |

**Excerpt:** Build Maybe (Some/None) and Either (Right/Left) monads for error-safe pipelines. Chain operations without null checks or try/catch litter.

**Sections:**
- 1. The Problem — Defensive Null Checks Everywhere
- 2. Maybe Monad — Chain Without Null Checks
- 3. Either Monad — Success/Failure Paths
- 4. Railway-Oriented Programming Visualized
- 5. Chaining Async Operations with Either
- Key Takeaways

**External Links:** None

---

<a name="article-js-point-free-style"></a>

## Article: FP #4 — Point-Free Style & Referential Transparency

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-point-free-style` |
| **URL** | `/articles/js-point-free-style` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Functional, Style |
| **Read Time** | 9 min read |
| **Previous** | `js-maybe-either-monad` — FP #3 — Maybe & Either Monads |
| **Next** | `js-immutability-patterns` — FP #5 — Immutability Patterns |

**Excerpt:** Write functions without naming arguments. Understand referential transparency, pure functions, side effects, and when point-free makes code clearer (or worse).

**Sections:**
- 1. What is Point-Free Style?
- 2. Common Point-Free Patterns
- 3. When Point-Free Goes Wrong
- 4. Referential Transparency — Same Input, Same Output
- 5. Pure Functions — The Foundation
- Key Takeaways

**External Links:** None

---

<a name="article-js-immutability-patterns"></a>

## Article: FP #5 — Immutability Patterns

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-immutability-patterns` |
| **URL** | `/articles/js-immutability-patterns` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Functional, Immutability |
| **Read Time** | 10 min read |
| **Previous** | `js-point-free-style` — FP #4 — Point-Free Style & Referential Transparency |
| **Next** | `js-dom-basics` — DOM Basics — Element Selection, Traversal & Styles |

**Excerpt:** Object.freeze, deep freeze, structuredClone, spread-based updates, Immer-style produce(), and Immutable.js concepts — preventing unintended mutation.

**Sections:**
- 1. Preventing Mutation — `const` vs `Object.freeze`
- 2. Deep Freeze — Recursive Immutability
- 3. Immutable Updates — Spread, Map, Filter
- 4. `structuredClone()` — Deep Copy Built Into the Platform
- 5. Immer-Style `produce()` — Write Mutable, Get Immutable
- 6. Immutability Library Comparison
- Key Takeaways

**External Links:** None

---

<a name="article-js-dom-basics"></a>

## Article: DOM Basics — Element Selection, Traversal & Styles

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-dom-basics` |
| **URL** | `/articles/js-dom-basics` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, DOM, Browser, Fundamentals |
| **Read Time** | 9 min read |
| **Previous** | `js-immutability-patterns` — FP #5 — Immutability Patterns |
| **Next** | `js-requestanimationframe-idlecallback` — Web APIs #1 — requestAnimationFrame & requestIdleCallback |

**Excerpt:** querySelector, getElementById, tagName, classList, children, parentElement, getComputedStyle vs element.style, createElement, appendChild, remove.

**Sections:**
- 1. Finding Elements
- 2. Element Properties
- 3. `classList` API
- 4. Attributes
- 5. Traversing the Tree
- 6. Creating, Inserting, and Removing Elements
- 7. Styles
- 8. Events
- 9. Data Storage on Elements
- Quick Reference
- Interview Tips
- Related Articles

**External Links:** None

---

<a name="article-js-requestanimationframe-idlecallback"></a>

## Article: Web APIs #1 — requestAnimationFrame & requestIdleCallback

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-requestanimationframe-idlecallback` |
| **URL** | `/articles/js-requestanimationframe-idlecallback` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Web API, Animation, Performance |
| **Read Time** | 10 min read |
| **Previous** | `js-dom-basics` — DOM Basics — Element Selection, Traversal & Styles |
| **Next** | `js-web-workers-offscreen` — Web APIs #2 — Web Workers & OffscreenCanvas |

**Excerpt:** Sync JavaScript to the display refresh rate with rAF, perform low-priority work with requestIdleCallback, and understand where each fits in the frame lifecycle.

**Sections:**
- 1. The Frame Lifecycle — Where rAF and rIC Fit
- 2. `requestAnimationFrame` — Smooth Animations
- 3. Canceling rAF
- 4. `requestIdleCallback` — Do Work When the Browser is Free
- 5. rIC with Timeout — Ensure Work Runs
- 6. When to Use Each
- Key Takeaways

**External Links:** None

---

<a name="article-js-web-workers-offscreen"></a>

## Article: Web APIs #2 — Web Workers & OffscreenCanvas

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-web-workers-offscreen` |
| **URL** | `/articles/js-web-workers-offscreen` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Web API, Workers, Concurrency |
| **Read Time** | 11 min read |
| **Previous** | `js-requestanimationframe-idlecallback` — Web APIs #1 — requestAnimationFrame & requestIdleCallback |
| **Next** | `js-intersection-observer` — Web APIs #3 — Intersection Observer |

**Excerpt:** Move heavy computation off the main thread with Web Workers. Dedicated vs shared workers, postMessage, transferables, and OffscreenCanvas for canvas rendering.

**Sections:**
- 1. The Problem — Main Thread Blocking
- 2. Creating a Worker — Move Work Off the Main Thread
- 3. Transferable Objects — Zero-Copy Data Transfer
- 4. Worker Types Comparison
- 5. Worker Limitations
- Key Takeaways

**External Links:** None

---

<a name="article-js-intersection-observer"></a>

## Article: Web APIs #3 — Intersection Observer

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-intersection-observer` |
| **URL** | `/articles/js-intersection-observer` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Web API, Observer, Performance |
| **Read Time** | 10 min read |
| **Previous** | `js-web-workers-offscreen` — Web APIs #2 — Web Workers & OffscreenCanvas |
| **Next** | `js-event-delegation-bubbling` — DOM Events #1 — Event Delegation & Bubbling |

**Excerpt:** Lazy load images, infinite scroll, and track ad visibility — all without scroll event handlers. Understanding thresholds, rootMargin, and the observer callback.

**Sections:**
- 1. Basic Observer — Detect When an Element Becomes Visible
- 2. Options — threshold, rootMargin, root
- 3. Lazy Loading Images Pattern
- 4. Infinite Scroll Pattern
- 5. Sticky Header Shadow on Scroll
- 6. Intersection Observer vs Scroll Events
- Key Takeaways

**External Links:** None

---

<a name="article-js-event-delegation-bubbling"></a>

## Article: DOM Events #1 — Event Delegation & Bubbling

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-event-delegation-bubbling` |
| **URL** | `/articles/js-event-delegation-bubbling` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, DOM, Events, Performance |
| **Read Time** | 10 min read |
| **Previous** | `js-intersection-observer` — Web APIs #3 — Intersection Observer |
| **Next** | `js-drag-and-drop` — DOM Events #2 — Drag & Drop |

**Excerpt:** Capture phase, target phase, bubble phase, stopPropagation vs stopImmediatePropagation, and how event delegation eliminates hundreds of listeners.

**Sections:**
- 1. The Three Phases — Capture, Target, Bubble
- 2. `stopPropagation` vs `stopImmediatePropagation`
- 3. The Problem Without Delegation — N Listeners for N Elements
- 4. Event Delegation — The Pattern
- 5. `matches()` and `closest()` — The Two Key Methods
- 6. Event Delegation with Dynamic Content
- 7. Event Propagation Diagram
- Key Takeaways

**External Links:** None

---

<a name="article-js-drag-and-drop"></a>

## Article: DOM Events #2 — Drag & Drop

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-drag-and-drop` |
| **URL** | `/articles/js-drag-and-drop` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, DOM, Drag and Drop, UI |
| **Read Time** | 10 min read |
| **Previous** | `js-event-delegation-bubbling` — DOM Events #1 — Event Delegation & Bubbling |
| **Next** | `js-storage-cookies-indexeddb` — Web APIs #4 — localStorage, Cookies, sessionStorage & IndexedDB |

**Excerpt:** Native drag and drop API, custom drag implementation with mousedown/mousemove/mouseup, touch support, and accessibility considerations.

**Sections:**
- 1. Native HTML5 Drag and Drop API
- 2. Custom Drag — Using mousedown/mousemove/mouseup
- 3. Sortable List — Reorder Items with Drag and Drop
- 4. File Drop Zone
- 5. Accessibility Considerations
- Key Takeaways

**External Links:** None

---

<a name="article-js-storage-cookies-indexeddb"></a>

## Article: Web APIs #4 — localStorage, Cookies, sessionStorage & IndexedDB

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-storage-cookies-indexeddb` |
| **URL** | `/articles/js-storage-cookies-indexeddb` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Web API, Storage, Browser |
| **Read Time** | 12 min read |
| **Previous** | `js-drag-and-drop` — DOM Events #2 — Drag & Drop |
| **Next** | `js-interview-call-apply-bind` — Interview #1 — Implement call(), apply() & bind() from Scratch |

**Excerpt:** Compare all four storage APIs. Implement a localStorage wrapper with TTL expiry, cookie get/set/delete utilities, and a basic IndexedDB CRUD store.

**Sections:**
- 1. The Four Storage APIs Compared
- 2. `localStorage` Wrapper with TTL Expiry
- 3. Cookie Utilities — get, set, delete
- 4. IndexedDB — Basic CRUD Store
- 5. When to Use Which Storage
- Key Takeaways

**External Links:** None

---

<a name="article-js-interview-call-apply-bind"></a>

## Article: Interview #1 — Implement call(), apply() & bind() from Scratch

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-call-apply-bind` |
| **URL** | `/articles/js-interview-call-apply-bind` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, this |
| **Read Time** | 12 min read |
| **Previous** | `js-storage-cookies-indexeddb` — Web APIs #4 — localStorage, Cookies, sessionStorage & IndexedDB |
| **Next** | `js-interview-map-filter-reduce` — Interview #2 — Implement map(), filter() & reduce() from Scratch |

**Excerpt:** Implementing call, apply, and bind is one of the most common JS interview questions. Here's how each one borrows this, and how to write polyfills that pass every edge case.

**Sections:**
- What are `call()`, `apply()`, and `bind()`?
- The Problem
- Thought Process
- Step 1 — `myCall`: Base Implementation
- Step 2 — `myApply`: Arguments as an Array
- Step 3 — `myBind`: Return a New Function
- Step 4 — Edge Cases
- Step 5 — Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-map-filter-reduce"></a>

## Article: Interview #2 — Implement map(), filter() & reduce() from Scratch

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-map-filter-reduce` |
| **URL** | `/articles/js-interview-map-filter-reduce` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Arrays |
| **Read Time** | 12 min read |
| **Previous** | `js-interview-call-apply-bind` — Interview #1 — Implement call(), apply() & bind() from Scratch |
| **Next** | `js-interview-make-counter` — Interview #3 — Make Counter: The Classic Closure Question |

**Excerpt:** These three polyfills appear in almost every frontend interview. Build each one from scratch — handling the callback signature, thisArg, sparse arrays, and the reduce initialValue edge case.

**Sections:**
- What are `map()`, `filter()`, and `reduce()`?
- The Problem
- Thought Process
- Step 1 — `myMap`
- Step 2 — `myFilter`
- Step 3 — `myReduce`
- Step 4 — Edge Cases the Interviewer Will Test
- Step 5 — Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-make-counter"></a>

## Article: Interview #3 — Make Counter: The Classic Closure Question

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-make-counter` |
| **URL** | `/articles/js-interview-make-counter` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Closures |
| **Read Time** | 8 min read |
| **Previous** | `js-interview-map-filter-reduce` — Interview #2 — Implement map(), filter() & reduce() from Scratch |
| **Next** | `js-interview-once` — Interview #4 — Implement once() — A Function That Runs At Most Once |

**Excerpt:** makeCounter is the canonical closure interview question. Start with a simple increment counter, then build the full version with reset, increment, decrement, and getValue methods.

**Sections:**
- What is `makeCounter()`?
- The Problem
- Thought Process
- Step 1 — Version I: Simple Closure Counter
- Step 2 — Version II: Counter Object with Methods
- Step 3 — Why Closures Make This Work
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-once"></a>

## Article: Interview #4 — Implement once() — A Function That Runs At Most Once

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-once` |
| **URL** | `/articles/js-interview-once` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Closures |
| **Read Time** | 7 min read |
| **Previous** | `js-interview-make-counter` — Interview #3 — Make Counter: The Classic Closure Question |
| **Next** | `js-interview-type-utilities` — Interview #5 — Type Utilities: typeof, instanceof & Custom Type Checks |

**Excerpt:** once() wraps a function so it can only execute on the first call. Every subsequent call returns the cached result. It's a single-closure problem with a few tricky edge cases.

**Sections:**
- What is `once()`?
- The Problem
- Thought Process
- Step 1 — Base Implementation
- Step 2 — Preserving `this` Context
- Step 3 — Extension: `limit(fn, n)`
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-type-utilities"></a>

## Article: Interview #5 — Type Utilities: typeof, instanceof & Custom Type Checks

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-type-utilities` |
| **URL** | `/articles/js-interview-type-utilities` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Types |
| **Read Time** | 8 min read |
| **Previous** | `js-interview-once` — Interview #4 — Implement once() — A Function That Runs At Most Once |
| **Next** | `js-interview-get` — Interview #6 — Implement Lodash's _.get() for Safe Nested Access |

**Excerpt:** Type checking in JavaScript is a minefield of quirks. Build a complete set of isString, isNumber, isArray, isNull, isPlainObject utilities using typeof, instanceof, and Object.prototype.toString.

**Sections:**
- What are Type Utilities?
- The Problem
- Thought Process
- Step 1 — `typeof` — What It Gets Right and Wrong
- Step 2 — Base Implementations
- Step 3 — `isArray` and `isObject`
- Step 4 — `isPlainObject`
- Step 5 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips

**External Links:** None

---

<a name="article-js-interview-get"></a>

## Article: Interview #6 — Implement Lodash's _.get() for Safe Nested Access

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-get` |
| **URL** | `/articles/js-interview-get` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Objects |
| **Read Time** | 7 min read |
| **Previous** | `js-interview-type-utilities` — Interview #5 — Type Utilities: typeof, instanceof & Custom Type Checks |
| **Next** | `js-interview-sleep` — Interview #7 — Implement sleep() — Pausing Execution with Promises |

**Excerpt:** _.get(obj, 'a.b.c', defaultValue) safely drills into nested objects without throwing. Implement it supporting dot notation, bracket notation, and a fallback default value.

**Sections:**
- What is `get()`?
- The Problem
- Thought Process
- Step 1 — Base: Dot Notation Only
- Step 2 — Why `current == null` Works
- Step 3 — Extended: Bracket Notation
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips

**External Links:** None

---

<a name="article-js-interview-sleep"></a>

## Article: Interview #7 — Implement sleep() — Pausing Execution with Promises

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-sleep` |
| **URL** | `/articles/js-interview-sleep` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Async |
| **Read Time** | 5 min read |
| **Previous** | `js-interview-get` — Interview #6 — Implement Lodash's _.get() for Safe Nested Access |
| **Next** | `js-interview-debounce` — Interview #8 — Implement debounce() with cancel() and flush() |

**Excerpt:** sleep(ms) pauses async execution for a given number of milliseconds. It's a one-liner that tests whether you understand how Promise resolution and await work together.

**Sections:**
- What is `sleep()`?
- The Problem
- Thought Process
- Step 1 — The One-Liner
- Step 2 — Why `setTimeout(0)` Is Not "Immediate"
- Step 3 — Cancellable Sleep
- Step 4 — Extension: Sleep with a Return Value
- Step 5 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-debounce"></a>

## Article: Interview #8 — Implement debounce() with cancel() and flush()

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-debounce` |
| **URL** | `/articles/js-interview-debounce` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Timers |
| **Read Time** | 14 min read |
| **Previous** | `js-interview-sleep` — Interview #7 — Implement sleep() — Pausing Execution with Promises |
| **Next** | `js-interview-throttle` — Interview #9 — Implement throttle() with Trailing Edge |

**Excerpt:** Debounce delays execution until calls stop. Build trailing-edge debounce first, then add leading edge, cancel(), and flush() — covering every variant interviewers ask for.

**Sections:**
- What is `debounce()`?
- The Problem
- Thought Process
- Step 1 — Base: Trailing-Edge Debounce
- Step 2 — Adding the Leading Edge
- Step 3 — Adding `cancel()`
- Step 4 — Adding `flush()`
- Step 5 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-throttle"></a>

## Article: Interview #9 — Implement throttle() with Trailing Edge

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-throttle` |
| **URL** | `/articles/js-interview-throttle` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Timers |
| **Read Time** | 12 min read |
| **Previous** | `js-interview-debounce` — Interview #8 — Implement debounce() with cancel() and flush() |
| **Next** | `js-interview-memoize` — Interview #10 — Implement memoize() with Custom Key Resolver |

**Excerpt:** Throttle guarantees a function runs at most once per interval. Build leading-edge throttle, then add a trailing-edge call to ensure the last invocation always fires.

**Sections:**
- What is `throttle()`?
- The Problem
- Thought Process
- Step 1 — Base: Leading-Edge Throttle
- Step 2 — Debounce vs Throttle: The Key Distinction
- Step 3 — Adding Trailing Edge
- Step 4 — Combining Leading + Trailing
- Step 5 — Alternate Approach: Timer-Based Throttle
- Step 6 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-memoize"></a>

## Article: Interview #10 — Implement memoize() with Custom Key Resolver

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-memoize` |
| **URL** | `/articles/js-interview-memoize` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Closures |
| **Read Time** | 10 min read |
| **Previous** | `js-interview-throttle` — Interview #9 — Implement throttle() with Trailing Edge |
| **Next** | `js-interview-curry` — Interview #11 — Implement curry() — Fixed Arity and Variadic |

**Excerpt:** Memoize caches a function's results keyed by its arguments. Build memoize for single-arg functions, then extend it with a resolver for multi-arg and object-key caching.

**Sections:**
- What is `memoize()`?
- The Problem
- Thought Process
- Step 1 — Base: Single-Argument Memoize
- Step 2 — Why the Default Key Breaks for Multiple Arguments
- Step 3 — Adding a Custom Resolver
- Step 4 — Handling Object Arguments
- Step 5 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-curry"></a>

## Article: Interview #11 — Implement curry() — Fixed Arity and Variadic

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-curry` |
| **URL** | `/articles/js-interview-curry` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Functional |
| **Read Time** | 12 min read |
| **Previous** | `js-interview-memoize` — Interview #10 — Implement memoize() with Custom Key Resolver |
| **Next** | `js-interview-flatten` — Interview #12 — Implement Array flatten() with Depth Control |

**Excerpt:** curry(fn) transforms f(a, b, c) into f(a)(b)(c). Build the fixed-arity version using fn.length, then the variadic version that collects args until called with no arguments.

**Sections:**
- What is `curry()`?
- The Problem
- Thought Process
- Step 1 — Curry I: Fixed Arity (One Arg Per Call)
- Step 2 — How Argument Accumulation Works
- Step 3 — Curry II: Variadic with Termination on Empty Call
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-flatten"></a>

## Article: Interview #12 — Implement Array flatten() with Depth Control

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-flatten` |
| **URL** | `/articles/js-interview-flatten` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Arrays |
| **Read Time** | 10 min read |
| **Previous** | `js-interview-curry` — Interview #11 — Implement curry() — Fixed Arity and Variadic |
| **Next** | `js-interview-deep-clone` — Interview #13 — Implement deepClone() for JSON-Serializable Values |

**Excerpt:** Flatten an array recursively to a single level, or to a specified depth. Three approaches — recursive, iterative with a stack, and reduce-based — each with different trade-offs.

**Sections:**
- What is `flatten()`?
- The Problem
- Thought Process
- Step 1 — Full Flatten (Recursive)
- Step 2 — Depth-Limited Flatten
- Step 3 — Iterative (Stack-Based)
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-deep-clone"></a>

## Article: Interview #13 — Implement deepClone() for JSON-Serializable Values

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-deep-clone` |
| **URL** | `/articles/js-interview-deep-clone` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Objects |
| **Read Time** | 11 min read |
| **Previous** | `js-interview-flatten` — Interview #12 — Implement Array flatten() with Depth Control |
| **Next** | `js-interview-deep-equal` — Interview #14 — Implement deepEqual() for Structural Comparison |

**Excerpt:** Deep clone a value containing objects, arrays, strings, numbers, null, and booleans — without JSON.stringify. Build it with recursion, handling every JSON-serializable type correctly.

**Sections:**
- What is `deepClone()`?
- The Problem
- Thought Process
- Step 1 — Base Implementation
- Step 2 — Handle Nested Arrays
- Step 3 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-deep-equal"></a>

## Article: Interview #14 — Implement deepEqual() for Structural Comparison

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-deep-equal` |
| **URL** | `/articles/js-interview-deep-equal` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Objects |
| **Read Time** | 11 min read |
| **Previous** | `js-interview-deep-clone` — Interview #13 — Implement deepClone() for JSON-Serializable Values |
| **Next** | `js-interview-deep-omit` — Interview #15 — Implement deepOmit() — Remove Keys from Nested Objects |

**Excerpt:** deepEqual checks if two values have the same structure and values, not the same reference. Handle primitives, arrays, plain objects, null, NaN, and the +0/-0 edge case.

**Sections:**
- What is `deepEqual()`?
- The Problem
- Thought Process
- Step 1 — Primitives with NaN
- Step 2 — Arrays
- Step 3 — Objects
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-deep-omit"></a>

## Article: Interview #15 — Implement deepOmit() — Remove Keys from Nested Objects

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-deep-omit` |
| **URL** | `/articles/js-interview-deep-omit` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Objects |
| **Read Time** | 9 min read |
| **Previous** | `js-interview-deep-equal` — Interview #14 — Implement deepEqual() for Structural Comparison |
| **Next** | `js-interview-squash-object` — Interview #16 — Implement squash() — Flatten Nested Objects to Dot Paths |

**Excerpt:** deepOmit(obj, keys) removes specified keys at every level of a nested object or array. Build it with recursion handling both object and array nodes.

**Sections:**
- What is `deepOmit()`?
- The Problem
- Thought Process
- Step 1 — Shallow Omit
- Step 2 — Deep Omit (Objects)
- Step 3 — Arrays of Objects
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-squash-object"></a>

## Article: Interview #16 — Implement squash() — Flatten Nested Objects to Dot Paths

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-squash-object` |
| **URL** | `/articles/js-interview-squash-object` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Objects |
| **Read Time** | 10 min read |
| **Previous** | `js-interview-deep-omit` — Interview #15 — Implement deepOmit() — Remove Keys from Nested Objects |
| **Next** | `js-interview-json-stringify` — Interview #17 — Implement a Simplified JSON.stringify() |

**Excerpt:** squash({ a: { b: { c: 1 } } }) returns { 'a.b.c': 1 }. Build it with recursion, handle arrays with bracket notation, and optionally implement the reverse (unsquash).

**Sections:**
- What is `squash()`?
- The Problem
- Thought Process
- Step 1 — Squash (Objects Only)
- Step 2 — Squash with Arrays
- Step 3 — Unsquash (Reverse)
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-json-stringify"></a>

## Article: Interview #17 — Implement a Simplified JSON.stringify()

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-json-stringify` |
| **URL** | `/articles/js-interview-json-stringify` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Parsing |
| **Read Time** | 11 min read |
| **Previous** | `js-interview-squash-object` — Interview #16 — Implement squash() — Flatten Nested Objects to Dot Paths |
| **Next** | `js-interview-promise-combinators` — Interview #18 — Implement Promise.all, race, any & allSettled |

**Excerpt:** Build a JSON.stringify that handles all JSON-serializable types: strings, numbers, booleans, null, arrays, and objects. Understand what the real implementation skips (undefined, functions, symbols).

**Sections:**
- What is `JSON.stringify()`?
- The Problem
- Thought Process
- Step 1 — Primitives
- Step 2 — Arrays
- Step 3 — Objects
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-promise-combinators"></a>

## Article: Interview #18 — Implement Promise.all, race, any & allSettled

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-promise-combinators` |
| **URL** | `/articles/js-interview-promise-combinators` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Promises |
| **Read Time** | 14 min read |
| **Previous** | `js-interview-json-stringify` — Interview #17 — Implement a Simplified JSON.stringify() |
| **Next** | `js-interview-promisify` — Interview #19 — Implement promisify() — Convert Callbacks to Promises |

**Excerpt:** Four combinators, four different resolution strategies. Implement each from scratch — understanding exactly when each resolves, when it rejects, and what shape the result takes.

**Sections:**
- What are Promise Combinators?
- The Problem
- Thought Process
- Step 1 — `myPromiseAll`
- Step 2 — `myPromiseRace`
- Step 3 — `myPromiseAllSettled`
- Step 4 — `myPromiseAny`
- Step 5 — Edge Cases
- Comparison Table
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-promisify"></a>

## Article: Interview #19 — Implement promisify() — Convert Callbacks to Promises

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-promisify` |
| **URL** | `/articles/js-interview-promisify` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Promises |
| **Read Time** | 10 min read |
| **Previous** | `js-interview-promise-combinators` — Interview #18 — Implement Promise.all, race, any & allSettled |
| **Next** | `js-interview-promise-timeout` — Interview #20 — Implement promiseTimeout() — Race a Promise Against a Deadline |

**Excerpt:** promisify wraps a Node.js-style error-first callback function and returns a Promise-based version. Build the base version, then extend it to let the original function override the resolved value.

**Sections:**
- What is `promisify()`?
- The Problem
- Thought Process
- Step 1 — Base Implementation
- Step 2 — Preserving `this` Context
- Step 3 — Multiple Success Values
- Step 4 — Version II: Custom Resolve Override
- Step 5 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-promise-timeout"></a>

## Article: Interview #20 — Implement promiseTimeout() — Race a Promise Against a Deadline

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-promise-timeout` |
| **URL** | `/articles/js-interview-promise-timeout` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Promises |
| **Read Time** | 8 min read |
| **Previous** | `js-interview-promisify` — Interview #19 — Implement promisify() — Convert Callbacks to Promises |
| **Next** | `js-interview-map-async` — Interview #21 — Implement mapAsync() and mapAsyncLimit() |

**Excerpt:** promiseTimeout(promise, ms) rejects with a timeout error if the promise doesn't settle within the given time. This is a direct application of Promise.race with a timer.

**Sections:**
- What is `promiseTimeout()`?
- The Problem
- Thought Process
- Step 1 — Base Implementation
- Step 2 — Cleaning Up the Timer
- Step 3 — Custom Error Class
- Step 4 — Higher-Order `withTimeout`
- Step 5 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-map-async"></a>

## Article: Interview #21 — Implement mapAsync() and mapAsyncLimit()

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-map-async` |
| **URL** | `/articles/js-interview-map-async` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Async, Concurrency |
| **Read Time** | 12 min read |
| **Previous** | `js-interview-promise-timeout` — Interview #20 — Implement promiseTimeout() — Race a Promise Against a Deadline |
| **Next** | `js-interview-event-emitter` — Interview #22 — Implement an EventEmitter with on, off, emit & once |

**Excerpt:** mapAsync runs an async mapping function over an array. mapAsyncLimit adds a concurrency cap — never more than N requests in flight at once. The second is the real interview question.

**Sections:**
- What is `mapAsync()`?
- The Problem
- Thought Process
- Step 1 — `mapAsync` (Unlimited Concurrency)
- Step 2 — `mapAsyncLimit` (Running-Count Approach)
- Step 3 — Error Handling
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-event-emitter"></a>

## Article: Interview #22 — Implement an EventEmitter with on, off, emit & once

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-event-emitter` |
| **URL** | `/articles/js-interview-event-emitter` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Patterns |
| **Read Time** | 12 min read |
| **Previous** | `js-interview-map-async` — Interview #21 — Implement mapAsync() and mapAsyncLimit() |
| **Next** | `js-interview-classnames` — Interview #23 — Implement classnames() — Conditional CSS Class Joining |

**Excerpt:** Build an EventEmitter class from scratch. Version I uses a listener array. Version II returns a subscription object with an unsubscribe() method.

**Sections:**
- What is an EventEmitter?
- The Problem
- Thought Process
- Step 1 — Base EventEmitter
- Step 2 — emit-during-emit Safety
- Step 3 — Version II: Subscription Object
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-classnames"></a>

## Article: Interview #23 — Implement classnames() — Conditional CSS Class Joining

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-classnames` |
| **URL** | `/articles/js-interview-classnames` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Utilities |
| **Read Time** | 9 min read |
| **Previous** | `js-interview-event-emitter` — Interview #22 — Implement an EventEmitter with on, off, emit & once |
| **Next** | `js-interview-dom-traversal` — Interview #24 — Implement getElementsByClassName, TagName & Style |

**Excerpt:** classnames(a, b, { active: true, hidden: false }) joins truthy class names into a single string. Handle strings, numbers, arrays, objects, and nested arrays.

**Sections:**
- What is `classnames()`?
- The Problem
- Thought Process
- Step 1 — Strings and Objects
- Step 2 — Arrays (Flat and Nested)
- Step 3 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-dom-traversal"></a>

## Article: Interview #24 — Implement getElementsByClassName, TagName & Style

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-dom-traversal` |
| **URL** | `/articles/js-interview-dom-traversal` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, DOM |
| **Read Time** | 11 min read |
| **Previous** | `js-interview-classnames` — Interview #23 — Implement classnames() — Conditional CSS Class Joining |
| **Next** | `js-interview-data-merging` — Interview #25 — Implement Data Merging — Combine Rows by User |

**Excerpt:** Three classic DOM traversal questions in one. Each requires a recursive tree walk — the logic is the same, only the match condition changes.

**Sections:**
- What is DOM Traversal?
- The Problem
- Thought Process
- Step 1 — `getElementsByClassName`
- Step 2 — `getElementsByTagName`
- Step 3 — `getElementsByStyle`
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-data-merging"></a>

## Article: Interview #25 — Implement Data Merging — Combine Rows by User

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-data-merging` |
| **URL** | `/articles/js-interview-data-merging` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Arrays |
| **Read Time** | 9 min read |
| **Previous** | `js-interview-dom-traversal` — Interview #24 — Implement getElementsByClassName, TagName & Style |
| **Next** | `js-interview-count-by` — Interview #26 — Implement countBy() — Group and Count Array Elements |

**Excerpt:** Given an array of user activity rows where one user can appear multiple times, merge them into one row per user. This is a reduce-into-a-Map problem with careful field merging logic.

**Sections:**
- What is Data Merging?
- The Problem
- Thought Process
- Step 1 — Base Implementation
- Step 2 — Handling Conflicting Scalar Values
- Step 3 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-count-by"></a>

## Article: Interview #26 — Implement countBy() — Group and Count Array Elements

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-count-by` |
| **URL** | `/articles/js-interview-count-by` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Arrays |
| **Read Time** | 7 min read |
| **Previous** | `js-interview-data-merging` — Interview #25 — Implement Data Merging — Combine Rows by User |
| **Next** | `js-interview-list-format` — Interview #27 — Implement listFormat() — Human-Readable List Strings |

**Excerpt:** countBy(array, fn) groups array elements by the result of a function and returns a count of how many fall into each group. It's a single reduce call.

**Sections:**
- What is `countBy()`?
- The Problem
- Thought Process
- Step 1 — Base with `reduce`
- Step 2 — Supporting String Keys (Shortcut)
- Step 3 — Extension: `groupBy`
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-list-format"></a>

## Article: Interview #27 — Implement listFormat() — Human-Readable List Strings

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-list-format` |
| **URL** | `/articles/js-interview-list-format` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Strings |
| **Read Time** | 7 min read |
| **Previous** | `js-interview-count-by` — Interview #26 — Implement countBy() — Group and Count Array Elements |
| **Next** | `js-interview-deep-clone-circular` — Interview #28 — Deep Clone with Circular Reference Handling |

**Excerpt:** listFormat(['a', 'b', 'c']) returns 'a, b, and c'. Handle 0, 1, 2, and 3+ items differently, support custom conjunctions, and match the behavior of Intl.ListFormat.

**Sections:**
- What is `listFormat()`?
- The Problem
- Thought Process
- Step 1 — Base Cases
- Step 2 — Formatting Individual Items
- Step 3 — Disjunction Style (or / and)
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-deep-clone-circular"></a>

## Article: Interview #28 — Deep Clone with Circular Reference Handling

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-deep-clone-circular` |
| **URL** | `/articles/js-interview-deep-clone-circular` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Objects |
| **Read Time** | 11 min read |
| **Previous** | `js-interview-list-format` — Interview #27 — Implement listFormat() — Human-Readable List Strings |
| **Next** | `js-interview-curry-variadic` — Interview #29 — Variadic curry() — Call with Any Number of Args |

**Excerpt:** The base deep clone breaks on circular references. Solve it with a WeakMap that tracks already-cloned objects and returns the clone instead of recursing infinitely.

**Sections:**
- What is Circular Reference Handling in `deepClone()`?
- The Problem
- Thought Process
- Step 1 — Circular Reference Detection
- Step 2 — Handling Date and RegExp
- Step 3 — Handling Map and Set
- Step 4 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-curry-variadic"></a>

## Article: Interview #29 — Variadic curry() — Call with Any Number of Args

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-curry-variadic` |
| **URL** | `/articles/js-interview-curry-variadic` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Functional |
| **Read Time** | 12 min read |
| **Previous** | `js-interview-deep-clone-circular` — Interview #28 — Deep Clone with Circular Reference Handling |
| **Next** | `js-interview-data-selection` — Interview #30 — Implement a Data Selection / Filter Engine |

**Excerpt:** The hardest curry variant: transform f(a, b, c, d) so it can be called as f(a)(b, c)(d) — any number of arguments at each step, accumulating until enough args are collected.

**Sections:**
- What is Variadic `curry()`?
- The Problem
- Thought Process
- Step 1 — Base Variadic Curry
- Step 2 — Handling Extra Arguments
- Step 3 — Preserving `this` Context
- Step 4 — Functions with Rest Parameters or Defaults
- Step 5 — Infinite Currying with Terminator
- Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-interview-data-selection"></a>

## Article: Interview #30 — Implement a Data Selection / Filter Engine

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-interview-data-selection` |
| **URL** | `/articles/js-interview-data-selection` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Implementation, Data |
| **Read Time** | 13 min read |
| **Previous** | `js-interview-curry-variadic` — Interview #29 — Variadic curry() — Call with Any Number of Args |
| **Next** | `js-output-scope-hoisting` — Output Quiz #1 — Scope, Hoisting & the TDZ |

**Excerpt:** Build a filter function that takes an array of rows and a criteria object, returning only rows that match all conditions. Support exact match, range filters, and multi-value filters.

**Sections:**
- What is a Data Selection Engine?
- The Problem
- Thought Process
- Step 1 — Exact Match
- Step 2 — Range Filters
- Step 3 — Multi-Value (`in`)
- Step 4 — Combining Criterion Types
- Step 5 — Extension: OR Groups
- Step 6 — Edge Cases
- Full Solution
- What Interviewers Are Testing
- Complexity
- Interview Tips
- Related Questions

**External Links:** None

---

<a name="article-js-output-scope-hoisting"></a>

## Article: Output Quiz #1 — Scope, Hoisting & the TDZ

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-output-scope-hoisting` |
| **URL** | `/articles/js-output-scope-hoisting` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Output |
| **Read Time** | 10 min read |
| **Previous** | `js-interview-data-selection` — Interview #30 — Implement a Data Selection / Filter Engine |
| **Next** | `js-output-closures` — Output Quiz #2 — Closures & the Loop Problem |

**Excerpt:** 10 output questions on var hoisting, function hoisting, let/const TDZ, and block scope — predict the output before revealing the answer.

**Sections:**
- Q1 — var declaration before assignment
- Q2 — Function declaration vs var
- Q3 — let in the Temporal Dead Zone
- Q4 — var leaks out of blocks
- Q5 — Function declaration wins over var
- Q6 — var inside a for loop
- Q7 — Nested scope and shadowing
- Q8 — const must be initialised
- Q9 — Hoisting across multiple var declarations
- Q10 — let in a nested block
- Key Rules
- Go Deeper

**External Links:** None

---

<a name="article-js-output-closures"></a>

## Article: Output Quiz #2 — Closures & the Loop Problem

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-output-closures` |
| **URL** | `/articles/js-output-closures` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Output |
| **Read Time** | 10 min read |
| **Previous** | `js-output-scope-hoisting` — Output Quiz #1 — Scope, Hoisting & the TDZ |
| **Next** | `js-output-event-loop` — Output Quiz #3 — The Event Loop & Task Ordering |

**Excerpt:** 10 output questions on the classic var loop, let loop, IIFE fix, stale closures, and counter factories — the closure patterns every interviewer tests.

**Sections:**
- Q1 — The classic var loop
- Q2 — Fix with let
- Q3 — Fix with IIFE
- Q4 — Stale closure reference
- Q5 — Closure over a reassigned variable
- Q6 — Each call gets its own scope
- Q7 — Closure in an object method
- Q8 — Loop with array push
- Q9 — Closure lifespan
- Q10 — Immediately-returned closure
- Key Rules
- Go Deeper

**External Links:** None

---

<a name="article-js-output-event-loop"></a>

## Article: Output Quiz #3 — The Event Loop & Task Ordering

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-output-event-loop` |
| **URL** | `/articles/js-output-event-loop` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Output |
| **Read Time** | 10 min read |
| **Previous** | `js-output-closures` — Output Quiz #2 — Closures & the Loop Problem |
| **Next** | `js-output-this-binding` — Output Quiz #4 — this Binding & Arrow Functions |

**Excerpt:** 10 output questions on setTimeout(0) vs Promise, microtask vs macrotask order, async/await interleaving, and queueMicrotask — predict the exact execution order.

**Sections:**
- Q1 — setTimeout(0) vs synchronous code
- Q2 — Promise vs setTimeout
- Q3 — Chained .then()
- Q4 — queueMicrotask vs setTimeout
- Q5 — async/await interleaving
- Q6 — Multiple awaits
- Q7 — Promise constructor is synchronous
- Q8 — Nested setTimeout
- Q9 — Promise then vs async/await mixing
- Q10 — Microtask starvation
- Key Rules
- Go Deeper

**External Links:** None

---

<a name="article-js-output-this-binding"></a>

## Article: Output Quiz #4 — this Binding & Arrow Functions

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-output-this-binding` |
| **URL** | `/articles/js-output-this-binding` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Output |
| **Read Time** | 10 min read |
| **Previous** | `js-output-event-loop` — Output Quiz #3 — The Event Loop & Task Ordering |
| **Next** | `js-output-type-coercion` — Output Quiz #5 — Type Coercion & Equality Traps |

**Excerpt:** 10 output questions on default, implicit, explicit, and new binding — plus arrow function this and the binding priority rules.

**Sections:**
- Q1 — Default binding (non-strict)
- Q2 — Implicit binding
- Q3 — Implicit binding lost on extraction
- Q4 — Explicit binding with call
- Q5 — Arrow function this
- Q6 — Arrow function inside a method
- Q7 — bind creates a permanently bound function
- Q8 — Class method called as callback
- Q9 — new binding
- Q10 — Binding priority
- Key Rules — Binding Priority (high → low)
- Go Deeper

**External Links:** None

---

<a name="article-js-output-type-coercion"></a>

## Article: Output Quiz #5 — Type Coercion & Equality Traps

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-output-type-coercion` |
| **URL** | `/articles/js-output-type-coercion` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Output |
| **Read Time** | 10 min read |
| **Previous** | `js-output-this-binding` — Output Quiz #4 — this Binding & Arrow Functions |
| **Next** | `js-output-promises-async` — Output Quiz #6 — Promises & async/await Ordering |

**Excerpt:** 10 output questions on the + operator, == abstract equality, [] == ![], typeof null, and unary coercion — the JS quirks that catch everyone out.

**Sections:**
- Q1 — String + Number
- Q2 — Adding arrays
- Q3 — == with null and undefined
- Q4 — [] == ![]
- Q5 — Unary + operator
- Q6 — Falsy values
- Q7 — == with objects
- Q8 — typeof edge cases
- Q9 — String comparison (lexicographic)
- Q10 — Template literal coercion
- Key Rules
- Go Deeper

**External Links:** None

---

<a name="article-js-output-promises-async"></a>

## Article: Output Quiz #6 — Promises & async/await Ordering

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-output-promises-async` |
| **URL** | `/articles/js-output-promises-async` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Output |
| **Read Time** | 10 min read |
| **Previous** | `js-output-type-coercion` — Output Quiz #5 — Type Coercion & Equality Traps |
| **Next** | `js-output-promise-chaining` — Output Quiz #7 — Promise Chaining & the .catch() Recovery Rules |

**Excerpt:** 10 output questions on Promise executor timing, .then() as microtasks, async return values, await suspension, and unhandled rejections.

**Sections:**
- Q1 — Promise executor is synchronous
- Q2 — .then() is a microtask
- Q3 — Returning a value from .then()
- Q4 — async function return value
- Q5 — await pauses, then resumes
- Q6 — Promise.all ordering
- Q7 — Rejected Promise and .catch()
- Q8 — try/catch with async/await
- Q9 — Promise.all vs sequential await
- Q10 — Unhandled rejection
- Key Rules
- Go Deeper

**External Links:** None

---

<a name="article-js-output-promise-chaining"></a>

## Article: Output Quiz #7 — Promise Chaining & the .catch() Recovery Rules

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-output-promise-chaining` |
| **URL** | `/articles/js-output-promise-chaining` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Output |
| **Read Time** | 10 min read |
| **Previous** | `js-output-promises-async` — Output Quiz #6 — Promises & async/await Ordering |
| **Next** | `js-output-promise-combinators` — Output Quiz #8 — Promise.all, race, allSettled & any |

**Excerpt:** 10 output questions on what .then() does with returned Promises, when .catch() recovers vs stays rejected, .finally() pass-through.

**Sections:**
- Q1 — Returning a plain value from .then()
- Q2 — Returning a rejected Promise from .then()
- Q3 — .catch() recovers the chain
- Q4 — .catch() re-throwing keeps the chain rejected
- Q5 — .finally() passes the value through
- Q6 — .finally() throwing overrides the resolved value
- Q7 — .then(onFulfilled, onRejected) does not catch its own onFulfilled's error
- Q8 — Two concurrent chains interleave breadth-first
- Q9 — resolve(promise) adds an extra microtask tick
- Q10 — Promise.resolve(existingPromise) returns the same object
- Key Rules
- Go Deeper

**External Links:** None

---

<a name="article-js-output-promise-combinators"></a>

## Article: Output Quiz #8 — Promise.all, race, allSettled & any

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-output-promise-combinators` |
| **URL** | `/articles/js-output-promise-combinators` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Output |
| **Read Time** | 10 min read |
| **Previous** | `js-output-promise-chaining` — Output Quiz #7 — Promise Chaining & the .catch() Recovery Rules |
| **Next** | `js-output-async-patterns` — Output Quiz #9 — async/await Patterns & the return vs return await Trap |

**Excerpt:** 10 output questions on when each combinator resolves or rejects, what shape the values have.

**Sections:**
- Q1 — Promise.all with all resolved — order is input order
- Q2 — Promise.all with one rejection
- Q3 — Promise.all with an empty array
- Q4 — Promise.race — first settled wins
- Q5 — Promise.race where the first settles as a rejection
- Q6 — Promise.allSettled never rejects
- Q7 — Promise.allSettled output shape in full
- Q8 — Promise.any — first fulfilled wins, skips rejections
- Q9 — Promise.any when all reject — AggregateError
- Q10 — Promise.any vs Promise.race when the first settles as rejection
- Key Rules
- Go Deeper

**External Links:** None

---

<a name="article-js-output-async-patterns"></a>

## Article: Output Quiz #9 — async/await Patterns & the return vs return await Trap

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-output-async-patterns` |
| **URL** | `/articles/js-output-async-patterns` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Output |
| **Read Time** | 10 min read |
| **Previous** | `js-output-promise-combinators` — Output Quiz #8 — Promise.all, race, allSettled & any |
| **Next** | `js-output-settimeout-promise` — Output Quiz #10 — setTimeout + Promises: Real-World Interleaving |

**Excerpt:** 10 output questions exposing the return-vs-return-await pitfall in try/catch, sequential vs parallel timing.

**Sections:**
- Q1 — await on a non-Promise suspends too
- Q2 — Code before the first await is synchronous
- Q3 — Error thrown before first await creates a rejected Promise
- Q4 — return Promise.reject() in try is NOT caught
- Q5 — return await Promise.reject() IS caught
- Q6 — Sequential await vs Promise.all timing
- Q7 — Async IIFE suspends independently
- Q8 — await inside .map() doesn't pause the outer function
- Q9 — Nested async functions — how many ticks to resume outer?
- Q10 — for await...of iterates sequentially
- Key Rules
- Go Deeper

**External Links:** None

---

<a name="article-js-output-settimeout-promise"></a>

## Article: Output Quiz #10 — setTimeout + Promises: Real-World Interleaving

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-output-settimeout-promise` |
| **URL** | `/articles/js-output-settimeout-promise` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Output |
| **Read Time** | 10 min read |
| **Previous** | `js-output-async-patterns` — Output Quiz #9 — async/await Patterns & the return vs return await Trap |
| **Next** | `js-output-async-errors` — Output Quiz #11 — Async Error Propagation |

**Excerpt:** 10 output questions tracing exact order when setTimeout callbacks, Promise chains, and async functions mix.

**Sections:**
- Q1 — setTimeout inside a .then() handler
- Q2 — Promise.resolve() inside a setTimeout callback
- Q3 — Two setTimeouts + one Promise
- Q4 — Promise chain → setTimeout → Promise chain
- Q5 — setTimeout with delay vs resolving Promise after shorter duration
- Q6 — Three setTimeouts with same delay + Promise chain
- Q7 — Async function called from a setTimeout callback
- Q8 — Promise.all inside a setTimeout
- Q9 — Nested setTimeout + Promise.resolve()
- Q10 — Full multi-layer trace
- Key Rules
- Go Deeper

**External Links:** None

---

<a name="article-js-output-async-errors"></a>

## Article: Output Quiz #11 — Async Error Propagation

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-output-async-errors` |
| **URL** | `/articles/js-output-async-errors` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Output |
| **Read Time** | 10 min read |
| **Previous** | `js-output-settimeout-promise` — Output Quiz #10 — setTimeout + Promises: Real-World Interleaving |
| **Next** | `js-output-microtask-order` — Output Quiz #12 — Microtask Queue: Breadth-First Ordering |

**Excerpt:** 10 output questions on how errors move through async call stacks — unhandled rejections, re-throwing through .catch(), Promise.all with rejection.

**Sections:**
- Q1 — throw inside async function creates a rejected Promise
- Q2 — Promise.reject() with no .catch()
- Q3 — Error in Promise executor is NOT catchable by sync try/catch
- Q4 — .catch() returning a value recovers the chain
- Q5 — .catch() that re-throws keeps the chain rejected
- Q6 — Promise.all discards results on first rejection
- Q7 — Chained async function calls propagate errors through await
- Q8 — try/catch without await doesn't cover the async function's body
- Q9 — Unhandled rejection in .then() chain catches
- Q10 — Long .then() chain — where does the 3rd .then()'s error end up?
- Key Rules
- Go Deeper

**External Links:** None

---

<a name="article-js-output-microtask-order"></a>

## Article: Output Quiz #12 — Microtask Queue: Breadth-First Ordering

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-output-microtask-order` |
| **URL** | `/articles/js-output-microtask-order` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Output |
| **Read Time** | 10 min read |
| **Previous** | `js-output-async-errors` — Output Quiz #11 — Async Error Propagation |
| **Next** | `js-output-mixed-easy` — Output Quiz #13 — Mixed Async Topics (Easy) |

**Excerpt:** 10 output questions on why two concurrent .then() chains interleave breadth-first, how queueMicrotask fits in.

**Sections:**
- Q1 — Two concurrent chains: breadth-first, not depth-first
- Q2 — Why breadth-first matters
- Q3 — Three concurrent chains
- Q4 — queueMicrotask vs Promise.resolve().then()
- Q5 — queueMicrotask from inside a .then() handler
- Q6 — Three async functions called back-to-back: exact interleaving
- Q7 — Async function with two await points
- Q8 — Nested microtask scheduling: all drain before next macrotask
- Q9 — resolve(promise) gets one extra microtask tick
- Q10 — Full complexity: 3 async functions + queueMicrotasks + setTimeout
- Key Rules
- Go Deeper

**External Links:** None

---

<a name="article-js-output-mixed-easy"></a>

## Article: Output Quiz #13 — Mixed Async Topics (Easy)

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-output-mixed-easy` |
| **URL** | `/articles/js-output-mixed-easy` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Output |
| **Read Time** | 10 min read |
| **Previous** | `js-output-microtask-order` — Output Quiz #12 — Microtask Queue: Breadth-First Ordering |
| **Next** | `js-output-mixed-hard` — Output Quiz #14 — Mixed Async Topics (Hard) |

**Excerpt:** 10 entry-level output questions sampling one foundational concept from each area — scope, closures, event loop, this, coercion, promises.

**Sections:**
- Q1 — var hoisting
- Q2 — Classic var loop + setTimeout
- Q3 — setTimeout(0) vs Promise.then
- Q4 — this binding — method extracted and called standalone
- Q5 — Type coercion with +
- Q6 — Promise executor is synchronous
- Q7 — .catch() recovery
- Q8 — Promise.all preserves input order
- Q9 — return vs return await in try/catch
- Q10 — Promise inside setTimeout
- Key Rules
- Go Deeper

**External Links:** None

---

<a name="article-js-output-mixed-hard"></a>

## Article: Output Quiz #14 — Mixed Async Topics (Hard)

| Field | Value |
|-------|-------|
| **ID / Slug** | `js-output-mixed-hard` |
| **URL** | `/articles/js-output-mixed-hard` |
| **Series / Category** | javascript |
| **Tags** | JavaScript, Interview, Output |
| **Read Time** | 10 min read |
| **Previous** | `js-output-mixed-easy` — Output Quiz #13 — Mixed Async Topics (Easy) |
| **Next** | `react-virtual-dom-reconciliation` — How React Works Inside the Browser Pipeline |

**Excerpt:** 10 expert-level output questions combining concurrent Promise chains, resolve(promise) timing, async error layers, and multi-queue interleaving.

**Sections:**
- Q1 — Breadth-first with concrete values
- Q2 — resolve(promise) vs resolve(plain) head start
- Q3 — return vs return await in a nested async chain
- Q4 — Promise.race vs Promise.any on first rejection
- Q5 — Promise chain schedules setTimeout, setTimeout schedules Promise
- Q6 — Async error propagation through three layers
- Q7 — Promise.allSettled output shape
- Q8 — await inside .map() finishes before mapped promises
- Q9 — for await...of sequential timing
- Q10 — Everything at once
- Key Rules
- Go Deeper

**External Links:** None

---

<a name="article-react-virtual-dom-reconciliation"></a>

## Article: How React Works Inside the Browser Pipeline

| Field | Value |
|-------|-------|
| **ID / Slug** | `react-virtual-dom-reconciliation` |
| **URL** | `/articles/react-virtual-dom-reconciliation` |
| **Series / Category** | react, performance |
| **Tags** | React, Performance, Browser, JavaScript |
| **Read Time** | 10 min read |
| **Previous** | `js-output-mixed-hard` — Output Quiz #14 — Mixed Async Topics (Hard) |
| **Next** | `what-is-virtual-dom` — What is the Virtual DOM? |

**Excerpt:** Virtual DOM, reconciliation, state batching, and concurrent rendering — explained in terms of the six browser pipeline steps every frame goes through.

**Sections:**
- The Problem React Is Solving
- The Virtual DOM
- Reconciliation: Finding the Diff
- Where React Runs in the Pipeline
- State Batching: One Update, One Re-render
- React 18: Concurrent Rendering
- React Server Components
- Practical Takeaways

**External Links:** None

---

<a name="article-what-is-virtual-dom"></a>

## Article: What is the Virtual DOM?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-virtual-dom` |
| **URL** | `/articles/what-is-virtual-dom` |
| **Series / Category** | react, fundamentals |
| **Tags** | React, Browser, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `react-virtual-dom-reconciliation` — How React Works Inside the Browser Pipeline |
| **Next** | `what-is-reconciliation` — What is Reconciliation? |

**Excerpt:** The Virtual DOM is an in-memory JavaScript tree React uses to batch DOM updates. Here's what it is, why it exists, and how it differs from the real DOM.

**Sections:**
- Why it exists
- What it looks like
- Virtual DOM vs Real DOM
- The tradeoff

**External Links:** None

---

<a name="article-what-is-reconciliation"></a>

## Article: What is Reconciliation?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-reconciliation` |
| **URL** | `/articles/what-is-reconciliation` |
| **Series / Category** | react, fundamentals |
| **Tags** | React, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-virtual-dom` — What is the Virtual DOM? |
| **Next** | `what-is-react-fiber` — What is React Fiber? |

**Excerpt:** Reconciliation is how React diffs two Virtual DOM trees to find the minimum set of real DOM mutations. Here are the two assumptions that make it run in O(n).

**Sections:**
- The naive approach and why React doesn't use it
- What reconciliation produces
- Reconciliation in React 18

**External Links:** None

---

<a name="article-what-is-react-fiber"></a>

## Article: What is React Fiber?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-react-fiber` |
| **URL** | `/articles/what-is-react-fiber` |
| **Series / Category** | react, fundamentals |
| **Tags** | React, Fundamentals |
| **Read Time** | 5 min read |
| **Previous** | `what-is-reconciliation` — What is Reconciliation? |
| **Next** | `what-is-hydration` — What is Hydration? |

**Excerpt:** Fiber is React's internal unit of work — a linked-list architecture that makes rendering interruptible, prioritisable, and resumable. It's the engine behind concurrent mode.

**Sections:**
- What a Fiber is
- Why a linked list and not a tree?
- Two trees: current and work-in-progress
- How concurrent rendering uses Fiber
- Fiber as a concept vs. the Fiber reconciler

**External Links:** None

---

<a name="article-what-is-hydration"></a>

## Article: What is Hydration?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-hydration` |
| **URL** | `/articles/what-is-hydration` |
| **Series / Category** | react, fundamentals |
| **Tags** | React, SSR, Fundamentals |
| **Read Time** | 5 min read |
| **Previous** | `what-is-react-fiber` — What is React Fiber? |
| **Next** | `what-is-react-suspense` — What is React Suspense? |

**Excerpt:** Hydration is how React attaches event handlers to server-rendered HTML. Here's what actually happens, why it can be slow, and how React 18 makes it interruptible.

**Sections:**
- Why it exists
- What React does during hydration
- The hydration cost
- React 18: selective hydration
- Hydration vs React Server Components

**External Links:** None

---

<a name="article-what-is-react-suspense"></a>

## Article: What is React Suspense?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-react-suspense` |
| **URL** | `/articles/what-is-react-suspense` |
| **Series / Category** | react, fundamentals |
| **Tags** | React, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-hydration` — What is Hydration? |
| **Next** | `what-is-streaming-ssr` — What is Streaming SSR? |

**Excerpt:** Suspense lets a component wait for something before rendering — a lazy-loaded chunk, a data fetch — and shows a fallback in the meantime. Here's how the boundary works.

**Sections:**
- Suspense for Code Splitting
- How It Works Under the Hood
- Multiple Suspense Boundaries
- Suspense and Streaming SSR
- What Suspense Is NOT
- When to Use It

**External Links:** None

---

<a name="article-what-is-streaming-ssr"></a>

## Article: What is Streaming SSR?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-streaming-ssr` |
| **URL** | `/articles/what-is-streaming-ssr` |
| **Series / Category** | react, fundamentals |
| **Tags** | React, SSR, Performance, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-react-suspense` — What is React Suspense? |
| **Next** | `what-is-dom` — What is the DOM? |

**Excerpt:** Streaming SSR sends HTML in chunks as each component's data resolves, rather than waiting for the full page. The shell arrives instantly; the rest streams in progressively.

**Sections:**
- Traditional SSR vs Streaming SSR
- How It Works With React Suspense
- What Streaming Changes
- When to Use It
- Framework Support

**External Links:** None

---

<a name="article-what-is-dom"></a>

## Article: What is the DOM?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-dom` |
| **URL** | `/articles/what-is-dom` |
| **Series / Category** | fundamentals |
| **Tags** | Browser, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-streaming-ssr` — What is Streaming SSR? |
| **Next** | `what-is-cssom` — What is the CSSOM? |

**Excerpt:** The DOM is the browser's live, in-memory tree representation of an HTML document. Here's how it's structured, why DOM operations are expensive, and how it relates to the render tree.

**Sections:**
- HTML Source vs the DOM
- Nodes, Elements, and the Tree Structure
- Why DOM Operations Are Expensive
- Live vs Static
- The DOM and the Rendering Pipeline

**External Links:** None

---

<a name="article-what-is-cssom"></a>

## Article: What is the CSSOM?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-cssom` |
| **URL** | `/articles/what-is-cssom` |
| **Series / Category** | css, fundamentals |
| **Tags** | Browser, CSS, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-dom` — What is the DOM? |
| **Next** | `what-is-css-specificity` — What is CSS Specificity? |

**Excerpt:** The CSS Object Model is the browser's internal tree of all computed styles. It's render-blocking by design — here's why, and what that means for performance.

**Sections:**
- How the browser builds it
- Why it blocks rendering
- Cascade, specificity, and inheritance
- CSSOM + DOM = Render Tree
- What this means for performance

**External Links:** None

---

<a name="article-what-is-css-specificity"></a>

## Article: What is CSS Specificity?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-css-specificity` |
| **URL** | `/articles/what-is-css-specificity` |
| **Series / Category** | css, fundamentals |
| **Tags** | CSS, Browser, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-cssom` — What is the CSSOM? |
| **Next** | `what-is-main-thread` — What is the Main Thread? |

**Excerpt:** Specificity is the four-column scoring system browsers use to decide which CSS rule wins. Inline > ID > class > element — here's how it works and why it matters.

**Sections:**
- How Specificity Is Calculated
- The Cascade: What Happens When Specificity Is Equal
- Inheritance
- `!important`
- Why Specificity Matters for Performance

**External Links:** None

---

<a name="article-what-is-main-thread"></a>

## Article: What is the Main Thread?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-main-thread` |
| **URL** | `/articles/what-is-main-thread` |
| **Series / Category** | performance, fundamentals |
| **Tags** | Browser, Performance, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-css-specificity` — What is CSS Specificity? |
| **Next** | `what-is-compositor-thread` — What is the Compositor Thread? |

**Excerpt:** The browser's main thread runs JavaScript, layout, paint, and everything else — one task at a time. Here's what that means for performance and how to protect it.

**Sections:**
- What runs on it
- Why it's a bottleneck
- The compositor thread
- Offloading work

**External Links:** None

---

<a name="article-what-is-compositor-thread"></a>

## Article: What is the Compositor Thread?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-compositor-thread` |
| **URL** | `/articles/what-is-compositor-thread` |
| **Series / Category** | performance, fundamentals |
| **Tags** | Browser, Performance, CSS, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-main-thread` — What is the Main Thread? |
| **Next** | `what-are-compositing-layers` — What are Compositing Layers? |

**Excerpt:** The compositor thread assembles painted layers into the final screen image — independently of the main thread. It's why transform and opacity animations stay smooth under load.

**Sections:**
- Main Thread vs Compositor Thread
- Why a Separate Thread Matters
- How Layers Get to the Compositor
- The Compositor and Scrolling

**External Links:** None

---

<a name="article-what-are-compositing-layers"></a>

## Article: What are Compositing Layers?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-are-compositing-layers` |
| **URL** | `/articles/what-are-compositing-layers` |
| **Series / Category** | performance, fundamentals |
| **Tags** | Browser, Performance, CSS, Fundamentals |
| **Read Time** | 5 min read |
| **Previous** | `what-is-compositor-thread` — What is the Compositor Thread? |
| **Next** | `what-is-preload-scanner` — What is the Preload Scanner? |

**Excerpt:** Compositing layers are GPU-backed bitmaps the browser composites separately. They're why transform and opacity animations can run at 60fps without touching the main thread.

**Sections:**
- How the browser builds the final image
- What triggers layer promotion
- Why compositor-thread layers are fast
- The cost of too many layers
- Inspecting layers in DevTools

**External Links:** None

---

<a name="article-what-is-preload-scanner"></a>

## Article: What is the Preload Scanner?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-preload-scanner` |
| **URL** | `/articles/what-is-preload-scanner` |
| **Series / Category** | performance, fundamentals |
| **Tags** | Browser, Performance, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-are-compositing-layers` — What are Compositing Layers? |
| **Next** | `what-is-parsing` — What is Parsing? |

**Excerpt:** The preload scanner is a secondary HTML parser that dispatches resource fetches while the main parser is blocked — it's why resources below a blocking script still load early.

**Sections:**
- Why it exists
- What the preload scanner can and cannot find
- Why this matters for performance
- The preload scanner and `defer`/`async`

**External Links:** None

---

<a name="article-what-is-parsing"></a>

## Article: What is Parsing?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-parsing` |
| **URL** | `/articles/what-is-parsing` |
| **Series / Category** | performance, fundamentals |
| **Tags** | Browser, Performance, Fundamentals |
| **Read Time** | 5 min read |
| **Previous** | `what-is-preload-scanner` — What is the Preload Scanner? |
| **Next** | `what-is-rendering` — What is Rendering? |

**Excerpt:** Parsing converts raw HTML and CSS text into the DOM and CSSOM trees the browser needs before it can render anything. It's the gateway to every pixel on screen.

**Sections:**
- HTML Parsing → DOM
- CSS Parsing → CSSOM
- JavaScript Parsing
- Why Parsing Matters for Performance

**External Links:** None

---

<a name="article-what-is-rendering"></a>

## Article: What is Rendering?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-rendering` |
| **URL** | `/articles/what-is-rendering` |
| **Series / Category** | performance, fundamentals |
| **Tags** | Browser, Performance, Fundamentals |
| **Read Time** | 5 min read |
| **Previous** | `what-is-parsing` — What is Parsing? |
| **Next** | `what-is-call-stack` — What is the Call Stack? |

**Excerpt:** Rendering is everything after parsing — building the Render Tree, calculating Layout, Painting, and Compositing to turn the DOM and CSSOM into pixels on screen.

**Sections:**
- The Four Rendering Steps
- Rendering vs Parsing
- Render-Blocking vs Parser-Blocking
- The Frame Budget
- Re-rendering
- Why Rendering Matters

**External Links:** None

---

<a name="article-what-is-call-stack"></a>

## Article: What is the Call Stack?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-call-stack` |
| **URL** | `/articles/what-is-call-stack` |
| **Series / Category** | javascript, fundamentals |
| **Tags** | JavaScript, Event Loop, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-rendering` — What is Rendering? |
| **Next** | `what-is-microtask-queue` — What is the Microtask Queue? |

**Excerpt:** The call stack is the data structure the JS engine uses to track function execution. It's a single-threaded LIFO stack — here's how it works and why a busy stack freezes the page.

**Sections:**
- How It Works
- Stack Overflow
- The Stack and the Event Loop
- Blocking the Stack
- Stack Traces

**External Links:** None

---

<a name="article-what-is-microtask-queue"></a>

## Article: What is the Microtask Queue?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-microtask-queue` |
| **URL** | `/articles/what-is-microtask-queue` |
| **Series / Category** | javascript, fundamentals |
| **Tags** | JavaScript, Event Loop, Fundamentals |
| **Read Time** | 5 min read |
| **Previous** | `what-is-call-stack` — What is the Call Stack? |
| **Next** | `what-are-long-tasks` — What are Long Tasks? |

**Excerpt:** Microtasks run after every task, before the next frame. Understanding when Promises execute — and how they can starve the task queue — requires knowing this queue.

**Sections:**
- Tasks vs Microtasks
- The order of execution
- One key rule: microtasks drain completely
- Why `await` is a microtask
- Why this matters for performance

**External Links:** None

---

<a name="article-what-are-long-tasks"></a>

## Article: What are Long Tasks?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-are-long-tasks` |
| **URL** | `/articles/what-are-long-tasks` |
| **Series / Category** | performance, fundamentals |
| **Tags** | Performance, Browser, Fundamentals |
| **Read Time** | 5 min read |
| **Previous** | `what-is-microtask-queue` — What is the Microtask Queue? |
| **Next** | `what-is-jit-compilation` — What is JIT Compilation? |

**Excerpt:** Any main-thread task over 50ms is a long task. Here's why that threshold matters, how to find long tasks in DevTools, and how to break them up.

**Sections:**
- What happens during a long task
- How to find long tasks
- How to break up long tasks
- Long tasks and Core Web Vitals

**External Links:** None

---

<a name="article-what-is-jit-compilation"></a>

## Article: What is JIT Compilation?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-jit-compilation` |
| **URL** | `/articles/what-is-jit-compilation` |
| **Series / Category** | javascript, fundamentals |
| **Tags** | JavaScript, V8, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-are-long-tasks` — What are Long Tasks? |
| **Next** | `what-is-requestanimationframe` — What is requestAnimationFrame? |

**Excerpt:** JIT combines an interpreter (fast startup) with a compiler (fast execution) to make JavaScript run near native speed. Here's how V8's two-tier pipeline works.

**Sections:**
- Interpreter vs Compiler: Two Extremes
- How V8's JIT Works
- The Optimization: Speculative Compilation
- JIT vs AOT

**External Links:** None

---

<a name="article-what-is-requestanimationframe"></a>

## Article: What is requestAnimationFrame?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-requestanimationframe` |
| **URL** | `/articles/what-is-requestanimationframe` |
| **Series / Category** | javascript, fundamentals |
| **Tags** | JavaScript, Animation, Browser, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-jit-compilation` — What is JIT Compilation? |
| **Next** | `what-is-debouncing` — What is Debouncing? |

**Excerpt:** requestAnimationFrame syncs your JavaScript to the display refresh rate. Here's how it works, why it's the right tool for JS animations, and how it differs from setTimeout.

**Sections:**
- How It Works
- rAF vs setTimeout / setInterval
- The Frame Lifecycle
- Cancelling
- When to Use rAF
- When NOT to Use rAF

**External Links:** None

---

<a name="article-what-is-debouncing"></a>

## Article: What is Debouncing?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-debouncing` |
| **URL** | `/articles/what-is-debouncing` |
| **Series / Category** | javascript, fundamentals |
| **Tags** | JavaScript, Performance, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-requestanimationframe` — What is requestAnimationFrame? |
| **Next** | `what-is-throttling` — What is Throttling? |

**Excerpt:** Debouncing ensures a function runs only once after a burst of rapid calls stops. Here's how it works, trailing vs leading edge, and when to use it over throttling.

**Sections:**
- How It Works
- Trailing-Edge vs Leading-Edge
- Common Use Cases
- Debouncing vs Throttling

**External Links:** None

---

<a name="article-what-is-throttling"></a>

## Article: What is Throttling?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-throttling` |
| **URL** | `/articles/what-is-throttling` |
| **Series / Category** | javascript, fundamentals |
| **Tags** | JavaScript, Performance, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-debouncing` — What is Debouncing? |
| **Next** | `what-is-ttfb` — What is TTFB? |

**Excerpt:** Throttling limits a function to run at most once per interval, guaranteeing regular execution during bursts. Here's how it differs from debouncing and when each one fits.

**Sections:**
- How It Works
- Why Not Just Use Debounce?
- Common Use Cases
- Throttling vs Debouncing

**External Links:** None

---

<a name="article-what-is-ttfb"></a>

## Article: What is TTFB?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-ttfb` |
| **URL** | `/articles/what-is-ttfb` |
| **Series / Category** | performance, fundamentals |
| **Tags** | Performance, Browser, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-throttling` — What is Throttling? |
| **Next** | `what-is-fcp` — What is First Contentful Paint (FCP)? |

**Excerpt:** Time to First Byte measures everything between sending a request and receiving the first byte — DNS, TCP, TLS, and server processing. It's the gate every other metric waits behind.

**Sections:**
- What TTFB includes
- Why TTFB matters
- Common causes of high TTFB
- Measuring TTFB
- The CDN fix

**External Links:** None

---

<a name="article-what-is-fcp"></a>

## Article: What is First Contentful Paint (FCP)?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-fcp` |
| **URL** | `/articles/what-is-fcp` |
| **Series / Category** | performance, fundamentals |
| **Tags** | Performance, Metrics, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-ttfb` — What is TTFB? |
| **Next** | `what-is-cdn` — What is a CDN? |

**Excerpt:** FCP measures the moment any content first appears on screen — the first visual feedback that the page is loading. Here's what delays it and how to improve it.

**Sections:**
- What It Measures
- Thresholds
- What Delays FCP
- How to Improve It
- FCP vs LCP

**External Links:** None

---

<a name="article-what-is-cdn"></a>

## Article: What is a CDN?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-cdn` |
| **URL** | `/articles/what-is-cdn` |
| **Series / Category** | performance, fundamentals |
| **Tags** | Network, Performance, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-fcp` — What is First Contentful Paint (FCP)? |
| **Next** | `what-is-dns` — What is DNS? |

**Excerpt:** A CDN is a distributed network of servers that serve your content from locations close to each user. Here's how it reduces latency, what to put on it, and how it affects TTFB.

**Sections:**
- How a CDN Works
- What CDNs Do
- What Goes on a CDN
- CDN and TTFB
- Common CDNs

**External Links:** None

---

<a name="article-what-is-dns"></a>

## Article: What is DNS?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-dns` |
| **URL** | `/articles/what-is-dns` |
| **Series / Category** | performance, fundamentals |
| **Tags** | Network, Performance, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-cdn` — What is a CDN? |
| **Next** | `what-is-cache-control` — What is Cache-Control? |

**Excerpt:** DNS translates domain names into IP addresses — and every network request starts with it. Here's how resolution works, what it costs in latency, and how to reduce that cost.

**Sections:**
- How DNS Resolution Works
- DNS and Performance
- Reducing DNS Cost
- DNS Caching TTL
- Common DNS Pitfalls

**External Links:** None

---

<a name="article-what-is-cache-control"></a>

## Article: What is Cache-Control?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-cache-control` |
| **URL** | `/articles/what-is-cache-control` |
| **Series / Category** | performance, fundamentals |
| **Tags** | Network, Caching, Performance, Fundamentals |
| **Read Time** | 4 min read |
| **Previous** | `what-is-dns` — What is DNS? |
| **Next** | `what-is-stale-while-revalidate` — What is Stale-While-Revalidate? |

**Excerpt:** Cache-Control is the HTTP header that controls browser and CDN caching. The right directives eliminate repeated downloads — here's what each one does and when to use it.

**Sections:**
- How the Browser Cache Works
- Key Directives
- ETag: Conditional Revalidation
- Cache Strategy by Resource Type

**External Links:** None

---

<a name="article-what-is-stale-while-revalidate"></a>

## Article: What is Stale-While-Revalidate?

| Field | Value |
|-------|-------|
| **ID / Slug** | `what-is-stale-while-revalidate` |
| **URL** | `/articles/what-is-stale-while-revalidate` |
| **Series / Category** | performance, fundamentals |
| **Tags** | Performance, Caching, Fundamentals |
| **Read Time** | 5 min read |
| **Previous** | `what-is-cache-control` — What is Cache-Control? |
| **Next** | `web-performance-planner` — Web Performance Planner — Building a Lighthouse Score Simulator |

**Excerpt:** Serve a cached response instantly, revalidate in the background. The closest thing caching has to a free lunch — and when not to use it.

**Sections:**
- The problem it solves
- HTTP header
- Service Worker implementation
- When to use it
- Stale-while-revalidate vs other caching strategies
- The trade-off

**External Links:** None

---

<a name="article-web-performance-planner"></a>

## Article: Web Performance Planner — Building a Lighthouse Score Simulator

| Field | Value |
|-------|-------|
| **ID / Slug** | `web-performance-planner` |
| **URL** | `/articles/web-performance-planner` |
| **Series / Category** | performance, product |
| **Tags** | Performance, React, Web Vitals, Engineering |
| **Read Time** | 5 min read |
| **Previous** | `what-is-stale-while-revalidate` — What is Stale-While-Revalidate? |
| **Next** | `holdings-analyzer` — Holdings Analyzer — A Portfolio Dashboard from Your Zerodha CSV |

**Excerpt:** A guide to using the Web Performance Planner — import a Lighthouse report and simulate Core Web Vitals changes in real time before shipping a single line of code.

**Sections:**
- Why This Changes How You Work
- Start with a Lighthouse Report
- Pages and Variations
- The Dashboard
- Comparison Mode
- Page Meta Controls
- Settings
- Sharing and Persistence
- A Real Example

**External Links:** None

---

<a name="article-holdings-analyzer"></a>

## Article: Holdings Analyzer — A Portfolio Dashboard from Your Zerodha CSV

| Field | Value |
|-------|-------|
| **ID / Slug** | `holdings-analyzer` |
| **URL** | `/articles/holdings-analyzer` |
| **Series / Category** | product |
| **Tags** | Finance, React, Portfolio, NSE |
| **Read Time** | 8 min read |
| **Previous** | `web-performance-planner` — Web Performance Planner — Building a Lighthouse Score Simulator |
| **Next** | `claude-figma-mcp-integration` — Figma MCP Integration Guide |

**Excerpt:** Upload your Zerodha Console holdings export and get a full portfolio dashboard: P&L, dividend income, valuation ratios, risk metrics, analyst ratings, and financial calculators — instantly.

**Sections:**
- Getting Started: The CSV Upload
- Overview: The Dashboard at a Glance
- Holdings: Your Editable Portfolio Table
- Dividends: Income Tracking
- Fundamentals: Valuation Metrics
- Risk: Volatility and Leverage
- Analyst: Consensus and Price Targets
- Calculators: Planning Ahead
- What the Data Is and Isn't

**External Links:** None

---

<a name="article-claude-figma-mcp-integration"></a>

## Article: Figma MCP Integration Guide

| Field | Value |
|-------|-------|
| **ID / Slug** | `claude-figma-mcp-integration` |
| **URL** | `/articles/claude-figma-mcp-integration` |
| **Series / Category** | llm-metrics |
| **Tags** | Figma, Claude, AI, LLM |
| **Read Time** | 8 min read |
| **Previous** | `holdings-analyzer` — Holdings Analyzer — A Portfolio Dashboard from Your Zerodha CSV |
| **Next** | `figma-llm-problem` — The Real Problem with Figma + LLMs |

**Excerpt:** Learn how to connect Figma MCP with Claude, extract design context, and generate production-ready UI code efficiently.

**Sections:**
- Figma MCP Setup
- Optimize Token Utilization
- `figma.get_screenshot`
- `figma.get_design_context`
- `figma.get_metadata`
- get_screenshot (MCP)
- get_design_context (MCP)
- get_metadata (MCP)

**External Links:**
- [Phone input component in Figma](https://github.com/user-attachments/assets/9db722e2-f61f-4922-b42d-02b4f4539d2f)

---

<a name="article-figma-llm-problem"></a>

## Article: The Real Problem with Figma + LLMs

| Field | Value |
|-------|-------|
| **ID / Slug** | `figma-llm-problem` |
| **URL** | `/articles/figma-llm-problem` |
| **Series / Category** | llm-metrics |
| **Tags** | Design, AI, Engineering |
| **Read Time** | 12 min read |
| **Previous** | `claude-figma-mcp-integration` — Figma MCP Integration Guide |
| **Next** | — |

**Excerpt:** Why AI-generated UI code from Figma designs is often inaccurate, and how to fix it through better design structure.

**Sections:**
- 1. Enforce Semantic Naming
- 2. Reduce Artificial Nesting
- 3. Separate Decorative Layers
- 4. Standardize Component Contracts
- 1. Conscious Token Reduction
- 2. Treat Component Names as Contracts
- 3. Multi-Page Awareness
- 4. Intra-Page Interaction Clarity
- 5. Responsive Alignment
- 6. Intentional MCP Usage

**External Links:** None

