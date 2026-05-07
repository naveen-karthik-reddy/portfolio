import React, { lazy, Suspense, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Typography,
  Container,
  Box,
  Paper,
  Chip,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Search, Clear } from "@mui/icons-material";
import { motion } from "framer-motion";

import { articlesData, getArticleBySlug } from "../data/articlesData";
import Seo from "../components/Seo";

/* Lazy-load the article detail view — react-markdown, syntax highlighter,
   and CodeMirror are heavy; only load them when a user opens an article. */
const ArticleView = lazy(() => import("../components/ArticleView"));

/* ==================== ANIMATIONS ==================== */

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

/* ==================== PAGE ROOT ==================== */

export default function ArticlesPage() {
  const { "*": slug } = useParams();
  const article = slug ? getArticleBySlug(slug) : null;

  if (article) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 5, sm: 8 }, px: { xs: 2, sm: 3 } }}>
        <Suspense fallback={
          <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
            <Typography color="text.secondary">Loading article...</Typography>
          </Box>
        }>
          <ArticleView article={article} />
        </Suspense>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, sm: 8 }, px: { xs: 2, sm: 3 } }}>
      <ArticlesList />
    </Container>
  );
}

/* ==================== CATEGORY LABEL MAP ==================== */

const CATEGORY_LABELS = {
  performance: "Performance",
  react: "React",
  javascript: "JavaScript",
  fundamentals: "Fundamentals",
  css: "CSS",
  product: "Product",
  "llm-metrics": "LLM / AI",
};

/* ==================== ARTICLES LIST ==================== */

function ArticlesList() {
  const theme = useTheme();
  const grad = `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || null;

  /* ── local state for search ── */
  const [searchQuery, setSearchQuery] = useState("");

  const setActiveCategory = (cat) => {
    if (cat) setSearchParams({ category: cat });
    else setSearchParams({});
  };

  const allCategories = Object.keys(CATEGORY_LABELS);

  /* ── filter + sort ── */
  const filtered = useMemo(() => {
    let result = [...articlesData];

    /* Category */
    if (activeCategory) {
      result = result.filter((a) => a.categories?.includes(activeCategory));
    }

    /* Search — match title, excerpt, and tags (case-insensitive) */
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );

      /* Rank: title matches first, then excerpt/tag-only matches */
      result.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(q) ? 0 : 1;
        const bTitle = b.title.toLowerCase().includes(q) ? 0 : 1;
        return aTitle - bTitle;
      });
    }

    return result;
  }, [activeCategory, searchQuery]);

  return (
    <Box>
      <Seo
        title="Articles | Naveen Karthik"
        description="Performance, React, JavaScript, and web engineering articles by Naveen Karthik — deep dives on browser internals, Core Web Vitals, and frontend architecture."
        canonical="/articles"
        keywords={["Performance", "React", "JavaScript", "Browser", "Web Vitals", "Frontend"]}
      />
      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        {/* Heading + count */}
        <Box
          display="flex"
          alignItems="baseline"
          gap={1.5}
          flexWrap="wrap"
          mb={1}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: "0.05em",
              background: grad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Articles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* Search */}
        <Box mb={3}>
          <TextField
            size="small"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 260 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery("")}>
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
        </Box>

        {/* Filter chips */}
        <Box display="flex" gap={1} flexWrap="wrap" alignItems="center" mb={5}>
          <Chip
            label="All"
            onClick={() => setActiveCategory(null)}
            variant={activeCategory === null ? "filled" : "outlined"}
            color={activeCategory === null ? "primary" : "default"}
            sx={{ fontWeight: 600, cursor: "pointer", "& .MuiChip-label": { pt: "1px" } }}
          />
          {allCategories.map((cat) => (
            <Chip
              key={cat}
              label={CATEGORY_LABELS[cat]}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              variant={activeCategory === cat ? "filled" : "outlined"}
              color={activeCategory === cat ? "primary" : "default"}
              sx={{ fontWeight: 600, cursor: "pointer", "& .MuiChip-label": { pt: "1px" } }}
            />
          ))}
        </Box>
      </motion.div>

      <Box
        component={motion.div}
        key={`${activeCategory ?? "all"}-${searchQuery}`}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
          gap: 3,
        }}
      >
        {filtered.map((article) => (
          <motion.div key={article.id} variants={fadeInUp} style={{ display: "flex" }}>
            <Paper
              component="a"
              href={`/articles/${article.id}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                transition: "all 0.3s",
                width: "100%",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateY(-3px)",
                  boxShadow: 2,
                },
              }}
            >
              <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
                {article.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5, flex: 1, lineHeight: 1.6 }}
              >
                {article.excerpt}
              </Typography>

              <Box display="flex" gap={0.75} flexWrap="wrap" alignItems="center" mb={1.5}>
                {article.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      color: "primary.main",
                      border: "1px solid",
                      borderColor: "primary.main",
                      bgcolor: "transparent",
                      fontWeight: 600,
                      "& .MuiChip-label": { pt: "1px" },
                      fontSize: "0.7rem",
                    }}
                  />
                ))}
              </Box>

              <Typography variant="caption" color="text.secondary">
                {article.readTime}
              </Typography>
            </Paper>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <motion.div variants={fadeInUp} style={{ gridColumn: "1 / -1" }}>
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 6 }}>
              {searchQuery
                ? `No articles matching "${searchQuery}".`
                : "No articles in this category yet."}
            </Typography>
          </motion.div>
        )}
      </Box>
    </Box>
  );
}
