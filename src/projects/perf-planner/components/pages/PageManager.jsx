import { useRef, useState } from "react";
import {
  Box, Typography, Paper, IconButton, Tooltip,
  Button, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, TextField, Snackbar, Alert, Chip, keyframes,
} from "@mui/material";
import {
  Edit, Delete, FileDownload, FileUpload, SpeedOutlined, Science,
  CalendarTodayOutlined, LayersOutlined, CheckCircleOutline,
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

function ScoreRing({ score, color, size = 52 }) {
  const radius = size / 2;
  const stroke = 4;
  const nr = radius - stroke;
  const circ = nr * 2 * Math.PI;
  const offset = circ - (score / 100) * circ;
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={radius} cy={radius} r={nr} fill="none" stroke="currentColor"
          strokeWidth={stroke} style={{ color: "rgba(128,128,128,0.1)" }} />
        <circle cx={radius} cy={radius} r={nr} fill="none" stroke={color}
          strokeWidth={stroke} strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.65s ease", filter: `drop-shadow(0 0 5px ${color}44)` }} />
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontWeight: 900, fontSize: "0.95rem", lineHeight: 1, color }}>{score}</Typography>
      </Box>
    </Box>
  );
}

function ScorePill({ label, score, color }) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 0.75,
      px: 1.25, py: 0.4, borderRadius: 1.5,
      bgcolor: alpha(color, 0.08), border: `1px solid ${alpha(color, 0.2)}`,
    }}>
      <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, color: "text.secondary", letterSpacing: "0.03em" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color, lineHeight: 1 }}>
        {score !== null ? score : "—"}
      </Typography>
    </Box>
  );
}

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const cardAppear = keyframes`
  from { opacity: 0; transform: scale(0.96) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
`;

export default function PageManager({ onClose }) {
  const { state, dispatch } = useApp();
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const importRef = useRef(null);

  const { pages, variations, settings } = state;

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
      <Box sx={{ minHeight: "calc(100vh - 130px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 3, py: 6 }}>
        {dialogs}

        {/* Hero icon */}
        <Box sx={{
          width: 96, height: 96, borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 100%)"
            : "radial-gradient(circle, rgba(99,102,241,0.14) 0%, rgba(99,102,241,0.03) 100%)",
          display: "flex", alignItems: "center", justifyContent: "center", mb: 3.5,
          boxShadow: `0 0 0 14px ${alpha("#6366f1", 0.07)}`,
          animation: `${fadeInUp} 0.6s ease both`,
        }}>
          <SpeedOutlined sx={{ fontSize: 42, color: "primary.main" }} />
        </Box>

        {/* Title + description */}
        <Typography variant="h5" sx={{
          fontWeight: 900, mb: 1.5, letterSpacing: "-0.03em",
          animation: `${fadeInUp} 0.6s 0.1s ease both`,
        }}>
          Web Performance Planner
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{
          mb: 1, textAlign: "center", maxWidth: 500, lineHeight: 1.7,
          animation: `${fadeInUp} 0.6s 0.2s ease both`,
        }}>
          Simulate Core Web Vitals changes before deploying to production.
          Upload a Lighthouse JSON report — the simulator fits its scoring curves
          to your real score so every what-if change becomes a calibrated prediction.
        </Typography>

        {/* Primary CTA */}
        <Box sx={{ animation: `${fadeInUp} 0.6s 0.3s ease both`, mb: 5 }}>
          <Button
            variant="contained" size="large"
            startIcon={<Science />}
            onClick={openCalibrationCreate}
            sx={{ borderRadius: 2, px: 4, py: 1.25, fontSize: "0.9rem", fontWeight: 700 }}
          >
            Calibrate from Lighthouse
          </Button>
        </Box>

        {/* Feature cards */}
        <Box sx={{
          display: "flex", gap: 2, maxWidth: 750, width: "100%", flexWrap: "wrap", justifyContent: "center",
        }}>
          {[
            {
              icon: <FileUpload sx={{ fontSize: 22 }} />,
              title: "Import Lighthouse JSON",
              desc: "Upload a real Lighthouse report to calibrate the simulator's scoring curves to your actual performance.",
              delay: "0.4s",
            },
            {
              icon: <LayersOutlined sx={{ fontSize: 22 }} />,
              title: "Simulate What-If Changes",
              desc: "Adjust resources, TTFB, and CDN settings — watch Core Web Vitals scores update in real time.",
              delay: "0.5s",
            },
          ].map((card) => (
            <Box key={card.title} sx={{
              flex: "1 1 200px", minWidth: 200, maxWidth: 300,
              p: 2.5, borderRadius: 2.5,
              border: "1px solid", borderColor: "divider",
              bgcolor: isDark ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.background.paper, 0.7),
              transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
              animation: `${fadeInUp} 0.6s ${card.delay} ease both`,
              "&:hover": {
                transform: "translateY(-3px)",
                borderColor: alpha(theme.palette.primary.main, 0.35),
                boxShadow: isDark
                  ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.08)}`
                  : `0 8px 24px ${alpha(theme.palette.primary.main, 0.06)}`,
              },
            }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: 1.5,
                display: "flex", alignItems: "center", justifyContent: "center",
                bgcolor: isDark ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.main, 0.08),
                color: "primary.main", mb: 1.5,
              }}>
                {card.icon}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", mb: 0.5 }}>
                {card.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {card.desc}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Import link */}
        <Typography variant="caption" color="text.secondary" sx={{
          mt: 4,
          animation: `${fadeInUp} 0.6s 0.7s ease both`,
        }}>
          Already have a session?{" "}
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
        pt: 6, pb: 5, px: 3, textAlign: "center",
        borderBottom: 1, borderColor: "divider",
        background: isDark
          ? "linear-gradient(160deg, rgba(99,102,241,0.08) 0%, transparent 60%)"
          : "linear-gradient(160deg, rgba(99,102,241,0.06) 0%, transparent 60%)",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.25, mb: 1.25 }}>
          <SpeedOutlined sx={{ fontSize: 28, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
            Web Performance Planner
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, maxWidth: 420, mx: "auto", lineHeight: 1.65 }}>
          Open a page to inspect its dashboard, or calibrate a new one from a Lighthouse report to start simulating.
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
      <Box sx={{ flex: 1, overflowY: "auto", py: 4, px: { xs: 2, sm: 3 } }}>
        <Box sx={{
          maxWidth: 960, mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" },
          gap: 2,
        }}>
          {pages.map((page, i) => {
            const pageVars   = variations.filter((v) => v.pageId === page.id);
            const baseline   = pageVars.find((v) => v.isBaseline) ?? pageVars[0] ?? null;

            const pageSettings = page.scoringCurves ? { ...settings, scoringCurves: page.scoringCurves } : settings;
            const mobileScore  = baseline ? computeScores(computeMetrics(baseline.resources ?? [], baseline.pageMeta ?? {}, PROFILES.mobile,  page.calibration), pageSettings).overall : null;
            const desktopScore = baseline ? computeScores(computeMetrics(baseline.resources ?? [], baseline.pageMeta ?? {}, PROFILES.desktop, page.calibration), pageSettings).overall : null;
            const col     = mobileScore  !== null ? scoreColor(mobileScore)  : "#9ca3af";
            const deskCol = desktopScore !== null ? scoreColor(desktopScore) : "#9ca3af";

            const isCalibrated = !!page.calibration;

            return (
              <Paper
                key={page.id}
                elevation={0}
                onClick={() => handleActivate(page)}
                sx={{
                  display: "flex", flexDirection: "column",
                  border: "1px solid", borderColor: "divider",
                  borderRadius: 2.5, overflow: "hidden", cursor: "pointer",
                  bgcolor: "background.paper",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                  animation: `${cardAppear} 0.4s ${i * 0.06}s ease both`,
                  boxShadow: isDark ? "0 1px 8px rgba(0,0,0,0.2)" : "0 1px 4px rgba(0,0,0,0.05)",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: alpha(col, 0.4),
                    boxShadow: isDark
                      ? `0 10px 32px rgba(0,0,0,0.38), 0 0 0 1px ${alpha(col, 0.1)}`
                      : `0 10px 32px rgba(0,0,0,0.09), 0 0 0 1px ${alpha(col, 0.06)}`,
                  },
                }}
              >
                {/* Accent bar */}
                <Box sx={{
                  height: 4, flexShrink: 0,
                  background: `linear-gradient(90deg, ${col}, ${alpha(col, 0.3)})`,
                }} />

                <Box sx={{ p: 2.25, display: "flex", flexDirection: "column", flex: 1, gap: 1.75 }}>
                  {/* Name + calibration badge */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                    <Tooltip title={page.name} placement="top" disableInteractive enterDelay={500}>
                      <Typography sx={{
                        fontWeight: 800, fontSize: "0.82rem", lineHeight: 1.3, letterSpacing: "-0.01em",
                        overflow: "hidden", textOverflow: "ellipsis",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      }}>
                        {page.name}
                      </Typography>
                    </Tooltip>
                    {isCalibrated && (
                      <Chip
                        icon={<CheckCircleOutline sx={{ fontSize: "11px !important" }} />}
                        label="Calibrated"
                        size="small"
                        sx={{
                          fontSize: "0.58rem", height: 20, fontWeight: 600, flexShrink: 0,
                          bgcolor: alpha("#22c55e", 0.1), color: "#22c55e",
                          border: `1px solid ${alpha("#22c55e", 0.25)}`,
                          "& .MuiChip-label": { px: 0.6 },
                          "& .MuiChip-icon": { ml: 0.4 },
                        }}
                      />
                    )}
                  </Box>

                  {/* Score section */}
                  <Box sx={{
                    display: "flex", alignItems: "center", gap: 2,
                    py: 1.5, px: 0.75,
                    borderRadius: 2,
                    bgcolor: isDark ? alpha(col, 0.04) : alpha(col, 0.03),
                  }}>
                    {mobileScore !== null
                      ? <ScoreRing score={mobileScore} color={col} size={52} />
                      : <Box sx={{
                          width: 52, height: 52, borderRadius: "50%",
                          bgcolor: "action.hover", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Typography sx={{ fontSize: "0.6rem", color: "text.disabled", fontWeight: 700 }}>N/A</Typography>
                        </Box>
                    }
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, flex: 1 }}>
                      <ScorePill label="MOBILE" score={mobileScore} color={col} />
                      <ScorePill label="DESKTOP" score={desktopScore} color={deskCol} />
                    </Box>
                  </Box>

                  {/* Meta row */}
                  <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                    <Chip
                      icon={<LayersOutlined sx={{ fontSize: "12px !important" }} />}
                      label={`${pageVars.length} ${pageVars.length === 1 ? "variation" : "variations"}`}
                      size="small"
                      sx={{
                        fontSize: "0.62rem", height: 22, fontWeight: 500,
                        bgcolor: "action.hover", color: "text.secondary",
                        "& .MuiChip-label": { px: 0.6 },
                      }}
                    />
                    <Chip
                      icon={<CalendarTodayOutlined sx={{ fontSize: "12px !important" }} />}
                      label={formatDate(page.updatedAt)}
                      size="small"
                      sx={{
                        fontSize: "0.62rem", height: 22, fontWeight: 500,
                        bgcolor: "action.hover", color: "text.secondary",
                        "& .MuiChip-label": { px: 0.6 },
                      }}
                    />
                  </Box>

                  {/* Actions */}
                  <Box
                    sx={{
                      display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.25,
                      pt: 1.25, mt: "auto",
                      borderTop: "1px solid", borderColor: "divider",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip title="Recalibrate from Lighthouse" arrow>
                      <IconButton size="small" onClick={(e) => openRecalibrate(e, page)}
                        sx={{ color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08) } }}>
                        <Science sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Rename" arrow>
                      <IconButton size="small" onClick={(e) => openRename(e, page)}
                        sx={{ color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08) } }}>
                        <Edit sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export as JSON" arrow>
                      <IconButton size="small" onClick={(e) => handleExport(e, page)}
                        sx={{ color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08) } }}>
                        <FileDownload sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                      <IconButton size="small" onClick={(e) => openDelete(e, page)}
                        sx={{ color: "text.secondary", "&:hover": { color: "error.main", bgcolor: alpha(theme.palette.error.main, 0.08) } }}>
                        <Delete sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
