import { Box, Typography, Divider } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { scoreColor } from "../../lib/calculator.js";
import { DEFAULT_SETTINGS } from "../../lib/defaultSettings.js";
import { useApp } from "../../context/useApp.js";
import ScoreGauge from "./ScoreGauge.jsx";
import MetricRow from "./MetricRow.jsx";
import ResourceWaterfall from "./ResourceWaterfall.jsx";

const METRIC_DEFS = [
  { key: "fcp", label: "FCP" },
  { key: "lcp", label: "LCP" },
  { key: "tbt", label: "TBT" },
  { key: "cls", label: "CLS" },
  { key: "si",  label: "SI"  },
];

export default function ScoreCard({ profileLabel, metrics, scores, baselineMetrics, waterfall }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const color  = scoreColor(scores.overall);
  const { state } = useApp();
  const weights = state.settings?.scoringWeights ?? DEFAULT_SETTINGS.scoringWeights;

  return (
    <Box sx={{
      flex: 1,
      border: 1,
      borderColor: isDark ? alpha(color, 0.3) : alpha(color, 0.4),
      borderRadius: 2,
      p: 2,
      bgcolor: isDark ? alpha(color, 0.04) : alpha(color, 0.02),
    }}>
      {/* Header */}
      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", mb: 1 }}>
        {profileLabel}
      </Typography>

      {/* Gauge + score label */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <ScoreGauge score={scores.overall} size={90} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color, lineHeight: 1 }}>
            {scores.overall}
          </Typography>
          <Typography variant="caption" color="text.disabled">Performance</Typography>
        </Box>
      </Box>

      {/* Metric rows */}
      <Divider sx={{ mb: 1 }} />
      {METRIC_DEFS.map(({ key, label }) => (
        <MetricRow
          key={key}
          metricKey={key}
          label={label}
          value={metrics[key]}
          score={scores[key]}
          baselineValue={baselineMetrics?.[key]}
          weight={weights[key]}
        />
      ))}

      {/* Waterfall */}
      {waterfall?.rows?.length > 0 && (
        <>
          <Divider sx={{ mt: 1.5, mb: 1 }} />
          <Typography variant="caption" color="text.disabled" sx={{ display: "block", mb: 0.75 }}>
            Network Waterfall
          </Typography>
          <ResourceWaterfall
            key={`${state.activePageId ?? "default"}-${state.activeVariationId ?? "default"}`}
            rows={waterfall.rows}
            fcpMs={waterfall.fcpMs}
            lcpMs={waterfall.lcpMs}
            totalMs={waterfall.totalMs}
          />
        </>
      )}
    </Box>
  );
}
