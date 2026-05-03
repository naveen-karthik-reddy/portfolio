export const articlesData = [
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
