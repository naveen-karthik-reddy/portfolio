import { useRef, useState } from "react";
import {
  Box, Typography, Grid, Paper, IconButton, Tooltip,
  Button, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, TextField, Snackbar, Alert, Chip,
} from "@mui/material";
import {
  Edit, Delete, FileDownload, FileUpload, SpeedOutlined, CheckCircle, Science,
  CalendarTodayOutlined, LayersOutlined,
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useApp } from "../../context/useApp.js";
import { savePage, deletePage, saveVariation } from "../../lib/db.js";
import { downloadPageAsJSON, parseImportFile } from "../../lib/exportImport.js";
import { computeMetrics, computeScores, scoreColor, PROFILES } from "../../lib/calculator.js";
import CalibrationPanel from "../calibration/CalibrationPanel.jsx";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function ScoreRing({ score, color, size = 56 }) {
  const radius = size / 2;
  const stroke = 4.5;
  const nr = radius - stroke;
  const circ = nr * 2 * Math.PI;
  const offset = circ - (score / 100) * circ;
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={radius} cy={radius} r={nr} fill="none" stroke="currentColor"
          strokeWidth={stroke} style={{ color: "rgba(128,128,128,0.12)" }} />
        <circle cx={radius} cy={radius} r={nr} fill="none" stroke={color}
          strokeWidth={stroke} strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.65s ease", filter: `drop-shadow(0 0 4px ${color}55)` }} />
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontWeight: 900, fontSize: "1rem", lineHeight: 1, color }}>{score}</Typography>
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

  const [renameDialog, setRenameDialog] = useState({ open: false, page: null, value: "" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, page: null });
  const [importError, setImportError] = useState("");
  const [calibration, setCalibration] = useState({ open: false, mode: "create", pageId: null });

  function openCalibrationCreate() {
    setCalibration({ open: true, mode: "create", pageId: null });
  }

  function openRecalibrate(e, page) {
    e.stopPropagation();
    setCalibration({ open: true, mode: "recalibrate", pageId: page.id });
  }

  function handleCalibrationClose() {
    setCalibration((c) => ({ ...c, open: false }));
    if (calibration.mode === "create") onClose();
  }

  function openRename(e, page) {
    e.stopPropagation();
    setRenameDialog({ open: true, page, value: page.name });
  }

  function handleRenameConfirm() {
    const name = renameDialog.value.trim();
    if (!name) return;
    const page = renameDialog.page;
    if (page && name !== page.name) {
      const now = new Date().toISOString();
      dispatch({ type: "PAGE_RENAMED", payload: { id: page.id, name, updatedAt: now } });
      savePage({ ...page, name, updatedAt: now });
    }
    setRenameDialog({ ...renameDialog, open: false });
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

  const dialogs = (
    <>
      <input ref={importRef} type="file" accept=".json" hidden onChange={handleImport} />

      <CalibrationPanel
        open={calibration.open}
        mode={calibration.mode}
        pageId={calibration.pageId}
        onClose={handleCalibrationClose}
      />

      <Dialog open={renameDialog.open} onClose={() => setRenameDialog({ ...renameDialog, open: false })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>Rename Page</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus label="Page name" size="small" fullWidth
            value={renameDialog.value}
            onChange={(e) => setRenameDialog({ ...renameDialog, value: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") handleRenameConfirm(); }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" onClick={() => setRenameDialog({ ...renameDialog, open: false })}>Cancel</Button>
          <Button size="small" variant="contained" onClick={handleRenameConfirm} disabled={!renameDialog.value.trim()}>
            Rename
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
          width: 88, height: 88, borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.04) 100%)"
            : "radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.03) 100%)",
          display: "flex", alignItems: "center", justifyContent: "center", mb: 3,
          boxShadow: `0 0 0 12px ${alpha("#6366f1", 0.06)}`,
        }}>
          <SpeedOutlined sx={{ fontSize: 38, color: "primary.main" }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.02em" }}>
          Web Performance Planner
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: "center", maxWidth: 420, lineHeight: 1.7 }}>
          Every page starts from a real Lighthouse run. Upload a JSON report — the simulator fits its curves to your real score so every what-if change becomes a meaningful prediction.
        </Typography>
        <Button variant="contained" startIcon={<Science />} onClick={openCalibrationCreate} sx={{ borderRadius: 2, px: 3 }}>
          Calibrate from Lighthouse
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5 }}>
          Resuming work?{" "}
          <Box
            component="span"
            onClick={() => importRef.current?.click()}
            sx={{ color: "primary.main", cursor: "pointer", textDecoration: "underline" }}
          >
            Import a saved session
          </Box>
        </Typography>
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
          ? "linear-gradient(160deg, rgba(99,102,241,0.07) 0%, transparent 60%)"
          : "linear-gradient(160deg, rgba(99,102,241,0.05) 0%, transparent 60%)",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.25, mb: 1 }}>
          <SpeedOutlined sx={{ fontSize: 26, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
            Web Performance Planner
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Click a page to open it, or calibrate a new one from a Lighthouse run.
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
          <Button size="small" variant="contained" startIcon={<Science sx={{ fontSize: 15 }} />}
            onClick={openCalibrationCreate} sx={{ fontSize: "0.78rem", borderRadius: 2 }}>
            Calibrate new page
          </Button>
          <Tooltip title="Restore a previously exported session" arrow>
            <Button size="small" variant="text" startIcon={<FileUpload sx={{ fontSize: 14 }} />}
              onClick={() => importRef.current?.click()}
              sx={{ fontSize: "0.75rem", color: "text.secondary", borderRadius: 2 }}>
              Import session
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Cards grid */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 4, px: { xs: 2, sm: 4 } }}>
        <Box sx={{ maxWidth: 960, mx: "auto" }}>
          <Grid container spacing={2.5}>
            {pages.map((page) => {
              const pageVars    = variations.filter((v) => v.pageId === page.id);
              const baseline    = pageVars.find((v) => v.isBaseline) ?? pageVars[0] ?? null;
              const isActive    = page.id === activePageId;

              const pageSettings  = page.scoringCurves ? { ...settings, scoringCurves: page.scoringCurves } : settings;
              const mobileScore   = baseline ? computeScores(computeMetrics(baseline.resources ?? [], baseline.pageMeta ?? {}, PROFILES.mobile,  page.calibration), pageSettings).overall : null;
              const desktopScore  = baseline ? computeScores(computeMetrics(baseline.resources ?? [], baseline.pageMeta ?? {}, PROFILES.desktop, page.calibration), pageSettings).overall : null;
              const col = mobileScore !== null ? scoreColor(mobileScore) : "#9ca3af";

              return (
                <Grid item xs={12} sm={6} md={4} key={page.id}>
                  <Paper
                    elevation={0}
                    onClick={() => handleActivate(page)}
                    sx={{
                      position: "relative",
                      border: "1.5px solid",
                      borderColor: isActive ? "primary.main" : "divider",
                      borderRadius: 3, overflow: "hidden", cursor: "pointer",
                      transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                      boxShadow: isActive
                        ? `0 0 0 1px ${alpha(theme.palette.primary.main, 0.18)}, 0 6px 24px ${alpha(theme.palette.primary.main, 0.14)}`
                        : isDark ? "0 1px 6px rgba(0,0,0,0.2)" : "0 1px 6px rgba(0,0,0,0.07)",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: isActive
                          ? `0 0 0 1px ${alpha(theme.palette.primary.main, 0.4)}, 0 12px 32px ${alpha(theme.palette.primary.main, 0.2)}`
                          : isDark ? "0 10px 32px rgba(0,0,0,0.4)" : "0 10px 32px rgba(0,0,0,0.13)",
                        borderColor: isActive ? "primary.main" : alpha(theme.palette.primary.main, 0.45),
                        "& .page-actions": { opacity: 1 },
                      },
                    }}
                  >
                    {/* Score colour bar */}
                    <Box sx={{ height: 3.5, background: `linear-gradient(90deg, ${col} 0%, ${alpha(col, 0.25)} 100%)` }} />

                    {/* Active badge */}
                    {isActive && (
                      <Box sx={{
                        position: "absolute", top: 12, right: 12,
                        display: "flex", alignItems: "center", gap: 0.5,
                        bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        borderRadius: 5, px: 0.9, py: 0.3,
                      }}>
                        <CheckCircle sx={{ fontSize: 11, color: "primary.main" }} />
                        <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, color: "primary.main", letterSpacing: "0.04em" }}>
                          OPEN
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ p: 2.5, pt: 2 }}>
                      {/* Score ring + name */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.25 }}>
                        {mobileScore !== null
                          ? <ScoreRing score={mobileScore} color={col} />
                          : <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "action.hover", flexShrink: 0 }} />
                        }
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{
                            fontWeight: 700, fontSize: "0.92rem", lineHeight: 1.35,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            pr: isActive ? 5 : 0,
                          }}>
                            {page.name}
                          </Typography>
                          {desktopScore !== null && (
                            <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.67rem" }}>
                              Mobile&nbsp;<span style={{ color: col, fontWeight: 800 }}>{mobileScore}</span>
                              &ensp;Desktop&nbsp;<span style={{ color: scoreColor(desktopScore), fontWeight: 800 }}>{desktopScore}</span>
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Meta chips */}
                      <Box sx={{ display: "flex", gap: 0.75, mb: 2, flexWrap: "wrap" }}>
                        <Chip
                          icon={<LayersOutlined sx={{ fontSize: "11px !important" }} />}
                          label={`${pageVars.length} variation${pageVars.length !== 1 ? "s" : ""}`}
                          size="small"
                          sx={{ fontSize: "0.62rem", height: 20, bgcolor: "action.hover", "& .MuiChip-label": { px: 0.75 } }}
                        />
                        <Chip
                          icon={<CalendarTodayOutlined sx={{ fontSize: "11px !important" }} />}
                          label={formatDate(page.updatedAt)}
                          size="small"
                          sx={{ fontSize: "0.62rem", height: 20, bgcolor: "action.hover", "& .MuiChip-label": { px: 0.75 } }}
                        />
                      </Box>

                      {/* Action icons */}
                      <Box
                        className="page-actions"
                        sx={{
                          display: "flex", alignItems: "center", justifyContent: "flex-end",
                          gap: 0.25, pt: 1.5, borderTop: "1px solid", borderColor: "divider",
                          opacity: 0.55,
                          transition: "opacity 0.15s",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip title="Recalibrate from Lighthouse" arrow>
                          <IconButton size="small" onClick={(e) => openRecalibrate(e, page)}
                            sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                            <Science sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rename" arrow>
                          <IconButton size="small" onClick={(e) => openRename(e, page)}
                            sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                            <Edit sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Export as JSON" arrow>
                          <IconButton size="small" onClick={(e) => handleExport(e, page)}
                            sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                            <FileDownload sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                          <IconButton size="small" onClick={(e) => openDelete(e, page)}
                            sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}>
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
