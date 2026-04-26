import { useState, useMemo } from "react";
import {
  Box, Typography, Paper, Grid, TextField, Button,
  ToggleButtonGroup, ToggleButton, Divider, Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Tooltip as ReTip,
} from "recharts";
import { fmt, fmtCur } from "../utils";

/* ── Shared result row ── */
function ResultRow({ label, value, highlight }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={highlight ? 800 : 600} color={highlight ? "primary.main" : "text.primary"}>
        {value}
      </Typography>
    </Box>
  );
}

/* ── SIP Calculator ── */
function SIPCalc() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [monthly, setMonthly] = useState("10000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("10");

  const result = useMemo(() => {
    const P = parseFloat(monthly) || 0;
    const r = (parseFloat(rate) || 0) / 12 / 100;
    const n = (parseFloat(years) || 0) * 12;
    if (P <= 0 || r <= 0 || n <= 0) return null;
    const corpus = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = P * n;
    const gained = corpus - invested;
    return { corpus, invested, gained, pct: ((gained / invested) * 100).toFixed(1) };
  }, [monthly, rate, years]);

  const chartData = useMemo(() => {
    const P = parseFloat(monthly) || 0;
    const r = (parseFloat(rate) || 0) / 12 / 100;
    const yrs = Math.min(parseFloat(years) || 0, 40);
    return Array.from({ length: yrs + 1 }, (_, yr) => {
      const n = yr * 12;
      const invested = P * n;
      const corpus = n === 0 ? 0 : P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      return { year: yr, invested: Math.round(invested), corpus: Math.round(corpus) };
    });
  }, [monthly, rate, years]);

  const tipStyle = { background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, fontSize: 12 };
  const tickColor = isDark ? "#9ca3af" : "#6b7280";

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={2}>
          <TextField label="Monthly SIP (₹)" type="number" size="small" value={monthly} onChange={e => setMonthly(e.target.value)} />
          <TextField label="Expected Annual Return (%)" type="number" size="small" value={rate} onChange={e => setRate(e.target.value)} />
          <TextField label="Investment Period (Years)" type="number" size="small" value={years} onChange={e => setYears(e.target.value)} />
        </Stack>
        {result && (
          <Paper sx={{ mt: 3, p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Divider sx={{ mb: 1.5 }} />
            <ResultRow label="Total Invested" value={fmtCur(result.invested)} />
            <ResultRow label="Wealth Gained" value={fmtCur(result.gained)} />
            <Divider sx={{ my: 1 }} />
            <ResultRow label="Maturity Amount" value={fmtCur(result.corpus)} highlight />
            <ResultRow label="Absolute Returns" value={`${result.pct}%`} />
          </Paper>
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary" letterSpacing="0.08em">
            GROWTH PROJECTION
          </Typography>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gCorpus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} vertical={false} />
              <XAxis dataKey="year" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `Y${v}`} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1e7 ? `₹${(v / 1e7).toFixed(1)}Cr` : `₹${(v / 1e5).toFixed(0)}L`} />
              <ReTip formatter={(v, n) => [fmtCur(v), n === "corpus" ? "Corpus" : "Invested"]} contentStyle={tipStyle} />
              <Area type="monotone" dataKey="corpus" stroke={theme.palette.primary.main} fill="url(#gCorpus)" strokeWidth={2} />
              <Area type="monotone" dataKey="invested" stroke={theme.palette.success.main} fill="url(#gInvested)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

/* ── Lumpsum Calculator ── */
function LumpsumCalc() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("10");

  const result = useMemo(() => {
    const P = parseFloat(principal) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const n = parseFloat(years) || 0;
    if (P <= 0 || r <= 0 || n <= 0) return null;
    const fv = P * Math.pow(1 + r, n);
    const gained = fv - P;
    const cagr = (Math.pow(fv / P, 1 / n) - 1) * 100;
    return { fv, gained, pct: ((gained / P) * 100).toFixed(1), cagr: cagr.toFixed(2) };
  }, [principal, rate, years]);

  const chartData = useMemo(() => {
    const P = parseFloat(principal) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const yrs = Math.min(parseFloat(years) || 0, 40);
    return Array.from({ length: yrs + 1 }, (_, yr) => ({
      year: yr,
      value: Math.round(P * Math.pow(1 + r, yr)),
    }));
  }, [principal, rate, years]);

  const tipStyle = { background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, fontSize: 12 };
  const tickColor = isDark ? "#9ca3af" : "#6b7280";

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={2}>
          <TextField label="Principal Amount (₹)" type="number" size="small" value={principal} onChange={e => setPrincipal(e.target.value)} />
          <TextField label="Expected Annual Return (%)" type="number" size="small" value={rate} onChange={e => setRate(e.target.value)} />
          <TextField label="Investment Period (Years)" type="number" size="small" value={years} onChange={e => setYears(e.target.value)} />
        </Stack>
        {result && (
          <Paper sx={{ mt: 3, p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Divider sx={{ mb: 1.5 }} />
            <ResultRow label="Principal Invested" value={fmtCur(parseFloat(principal))} />
            <ResultRow label="Wealth Gained" value={fmtCur(result.gained)} />
            <ResultRow label="Absolute Returns" value={`${result.pct}%`} />
            <Divider sx={{ my: 1 }} />
            <ResultRow label="Future Value" value={fmtCur(result.fv)} highlight />
            <ResultRow label="CAGR" value={`${result.cagr}%`} />
          </Paper>
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary" letterSpacing="0.08em">
            VALUE OVER TIME
          </Typography>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} vertical={false} />
              <XAxis dataKey="year" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `Y${v}`} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1e7 ? `₹${(v / 1e7).toFixed(1)}Cr` : `₹${(v / 1e5).toFixed(0)}L`} />
              <ReTip formatter={v => [fmtCur(v), "Value"]} contentStyle={tipStyle} />
              <Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

/* ── Goal Calculator ── */
function GoalCalc() {
  const [target, setTarget] = useState("10000000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("15");

  const result = useMemo(() => {
    const fv = parseFloat(target) || 0;
    const r = (parseFloat(rate) || 0) / 12 / 100;
    const n = (parseFloat(years) || 0) * 12;
    if (fv <= 0 || r <= 0 || n <= 0) return null;
    const sip = (fv * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
    const invested = sip * n;
    const gained = fv - invested;
    return { sip, invested, gained };
  }, [target, rate, years]);

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={2}>
          <TextField label="Target Amount (₹)" type="number" size="small" value={target} onChange={e => setTarget(e.target.value)} />
          <TextField label="Expected Annual Return (%)" type="number" size="small" value={rate} onChange={e => setRate(e.target.value)} />
          <TextField label="Time Horizon (Years)" type="number" size="small" value={years} onChange={e => setYears(e.target.value)} />
        </Stack>
        {result && (
          <Paper sx={{ mt: 3, p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Divider sx={{ mb: 1.5 }} />
            <ResultRow label="Monthly SIP Required" value={fmtCur(result.sip)} highlight />
            <ResultRow label="Total Invested" value={fmtCur(result.invested)} />
            <ResultRow label="Wealth Gained" value={fmtCur(result.gained)} />
            <ResultRow label="Target Corpus" value={fmtCur(parseFloat(target))} />
          </Paper>
        )}
      </Grid>
    </Grid>
  );
}

/* ── CAGR Calculator ── */
function CAGRCalc() {
  const theme = useTheme();
  const grad = `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;
  const [initial, setInitial] = useState("100000");
  const [final, setFinal] = useState("250000");
  const [years, setYears] = useState("5");

  const result = useMemo(() => {
    const pv = parseFloat(initial) || 0;
    const fv = parseFloat(final) || 0;
    const n = parseFloat(years) || 0;
    if (pv <= 0 || fv <= 0 || n <= 0) return null;
    const cagr = (Math.pow(fv / pv, 1 / n) - 1) * 100;
    const absolute = ((fv - pv) / pv) * 100;
    return { cagr: cagr.toFixed(2), absolute: absolute.toFixed(1), gain: fv - pv };
  }, [initial, final, years]);

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={2}>
          <TextField label="Initial Investment (₹)" type="number" size="small" value={initial} onChange={e => setInitial(e.target.value)} />
          <TextField label="Final Value (₹)" type="number" size="small" value={final} onChange={e => setFinal(e.target.value)} />
          <TextField label="Duration (Years)" type="number" size="small" value={years} onChange={e => setYears(e.target.value)} />
        </Stack>

        {result && (
          <Paper sx={{ mt: 3, p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.1em">CAGR</Typography>
            <Typography
              variant="h2"
              fontWeight={900}
              sx={{ background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1, my: 1 }}
            >
              {result.cagr}%
            </Typography>
            <Divider sx={{ my: 2 }} />
            <ResultRow label="Gain" value={fmtCur(result.gain)} />
            <ResultRow label="Absolute Return" value={`${result.absolute}%`} />
          </Paper>
        )}
      </Grid>
    </Grid>
  );
}

/* ══════════════════════════════════════════
   ROOT
══════════════════════════════════════════ */
const CALCS = ["SIP", "Lumpsum", "Goal", "CAGR"];

export default function Calculators() {
  const [active, setActive] = useState("SIP");

  return (
    <Box>
      {/* Calculator selector */}
      <Box sx={{ mb: 3, overflowX: "auto" }}>
        <ToggleButtonGroup
          value={active}
          exclusive
          onChange={(_, v) => { if (v) setActive(v); }}
          size="small"
          sx={{ gap: 1, flexWrap: "wrap" }}
        >
          {CALCS.map(c => (
            <ToggleButton
              key={c}
              value={c}
              sx={{
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.04em",
                px: 2,
                border: "1px solid !important",
                borderRadius: "8px !important",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                },
              }}
            >
              {c}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Active calculator */}
      <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        {active === "SIP" && <SIPCalc />}
        {active === "Lumpsum" && <LumpsumCalc />}
        {active === "Goal" && <GoalCalc />}
        {active === "CAGR" && <CAGRCalc />}
      </Paper>
    </Box>
  );
}
