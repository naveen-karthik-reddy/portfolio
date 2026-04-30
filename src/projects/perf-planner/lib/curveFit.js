// Fits per-metric scoring curves so the simulator's metric scores match
// a real Lighthouse run, then nudges all curves uniformly so the overall
// score matches too.

import { metricScore, computeScores } from "./calculator.js";
import { DEFAULT_SETTINGS } from "./defaultSettings.js";

const DEFAULT_CURVES = DEFAULT_SETTINGS.scoringCurves;
const METRIC_KEYS = ["fcp", "lcp", "tbt", "cls", "si"];

// Find scalar k ∈ [LO, HI] that scales a metric's median (and p10 to keep
// shape constant) so metricScore(value, m, scaled) matches targetScore.
function fitMetric(metricKey, value, targetScore) {
  const base = DEFAULT_CURVES[metricKey];
  if (!base) return base;
  if (!Number.isFinite(value) || value <= 0) return { ...base };

  let lo = 0.05, hi = 20;
  // metricScore is monotonically increasing in median (larger median =
  // more lenient = higher score) for the metric values we care about
  // (lower-is-better). Binary-search k.
  let bestK = 1;
  let bestErr = Infinity;
  for (let i = 0; i < 40; i++) {
    const k = (lo + hi) / 2;
    const scaled = { median: base.median * k, p10: base.p10 * k };
    const got = metricScore(value, metricKey, { [metricKey]: scaled });
    const err = got - targetScore;
    if (Math.abs(err) < bestErr) {
      bestErr = Math.abs(err);
      bestK = k;
    }
    if (Math.abs(err) <= 0.5) break;
    if (err < 0) lo = k; // got too low → curve too strict → larger k
    else         hi = k;
  }
  return { median: base.median * bestK, p10: base.p10 * bestK };
}

export function fitCurves(realMetrics, realMetricScores, realScore) {
  const fitted = {};
  for (const m of METRIC_KEYS) {
    const value = realMetrics[m];
    const target = realMetricScores[m];
    if (value == null || target == null) {
      fitted[m] = { ...DEFAULT_CURVES[m] };
      continue;
    }
    fitted[m] = fitMetric(m, value, target);
  }

  // Residual nudge: scale all curves by the same factor until simulated
  // overall matches the real overall within 1 point.
  const settings = { ...DEFAULT_SETTINGS, scoringCurves: fitted };
  let simulated = computeScores(realMetrics, settings).overall;
  if (Math.abs(simulated - realScore) <= 1) return fitted;

  let lo = 0.5, hi = 2;
  let best = { ...fitted };
  let bestErr = Math.abs(simulated - realScore);
  for (let i = 0; i < 12; i++) {
    const k = (lo + hi) / 2;
    const scaled = scaleAll(fitted, k);
    const got = computeScores(realMetrics, { ...DEFAULT_SETTINGS, scoringCurves: scaled }).overall;
    const err = got - realScore;
    if (Math.abs(err) < bestErr) {
      bestErr = Math.abs(err);
      best = scaled;
    }
    if (Math.abs(err) <= 1) return scaled;
    if (err < 0) lo = k;
    else         hi = k;
  }
  return best;
}

function scaleAll(curves, k) {
  const out = {};
  for (const m of METRIC_KEYS) {
    out[m] = { median: curves[m].median * k, p10: curves[m].p10 * k };
  }
  return out;
}
