import { useRef, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Alert, Stack, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, Chip,
} from "@mui/material";
import { Science, FileUpload } from "@mui/icons-material";
import { useApp } from "../../context/useApp.js";
import { parseLighthouseReport, LighthouseImportError } from "../../lib/lighthouseImporter.js";
import { fitCurves } from "../../lib/curveFit.js";
import { computeScores } from "../../lib/calculator.js";
import { savePage, saveVariation } from "../../lib/db.js";
import { DEFAULT_SETTINGS } from "../../lib/defaultSettings.js";

const METRIC_KEYS = ["fcp", "lcp", "tbt", "cls", "si"];
const METRIC_LABELS = { fcp: "FCP", lcp: "LCP", tbt: "TBT", cls: "CLS", si: "SI" };

function fmt(n, digits = 0) {
  if (n == null || !Number.isFinite(n)) return "—";
  return digits === 0 ? Math.round(n).toString() : n.toFixed(digits);
}

export default function CalibrationPanel({ open, mode = "create", pageId = null, onClose }) {
  const { state, dispatch } = useApp();
  const fileRef = useRef(null);

  const [text, setText]     = useState("");
  const [error, setError]   = useState("");
  const [parsed, setParsed] = useState(null); // { ...importer output, fittedCurves, simulatedOverall }

  function reset() {
    setText("");
    setError("");
    setParsed(null);
  }

  function handleClose() {
    reset();
    onClose?.();
  }

  function processJsonText(jsonText) {
    setError("");
    try {
      const result = parseLighthouseReport(jsonText);
      const fittedCurves = fitCurves(result.realMetrics, result.realMetricScores, result.realScore);
      const settings = { ...DEFAULT_SETTINGS, scoringCurves: fittedCurves };
      const simulated = computeScores(result.realMetrics, settings).overall;
      setParsed({ ...result, fittedCurves, simulatedOverall: simulated });
    } catch (err) {
      const msg = err instanceof LighthouseImportError ? err.message : (err?.message ?? "Parse failed");
      setError(msg);
      setParsed(null);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const t = ev.target.result;
      setText(typeof t === "string" ? t : "");
      processJsonText(t);
    };
    reader.onerror = () => setError("Could not read file");
    reader.readAsText(file);
  }

  function handlePasteSubmit() {
    if (!text.trim()) {
      setError("Paste a Lighthouse JSON report first.");
      return;
    }
    processJsonText(text);
  }

  function handleApply() {
    if (!parsed) return;
    const now = new Date().toISOString();
    const calibration = {
      realScore: parsed.realScore,
      realMetrics: parsed.realMetrics,
      realMetricScores: parsed.realMetricScores,
      sourceUrl: parsed.sourceUrl,
      fetchTime: parsed.fetchTime,
      lhVersion: parsed.lhVersion,
      formFactor: parsed.formFactor,
      cpuSlowdownMultiplier: parsed.cpuSlowdownMultiplier,
      throttlingRttMs: parsed.throttlingRttMs,
      throttlingThroughputKbps: parsed.throttlingThroughputKbps,
      resourceHash: parsed.resourceHash,
      importedAt: now,
    };

    if (mode === "create") {
      const page = {
        id: crypto.randomUUID(),
        name: parsed.name,
        createdAt: now,
        updatedAt: now,
        scoringCurves: parsed.fittedCurves,
        calibration,
      };
      const baseline = {
        id: crypto.randomUUID(),
        pageId: page.id,
        name: "Real",
        isBaseline: true,
        locked: {},
        pageMeta: parsed.pageMeta,
        resources: parsed.resources,
        createdAt: now,
        updatedAt: now,
      };
      savePage(page);
      saveVariation(baseline);
      dispatch({ type: "PAGE_CREATED_FROM_LIGHTHOUSE", payload: { page, baseline } });
    } else {
      const existing = state.pages.find((p) => p.id === pageId);
      if (!existing) {
        setError("Page not found");
        return;
      }
      const updatedPage = {
        ...existing,
        scoringCurves: parsed.fittedCurves,
        calibration,
        updatedAt: now,
      };
      const baseline = state.variations.find((v) => v.pageId === pageId && v.isBaseline);
      savePage(updatedPage);
      if (baseline) {
        const updatedBaseline = {
          ...baseline,
          pageMeta: parsed.pageMeta,
          resources: parsed.resources,
          updatedAt: now,
        };
        saveVariation(updatedBaseline);
      }
      dispatch({
        type: "PAGE_RECALIBRATED",
        payload: {
          pageId,
          scoringCurves: parsed.fittedCurves,
          calibration,
          baselinePageMeta: parsed.pageMeta,
          baselineResources: parsed.resources,
          updatedAt: now,
        },
      });
    }
    handleClose();
  }

  const delta = parsed ? parsed.simulatedOverall - parsed.realScore : 0;
  const deltaColor = Math.abs(delta) <= 1 ? "success" : Math.abs(delta) <= 5 ? "warning" : "error";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontSize: "0.95rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <Science sx={{ fontSize: 18, color: "primary.main" }} />
        {mode === "create" ? "Calibrate from Lighthouse" : "Recalibrate from Lighthouse"}
      </DialogTitle>
      <DialogContent dividers>
        {!parsed && (
          <Stack spacing={2}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Upload a Lighthouse JSON (Chrome DevTools → Lighthouse → "Save as JSON") or paste the contents below.
              The simulator's scoring curves will be fitted so its overall score matches the real run within 1 point.
            </Typography>
            <Box>
              <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleFileChange} />
              <Button
                variant="outlined" size="small" startIcon={<FileUpload sx={{ fontSize: 15 }} />}
                onClick={() => fileRef.current?.click()}
              >
                Upload JSON file
              </Button>
            </Box>
            <Divider>or paste</Divider>
            <TextField
              multiline minRows={6} maxRows={12} fullWidth size="small"
              placeholder='{"lighthouseVersion":"…","categories":{…},"audits":{…}}'
              value={text}
              onChange={(e) => setText(e.target.value)}
              inputProps={{ style: { fontFamily: "monospace", fontSize: "0.72rem" } }}
            />
            <Box>
              <Button variant="contained" size="small" onClick={handlePasteSubmit} disabled={!text.trim()}>
                Parse pasted JSON
              </Button>
            </Box>
            {error && <Alert severity="error" sx={{ fontSize: "0.78rem" }}>{error}</Alert>}
          </Stack>
        )}

        {parsed && (
          <Stack spacing={2}>
            <Box>
              <Typography variant="overline" sx={{ color: "text.secondary", fontSize: "0.65rem", fontWeight: 700 }}>
                Source
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.82rem", wordBreak: "break-all" }}>
                {parsed.sourceUrl || "(no URL)"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                Lighthouse {parsed.lhVersion || "?"} · fetched {parsed.fetchTime}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                Calibration profile: <strong>{parsed.formFactor === "desktop" ? "Desktop" : "Mobile"}</strong>
                {" · "}CPU {parsed.cpuSlowdownMultiplier}×
                {parsed.throttlingRttMs != null ? ` · ${parsed.throttlingRttMs} ms RTT` : ""}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Real overall</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>{parsed.realScore}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>Simulated overall</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>{parsed.simulatedOverall}</Typography>
              </Box>
              <Chip
                size="small"
                color={deltaColor}
                label={`Δ ${delta >= 0 ? "+" : ""}${delta}`}
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Box>
              <Typography variant="overline" sx={{ color: "text.secondary", fontSize: "0.65rem", fontWeight: 700 }}>
                Page meta
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                TTFB {parsed.pageMeta.ttfb} ms · CDN {parsed.pageMeta.cdn ? "on" : "off"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="overline" sx={{ color: "text.secondary", fontSize: "0.65rem", fontWeight: 700 }}>
                Resources
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                {(() => {
                  const sumKB = (pred) => parsed.resources.filter(pred).reduce((s, r) => s + (r.sizeKB ?? 0) * (r.count ?? 1), 0);
                  const html = sumKB((r) => r.type === "html");
                  const css  = sumKB((r) => r.type === "css");
                  const js   = sumKB((r) => r.type === "js");
                  const fnt  = sumKB((r) => r.type === "font");
                  return `${parsed.resources.length} requests · HTML ${html.toFixed(1)} KB · CSS ${css.toFixed(1)} KB · JS ${js.toFixed(1)} KB · Fonts ${fnt.toFixed(1)} KB`;
                })()}
              </Typography>
            </Box>

            <Box>
              <Typography variant="overline" sx={{ color: "text.secondary", fontSize: "0.65rem", fontWeight: 700 }}>
                Fitted curves vs default (median / p10)
              </Typography>
              <Table size="small" sx={{ mt: 0.5, "& td, & th": { fontSize: "0.72rem", py: 0.4 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell>Real</TableCell>
                    <TableCell>LH score</TableCell>
                    <TableCell>Default</TableCell>
                    <TableCell>Fitted</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {METRIC_KEYS.map((m) => {
                    const def = DEFAULT_SETTINGS.scoringCurves[m];
                    const fit = parsed.fittedCurves[m];
                    const digits = m === "cls" ? 2 : 0;
                    return (
                      <TableRow key={m}>
                        <TableCell sx={{ fontWeight: 700 }}>{METRIC_LABELS[m]}</TableCell>
                        <TableCell>{fmt(parsed.realMetrics[m], digits)}</TableCell>
                        <TableCell>{parsed.realMetricScores[m]}</TableCell>
                        <TableCell>{fmt(def.median, digits)} / {fmt(def.p10, digits)}</TableCell>
                        <TableCell>{fmt(fit.median, digits)} / {fmt(fit.p10, digits)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>

            <Button variant="text" size="small" onClick={reset} sx={{ alignSelf: "flex-start" }}>
              Upload a different report
            </Button>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button size="small" onClick={handleClose}>Cancel</Button>
        <Button size="small" variant="contained" disabled={!parsed} onClick={handleApply}>
          {mode === "create" ? "Create page" : "Apply recalibration"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
