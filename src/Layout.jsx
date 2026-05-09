import React, { useState, useMemo, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material/styles";
import { Box, CssBaseline } from "@mui/material";

import TopNav from "./components/TopNav";
import Footer from "./components/Footer";
import { portfolioData } from "./data/portfolioData";

/* ==================== THEMES ==================== */

const themes = {
  default: {
    name: "Default",
    dark: {
      primary: "#00f0ff",
      secondary: "#ff00ff",
      background: "#0a0a0f",
      paper: "rgba(20, 20, 35, 0.85)",
      text: "#e0e0e0",
      textSecondary: "#8888aa",
    },
    light: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      background: "#f8fafc",
      paper: "rgba(255, 255, 255, 0.9)",
      text: "#1e293b",
      textSecondary: "#64748b",
    },
  },

  ocean: {
    name: "Ocean",
    dark: {
      primary: "#0ea5e9",
      secondary: "#06b6d4",
      background: "#0c1929",
      paper: "rgba(15, 30, 50, 0.85)",
      text: "#e0f2fe",
      textSecondary: "#7dd3fc",
    },
    light: {
      primary: "#0284c7",
      secondary: "#0ea5e9",
      background: "#f0f9ff",
      paper: "rgba(255, 255, 255, 0.9)",
      text: "#0369a1",
      textSecondary: "#0ea5e9",
    },
  },

  forest: {
    name: "Forest",
    dark: {
      primary: "#22c55e",
      secondary: "#84cc16",
      background: "#0a1f0a",
      paper: "rgba(15, 40, 20, 0.85)",
      text: "#dcfce7",
      textSecondary: "#86efac",
    },
    light: {
      primary: "#16a34a",
      secondary: "#65a30d",
      background: "#f0fdf4",
      paper: "rgba(255, 255, 255, 0.9)",
      text: "#14532d",
      textSecondary: "#22c55e",
    },
  },

  sunset: {
    name: "Sunset",
    dark: {
      primary: "#f97316",
      secondary: "#ef4444",
      background: "#1a0a0a",
      paper: "rgba(40, 20, 20, 0.85)",
      text: "#fed7aa",
      textSecondary: "#fdba74",
    },
    light: {
      primary: "#ea580c",
      secondary: "#dc2626",
      background: "#fff7ed",
      paper: "rgba(255, 255, 255, 0.9)",
      text: "#7c2d12",
      textSecondary: "#f97316",
    },
  },

  lavender: {
    name: "Lavender",
    dark: {
      primary: "#a78bfa",
      secondary: "#c084fc",
      background: "#0f0a1a",
      paper: "rgba(25, 20, 45, 0.85)",
      text: "#ede9fe",
      textSecondary: "#c4b5fd",
    },
    light: {
      primary: "#7c3aed",
      secondary: "#a855f7",
      background: "#faf5ff",
      paper: "rgba(255, 255, 255, 0.9)",
      text: "#5b21b6",
      textSecondary: "#8b5cf6",
    },
  },
};

/* ==================== LAYOUT ==================== */

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  /* ✅ Persisted Theme State */
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") || "default"
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  /* ✅ Persist changes */
  useEffect(() => {
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const themeConfig = themes[currentTheme][darkMode ? "dark" : "light"];

  /* ✅ Memoized theme (important) */
  const theme = useMemo(
    () =>
      responsiveFontSizes(
        createTheme({
          palette: {
            mode: darkMode ? "dark" : "light",
            primary: { main: themeConfig.primary },
            secondary: { main: themeConfig.secondary },
            background: {
              default: themeConfig.background,
              paper: themeConfig.paper,
            },
            text: {
              primary: themeConfig.text,
              secondary: themeConfig.textSecondary,
            },
          },
          typography: {
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            h1: { fontWeight: 900, fontSize: "3.5rem" },
            h2: { fontWeight: 800, fontSize: "2.5rem" },
            h3: { fontWeight: 800, fontSize: "2rem" },
          },
          shape: { borderRadius: 12 },
          components: {
            MuiDialog: {
              styleOverrides: {
                paper: ({ theme }) => ({
                  backgroundImage: "none",
                  backgroundColor: theme.palette.mode === "dark"
                    ? "#141423"
                    : "#ffffff",
                }),
              },
            },
            MuiMenu: {
              styleOverrides: {
                paper: ({ theme }) => ({
                  backgroundImage: "none",
                  backgroundColor: theme.palette.mode === "dark"
                    ? "#1a1a2e"
                    : "#ffffff",
                }),
              },
            },
          },
        })
      ),
    [currentTheme, darkMode]
  );

  /* ✅ FIXED: Route-aware scroll */
  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: darkMode
            ? "linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)"
            : "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
          transition: "all 0.3s ease",
        }}
      >
        <TopNav
          portfolioData={portfolioData}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          themes={themes}
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
          scrollToSection={scrollToSection}
        />

        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>

        <Footer portfolioData={portfolioData} />
      </Box>
    </ThemeProvider>
  );
}