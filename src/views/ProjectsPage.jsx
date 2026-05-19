'use client';
import { Suspense, lazy, useMemo } from "react";
import Link from "next/link";
import {
  Typography,
  Container,
  Box,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { projectData } from "../data/projectData";

/* Explicit dynamic imports — replaces import.meta.glob which is Vite-only */
const projectModules = {
  "holdings-analyzer": () => import("../projects/holdings-analyzer/index.jsx"),
  "perf-planner": () => import("../projects/perf-planner/index.jsx"),
};

const fadeInUpKf = {
  "@keyframes fadeInUp": {
    from: { opacity: 0, transform: "translateY(16px)" },
    to:   { opacity: 1, transform: "translateY(0)" },
  },
};
const fadeInUp = (delay = 0) => ({
  ...fadeInUpKf,
  animation: "fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
  animationDelay: `${delay}s`,
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
});

export function ProjectsList() {
  const theme = useTheme();
  const grad = `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, sm: 8 }, px: { xs: 2, sm: 3 } }}>
    <Box>
      <Box sx={fadeInUp(0)}>
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
          Projects
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {projectData.map((project, i) => (
          <Box key={project.id} sx={{ ...fadeInUp(i * 0.08 + 0.1), display: "flex" }}>
            <Paper
              component={Link}
              href={`/projects/${project.id}`}
              sx={{
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
                width: "100%",
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateY(-3px)",
                  boxShadow: 2,
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  height: 200,
                  overflow: "hidden",
                  borderTop: `4px solid ${project.accent}`,
                }}
              >
                <Box
                  component="img"
                  src={project.image}
                  alt={project.name}
                  loading="lazy"
                  sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </Box>

              <Box sx={{ p: 3, display: "flex", flexDirection: "column", flex: 1 }}>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {project.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ my: 1, flex: 1 }}>
                  {project.excerpt}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mb={1.5}>
                  {project.tags.map((tag) => (
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
                  {project.date}
                </Typography>
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
    </Container>
  );
}

export function ProjectView({ project }) {
  const ProjectComponent = useMemo(() => {
    const loader = projectModules[project.id];
    if (!loader) return null;
    return lazy(loader);
  }, [project.id]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    description: project.excerpt,
    author: { "@type": "Person", name: "Naveen Karthik", url: "https://naveenkarthik.com" },
    url: `https://naveenkarthik.com/projects/${project.id}`,
    applicationCategory: "DeveloperApplication",
    keywords: project.tags.join(", "),
    datePublished: project.date,
  };

  return (
    <Box sx={fadeInUp(0)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {ProjectComponent ? (
        <Suspense
          fallback={
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={32} />
            </Box>
          }
        >
          <ProjectComponent />
        </Suspense>
      ) : (
        <Typography color="text.secondary">Project not found.</Typography>
      )}
    </Box>
  );
}
