import { Suspense, lazy, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Typography,
  Container,
  Box,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

import { projectData } from "../data/projectData";
import Seo from "../components/Seo";

/* Eagerly discover all project index files at build time */
const projectModules = import.meta.glob("../projects/*/index.jsx");

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

export default function ProjectsPage() {
  const { slug } = useParams();
  const project = slug ? projectData.find((p) => p.id === slug) : null;

  if (project) {
    return (
      <Box sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 3, md: 4 }, maxWidth: "100%", width: "100%" }}>
        <ProjectView project={project} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, sm: 8 }, px: { xs: 2, sm: 3 } }}>
      <ProjectsList />
    </Container>
  );
}

function ProjectsList() {
  const theme = useTheme();
  const grad = `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;

  return (
    <Box>
      <Seo
        title="Projects | Naveen Karthik"
        description="A portfolio of frontend and full-stack projects by Naveen Karthik — including React dashboards, performance tools, and web applications."
        canonical="/projects"
        keywords={["Projects", "React", "Frontend", "Portfolio", "Web Development"]}
      />
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
          Projects
        </Typography>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      >
        {projectData.map((project) => (
          <motion.div key={project.id} variants={fadeInUp}>
            <Paper
              component={Link}
              to={`/projects/${project.id}`}
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
                {project.name}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                {project.excerpt}
              </Typography>

              <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
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
            </Paper>
          </motion.div>
        ))}
      </motion.div>
    </Box>
  );
}

function ProjectView({ project }) {
  const theme = useTheme();
  const grad = `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;

  const ProjectComponent = useMemo(() => {
    const moduleKey = `../projects/${project.id}/index.jsx`;
    const loader = projectModules[moduleKey];
    if (!loader) return null;
    return lazy(loader);
  }, [project.id]);

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <Seo
        title={`${project.name} | Naveen Karthik`}
        description={project.excerpt}
        canonical={`/projects/${project.id}`}
        keywords={project.tags}
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
    </motion.div>
  );
}
