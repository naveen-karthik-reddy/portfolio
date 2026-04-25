import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Divider, IconButton } from "@mui/material";
import {
  Phone,
  LinkedIn,
  GitHub,
  MailOutline,
  Code,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

import { articlesData } from "../data/articlesData";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

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
    <>
      <Divider />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
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
              <motion.div
                key={i}
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <IconButton
                  href={href}
                  target={target}
                  sx={{
                    color: "primary.main",
                    width: 56,
                    height: 56,
                    border: "2px solid",
                    borderColor: "primary.main",
                    borderRadius: 2,
                    transition: "all 0.4s",
                    "&:hover": { bgcolor: "primary.main", color: "background.default" },
                  }}
                >
                  <Icon sx={{ fontSize: 28 }} />
                </IconButton>
              </motion.div>
            ))}
          </Box>

          {/* Articles navigation */}
          <Box sx={{ mt: 5, mb: 1 }}>
            <Divider sx={{ mb: 4 }} />
            <Typography
              variant="overline"
              sx={{
                display: "block",
                mb: 2,
                letterSpacing: "0.15em",
                color: "text.secondary",
                fontWeight: 700,
              }}
            >
              Articles
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography
                component={Link}
                to="/articles"
                sx={{
                  textDecoration: "none",
                  color: "primary.main",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  transition: "opacity 0.2s",
                  "&:hover": { opacity: 0.7 },
                }}
              >
                All Articles →
              </Typography>
              {articlesData.map((a) => (
                <Typography
                  key={a.id}
                  component={Link}
                  to={`/articles/${a.id}`}
                  sx={{
                    textDecoration: "none",
                    color: "text.secondary",
                    fontSize: "0.82rem",
                    transition: "color 0.2s",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {a.title}
                </Typography>
              ))}
            </Box>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 4, pb: 4, opacity: 0.7, letterSpacing: "0.1em" }}
          >
            © {new Date().getFullYear()} {portfolioData.name} // Built with React & MUI
          </Typography>
        </Box>
      </motion.div>
    </>
  );
}
