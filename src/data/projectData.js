export const projectData = [
  {
    id: "holdings-analyzer",
    name: "Holdings Analyzer",
    date: "Apr 2026",
    excerpt: "Upload your Zerodha holdings CSV and get an instant portfolio dashboard — allocation breakdown, top gainers & losers, and a full sortable holdings table.",
    tags: ["React", "Recharts", "MUI", "CSV"],
    points: [],
  },
];

export const getProjectBySlug = (slug) =>
  projectData.find((p) => p.id === slug);