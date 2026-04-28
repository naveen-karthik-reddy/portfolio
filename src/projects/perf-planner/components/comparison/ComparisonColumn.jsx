import { Box, Typography, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { scoreColor } from "../../lib/calculator.js";
import ScoreGauge from "../dashboard/ScoreGauge.jsx";

function formatValue(key, value) {
  if (key === "cls") return value?.toFixed(3) ?? "—";
  if (value == null) return "—";
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
}

const METRIC_KEYS = ["fcp", "lcp", "tbt", "cls", "si", "tti"];

export default function ComparisonColumn({ page, variation, metrics, scores, bestMetrics, worstMetrics }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{
      flex: 1,
      border: 1,
      borderColor: "divider",
      borderRadius: 2,
      overflow: "hidden",
      minWidth: 160,
    }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1, bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.disabled", display: "block", fontSize: "0.65rem" }}>
          {page?.name ?? "Unknown Page"}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
          {variation?.name ?? "—"}
        </Typography>
        {variation?.isBaseline && (
          <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "primary.main", display: "block" }}>baseline</Typography>
        )}
      </Box>

      {/* Score gauges */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, py: 2 }}>
        <Box sx={{ textAlign: "center" }}>
          <ScoreGauge score={scores?.overall ?? 0} size={80} />
          <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "text.disabled" }}>Mobile</Typography>
        </Box>
      </Box>

      <Divider />

      {/* Metric rows */}
      {METRIC_KEYS.map((key) => {
        const value    = metrics?.[key];
        const isBest   = bestMetrics?.[key]  === value;
        const isWorst  = worstMetrics?.[key] === value;
        const score    = scores?.[key] ?? 0;
        const color    = scoreColor(score);

        return (
          <Box key={key} sx={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            px: 2, py: 0.6,
            bgcolor: isBest
              ? isDark ? "rgba(12,206,107,0.08)" : "rgba(12,206,107,0.06)"
              : isWorst
              ? isDark ? "rgba(255,78,66,0.08)"  : "rgba(255,78,66,0.06)"
              : "transparent",
            borderLeft: isBest ? "3px solid #0cce6b" : isWorst ? "3px solid #ff4e42" : "3px solid transparent",
          }}>
            <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, fontSize: "0.7rem" }}>
              {key.toUpperCase()}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color, fontSize: "0.75rem" }}>
              {formatValue(key, value)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
