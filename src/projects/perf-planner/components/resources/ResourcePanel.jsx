import { useMemo, useState } from "react";
import {
  Box, Typography, IconButton, Chip, Tooltip, Button,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useApp } from "../../context/useApp.js";
import { computeMetrics, computeScores, computeResourceWaterfall, PROFILES } from "../../lib/calculator.js";
import ResourceDialog from "./ResourceDialog.jsx";

const TYPE_COLORS = {
  html:  "#0ea5e9",
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

function TypeTile({ type }) {
  const color = TYPE_COLORS[type] ?? "#6b7280";
  return (
    <Box sx={{
      width: 26, height: 26, flexShrink: 0,
      borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center",
      bgcolor: alpha(color, 0.18),
      color, fontWeight: 800, fontSize: "0.6rem", letterSpacing: "0.04em",
    }}>
      {type === "image" ? "IMG" : type === "video" ? "VID" : type.toUpperCase().slice(0, 3)}
    </Box>
  );
}

function FlagChip({ label, color }) {
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center",
      px: 0.5, height: 14, borderRadius: 0.75,
      bgcolor: alpha(color, 0.15), color,
      fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.04em",
    }}>{label}</Box>
  );
}

function PhaseTag({ phase }) {
  const map = {
    blocking: { label: "BLOCK", color: "#ef4444" },
    lcp:      { label: "LCP",   color: "#ffa400" },
    deferred: { label: "DEFER", color: "#6b7280" },
    lazy:     { label: "LAZY",  color: "#6b7280" },
  };
  const cfg = map[phase];
  if (!cfg) return null;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center",
      px: 0.5, height: 14, borderRadius: 0.75,
      bgcolor: alpha(cfg.color, 0.12), color: cfg.color,
      fontSize: "0.52rem", fontWeight: 800, letterSpacing: "0.05em",
    }}>{cfg.label}</Box>
  );
}

function ResourceRow({ r, isDark, maxSize, onEdit, onDelete, deleteImpact, phase }) {
  const color = TYPE_COLORS[r.type] ?? "#6b7280";
  const sizeRatio = maxSize > 0 ? Math.min(1, (r.sizeKB ?? 0) / maxSize) : 0;

  const flags = [];
  if (r.inline) flags.push({ label: "INLINE", color: "#8b5cf6" });
  if (r.fetchpriority) flags.push({ label: "FP", color: "#0ea5e9" });
  if (r.missingDimensions) flags.push({ label: "DIMS?", color: "#ff4e42" });
  if (r.type === "font" && r.fontDisplay && r.fontDisplay !== "optional") {
    flags.push({ label: r.fontDisplay.toUpperCase(), color: "#f59e0b" });
  }

  return (
    <Box
      sx={{
        display: "flex", alignItems: "center", gap: 1,
        px: 1.5, py: 0.65,
        borderBottom: 1, borderColor: "divider",
        "&:hover .row-actions": { opacity: 1 },
        "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" },
        transition: "background 0.1s",
      }}
    >
      <TypeTile type={r.type} />

      {/* Name + meta */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
          <Typography variant="caption" sx={{
            fontWeight: 700, fontSize: "0.74rem", color: "text.primary",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {r.name}
            {r.count > 1 && <span style={{ color: "#888", marginLeft: 4, fontWeight: 500 }}>×{r.count}</span>}
          </Typography>
          <PhaseTag phase={phase} />
          {flags.map((f) => <FlagChip key={f.label} label={f.label} color={f.color} />)}
        </Box>
        <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "text.disabled" }}>
          {r.source} · {r.sizeKB} KB
          {r.type === "image" && r.imageFormat ? ` · ${r.imageFormat}` : ""}
          {r.type === "js" && r.execTimeMs > 0 ? ` · ${r.execTimeMs}ms exec` : ""}
        </Typography>
      </Box>

      {/* Size bar */}
      <Box sx={{ width: 48, height: 4, borderRadius: 2, bgcolor: alpha(color, 0.12), overflow: "hidden", flexShrink: 0 }}>
        <Box sx={{ width: `${sizeRatio * 100}%`, height: "100%", bgcolor: color, transition: "width 0.3s" }} />
      </Box>

      {/* Loading chip */}
      <Chip
        label={r.loading}
        size="small"
        color={LOADING_COLORS[r.loading] ?? "default"}
        sx={{ fontSize: "0.58rem", height: 16, "& .MuiChip-label": { px: 0.6 }, flexShrink: 0 }}
      />

      {/* Delete impact */}
      {deleteImpact > 0 && (
        <Tooltip title="Mobile score gain if removed" arrow>
          <Box sx={{
            px: 0.6, py: 0.1, borderRadius: 1, flexShrink: 0,
            bgcolor: "rgba(12,206,107,0.12)", color: "#0cce6b",
            fontSize: "0.58rem", fontWeight: 800, lineHeight: 1.6,
          }}>
            +{deleteImpact}
          </Box>
        </Tooltip>
      )}

      {/* Actions */}
      <Box className="row-actions" sx={{ display: "flex", gap: 0.25, opacity: 0, transition: "opacity 0.15s", flexShrink: 0 }}>
        <Tooltip title="Edit" arrow>
          <IconButton size="small" onClick={() => onEdit(r)} sx={{ p: 0.25 }}>
            <Edit sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" arrow>
          <IconButton size="small" onClick={() => onDelete(r.id)} sx={{ p: 0.25, color: "error.main" }}>
            <Delete sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default function ResourcePanel() {
  const { state, dispatch } = useApp();
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { variations, activeVariationId, pages, activePageId, settings } = state;
  const activeVariation = variations.find((v) => v.id === activeVariationId);
  const activePage      = pages?.find((p) => p.id === activePageId) ?? null;
  const calibration     = activePage?.calibration ?? null;
  const mobileProfile   = settings?.networkProfiles?.mobile ?? PROFILES.mobile;
  const effectiveSettings = useMemo(
    () => activePage?.scoringCurves
      ? { ...settings, scoringCurves: activePage.scoringCurves }
      : settings,
    [settings, activePage?.scoringCurves]
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState(null);

  // Sort resources by waterfall startMs (matches waterfall visual order)
  const sortedResources = useMemo(() => {
    const res = activeVariation?.resources ?? [];
    if (res.length === 0) return [];
    const wf = computeResourceWaterfall(res, activeVariation?.pageMeta ?? {}, mobileProfile, calibration);
    const orderMap = new Map(wf.rows.map((row, i) => [row.id, i]));
    const phaseMap = new Map(wf.rows.map((row) => [row.id, row.phase]));
    const sorted = [...res].sort((a, b) => {
      const ia = orderMap.has(a.id) ? orderMap.get(a.id) : 999;
      const ib = orderMap.has(b.id) ? orderMap.get(b.id) : 999;
      return ia - ib;
    });
    return sorted.map((r) => ({ ...r, _phase: phaseMap.get(r.id) ?? "deferred" }));
  }, [activeVariation, mobileProfile, calibration]);

  const deleteImpactMap = useMemo(() => {
    const res = activeVariation?.resources ?? [];
    if (res.length === 0) return {};
    const pageMeta = activeVariation?.pageMeta ?? {};
    const curScore = computeScores(
      computeMetrics(res, pageMeta, mobileProfile, calibration),
      effectiveSettings
    ).overall;
    const map = {};
    for (const r of res) {
      const without = res.filter((x) => x.id !== r.id);
      const hyp = computeScores(
        computeMetrics(without, pageMeta, mobileProfile, calibration),
        effectiveSettings
      ).overall;
      map[r.id] = Math.max(0, hyp - curScore);
    }
    return map;
  }, [activeVariation, mobileProfile, calibration, effectiveSettings]);

  if (!activeVariation) return null;

  const resources = activeVariation.resources ?? [];
  const totalSizeKB = resources.reduce((s, r) => s + (r.sizeKB ?? 0) * (r.count ?? 1), 0);
  const maxSize = resources.reduce((m, r) => Math.max(m, r.sizeKB ?? 0), 0);

  function handleSave(resource) {
    if (editing) {
      dispatch({ type: "RESOURCE_UPDATED", payload: { variationId: activeVariation.id, resource } });
    } else {
      dispatch({ type: "RESOURCE_ADDED", payload: { variationId: activeVariation.id, resource } });
    }
    setDialogOpen(false);
    setEditing(null);
  }

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
            Resources
          </Typography>
          {resources.length > 0 && (
            <Typography variant="caption" sx={{ ml: 1, color: "text.disabled", fontSize: "0.65rem" }}>
              {resources.length} files · {totalSizeKB.toFixed(0)} KB
            </Typography>
          )}
        </Box>
        <Button size="small" startIcon={<Add sx={{ fontSize: 14 }} />}
          onClick={() => { setEditing(null); setDialogOpen(true); }}
          sx={{ fontSize: "0.72rem", py: 0.25 }}>
          Add
        </Button>
      </Box>

      {resources.length === 0 ? (
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.7rem" }}>
            No resources. Click &quot;Add&quot; to list files individually.
          </Typography>
        </Box>
      ) : (
        sortedResources.map((r) => (
          <ResourceRow
            key={r.id}
            r={r}
            isDark={isDark}
            maxSize={maxSize}
            phase={r._phase}
            onEdit={(res) => { setEditing(res); setDialogOpen(true); }}
            onDelete={(id) => dispatch({ type: "RESOURCE_DELETED", payload: { variationId: activeVariation.id, resourceId: id } })}
            deleteImpact={deleteImpactMap[r.id] ?? 0}
          />
        ))
      )}

      <ResourceDialog
        open={dialogOpen}
        resource={editing}
        onSave={handleSave}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
      />
    </Box>
  );
}
