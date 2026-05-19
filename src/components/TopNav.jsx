'use client';
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const navLinkSx = (active) => ({
  cursor: "pointer",
  color: active ? "primary.main" : "text.secondary",
  fontSize: "0.85rem",
  fontWeight: 600,
  letterSpacing: "0.05em",
  px: 1,
  textDecoration: "none",
  transition: "color 0.2s",
  "&:hover": { color: "primary.main" },
});

export default function TopNav({
  portfolioData,
  darkMode,
  setDarkMode,
  themes,
  currentTheme,
  setCurrentTheme,
  scrollToSection,
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [themeAnchor, setThemeAnchor] = useState(null);

  const isLanding = pathname === "/";
  const isArticlesActive = pathname.startsWith("/articles");
  const isProjectsActive = pathname.startsWith("/projects");

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

        {/* ── Name ── */}
        {isLanding ? (
          <Typography
            onClick={() => scrollToSection("header")}
            sx={{ fontWeight: 800, cursor: "pointer", color: "text.primary" }}
          >
            {portfolioData.name}
          </Typography>
        ) : (
          <Typography
            component={Link}
            href="/"
            sx={{ fontWeight: 800, color: "text.primary", textDecoration: "none" }}
          >
            {portfolioData.name}
          </Typography>
        )}

        {/* ── Desktop right side ── */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5 }}>
          {isLanding && SECTION_IDS.map((id) => (
            <Typography
              key={id}
              onClick={() => scrollToSection(id)}
              sx={navLinkSx(false)}
            >
              {id.toUpperCase()}
            </Typography>
          ))}

          <Typography component={Link} href="/articles" sx={navLinkSx(isArticlesActive)}>
            ARTICLES
          </Typography>
          <Typography component={Link} href="/projects" sx={navLinkSx(isProjectsActive)}>
            PROJECTS
          </Typography>

          {isLanding && <>
            <IconButton href={portfolioData.links.linkedin} target="_blank" size="small" sx={{ color: "text.secondary", ml: 1 }}>
              <LinkedIn fontSize="small" />
            </IconButton>
            <IconButton href={portfolioData.links.github} target="_blank" size="small" sx={{ color: "text.secondary" }}>
              <GitHub fontSize="small" />
            </IconButton>
            <IconButton href={`mailto:${portfolioData.email}`} size="small" sx={{ color: "text.secondary" }}>
              <MailOutline fontSize="small" />
            </IconButton>
          </>}

          <IconButton onClick={(e) => setThemeAnchor(e.currentTarget)} size="small" sx={{ color: "text.secondary" }}>
            <Palette fontSize="small" />
          </IconButton>
          <IconButton onClick={() => setDarkMode((v) => !v)} size="small" sx={{ color: "text.secondary" }}>
            {darkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
          </IconButton>
        </Box>

        {/* ── Mobile: hamburger ── */}
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { xs: "flex", md: "none" }, color: "text.primary" }}
          aria-label="Open menu"
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* ── Mobile drawer ── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 260,
            bgcolor: "background.default",
            borderLeft: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1.5 }}>
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <Close />
          </IconButton>
        </Box>

        <Divider />

        <List disablePadding sx={{ flex: 1 }}>
          {isLanding && SECTION_IDS.map((id) => (
            <ListItem key={id} disablePadding>
              <ListItemButton onClick={() => handleSection(id)}>
                <ListItemText
                  primary={id.toUpperCase()}
                  primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.08em", color: "text.secondary" }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          {isLanding && <Divider sx={{ my: 1 }} />}

          {[
            { label: "ARTICLES", href: "/articles", active: isArticlesActive },
            { label: "PROJECTS", href: "/projects", active: isProjectsActive },
          ].map(({ label, href, active }) => (
            <ListItem key={href} disablePadding>
              <ListItemButton component={Link} href={href} onClick={() => setDrawerOpen(false)}>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em", color: active ? "primary.main" : "text.secondary" }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 0.5 }}>
          {isLanding && <>
            <IconButton href={portfolioData.links.linkedin} target="_blank" size="small" sx={{ color: "text.secondary" }}>
              <LinkedIn fontSize="small" />
            </IconButton>
            <IconButton href={portfolioData.links.github} target="_blank" size="small" sx={{ color: "text.secondary" }}>
              <GitHub fontSize="small" />
            </IconButton>
            <IconButton href={`mailto:${portfolioData.email}`} size="small" sx={{ color: "text.secondary" }}>
              <MailOutline fontSize="small" />
            </IconButton>
          </>}
          <Box sx={{ flex: 1 }} />
          <IconButton onClick={(e) => setThemeAnchor(e.currentTarget)} size="small" sx={{ color: "text.secondary" }}>
            <Palette fontSize="small" />
          </IconButton>
          <IconButton onClick={() => setDarkMode((v) => !v)} size="small" sx={{ color: "text.secondary" }}>
            {darkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
          </IconButton>
        </Box>
      </Drawer>

      <Menu
        anchorEl={themeAnchor}
        open={Boolean(themeAnchor)}
        onClose={() => setThemeAnchor(null)}
      >
        {Object.entries(themes).map(([key, t]) => (
          <MenuItem
            key={key}
            selected={currentTheme === key}
            onClick={() => { setCurrentTheme(key); setThemeAnchor(null); }}
            sx={{ "&.Mui-selected": { bgcolor: "primary.main", color: "primary.contrastText" } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: t.dark.primary, border: "1px solid", borderColor: "divider" }} />
              {t.name}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </AppBar>
  );
}
