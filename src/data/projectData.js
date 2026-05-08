export const projectData = [
  {
    id: "holdings-analyzer",
    name: "Holdings Analyzer",
    date: "Apr 2026",
    excerpt: "Upload your Zerodha holdings CSV and get an instant portfolio dashboard — allocation breakdown, top gainers & losers, and a full sortable holdings table.",
    image: "/projects/holdings-analyzer.png",
    accent: "#2196f3",
    tags: ["React", "Recharts", "MUI", "CSV"],
    points: [
      "Parses a Zerodha KITE holdings CSV entirely in the browser — no server uploads — then fires requests to fetch dividend yields, valuation ratios, beta, analyst consensus, and 52-week ranges for every holding automatically",
      "Six analysis tabs (Overview, Holdings, Dividends, Fundamentals, Risk, Analyst) with color-coded thresholds and sortable tables; every cell is editable inline and updates P&L aggregates and charts in real time",
      "Risk tab flags high-risk positions by comparing beta and debt-to-equity against configurable thresholds, with a 52-week range progress bar that instantly surfaces holdings drifting toward annual lows",
      "Four compounding calculators (SIP, Lumpsum, Goal, CAGR) with synchronized slider and text inputs; Recharts stacked-area charts separate invested principal from market-generated returns over the full horizon",
    ],
  },
  {
    id: "perf-planner",
    name: "Web Performance Planner",
    date: "Apr 2026",
    excerpt: "A what-if simulator for web performance. Tweak sliders and instantly see estimated Lighthouse-style Mobile & Desktop scores across multiple page variations — with IndexedDB persistence, JSON export/import, and cross-variation comparison.",
    image: "/projects/web-performance-planner.png",
    accent: "#ff9800",
    tags: ["React", "IndexedDB", "MUI", "Performance"],
    articleSlug: "web-performance-planner",
    points: [
      "Imports a real Lighthouse JSON report and fits simulation curves to match the measured score exactly — every what-if change is a calibrated, deterministic prediction against your actual page, not a generic estimate",
      "Scores all five Core Web Vitals (FCP, LCP, TBT, CLS, SI) via Lighthouse's log-normal curves and metric weights; simulates mobile (150 ms RTT, 200 KB/s, 4× CPU) and desktop profiles simultaneously",
      "Network waterfall decomposes each resource into DNS, connection, SSL, TTFB, and transfer phases; TTFB is estimated from file size and bandwidth so small files show proportional download bars instead of inflated ones",
      "Optimization roadmap ranks every fix by score gain with Easy / Medium / Hard effort labels; applying a suggestion patches the variation instantly — no code changes, no redeploy",
      "Comparison mode shows up to four named variations side by side with best/worst highlighting per metric; work persists to IndexedDB with JSON export so calibrated baselines can be shared with teammates",
    ],
  },
];

export const getProjectBySlug = (slug) =>
  projectData.find((p) => p.id === slug);