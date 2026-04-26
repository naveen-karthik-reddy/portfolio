import { useMemo, useState } from "react";
import {
  Box, Typography, Paper, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TableSortLabel, Skeleton,
} from "@mui/material";
import { deriveAll, solidPaperBg } from "../utils";

function pct(v) {
  if (v == null) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function num(v, d = 1) {
  if (v == null) return "—";
  return parseFloat(v).toFixed(d);
}

function MetricCell({ value, format, thresholds, loading }) {
  if (loading) return <TableCell align="right"><Skeleton width={50} sx={{ ml: "auto" }} /></TableCell>;
  let color;
  if (thresholds && value != null) {
    if (thresholds.green(value)) color = "success.main";
    else if (thresholds.red(value)) color = "error.main";
  }
  return (
    <TableCell align="right" sx={{ fontSize: "0.78rem", color, fontWeight: color ? 600 : 400 }}>
      {format(value)}
    </TableCell>
  );
}

const COLS = [
  { id: "trailingPe",       label: "P/E (TTM)" },
  { id: "forwardPe",        label: "Fwd P/E" },
  { id: "priceToBook",      label: "P/B" },
  { id: "evToEbitda",       label: "EV/EBITDA" },
  { id: "pegRatio",         label: "PEG" },
  { id: "returnOnEquity",   label: "ROE" },
  { id: "returnOnAssets",   label: "ROA" },
  { id: "profitMargins",    label: "Net Margin" },
  { id: "revenueGrowth",    label: "Rev Growth" },
  { id: "trailingEps",      label: "EPS (TTM)" },
];

export default function Fundamentals({ holdings, dividendData }) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("trailingPe");
  const derived = useMemo(() => deriveAll(holdings), [holdings]);

  const rows = useMemo(() => derived.map(h => {
    const dd = dividendData[h.instrument] ?? {};
    return { ...h, ...dd };
  }), [derived, dividendData]);

  const handleSort = (col) => {
    if (orderBy === col) setOrder(o => o === "asc" ? "desc" : "asc");
    else { setOrderBy(col); setOrder("asc"); }
  };

  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const av = a[orderBy], bv = b[orderBy];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return order === "asc" ? av - bv : bv - av;
  }), [rows, order, orderBy]);

  const isLoading = rows.some(r => r.loading);

  const { weightedPe, avgRoe, avgRevGrowth } = useMemo(() => {
    let peNumer = 0, peDenom = 0;
    let roeSum = 0, roeCount = 0;
    let rgSum = 0, rgCount = 0;
    rows.forEach(r => {
      if (r.trailingPe != null && r.curVal > 0) { peNumer += r.trailingPe * r.curVal; peDenom += r.curVal; }
      if (r.returnOnEquity != null) { roeSum += r.returnOnEquity; roeCount++; }
      if (r.revenueGrowth != null) { rgSum += r.revenueGrowth; rgCount++; }
    });
    return {
      weightedPe: peDenom > 0 ? peNumer / peDenom : null,
      avgRoe: roeCount > 0 ? roeSum / roeCount : null,
      avgRevGrowth: rgCount > 0 ? rgSum / rgCount : null,
    };
  }, [rows]);

  const cardStyle = { p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%" };

  const summaryCards = [
    {
      label: "PORTFOLIO AVG P/E",
      value: weightedPe != null ? weightedPe.toFixed(1) : "—",
      sub: "Value-weighted trailing P/E",
      color: weightedPe != null ? (weightedPe < 15 ? "success.main" : weightedPe > 25 ? "error.main" : undefined) : undefined,
    },
    {
      label: "AVG ROE",
      value: avgRoe != null ? pct(avgRoe) : "—",
      sub: "Return on equity",
      color: avgRoe != null ? (avgRoe > 0.15 ? "success.main" : avgRoe < 0 ? "error.main" : undefined) : undefined,
    },
    {
      label: "AVG REV GROWTH",
      value: avgRevGrowth != null ? pct(avgRevGrowth) : "—",
      sub: "Revenue growth (YoY)",
      color: avgRevGrowth != null ? (avgRevGrowth > 0.10 ? "success.main" : avgRevGrowth < 0 ? "error.main" : undefined) : undefined,
    },
  ];

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map(c => (
          <Grid key={c.label} size={{ xs: 12, sm: 4 }}>
            <Paper sx={cardStyle}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.08em">{c.label}</Typography>
              {isLoading
                ? <Skeleton width={100} height={36} />
                : <Typography variant="h5" fontWeight={900} color={c.color ?? "text.primary"} sx={{ mt: 0.5 }}>{c.value}</Typography>
              }
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>{c.sub}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.73rem", letterSpacing: "0.07em", bgcolor: t => solidPaperBg(t), color: "text.secondary", whiteSpace: "nowrap", borderBottom: "2px solid", borderBottomColor: "divider" }}>
                  Stock
                </TableCell>
                {COLS.map(col => (
                  <TableCell key={col.id} align="right" sx={{ fontWeight: 700, fontSize: "0.73rem", letterSpacing: "0.07em", bgcolor: t => solidPaperBg(t), color: "text.secondary", whiteSpace: "nowrap", borderBottom: "2px solid", borderBottomColor: "divider" }}>
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map(row => (
                <TableRow key={row.instrument} hover>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", whiteSpace: "nowrap" }}>{row.instrument}</TableCell>
                  <MetricCell value={row.trailingPe} loading={row.loading} format={v => v == null ? "—" : num(v)}
                    thresholds={{ green: v => v > 0 && v < 15, red: v => v > 25 }} />
                  <MetricCell value={row.forwardPe} loading={row.loading} format={v => v == null ? "—" : num(v)}
                    thresholds={{ green: v => v > 0 && v < 15, red: v => v > 25 }} />
                  <MetricCell value={row.priceToBook} loading={row.loading} format={v => v == null ? "—" : num(v)}
                    thresholds={{ green: v => v > 0 && v < 2, red: v => v > 5 }} />
                  <MetricCell value={row.evToEbitda} loading={row.loading} format={v => v == null ? "—" : num(v)}
                    thresholds={{ green: v => v > 0 && v < 10, red: v => v > 20 }} />
                  <MetricCell value={row.pegRatio} loading={row.loading} format={v => v == null ? "—" : num(v)}
                    thresholds={{ green: v => v > 0 && v < 1, red: v => v > 2 }} />
                  <MetricCell value={row.returnOnEquity} loading={row.loading} format={pct}
                    thresholds={{ green: v => v > 0.15, red: v => v < 0 }} />
                  <MetricCell value={row.returnOnAssets} loading={row.loading} format={pct}
                    thresholds={{ green: v => v > 0.08, red: v => v < 0 }} />
                  <MetricCell value={row.profitMargins} loading={row.loading} format={pct}
                    thresholds={{ green: v => v > 0.15, red: v => v < 0 }} />
                  <MetricCell value={row.revenueGrowth} loading={row.loading} format={pct}
                    thresholds={{ green: v => v > 0.10, red: v => v < 0 }} />
                  <MetricCell value={row.trailingEps} loading={row.loading}
                    format={v => v == null ? "—" : `₹${num(v, 2)}`} />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
