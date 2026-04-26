import { useState, useCallback, useEffect } from "react";
import { Box, Typography, Chip, Divider } from "@mui/material";
import { CloudUpload, GridOn, Savings, Calculate, Insights } from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { motion } from "framer-motion";

import { supabase } from "../../lib/supabase";
import { parseCSV } from "./utils";
import Overview from "./tabs/Overview";
import Holdings from "./tabs/Holdings";
import Dividends from "./tabs/Dividends";
import Calculators from "./tabs/Calculators";
import Analytics from "./tabs/Analytics";

const UPLOAD_FEATURES = [
  "Portfolio Overview",
  "Dividend Yields",
  "SIP & CAGR Calculators",
  "Concentration Risk",
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
            lineHeight: 1.05,
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
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center", maxWidth: 480, mx: "auto" }}>
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

/* ── Supabase dividend_yields query ── */
async function fetchDividends(instruments, setDividendData) {
  setDividendData(
    Object.fromEntries(
      instruments.map(inst => [inst, { yieldPct: null, fiveYearAvgYield: null, loading: true, error: false }])
    )
  );

  try {
    const nsSymbols = instruments.map(s => `${s}.NS`);

    const { data, error } = await supabase
      .from("dividend_yields")
      .select("symbol, dividend_yield, five_year_avg_dividend_yield")
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
            loading: false,
            error: false,
          }];
        })
      )
    );
  } catch {
    setDividendData(
      Object.fromEntries(
        instruments.map(inst => [inst, { yieldPct: null, fiveYearAvgYield: null, loading: false, error: true }])
      )
    );
  }
}

/* ── Section divider with icon pill ── */
const SECTION_META = {
  Holdings:    { icon: <GridOn fontSize="small" />,    color: "#6366f1" },
  Dividends:   { icon: <Savings fontSize="small" />,   color: "#10b981" },
  Calculators: { icon: <Calculate fontSize="small" />, color: "#f59e0b" },
  Analytics:   { icon: <Insights fontSize="small" />,  color: "#06b6d4" },
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

  const handleFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSV(e.target.result);
      if (!rows.length) return;
      setHoldings(rows.map((r, i) => ({ ...r, _id: i })));
      setDividendData({});
      setDividendOverrides({});
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

  if (!holdings) return <UploadScreen onFile={handleFile} />;

  const sharedProps = { holdings, setHoldings, dividendData, dividendOverrides, setDividendOverrides };

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
        mb: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
      }}>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 900, background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}
          >
            Holdings Analyzer
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: "block" }}>
            {holdings.length} stocks · powered by NSE data
          </Typography>
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

      <Overview {...sharedProps} />

      <SectionHeader title="Holdings" />
      <Holdings {...sharedProps} />

      <SectionHeader title="Dividends" />
      <Dividends {...sharedProps} onRetry={retryDividends} />

      <SectionHeader title="Calculators" />
      <Calculators />

      <SectionHeader title="Analytics" />
      <Analytics {...sharedProps} />
    </Box>
  );
}
