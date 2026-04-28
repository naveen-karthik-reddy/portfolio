import { createPortal } from "react-dom";
import { useRef, useState } from "react";
import {
  Box, MenuItem, Typography, Divider,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useApp } from "../../context/useApp.js";
import { saveVariation, deleteVariation } from "../../lib/db.js";

export default function TabContextMenu({ menu, onClose }) {
  const { state, dispatch } = useApp();
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Keep a stable ref to the variation so dialogs still work after menu closes
  const variationRef = useRef(null);
  if (menu) {
    const v = state.variations.find((vr) => vr.id === menu.variationId);
    if (v) variationRef.current = v;
  }
  const variation = variationRef.current;

  // Nothing to render at all
  if (!menu && !renameOpen && !deleteOpen) return null;
  if (!variation) return null;

  function handleRenameClick() {
    setRenameValue(variation.name);
    setRenameOpen(true);
    onClose(); // close context menu; dialog stays via portal
  }

  function handleRenameConfirm() {
    const name = renameValue.trim();
    if (name && name !== variation.name) {
      const now = new Date().toISOString();
      dispatch({ type: "VARIATION_RENAMED", payload: { id: variation.id, name, updatedAt: now } });
      saveVariation({ ...variation, name, updatedAt: now });
    }
    setRenameOpen(false);
  }

  function handleDeleteClick() {
    setDeleteOpen(true);
    onClose(); // close context menu; confirmation dialog stays
  }

  function handleDeleteConfirm() {
    deleteVariation(variation.id);
    dispatch({ type: "VARIATION_DELETED", payload: { id: variation.id } });
    setDeleteOpen(false);
  }

  function handleDuplicate() {
    const now = new Date().toISOString();
    const copy = {
      ...variation,
      id: crypto.randomUUID(),
      name: `${variation.name} Copy`,
      isBaseline: false,
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: "VARIATION_DUPLICATED", payload: copy });
    saveVariation(copy);
    dispatch({ type: "SET_ACTIVE_VARIATION", payload: { id: copy.id } });
    onClose();
  }

  function handleSetBaseline() {
    const now = new Date().toISOString();
    const siblings = state.variations.filter((v) => v.pageId === variation.pageId);
    siblings.forEach((v) => {
      const updated = { ...v, isBaseline: v.id === variation.id, updatedAt: now };
      saveVariation(updated);
    });
    dispatch({ type: "VARIATION_SET_BASELINE", payload: { pageId: variation.pageId, variationId: variation.id } });
    onClose();
  }

  const content = (
    <>
      {/* Context menu box — only when menu position is known */}
      {menu && (
        <Box
          sx={{
            position: "fixed",
            top: menu.y,
            left: menu.x,
            zIndex: 9999,
            minWidth: 180,
            bgcolor: isDark ? "#1e1e2e" : "#fff",
            border: 1,
            borderColor: "divider",
            borderRadius: 1.5,
            boxShadow: 8,
            py: 0.5,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Typography variant="caption" sx={{ px: 1.5, py: 0.5, display: "block", color: "text.disabled", fontSize: "0.65rem" }}>
            {variation.name}
          </Typography>
          <Divider sx={{ mb: 0.5 }} />
          <MenuItem dense onClick={handleRenameClick} sx={{ fontSize: "0.8rem" }}>Rename</MenuItem>
          <MenuItem dense onClick={handleDuplicate} sx={{ fontSize: "0.8rem" }}>Duplicate</MenuItem>
          <MenuItem dense onClick={handleSetBaseline} sx={{ fontSize: "0.8rem" }} disabled={variation.isBaseline}>
            Set as Baseline
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem dense onClick={handleDeleteClick} sx={{ fontSize: "0.8rem", color: "error.main" }}>Delete</MenuItem>
        </Box>
      )}

      {/* Rename dialog */}
      <Dialog
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>Rename Variation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Variation name"
            size="small"
            fullWidth
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleRenameConfirm(); }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" onClick={() => setRenameOpen(false)}>Cancel</Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleRenameConfirm}
            disabled={!renameValue.trim()}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>Delete Variation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete <strong>{variation.name}</strong>? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button size="small" variant="contained" color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  return createPortal(content, document.body);
}
