import { Box, Typography, Tooltip } from "@mui/material";

export default function WaterfallBar({ segments }) {
  const total = segments.reduce((s, seg) => s + seg.ms, 0);
  if (total <= 0) return null;

  return (
    <Box>
      {/* Stacked bar */}
      <Box sx={{ display: "flex", height: 18, borderRadius: 1, overflow: "hidden", mb: 0.5 }}>
        {segments.map((seg) => (
          <Tooltip key={seg.label} title={`${seg.label}: ${seg.ms}ms`} arrow>
            <Box
              sx={{
                width: `${(seg.ms / total) * 100}%`,
                bgcolor: seg.color,
                minWidth: seg.ms > 0 ? 2 : 0,
                transition: "width 0.5s ease",
                cursor: "default",
              }}
            />
          </Tooltip>
        ))}
      </Box>

      {/* Legend */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {segments.map((seg) => (
          <Box key={seg.label} sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: seg.color, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "text.disabled" }}>
              {seg.label} {seg.ms}ms
            </Typography>
          </Box>
        ))}
        <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "text.secondary", ml: "auto" }}>
          Total: {total}ms
        </Typography>
      </Box>
    </Box>
  );
}
