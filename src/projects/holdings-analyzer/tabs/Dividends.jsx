import { useMemo, useState } from "react";
import {
  Box, Typography, Paper, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Skeleton, Chip, TextField,
  Alert, Button,
} from "@mui/material";
import { MonetizationOn, InfoOutlined, Refresh } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as ReTip,
} from "recharts";
import { deriveAll, fmt, fmtCur, isETF, solidPaperBg } from "../utils";

/* ── Helpers ── */
function payoutChipInfo(ratio, isDark) {
  if (ratio == null) return null;
  const pct = ratio * 100;
  if (pct < 60) return { label: `${pct.toFixed(0)}% · Safe`, bgcolor: isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.10)", color: "success.main" };
  if (pct < 80) return { label: `${pct.toFixed(0)}% · Moderate`, bgcolor: isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.10)", color: "warning.main" };
  return { label: `${pct.toFixed(0)}% · Risky`, bgcolor: isDark ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.10)", color: "error.main" };
}

function fmtDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function isUpcoming(str) {
  if (!str) return false;
  const d = new Date(str);
  const diff = d - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

/* ── Inline-editable yield % cell ── */
function YieldCell({ value, loading, error, onCommit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (loading) return <TableCell align="right"><Skeleton width={60} sx={{ ml: "auto" }} /></TableCell>;

  const start = () => { setDraft(value !== null ? String(value) : ""); setEditing(true); };
  const commit = () => {
    setEditing(false);
    const v = parseFloat(draft);
    onCommit(isNaN(v) ? null : v);
  };
  const cancel = () => setEditing(false);

  if (editing) {
    return (
      <TableCell align="right" sx={{ p: "4px 6px" }}>
        <TextField
          size="small"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
          autoFocus
          placeholder="0.00"
          sx={{ width: 90 }}
          inputProps={{ style: { textAlign: "right", padding: "4px 8px", fontSize: "0.8rem" } }}
        />
      </TableCell>
    );
  }

  return (
    <TableCell
      align="right"
      onClick={start}
      sx={{
        fontSize: "0.8rem",
        cursor: "text",
        "&:hover": { bgcolor: "action.hover" },
        color: error && value === null ? "text.disabled" : "text.primary",
      }}
    >
      {value !== null && value !== undefined
        ? `${parseFloat(value).toFixed(2)}%`
        : (error ? "Fetch failed" : "—")}
    </TableCell>
  );
}

export default function Dividends({ holdings, dividendData, dividendOverrides, setDividendOverrides, onRetry }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const tickColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  const derived = useMemo(() => deriveAll(holdings), [holdings]);

  const rows = useMemo(() => derived.map(h => {
    const dd = dividendData[h.instrument];
    const fetchedYield = dd?.yieldPct ?? null;
    const effectiveYield = dividendOverrides[h.instrument] !== undefined
      ? dividendOverrides[h.instrument]
      : fetchedYield;
    const annualIncome = effectiveYield !== null && h.ltp > 0
      ? h.qty * h.ltp * effectiveYield / 100
      : 0;
    return {
      instrument: h.instrument,
      qty: h.qty,
      ltp: h.ltp,
      loading: dd?.loading ?? true,
      error: dd?.error ?? false,
      effectiveYield,
      fiveYearAvgYield: dd?.fiveYearAvgYield ?? null,
      payoutRatio: dd?.payoutRatio ?? null,
      exDividendDate: dd?.exDividendDate ?? null,
      annualIncome,
      isEtf: isETF(h.instrument),
    };
  }), [derived, dividendData, dividendOverrides]);

  const totalAnnualIncome = rows.reduce((s, r) => s + r.annualIncome, 0);
  const payingCount = rows.filter(r => r.annualIncome > 0).length;
  const isAnyLoading = rows.some(r => r.loading);
  const isAnyError = rows.some(r => r.error);

  const barData = useMemo(() => (
    [...rows]
      .filter(r => r.annualIncome > 0)
      .sort((a, b) => b.annualIncome - a.annualIncome)
      .slice(0, 10)
      .map(r => ({ name: r.instrument, income: parseFloat(r.annualIncome.toFixed(2)) }))
  ), [rows]);

  const tipStyle = {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    fontSize: 12,
  };

  return (
    <Box>
      {/* Top section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <MonetizationOn fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.08em">
                ANNUAL DIVIDEND INCOME
              </Typography>
            </Box>
            {isAnyLoading ? (
              <Skeleton width={160} height={40} />
            ) : (
              <Typography variant="h5" fontWeight={900} color="success.main">
                {fmtCur(totalAnnualIncome)}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              {payingCount} of {rows.length} stocks pay dividends
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 8 }}>
          <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%" }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="text.secondary" letterSpacing="0.08em">
              TOP DIVIDEND EARNERS
            </Typography>
            {isAnyLoading ? (
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
            ) : barData.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ pt: 2 }}>
                No dividend data yet.
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={barData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <ReTip formatter={v => [fmtCur(v), "Annual Income"]} contentStyle={tipStyle} cursor={false} />
                  <Bar dataKey="income" radius={[4, 4, 0, 0]} fill={theme.palette.success.main} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Info / error note */}
      {isAnyError && !isAnyLoading ? (
        <Alert
          severity="warning"
          icon={<InfoOutlined fontSize="small" />}
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button size="small" startIcon={<Refresh />} onClick={onRetry} sx={{ fontWeight: 700 }}>
              Retry
            </Button>
          }
        >
          Could not fetch dividend data. Click any <strong>Yield %</strong> cell to enter values manually.
        </Alert>
      ) : (
        <Alert severity="info" icon={<InfoOutlined fontSize="small" />} sx={{ mb: 2, borderRadius: 2 }}>
          Dividend yields sourced from NSE data. Click any <strong>Yield %</strong> cell to override. 5Y Avg shows the 5-year average yield.
        </Alert>
      )}

      {/* Dividend table */}
      <Paper sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 460 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {["Stock", "Qty", "LTP", "Yield % (editable)", "5Y Avg Yield", "Payout Ratio", "Ex-Div Date", "Annual Income", "Type"].map(h => (
                  <TableCell
                    key={h}
                    align={h === "Stock" || h === "Type" ? "left" : "right"}
                    sx={{ fontWeight: 700, fontSize: "0.73rem", letterSpacing: "0.07em", bgcolor: t => solidPaperBg(t), color: "text.secondary", whiteSpace: "nowrap", borderBottom: "2px solid", borderBottomColor: "divider" }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => {
                const payout = payoutChipInfo(row.payoutRatio, isDark);
                return (
                  <TableRow key={row.instrument} hover>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem" }}>{row.instrument}</TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.8rem" }}>{fmt(row.qty)}</TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.8rem" }}>₹{fmt(row.ltp)}</TableCell>

                    <YieldCell
                      value={row.effectiveYield}
                      loading={row.loading}
                      error={row.error}
                      onCommit={v => setDividendOverrides(prev => {
                        if (v === null) { const next = { ...prev }; delete next[row.instrument]; return next; }
                        return { ...prev, [row.instrument]: v };
                      })}
                    />

                    {/* 5Y Avg Yield */}
                    {row.loading ? (
                      <TableCell align="right"><Skeleton width={50} sx={{ ml: "auto" }} /></TableCell>
                    ) : (
                      <TableCell align="right" sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                        {row.fiveYearAvgYield !== null ? `${parseFloat(row.fiveYearAvgYield).toFixed(2)}%` : "—"}
                      </TableCell>
                    )}

                    {/* Payout Ratio */}
                    {row.loading ? (
                      <TableCell align="right"><Skeleton width={80} sx={{ ml: "auto" }} /></TableCell>
                    ) : (
                      <TableCell align="right" sx={{ fontSize: "0.8rem" }}>
                        {payout ? (
                          <Chip label={payout.label} size="small" sx={{ fontWeight: 700, fontSize: "0.68rem", bgcolor: payout.bgcolor, color: payout.color }} />
                        ) : "—"}
                      </TableCell>
                    )}

                    {/* Ex-Div Date */}
                    {row.loading ? (
                      <TableCell align="right"><Skeleton width={80} sx={{ ml: "auto" }} /></TableCell>
                    ) : (
                      <TableCell align="right" sx={{ fontSize: "0.8rem", color: isUpcoming(row.exDividendDate) ? "warning.main" : "text.secondary", fontWeight: isUpcoming(row.exDividendDate) ? 700 : 400 }}>
                        {fmtDate(row.exDividendDate)}
                      </TableCell>
                    )}

                    {/* Annual Income */}
                    {row.loading ? (
                      <TableCell align="right"><Skeleton width={70} sx={{ ml: "auto" }} /></TableCell>
                    ) : (
                      <TableCell align="right" sx={{ fontSize: "0.8rem", fontWeight: 600, color: row.annualIncome > 0 ? "success.main" : "text.secondary" }}>
                        {row.annualIncome > 0 ? fmtCur(row.annualIncome) : "—"}
                      </TableCell>
                    )}

                    <TableCell>
                      <Chip
                        label={row.isEtf ? "Growth ETF" : "Equity"}
                        size="small"
                        sx={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          bgcolor: row.isEtf
                            ? isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)"
                            : isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.08)",
                          color: row.isEtf ? "primary.main" : "success.main",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
