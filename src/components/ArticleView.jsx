import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Typography,
  Box,
  Paper,
  Chip,
  Divider,
  Button,
  IconButton,
  Collapse,
  Tooltip,
  GlobalStyles,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  ContentCopy,
  Check,
  ExpandMore,
  Download,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

/* Register only the languages used in articles — avoids bundling 200+ Prism grammars */
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import http from "react-syntax-highlighter/dist/esm/languages/prism/http";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import nginx from "react-syntax-highlighter/dist/esm/languages/prism/nginx";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("html", markup);
SyntaxHighlighter.registerLanguage("xml", markup);
SyntaxHighlighter.registerLanguage("http", http);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("nginx", nginx);
SyntaxHighlighter.registerLanguage("yaml", yaml);

import { articlesData } from "../data/articlesData";
import Seo from "./Seo";

/* Lazy-load RunableCodeBlock — CodeMirror is heavy, only load when an article uses js-exec blocks */
const RunableCodeBlock = lazy(() => import("./RunableCodeBlock"));

/* Lazy-load article markdown files */
const markdownFiles = import.meta.glob("../articles/*.md", {
  query: "?raw",
  import: "default",
});

/* Lazy-load article images — only resolved when an article actually renders them */
const assetImporters = import.meta.glob("../assets/*.{png,jpg,jpeg,gif,svg,webp}", {
  eager: false,
  import: "default",
});
const assetCache = {};

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
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = document.documentElement;
        const scrollable = el.scrollHeight - el.clientHeight;
        setProgress(scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0);
        ticking = false;
      });
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

function TableOfContents({ headings, grad, sidebar = false }) {
  const [open, setOpen] = useState(true);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!sidebar || headings.length === 0) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const OFFSET = 120;
        let current = headings[0]?.id ?? null;
        for (const { id } of headings) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= OFFSET) current = id;
        }
        setActiveId(current);
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings, sidebar]);

  if (headings.length === 0) return null;

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const makeLinks = (withActive) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      {headings.map((h, i) => {
        const isActive = withActive && activeId === h.id;
        return (
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
              color: isActive ? "primary.main" : "text.secondary",
              fontFamily: "inherit",
              fontSize:
                h.level === 1 ? "0.88rem" : h.level === 2 ? "0.83rem" : "0.78rem",
              fontWeight: isActive || h.level === 1 ? 600 : 400,
              lineHeight: 1.5,
              borderRadius: 0.5,
              transition: "color 0.2s, font-weight 0.2s",
              "&:hover": { color: "primary.main" },
            }}
          >
            {isActive && (
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 3,
                  height: "0.85em",
                  bgcolor: "primary.main",
                  borderRadius: 1,
                  mr: 0.75,
                  verticalAlign: "middle",
                  flexShrink: 0,
                }}
              />
            )}
            {h.text}
          </Box>
        );
      })}
    </Box>
  );

  if (sidebar) {
    return (
      <Paper
        sx={{
          p: 2.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.12em",
            mb: 1.5,
            background: grad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ON THIS PAGE
        </Typography>
        {makeLinks(true)}
      </Paper>
    );
  }

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
        <Box sx={{ mt: 2 }}>{makeLinks(false)}</Box>
      </Collapse>
    </Paper>
  );
}

/* ==================== PREV / NEXT NAV ==================== */

const perfSeries = articlesData
  .filter((a) => a.categories?.includes("performance"))
  .sort((a, b) => new Date(a.date) - new Date(b.date));

function PrevNextNav({ article, grad }) {
  const navigate = useNavigate();
  const idx = perfSeries.findIndex((a) => a.id === article.id);
  if (idx === -1) return null;

  const prev = perfSeries[idx - 1] ?? null;
  const next = perfSeries[idx + 1] ?? null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        mt: 6,
        pt: 4,
        borderTop: "1px solid",
        borderColor: "divider",
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ flex: 1 }}>
        {prev && (
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/articles/${prev.id}`)}
            sx={{
              textAlign: "left",
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
              maxWidth: 280,
            }}
          >
            <Box>
              <Typography variant="caption" display="block" sx={{ opacity: 0.6, mb: 0.25 }}>
                Previous
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                {prev.title}
              </Typography>
            </Box>
          </Button>
        )}
      </Box>

      <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        {next && (
          <Button
            endIcon={<ArrowForward />}
            onClick={() => navigate(`/articles/${next.id}`)}
            sx={{
              textAlign: "right",
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
              maxWidth: 280,
            }}
          >
            <Box>
              <Typography variant="caption" display="block" sx={{ opacity: 0.6, mb: 0.25 }}>
                Next
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                {next.title}
              </Typography>
            </Box>
          </Button>
        )}
      </Box>
    </Box>
  );
}

/* ==================== LAZY IMAGE ==================== */

function ArticleImage({ src, alt }) {
  const key = `../assets/${src}`;
  const [resolved, setResolved] = useState(assetCache[key] ?? null);

  useEffect(() => {
    if (assetCache[key]) {
      setResolved(assetCache[key]);
      return;
    }
    const importer = assetImporters[key];
    if (importer) {
      let cancelled = false;
      importer().then((url) => {
        if (!cancelled) {
          assetCache[key] = url;
          setResolved(url);
        }
      });
      return () => { cancelled = true; };
    } else {
      setResolved(src);
    }
  }, [src, key]);

  return (
    <Box
      component="img"
      src={resolved ?? src}
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
}

/* ==================== ARTICLE VIEW ==================== */

export default function ArticleView({ article }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const grad = `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;
  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const loader = markdownFiles[`../articles/${article.id}.md`];
    if (loader) loader().then((text) => setContent(text ?? ""));
  }, [article.id]);

  const headings = useMemo(() => parseHeadings(content), [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const components = useMemo(() => ({
    h1({ children }) {
      const id = toSlug(childrenToText(children));
      return (
        <Typography
          id={id}
          variant="h2"
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
          variant="h3"
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
          variant="h4"
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

    pre({ node, children }) {
      const codeNode = node?.children?.[0];
      if (codeNode?.type === "element" && codeNode.tagName === "code") {
        const classes = codeNode.properties?.className || [];
        const langClass = classes.find((c) => c.startsWith("language-"));
        const lang = langClass?.replace("language-", "");
        const raw = codeNode.children?.[0]?.value ?? "";
        if (lang === "js-exec" && raw) {
          return (
            <Suspense fallback={
              <Box sx={{ p: 3, my: 3, borderRadius: 2, border: "1px solid", borderColor: "divider", textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">Loading editor...</Typography>
              </Box>
            }>
              <RunableCodeBlock code={raw.replace(/\n$/, "")} />
            </Suspense>
          );
        }
        if (lang && raw) {
          return (
            <SyntaxHighlighter
              language={lang}
              style={isDark ? oneDark : oneLight}
              PreTag="div"
              customStyle={{
                borderRadius: 8,
                marginTop: 24,
                marginBottom: 24,
                fontSize: "0.875rem",
                lineHeight: 1.7,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {raw.replace(/\n$/, "")}
            </SyntaxHighlighter>
          );
        }
      }
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
            fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
            fontSize: "0.875rem",
            lineHeight: 1.7,
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
          <Box component="a" href={href} target="_blank" rel="noopener noreferrer" sx={linkSx}>
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

    table({ children }) {
      return (
        <Box sx={{ overflowX: "auto", my: 3 }}>
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
              "& th, & td": {
                border: "1px solid",
                borderColor: "divider",
                px: 2,
                py: 1,
                textAlign: "left",
                verticalAlign: "top",
              },
              "& th": {
                bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                fontWeight: 700,
                color: "text.primary",
              },
              "& td": { color: "text.primary" },
              "& tr:hover td": {
                bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
              },
            }}
          >
            {children}
          </Box>
        </Box>
      );
    },

    thead({ children }) { return <thead>{children}</thead>; },
    tbody({ children }) { return <tbody>{children}</tbody>; },
    tr({ children }) { return <tr>{children}</tr>; },
    th({ children }) { return <th>{children}</th>; },
    td({ children }) { return <td>{children}</td>; },

    img({ src, alt }) {
      return <ArticleImage src={src} alt={alt} />;
    },
  }), [isDark, grad, theme.palette.divider, theme.palette.primary.main]);

  return (
    <>
      <Seo
        title={article.title}
        description={article.excerpt}
        canonical={`/articles/${article.id}`}
        keywords={article.tags}
        type="article"
        publishedTime={article.date}
        image={article.image}
      />

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              description: article.excerpt,
              datePublished: article.date,
              author: {
                "@type": "Person",
                name: "Naveen Karthik",
                url: "https://naveenkarthik.com",
              },
              publisher: {
                "@type": "Person",
                name: "Naveen Karthik",
              },
              url: `https://naveenkarthik.com/articles/${article.id}`,
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://naveenkarthik.com/articles/${article.id}`,
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://naveenkarthik.com",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Articles",
                  item: "https://naveenkarthik.com/articles",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: article.title,
                },
              ],
            },
          ]),
        }}
      />
      <GlobalStyles styles={`
        @media print {
          .no-print { display: none !important; }
          header { display: none !important; }
          body { background: white !important; color: black !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `} />

      <div className="no-print">
        <ReadingProgress grad={grad} />
      </div>

      <Box sx={{ display: "flex", gap: { xs: 0, lg: 5 }, alignItems: "flex-start" }}>
        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <Box
              className="no-print"
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

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Tooltip title="Download PDF" arrow>
                  <IconButton
                    onClick={() => window.print()}
                    size="small"
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1.5,
                      color: "text.secondary",
                      transition: "all 0.3s",
                      "&:hover": { borderColor: "primary.main", color: "primary.main" },
                    }}
                  >
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>

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
            </Box>

            <Typography
              variant="h1"
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

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 2.5, lineHeight: 1.7, fontSize: "1.05rem" }}
            >
              {article.excerpt}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 2.5,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="caption" color="text.secondary" component="time" dateTime={article.date} sx={{ fontSize: "0.85rem" }}>
                {article.date}
              </Typography>
              <Typography variant="caption" color="text.secondary">·</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                {article.readTime}
              </Typography>
            </Box>

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

            <Box className="no-print" sx={{ display: { xs: "block", lg: "none" } }}>
              <TableOfContents headings={headings} grad={grad} />
            </Box>

            <Box component="article" sx={{ "& > *:first-of-type": { mt: 0 } }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>
            </Box>

            <div className="no-print">
              <PrevNextNav article={article} grad={grad} />
            </div>
          </motion.div>
        </Box>

        <Box
          component="aside"
          className="no-print"
          sx={{
            width: 260,
            flexShrink: 0,
            position: "sticky",
            top: 88,
            maxHeight: "calc(100vh - 104px)",
            overflowY: "auto",
            display: { xs: "none", lg: "block" },
            mt: 0,
          }}
        >
          <TableOfContents headings={headings} grad={grad} sidebar />
        </Box>
      </Box>
    </>
  );
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};
