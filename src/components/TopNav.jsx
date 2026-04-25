import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
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
} from "@mui/icons-material";

export default function TopNav({
  portfolioData,
  darkMode,
  setDarkMode,
  themes,
  currentTheme,
  setCurrentTheme,
  themeAnchor,
  setThemeAnchor,
  scrollToSection,
}) {
  const location = useLocation();
  const isArticlesActive =
    location.pathname.startsWith("/articles") ||
    location.pathname.startsWith("/article");

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: "blur(20px)",
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          onClick={() => scrollToSection("header")}
          sx={{ fontWeight: 800, cursor: "pointer" }}
        >
          {portfolioData.name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Nav Links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            {["summary", "experience", "projects", "skills", "education", "achievements"].map(
              (id) => (
                <Typography
                  key={id}
                  onClick={() => scrollToSection(id)}
                  sx={{
                    cursor: "pointer",
                    color: "text.secondary",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    px: 1,
                    transition: "color 0.2s",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {id.toUpperCase()}
                </Typography>
              )
            )}

            <Typography
              component={Link}
              to="/articles"
              sx={{
                textDecoration: "none",
                color: isArticlesActive ? "primary.main" : "text.secondary",
                fontSize: "0.85rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                px: 1,
                transition: "color 0.2s",
                "&:hover": { color: "primary.main" },
              }}
            >
              ARTICLES
            </Typography>
          </Box>

          {/* Icons */}
          <IconButton href={portfolioData.links.linkedin} target="_blank">
            <LinkedIn />
          </IconButton>

          <IconButton href={portfolioData.links.github} target="_blank">
            <GitHub />
          </IconButton>

          <IconButton href={`mailto:${portfolioData.email}`}>
            <MailOutline />
          </IconButton>

          {/* Theme menu */}
          <IconButton onClick={(e) => setThemeAnchor(e.currentTarget)}>
            <Palette />
          </IconButton>

          <Menu
            anchorEl={themeAnchor}
            open={Boolean(themeAnchor)}
            onClose={() => setThemeAnchor(null)}
          >
            {Object.entries(themes).map(([key, t]) => (
              <MenuItem
                key={key}
                selected={currentTheme === key}
                onClick={() => {
                  setCurrentTheme(key);
                  setThemeAnchor(null);
                }}
                sx={{ "&.Mui-selected": { bgcolor: "primary.main", color: "primary.contrastText" } }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      bgcolor: t.dark.primary,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                  {t.name}
                </Box>
              </MenuItem>
            ))}
          </Menu>

          <IconButton onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
