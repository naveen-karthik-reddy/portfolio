# Upcoming Projects

---

## perf-planner-mcp — npm MCP Server

**Goal:** Publish the perf-planner Core Web Vitals simulator as a standalone npm MCP server so Claude can analyze Lighthouse reports and predict score changes via tool calls.

---

### Why npm (local stdio)?

- No hosting cost or uptime concerns
- Users install once: `npm i -g perf-planner-mcp`
- The lib files (`calculator.js`, `lighthouseImporter.js`, etc.) are pure JS with zero browser APIs — they run in Node.js as-is

---

### Package structure

```
perf-planner-mcp/
├── package.json
├── server.js        ← MCP server entry point (bin)
├── sync-lib.js      ← copies lib files from src/ before publish
└── lib/             ← copied from src/projects/perf-planner/lib/
    ├── calculator.js
    ├── lighthouseImporter.js
    ├── curveFit.js
    ├── defaultSettings.js
    └── resourceSimulator.js
```

---

### package.json

```json
{
  "name": "perf-planner-mcp",
  "version": "1.0.0",
  "description": "MCP server — Core Web Vitals simulator powered by perf-planner",
  "type": "module",
  "bin": {
    "perf-planner-mcp": "./server.js"
  },
  "scripts": {
    "sync": "node sync-lib.js",
    "prepublishOnly": "node sync-lib.js",
    "start": "node server.js"
  },
  "files": ["server.js", "lib/"],
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.0",
    "zod": "^3.25.0"
  },
  "engines": { "node": ">=18" }
}
```

---

### sync-lib.js

Runs automatically before `npm publish` via `prepublishOnly`. Copies the lib files from the React app source so the npm package is always in sync at publish time.

```js
import { cpSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, "../src/projects/perf-planner/lib");
const dst = join(__dirname, "lib");

cpSync(src, dst, { recursive: true });
console.log("Synced lib files from perf-planner source.");
```

---

### server.js — MCP tools to expose

#### Tool 1: `analyze_lighthouse`
- **Input:** `filePath` (absolute path to LH JSON), `profile` (mobile | desktop)
- **What it does:** `parseLighthouseReport` → `fitCurves` → `computeMetrics` → `computeScores`
- **Output:** page info, real score, simulated score, per-metric breakdown, resource count, full resources array + calibration (for use in subsequent tool calls)

#### Tool 2: `compute_scores`
- **Input:** `resources[]`, `pageMeta`, `profile`, optional `calibration`
- **What it does:** `computeMetrics` + `computeScores`
- **Output:** raw metrics (ms) + scores (0–100) per metric + overall

#### Tool 3: `simulate_resource_change`
- **Input:** `resources[]`, `pageMeta`, `profile`, `calibration`, `resourceId`, `field`, `value`
- **What it does:** computes scores before and after changing one resource field
- **Output:** before/after score comparison + delta per metric + plain-English summary (e.g. "Score +7 points (67 → 74)")

---

### How to register with Claude Code (after publishing)

```bash
# Install globally
npm i -g perf-planner-mcp

# Register with Claude Code
claude mcp add --transport stdio perf-planner -- perf-planner-mcp
```

---

### Drift prevention rule

`prepublishOnly` runs `sync-lib.js` automatically — the lib files in the npm package are always fresher than the last `npm publish`. Between publishes, a stale lib is acceptable since the npm package is a snapshot.

When you change any lib file in `src/projects/perf-planner/lib/`, bump the package version and republish:
```bash
cd perf-planner-mcp
npm version patch   # or minor/major
npm publish
```

---

### Key implementation notes

- All lib files are ESM (`import`/`export`) — `"type": "module"` is required in package.json
- `calculator.js` exports: `computeMetrics`, `computeScores`, `computeResourceWaterfall`, `scoreColor`, `PROFILES`
- `lighthouseImporter.js` exports: `parseLighthouseReport`, `LighthouseImportError`
- `curveFit.js` exports: `fitCurves`
- `defaultSettings.js` exports: `DEFAULT_SETTINGS`
- No browser APIs in any lib file — safe to run in Node.js 18+
- CLS is not simulated — always comes from calibration; `0` if no calibration passed
