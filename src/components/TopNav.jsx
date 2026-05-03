import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close,
  Brightness4,
  Brightness7,
  Palette,
  LinkedIn,
  GitHub,
  MailOutline,
} from "@mui/icons-material";

const SECTION_IDS = ["summary", "experience", "skills", "education", "achievements"];

export default function TopNav({
  portfolioData,
  darkMode,
  setDarkMode,
  themes,
  currentTheme,
  setCurrentTheme,
  scrollToSection,
}) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [themeAnchor, setThemeAnchor] = useState(null);

  const isContentPage =
    location.pathname.startsWith("/articles") ||
    location.pathname.startsWith("/projects");

  const handleSection = (id) => {
    setDrawerOpen(false);
    scrollToSection(id);
  };

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
      <Toolbar sx={{ justifyContent: "space-between", minHeight: { xs: 56, sm: 64 } }}>
        {/* Name — links home on content pages, scrolls to header on landing */}
        {isContentPage ? (
          <Typography
            component={Link}
            to="/"
            sx={{ fontWeight: 800, color: "text.primary", textDecoration: "none" }}
          >
            {portfolioData.name}
          </Typography>
        ) : (
          <Typography
            onClick={() => scrollToSection("header")}
            sx={{ fontWeight: 800, cursor: "pointer", color: "text.primary" }}
          >
            {portfolioData.name}
          </Typography>
        )}

        {/* Hamburger — landing page only */}
        {!isContentPage && (
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ color: "text.primary" }}
            aria-label="Open menu"
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* ── Slide-in drawer ── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: "background.default",
            borderLeft: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Close */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1.5 }}>
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <Close />
          </IconButton>
        </Box>

        <Divider />

        {/* Section links */}
        <List disablePadding sx={{ flex: 1 }}>
          {SECTION_IDS.map((id) => (
            <ListItem key={id} disablePadding>
              <ListItemButton onClick={() => handleSection(id)}>
                <ListItemText
                  primary={id.toUpperCase()}
                  primaryTypographyProps={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    color: "text.secondary",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          <Divider sx={{ my: 1 }} />

          {/* Page links */}
          {[
            { label: "PROJECTS", to: "/projects" },
            { label: "ARTICLES", to: "/articles" },
          ].map(({ label, to }) => (
            <ListItem key={to} disablePadding>
              <ListItemButton
                component={Link}
                to={to}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "primary.main",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        {/* Social + theme controls */}
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            href={portfolioData.links.linkedin}
            target="_blank"
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <LinkedIn fontSize="small" />
          </IconButton>
          <IconButton
            href={portfolioData.links.github}
            target="_blank"
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <GitHub fontSize="small" />
          </IconButton>
          <IconButton
            href={`mailto:${portfolioData.email}`}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <MailOutline fontSize="small" />
          </IconButton>

          <Box sx={{ flex: 1 }} />

          <IconButton
            onClick={(e) => setThemeAnchor(e.currentTarget)}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <Palette fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => setDarkMode((v) => !v)}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            {darkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
          </IconButton>
        </Box>
      </Drawer>

      {/* Theme picker menu */}
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
            sx={{
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
              },
            }}
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
    </AppBar>
  );
}
