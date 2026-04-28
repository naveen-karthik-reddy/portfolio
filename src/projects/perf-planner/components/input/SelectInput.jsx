import { Box, Typography, Select, MenuItem, IconButton, Tooltip, FormControl } from "@mui/material";
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

export default function SelectInput({ fieldKey, meta, value, locked, onChange, onLockToggle }) {
  const health = getHealth(fieldKey, value);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.75, opacity: locked ? 0.45 : 1 }}>
      <HealthDot status={health} />
      <Typography variant="caption" sx={{ flex: 1, color: "text.secondary" }}>
        {meta.label}
      </Typography>
      <FormControl size="small" disabled={locked} sx={{ minWidth: 130, flexShrink: 0 }}>
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ fontSize: "0.72rem", "& .MuiSelect-select": { py: "3px" } }}
        >
          {meta.options.map((opt) => (
            <MenuItem key={opt} value={opt} sx={{ fontSize: "0.8rem" }}>{opt}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Tooltip title={locked ? "Unlock field" : "Lock field"} arrow>
        <IconButton size="small" onClick={onLockToggle} sx={{ p: 0.25, color: locked ? "warning.main" : "text.disabled" }}>
          {locked ? <Lock sx={{ fontSize: 14 }} /> : <LockOpen sx={{ fontSize: 14 }} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
