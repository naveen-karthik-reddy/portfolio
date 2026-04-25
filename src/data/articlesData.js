export const articlesData = [
 {
  id: "figma-llm-problem",
  title: "The Real Problem with Figma + LLMs",
  excerpt:
    "Why AI-generated UI code from Figma designs is often inaccurate, and how to fix it through better design structure.",
  date: "2026-04-25",
  readTime: "12 min read",
  tags: ["Design", "AI", "Engineering"],
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
