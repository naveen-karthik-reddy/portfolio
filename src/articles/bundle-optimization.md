# Bundle Optimization — Tree Shaking & Code Splitting

JavaScript is the most expensive resource on the web — byte for byte, it costs more than images. An image has to be decoded once; JavaScript has to be parsed, compiled, and executed on every page load.

Bundle optimisation is the set of techniques that reduce how much JavaScript ships to the browser, and how much of it is parsed on any given page.

---

## Why Bundle Size Matters

Network transfer time is only part of the cost. A 500KB JavaScript bundle also requires:

- **Parse time:** the browser must tokenise and parse the source into an AST.
- **Compile time:** the JS engine compiles bytecode (V8's Ignition) and potentially machine code (TurboFan).
- **Execution time:** the code runs on the main thread.

On mid-range mobile devices, 500KB of JavaScript can take 3–5 seconds of main thread time. This directly impacts TBT, INP, and perceived interactivity.

---

## Tree Shaking: Dead Code Elimination

**Tree shaking** is the process of removing exports from a bundle that are imported but never used in the final entry point. The term comes from "shaking the tree" to make dead leaves fall off.

It requires **ES module syntax** (`import`/`export`), because ES module imports are statically analysable — the bundler can determine at build time which exports are actually used.

```js
// utils.js
export function add(a, b) { return a + b; }
export function multiply(a, b) { return a * b; } // never imported anywhere

// main.js
import { add } from './utils.js';
console.log(add(1, 2));
```

After tree shaking, `multiply` is not included in the bundle.

**Requirements for tree shaking:**
- Use ES modules (`import`/`export`), not CommonJS (`require`/`module.exports`)
- The imported module must have `"sideEffects": false` in its `package.json` (or list specific files with side effects)
- Minification must be enabled (tree shaking alone doesn't remove dead code — the minifier completes the job)

**Common failure modes:**
- Importing an entire library: `import _ from 'lodash'` pulls in all of lodash. Use `import { debounce } from 'lodash-es'` or `import debounce from 'lodash/debounce'`.
- Libraries that don't ship ES modules. Many older npm packages use CommonJS, which can't be tree-shaken.

---

## Code Splitting: Load What You Need

Even with tree shaking, your entire application's JavaScript doesn't need to load on the first page. **Code splitting** divides the bundle into chunks that are loaded on demand.

### Route-Based Splitting

The highest-value form of code splitting. Each route is a separate chunk:

```js
// React + React Router
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings  = lazy(() => import('./pages/Settings'));

<Route path="/dashboard" element={<Suspense fallback={null}><Dashboard /></Suspense>} />
<Route path="/settings"  element={<Suspense fallback={null}><Settings /></Suspense>} />
```

A user visiting `/dashboard` only downloads the Dashboard chunk. The Settings chunk is never fetched unless they navigate there.

### Component-Level Splitting

Large components — rich text editors, chart libraries, code syntax highlighters — can be split out and loaded only when rendered:

```js
const MonacoEditor = lazy(() => import('@monaco-editor/react'));

function CodeEditor({ code }) {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <MonacoEditor value={code} />
    </Suspense>
  );
}
```

### Dynamic Imports

`import()` is the underlying mechanism. It returns a Promise that resolves to the module:

```js
// Load only when user clicks "Export"
button.addEventListener('click', async () => {
  const { exportToPDF } = await import('./lib/pdf-export');
  exportToPDF(data);
});
```

This is ideal for features that are infrequently used — the code is only downloaded when it's actually needed.

---

## Shared Chunks

When multiple routes use the same library, the bundler can extract it into a **shared chunk** that's loaded once and cached:

```js
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        charts: ['recharts'],
      },
    },
  },
},
```

React and Recharts are loaded once, cached by the browser, and reused across all routes that need them.

---

## Analysing Your Bundle

You can't optimise what you can't see. Bundle analysers visualise what's in each chunk and how large it is:

- **Vite:** `rollup-plugin-visualizer` — add `visualizer()` to the plugins array; it generates an HTML treemap after build.
- **Webpack:** `webpack-bundle-analyzer` or the built-in `--profile` flag.
- **General:** `bundlephobia.com` — paste a package name to see its minified + gzipped size and its dependency tree.

Common findings:
- A large utility library imported in full when only one function is needed
- A component in the main bundle that's only used on a rarely visited page
- Duplicate dependencies (two different versions of the same library)

---

## Further Optimisations

**Minification:** Always enabled in production. Removes whitespace, shortens variable names. Vite uses esbuild for minification by default; Terser is a common alternative.

**Compression:** Gzip and Brotli are applied at the server/CDN level. Brotli typically compresses 15–20% smaller than Gzip for text content.

**Module preloading:** `<link rel="modulepreload">` in the HTML for critical chunks to avoid the waterfall of sequential module fetches.

**Third-party audits:** Run `npm ls` or use Bundlephobia to audit every dependency. Remove unused packages. Replace heavy libraries with lighter alternatives (e.g. `date-fns` over `moment`, `zustand` over `redux` for simple state).
