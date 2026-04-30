import { useState, useEffect, useRef } from "react";
import {
  Drawer, Box, Typography, Divider, Button, TextField,
  IconButton, Tooltip, Accordion, AccordionSummary, AccordionDetails,
  Switch, FormControlLabel,
} from "@mui/material";
import { ExpandMore, Close, FileDownload, FileUpload, RestartAlt } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useApp } from "../../context/useApp.js";
import { saveSettings } from "../../lib/db.js";
import { DEFAULT_SETTINGS } from "../../lib/defaultSettings.js";
import { downloadSettingsAsJSON, parseSettingsFile } from "../../lib/exportImport.js";

function NumField({ label, value, onChange, min, max, step = 1, helperText }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <TextField
        label={label}
        type="number"
        size="small"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        inputProps={{ min, max, step, style: { fontSize: "0.8rem" } }}
        helperText={helperText}
        fullWidth
      />
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Accordion disableGutters defaultExpanded elevation={0} sx={{ "&:before": { display: "none" }, border: 1, borderColor: "divider", borderRadius: 1, mb: 1 }}>
      <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 40, "& .MuiAccordionSummary-content": { my: 0.5 } }}>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.75rem" }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

export default function SettingsPanel({ open, onClose }) {
  const { state, dispatch } = useApp();
  const theme  = useTheme();
  const importRef = useRef(null);

  const [local, setLocal] = useState(null);

  useEffect(() => {
    if (open) setLocal(state.settings ? structuredClone(state.settings) : structuredClone({ id: "global", ...DEFAULT_SETTINGS }));
  }, [open, state.settings]);

  if (!local) return null;

  function setPath(path, value) {
    setLocal((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function handleSave() {
    saveSettings(local);
    dispatch({ type: "SETTINGS_UPDATED", payload: local });
    onClose();
  }

  function handleReset() {
    const fresh = { id: "global", ...DEFAULT_SETTINGS };
    setLocal(fresh);
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const merged = await parseSettingsFile(file);
      setLocal((prev) => ({ ...prev, ...merged }));
    } catch (err) {
      window.alert("Import failed: " + (err.message ?? "Invalid file"));
    }
  }

  // Validate weights sum to 1.0
  const w = local.scoringWeights;
  const weightSum = (w.fcp + w.lcp + w.tbt + w.cls + w.si);
  const weightOk  = Math.abs(weightSum - 1.0) < 0.001;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 480, maxWidth: "95vw", display: "flex", flexDirection: "column" } }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.5, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>Simulation Settings</Typography>
        <Tooltip title="Export settings as JSON" arrow>
          <IconButton size="small" onClick={() => downloadSettingsAsJSON(local)}><FileDownload sx={{ fontSize: 18 }} /></IconButton>
        </Tooltip>
        <Tooltip title="Import settings from JSON" arrow>
          <IconButton size="small" onClick={() => importRef.current?.click()}><FileUpload sx={{ fontSize: 18 }} /></IconButton>
        </Tooltip>
        <input ref={importRef} type="file" accept=".json" hidden onChange={handleImport} />
        <Tooltip title="Reset to defaults" arrow>
          <IconButton size="small" onClick={handleReset}><RestartAlt sx={{ fontSize: 18 }} /></IconButton>
        </Tooltip>
        <IconButton size="small" onClick={onClose} sx={{ ml: 0.5 }}><Close sx={{ fontSize: 18 }} /></IconButton>
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>

        {/* Network Profiles */}
        {["mobile", "desktop"].map((key) => {
          const p = local.networkProfiles[key];
          return (
            <Section key={key} title={`Network Profile — ${key.charAt(0).toUpperCase() + key.slice(1)}`}>
              <TextField
                label="Label"
                size="small"
                value={p.label}
                onChange={(e) => setPath(`networkProfiles.${key}.label`, e.target.value)}
                fullWidth sx={{ mb: 1.5, "& input": { fontSize: "0.8rem" } }}
              />
              <NumField label="RTT (ms)"          value={p.rtt}           onChange={(v) => setPath(`networkProfiles.${key}.rtt`, v)}           min={0}  max={2000} />
              <NumField label="Bandwidth (KB/s)"  value={p.bandwidthKBs}  onChange={(v) => setPath(`networkProfiles.${key}.bandwidthKBs`, v)}  min={10} max={100000} />
              <NumField label="CPU Multiplier"    value={p.cpuMultiplier} onChange={(v) => setPath(`networkProfiles.${key}.cpuMultiplier`, v)} min={0.5} max={10} step={0.5} />
            </Section>
          );
        })}

        {/* Scoring Weights */}
        <Section title="Scoring Weights">
          <Typography variant="caption" sx={{ color: weightOk ? "text.disabled" : "error.main", display: "block", mb: 1 }}>
            Sum: {weightSum.toFixed(3)} {weightOk ? "(✓ valid)" : "(⚠ must equal 1.0)"}
          </Typography>
          {["fcp", "lcp", "tbt", "cls", "si"].map((k) => (
            <NumField
              key={k}
              label={k.toUpperCase()}
              value={local.scoringWeights[k] ?? 0}
              onChange={(v) => setPath(`scoringWeights.${k}`, v)}
              min={0} max={1} step={0.01}
            />
          ))}
        </Section>

        {/* Scoring Curves */}
        <Section title="Scoring Curves (Lighthouse log-normal)">
          {["fcp", "lcp", "tbt", "cls", "si"].map((k) => (
            <Box key={k} sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.5 }}>{k.toUpperCase()}</Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  label="Median" type="number" size="small"
                  value={local.scoringCurves[k].median}
                  onChange={(e) => setPath(`scoringCurves.${k}.median`, Number(e.target.value))}
                  inputProps={{ min: 0, style: { fontSize: "0.8rem" } }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="p10 (good)" type="number" size="small"
                  value={local.scoringCurves[k].p10}
                  onChange={(e) => setPath(`scoringCurves.${k}.p10`, Number(e.target.value))}
                  inputProps={{ min: 0, style: { fontSize: "0.8rem" } }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          ))}
        </Section>

        {/* Connection Model */}
        <Section title="Connection Model">
          <NumField label="HTTP/1.1 max connections/origin" value={local.connectionModel.http1MaxConnections} onChange={(v) => setPath("connectionModel.http1MaxConnections", v)} min={1} max={20} />
          <NumField label="HTTP/2 multiplex limit"          value={local.connectionModel.http2MultiplexLimit}  onChange={(v) => setPath("connectionModel.http2MultiplexLimit", v)}  min={1} max={1000} />
          <NumField label="HTTP/3 QUIC speed gain (0–1)"    value={local.connectionModel.http3QuicGain}        onChange={(v) => setPath("connectionModel.http3QuicGain", v)}        min={0} max={0.5} step={0.01} helperText="Fraction of download time saved vs HTTP/2" />
          <NumField label="TCP initial cwnd (KB)"           value={local.connectionModel.tcpInitialCwndKB}     onChange={(v) => setPath("connectionModel.tcpInitialCwndKB", v)}     min={1} max={100} />
          <FormControlLabel
            control={<Switch size="small" checked={local.connectionModel.http3ZeroRtt} onChange={(e) => setPath("connectionModel.http3ZeroRtt", e.target.checked)} />}
            label={<Typography variant="caption">HTTP/3 0-RTT (skip connection setup)</Typography>}
          />
        </Section>
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ display: "flex", gap: 1, px: 2, py: 1.5, flexShrink: 0 }}>
        <Button size="small" onClick={onClose} sx={{ flex: 1 }}>Cancel</Button>
        <Button size="small" variant="contained" onClick={handleSave} disabled={!weightOk} sx={{ flex: 1 }}>
          Save &amp; Apply
        </Button>
      </Box>
    </Drawer>
  );
}
