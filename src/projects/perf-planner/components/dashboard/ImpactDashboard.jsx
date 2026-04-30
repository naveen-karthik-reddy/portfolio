import { useState } from "react";
import { Box, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { PhoneAndroid, Monitor } from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { computeResourceWaterfall, PROFILES, scoreColor } from "../../lib/calculator.js";
import ScoreCard from "./ScoreCard.jsx";

export default function ImpactDashboard({
  mobileMetrics, mobileScores,
  desktopMetrics, desktopScores,
  baselineMobileMetrics, baselineDesktopMetrics,
  resources, pageMeta,
  isBaseline,
  calibratedFormFactor, // "mobile" | "desktop" | null
  calibration,
}) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Default to calibrated profile if known, otherwise mobile
  const defaultProfile = calibratedFormFactor === "desktop" ? "desktop" : "mobile";
  const [activeProfile, setActiveProfile] = useState(defaultProfile);

  if (!mobileMetrics || !mobileScores) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="text.disabled">No variation selected</Typography>
      </Box>
    );
  }

  const mobileWaterfall  = resources ? computeResourceWaterfall(resources, pageMeta, PROFILES.mobile,  calibration) : null;
  const desktopWaterfall = resources ? computeResourceWaterfall(resources, pageMeta, PROFILES.desktop, calibration) : null;

  const isMobile     = activeProfile === "mobile";
  const metrics      = isMobile ? mobileMetrics      : desktopMetrics;
  const scores       = isMobile ? mobileScores       : desktopScores;
  const basMetrics   = isMobile ? baselineMobileMetrics : baselineDesktopMetrics;
  const waterfall    = isMobile ? mobileWaterfall    : desktopWaterfall;
  const isCalibrated = calibratedFormFactor === activeProfile;

  const mobileColor  = scoreColor(mobileScores?.overall  ?? 0);
  const desktopColor = scoreColor(desktopScores?.overall ?? 0);

  return (
    <Box>
      {/* Header row */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Typography variant="caption" sx={{
          fontWeight: 700, letterSpacing: "0.08em",
          color: "text.disabled", textTransform: "uppercase",
        }}>
          Performance {isBaseline && "· Baseline"}{isCalibrated && " · Calibrated"}
        </Typography>

        {/* Toggle */}
        <ToggleButtonGroup
          value={activeProfile}
          exclusive
          onChange={(_, val) => { if (val) setActiveProfile(val); }}
          size="small"
          sx={{ height: 28 }}
        >
          <ToggleButton
            value="mobile"
            sx={{
              px: 1.25, gap: 0.5, fontSize: "0.7rem", fontWeight: 600,
              borderColor: "divider",
              "&.Mui-selected": {
                bgcolor: alpha(mobileColor, 0.12),
                color: mobileColor,
                borderColor: alpha(mobileColor, 0.3),
              },
            }}
          >
            <PhoneAndroid sx={{ fontSize: 14 }} />
            Mobile
            <Box sx={{
              ml: 0.5, px: 0.6, py: 0.1, borderRadius: 0.75,
              bgcolor: alpha(mobileColor, 0.15), color: mobileColor,
              fontSize: "0.65rem", fontWeight: 800, lineHeight: 1.4,
            }}>
              {mobileScores?.overall ?? "—"}
            </Box>
          </ToggleButton>

          <ToggleButton
            value="desktop"
            sx={{
              px: 1.25, gap: 0.5, fontSize: "0.7rem", fontWeight: 600,
              borderColor: "divider",
              "&.Mui-selected": {
                bgcolor: alpha(desktopColor, 0.12),
                color: desktopColor,
                borderColor: alpha(desktopColor, 0.3),
              },
            }}
          >
            <Monitor sx={{ fontSize: 14 }} />
            Desktop
            <Box sx={{
              ml: 0.5, px: 0.6, py: 0.1, borderRadius: 0.75,
              bgcolor: alpha(desktopColor, 0.15), color: desktopColor,
              fontSize: "0.65rem", fontWeight: 800, lineHeight: 1.4,
            }}>
              {desktopScores?.overall ?? "—"}
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Single full-width score card */}
      <ScoreCard
        profileLabel={`${isMobile ? "Mobile" : "Desktop"}${isCalibrated ? " · calibrated" : ""}`}
        metrics={metrics}
        scores={scores}
        baselineMetrics={isBaseline ? null : basMetrics}
        waterfall={waterfall}
      />
    </Box>
  );
}
