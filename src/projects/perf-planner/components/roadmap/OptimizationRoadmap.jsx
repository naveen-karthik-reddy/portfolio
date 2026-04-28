import { Box, Typography } from "@mui/material";
import { useApp } from "../../context/useApp.js";
import RoadmapCard from "./RoadmapCard.jsx";

export default function OptimizationRoadmap({ items }) {
  const { state, dispatch } = useApp();
  const { variations, activeVariationId } = state;
  const activeVariation = variations.find((v) => v.id === activeVariationId);

  if (!activeVariation) return null;

  function handleApply(suggestion) {
    dispatch({
      type: "INPUT_CHANGED",
      payload: {
        variationId: activeVariation.id,
        field: suggestion.field,
        value: suggestion.optimalVal,
      },
    });
  }

  if (!items || items.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 3 }}>
        <Typography variant="body2" color="text.disabled">
          No optimizations needed — looking great!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: "0.08em", color: "text.disabled", textTransform: "uppercase", display: "block", mb: 1 }}>
        Optimization Roadmap
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {items.map((item) => (
          <RoadmapCard key={item.field} suggestion={item} onApply={() => handleApply(item)} />
        ))}
      </Box>
    </Box>
  );
}
