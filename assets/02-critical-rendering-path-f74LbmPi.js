const e=`# #2 — The Critical Rendering Path

Before a user sees anything on screen, the browser must complete a specific sequence of work: fetch the HTML, parse it, fetch and parse all blocking stylesheets, execute blocking scripts, build the render tree, run layout, and paint. This sequence is called the **Critical Rendering Path (CRP)**.

The shorter and lighter this path, the faster the first paint. Almost every technique used to improve perceived load speed — inlining CSS, deferring scripts, eliminating render-blocking resources — is aimed at shortening the CRP.

---

## What Makes a Resource "Render-Blocking"?

A resource is render-blocking when the browser must download and process it before it can produce any pixels. Two resource types are render-blocking by default:

- **CSS** — always render-blocking, because the browser won't paint without a complete CSSOM.
- **JavaScript** (without \`async\` or \`defer\`) — parser-blocking, because a \`<script>\` tag in the \`<head>\` stops HTML parsing until the script is fetched and executed.

Images, fonts, and other assets are not render-blocking. They affect completeness, but not first paint.

---

## Why CSS Blocks Rendering

When the browser encounters a \`<link rel="stylesheet">\`, it:

1. Dispatches a fetch request for the stylesheet.
2. **Pauses rendering** until the stylesheet is fully downloaded and parsed.

The reason: rendering a partially-styled page would produce visible flashes as styles arrive. The browser prefers to wait.

This means every kilobyte in your CSS is on the critical path. Unused selectors, large framework bundles, and slow stylesheet servers all delay first paint.

**What you can do:**

- Inline critical (above-the-fold) styles directly in \`<head>\`.
- Load non-critical CSS asynchronously: \`<link rel="stylesheet" media="print" onload="this.media='all'">\`.
- Minimise stylesheet size — remove unused rules, split by route.

---

## Why JavaScript Blocks the Parser

When the parser encounters a \`<script>\` tag (without \`async\` or \`defer\`), it:

1. Stops parsing HTML.
2. Fetches the script (if external).
3. Executes it.
4. Resumes parsing.

JavaScript can manipulate the DOM and CSSOM, so the parser cannot safely continue without executing the script first. A slow script in \`<head>\` blocks the entire page.

There's an additional subtlety: **JavaScript also blocks on CSS**. Before executing a script, the browser ensures all preceding stylesheets are parsed. A script after a stylesheet is therefore blocked by both.

---

## async and defer: Breaking the Block

Two attributes change how scripts interact with the parser:

\`\`\`html
<script src="app.js" async><\/script>
<script src="app.js" defer><\/script>
\`\`\`

**\`async\`**
- Fetched in parallel with HTML parsing.
- Executed immediately when downloaded — pauses parsing at that moment.
- Order is not guaranteed across multiple async scripts.
- Best for: independent third-party scripts (analytics, ads).

**\`defer\`**
- Fetched in parallel with HTML parsing.
- Executed only after the HTML is fully parsed, just before \`DOMContentLoaded\`.
- Order is preserved across multiple deferred scripts.
- Best for: all first-party application scripts.

For most application code, \`defer\` is the right default. \`type="module"\` scripts are deferred by default.

\`\`\`html
<!-- ✅ Application scripts -->
<script src="main.js" defer><\/script>

<!-- ✅ Independent analytics -->
<script src="analytics.js" async><\/script>

<!-- ❌ Blocks rendering for no reason -->
<script src="app.js"><\/script>
\`\`\`

---

## Preload Scanner

While the main parser is blocked by a script, the browser runs a secondary "preload scanner" that looks ahead in the HTML for resources to fetch. This is why placing scripts at the bottom of \`<body>\` still allows stylesheets and images to begin downloading early — the preload scanner already discovered them.

The preload scanner cannot discover resources injected by JavaScript. Dynamically created \`<link>\` or \`<script>\` tags are invisible to it until they actually execute.

---

## Measuring the CRP

Chrome DevTools → Network tab → **Waterfall view** shows which resources are on the critical path. Look for:

- Resources at the top of the waterfall that block everything below them.
- Long blue bars (HTML transfer) with stylesheets queued behind them.
- Scripts before the first green line (DOM content loaded).

The **Lighthouse** audit "Eliminate render-blocking resources" identifies exactly which files are on your critical path and estimates how much time removing them would save.

---

## CRP Optimisation Checklist

| Action | Impact |
|--------|--------|
| Add \`defer\` to all app \`<script>\` tags | Removes parser blocking |
| Inline above-the-fold CSS | Eliminates stylesheet round-trip |
| Load non-critical CSS asynchronously | Unblocks rendering |
| Reduce stylesheet size | Less to parse before first paint |
| Use \`preconnect\` for critical third parties | Removes DNS/TCP overhead |
| Minimise render-blocking third-party scripts | High impact, often overlooked |

---

## Key Takeaways

- CSS and synchronous \`<script>\` tags are render-blocking by default.
- \`defer\` is the right choice for most application scripts.
- \`async\` suits independent third-party scripts that don't depend on DOM readiness.
- Inlining critical CSS removes a full round-trip from the critical path.
- The preload scanner fetches ahead, but cannot see dynamically injected resources.
`;export{e as default};
