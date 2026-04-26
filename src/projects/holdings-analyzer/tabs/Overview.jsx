import { useMemo } from "react";
import { Box, Typography, Paper, Grid, useMediaQuery } from "@mui/material";
import {
  AccountBalance, ShowChart, TrendingUp, TrendingDown,
  PieChart as PieIcon, Star,
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip as ReTip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { fmtCur, fmt, deriveAll, isETF, PIE_COLORS } from "../utils";

const cardVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

function StatCard({ label, value, sub, icon, positive }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const accentColor =
    positive === undefined
      ? theme.palette.primary.main
      : positive
      ? theme.palette.success.main
      : theme.palette.error.main;

  const textColor =
    positive === undefined ? "text.primary" : positive ? "success.main" : "error.main";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.22s ease, transform 0.22s ease",
        "&:hover": {
          boxShadow: isDark
            ? "0 4px 24px rgba(0,0,0,0.35)"
            : "0 4px 18px rgba(0,0,0,0.09)",
          transform: "translateY(-1px)",
        },
        /* Left accent bar */
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: accentColor,
          borderRadius: "2px 0 0 2px",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.9, mb: 1.5 }}>
        <Box sx={{
          color: accentColor,
          display: "flex",
          alignItems: "center",
          p: 0.55,
          borderRadius: 1,
          bgcolor: alpha(accentColor, isDark ? 0.16 : 0.09),
          flexShrink: 0,
        }}>
          {icon}
        </Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing="0.07em" sx={{ lineHeight: 1.2 }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="h6" fontWeight={800} sx={{ color: textColor, lineHeight: 1.2, fontSize: { xs: "1rem", sm: "1.1rem" } }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" sx={{ color: textColor, mt: 0.3, display: "block", opacity: 0.75 }}>
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.04) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * R);
  const y = cy + r * Math.sin(-midAngle * R);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
}

export default function Overview({ holdings }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const tickColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  const derived = useMemo(() => deriveAll(holdings), [holdings]);

  const totalInvested = useMemo(() => derived.reduce((s, h) => s + h.invested, 0), [derived]);
  const totalCurVal = useMemo(() => derived.reduce((s, h) => s + h.curVal, 0), [derived]);
  const totalPL = totalCurVal - totalInvested;
  const totalPLPct = totalInvested > 0 ? ((totalPL / totalInvested) * 100).toFixed(2) : "0.00";
  const totalDayChange = useMemo(
    () => derived.reduce((s, h) => s + (h.curVal * h.dayChg) / 100, 0),
    [derived]
  );

  const etfVal = useMemo(
    () => derived.filter(h => isETF(h.instrument)).reduce((s, h) => s + h.curVal, 0),
    [derived]
  );
  const etfPct = totalCurVal > 0 ? ((etfVal / totalCurVal) * 100).toFixed(1) : "0.0";

  const top5Pct = useMemo(() => {
    const top5 = [...derived].sort((a, b) => b.curVal - a.curVal).slice(0, 5);
    const top5Val = top5.reduce((s, h) => s + h.curVal, 0);
    return totalCurVal > 0 ? ((top5Val / totalCurVal) * 100).toFixed(1) : "0.0";
  }, [derived, totalCurVal]);

  const pieData = useMemo(() => {
    const sorted = [...derived].sort((a, b) => b.curVal - a.curVal);
    const top = sorted.slice(0, 8);
    const rest = sorted.slice(8);
    const data = top.map(h => ({ name: h.instrument, value: parseFloat(h.curVal.toFixed(2)) }));
    if (rest.length)
      data.push({ name: "Others", value: parseFloat(rest.reduce((s, h) => s + h.curVal, 0).toFixed(2)) });
    return data;
  }, [derived]);

  const barData = useMemo(() => {
    const sorted = [...derived].sort((a, b) => b.pl - a.pl);
    const gainers = sorted.filter(h => h.pl > 0).slice(0, 5);
    const losers = sorted.filter(h => h.pl < 0).slice(-5).reverse();
    return [...gainers, ...losers].map(h => ({ name: h.instrument, pl: parseFloat(h.pl.toFixed(2)) }));
  }, [derived]);

  const cards = [
    { label: "TOTAL INVESTED", value: fmtCur(totalInvested), icon: <AccountBalance fontSize="small" /> },
    { label: "CURRENT VALUE", value: fmtCur(totalCurVal), icon: <ShowChart fontSize="small" /> },
    {
      label: "TOTAL P&L",
      value: fmtCur(totalPL),
      sub: `${totalPL >= 0 ? "+" : ""}${totalPLPct}%`,
      positive: totalPL >= 0,
      icon: totalPL >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />,
    },
    {
      label: "DAY CHANGE",
      value: fmtCur(totalDayChange),
      positive: totalDayChange >= 0,
      icon: totalDayChange >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />,
    },
    { label: "ETF ALLOCATION", value: `${etfPct}%`, sub: fmtCur(etfVal) + " in ETFs", icon: <PieIcon fontSize="small" /> },
    { label: "TOP-5 CONCENTRATION", value: `${top5Pct}%`, sub: "of portfolio in top 5", icon: <Star fontSize="small" /> },
  ];

  const tipStyle = {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    fontSize: 12,
  };

  const paperSx = {
    p: 2.5,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.25)" : "0 1px 6px rgba(0,0,0,0.05)",
  };

  return (
    <Box>
      {/* Stat cards with stagger */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cards.map(c => (
            <Grid key={c.label} size={{ xs: 6, sm: 4, md: 2 }}>
              <motion.div variants={cardItem} style={{ height: "100%" }}>
                <StatCard {...c} />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={paperSx}>
            <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary" letterSpacing="0.08em">
              ALLOCATION
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 50 : 65}
                  outerRadius={isMobile ? 90 : 110}
                  dataKey="value"
                  labelLine={false}
                  label={PieLabel}
                >
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <ReTip formatter={v => [fmtCur(v), "Value"]} contentStyle={tipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={paperSx}>
            <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary" letterSpacing="0.08em">
              TOP GAINERS & LOSERS
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: tickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                />
                <ReTip formatter={v => [fmtCur(v), "P&L"]} contentStyle={tipStyle} />
                <Bar dataKey="pl" radius={[4, 4, 0, 0]}>
                  {barData.map((e, i) => (
                    <Cell key={i} fill={e.pl >= 0 ? theme.palette.success.main : theme.palette.error.main} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
