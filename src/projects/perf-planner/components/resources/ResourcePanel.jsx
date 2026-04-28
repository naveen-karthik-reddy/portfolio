import { useState } from "react";
import {
  Box, Typography, IconButton, Chip, Tooltip, Button, Divider,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useApp } from "../../context/useApp.js";
import ResourceDialog from "./ResourceDialog.jsx";

const TYPE_COLORS = {
  js:    "#ef4444",
  css:   "#f59e0b",
  font:  "#8b5cf6",
  image: "#10b981",
  video: "#3b82f6",
  other: "#6b7280",
};

const LOADING_COLORS = {
  blocking: "error",
  defer:    "success",
  async:    "success",
  preload:  "info",
  lazy:     "default",
  module:   "success",
};

export default function ResourcePanel() {
  const { state, dispatch } = useApp();
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { variations, activeVariationId } = state;
  const activeVariation = variations.find((v) => v.id === activeVariationId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = adding new

  if (!activeVariation) return null;

  const resources = activeVariation.resources ?? [];

  function handleSave(resource) {
    if (editing) {
      dispatch({ type: "RESOURCE_UPDATED", payload: { variationId: activeVariation.id, resource } });
    } else {
      dispatch({ type: "RESOURCE_ADDED", payload: { variationId: activeVariation.id, resource } });
    }
    setDialogOpen(false);
    setEditing(null);
  }

  function handleEdit(r) {
    setEditing(r);
    setDialogOpen(true);
  }

  function handleDelete(resourceId) {
    dispatch({ type: "RESOURCE_DELETED", payload: { variationId: activeVariation.id, resourceId } });
  }

  function handleAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  const totalSizeKB = resources.reduce((s, r) => s + r.sizeKB * r.count, 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{
        px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: 1, borderColor: "divider",
        bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
      }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.75rem" }}>
            Resource List
          </Typography>
          {resources.length > 0 && (
            <Typography variant="caption" sx={{ ml: 1, color: "text.disabled", fontSize: "0.65rem" }}>
              {resources.length} files · {totalSizeKB.toFixed(0)} KB total
            </Typography>
          )}
        </Box>
        <Button
          size="small"
          startIcon={<Add sx={{ fontSize: 14 }} />}
          onClick={handleAdd}
          sx={{ fontSize: "0.72rem", py: 0.25 }}
        >
          Add
        </Button>
      </Box>

      {/* Resource rows */}
      {resources.length === 0 ? (
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.7rem" }}>
            No resources added. Click &quot;Add&quot; to list individual files for protocol-accurate simulation.
          </Typography>
        </Box>
      ) : (
        <Box>
          {resources.map((r) => (
            <Box
              key={r.id}
              sx={{
                display: "flex", alignItems: "center", gap: 0.75,
                px: 1.5, py: 0.75, borderBottom: 1, borderColor: "divider",
                "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" },
              }}
            >
              {/* Type dot */}
              <Box sx={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                bgcolor: TYPE_COLORS[r.type] ?? "#6b7280",
              }} />

              {/* Name + meta */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.72rem", display: "block", color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.name}
                  {r.count > 1 && <span style={{ color: "#888", marginLeft: 4 }}>×{r.count}</span>}
                  {r.isLcp && <span style={{ marginLeft: 4, color: "#10b981", fontWeight: 700 }}>(LCP)</span>}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.25 }}>
                  <Typography variant="caption" sx={{ fontSize: "0.62rem", color: "text.disabled" }}>
                    {r.source}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.62rem", color: "text.disabled" }}>·</Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.62rem", color: "text.disabled" }}>
                    {r.sizeKB} KB
                  </Typography>
                </Box>
              </Box>

              {/* Loading chip */}
              <Chip
                label={r.loading}
                size="small"
                color={LOADING_COLORS[r.loading] ?? "default"}
                sx={{ fontSize: "0.6rem", height: 18, "& .MuiChip-label": { px: 0.75 } }}
              />

              {/* Actions */}
              <Tooltip title="Edit" arrow>
                <IconButton size="small" onClick={() => handleEdit(r)} sx={{ p: 0.25 }}>
                  <Edit sx={{ fontSize: 13 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <IconButton size="small" onClick={() => handleDelete(r.id)} sx={{ p: 0.25, color: "error.main" }}>
                  <Delete sx={{ fontSize: 13 }} />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      )}

      <Divider />

      <ResourceDialog
        open={dialogOpen}
        resource={editing}
        onSave={handleSave}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
      />
    </Box>
  );
}
