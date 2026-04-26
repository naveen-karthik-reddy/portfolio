import { useMemo, useState } from "react";
import {
  Box, Typography, Paper, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TableSortLabel, Skeleton, Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as ReTip, Cell,
} from "recharts";
import { deriveAll, fmt, solidPaperBg } from "../utils";

function recInfo(v, isDark) {
  if (v == null) return null;
  if (v < 1.5) return { text: "Strong Buy", bgcolor: isDark ? "rgba(16,185,129,0.20)" : "rgba(16,185,129,0.12)", color: "success.main" };
  if (v < 2.5) return { text: "Buy", bgcolor: isDark ? "rgba(16,185,129,0.14)" : "rgba(16,185,129,0.08)", color: "success.main" };
  if (v < 3.5) return { text: "Hold", bgcolor: isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.10)", color: "warning.main" };
  if (v < 4.5) return { text: "Sell", bgcolor: isDark ? "rgba(239,68,68,0.16)" : "rgba(239,68,68,0.10)", color: "error.main" };
  return { text: "Strong Sell", bgcolor: isDark ? "rgba(239,68,68,0.22)" : "rgba(239,68,68,0.14)", color: "error.main" };
}

export default function Analyst({ holdings, dividendData }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const tickColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const tipStyle = {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    fontSize: 12,
  };

  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("upside");
  const derived = useMemo(() => deriveAll(holdings), [holdings]);

  const rows = useMemo(() => derived.map(h => {
    const dd = dividendData[h.instrument] ?? {};
    const upside = (dd.targetMeanPrice != null && h.ltp > 0)
      ? ((dd.targetMeanPrice - h.ltp) / h.ltp) * 100
      : null;
    return { ...h, ...dd, upside };
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

  const { avgUpside, strongBuys, sells } = useMemo(() => {
    const withUpside = rows.filter(r => r.upside != null);
    return {
      avgUpside: withUpside.length > 0
        ? withUpside.reduce((s, r) => s + r.upside, 0) / withUpside.length
        : null,
      strongBuys: rows.filter(r => r.recommendationMean != null && r.recommendationMean < 1.5).length,
      sells: rows.filter(r => r.recommendationMean != null && r.recommendationMean > 3.5).length,
    };
  }, [rows]);

  const chartData = useMemo(() => (
    [...rows]
      .filter(r => r.upside != null)
      .sort((a, b) => b.upside - a.upside)
      .map(r => ({ name: r.instrument, upside: parseFloat(r.upside.toFixed(1)) }))
  ), [rows]);

  const cardStyle = { p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%" };

  const summaryCards = [
    {
      label: "AVG UPSIDE TO TARGET",
      value: avgUpside != null ? `${avgUpside >= 0 ? "+" : ""}${avgUpside.toFixed(1)}%` : "—",
      sub: "Average analyst target vs LTP",
      color: avgUpside != null ? (avgUpside > 10 ? "success.main" : avgUpside < 0 ? "error.main" : undefined) : undefined,
      showSkeleton: true,
    },
    {
      label: "STRONG BUYS",
      value: String(strongBuys),
      sub: "Recommendation mean < 1.5",
      color: strongBuys >= 3 ? "success.main" : undefined,
      showSkeleton: false,
    },
    {
      label: "SELLS / STRONG SELLS",
      value: String(sells),
      sub: "Recommendation mean > 3.5",
      color: sells >= 3 ? "error.main" : undefined,
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
                ? <Skeleton width={100} height={36} />
                : <Typography variant="h5" fontWeight={900} color={c.color ?? "text.primary"} sx={{ mt: 0.5 }}>{c.value}</Typography>
              }
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>{c.sub}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {!isLoading && chartData.length > 0 && (
        <Paper sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2.5, mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="text.secondary" letterSpacing="0.08em">
            UPSIDE / DOWNSIDE TO ANALYST TARGET
          </Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v}%`} />
              <ReTip formatter={v => [`${v}%`, "Upside"]} contentStyle={tipStyle} cursor={false} />
              <Bar dataKey="upside" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.upside >= 0 ? theme.palette.success.main : theme.palette.error.main} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      <Paper sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 480 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.73rem", letterSpacing: "0.07em", bgcolor: t => solidPaperBg(t), color: "text.secondary", whiteSpace: "nowrap", borderBottom: "2px solid", borderBottomColor: "divider" }}>
                  Stock
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.73rem", letterSpacing: "0.07em", bgcolor: t => solidPaperBg(t), color: "text.secondary", whiteSpace: "nowrap", borderBottom: "2px solid", borderBottomColor: "divider" }}>
                  LTP
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.73rem", letterSpacing: "0.07em", bgcolor: t => solidPaperBg(t), color: "text.secondary", whiteSpace: "nowrap", borderBottom: "2px solid", borderBottomColor: "divider" }}>
                  <TableSortLabel active={orderBy === "targetMeanPrice"} direction={orderBy === "targetMeanPrice" ? order : "desc"} onClick={() => handleSort("targetMeanPrice")}>
                    Analyst Target
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.73rem", letterSpacing: "0.07em", bgcolor: t => solidPaperBg(t), color: "text.secondary", whiteSpace: "nowrap", borderBottom: "2px solid", borderBottomColor: "divider" }}>
                  <TableSortLabel active={orderBy === "upside"} direction={orderBy === "upside" ? order : "desc"} onClick={() => handleSort("upside")}>
                    Upside %
                  </TableSortLabel>
                </TableCell>
                <TableCell align="left" sx={{ fontWeight: 700, fontSize: "0.73rem", letterSpacing: "0.07em", bgcolor: t => solidPaperBg(t), color: "text.secondary", whiteSpace: "nowrap", borderBottom: "2px solid", borderBottomColor: "divider" }}>
                  <TableSortLabel active={orderBy === "recommendationMean"} direction={orderBy === "recommendationMean" ? order : "asc"} onClick={() => handleSort("recommendationMean")}>
                    Recommendation
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map(row => {
                const rec = recInfo(row.recommendationMean, isDark);
                return (
                  <TableRow key={row.instrument} hover>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem" }}>{row.instrument}</TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.8rem" }}>₹{fmt(row.ltp)}</TableCell>
                    {row.loading ? (
                      <>
                        <TableCell align="right"><Skeleton width={70} sx={{ ml: "auto" }} /></TableCell>
                        <TableCell align="right"><Skeleton width={60} sx={{ ml: "auto" }} /></TableCell>
                        <TableCell align="left"><Skeleton width={80} /></TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell align="right" sx={{ fontSize: "0.8rem" }}>
                          {row.targetMeanPrice != null ? `₹${fmt(row.targetMeanPrice)}` : "—"}
                        </TableCell>
                        <TableCell align="right" sx={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: row.upside != null ? (row.upside >= 0 ? "success.main" : "error.main") : undefined,
                        }}>
                          {row.upside != null ? `${row.upside >= 0 ? "+" : ""}${row.upside.toFixed(1)}%` : "—"}
                        </TableCell>
                        <TableCell align="left">
                          {rec ? (
                            <Chip
                              label={rec.text}
                              size="small"
                              sx={{ fontWeight: 600, fontSize: "0.7rem", bgcolor: rec.bgcolor, color: rec.color }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                      </>
                    )}
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
