import { Box, Typography } from "@mui/material";
import { useApp } from "../../context/useApp.js";
import RoadmapCard from "./RoadmapCard.jsx";

export default function OptimizationRoadmap({ items }) {
  const { state, dispatch } = useApp();
  const { variations, activeVariationId } = state;
  const activeVariation = variations.find((v) => v.id === activeVariationId);

  if (!activeVariation) return null;

  function handleApply(suggestion) {
    if (suggestion.resourceId) {
      // Find the resource and patch the relevant field(s).
      const r = (activeVariation.resources ?? []).find((res) => res.id === suggestion.resourceId);
      if (!r) return;
      const patches = patchFromSuggestionKey(suggestion, r);
      for (const [field, value] of Object.entries(patches)) {
        dispatch({
          type: "RESOURCE_FIELD_CHANGED",
          payload: { variationId: activeVariation.id, resourceId: r.id, field, value },
        });
      }
    } else if (suggestion.key.startsWith("p:")) {
      const field = suggestion.key.slice(2);
      const value = pageMetaTargetForKey(suggestion.key);
      dispatch({
        type: "PAGE_META_CHANGED",
        payload: { variationId: activeVariation.id, field, value },
      });
    }
  }

  function handleLock(suggestion) {
    dispatch({
      type: "LOCK_TOGGLED",
      payload: { variationId: activeVariation.id, key: suggestion.key },
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
          <RoadmapCard
            key={item.key}
            suggestion={item}
            onApply={() => handleApply(item)}
            onLock={() => handleLock(item)}
          />
        ))}
      </Box>
    </Box>
  );
}

function patchFromSuggestionKey(suggestion, resource) {
  // suggestion.key encodes the lever; map to the field/value to set.
  const key = suggestion.key;
  if (key.endsWith(":format"))        return { imageFormat: "AVIF" };
  if (key.endsWith(":loading"))       return { loading: "defer" };
  if (key.endsWith(":preload"))       return { loading: "preload" };
  if (key.endsWith(":fetchpriority")) return { fetchpriority: true };
  if (key.endsWith(":inline"))        return { inline: true };
  if (key.endsWith(":size")) {
    const target = parseSizeFromChangeDesc(suggestion.changeDesc, resource.sizeKB);
    return { sizeKB: target };
  }
  return {};
}

function parseSizeFromChangeDesc(desc, fallback) {
  // changeDesc like "200 → 100 KB"
  const m = desc?.match(/→\s*(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : fallback;
}

function pageMetaTargetForKey(key) {
  if (key === "p:cdn")  return true;
  if (key === "p:ttfb") return 150;
  return undefined;
}
