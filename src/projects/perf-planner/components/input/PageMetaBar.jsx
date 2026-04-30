import {
  Box, Typography, TextField, Switch,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useApp } from "../../context/useApp.js";

export default function PageMetaBar() {
  const { state, dispatch } = useApp();
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  const activeVariation = state.variations.find((v) => v.id === state.activeVariationId);
  if (!activeVariation) return null;
  const meta = activeVariation.pageMeta ?? { ttfb: 0, cdn: false };

  function set(field, value) {
    dispatch({
      type: "PAGE_META_CHANGED",
      payload: { variationId: activeVariation.id, field, value },
    });
  }

  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 2,
      px: 2, py: 1.25,
      borderBottom: 1, borderColor: "divider",
      bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
      flexWrap: "wrap",
    }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.disabled", letterSpacing: "0.08em", textTransform: "uppercase", mr: 0.5 }}>
        Page
      </Typography>

      {/* TTFB */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.7rem" }}>TTFB</Typography>
        <TextField
          type="number" size="small" value={meta.ttfb}
          onChange={(e) => set("ttfb", Math.max(0, Math.min(2000, Number(e.target.value))))}
          inputProps={{ min: 0, max: 2000, step: 10, style: { fontSize: "0.78rem", padding: "4px 6px", width: 56 } }}
        />
        <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.65rem" }}>ms</Typography>
      </Box>

      {/* CDN */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.7rem" }}>CDN</Typography>
        <Switch
          size="small" checked={!!meta.cdn}
          onChange={(e) => set("cdn", e.target.checked)}
        />
      </Box>

    </Box>
  );
}
