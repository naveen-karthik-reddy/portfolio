import { Box, Typography } from "@mui/material";
import { TrendingDown, TrendingUp } from "@mui/icons-material";
import { scoreColor } from "../../lib/calculator.js";

function formatValue(key, value) {
  if (key === "cls") return value.toFixed(3);
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
}

function formatDelta(key, delta) {
  if (key === "cls") return Math.abs(delta).toFixed(3);
  const abs = Math.abs(delta);
  if (abs >= 1000) return `${(abs / 1000).toFixed(1)}s`;
  return `${Math.round(abs)}ms`;
}

export default function MetricRow({ metricKey, label, value, score, baselineValue, weight }) {
  const color = scoreColor(score);
  const hasDelta = baselineValue !== null && baselineValue !== undefined && Math.abs(value - baselineValue) > 0.5;
  const improved  = value < baselineValue; // lower is better for all metrics
  const delta     = value - baselineValue;

  const maxPts     = weight != null ? Math.round(weight * 100) : null;
  const earnedPts  = weight != null ? Math.round(score * weight) : null;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.4 }}>
      {/* Label */}
      <Typography variant="caption" sx={{ width: 32, color: "text.disabled", fontWeight: 700, flexShrink: 0 }}>
        {label}
      </Typography>

      {/* Raw value */}
      <Typography variant="caption" sx={{ width: 52, textAlign: "right", fontWeight: 600, color: "text.primary", flexShrink: 0 }}>
        {formatValue(metricKey, value)}
      </Typography>

      {/* Delta pill */}
      {hasDelta ? (
        <Box sx={{
          display: "flex", alignItems: "center", gap: 0.25,
          px: 0.6, py: 0.1, borderRadius: 1,
          bgcolor: improved ? "rgba(12,206,107,0.12)" : "rgba(255,78,66,0.12)",
          flexShrink: 0,
        }}>
          {improved
            ? <TrendingDown sx={{ fontSize: 10, color: "#0cce6b" }} />
            : <TrendingUp   sx={{ fontSize: 10, color: "#ff4e42" }} />}
          <Typography variant="caption" sx={{ fontSize: "0.6rem", color: improved ? "#0cce6b" : "#ff4e42", fontWeight: 700 }}>
            {formatDelta(metricKey, delta)}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: 40, flexShrink: 0 }} />
      )}

      {/* Sub-score bar */}
      <Box sx={{ flex: 1, position: "relative" }}>
        <Box sx={{ height: 5, borderRadius: 1, bgcolor: "rgba(255,255,255,0.06)" }}>
          <Box sx={{
            height: "100%", borderRadius: 1,
            width: `${score}%`,
            bgcolor: color,
            transition: "width 0.5s ease, background-color 0.3s ease",
          }} />
        </Box>
      </Box>

      {/* Points: earned/max */}
      {earnedPts !== null ? (
        <Typography variant="caption" sx={{ width: 34, textAlign: "right", color, fontWeight: 700, fontSize: "0.65rem", flexShrink: 0, whiteSpace: "nowrap" }}>
          {earnedPts}<Typography component="span" sx={{ color: "text.disabled", fontWeight: 400, fontSize: "0.6rem" }}>/{maxPts}</Typography>
        </Typography>
      ) : (
        <Typography variant="caption" sx={{ width: 24, textAlign: "right", color, fontWeight: 700, fontSize: "0.65rem", flexShrink: 0 }}>
          {score}
        </Typography>
      )}
    </Box>
  );
}
