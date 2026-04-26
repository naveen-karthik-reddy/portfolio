import { useMemo } from "react";
import {
  Box, Typography, Paper, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  PieChart, Pie, Cell, Tooltip as ReTip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { deriveAll, isETF, fmt, fmtCur, solidPaperBg } from "../utils";

export default function Analytics({ holdings }) {
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

  const derived = useMemo(() => deriveAll(holdings), [holdings]);
  const totalCurVal = derived.reduce((s, h) => s + h.curVal, 0);

  /* ETF vs Equity */
  const { etfVal, equityVal } = useMemo(() => {
    const etfVal = derived.filter(h => isETF(h.instrument)).reduce((s, h) => s + h.curVal, 0);
    return { etfVal, equityVal: totalCurVal - etfVal };
  }, [derived, totalCurVal]);

  const splitData = [
    { name: "ETFs / Index Funds", value: parseFloat(etfVal.toFixed(2)) },
    { name: "Equity Stocks", value: parseFloat(equityVal.toFixed(2)) },
  ];
  const SPLIT_COLORS = [theme.palette.primary.main, theme.palette.secondary.main];

  /* Concentration: top 10 by curVal */
  const top10 = useMemo(
    () => [...derived].sort((a, b) => b.curVal - a.curVal).slice(0, 10),
    [derived]
  );

  /* P&L distribution buckets */
  const plBuckets = useMemo(() => {
    const buckets = [
      { label: "> +30%", min: 30, max: Infinity, count: 0 },
      { label: "+10–30%", min: 10, max: 30, count: 0 },
      { label: "0–+10%", min: 0, max: 10, count: 0 },
      { label: "-10–0%", min: -10, max: 0, count: 0 },
      { label: "< -10%", min: -Infinity, max: -10, count: 0 },
    ];
    derived.forEach(h => {
      const b = buckets.find(bk => h.netChg > bk.min && h.netChg <= (bk.max === Infinity ? Infinity : bk.max));
      if (b) b.count++;
    });
    return buckets;
  }, [derived]);

  const paperSx = {
    p: 2.5,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <Box>
      {/* Equal-height row */}
      <Grid container spacing={2} sx={{ mb: 3, alignItems: "stretch" }}>
        {/* ETF vs Equity */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={paperSx}>
            <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary" letterSpacing="0.08em">
              ETF vs EQUITY SPLIT
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={splitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {splitData.map((_, i) => <Cell key={i} fill={SPLIT_COLORS[i]} />)}
                </Pie>
                <ReTip formatter={v => [fmtCur(v), ""]} contentStyle={tipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: "flex", justifyContent: "space-around", mt: 1.5 }}>
              {splitData.map((d, i) => (
                <Box key={i} sx={{ textAlign: "center" }}>
                  <Typography variant="h6" fontWeight={800} sx={{ color: SPLIT_COLORS[i] }}>
                    {totalCurVal > 0 ? ((d.value / totalCurVal) * 100).toFixed(1) : 0}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{d.name.split(" ")[0]}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* P&L Distribution */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={paperSx}>
            <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary" letterSpacing="0.08em">
              P&L DISTRIBUTION
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={plBuckets} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false}
                    label={{ value: "Stocks", angle: -90, position: "insideLeft", fill: tickColor, fontSize: 11 }} />
                  <ReTip formatter={v => [`${v} stock${v !== 1 ? "s" : ""}`, ""]} contentStyle={tipStyle} cursor={false} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {plBuckets.map((b, i) => (
                      <Cell
                        key={i}
                        fill={
                          i === 0 ? "#10b981"
                            : i === 1 ? "#6ee7b7"
                            : i === 2 ? "#a7f3d0"
                            : i === 3 ? "#fca5a5"
                            : "#ef4444"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Concentration table */}
      <Paper sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, mb: 3, overflow: "hidden" }}>
        <Box sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" letterSpacing="0.08em">
            CONCENTRATION RISK — TOP 10 HOLDINGS
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["#", "Stock", "Current Value", "% of Portfolio", "P&L", "Net %"].map(h => (
                  <TableCell key={h} align={h === "Stock" || h === "#" ? "left" : "right"}
                    sx={{ fontWeight: 700, fontSize: "0.73rem", letterSpacing: "0.07em", bgcolor: t => solidPaperBg(t), color: "text.secondary", whiteSpace: "nowrap", borderBottom: "2px solid", borderBottomColor: "divider" }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {top10.map((h, i) => {
                const pct = totalCurVal > 0 ? (h.curVal / totalCurVal) * 100 : 0;
                return (
                  <TableRow key={h.instrument} hover>
                    <TableCell sx={{ fontSize: "0.8rem", color: "text.disabled", width: 32 }}>{i + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem" }}>{h.instrument}</TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.8rem" }}>{fmtCur(h.curVal)}</TableCell>
                    <TableCell align="right" sx={{ minWidth: 140 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "flex-end" }}>
                        <Typography variant="caption" fontWeight={700}>{pct.toFixed(1)}%</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            width: 60,
                            height: 6,
                            borderRadius: 3,
                            bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                            "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: "primary.main" },
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.8rem", fontWeight: 600, color: h.pl >= 0 ? "success.main" : "error.main" }}>
                      {h.pl >= 0 ? "+" : ""}{fmtCur(h.pl)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.8rem", fontWeight: 600, color: h.netChg >= 0 ? "success.main" : "error.main" }}>
                      {h.netChg >= 0 ? "+" : ""}{fmt(h.netChg)}%
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
