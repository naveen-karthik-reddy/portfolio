import { Box, Typography, Slider, TextField, IconButton, Tooltip } from "@mui/material";
import { Lock, LockOpen } from "@mui/icons-material";
import { getHealth } from "../../lib/defaults.js";

const HEALTH_COLORS = { green: "#0cce6b", yellow: "#ffa400", red: "#ff4e42" };

function HealthDot({ status }) {
  return (
    <Box sx={{
      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
      bgcolor: HEALTH_COLORS[status] ?? "#9ca3af",
    }} />
  );
}

export default function SliderInput({ fieldKey, meta, value, locked, onChange, onLockToggle }) {
  const health = getHealth(fieldKey, value);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.75, opacity: locked ? 0.45 : 1 }}>
      <HealthDot status={health} />
      <Typography variant="caption" sx={{ flex: 1, color: "text.secondary", minWidth: 0, pr: 1 }}>
        {meta.label}
      </Typography>
      <Slider
        size="small"
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={value}
        disabled={locked}
        onChange={(_, v) => onChange(v)}
        sx={{
          width: 110, flexShrink: 0,
          color: HEALTH_COLORS[health],
          "& .MuiSlider-thumb": { width: 12, height: 12 },
        }}
      />
      <TextField
        size="small"
        type="number"
        value={value}
        disabled={locked}
        onChange={(e) => {
          const v = meta.step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
          if (!isNaN(v)) onChange(Math.max(meta.min, Math.min(meta.max, v)));
        }}
        inputProps={{ min: meta.min, max: meta.max, step: meta.step, style: { textAlign: "right", padding: "2px 4px", fontSize: "0.72rem" } }}
        sx={{ width: 58, flexShrink: 0, "& .MuiOutlinedInput-root": { fontSize: "0.72rem" } }}
      />
      {meta.unit && (
        <Typography variant="caption" color="text.disabled" sx={{ width: 20, flexShrink: 0 }}>
          {meta.unit}
        </Typography>
      )}
      <Tooltip title={locked ? "Unlock field" : "Lock field"} arrow>
        <IconButton size="small" onClick={onLockToggle} sx={{ p: 0.25, color: locked ? "warning.main" : "text.disabled" }}>
          {locked ? <Lock sx={{ fontSize: 14 }} /> : <LockOpen sx={{ fontSize: 14 }} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
