import { useMemo } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useApp } from "../../context/useApp.js";
import { computeMetrics, computeScores, PROFILES } from "../../lib/calculator.js";
import ComparisonSelector from "./ComparisonSelector.jsx";
import ComparisonColumn from "./ComparisonColumn.jsx";

const METRIC_KEYS = ["fcp", "lcp", "tbt", "cls", "si"];

export default function ComparisonMode() {
  const { state, dispatch } = useApp();
  const { pages, variations, comparisonVariationIds } = state;

  // Build selected variation data
  const selectedData = useMemo(() => {
    return comparisonVariationIds.map((id) => {
      const variation = variations.find((v) => v.id === id);
      if (!variation) return null;
      const page = pages.find((p) => p.id === variation.pageId);
      const settings = page?.scoringCurves ? { scoringCurves: page.scoringCurves } : null;
      const metrics = computeMetrics(variation.resources ?? [], variation.pageMeta ?? {}, PROFILES.mobile, page?.calibration);
      const scores  = computeScores(metrics, settings);
      return { variation, page, metrics, scores };
    }).filter(Boolean);
  }, [comparisonVariationIds, variations, pages]);

  // Find best/worst for each metric (lower = better for all)
  const bestMetrics  = {};
  const worstMetrics = {};
  METRIC_KEYS.forEach((key) => {
    const values = selectedData.map((d) => d.metrics[key]).filter((v) => v != null);
    if (values.length === 0) return;
    bestMetrics[key]  = Math.min(...values);
    worstMetrics[key] = Math.max(...values);
  });

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 180px)", overflow: "hidden" }}>
      <ComparisonSelector />

      {/* Columns area */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: "0.08em", color: "text.disabled", textTransform: "uppercase" }}>
            Comparison View · {selectedData.length} selected
          </Typography>
          <Button
            size="small"
            startIcon={<Close sx={{ fontSize: 14 }} />}
            onClick={() => dispatch({ type: "COMPARISON_CLOSED" })}
            sx={{ fontSize: "0.72rem" }}
          >
            Exit Comparison
          </Button>
        </Box>

        {selectedData.length < 2 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography color="text.disabled">Select at least 2 variations to compare</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            {selectedData.map(({ variation, page, metrics, scores }) => (
              <ComparisonColumn
                key={variation.id}
                page={page}
                variation={variation}
                metrics={metrics}
                scores={scores}
                bestMetrics={bestMetrics}
                worstMetrics={worstMetrics}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
