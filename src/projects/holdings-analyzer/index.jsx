import { useState, useCallback, useEffect, useMemo } from "react";
import { Box, Typography, Chip, Divider, Tabs, Tab } from "@mui/material";
import {
  CloudUpload, GridOn, Savings, Calculate, Insights,
  BarChart as BarChartIcon, Shield, TrendingUp,
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { motion } from "framer-motion";

import { supabase } from "../../lib/supabase";
import { parseCSV } from "./utils";
import Overview from "./tabs/Overview";
import Holdings from "./tabs/Holdings";
import Dividends from "./tabs/Dividends";
import Calculators from "./tabs/Calculators";
import Analytics from "./tabs/Analytics";
import Fundamentals from "./tabs/Fundamentals";
import Risk from "./tabs/Risk";
import Analyst from "./tabs/Analyst";

const UPLOAD_FEATURES = [
  "Portfolio Overview",
  "Dividend Yields",
  "SIP & CAGR Calculators",
  "Concentration Risk",
  "Fundamentals",
  "Risk Dashboard",
  "Analyst Insights",
];

/* ── Upload screen ── */
function UploadScreen({ onFile }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const grad = `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <Box sx={{
      minHeight: "72vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      textAlign: "center",
      px: 2,
      position: "relative",
    }}>
      {/* Radial glow */}
      <Box sx={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 65% 55% at 50% 42%, ${alpha(theme.palette.primary.main, isDark ? 0.08 : 0.05)}, transparent)`,
        pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <Chip
          label="ZERODHA CONSOLE"
          size="small"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.1em",
            mb: 2.5,
            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08),
            color: "primary.main",
            border: "none",
            fontSize: "0.68rem",
          }}
        />
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            background: grad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1.5,
            lineHeight: 1.25,
            pb: "0.05em",
            fontSize: { xs: "2rem", sm: "2.75rem" },
          }}
        >
          Holdings Analyzer
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: "auto", lineHeight: 1.7 }}>
          Upload your holdings CSV export and get a complete portfolio dashboard — instantly.
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.13, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: 460 }}
      >
        <Box
          component="label"
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          sx={{
            display: "block",
            border: "2px dashed",
            borderColor: dragging ? "primary.main" : alpha(theme.palette.text.primary, isDark ? 0.13 : 0.16),
            borderRadius: 4,
            p: { xs: 5, sm: 7 },
            cursor: "pointer",
            transition: "all 0.22s ease",
            bgcolor: dragging
              ? alpha(theme.palette.primary.main, isDark ? 0.1 : 0.04)
              : isDark ? alpha("#fff", 0.025) : alpha("#000", 0.012),
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.07 : 0.025),
              transform: "translateY(-2px)",
            },
          }}
        >
          <input type="file" accept=".csv" hidden onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); }} />
          <motion.div
            animate={{ y: dragging ? -7 : 0, scale: dragging ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
          >
            <CloudUpload sx={{ fontSize: 54, color: "primary.main", mb: 2, opacity: dragging ? 1 : 0.6 }} />
          </motion.div>
          <Typography variant="h6" fontWeight={700} sx={{ color: dragging ? "primary.main" : "text.primary", transition: "color 0.2s", mb: 0.5 }}>
            {dragging ? "Release to upload" : "Drop your CSV here"}
          </Typography>
          <Typography variant="body2" color="text.secondary">or click to browse</Typography>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center", maxWidth: 520, mx: "auto" }}>
          {UPLOAD_FEATURES.map(f => (
            <Chip
              key={f}
              label={f}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem", color: "text.secondary", borderColor: "divider", opacity: 0.7 }}
            />
          ))}
        </Box>
      </motion.div>
    </Box>
  );
}

/* ── Supabase dividend_yields query — fetches all columns ── */
const EMPTY_ROW = {
  yieldPct: null, fiveYearAvgYield: null,
  payoutRatio: null, exDividendDate: null,
  companyName: null, series: null, marketCap: null,
  trailingPe: null, forwardPe: null, priceToBook: null,
  priceToSales: null, evToEbitda: null, pegRatio: null,
  trailingEps: null, forwardEps: null,
  beta: null, fiftyTwoWeekHigh: null, fiftyTwoWeekLow: null,
  returnOnEquity: null, returnOnAssets: null,
  profitMargins: null, operatingMargins: null,
  debtToEquity: null, currentRatio: null,
  revenueGrowth: null, earningsQuarterlyGrowth: null,
  targetMeanPrice: null, recommendationMean: null,
  fetchedAt: null, nullCount: null,
};

async function fetchDividends(instruments, setDividendData) {
  setDividendData(
    Object.fromEntries(
      instruments.map(inst => [inst, { ...EMPTY_ROW, loading: true, error: false }])
    )
  );

  try {
    const nsSymbols = instruments.map(s => `${s}.NS`);

    const { data, error } = await supabase
      .from("dividend_yields")
      .select(`symbol, company_name, series, dividend_yield, five_year_avg_dividend_yield,
        payout_ratio, ex_dividend_date, market_cap,
        trailing_pe, forward_pe, price_to_book, price_to_sales, ev_to_ebitda, peg_ratio,
        trailing_eps, forward_eps, beta,
        fifty_two_week_high, fifty_two_week_low,
        return_on_equity, return_on_assets, profit_margins, operating_margins,
        debt_to_equity, current_ratio, revenue_growth, earnings_quarterly_growth,
        target_mean_price, recommendation_mean, fetched_at, null_count`)
      .in("symbol", nsSymbols);

    if (error) throw error;

    const bySymbol = Object.fromEntries((data ?? []).map(r => [r.symbol, r]));

    setDividendData(
      Object.fromEntries(
        instruments.map(inst => {
          const row = bySymbol[`${inst}.NS`];
          return [inst, {
            yieldPct: row?.dividend_yield != null ? row.dividend_yield * 100 : null,
            fiveYearAvgYield: row?.five_year_avg_dividend_yield ?? null,
            payoutRatio: row?.payout_ratio ?? null,
            exDividendDate: row?.ex_dividend_date ?? null,
            companyName: row?.company_name ?? null,
            series: row?.series ?? null,
            marketCap: row?.market_cap ?? null,
            trailingPe: row?.trailing_pe ?? null,
            forwardPe: row?.forward_pe ?? null,
            priceToBook: row?.price_to_book ?? null,
            priceToSales: row?.price_to_sales ?? null,
            evToEbitda: row?.ev_to_ebitda ?? null,
            pegRatio: row?.peg_ratio ?? null,
            trailingEps: row?.trailing_eps ?? null,
            forwardEps: row?.forward_eps ?? null,
            beta: row?.beta ?? null,
            fiftyTwoWeekHigh: row?.fifty_two_week_high ?? null,
            fiftyTwoWeekLow: row?.fifty_two_week_low ?? null,
            returnOnEquity: row?.return_on_equity ?? null,
            returnOnAssets: row?.return_on_assets ?? null,
            profitMargins: row?.profit_margins ?? null,
            operatingMargins: row?.operating_margins ?? null,
            debtToEquity: row?.debt_to_equity ?? null,
            currentRatio: row?.current_ratio ?? null,
            revenueGrowth: row?.revenue_growth ?? null,
            earningsQuarterlyGrowth: row?.earnings_quarterly_growth ?? null,
            targetMeanPrice: row?.target_mean_price ?? null,
            recommendationMean: row?.recommendation_mean ?? null,
            fetchedAt: row?.fetched_at ?? null,
            nullCount: row?.null_count ?? null,
            loading: false,
            error: false,
          }];
        })
      )
    );
  } catch {
    setDividendData(
      Object.fromEntries(
        instruments.map(inst => [inst, { ...EMPTY_ROW, loading: false, error: true }])
      )
    );
  }
}

/* ── Section divider with icon pill ── */
const SECTION_META = {
  Holdings:     { icon: <GridOn fontSize="small" />,        color: "#6366f1" },
  Dividends:    { icon: <Savings fontSize="small" />,        color: "#10b981" },
  Calculators:  { icon: <Calculate fontSize="small" />,      color: "#f59e0b" },
  Analytics:    { icon: <Insights fontSize="small" />,       color: "#06b6d4" },
  Fundamentals: { icon: <BarChartIcon fontSize="small" />,   color: "#8b5cf6" },
  Risk:         { icon: <Shield fontSize="small" />,         color: "#ef4444" },
  Analyst:      { icon: <TrendingUp fontSize="small" />,     color: "#f59e0b" },
};

function SectionHeader({ title }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const meta = SECTION_META[title] ?? {};

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 6 }}>
      <Divider sx={{ flex: 1 }} />
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        px: 2,
        py: 0.75,
        borderRadius: 99,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: isDark ? alpha("#fff", 0.03) : alpha("#000", 0.02),
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        {meta.icon && (
          <Box sx={{ color: meta.color, display: "flex", lineHeight: 0 }}>{meta.icon}</Box>
        )}
        <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing="0.12em" sx={{ lineHeight: 1 }}>
          {title}
        </Typography>
      </Box>
      <Divider sx={{ flex: 1 }} />
    </Box>
  );
}

/* ── Time-ago helper ── */
function timeAgo(isoStr) {
  if (!isoStr) return null;
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/* ══════════════════════════════════════════
   ROOT
══════════════════════════════════════════ */
export default function HoldingsAnalyzer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const grad = `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;

  const [holdings, setHoldings] = useState(null);
  const [dividendData, setDividendData] = useState({});
  const [dividendOverrides, setDividendOverrides] = useState({});
  const [tab, setTab] = useState(0);

  const handleFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSV(e.target.result);
      if (!rows.length) return;
      setHoldings(rows.map((r, i) => ({ ...r, _id: i })));
      setDividendData({});
      setDividendOverrides({});
      setTab(0);
    };
    reader.readAsText(file);
  }, []);

  const instrumentsKey = holdings ? holdings.map(h => h.instrument).join(",") : "";
  useEffect(() => {
    if (!holdings || !holdings.length) return;
    fetchDividends(holdings.map(h => h.instrument), setDividendData);
  }, [instrumentsKey]);

  const retryDividends = useCallback(() => {
    if (holdings && holdings.length) fetchDividends(holdings.map(h => h.instrument), setDividendData);
  }, [holdings]);

  /* ── Data health summary ── */
  const dataHealth = useMemo(() => {
    const entries = Object.values(dividendData);
    if (!entries.length || entries.every(e => e.loading)) return null;
    const loaded = entries.filter(e => !e.loading);
    const errorCount = loaded.filter(e => e.error).length;
    const firstWithDate = loaded.find(e => e.fetchedAt != null);
    return {
      ago: timeAgo(firstWithDate?.fetchedAt ?? null),
      errorCount,
    };
  }, [dividendData]);

  if (!holdings) return <UploadScreen onFile={handleFile} />;

  const sharedProps = { holdings, setHoldings, dividendData, dividendOverrides, setDividendOverrides };

  const TAB_DEFS = [
    { label: "Overview",      icon: <Insights sx={{ fontSize: 16 }} /> },
    { label: "Holdings",      icon: <GridOn sx={{ fontSize: 16 }} /> },
    { label: "Dividends",     icon: <Savings sx={{ fontSize: 16 }} /> },
    { label: "Fundamentals",  icon: <BarChartIcon sx={{ fontSize: 16 }} /> },
    { label: "Risk & Analyst",icon: <Shield sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box>
      {/* Gradient hero header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, isDark ? 0.13 : 0.07)}, ${alpha(theme.palette.secondary.main, isDark ? 0.08 : 0.04)})`,
        border: "1px solid",
        borderColor: isDark ? alpha(theme.palette.primary.main, 0.22) : alpha(theme.palette.primary.main, 0.14),
        borderRadius: 3,
        px: { xs: 2.5, sm: 3 },
        py: { xs: 2, sm: 2.5 },
        mb: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottom: "none",
      }}>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 900, background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.3, pb: "0.05em" }}
          >
            Holdings Analyzer
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3, flexWrap: "wrap" }}>
            <Typography variant="caption" color="text.secondary">
              {holdings.length} stocks · powered by NSE data
              {dataHealth?.ago && ` · updated ${dataHealth.ago}`}
            </Typography>
            {dataHealth?.errorCount > 0 && (
              <Chip
                label={`${dataHealth.errorCount} fetch error${dataHealth.errorCount > 1 ? "s" : ""}`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.63rem",
                  fontWeight: 700,
                  bgcolor: isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.10)",
                  color: "warning.main",
                }}
              />
            )}
          </Box>
        </Box>
        <Chip
          label="Upload new CSV"
          size="small"
          onClick={() => setHoldings(null)}
          sx={{
            cursor: "pointer",
            fontWeight: 700,
            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08),
            color: "primary.main",
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, isDark ? 0.22 : 0.13) },
          }}
        />
      </Box>

      {/* Tab bar */}
      <Box sx={{
        border: "1px solid",
        borderColor: isDark ? alpha(theme.palette.primary.main, 0.22) : alpha(theme.palette.primary.main, 0.14),
        borderTop: "none",
        borderRadius: 3,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        mb: 4,
        bgcolor: isDark ? alpha("#fff", 0.02) : alpha("#000", 0.01),
        overflow: "hidden",
      }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            "& .MuiTabs-indicator": {
              height: 2,
              borderRadius: 1,
              bgcolor: "primary.main",
            },
            "& .MuiTab-root": {
              minHeight: 44,
              fontSize: "0.78rem",
              fontWeight: 600,
              textTransform: "none",
              letterSpacing: "0.01em",
              gap: 0.75,
              color: "text.secondary",
              "&.Mui-selected": { color: "primary.main" },
            },
          }}
        >
          {TAB_DEFS.map((t, i) => (
            <Tab key={t.label} label={t.label} icon={t.icon} iconPosition="start" />
          ))}
        </Tabs>
      </Box>

      {/* Tab panels */}
      {tab === 0 && (
        <Box>
          <Overview {...sharedProps} />
          <SectionHeader title="Analytics" />
          <Analytics {...sharedProps} />
        </Box>
      )}

      {tab === 1 && <Holdings {...sharedProps} />}

      {tab === 2 && (
        <Box>
          <Dividends {...sharedProps} onRetry={retryDividends} />
          <SectionHeader title="Calculators" />
          <Calculators />
        </Box>
      )}

      {tab === 3 && <Fundamentals {...sharedProps} />}

      {tab === 4 && (
        <Box>
          <Risk {...sharedProps} />
          <SectionHeader title="Analyst" />
          <Analyst {...sharedProps} />
        </Box>
      )}
    </Box>
  );
}
