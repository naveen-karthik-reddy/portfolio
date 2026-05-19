'use client';
import React from "react";
import { Box, Typography, Divider, IconButton } from "@mui/material";
import {
  Phone,
  LinkedIn,
  GitHub,
  MailOutline,
  Code,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

export default function Footer({ portfolioData }) {
  const theme = useTheme();
  const grad = `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;

  const contacts = [
    { href: `mailto:${portfolioData.email}`, Icon: MailOutline },
    { href: `tel:${portfolioData.phone}`, Icon: Phone },
    { href: portfolioData.links.linkedin, Icon: LinkedIn, target: "_blank" },
    { href: portfolioData.links.github, Icon: GitHub, target: "_blank" },
    { href: portfolioData.links.leetcode, Icon: Code, target: "_blank" },
  ];

  return (
    <div className="no-print">
      <Divider />

      <Box
        textAlign="center"
        sx={{ px: 4, pt: 6, pb: 2 }}
      >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: "0.05em",
              mb: 3,
              background: grad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Let's Connect
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
            {contacts.map(({ href, Icon, target }, i) => (
              <IconButton
                key={i}
                href={href}
                target={target}
                sx={{
                  color: "primary.main",
                  width: 56,
                  height: 56,
                  border: "2px solid",
                  borderColor: "primary.main",
                  borderRadius: 2,
                  transition: "transform 0.25s ease, background-color 0.25s ease, color 0.25s ease",
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "background.default",
                    transform: "scale(1.1) translateY(-4px)",
                  },
                  "&:active": { transform: "scale(0.95)" },
                }}
              >
                <Icon sx={{ fontSize: 28 }} />
              </IconButton>
            ))}
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 4, pb: 4, opacity: 0.7, letterSpacing: "0.1em" }}
          >
            © {new Date().getFullYear()} {portfolioData.name} // Built with React & MUI
          </Typography>
        </Box>
    </div>
  );
}
