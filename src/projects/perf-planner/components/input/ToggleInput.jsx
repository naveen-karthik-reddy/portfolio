import { Box, Typography, Switch, IconButton, Tooltip } from "@mui/material";
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

export default function ToggleInput({ fieldKey, meta, value, locked, onChange, onLockToggle }) {
  const health = getHealth(fieldKey, value);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.25, opacity: locked ? 0.45 : 1 }}>
      <HealthDot status={health} />
      <Typography variant="caption" sx={{ flex: 1, color: "text.secondary" }}>
        {meta.label}
      </Typography>
      <Switch
        size="small"
        checked={!!value}
        disabled={locked}
        onChange={(e) => onChange(e.target.checked)}
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": { color: HEALTH_COLORS[health] },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: HEALTH_COLORS[health] },
        }}
      />
      <Tooltip title={locked ? "Unlock field" : "Lock field"} arrow>
        <IconButton size="small" onClick={onLockToggle} sx={{ p: 0.25, color: locked ? "warning.main" : "text.disabled" }}>
          {locked ? <Lock sx={{ fontSize: 14 }} /> : <LockOpen sx={{ fontSize: 14 }} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
