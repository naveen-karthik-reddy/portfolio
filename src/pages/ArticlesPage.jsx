import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Typography,
  Container,
  Box,
  Paper,
  Chip,
  Divider,
  Button,
  IconButton,
  Collapse,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  ContentCopy,
  Check,
  ExpandMore,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

import { articlesData, getArticleBySlug } from "../data/articlesData";

/* Load all markdown files eagerly as raw strings at build time */
const markdownFiles = import.meta.glob("../articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

/* Load all article images so Vite hashes them for production */
const assetImages = import.meta.glob("../assets/*.{png,jpg,jpeg,gif,svg,webp}", {
  eager: true,
  import: "default",
});

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

/* ==================== HELPERS ==================== */

function toSlug(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function childrenToText(children) {
  return React.Children.toArray(children)
    .map((c) => (typeof c === "string" ? c : ""))
    .join("");
}

function parseHeadings(markdown) {
  const regex = /^(#{1,3})\s+(.+)$/gm;
  const headings = [];
  let m;
  while ((m = regex.exec(markdown)) !== null) {
    headings.push({
      level: m[1].length,
      text: m[2].trim(),
      id: toSlug(m[2].trim()),
    });
  }
  return headings;
}

/* ==================== READING PROGRESS BAR ==================== */

function ReadingProgress({ grad }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight;
      setProgress(scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        bgcolor: "divider",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: `${progress}%`,
          background: grad,
          transition: "width 0.1s linear",
        }}
      />
    </Box>
  );
}

/* ==================== TABLE OF CONTENTS ==================== */

function TableOfContents({ headings, grad }) {
  const [open, setOpen] = useState(true);

  if (headings.length === 0) return null;

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Paper
      sx={{
        p: 3,
        mb: 5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.12em",
            background: grad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          TABLE OF CONTENTS
        </Typography>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex" }}
        >
          <ExpandMore sx={{ color: "text.secondary", fontSize: 20 }} />
        </motion.div>
      </Box>

      <Collapse in={open} timeout={300}>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 0.25 }}>
          {headings.map((h, i) => (
            <Box
              key={i}
              component="button"
              onClick={() => scrollTo(h.id)}
              sx={{
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                pl: (h.level - 1) * 2,
                py: 0.5,
                color: "text.secondary",
                fontFamily: "inherit",
                fontSize:
                  h.level === 1 ? "0.88rem" : h.level === 2 ? "0.83rem" : "0.78rem",
                fontWeight: h.level === 1 ? 600 : 400,
                lineHeight: 1.5,
                borderRadius: 0.5,
                transition: "color 0.2s",
                "&:hover": { color: "primary.main" },
              }}
            >
              {h.text}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
}

/* ==================== PAGE ROOT ==================== */

export default function ArticlesPage() {
  const { slug } = useParams();
  const article = slug ? getArticleBySlug(slug) : null;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, sm: 8 }, px: { xs: 2, sm: 3 } }}>
      {article ? <ArticleView article={article} /> : <ArticlesList />}
    </Container>
  );
}

/* ==================== ARTICLES LIST ==================== */

function ArticlesList() {
  const theme = useTheme();
  const grad = `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;
  const sorted = [...articlesData].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <Box>
      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            letterSpacing: "0.05em",
            mb: 6,
            background: grad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Articles
        </Typography>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      >
        {sorted.map((article) => (
          <motion.div key={article.id} variants={fadeInUp}>
            <Paper
              component={Link}
              to={`/articles/${article.id}`}
              sx={{
                p: 3,
                display: "block",
                textDecoration: "none",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateY(-3px)",
                  boxShadow: 2,
                },
              }}
            >
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {article.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                {article.excerpt}
              </Typography>

              <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
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
                    }}
                  />
                ))}
              </Box>

              <Typography variant="caption" color="text.secondary">
                {article.date} · {article.readTime}
              </Typography>
            </Paper>
          </motion.div>
        ))}
      </motion.div>
    </Box>
  );
}

/* ==================== ARTICLE VIEW ==================== */

function ArticleView({ article }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const grad = `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;
  const [copied, setCopied] = useState(false);

  const content = markdownFiles[`../articles/${article.id}.md`] ?? "";
  const headings = parseHeadings(content);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Custom renderers */
  const components = {
    h1({ children }) {
      const id = toSlug(childrenToText(children));
      return (
        <Typography
          id={id}
          variant="h4"
          sx={{
            fontWeight: 800,
            mt: 5,
            mb: 2,
            background: grad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            scrollMarginTop: "80px",
            lineHeight: 1.25,
          }}
        >
          {children}
        </Typography>
      );
    },

    h2({ children }) {
      const id = toSlug(childrenToText(children));
      return (
        <Typography
          id={id}
          variant="h5"
          sx={{
            fontWeight: 700,
            mt: 4,
            mb: 1.5,
            color: "primary.main",
            scrollMarginTop: "80px",
          }}
        >
          {children}
        </Typography>
      );
    },

    h3({ children }) {
      const id = toSlug(childrenToText(children));
      return (
        <Typography
          id={id}
          variant="h6"
          sx={{
            fontWeight: 600,
            mt: 3,
            mb: 1,
            color: "text.primary",
            scrollMarginTop: "80px",
          }}
        >
          {children}
        </Typography>
      );
    },

    p({ children }) {
      return (
        <Typography
          variant="body1"
          sx={{ lineHeight: 1.9, mb: 2, color: "text.primary" }}
        >
          {children}
        </Typography>
      );
    },

    blockquote({ children }) {
      return (
        <Box
          sx={{
            borderLeft: "3px solid",
            borderColor: "primary.main",
            pl: 3,
            py: 0.5,
            my: 3,
            bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            borderRadius: "0 8px 8px 0",
          }}
        >
          {children}
        </Box>
      );
    },

    pre({ children }) {
      return (
        <Box
          component="pre"
          sx={{
            bgcolor: isDark ? "#0d1117" : "#f6f8fa",
            p: 3,
            borderRadius: 2,
            overflow: "auto",
            my: 3,
            border: `1px solid ${theme.palette.divider}`,
            fontFamily:
              '"Fira Code", "Cascadia Code", "Consolas", monospace',
            fontSize: "0.875rem",
            lineHeight: 1.7,
            /* reset inline-code styles for code inside pre */
            "& code": {
              backgroundColor: "transparent !important",
              padding: "0 !important",
              borderRadius: "0 !important",
              fontSize: "inherit !important",
              fontFamily: "inherit !important",
              color: `${isDark ? "#e6edf3" : "#24292f"} !important`,
            },
          }}
        >
          {children}
        </Box>
      );
    },

    code({ children }) {
      return (
        <Box
          component="code"
          sx={{
            bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
            px: 0.75,
            py: 0.25,
            borderRadius: 0.75,
            fontFamily:
              '"Fira Code", "Cascadia Code", "Consolas", monospace',
            fontSize: "0.85em",
            color: "primary.main",
          }}
        >
          {children}
        </Box>
      );
    },

    hr() {
      return <Divider sx={{ my: 4 }} />;
    },

    ul({ children }) {
      return (
        <Box
          component="ul"
          sx={{ pl: 3, mb: 2, "& li::marker": { color: "primary.main" } }}
        >
          {children}
        </Box>
      );
    },

    ol({ children }) {
      return (
        <Box
          component="ol"
          sx={{ pl: 3, mb: 2, "& li::marker": { color: "primary.main" } }}
        >
          {children}
        </Box>
      );
    },

    li({ children }) {
      return (
        <Box component="li" sx={{ mb: 0.5, lineHeight: 1.9, color: "text.primary" }}>
          {children}
        </Box>
      );
    },

    a({ href, children }) {
      const isInternal = href && (href.startsWith("/") || href.startsWith("#"));
      const linkSx = {
        color: "primary.main",
        textDecoration: "none",
        borderBottom: "1px solid",
        borderColor: "primary.main",
        opacity: 0.9,
        transition: "opacity 0.2s",
        "&:hover": { opacity: 1 },
      };
      if (isInternal) {
        return (
          <Box component={Link} to={href} sx={linkSx}>
            {children}
          </Box>
        );
      }
      return (
        <Box
          component="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          sx={linkSx}
        >
          {children}
        </Box>
      );
    },

    strong({ children }) {
      return (
        <Box component="strong" sx={{ fontWeight: 700, color: "text.primary" }}>
          {children}
        </Box>
      );
    },

    em({ children }) {
      return (
        <Box component="em" sx={{ fontStyle: "italic", color: "text.secondary" }}>
          {children}
        </Box>
      );
    },

    img({ src, alt }) {
      /* Resolve filename-only refs (e.g. "foo.png") against the assets glob map */
      const resolved = assetImages[`../assets/${src}`] ?? src;
      return (
        <Box
          component="img"
          src={resolved}
          alt={alt ?? ""}
          sx={{
            display: "block",
            width: "100%",
            height: "auto",
            borderRadius: 2,
            my: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        />
      );
    },
  };

  return (
    <>
      <ReadingProgress grad={grad} />

      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        {/* Top bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Button
            component={Link}
            to="/articles"
            startIcon={<ArrowBack />}
            sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
          >
            All Articles
          </Button>

          <Tooltip title={copied ? "Copied!" : "Copy link"} arrow>
            <IconButton
              onClick={handleCopy}
              size="small"
              sx={{
                border: "1px solid",
                borderColor: copied ? "success.main" : "divider",
                borderRadius: 1.5,
                color: copied ? "success.main" : "text.secondary",
                transition: "all 0.3s",
                "&:hover": { borderColor: "primary.main", color: "primary.main" },
              }}
            >
              {copied ? (
                <Check fontSize="small" />
              ) : (
                <ContentCopy fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Title */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            mb: 2,
            background: grad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.2,
          }}
        >
          {article.title}
        </Typography>

        {/* Excerpt */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 2.5, lineHeight: 1.7, fontSize: "1.05rem" }}
        >
          {article.excerpt}
        </Typography>

        {/* Meta */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2.5,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
            {article.date}
          </Typography>
          <Typography variant="caption" color="text.secondary">·</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
            {article.readTime}
          </Typography>
        </Box>

        {/* Tags */}
        <Box display="flex" gap={1} flexWrap="wrap" mb={4}>
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
              }}
            />
          ))}
        </Box>

        <Divider sx={{ mb: 5 }} />

        {/* Table of contents */}
        <TableOfContents headings={headings} grad={grad} />

        {/* Markdown content */}
        <Box sx={{ "& > *:first-of-type": { mt: 0 } }}>
          <ReactMarkdown components={components}>{content}</ReactMarkdown>
        </Box>
      </motion.div>
    </>
  );
}
