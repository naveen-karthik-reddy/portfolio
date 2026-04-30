import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, FormControl,
  FormControlLabel, Switch, Grid, Typography, Box,
} from "@mui/material";
import { DEFAULT_RESOURCE } from "../../lib/defaultSettings.js";

const TYPES    = ["html", "js", "css", "font", "image", "video", "other"];
const SOURCES  = ["same-origin", "own-cdn", "third-party-cdn"];
const LOADINGS = ["blocking", "defer", "async", "preload", "lazy", "module"];
const FORMATS  = ["WebP", "AVIF", "JPEG", "PNG", "GIF"];
const FONT_DISPLAYS = ["swap", "optional", "block", "auto"];

function Field({ label, children, full = false }) {
  return (
    <Grid item xs={12} sm={full ? 12 : 6}>
      <Box sx={{ mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>{label}</Typography>
        {children}
      </Box>
    </Grid>
  );
}

export default function ResourceDialog({ open, resource, onSave, onClose }) {
  const [form, setForm] = useState({ ...DEFAULT_RESOURCE });

  useEffect(() => {
    if (open) setForm(resource ? { ...resource } : { ...DEFAULT_RESOURCE, id: crypto.randomUUID() });
  }, [open, resource]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const isJs    = form.type === "js";
  const isCss   = form.type === "css";
  const isImage = form.type === "image";
  const isFont  = form.type === "font";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
        {resource ? "Edit Resource" : "Add Resource"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={1.5}>
          {/* Name */}
          <Grid item xs={12}>
            <TextField
              label="Name / Description"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              size="small" fullWidth
              inputProps={{ style: { fontSize: "0.82rem" } }}
            />
          </Grid>

          <Field label="Type">
            <FormControl size="small" fullWidth>
              <Select value={form.type} onChange={(e) => set("type", e.target.value)} sx={{ fontSize: "0.82rem", mt: 0.25 }}>
                {TYPES.map((t) => <MenuItem key={t} value={t} sx={{ fontSize: "0.82rem" }}>{t.toUpperCase()}</MenuItem>)}
              </Select>
            </FormControl>
          </Field>

          <Field label="Source / CDN">
            <FormControl size="small" fullWidth>
              <Select value={form.source} onChange={(e) => set("source", e.target.value)} sx={{ fontSize: "0.82rem", mt: 0.25 }}>
                {SOURCES.map((s) => <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Field>

          <Field label="Loading Strategy">
            <FormControl size="small" fullWidth>
              <Select value={form.loading} onChange={(e) => set("loading", e.target.value)} sx={{ fontSize: "0.82rem", mt: 0.25 }}>
                {LOADINGS.map((l) => <MenuItem key={l} value={l} sx={{ fontSize: "0.82rem" }}>{l}</MenuItem>)}
              </Select>
            </FormControl>
          </Field>

          <Field label="Size per file (KB)">
            <TextField
              type="number" value={form.sizeKB}
              onChange={(e) => set("sizeKB", Math.max(0, Number(e.target.value)))}
              size="small" fullWidth
              inputProps={{ min: 0, style: { fontSize: "0.82rem" } }}
              sx={{ mt: 0.25 }}
            />
          </Field>

          <Field label="Count (identical files)">
            <TextField
              type="number" value={form.count}
              onChange={(e) => set("count", Math.max(1, Number(e.target.value)))}
              size="small" fullWidth
              inputProps={{ min: 1, style: { fontSize: "0.82rem" } }}
              sx={{ mt: 0.25 }}
            />
          </Field>

          {/* JS-specific */}
          {isJs && (
            <>
              <Field label="Execution time (ms)">
                <TextField
                  type="number" value={form.execTimeMs}
                  onChange={(e) => set("execTimeMs", Math.max(0, Number(e.target.value)))}
                  size="small" fullWidth
                  inputProps={{ min: 0, style: { fontSize: "0.82rem" } }}
                  sx={{ mt: 0.25 }}
                />
              </Field>
              <Field label="Long task count">
                <TextField
                  type="number" value={form.longTaskCount}
                  onChange={(e) => set("longTaskCount", Math.max(0, Number(e.target.value)))}
                  size="small" fullWidth
                  inputProps={{ min: 0, style: { fontSize: "0.82rem" } }}
                  sx={{ mt: 0.25 }}
                />
              </Field>
              <Field label="Avg long task (ms)">
                <TextField
                  type="number" value={form.avgLongTaskMs}
                  onChange={(e) => set("avgLongTaskMs", Math.max(0, Number(e.target.value)))}
                  size="small" fullWidth
                  inputProps={{ min: 0, style: { fontSize: "0.82rem" } }}
                  sx={{ mt: 0.25 }}
                />
              </Field>
            </>
          )}

          {/* JS or CSS — inline flag */}
          {(isJs || isCss) && (
            <Field label="Inlined into HTML">
              <FormControlLabel
                control={<Switch size="small" checked={!!form.inline} onChange={(e) => set("inline", e.target.checked)} />}
                label={<Typography variant="caption" sx={{ fontWeight: 600 }}>Inline</Typography>}
              />
            </Field>
          )}

          {/* Image-specific */}
          {isImage && (
            <>
              <Field label="Image format">
                <FormControl size="small" fullWidth>
                  <Select value={form.imageFormat} onChange={(e) => set("imageFormat", e.target.value)} sx={{ fontSize: "0.82rem", mt: 0.25 }}>
                    {FORMATS.map((f) => <MenuItem key={f} value={f} sx={{ fontSize: "0.82rem" }}>{f}</MenuItem>)}
                  </Select>
                </FormControl>
              </Field>
              <Field label="fetchpriority=high">
                <FormControlLabel
                  control={<Switch size="small" checked={!!form.fetchpriority} onChange={(e) => set("fetchpriority", e.target.checked)} />}
                  label={<Typography variant="caption" sx={{ fontWeight: 600 }}>Enabled</Typography>}
                />
              </Field>
              <Field label="Missing dimensions">
                <FormControlLabel
                  control={<Switch size="small" checked={!!form.missingDimensions} onChange={(e) => set("missingDimensions", e.target.checked)} />}
                  label={<Typography variant="caption" sx={{ fontWeight: 600 }}>Yes</Typography>}
                />
              </Field>
            </>
          )}

          {/* Font-specific */}
          {isFont && (
            <Field label="font-display">
              <FormControl size="small" fullWidth>
                <Select value={form.fontDisplay ?? "swap"} onChange={(e) => set("fontDisplay", e.target.value)} sx={{ fontSize: "0.82rem", mt: 0.25 }}>
                  {FONT_DISPLAYS.map((d) => <MenuItem key={d} value={d} sx={{ fontSize: "0.82rem" }}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Field>
          )}

          {/* LCP toggle */}
          {["image", "video"].includes(form.type) && (
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch size="small" checked={form.isLcp} onChange={(e) => set("isLcp", e.target.checked)} />}
                label={<Typography variant="caption" sx={{ fontWeight: 600 }}>This is the LCP element</Typography>}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button size="small" onClick={onClose}>Cancel</Button>
        <Button size="small" variant="contained" onClick={() => onSave(form)}>
          {resource ? "Save" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
