import {
  Box, Typography, Select, MenuItem, FormControl, Button, IconButton,
  Tooltip, Divider, Chip,
} from "@mui/material";
import { LayersOutlined, Compare, Settings, MenuBookOutlined, Science } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { useApp } from "../../context/useApp.js";

export default function TopBar({ onPagesOpen, onSettingsOpen, onCalibrationOpen, simMobileScore, simDesktopScore }) {
  const { state, dispatch } = useApp();
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { pages, variations, activePageId, comparisonMode } = state;
  const activePage = pages.find((p) => p.id === activePageId);

  function handlePageChange(pageId) {
    const baseline = variations.find((v) => v.pageId === pageId && v.isBaseline)
      ?? variations.find((v) => v.pageId === pageId);
    dispatch({ type: "SET_ACTIVE_PAGE", payload: { pageId, variationId: baseline?.id ?? null } });
  }

  return (
    <Box sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 2,
      py: 1,
      borderBottom: 1,
      borderColor: "divider",
      bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
      flexWrap: "wrap",
      flexShrink: 0,
    }}>
      {/* App title */}
      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
        Perf Planner
      </Typography>

      <Divider orientation="vertical" flexItem />

      {/* Page quick-switcher */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select
          value={activePageId ?? ""}
          onChange={(e) => handlePageChange(e.target.value)}
          sx={{ fontSize: "0.8rem", "& .MuiSelect-select": { py: "4px" } }}
          displayEmpty
        >
          {pages.map((p) => (
            <MenuItem key={p.id} value={p.id} sx={{ fontSize: "0.82rem" }}>{p.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Manage pages button */}
      <Tooltip title="Manage pages" arrow>
        <Button
          size="small"
          startIcon={<LayersOutlined sx={{ fontSize: 15 }} />}
          onClick={onPagesOpen}
          sx={{ fontSize: "0.72rem", py: 0.3, color: "text.secondary" }}
        >
          Pages
        </Button>
      </Tooltip>

      <Box sx={{ flex: 1 }} />

      {activePage && (
        <>
          {/* Calibration delta chip — only when this page has a calibrated baseline.
              Compares against the dashboard side that matches calibration.formFactor. */}
          {activePage.calibration && (() => {
            const calFf = activePage.calibration.formFactor === "desktop" ? "desktop" : "mobile";
            const sim = calFf === "desktop" ? simDesktopScore : simMobileScore;
            if (sim == null) return null;
            const delta = sim - activePage.calibration.realScore;
            const abs = Math.abs(delta);
            const color = abs <= 1 ? "success" : abs <= 5 ? "warning" : "error";
            const ffLabel = calFf === "desktop" ? "Desktop" : "Mobile";
            return (
              <Tooltip title={`${ffLabel} simulated ${sim} vs real ${activePage.calibration.realScore} — click to recalibrate`} arrow>
                <Chip
                  size="small"
                  color={color}
                  icon={<Science sx={{ fontSize: 14 }} />}
                  label={`${ffLabel.slice(0, 3)} Δ ${delta >= 0 ? "+" : ""}${delta}`}
                  onClick={() => onCalibrationOpen?.("recalibrate", activePage.id)}
                  sx={{ fontWeight: 700, cursor: "pointer" }}
                />
              </Tooltip>
            );
          })()}

          {/* Compare button */}
          <Button
            size="small"
            variant={comparisonMode ? "contained" : "outlined"}
            startIcon={<Compare sx={{ fontSize: 14 }} />}
            onClick={() => dispatch({ type: comparisonMode ? "COMPARISON_CLOSED" : "COMPARISON_OPENED" })}
            sx={{ fontSize: "0.72rem", py: 0.25 }}
          >
            Compare
          </Button>

          {/* Settings */}
          <Tooltip title="Simulation settings" arrow>
            <IconButton size="small" onClick={onSettingsOpen}><Settings sx={{ fontSize: 17 }} /></IconButton>
          </Tooltip>
        </>
      )}

      {/* Article guide link */}
      <Tooltip title="Read the guide" arrow>
        <IconButton
          size="small"
          component={Link}
          to="/articles/web-performance-planner"
          sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
        >
          <MenuBookOutlined sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
