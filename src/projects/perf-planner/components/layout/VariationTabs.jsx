import { useState } from "react";
import {
  Box, Typography, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
} from "@mui/material";
import { Add, DriveFileRenameOutline, ContentCopy } from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useApp } from "../../context/useApp.js";
import { useContextMenu } from "../../hooks/useContextMenu.js";
import { scoreColor } from "../../lib/calculator.js";
import { BLANK_INPUTS } from "../../lib/defaults.js";
import { saveVariation } from "../../lib/db.js";
import TabContextMenu from "./TabContextMenu.jsx";

function ScoreBadge({ score, label }) {
  const color = scoreColor(score);
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.25,
      px: 0.5, py: 0.1, borderRadius: 0.75,
      bgcolor: alpha(color, 0.14),
    }}>
      <Typography variant="caption" sx={{ fontSize: "0.58rem", color, fontWeight: 700, lineHeight: 1 }}>
        {label} {score}
      </Typography>
    </Box>
  );
}

export default function VariationTabs({ variations, activeVariationId, tabScores }) {
  const { state, dispatch } = useApp();
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { menu, openMenu, closeMenu } = useContextMenu();

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameTargetId, setRenameTargetId] = useState(null);

  function handleNewVariation() {
    const now = new Date().toISOString();
    const newVar = {
      id: crypto.randomUUID(),
      pageId: state.activePageId,
      name: `Variation ${variations.length + 1}`,
      isBaseline: false,
      locked: {},
      inputs: { ...BLANK_INPUTS },
      resources: [],
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: "VARIATION_CREATED", payload: newVar });
    saveVariation(newVar);
    dispatch({ type: "SET_ACTIVE_VARIATION", payload: { id: newVar.id } });
  }

  function openRename(e, v) {
    e.stopPropagation();
    setRenameTargetId(v.id);
    setRenameValue(v.name);
    setRenameOpen(true);
  }

  function handleRenameConfirm() {
    const name = renameValue.trim();
    const variation = state.variations.find((v) => v.id === renameTargetId);
    if (name && variation && name !== variation.name) {
      const now = new Date().toISOString();
      dispatch({ type: "VARIATION_RENAMED", payload: { id: variation.id, name, updatedAt: now } });
      saveVariation({ ...variation, name, updatedAt: now });
    }
    setRenameOpen(false);
  }

  function handleDuplicate(e, v) {
    e.stopPropagation();
    const now = new Date().toISOString();
    const copy = {
      ...v,
      id: crypto.randomUUID(),
      name: `${v.name} Copy`,
      isBaseline: false,
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: "VARIATION_DUPLICATED", payload: copy });
    saveVariation(copy);
    dispatch({ type: "SET_ACTIVE_VARIATION", payload: { id: copy.id } });
  }

  return (
    <>
      <Box sx={{
        display: "flex",
        alignItems: "center",
        borderBottom: 1,
        borderColor: "divider",
        overflowX: "auto",
        flexShrink: 0,
        "&::-webkit-scrollbar": { height: 4 },
        "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 2 },
      }}>
        {variations.map((v) => {
          const isActive = v.id === activeVariationId;
          const scores = tabScores?.[v.id];
          return (
            <Box
              key={v.id}
              onClick={() => dispatch({ type: "SET_ACTIVE_VARIATION", payload: { id: v.id } })}
              onContextMenu={(e) => openMenu(e, v.id)}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.25,
                px: 1.5,
                py: 0.75,
                cursor: "pointer",
                flexShrink: 0,
                borderBottom: 2,
                borderColor: isActive ? "primary.main" : "transparent",
                bgcolor: isActive
                  ? isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.05)
                  : "transparent",
                transition: "all 0.18s",
                "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "primary.main" : "text.secondary",
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {v.name}
                </Typography>
                {v.isBaseline && (
                  <Chip label="base" size="small" sx={{ height: 14, fontSize: "0.55rem", fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.15), color: "primary.main" }} />
                )}
                {isActive && (
                  <>
                    <Tooltip title="Rename" arrow>
                      <IconButton size="small" onClick={(e) => openRename(e, v)}
                        sx={{ p: 0.15, color: "text.disabled", "&:hover": { color: "primary.main" } }}>
                        <DriveFileRenameOutline sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicate" arrow>
                      <IconButton size="small" onClick={(e) => handleDuplicate(e, v)}
                        sx={{ p: 0.15, color: "text.disabled", "&:hover": { color: "primary.main" } }}>
                        <ContentCopy sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
              {scores !== undefined && (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <ScoreBadge score={scores} label="M" />
                </Box>
              )}
            </Box>
          );
        })}

        {/* Add variation button */}
        <Tooltip title="Add variation (starts at 100)" arrow>
          <IconButton size="small" onClick={handleNewVariation} sx={{ mx: 0.5, flexShrink: 0 }}>
            <Add sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <TabContextMenu menu={menu} onClose={closeMenu} />

      {/* Inline rename dialog */}
      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>Rename Variation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus label="Variation name" size="small" fullWidth
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleRenameConfirm(); }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" onClick={() => setRenameOpen(false)}>Cancel</Button>
          <Button size="small" variant="contained" onClick={handleRenameConfirm} disabled={!renameValue.trim()}>
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
