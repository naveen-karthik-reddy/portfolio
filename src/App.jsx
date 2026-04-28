import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Typography,
  Container,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Chip,
  Card,
  CardContent,
  Avatar,
  Button,
} from "@mui/material";
import {
  ExpandMore,
  Work,
  School,
  EmojiEvents,
  Folder,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

import profileImage from "./assets/profilePick.jpeg";

/* DATA */
import { achievementData } from "./data/achievementData";
import { educationData } from "./data/educationData";
import { portfolioData } from "./data/portfolioData";
import { experienceData } from "./data/experienceData";
import { projectData } from "./data/projectData";
import { skillsData } from "./data/skillsData";

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

/* ==================== COMPONENT ==================== */

export default function App() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const grad = `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;

  const [open, setOpen] = useState({});

  const toggleOpen = (key) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const Section = ({ title, children, icon: Icon }) => (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
    >
      <Box sx={{ mb: { xs: 6, sm: 10 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 4,
            position: "relative",
          }}
        >
          {Icon && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                color: "primary.main",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon />
            </Box>
          )}
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
            {title}
          </Typography>
          <Box
            sx={{
              position: "absolute",
              left: 0,
              bottom: -8,
              width: 60,
              height: 2,
              background: grad,
              borderRadius: 1,
            }}
          />
        </Box>
        {children}
      </Box>
    </motion.div>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 5, sm: 8 }, px: { xs: 2, sm: 3, md: 6 } }}>
      {/* HEADER */}
      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <Box textAlign="center" sx={{ mb: { xs: 7, sm: 12 } }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Avatar
              src={profileImage}
              alt={portfolioData.name}
              sx={{
                width: { xs: 110, sm: 160 },
                height: { xs: 110, sm: 160 },
                mx: "auto",
                mb: 4,
                border: "3px solid",
                borderColor: "primary.main",
                boxShadow: isDark
                  ? "0 0 20px rgba(0,240,255,0.3)"
                  : "0 8px 32px rgba(99, 102, 241, 0.3)",
              }}
            />
          </motion.div>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 2,
              background: grad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.05em",
            }}
          >
            {portfolioData.name}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "primary.main",
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            {portfolioData.title}
          </Typography>
        </Box>
      </motion.div>

      {/* SUMMARY */}
      <Box id="summary" />
      <Section title="Summary">
        <Paper
          sx={{
            p: 4,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography variant="body1" sx={{ lineHeight: 2 }}>
            {portfolioData.summary}
          </Typography>
        </Paper>
      </Section>

      {/* EXPERIENCE */}
      <Box id="experience" sx={{ scrollMarginTop: "80px" }} />
      <Section title="Professional Experience" icon={Work}>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          {experienceData.map((exp, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Paper
                sx={{
                  mb: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "all 0.4s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 2,
                    borderColor: "primary.main",
                  },
                }}
              >
                <ListItem
                  button
                  onClick={() => toggleOpen(`exp${i}`)}
                  sx={{
                    p: 3,
                    borderBottom: open[`exp${i}`] ? "1px solid" : "none",
                    borderColor: "divider",
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {exp.role}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          component="span"
                          sx={{ color: "primary.main", fontWeight: 600, fontSize: "1rem" }}
                        >
                          {exp.company}
                        </Typography>
                        <Typography component="span" sx={{ color: "text.secondary", mx: 1 }}>
                          •
                        </Typography>
                        <Typography
                          component="span"
                          sx={{ color: "text.secondary", fontSize: "0.9rem" }}
                        >
                          {exp.duration}
                        </Typography>
                        {exp.location && (
                          <Typography
                            component="div"
                            sx={{ color: "text.secondary", fontSize: "0.9rem", mt: 0.5 }}
                          >
                            📍 {exp.location}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <motion.div
                    animate={{ rotate: open[`exp${i}`] ? 180 : 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ExpandMore />
                  </motion.div>
                </ListItem>

                <Collapse in={open[`exp${i}`]} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 3, pb: 3, pt: 1 }}>
                    <List dense>
                      {exp.description.map((d, j) => (
                        <ListItem
                          key={j}
                          sx={{
                            py: 1,
                            alignItems: "flex-start",
                            "&::before": {
                              content: '"▹"',
                              color: "primary.main",
                              fontWeight: "bold",
                              fontSize: "1.2rem",
                              mr: 1.5,
                              mt: 0.3,
                              flexShrink: 0,
                            },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                                {d}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                    {exp.techStack && (
                      <Box
                        sx={{
                          mt: 1,
                          pt: 2,
                          borderTop: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.85rem" }}
                        >
                          Tech Stack:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "primary.main", fontSize: "0.85rem", mt: 0.5 }}
                        >
                          {exp.techStack}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* PROJECTS */}
      <Box id="projects" sx={{ scrollMarginTop: "80px" }} />
      <Section title="Projects" icon={Folder}>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          {projectData.map((proj, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Card
                component={Link}
                to={`/projects/${proj.id}`}
                sx={{
                  mb: 3,
                  display: "block",
                  textDecoration: "none",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  transition: "all 0.4s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 2,
                    borderColor: "primary.main",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {proj.name}
                    </Typography>
                    <Chip
                      label={proj.date}
                      size="small"
                      sx={{
                        color: "primary.main",
                        border: "1px solid",
                        borderColor: "primary.main",
                        bgcolor: "transparent",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <List dense>
                    {proj.points.map((p, j) => (
                      <ListItem
                        key={j}
                        sx={{
                          py: 0.5,
                          alignItems: "flex-start",
                          "&::before": {
                            content: '"▹"',
                            color: "primary.main",
                            fontWeight: "bold",
                            fontSize: "1.2rem",
                            mr: 1.5,
                            mt: 0.3,
                            flexShrink: 0,
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                              {p}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button
            component={Link}
            to="/projects"
            variant="outlined"
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
              fontWeight: 700,
              letterSpacing: "0.05em",
              px: 4,
              "&:hover": {
                bgcolor: "primary.main",
                color: "background.default",
              },
            }}
          >
            All Projects
          </Button>
        </Box>
      </Section>

      {/* SKILLS */}
      <Box id="skills" sx={{ scrollMarginTop: "80px" }} />
      <Section title="Technical Skills">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {Object.entries(skillsData).map(([category, list]) => (
              <motion.div key={category} variants={fadeInUp}>
                <Paper
                  sx={{
                    p: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    transition: "all 0.3s",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: 2,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      mb: 2.5,
                      background: grad,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {category}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {list.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        sx={{
                          color: "primary.main",
                          border: "1px solid",
                          borderColor: "primary.main",
                          bgcolor: "transparent",
                          fontWeight: 600,
                          transition: "all 0.3s",
                          "&:hover": {
                            bgcolor: "primary.main",
                            color: "background.default",
                            transform: "translateY(-2px)",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Section>

      {/* EDUCATION */}
      <Box id="education" sx={{ scrollMarginTop: "80px" }} />
      <Section title="Education" icon={School}>
        {educationData.map((edu, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <Paper
              sx={{
                p: 4,
                mb: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                transition: "all 0.4s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 2,
                  borderColor: "primary.main",
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "primary.main" }}>
                {edu.institution}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {edu.degree}
              </Typography>
              <Chip
                label={edu.duration}
                size="small"
                sx={{
                  color: "primary.main",
                  border: "1px solid",
                  borderColor: "primary.main",
                  bgcolor: "transparent",
                  fontWeight: 600,
                  mb: 2,
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", lineHeight: 1.8, fontStyle: "italic" }}
              >
                {edu.coursework}
              </Typography>
            </Paper>
          </motion.div>
        ))}
      </Section>

      {/* ACHIEVEMENTS */}
      <Box id="achievements" sx={{ scrollMarginTop: "80px" }} />
      <Section title="Achievements & Co-curricular" icon={EmojiEvents}>
        <Paper sx={{ p: 4, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <List dense>
            {achievementData.map((a, i) => (
              <ListItem
                key={i}
                sx={{
                  py: 1.5,
                  alignItems: "flex-start",
                  "&::before": {
                    content: '"🏆"',
                    fontSize: "1.2rem",
                    mr: 2,
                    flexShrink: 0,
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      {a}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Section>

    </Container>
  );
}
