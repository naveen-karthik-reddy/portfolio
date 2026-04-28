import { useRef, useState } from "react";
import {
  Box, Typography, Grid, Paper, IconButton, Tooltip,
  Button, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, TextField, Snackbar, Alert,
} from "@mui/material";
import {
  Add, Edit, Delete, FileDownload, FileUpload, SpeedOutlined, CheckCircleOutlined,
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useApp } from "../../context/useApp.js";
import { savePage, deletePage, saveVariation } from "../../lib/db.js";
import { downloadPageAsJSON, parseImportFile } from "../../lib/exportImport.js";
import { BLANK_INPUTS } from "../../lib/defaults.js";
import { computeMetrics, computeScores, scoreColor, PROFILES } from "../../lib/calculator.js";

function makeDefaultVariation(pageId) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    pageId,
    name: "Current",
    isBaseline: true,
    locked: {},
    inputs: { ...BLANK_INPUTS },
    resources: [],
    createdAt: now,
    updatedAt: now,
  };
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function ScoreRing({ score, color }) {
  const radius = 26;
  const stroke = 4;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Box sx={{ position: "relative", width: radius * 2, height: radius * 2, flexShrink: 0 }}>
      <svg width={radius * 2} height={radius * 2} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={radius} cy={radius} r={normalizedRadius} fill="none" stroke="currentColor"
          strokeWidth={stroke} style={{ color: "rgba(128,128,128,0.15)" }} />
        <circle cx={radius} cy={radius} r={normalizedRadius} fill="none" stroke={color}
          strokeWidth={stroke} strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", lineHeight: 1, color }}>{score}</Typography>
      </Box>
    </Box>
  );
}

export default function PageManager({ onClose }) {
  const { state, dispatch } = useApp();
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const importRef = useRef(null);

  const { pages, variations, activePageId, settings } = state;

  const [nameDialog, setNameDialog] = useState({ open: false, mode: "create", page: null, value: "" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, page: null });
  const [importError, setImportError] = useState("");

  function openNewPage() {
    setNameDialog({ open: true, mode: "create", page: null, value: "New Page" });
  }

  function openRename(e, page) {
    e.stopPropagation();
    setNameDialog({ open: true, mode: "rename", page, value: page.name });
  }

  function handleNameConfirm() {
    const name = nameDialog.value.trim();
    if (!name) return;
    if (nameDialog.mode === "create") {
      const now = new Date().toISOString();
      const page = { id: crypto.randomUUID(), name, createdAt: now, updatedAt: now };
      const variation = makeDefaultVariation(page.id);
      savePage(page);
      saveVariation(variation);
      dispatch({ type: "PAGE_CREATED", payload: page });
      dispatch({ type: "VARIATION_CREATED", payload: variation });
      dispatch({ type: "SET_ACTIVE_PAGE", payload: { pageId: page.id, variationId: variation.id } });
      setNameDialog({ ...nameDialog, open: false });
      onClose();
    } else {
      const page = nameDialog.page;
      if (name !== page.name) {
        const now = new Date().toISOString();
        dispatch({ type: "PAGE_RENAMED", payload: { id: page.id, name, updatedAt: now } });
        savePage({ ...page, name, updatedAt: now });
      }
      setNameDialog({ ...nameDialog, open: false });
    }
  }

  function openDelete(e, page) {
    e.stopPropagation();
    setDeleteDialog({ open: true, page });
  }

  function handleDeleteConfirm() {
    const page = deleteDialog.page;
    deletePage(page.id);
    dispatch({ type: "PAGE_DELETED", payload: { id: page.id } });
    setDeleteDialog({ open: false, page: null });
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const { page, variations: imported } = await parseImportFile(file);
      await savePage(page);
      await Promise.all(imported.map((v) => saveVariation(v)));
      dispatch({ type: "PAGE_IMPORTED", payload: { page, variations: imported } });
      onClose();
    } catch (err) {
      setImportError("Import failed: " + (err.message ?? "Invalid file"));
    }
  }

  function handleExport(e, page) {
    e.stopPropagation();
    const pageVars = variations.filter((v) => v.pageId === page.id);
    downloadPageAsJSON(page, pageVars);
  }

  function handleActivate(page) {
    const pageVars = variations.filter((v) => v.pageId === page.id);
    const baseline = pageVars.find((v) => v.isBaseline) ?? pageVars[0] ?? null;
    dispatch({ type: "SET_ACTIVE_PAGE", payload: { pageId: page.id, variationId: baseline?.id ?? null } });
    onClose();
  }

  // Shared dialogs rendered in both views
  const dialogs = (
    <>
      <input ref={importRef} type="file" accept=".json" hidden onChange={handleImport} />

      <Dialog open={nameDialog.open} onClose={() => setNameDialog({ ...nameDialog, open: false })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
          {nameDialog.mode === "create" ? "New Page" : "Rename Page"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus label="Page name" size="small" fullWidth
            value={nameDialog.value}
            onChange={(e) => setNameDialog({ ...nameDialog, value: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") handleNameConfirm(); }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" onClick={() => setNameDialog({ ...nameDialog, open: false })}>Cancel</Button>
          <Button size="small" variant="contained" onClick={handleNameConfirm} disabled={!nameDialog.value.trim()}>
            {nameDialog.mode === "create" ? "Create" : "Rename"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, page: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>Delete Page</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete <strong>{deleteDialog.page?.name}</strong> and all its variations? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" onClick={() => setDeleteDialog({ open: false, page: null })}>Cancel</Button>
          <Button size="small" variant="contained" color="error" onClick={handleDeleteConfirm}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!importError} autoHideDuration={5000} onClose={() => setImportError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="error" onClose={() => setImportError("")} sx={{ width: "100%" }}>
          {importError}
        </Alert>
      </Snackbar>
    </>
  );

  /* ── Empty state ── */
  if (pages.length === 0) {
    return (
      <Box sx={{ minHeight: "calc(100vh - 130px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 3 }}>
        {dialogs}
        <Box sx={{
          width: 80, height: 80, borderRadius: "50%",
          bgcolor: isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center", mb: 3,
        }}>
          <SpeedOutlined sx={{ fontSize: 36, color: "primary.main" }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.01em" }}>
          Web Performance Planner
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: "center", maxWidth: 380 }}>
          Simulate Lighthouse scores by tweaking resources, protocols, and rendering strategies — before writing a single line of code.
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
          <Button variant="outlined" startIcon={<FileUpload />} onClick={() => importRef.current?.click()} sx={{ borderRadius: 2 }}>
            Import Page
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={openNewPage} sx={{ borderRadius: 2 }}>
            Create First Page
          </Button>
        </Box>
      </Box>
    );
  }

  /* ── Page list ── */
  return (
    <Box sx={{ minHeight: "calc(100vh - 130px)", display: "flex", flexDirection: "column" }}>
      {dialogs}

      {/* Header */}
      <Box sx={{
        pt: 5, pb: 4, px: 3, textAlign: "center",
        borderBottom: 1, borderColor: "divider",
        background: isDark
          ? "linear-gradient(160deg, rgba(99,102,241,0.06) 0%, transparent 60%)"
          : "linear-gradient(160deg, rgba(99,102,241,0.04) 0%, transparent 60%)",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.25, mb: 1 }}>
          <SpeedOutlined sx={{ fontSize: 28, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
            Web Performance Planner
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select a page to start editing, or create a new one.
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
          <Button size="small" variant="outlined" startIcon={<FileUpload sx={{ fontSize: 15 }} />}
            onClick={() => importRef.current?.click()} sx={{ fontSize: "0.78rem", borderRadius: 2 }}>
            Import Page
          </Button>
          <Button size="small" variant="contained" startIcon={<Add sx={{ fontSize: 15 }} />}
            onClick={openNewPage} sx={{ fontSize: "0.78rem", borderRadius: 2 }}>
            New Page
          </Button>
        </Box>
      </Box>

      {/* Cards grid */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 4, px: { xs: 2, sm: 4 } }}>
        <Box sx={{ maxWidth: 960, mx: "auto" }}>
          <Grid container spacing={2.5}>
            {pages.map((page) => {
              const pageVars = variations.filter((v) => v.pageId === page.id);
              const baseline = pageVars.find((v) => v.isBaseline) ?? pageVars[0] ?? null;
              const isActive = page.id === activePageId;

              const mobileScore  = baseline ? computeScores(computeMetrics(baseline.inputs, PROFILES.mobile),  settings).overall : null;
              const desktopScore = baseline ? computeScores(computeMetrics(baseline.inputs, PROFILES.desktop), settings).overall : null;
              const col = mobileScore !== null ? scoreColor(mobileScore) : "#9ca3af";

              return (
                <Grid item xs={12} sm={6} md={4} key={page.id}>
                  <Paper
                    elevation={0}
                    onClick={() => handleActivate(page)}
                    sx={{
                      border: "1.5px solid",
                      borderColor: isActive ? "primary.main" : "divider",
                      borderRadius: 3, overflow: "hidden", cursor: "pointer",
                      transition: "transform 0.18s, box-shadow 0.18s, border-color 0.18s",
                      boxShadow: isActive
                        ? `0 0 0 1px ${theme.palette.primary.main}22, 0 4px 20px ${theme.palette.primary.main}18`
                        : "0 1px 4px rgba(0,0,0,0.06)",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: isActive
                          ? `0 0 0 1px ${theme.palette.primary.main}44, 0 8px 28px ${theme.palette.primary.main}22`
                          : isDark ? "0 8px 28px rgba(0,0,0,0.35)" : "0 8px 28px rgba(0,0,0,0.12)",
                        borderColor: isActive ? "primary.main" : alpha(theme.palette.primary.main, 0.4),
                      },
                    }}
                  >
                    <Box sx={{ height: 3, background: `linear-gradient(90deg, ${col}, ${alpha(col, 0.3)})` }} />
                    <Box sx={{ p: 2.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        {mobileScore !== null
                          ? <ScoreRing score={mobileScore} color={col} />
                          : <Box sx={{ width: 52, height: 52, borderRadius: "50%", bgcolor: "action.hover", flexShrink: 0 }} />
                        }
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {page.name}
                            </Typography>
                            {isActive && <CheckCircleOutlined sx={{ fontSize: 15, color: "primary.main", flexShrink: 0 }} />}
                          </Box>
                          <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.67rem" }}>
                            {pageVars.length} variation{pageVars.length !== 1 ? "s" : ""}
                            {desktopScore !== null && (
                              <> · Desktop&nbsp;<span style={{ color: scoreColor(desktopScore), fontWeight: 700 }}>{desktopScore}</span></>
                            )}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="caption" sx={{ display: "block", fontSize: "0.65rem", color: "text.disabled", mb: 2, pl: 0.25 }}>
                        Last updated {formatDate(page.updatedAt)}
                      </Typography>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button size="small" variant={isActive ? "contained" : "outlined"}
                          onClick={() => handleActivate(page)}
                          sx={{ fontSize: "0.68rem", py: 0.4, flex: 1, borderRadius: 1.5 }}>
                          {isActive ? "Currently open" : "Open"}
                        </Button>
                        <Tooltip title="Rename" arrow>
                          <IconButton size="small" onClick={(e) => openRename(e, page)} sx={{ color: "text.secondary" }}>
                            <Edit sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Export as JSON" arrow>
                          <IconButton size="small" onClick={(e) => handleExport(e, page)} sx={{ color: "text.secondary" }}>
                            <FileDownload sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                          <IconButton size="small" onClick={(e) => openDelete(e, page)} sx={{ color: "error.main" }}>
                            <Delete sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
