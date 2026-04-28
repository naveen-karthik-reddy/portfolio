import { Box, Typography, Checkbox } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useApp } from "../../context/useApp.js";
import { scoreColor, computeMetrics, computeScores, PROFILES } from "../../lib/calculator.js";

export default function ComparisonSelector() {
  const { state, dispatch } = useApp();
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { pages, variations, comparisonVariationIds } = state;

  return (
    <Box sx={{ width: 220, flexShrink: 0, borderRight: 1, borderColor: "divider", overflowY: "auto" }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
          Select 2–4 variations
        </Typography>
        <Typography variant="caption" sx={{ display: "block", color: "text.disabled", fontSize: "0.65rem" }}>
          {comparisonVariationIds.length}/4 selected
        </Typography>
      </Box>

      {pages.map((page) => {
        const pageVars = variations.filter((v) => v.pageId === page.id);
        if (pageVars.length === 0) return null;
        return (
          <Box key={page.id}>
            <Typography variant="caption" sx={{
              display: "block", px: 2, py: 0.75,
              fontWeight: 700, color: "text.disabled", fontSize: "0.65rem",
              textTransform: "uppercase", letterSpacing: "0.08em",
              bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            }}>
              {page.name}
            </Typography>
            {pageVars.map((v) => {
              const selected = comparisonVariationIds.includes(v.id);
              const disabled = !selected && comparisonVariationIds.length >= 4;
              const metrics  = computeMetrics(v.inputs, PROFILES.mobile);
              const scores   = computeScores(metrics);
              const color    = scoreColor(scores.overall);

              return (
                <Box
                  key={v.id}
                  onClick={() => !disabled && dispatch({ type: "COMPARISON_VARIATION_TOGGLED", payload: { variationId: v.id } })}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1,
                    px: 1.5, py: 0.5, cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.4 : 1,
                    bgcolor: selected ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                    "&:hover": { bgcolor: disabled ? undefined : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" },
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={selected}
                    disabled={disabled}
                    sx={{ p: 0.25 }}
                    onChange={() => {}}
                  />
                  <Typography variant="caption" sx={{ flex: 1, color: "text.secondary" }}>{v.name}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color, fontSize: "0.65rem" }}>{scores.overall}</Typography>
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
}
