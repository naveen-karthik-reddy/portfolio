import { useMemo, useState } from "react";
import {
  Box, Typography, Paper, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TableSortLabel, Skeleton, Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { deriveAll, fmt, solidPaperBg } from "../utils";

function RiskFlag({ beta, de, isDark }) {
  const isHigh = (beta != null && beta > 1.3) && (de != null && de > 1.5);
  const isWatch = !isHigh && ((beta != null && beta > 1.3) || (de != null && de > 1.5));
  if (isHigh) return (
    <Chip label="High" size="small" sx={{
      bgcolor: isDark ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.10)",
      color: "error.main", fontWeight: 700, fontSize: "0.7rem",
    }} />
  );
  if (isWatch) return (
    <Chip label="Watch" size="small" sx={{
      bgcolor: isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.10)",
      color: "warning.main", fontWeight: 700, fontSize: "0.7rem",
    }} />
  );
  return (
    <Chip label="Low" size="small" sx={{
      bgcolor: isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.10)",
      color: "success.main", fontWeight: 700, fontSize: "0.7rem",
    }} />
  );
}

function RangeBar({ low, high, ltp }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const trackBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  if (low == null || high == null || high <= low) {
    return <Box sx={{ height: 6, bgcolor: trackBg, borderRadius: 3 }} />;
  }
  const pos = Math.max(0, Math.min(1, (ltp - low) / (high - low)));
  const dotColor = pos > 0.7 ? "success.main" : pos < 0.3 ? "error.main" : "warning.main";
  return (
    <Box sx={{ position: "relative", height: 6, bgcolor: trackBg, borderRadius: 3 }}>
      <Box sx={{
        position: "absolute",
        left: `${pos * 100}%`,
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 10,
        height: 10,
        borderRadius: "50%",
        bgcolor: dotColor,
        border: "2px solid",
        borderColor: "background.paper",
        zIndex: 1,
      }} />
    </Box>
  );
}

const SORT_COLS = ["beta", "fiftyTwoWeekLow", "ltp", "fiftyTwoWeekHigh", "position", "debtToEquity", "currentRatio"];

export default function Risk({ holdings, dividendData }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("beta");
  const derived = useMemo(() => deriveAll(holdings), [holdings]);

  const rows = useMemo(() => derived.map(h => {
    const dd = dividendData[h.instrument] ?? {};
    const { fiftyTwoWeekLow: low, fiftyTwoWeekHigh: high } = dd;
    const position = (low != null && high != null && high > low)
      ? ((h.ltp - low) / (high - low)) * 100
      : null;
    return { ...h, ...dd, position };
  }), [derived, dividendData]);

  const handleSort = (col) => {
    if (orderBy === col) setOrder(o => o === "asc" ? "desc" : "asc");
    else { setOrderBy(col); setOrder("desc"); }
  };

  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const av = a[orderBy], bv = b[orderBy];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return order === "asc" ? av - bv : bv - av;
  }), [rows, order, orderBy]);

  const isLoading = rows.some(r => r.loading);

  const { portfolioBeta, avgDE, highRiskCount } = useMemo(() => {
    let betaNumer = 0, betaDenom = 0;
    let deSum = 0, deCount = 0;
    let high = 0;
    rows.forEach(r => {
      if (r.beta != null && r.curVal > 0) { betaNumer += r.beta * r.curVal; betaDenom += r.curVal; }
      if (r.debtToEquity != null) { deSum += r.debtToEquity; deCount++; }
      if ((r.beta != null && r.beta > 1.3) || (r.debtToEquity != null && r.debtToEquity > 1.5)) high++;
    });
    return {
      portfolioBeta: betaDenom > 0 ? betaNumer / betaDenom : null,
      avgDE: deCount > 0 ? deSum / deCount : null,
      highRiskCount: high,
    };
  }, [rows]);

  const cardStyle = { p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%" };

  const summaryCards = [
    {
      label: "PORTFOLIO BETA",
      value: portfolioBeta != null ? portfolioBeta.toFixed(2) : "—",
      sub: "Value-weighted market sensitivity",
      color: portfolioBeta != null ? (portfolioBeta < 0.8 ? "success.main" : portfolioBeta > 1.3 ? "error.main" : undefined) : undefined,
      showSkeleton: true,
    },
    {
      label: "AVG DEBT / EQUITY",
      value: avgDE != null ? avgDE.toFixed(2) : "—",
      sub: "Average across holdings",
      color: avgDE != null ? (avgDE < 0.5 ? "success.main" : avgDE > 1.5 ? "error.main" : undefined) : undefined,
      showSkeleton: true,
    },
    {
      label: "HIGH RISK HOLDINGS",
      value: String(highRiskCount),
      sub: "Beta > 1.3 or D/E > 1.5",
      color: highRiskCount > 5 ? "error.main" : highRiskCount > 2 ? "warning.main" : "success.main",
      showSkeleton: false,
    },
  ];

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map(c => (
          <Grid key={c.label} size={{ xs: 12, sm: 4 }}>
            <Paper sx={cardStyle}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.08em">{c.label}</Typography>
              {isLoading && c.showSkeleton
                ? <Skeleton width={80} height={36} />
                : <Typography variant="h5" fontWeight={900} color={c.color ?? "text.primary"} sx={{ mt: 0.5 }}>{c.value}</Typography>
              }
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>{c.sub}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.73rem", letterSpacing: "0.07em", bgcolor: t => solidPaperBg(t), color: "text.secondary", whiteSpace: "nowrap", borderBottom: "2px solid", borderBottomColor: "divider" }}>
                  Stock
                </TableCell>
                {[
                  { id: "beta", label: "Beta" },
                  { id: "fiftyTwoWeekLow", label: "52W Low" },
                  { id: "ltp", label: "LTP" },
                  { id: "fiftyTwoWeekHigh", label: "52W High" },
                  { id: "position", label: "Position" },
                  { id: "debtToEquity", label: "D/E" },
                  { id: "currentRatio", label: "Curr. Ratio" },
                ].map(col => (
                  <TableCell key={col.id} align="right" sx={{ fontWeight: 700, fontSize: "0.73rem", letterSpacing: "0.07em", bgcolor: t => solidPaperBg(t), color: "text.secondary", whiteSpace: "nowrap", borderBottom: "2px solid", borderBottomColor: "divider" }}>
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "desc"}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="left" sx={{ fontWeight: 700, fontSize: "0.73rem", letterSpacing: "0.07em", bgcolor: t => solidPaperBg(t), color: "text.secondary", borderBottom: "2px solid", borderBottomColor: "divider" }}>
                  Risk
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.73rem", letterSpacing: "0.07em", bgcolor: t => solidPaperBg(t), color: "text.secondary", borderBottom: "2px solid", borderBottomColor: "divider", minWidth: 130 }}>
                  52W Range
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map(row => (
                <TableRow key={row.instrument} hover>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", whiteSpace: "nowrap" }}>{row.instrument}</TableCell>
                  {row.loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableCell key={i} align="right"><Skeleton width={50} sx={{ ml: "auto" }} /></TableCell>
                    ))
                  ) : (
                    <>
                      <TableCell align="right" sx={{
                        fontSize: "0.8rem",
                        color: row.beta != null ? (row.beta > 1.3 ? "error.main" : row.beta < 0.8 ? "success.main" : undefined) : undefined,
                        fontWeight: row.beta != null && row.beta > 1.3 ? 700 : 400,
                      }}>
                        {row.beta != null ? parseFloat(row.beta).toFixed(2) : "—"}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                        {row.fiftyTwoWeekLow != null ? `₹${fmt(row.fiftyTwoWeekLow)}` : "—"}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>₹{fmt(row.ltp)}</TableCell>
                      <TableCell align="right" sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                        {row.fiftyTwoWeekHigh != null ? `₹${fmt(row.fiftyTwoWeekHigh)}` : "—"}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: "0.8rem" }}>
                        {row.position != null ? `${row.position.toFixed(0)}%` : "—"}
                      </TableCell>
                      <TableCell align="right" sx={{
                        fontSize: "0.8rem",
                        color: row.debtToEquity != null ? (row.debtToEquity > 1.5 ? "error.main" : row.debtToEquity < 0.5 ? "success.main" : undefined) : undefined,
                      }}>
                        {row.debtToEquity != null ? parseFloat(row.debtToEquity).toFixed(2) : "—"}
                      </TableCell>
                      <TableCell align="right" sx={{
                        fontSize: "0.8rem",
                        color: row.currentRatio != null ? (row.currentRatio > 2 ? "success.main" : row.currentRatio < 1 ? "error.main" : undefined) : undefined,
                      }}>
                        {row.currentRatio != null ? parseFloat(row.currentRatio).toFixed(2) : "—"}
                      </TableCell>
                      <TableCell align="left">
                        <RiskFlag beta={row.beta} de={row.debtToEquity} isDark={isDark} />
                      </TableCell>
                    </>
                  )}
                  <TableCell sx={{ minWidth: 130, py: 1.5 }}>
                    {row.loading
                      ? <Skeleton height={6} />
                      : <RangeBar low={row.fiftyTwoWeekLow} high={row.fiftyTwoWeekHigh} ltp={row.ltp} />
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
