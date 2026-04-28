export const projectData = [
  {
    id: "holdings-analyzer",
    name: "Holdings Analyzer",
    date: "Apr 2026",
    excerpt: "Upload your Zerodha holdings CSV and get an instant portfolio dashboard — allocation breakdown, top gainers & losers, and a full sortable holdings table.",
    tags: ["React", "Recharts", "MUI", "CSV"],
    points: [
      "Parses Zerodha KITE holdings CSV in the browser and computes total investment, current value, and overall P&L instantly with no server uploads",
      "Pie chart allocation breakdown by stock with a Recharts PieChart; highlights top 5 holdings and groups the rest as 'Others'",
      "Top gainers and losers panels sorted by absolute P&L, each showing current price, average price, and return percentage",
      "Sortable, searchable holdings table with columns for quantity, average price, current price, invested value, and net P&L",
    ],
  },
  {
    id: "perf-planner",
    name: "Web Performance Planner",
    date: "Apr 2026",
    excerpt: "A what-if simulator for web performance. Tweak sliders and instantly see estimated Lighthouse-style Mobile & Desktop scores across multiple page variations — with IndexedDB persistence, JSON export/import, and cross-variation comparison.",
    tags: ["React", "IndexedDB", "MUI", "Performance"],
    articleSlug: "web-performance-planner",
    points: [
      "Models all six Core Web Vitals (FCP, LCP, TBT, CLS, SI, TTI) using Lighthouse's log-normal scoring curves and published metric weights",
      "Simulates mobile (150ms RTT, 200 KB/s, 4× CPU throttle) and desktop profiles simultaneously with a per-request TCP slow-start download model",
      "Resource panel simulates individual files with HTTP/1.1 queue delays, HTTP/2 multiplexing, and HTTP/3 QUIC gain per resource type and loading strategy",
      "Optimization roadmap ranks 24 levers by score gain with Easy / Medium / Hard effort labels; locked fields are excluded from suggestions",
      "Comparison mode shows up to four variations side by side, highlighting best and worst values per metric across pages",
      "Full IndexedDB persistence with JSON export/import; customizable scoring weights, network profiles, and scoring curves in the settings panel",
    ],
  },
];

export const getProjectBySlug = (slug) =>
  projectData.find((p) => p.id === slug);