import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Box,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Chip,
  Card,
  CardContent,
  Avatar,
  Link,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  LinkedIn,
  GitHub,
  MailOutline,
  ExpandLess,
  ExpandMore,
  Code,
  Work,
  School,
  EmojiEvents,
  Folder,
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import profileImage from "./assets/profilePick.jpeg";

export default function App() {
  // THEME
  const [darkMode, setDarkMode] = useState(false);
  const [open, setOpen] = useState({});

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: darkMode ? "#6366f1" : "#4f46e5" },
      secondary: { main: darkMode ? "#8b5cf6" : "#7c3aed" },
      background: {
        default: darkMode ? "#0f172a" : "#f8fafc",
        paper: darkMode 
          ? "rgba(30, 41, 59, 0.8)" 
          : "rgba(255, 255, 255, 0.9)",
      },
      text: {
        primary: darkMode ? "#f1f5f9" : "#0f172a",
        secondary: darkMode ? "#94a3b8" : "#64748b",
      },
    },
    typography: {
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
      h4: { 
        fontWeight: 800,
        letterSpacing: "-0.02em",
      },
      h5: { 
        fontWeight: 700,
        letterSpacing: "-0.01em",
      },
      h6: {
        fontWeight: 700,
      },
      body1: {
        lineHeight: 1.8,
      },
    },
    shape: { borderRadius: 16 },
    shadows: darkMode 
      ? ["none", "0 4px 20px rgba(99, 102, 241, 0.1)", ...Array(23).fill("none")]
      : ["none", "0 4px 20px rgba(0, 0, 0, 0.08)", ...Array(23).fill("none")],
  });

  const toggleOpen = (key) => setOpen({ ...open, [key]: !open[key] });

  // Scroll to section
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Animation variants with improved smoothness
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // Custom easing for smoother animation
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  // DATA
  const data = {
    name: "Naveen Karthik",
    email: "karthiknaveen22022002@gmail.com",
    linkedin: "https://linkedin.com/in/naveenkarthik-reddy",
    github: "https://github.com/naveen-karthik-reddy",
    leetcode: "https://leetcode.com/u/naveen-karthik-reddy/",
    title: "Frontend-Focused Full Stack Developer",
    summary:
      "Frontend-focused Full Stack Developer with 2+ years of experience building scalable, performant web applications using React, TypeScript, and Next.js. Strong background in UI performance optimization, system design, and seamless data-driven interfaces.",
    experience: [
      {
        company: "Tijori Finance",
        role: "Software Development Engineer (Frontend)",
        duration: "Dec 2024 – Present",
        location: "Bangalore, India",
        points: [
          "Built and optimized data-driven UIs across TijoriStack.ai, TijoriFinance.com, Atlas, and Zerodha Stocks using JavaScript, TypeScript, jQuery, React, and MUI.",
          "Implemented role-based UI logic, dynamic charts, Google Analytics tracking, and interactive filters for secure, real-time visualization.",
          "Improved frontend performance, SEO, and load times using optimized React Hooks and reusable components integrated with CI/CD pipelines.",
          "Led SEO and performance optimization initiatives, improving Core Web Vitals across production environments.",
        ],
      },
      {
        company: "Zoho Corporation",
        role: "Member of Technical Staff",
        duration: "Jan 2023 – Dec 2024",
        location: "Chennai, India",
        points: [
          "Engineered scalable frontend architecture for in-house scraping tools using React, Tailwind CSS, and Redux.",
          "Implemented modular, component-driven design with lazy-loaded routes and virtualized rendering to optimize performance.",
          "Designed schema-based dynamic UIs with configurable layouts to improve extensibility and maintainability.",
        ],
      },
      {
        company: "ZeroBill",
        role: "Software Development Intern",
        duration: "Sep 2022 – Dec 2022",
        location: "Visakhapatnam, India",
        points: [
          "Developed a Next.js-based merchant management website to track transactions and settlements.",
          "Created interactive analytic dashboards using PowerBI for real-time insights.",
          "Built an NLP algorithm for automated item extraction from receipts, reducing manual data entry by 97%.",
        ],
      },
    ],
    projects: [
      {
        name: "Clubs Manager",
        date: "Dec 2022",
        details: [
          "Developed an application to manage clubs efficiently — handling membership, hierarchies, communication, and event management within a single platform.",
          "Built with Next.js, Prisma, Firebase Firestore, and PostgreSQL, featuring a responsive UI with Tailwind CSS.",
        ],
      },
    ],
    education: [
      {
        college:
          "Gayatri Vidya Parishad College of Engineering (Autonomous), JNTU Kakinada",
        degree: "B.Tech in Electronics and Communication Engineering",
        duration: "2019 – 2023",
        coursework:
          "Data Structures, Algorithms, Computer Networks, OOP, Machine Learning, NLP",
      },
    ],
    skills: {
      Languages: ["JavaScript", "TypeScript", "Python", "C++"],
      Frontend: [
        "React.js",
        "Next.js",
        "Redux",
        "Tailwind CSS",
        "Material UI",
        "jQuery",
      ],
      Backend: ["Node.js", "Next.js", "Django"],
      Abilities: [
        "Responsive Design",
        "Frontend Performance",
        "Cross-Browser Compatibility",
        "CI/CD",
        "System Design",
        "Problem Solving",
        "Machine Coding",
      ],
    },
    achievements: [
      "Problem Solving & Competitive Programming Lead at GDSC.",
      "Ranked 5439 globally in Google HashCode 2021.",
      "Runner-Up in CodeMassacre (IEEE Student Branch JNTUV).",
      "3rd Place in CodeWars (IEEE Student Branch GVPCE).",
    ],
  };

  // COMPONENTS
  const Section = ({ title, children, icon: Icon }) => (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
    >
      <Box sx={{ mb: 8 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          {Icon && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "white",
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
              background: darkMode
                ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 0,
            }}
          >
            {title}
          </Typography>
        </Box>
        {children}
      </Box>
    </motion.div>
  );

  // RENDER
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          background: darkMode
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)",
          backgroundAttachment: "fixed",
          color: "text.primary",
          minHeight: "100vh",
          transition: "all 0.3s ease",
          position: "relative",
          "&::before": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: darkMode
              ? "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)"
              : "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)",
            pointerEvents: "none",
            zIndex: 0,
          },
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backdropFilter: "blur(20px) saturate(180%)",
            bgcolor: darkMode 
              ? "rgba(15, 23, 42, 0.8)" 
              : "rgba(255, 255, 255, 0.8)",
            borderBottom: `1px solid ${darkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(0, 0, 0, 0.1)"}`,
            zIndex: 1100,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Typography
                variant="h6"
                onClick={() => scrollToSection("header")}
                sx={{
                  fontWeight: 800,
                  cursor: "pointer",
                  background: darkMode
                    ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                    : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  transition: "all 0.3s",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              >
                {data.name}
              </Typography>
            </motion.div>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Navigation Links */}
              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
                {[
                  { label: "About", id: "summary" },
                  { label: "Experience", id: "experience" },
                  { label: "Projects", id: "projects" },
                  { label: "Skills", id: "skills" },
                  { label: "Education", id: "education" },
                  { label: "Achievements", id: "achievements" },
                ].map((item) => (
                  <Typography
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "text.secondary",
                      transition: "all 0.3s",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      "&:hover": {
                        color: "primary.main",
                        bgcolor: darkMode
                          ? "rgba(99, 102, 241, 0.1)"
                          : "rgba(99, 102, 241, 0.05)",
                      },
                    }}
                  >
                    {item.label}
                  </Typography>
                ))}
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton
                  href={data.linkedin}
                  target="_blank"
                  sx={{
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: "primary.main",
                      color: "white",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <LinkedIn />
                </IconButton>
                <IconButton
                  href={data.github}
                  target="_blank"
                  sx={{
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: "primary.main",
                      color: "white",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <GitHub />
                </IconButton>
                <IconButton
                  href={`mailto:${data.email}`}
                  sx={{
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: "primary.main",
                      color: "white",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <MailOutline />
                </IconButton>
                <IconButton
                  onClick={() => setDarkMode(!darkMode)}
                  sx={{
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: "primary.main",
                      color: "white",
                      transform: "rotate(180deg)",
                    },
                  }}
                >
                  {darkMode ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 8, position: "relative", zIndex: 1 }}>
          {/* Header */}
          <motion.div
            id="header"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Box textAlign="center" sx={{ mb: 10 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Avatar
                  src={profileImage}
                  alt="Naveen Karthik"
                  sx={{
                    width: 140,
                    height: 140,
                    mx: "auto",
                    mb: 3,
                    border: `3px solid ${darkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)"}`,
                    boxShadow: darkMode
                      ? "0 8px 32px rgba(99, 102, 241, 0.3)"
                      : "0 8px 32px rgba(79, 70, 229, 0.2)",
                    objectFit: "cover",
                  }}
                />
              </motion.div>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  background: darkMode
                    ? "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)"
                    : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {data.name}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                {data.title}
              </Typography>
            </Box>
          </motion.div>

          {/* Summary */}
          <Box id="summary" />
          <Section title="Summary">
            <Paper
              sx={{
                p: 4,
                background: darkMode
                  ? "rgba(99, 102, 241, 0.05)"
                  : "rgba(99, 102, 241, 0.03)",
                border: `1px solid ${darkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)"}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.9,
                  fontSize: "1.1rem",
                  color: "text.primary",
                }}
              >
                {data.summary}
              </Typography>
            </Paper>
          </Section>

          {/* Experience */}
          <Box id="experience" sx={{ scrollMarginTop: "100px" }} />
          <Section title="Professional Experience" icon={Work}>
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              {data.experience.map((exp, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <Paper
                    sx={{
                      mb: 3,
                      p: 0,
                      background: darkMode
                        ? "rgba(30, 41, 59, 0.6)"
                        : "rgba(255, 255, 255, 0.8)",
                      border: `1px solid ${darkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)"}`,
                      backdropFilter: "blur(10px)",
                      overflow: "hidden",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: darkMode
                          ? "0 12px 40px rgba(99, 102, 241, 0.2)"
                          : "0 12px 40px rgba(0, 0, 0, 0.1)",
                        borderColor: darkMode
                          ? "rgba(99, 102, 241, 0.4)"
                          : "rgba(99, 102, 241, 0.3)",
                      },
                    }}
                  >
                    <ListItem
                      button
                      onClick={() => toggleOpen(`exp${i}`)}
                      sx={{
                        p: 3,
                        "&:hover": {
                          bgcolor: darkMode
                            ? "rgba(99, 102, 241, 0.1)"
                            : "rgba(99, 102, 241, 0.05)",
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, mb: 0.5 }}
                          >
                            {exp.role}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography
                              component="span"
                              sx={{
                                color: "primary.main",
                                fontWeight: 600,
                                fontSize: "0.95rem",
                              }}
                            >
                              {exp.company}
                            </Typography>
                            <Typography
                              component="span"
                              sx={{ color: "text.secondary", mx: 1 }}
                            >
                              •
                            </Typography>
                            <Typography
                              component="span"
                              sx={{ color: "text.secondary", fontSize: "0.9rem" }}
                            >
                              {exp.duration}
                            </Typography>
                            <Typography
                              component="div"
                              sx={{ color: "text.secondary", fontSize: "0.85rem", mt: 0.5 }}
                            >
                              📍 {exp.location}
                            </Typography>
                          </Box>
                        }
                      />
                      <motion.div
                        animate={{ rotate: open[`exp${i}`] ? 180 : 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {open[`exp${i}`] ? <ExpandLess /> : <ExpandMore />}
                      </motion.div>
                    </ListItem>
                    <Collapse in={open[`exp${i}`]} timeout="auto" unmountOnExit>
                      <Box sx={{ px: 3, pb: 3, pt: 1 }}>
                        <List dense>
                          {exp.points.map((p, j) => (
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
                                  mt: 0.5,
                                },
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      lineHeight: 1.7,
                                      color: "text.primary",
                                    }}
                                  >
                                    {p}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Collapse>
                  </Paper>
                </motion.div>
              ))}
            </motion.div>
          </Section>

          {/* Projects */}
          <Box id="projects" sx={{ scrollMarginTop: "100px" }} />
          <Section title="Projects" icon={Folder}>
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              {data.projects.map((proj, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <Card
                    sx={{
                      mb: 3,
                      background: darkMode
                        ? "rgba(30, 41, 59, 0.6)"
                        : "rgba(255, 255, 255, 0.8)",
                      border: `1px solid ${darkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)"}`,
                      backdropFilter: "blur(10px)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: darkMode
                          ? "0 12px 40px rgba(99, 102, 241, 0.2)"
                          : "0 12px 40px rgba(0, 0, 0, 0.1)",
                        borderColor: darkMode
                          ? "rgba(99, 102, 241, 0.4)"
                          : "rgba(99, 102, 241, 0.3)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: "primary.main" }}
                        >
                          {proj.name}
                        </Typography>
                        <Chip
                          label={proj.date}
                          size="small"
                          sx={{
                            bgcolor: darkMode
                              ? "rgba(99, 102, 241, 0.2)"
                              : "rgba(99, 102, 241, 0.1)",
                            color: "primary.main",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <List dense>
                        {proj.details.map((d, j) => (
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
                                mt: 0.5,
                              },
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  sx={{
                                    lineHeight: 1.7,
                                    color: "text.primary",
                                  }}
                                >
                                  {d}
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
          </Section>

          {/* Skills */}
          <Box id="skills" sx={{ scrollMarginTop: "100px" }} />
          <Section title="Technical Skills">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {Object.entries(data.skills).map(([category, list]) => (
                  <motion.div
                    key={category}
                    variants={fadeInUp}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                  <Paper
                    sx={{
                      p: 4,
                      width: "100%",
                      background: darkMode
                        ? "rgba(30, 41, 59, 0.6)"
                        : "rgba(255, 255, 255, 0.8)",
                      border: `1px solid ${darkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)"}`,
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        borderColor: darkMode
                          ? "rgba(99, 102, 241, 0.4)"
                          : "rgba(99, 102, 241, 0.3)",
                        boxShadow: darkMode
                          ? "0 12px 40px rgba(99, 102, 241, 0.2)"
                          : "0 12px 40px rgba(0, 0, 0, 0.1)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 2.5,
                        background: darkMode
                          ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                          : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: "1.25rem",
                      }}
                    >
                      {category}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1.5,
                      }}
                    >
                      {list.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          sx={{
                            bgcolor: darkMode
                              ? "rgba(99, 102, 241, 0.15)"
                              : "rgba(99, 102, 241, 0.08)",
                            color: "primary.main",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            height: 36,
                            border: `1px solid ${darkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)"}`,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              bgcolor: darkMode
                                ? "rgba(99, 102, 241, 0.25)"
                                : "rgba(99, 102, 241, 0.15)",
                              transform: "translateY(-2px)",
                              borderColor: "primary.main",
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

          {/* Education */}
          <Box id="education" sx={{ scrollMarginTop: "100px" }} />
          <Section title="Education" icon={School}>
            {data.education.map((edu, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Paper
                  sx={{
                    p: 4,
                    mb: 3,
                    background: darkMode
                      ? "rgba(30, 41, 59, 0.6)"
                      : "rgba(255, 255, 255, 0.8)",
                    border: `1px solid ${darkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)"}`,
                    backdropFilter: "blur(10px)",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: darkMode
                        ? "0 12px 40px rgba(99, 102, 241, 0.2)"
                        : "0 12px 40px rgba(0, 0, 0, 0.1)",
                      borderColor: darkMode
                        ? "rgba(99, 102, 241, 0.4)"
                        : "rgba(99, 102, 241, 0.3)",
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 1, color: "primary.main" }}
                  >
                    {edu.college}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    {edu.degree}
                  </Typography>
                  <Chip
                    label={edu.duration}
                    size="small"
                    sx={{
                      bgcolor: darkMode
                        ? "rgba(99, 102, 241, 0.2)"
                        : "rgba(99, 102, 241, 0.1)",
                      color: "primary.main",
                      fontWeight: 600,
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.8,
                      fontStyle: "italic",
                    }}
                  >
                    {edu.coursework}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </Section>

          {/* Achievements */}
          <Box id="achievements" sx={{ scrollMarginTop: "100px" }} />
          <Section title="Achievements & Co-curricular" icon={EmojiEvents}>
            <Paper
              sx={{
                p: 4,
                background: darkMode
                  ? "rgba(30, 41, 59, 0.6)"
                  : "rgba(255, 255, 255, 0.8)",
                border: `1px solid ${darkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)"}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <List dense>
                {data.achievements.map((a, i) => (
                  <ListItem
                    key={i}
                    sx={{
                      py: 1.5,
                      alignItems: "flex-start",
                      "&::before": {
                        content: '"🏆"',
                        fontSize: "1.2rem",
                        mr: 2,
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{
                            color: "text.primary",
                            lineHeight: 1.8,
                          }}
                        >
                          {a}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Section>

          {/* Contact */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Divider
              sx={{
                my: 8,
                borderColor: darkMode
                  ? "rgba(99, 102, 241, 0.2)"
                  : "rgba(99, 102, 241, 0.1)",
              }}
            />
            <Box
              textAlign="center"
              sx={{
                pb: 6,
                p: 4,
                borderRadius: 4,
                background: darkMode
                  ? "rgba(99, 102, 241, 0.05)"
                  : "rgba(99, 102, 241, 0.03)",
                border: `1px solid ${darkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.1)"}`,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  background: darkMode
                    ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                    : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Let's Connect! 👋
              </Typography>
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { icon: MailOutline, href: `mailto:${data.email}`, label: "Email" },
                  { icon: LinkedIn, href: data.linkedin, label: "LinkedIn" },
                  { icon: GitHub, href: data.github, label: "GitHub" },
                  { icon: Code, href: data.leetcode, label: "LeetCode" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <IconButton
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      sx={{
                        bgcolor: darkMode
                          ? "rgba(99, 102, 241, 0.15)"
                          : "rgba(99, 102, 241, 0.08)",
                        color: "primary.main",
                        width: 56,
                        height: 56,
                        border: `2px solid ${darkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)"}`,
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          bgcolor: "primary.main",
                          color: "white",
                          borderColor: "primary.main",
                          transform: "translateY(-2px)",
                          boxShadow: darkMode
                            ? "0 8px 24px rgba(99, 102, 241, 0.4)"
                            : "0 8px 24px rgba(79, 70, 229, 0.3)",
                        },
                      }}
                    >
                      <item.icon sx={{ fontSize: 28 }} />
                    </IconButton>
                  </motion.div>
                ))}
              </Box>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{
                pb: 4,
                pt: 4,
                opacity: 0.7,
                fontStyle: "italic",
              }}
            >
              © {new Date().getFullYear()} Naveen Karthik — Built with React & MUI
              ⚛️
            </Typography>
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
