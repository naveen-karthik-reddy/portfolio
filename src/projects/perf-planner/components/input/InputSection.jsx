import { useState } from "react";
import { Box, Typography, Collapse, IconButton } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

export default function InputSection({ title, children }) {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ mb: 0.5 }}>
      <Box
        sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          px: 2, py: 0.75, cursor: "pointer",
          borderBottom: 1, borderColor: "divider",
          bgcolor: "action.hover",
          "&:hover": { bgcolor: "action.selected" },
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: "0.08em", color: "text.secondary", textTransform: "uppercase" }}>
          {title}
        </Typography>
        <IconButton size="small" sx={{ p: 0 }}>
          {open ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
        </IconButton>
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 2, py: 0.5 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}
