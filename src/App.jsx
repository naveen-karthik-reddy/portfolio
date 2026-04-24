import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
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
  Divider,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  LinkedIn,
  GitHub,
  MailOutline,
  Palette,
  Phone,
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

// ==================== DATA ====================
const portfolioData = {
  name: "Naveen Karthik",
  title: "Frontend-Focused Full Stack Developer",
  email: "karthiknaveen22022002@gmail.com",
  phone: "+91 8790674100",
  location: "Bangalore, India",
  summary:
    "Frontend-focused Full Stack Developer with ~3 years of experience building fast, data-intensive products using React, TypeScript, and Next.js. Currently at Tijori Finance, I work on products like Tijori Stack and Zerodha Stocks, building scalable, high-performance interfaces from scratch.",
  links: {
    linkedin: "https://www.linkedin.com/in/naveen-karthik-reddy/",
    github: "https://github.com/naveen-karthik-reddy/",
    leetcode: "https://leetcode.com/u/naveen-karthik-reddy/",
    takeUforward: "https://takeuforward.org/",
    namasteDev: "https://namastedev.com/",
  },
};

const experienceData = [
  {
    company: "Tijori Finance",
    role: "SDE (Frontend Developer)",
    duration: "Dec 2024 – Present",
    location: "Bangalore, India",
    description: [
      "Built and optimized data-driven UIs across Tijori Stack.ai and Zerodha Stocks using JavaScript, TypeScript, jQuery, React, and MUI.",
      "Implemented role-based UI logic, dynamic charts, Google Analytics tracking, and interactive filters for secure, responsive, real-time data visualization.",
      "Improved frontend performance, load times, and SEO using optimized React Hooks, reusable MUI components, and automated testing for stable deployments.",
      "Collaborated with backend and design teams to ensure cross-browser compatibility, responsive UI, and maintainable frontend architecture with CI/CD integration.",
      "Key Achievement: Led Core Web Vitals and performance improvements on production. Improved PageSpeed scores significantly.",
    ],
    techStack: "JavaScript, TypeScript, jQuery, Material UI, React, Django Templates, HighCharts",
  },
  {
    company: "Zoho Corporation",
    role: "Member of Technical Staff",
    duration: "Jan 2023 – Dec 2024",
    location: "Chennai, India",
    description: [
      "Engineered scalable frontend architecture for multiple in-house scraping tools using React, Tailwind CSS, and Redux for predictable state management.",
      "Implemented modular component-driven design, lazy-loaded routes, virtualized rendering optimizing performance and reducing bundle size.",
      "Designed schema-based dynamic UIs with configurable layouts, improving extensibility and maintainability across internal applications.",
      "Enhanced frontend performance and UI stability using custom hooks, render optimization, and cross-browser testing.",
    ],
    techStack: "JavaScript, Tailwind CSS, React JS, Redux",
  },
  {
    company: "ZeroBill",
    role: "Software Development Intern",
    duration: "Sep 2022 – Dec 2022",
    location: "Visakhapatnam, India",
    description: [
      "Developed Next.js-based merchant management website to track transactions and settlements.",
      "Created interactive analytic dashboards using PowerBI for real-time insights.",
      "Developed algorithm using NLP techniques for automated item extraction from receipts, reducing manual data entry by 97%.",
    ],
    techStack: "JavaScript, TypeScript, React, Node, Next, GCP (Docker, Kubernetes)",
  },
];

const projectData = [
  {
    name: "Clubs Manager",
    date: "Dec 2022",
    points: [
      "Developed an all-in-one platform for club management with features like membership, event handling, and communication.",
      "Built using Next.js and Prisma; integrated Firebase Firestore for image storage and PostgreSQL for structured data.",
      "Implemented responsive UI using Tailwind CSS and deployed on a scalable architecture.",
    ],
  },
];

const skillsData = {
  Languages: ["JavaScript", "TypeScript", "Python", "C++"],
  Frontend: ["React.js", "Next.js", "Redux", "Tailwind CSS", "Material UI", "jQuery"],
  Backend: ["Node.js", "Next.js", "Django"],
  Abilities: ["Responsive Design", "Frontend Performance", "Cross-Browser Compatibility", "CI/CD", "Problem Solving", "Machine Coding", "System Design"],
};

const educationData = [
  {
    institution: "Gayatri Vidya Parishad College of Engineering (Autonomous), JNTU Kakinada",
    degree: "Bachelor of Technology in Electronics and Communication Engineering",
    duration: "2019 – 2023",
    location: "Visakhapatnam",
    coursework: "Data Structures and Algorithms, Computer Networks, Object-Oriented Programming, Machine Learning, NLP",
  },
];

const achievementData = [
  "Problem Solving & Competitive Programming Lead at Google Developer Student Clubs (GDSC) - organized multiple coding events, mentoring peers.",
  "Ranked 5439 globally in Google HashCode 2021.",
  "Runner-Up in CodeMassacre conducted by IEEE Student Branch JNTUV.",
  "3rd Position in CodeWars by IEEE Student Branch GVPCE.",
];

const themes = {
  default: {
    name: "Default",
    dark: { primary: "#00f0ff", secondary: "#ff00ff", background: "#0a0a0f", paper: "rgba(20, 20, 35, 0.85)", text: "#e0e0e0", textSecondary: "#8888aa" },
    light: { primary: "#6366f1", secondary: "#8b5cf6", background: "#f8fafc", paper: "rgba(255, 255, 255, 0.9)", text: "#1e293b", textSecondary: "#64748b" },
  },
  ocean: {
    name: "Ocean",
    dark: { primary: "#0ea5e9", secondary: "#06b6d4", background: "#0c1929", paper: "rgba(15, 30, 50, 0.85)", text: "#e0f2fe", textSecondary: "#7dd3fc" },
    light: { primary: "#0284c7", secondary: "#0ea5e9", background: "#f0f9ff", paper: "rgba(255, 255, 255, 0.9)", text: "#0369a1", textSecondary: "#0ea5e9" },
  },
  forest: {
    name: "Forest",
    dark: { primary: "#22c55e", secondary: "#84cc16", background: "#0a1f0a", paper: "rgba(15, 40, 20, 0.85)", text: "#dcfce7", textSecondary: "#86efac" },
    light: { primary: "#16a34a", secondary: "#65a30d", background: "#f0fdf4", paper: "rgba(255, 255, 255, 0.9)", text: "#14532d", textSecondary: "#22c55e" },
  },
  sunset: {
    name: "Sunset",
    dark: { primary: "#f97316", secondary: "#ef4444", background: "#1a0a0a", paper: "rgba(40, 20, 20, 0.85)", text: "#fed7aa", textSecondary: "#fdba74" },
    light: { primary: "#ea580c", secondary: "#dc2626", background: "#fff7ed", paper: "rgba(255, 255, 255, 0.9)", text: "#7c2d12", textSecondary: "#f97316" },
  },
  lavender: {
    name: "Lavender",
    dark: { primary: "#a78bfa", secondary: "#c084fc", background: "#0f0a1a", paper: "rgba(25, 20, 45, 0.85)", text: "#ede9fe", textSecondary: "#c4b5fd" },
    light: { primary: "#7c3aed", secondary: "#a855f7", background: "#faf5ff", paper: "rgba(255, 255, 255, 0.9)", text: "#5b21b6", textSecondary: "#8b5cf6" },
  },
};

// ==================== APP COMPONENT ====================
export default function App() {
  const [currentTheme, setCurrentTheme] = useState("default");
  const [darkMode, setDarkMode] = useState(false);
  const [themeAnchor, setThemeAnchor] = useState(null);
  const [open, setOpen] = useState({});

  const themeConfig = themes[currentTheme][darkMode ? "dark" : "light"];

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: themeConfig.primary },
      secondary: { main: themeConfig.secondary },
      background: { default: themeConfig.background, paper: themeConfig.paper },
      text: { primary: themeConfig.text, secondary: themeConfig.textSecondary },
    },
    typography: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      h1: { fontWeight: 900, fontSize: "3.5rem", letterSpacing: "-0.02em" },
      h2: { fontWeight: 800, fontSize: "2.5rem", letterSpacing: "-0.01em" },
      h3: { fontWeight: 800, fontSize: "2rem", letterSpacing: "-0.01em" },
      h4: { fontWeight: 700, fontSize: "1.75rem", letterSpacing: "0.02em" },
      h5: { fontWeight: 700, fontSize: "1.5rem", letterSpacing: "0.01em" },
      h6: { fontWeight: 600, fontSize: "1.25rem", letterSpacing: "0.05em" },
      body1: { fontSize: "1.125rem", lineHeight: 1.8 },
      body2: { fontSize: "1rem", lineHeight: 1.7 },
    },
    shape: { borderRadius: 12 },
    shadows: ["none", "0 4px 20px rgba(99, 102, 241, 0.15)", ...Array(22).fill("none")],
  });

  const toggleOpen = (key) => setOpen({ ...open, [key]: !open[key] });

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };

  const createIcon = (Icon, props) => Icon ? React.createElement(Icon, props) : null;

  const renderContactBtn = (Icon, href, target, fontSize) => {
    const btn = React.createElement(IconButton, {
      href, target,
      sx: { bgcolor: "rgba(0,240,255,0.1)", color: "primary.main", width: 56, height: 56, border: "2px solid rgba(0,240,255,0.3)", borderRadius: 2, transition: "all 0.4s", "&:hover": { bgcolor: "primary.main", color: "#0a0a0f", borderColor: "primary.main", transform: "translateY(-2px)", boxShadow: "0 0 30px rgba(0,240,255,0.6)" } }
    }, createIcon(Icon, { sx: { fontSize } }));
    return React.createElement(motion.div, {
      whileHover: { scale: 1.1, y: -4 },
      whileTap: { scale: 0.95 },
      transition: { type: "spring", stiffness: 400, damping: 17 }
    }, btn);
  };

  const Section = ({ title, children, icon: Icon }) => (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}>
      <Box sx={{ mb: 10 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, position: "relative" }}>
          {Icon && (
            <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: "transparent", color: "primary.main", border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon />
            </Box>
          )}
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Inter', sans-serif", letterSpacing: "0.05em", background: darkMode ? "linear-gradient(90deg, #00f0ff 0%, #ff00ff 100%)" : "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 0 }}>
            {title}
          </Typography>
          <Box sx={{ position: "absolute", left: 0, bottom: -8, width: 60, height: 2, background: darkMode ? "linear-gradient(90deg, #00f0ff 0%, #ff00ff 100%)" : "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)", borderRadius: 1 }} />
        </Box>
        {children}
      </Box>
    </motion.div>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box data-theme={darkMode ? "dark" : "light"} sx={{ background: darkMode ? "linear-gradient(180deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)" : "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)", backgroundAttachment: "fixed", color: "text.primary", minHeight: "100vh", transition: "all 0.3s ease", position: "relative", "&::before": { content: '""', position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: darkMode ? "radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(255, 0, 255, 0.08) 0%, transparent 40%)" : "radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 40%)", pointerEvents: "none", zIndex: 0 }, "&::after": { content: '""', position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(${darkMode ? "rgba(0, 240, 255, 0.03)" : "rgba(99, 102, 241, 0.08)"} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? "rgba(0, 240, 255, 0.03)" : "rgba(99, 102, 241, 0.08)"} 1px, transparent 1px)`, backgroundSize: "50px 50px", pointerEvents: "none", zIndex: 0 } }}>
        <AppBar position="sticky" elevation={0} sx={{ backdropFilter: "blur(20px) saturate(180%)", bgcolor: darkMode ? "rgba(10, 10, 15, 0.85)" : "rgba(255, 255, 255, 0.85)", borderBottom: "1px solid", borderColor: "divider", transition: "all 0.3s ease", zIndex: 1100 }}>
          <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <Typography variant="h6" onClick={() => scrollToSection("header")} sx={{ fontWeight: 800, cursor: "pointer", background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", transition: "all 0.3s", "&:hover": { opacity: 0.8 } }}>
                {portfolioData.name}
              </Typography>
            </motion.div>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}>
                {[{ label: "About", id: "summary" }, { label: "Experience", id: "experience" }, { label: "Projects", id: "projects" }, { label: "Skills", id: "skills" }, { label: "Education", id: "education" }, { label: "Achievements", id: "achievements" }].map((item) => (
                  <Typography key={item.id} onClick={() => scrollToSection(item.id)} sx={{ fontSize: "1rem", fontWeight: 600, cursor: "pointer", color: "text.secondary", letterSpacing: "0.05em", textTransform: "uppercase", transition: "all 0.3s", px: 1.5, py: 0.75, border: "1px solid transparent", borderRadius: 1, "&:hover": { color: "primary.main", borderColor: "primary.main", bgcolor: darkMode ? "rgba(0, 240, 255, 0.1)" : "rgba(99, 102, 241, 0.1)" } }}>
                    {item.label}
                  </Typography>
                ))}
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton href={portfolioData.links.linkedin} target="_blank" sx={{ color: "text.secondary", border: "1px solid", borderColor: "divider", transition: "all 0.3s", "&:hover": { color: "primary.main", borderColor: "primary.main" } }}><LinkedIn /></IconButton>
                <IconButton href={portfolioData.links.github} target="_blank" sx={{ color: "text.secondary", border: "1px solid", borderColor: "divider", transition: "all 0.3s", "&:hover": { color: "primary.main", borderColor: "primary.main" } }}><GitHub /></IconButton>
                <IconButton href={`mailto:${portfolioData.email}`} sx={{ color: "text.secondary", border: "1px solid", borderColor: "divider", transition: "all 0.3s", "&:hover": { color: "primary.main", borderColor: "primary.main" } }}><MailOutline /></IconButton>
                <IconButton onClick={(e) => setThemeAnchor(e.currentTarget)} sx={{ color: "text.secondary", border: "1px solid", borderColor: "divider", transition: "all 0.3s", "&:hover": { color: "primary.main", borderColor: "primary.main" } }}><Palette /></IconButton>
                <Menu anchorEl={themeAnchor} open={Boolean(themeAnchor)} onClose={() => setThemeAnchor(null)} PaperProps={{ sx: { bgcolor: "background.paper", border: "1px solid", borderColor: "divider" } }}>
                  {Object.entries(themes).map(([key, t]) => (
                    <MenuItem key={key} onClick={() => { setCurrentTheme(key); setThemeAnchor(null); }} selected={currentTheme === key} sx={{ "&.Mui-selected": { bgcolor: "primary.main", color: "primary.contrastText" } }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: t.dark.primary, border: "1px solid", borderColor: "divider" }} />{t.name}</Box>
                    </MenuItem>
                  ))}
                </Menu>
                <IconButton onClick={() => setDarkMode(!darkMode)} sx={{ color: "text.secondary", border: "1px solid", borderColor: "divider", transition: "all 0.3s", "&:hover": { color: "primary.main", borderColor: "primary.main" } }}>{darkMode ? <Brightness7 /> : <Brightness4 />}</IconButton>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 8, px: { xs: 3, sm: 4, md: 6 }, position: "relative", zIndex: 1 }}>
          <motion.div id="header" initial="hidden" animate="visible" variants={fadeInUp}>
            <Box textAlign="center" sx={{ mb: 12 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <Avatar src={profileImage} alt="Naveen Karthik" sx={{ width: 160, height: 160, mx: "auto", mb: 4, border: "3px solid", borderColor: "primary.main", boxShadow: darkMode ? "0 0 20px rgba(0,240,255,0.3)" : "0 8px 32px rgba(99, 102, 241, 0.3)", objectFit: "cover" }} />
              </motion.div>
              <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, fontFamily: "'Inter', sans-serif", background: darkMode ? "linear-gradient(90deg, #00f0ff 0%, #ff00ff 100%)" : "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "0.05em" }}>
                {portfolioData.name}
              </Typography>
              <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
                {portfolioData.title}
              </Typography>
            </Box>
          </motion.div>

          <Box id="summary" />
          <Section title="Summary">
            <Paper sx={{ p: 4, background: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 3, backdropFilter: "blur(10px)" }}>
              <Typography variant="body1" sx={{ lineHeight: 2, fontSize: "1.1rem", color: "text.primary" }}>{portfolioData.summary}</Typography>
            </Paper>
          </Section>

          <Box id="experience" sx={{ scrollMarginTop: "100px" }} />
          <Section title="Professional Experience" icon={Work}>
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              {experienceData.map((exp, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <Paper sx={{ mb: 3, p: 0, background: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 3, backdropFilter: "blur(10px)", overflow: "hidden", transition: "all 0.4s", "&:hover": { transform: "translateY(-4px)", boxShadow: 2, borderColor: "primary.main" } }}>
                    <ListItem button onClick={() => toggleOpen(`exp${i}`)} sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "action.hover" } }}>
                      <ListItemText primary={<Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{exp.role}</Typography>} secondary={<Box><Typography component="span" sx={{ color: "primary.main", fontWeight: 600, fontSize: "1.15rem" }}>{exp.company}</Typography><Typography component="span" sx={{ color: "text.secondary", mx: 1, fontSize: "1rem" }}>•</Typography><Typography component="span" sx={{ color: "text.secondary", fontSize: "0.9rem" }}>{exp.duration}</Typography><Typography component="div" sx={{ color: "text.secondary", fontSize: "1rem", mt: 0.5 }}>📍 {exp.location}</Typography></Box>} />
                      <motion.div animate={{ rotate: open[`exp${i}`] ? 180 : 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>{open[`exp${i}`] ? <ExpandLess /> : <ExpandMore />}</motion.div>
                    </ListItem>
                    <Collapse in={open[`exp${i}`]} timeout="auto" unmountOnExit>
                      <Box sx={{ px: 3, pb: 3, pt: 1 }}>
                        <List dense>{exp.description.map((p, j) => (<ListItem key={j} sx={{ py: 1, alignItems: "flex-start", "&::before": { content: '"▹"', color: "primary.main", fontWeight: "bold", fontSize: "1.2rem", mr: 1.5, mt: 0.5 } }}><ListItemText primary={<Typography variant="body2" sx={{ lineHeight: 1.7, color: "text.primary" }}>{p}</Typography>} /></ListItem>))}</List>
                        {exp.techStack && (<Box sx={{ px: 3, pb: 2, mt: 1, borderTop: "1px solid", borderColor: "divider", pt: 2 }}><Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.9rem", fontWeight: 600 }}>Tech Stack:</Typography><Typography variant="body2" sx={{ color: "primary.main", fontSize: "0.9rem", mt: 0.5 }}>{exp.techStack}</Typography></Box>)}
                      </Box>
                    </Collapse>
                  </Paper>
                </motion.div>
              ))}
            </motion.div>
          </Section>

          <Box id="projects" sx={{ scrollMarginTop: "100px" }} />
          <Section title="Projects" icon={Folder}>
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              {projectData.map((proj, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <Card sx={{ mb: 3, background: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 2, backdropFilter: "blur(10px)", transition: "all 0.4s", "&:hover": { transform: "translateY(-4px)", boxShadow: 2, borderColor: "primary.main" } }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>{proj.name}</Typography>
                        <Chip label={proj.date} size="small" sx={{ bgcolor: "primary.main", color: "primary.main", fontWeight: 600 }} />
                      </Box>
                      <List dense>{proj.points.map((d, j) => (<ListItem key={j} sx={{ py: 0.5, alignItems: "flex-start", "&::before": { content: '"▹"', color: "primary.main", fontWeight: "bold", fontSize: "1.2rem", mr: 1.5, mt: 0.5 } }}><ListItemText primary={<Typography variant="body2" sx={{ lineHeight: 1.7, color: "text.primary" }}>{d}</Typography>} /></ListItem>))}</List>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </Section>

          <Box id="skills" sx={{ scrollMarginTop: "100px" }} />
          <Section title="Technical Skills">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {Object.entries(skillsData).map(([category, list]) => (
                  <motion.div key={category} variants={fadeInUp} whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                    <Paper sx={{ p: 4, width: "100%", background: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 2, backdropFilter: "blur(10px)", transition: "all 0.3s", "&:hover": { borderColor: "primary.main", boxShadow: 2, transform: "translateY(-2px)" } }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em", mb: 2.5, background: darkMode ? "linear-gradient(90deg, #00f0ff 0%, #ff00ff 100%)" : "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "1.1rem" }}>{category}</Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                        {list.map((skill) => (<Chip key={skill} label={skill} sx={{ bgcolor: "rgba(0,240,255,0.1)", color: "primary.main", fontWeight: 600, fontSize: "1.1rem", height: 36, border: "1px solid rgba(0,240,255,0.3)", borderRadius: 1, fontFamily: "'Inter', sans-serif", transition: "all 0.3s", "&:hover": { bgcolor: "rgba(0,240,255,0.2)", transform: "translateY(-2px)", borderColor: "primary.main" } }} />))}
                      </Box>
                    </Paper>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Section>

          <Box id="education" sx={{ scrollMarginTop: "100px" }} />
          <Section title="Education" icon={School}>
            {educationData.map((edu, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Paper sx={{ p: 4, mb: 3, background: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 2, backdropFilter: "blur(10px)", transition: "all 0.4s", "&:hover": { transform: "translateY(-4px)", boxShadow: 2, borderColor: "primary.main" } }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "primary.main" }}>{edu.institution}</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{edu.degree}</Typography>
                  <Chip label={edu.duration} size="small" sx={{ bgcolor: "rgba(0,240,255,0.2)", color: "primary.main", fontWeight: 600, border: "1px solid rgba(0,240,255,0.3)", borderRadius: 1, mb: 2 }} />
                  <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8, fontStyle: "italic", fontFamily: "'Inter', sans-serif" }}>{edu.coursework}</Typography>
                </Paper>
              </motion.div>
            ))}
          </Section>

          <Box id="achievements" sx={{ scrollMarginTop: "100px" }} />
          <Section title="Achievements & Co-curricular" icon={EmojiEvents}>
            <Paper sx={{ p: 4, background: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 2, backdropFilter: "blur(10px)" }}>
              <List dense>{achievementData.map((a, i) => (<ListItem key={i} sx={{ py: 1.5, alignItems: "flex-start", "&::before": { content: '"🏆"', fontSize: "1.2rem", mr: 2 } }}><ListItemText primary={<Typography variant="body1" sx={{ color: "text.primary", lineHeight: 1.8 }}>{a}</Typography>} /></ListItem>))}</List>
            </Paper>
          </Section>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ duration: 0.6 }}>
            <Divider sx={{ my: 8, borderColor: "rgba(0,240,255,0.2)" }} />
            <Box textAlign="center" sx={{ pb: 6, p: 4, borderRadius: 2, background: "background.paper", border: "1px solid rgba(0,240,255,0.3)", boxShadow: "0 0 30px rgba(0,240,255,0.1)" }}>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Inter', sans-serif", letterSpacing: "0.05em", mb: 3, background: darkMode ? "linear-gradient(90deg, #00f0ff 0%, #ff00ff 50%, #bf00ff 100%)" : "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Let's Connect</Typography>
              <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
                {renderContactBtn(MailOutline, `mailto:${portfolioData.email}`, "_blank", 28)}
                {renderContactBtn(Phone, `tel:${portfolioData.phone}`, undefined, 28)}
                {renderContactBtn(LinkedIn, portfolioData.links.linkedin, "_blank", 28)}
                {renderContactBtn(GitHub, portfolioData.links.github, "_blank", 28)}
                {renderContactBtn(Code, portfolioData.links.leetcode, "_blank", 28)}
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ pb: 4, pt: 4, opacity: 0.7, fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em" }}>© {new Date().getFullYear()} {portfolioData.name} // Built with React & MUI</Typography>
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  );
}