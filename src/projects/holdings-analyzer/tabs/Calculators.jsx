import { useState, useMemo } from "react";
import {
  Box, Typography, Paper, Grid, TextField, Divider, Stack, Tabs, Tab, Slider,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as ReTip, Legend,
} from "recharts";
import { fmtCur } from "../utils";

/* ── Shared helpers ── */
function ResultRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.75 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={600} color="text.primary">{value}</Typography>
    </Box>
  );
}

function ResultCard({ children }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Paper sx={{
      mt: 2.5,
      p: 2.5,
      border: "1px solid",
      borderColor: alpha(theme.palette.primary.main, 0.22),
      borderRadius: 2,
      background: isDark
        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.background.paper, 1)})`
        : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)}, ${theme.palette.background.paper})`,
    }}>
      {children}
    </Paper>
  );
}

/* ── Slider + TextField combo input ── */
function SliderInput({ label, value, onChange, min, max, step, formatDisplay }) {
  const theme = useTheme();
  const n = parseFloat(value) || 0;
  const clamped = Math.max(min, Math.min(max, n));
  const displayVal = formatDisplay ? formatDisplay(clamped) : clamped.toLocaleString("en-IN");

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.25 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.04em">
          {label}
        </Typography>
        <Typography variant="caption" fontWeight={800} color="primary.main">
          {displayVal}
        </Typography>
      </Box>
      <Slider
        size="small"
        min={min}
        max={max}
        step={step}
        value={clamped}
        onChange={(_, v) => onChange(String(v))}
        sx={{
          py: 0.5,
          color: "primary.main",
          "& .MuiSlider-thumb": { width: 14, height: 14 },
          "& .MuiSlider-rail": { opacity: 0.25 },
        }}
      />
      <TextField
        type="number"
        size="small"
        fullWidth
        value={value}
        onChange={e => onChange(e.target.value)}
        sx={{ mt: -0.25 }}
        inputProps={{ style: { fontSize: "0.8rem", padding: "5px 10px" } }}
      />
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
          <SliderInput label="Monthly SIP" value={monthly} onChange={setMonthly}
            min={500} max={100000} step={500}
            formatDisplay={v => `₹${v.toLocaleString("en-IN")}`} />
          <SliderInput label="Expected Annual Return" value={rate} onChange={setRate}
            min={1} max={30} step={0.5}
            formatDisplay={v => `${v}%`} />
          <SliderInput label="Investment Period" value={years} onChange={setYears}
            min={1} max={40} step={1}
            formatDisplay={v => `${v} yr`} />
        </Stack>
        {result && (
          <ResultCard>
            <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing="0.08em">MATURITY VALUE</Typography>
            <Typography variant="h4" fontWeight={900} color="primary.main" sx={{ my: 0.5 }}>
              {fmtCur(result.corpus)}
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <ResultRow label="Total Invested" value={fmtCur(result.invested)} />
            <ResultRow label="Wealth Gained" value={fmtCur(result.gained)} />
            <ResultRow label="Absolute Returns" value={`${result.pct}%`} />
          </ResultCard>
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%" }}>
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

  const fmtL = v => v >= 1e7 ? `₹${(v / 1e7).toFixed(1)}Cr` : `₹${(v / 1e5).toFixed(1)}L`;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={2}>
          <SliderInput label="Principal Amount" value={principal} onChange={setPrincipal}
            min={10000} max={10000000} step={10000}
            formatDisplay={fmtL} />
          <SliderInput label="Expected Annual Return" value={rate} onChange={setRate}
            min={1} max={30} step={0.5}
            formatDisplay={v => `${v}%`} />
          <SliderInput label="Investment Period" value={years} onChange={setYears}
            min={1} max={40} step={1}
            formatDisplay={v => `${v} yr`} />
        </Stack>
        {result && (
          <ResultCard>
            <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing="0.08em">FUTURE VALUE</Typography>
            <Typography variant="h4" fontWeight={900} color="primary.main" sx={{ my: 0.5 }}>
              {fmtCur(result.fv)}
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <ResultRow label="Principal Invested" value={fmtCur(parseFloat(principal))} />
            <ResultRow label="Wealth Gained" value={fmtCur(result.gained)} />
            <ResultRow label="Absolute Returns" value={`${result.pct}%`} />
            <ResultRow label="CAGR" value={`${result.cagr}%`} />
          </ResultCard>
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%" }}>
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
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
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
    return { sip, invested, gained, fv };
  }, [target, rate, years]);

  const pieData = result
    ? [
        { name: "You Invest", value: parseFloat(result.invested.toFixed(0)) },
        { name: "Market Returns", value: parseFloat(result.gained.toFixed(0)) },
      ]
    : [];

  const PIE_COLORS = [theme.palette.primary.main, theme.palette.success.main];
  const tipStyle = { background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, fontSize: 12 };

  const fmtCr = v => v >= 1e7 ? `₹${(v / 1e7).toFixed(1)}Cr` : `₹${(v / 1e5).toFixed(1)}L`;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={2}>
          <SliderInput label="Target Amount" value={target} onChange={setTarget}
            min={100000} max={100000000} step={100000}
            formatDisplay={fmtCr} />
          <SliderInput label="Expected Annual Return" value={rate} onChange={setRate}
            min={1} max={30} step={0.5}
            formatDisplay={v => `${v}%`} />
          <SliderInput label="Time Horizon" value={years} onChange={setYears}
            min={1} max={40} step={1}
            formatDisplay={v => `${v} yr`} />
        </Stack>
        {result && (
          <ResultCard>
            <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing="0.08em">MONTHLY SIP REQUIRED</Typography>
            <Typography variant="h4" fontWeight={900} color="primary.main" sx={{ my: 0.5 }}>
              {fmtCur(result.sip)}
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <ResultRow label="Total Invested" value={fmtCur(result.invested)} />
            <ResultRow label="Wealth Gained" value={fmtCur(result.gained)} />
            <ResultRow label="Target Corpus" value={fmtCur(result.fv)} />
          </ResultCard>
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary" letterSpacing="0.08em">
            CORPUS BREAKDOWN
          </Typography>
          {result ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <ReTip formatter={v => [fmtCur(v), ""]} contentStyle={tipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: "flex", justifyContent: "space-around", mt: 1 }}>
                {pieData.map((d, i) => (
                  <Box key={i} sx={{ textAlign: "center" }}>
                    <Typography variant="h6" fontWeight={800} sx={{ color: PIE_COLORS[i] }}>
                      {result.fv > 0 ? ((d.value / result.fv) * 100).toFixed(1) : 0}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{d.name}</Typography>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="body2" color="text.disabled">Enter values to see breakdown</Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}

/* ── CAGR Calculator ── */
function CAGRCalc() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
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
    return { cagr: cagr.toFixed(2), absolute: absolute.toFixed(1), gain: fv - pv, pv, fv, n };
  }, [initial, final, years]);

  const chartData = useMemo(() => {
    if (!result) return [];
    const pv = parseFloat(initial) || 0;
    const cagr = parseFloat(result.cagr) / 100;
    const n = Math.min(parseFloat(years) || 0, 40);
    return Array.from({ length: n + 1 }, (_, yr) => ({
      year: yr,
      value: Math.round(pv * Math.pow(1 + cagr, yr)),
    }));
  }, [result, initial, years]);

  const tipStyle = { background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, fontSize: 12 };
  const tickColor = isDark ? "#9ca3af" : "#6b7280";

  const fmtL = v => v >= 1e7 ? `₹${(v / 1e7).toFixed(1)}Cr` : `₹${(v / 1e5).toFixed(1)}L`;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={2}>
          <SliderInput label="Initial Investment" value={initial} onChange={setInitial}
            min={10000} max={10000000} step={10000}
            formatDisplay={fmtL} />
          <SliderInput label="Final Value" value={final} onChange={setFinal}
            min={10000} max={10000000} step={10000}
            formatDisplay={fmtL} />
          <SliderInput label="Duration" value={years} onChange={setYears}
            min={1} max={40} step={1}
            formatDisplay={v => `${v} yr`} />
        </Stack>
        {result && (
          <ResultCard>
            <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing="0.08em">CAGR</Typography>
            <Typography variant="h3" fontWeight={900}
              sx={{ background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1, my: 0.5 }}>
              {result.cagr}%
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <ResultRow label="Gain" value={fmtCur(result.gain)} />
            <ResultRow label="Absolute Return" value={`${result.absolute}%`} />
          </ResultCard>
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%" }}>
          <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary" letterSpacing="0.08em">
            COMPOUND GROWTH TRAJECTORY
          </Typography>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} vertical={false} />
                <XAxis dataKey="year" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `Y${v}`} />
                <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1e7 ? `₹${(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `₹${(v / 1e5).toFixed(0)}L` : `₹${(v / 1e3).toFixed(0)}k`} />
                <ReTip formatter={v => [fmtCur(v), "Value"]} contentStyle={tipStyle} />
                <Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="body2" color="text.disabled">Enter values to see growth trajectory</Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}

/* ══════════════════════════════════════════
   ROOT
══════════════════════════════════════════ */
const CALCS = ["SIP", "Lumpsum", "Goal", "CAGR"];

export default function Calculators() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <Box>
      {/* Tab-style selector */}
      <Box sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        mb: 3,
        bgcolor: isDark ? alpha(theme.palette.background.paper, 0.6) : theme.palette.background.paper,
        overflow: "hidden",
      }}>
        <Tabs
          value={activeIdx}
          onChange={(_, v) => setActiveIdx(v)}
          sx={{
            minHeight: 44,
            "& .MuiTabs-indicator": { height: 2, borderRadius: 1, bgcolor: "primary.main" },
            "& .MuiTab-root": {
              minHeight: 44,
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "none",
              color: "text.secondary",
              "&.Mui-selected": { color: "primary.main" },
            },
          }}
        >
          {CALCS.map(c => <Tab key={c} label={c} />)}
        </Tabs>
      </Box>

      {/* Active calculator */}
      <Paper sx={{ p: { xs: 2.5, sm: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        {activeIdx === 0 && <SIPCalc />}
        {activeIdx === 1 && <LumpsumCalc />}
        {activeIdx === 2 && <GoalCalc />}
        {activeIdx === 3 && <CAGRCalc />}
      </Paper>
    </Box>
  );
}
