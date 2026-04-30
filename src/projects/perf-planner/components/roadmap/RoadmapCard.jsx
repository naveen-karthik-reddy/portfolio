import { Box, Typography, Chip, Button, IconButton, Tooltip } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { TrendingUp, LockOutlined } from "@mui/icons-material";

const EFFORT_COLORS = { Easy: "#0cce6b", Medium: "#ffa400", Hard: "#ff4e42" };

export default function RoadmapCard({ suggestion, onApply, onLock }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const effortColor = EFFORT_COLORS[suggestion.effort] ?? "#9ca3af";

  return (
    <Box sx={{
      border: 1,
      borderColor: "divider",
      borderRadius: 2,
      p: 1.5,
      display: "flex",
      alignItems: "flex-start",
      gap: 1.5,
      bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
      "&:hover": { borderColor: "primary.main", bgcolor: isDark ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.primary.main, 0.02) },
      transition: "all 0.2s",
    }}>
      {/* Score gain badge */}
      <Box sx={{
        display: "flex", flexDirection: "column", alignItems: "center",
        minWidth: 48, pt: 0.25,
      }}>
        <TrendingUp sx={{ fontSize: 16, color: "#0cce6b", mb: 0.25 }} />
        <Typography variant="caption" sx={{ fontWeight: 800, color: "#0cce6b", fontSize: "0.85rem", lineHeight: 1 }}>
          +{suggestion.mobileGain}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "text.disabled" }}>mobile</Typography>
      </Box>

      {/* Description */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary", display: "block" }}>
          {suggestion.label}
        </Typography>
        {suggestion.changeDesc && (
          <Typography variant="caption" color="text.disabled" sx={{ display: "block", fontSize: "0.65rem" }}>
            {suggestion.changeDesc}
          </Typography>
        )}
        {suggestion.metricsImproved?.length > 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ display: "block", fontSize: "0.6rem", mt: 0.25 }}>
            {suggestion.metricsImproved.join(" · ")}
          </Typography>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
          <Chip
            label={suggestion.effort}
            size="small"
            sx={{
              height: 16, fontSize: "0.6rem", fontWeight: 700,
              bgcolor: alpha(effortColor, 0.12),
              color: effortColor,
              border: "none",
            }}
          />
          {suggestion.desktopGain > 0 && (
            <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "text.disabled" }}>
              +{suggestion.desktopGain} desktop
            </Typography>
          )}
        </Box>
      </Box>

      {/* Lock + Apply */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
        {onLock && (
          <Tooltip title="Hide this suggestion" arrow>
            <IconButton size="small" onClick={onLock} sx={{ p: 0.25, color: "text.disabled" }}>
              <LockOutlined sx={{ fontSize: 13 }} />
            </IconButton>
          </Tooltip>
        )}
        <Button
          size="small"
          variant="outlined"
          onClick={onApply}
          sx={{
            fontSize: "0.65rem", py: 0.25, px: 1,
            borderColor: "primary.main", color: "primary.main",
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
          }}
        >
          Apply
        </Button>
      </Box>
    </Box>
  );
}
