import { Box, Typography } from "@mui/material";
import { computeWaterfall, PROFILES } from "../../lib/calculator.js";
import ScoreCard from "./ScoreCard.jsx";

export default function ImpactDashboard({
  mobileMetrics, mobileScores,
  desktopMetrics, desktopScores,
  baselineMobileMetrics, baselineDesktopMetrics,
  inputs,
  isBaseline,
}) {
  if (!mobileMetrics || !mobileScores) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="text.disabled">No variation selected</Typography>
      </Box>
    );
  }

  const mobileWaterfall  = inputs ? computeWaterfall(inputs, PROFILES.mobile)  : [];
  const desktopWaterfall = inputs ? computeWaterfall(inputs, PROFILES.desktop) : [];

  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: "0.08em", color: "text.disabled", textTransform: "uppercase", display: "block", mb: 1 }}>
        Impact Dashboard {isBaseline && "· Baseline"}
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <ScoreCard
          profileLabel="Mobile"
          metrics={mobileMetrics}
          scores={mobileScores}
          baselineMetrics={isBaseline ? null : baselineMobileMetrics}
          waterfall={mobileWaterfall}
        />
        <ScoreCard
          profileLabel="Desktop"
          metrics={desktopMetrics}
          scores={desktopScores}
          baselineMetrics={isBaseline ? null : baselineDesktopMetrics}
          waterfall={desktopWaterfall}
        />
      </Box>
    </Box>
  );
}
