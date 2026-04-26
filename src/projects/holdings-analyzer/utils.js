export function parseCSVLine(line) {
  const result = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuote = !inQuote; continue; }
    if (ch === "," && !inQuote) { result.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  result.push(cur.trim());
  return result;
}

export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  return lines
    .slice(1)
    .filter((l) => l.trim() && l.trim() !== '""')
    .map((line) => {
      const c = parseCSVLine(line);
      return {
        instrument: c[0],
        qty: parseFloat(c[1]) || 0,
        avgCost: parseFloat(c[2]) || 0,
        ltp: parseFloat(c[3]) || 0,
        dayChg: parseFloat(c[8]) || 0,
      };
    })
    .filter((r) => r.instrument);
}

export const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);

export const fmtCur = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export function derive(h) {
  const invested = h.qty * h.avgCost;
  const curVal = h.qty * h.ltp;
  const pl = curVal - invested;
  const netChg = h.avgCost > 0 ? ((h.ltp - h.avgCost) / h.avgCost) * 100 : 0;
  return { ...h, invested, curVal, pl, netChg };
}

export const deriveAll = (holdings) => holdings.map(derive);

export function isETF(instrument) {
  const n = instrument.toUpperCase();
  return (
    n.endsWith("BEES") ||
    n.includes("NIFTY") ||
    n.includes("MIDSMALL") ||
    n.includes("MONIFTY") ||
    n.includes("SMALLCAP") ||
    (n.startsWith("HDFC") && n.includes("SML")) ||
    n.endsWith("ETF")
  );
}

/* Returns a fully opaque colour equivalent to blending the theme's
   semi-transparent background.paper over background.default.
   Needed for sticky table headers — rgba backgrounds show rows through them. */
export function solidPaperBg(theme) {
  const paper = theme.palette.background.paper;
  const base  = theme.palette.background.default;
  const m = paper.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return paper;
  const a = parseFloat(m[4] ?? "1");
  if (a >= 1) return paper;
  const hm = base.match(/^#([0-9a-fA-F]{6})$/);
  const br = hm ? parseInt(hm[1].slice(0, 2), 16) : 10;
  const bg = hm ? parseInt(hm[1].slice(2, 4), 16) : 10;
  const bb = hm ? parseInt(hm[1].slice(4, 6), 16) : 15;
  return `rgb(${Math.round(+m[1]*a + br*(1-a))},${Math.round(+m[2]*a + bg*(1-a))},${Math.round(+m[3]*a + bb*(1-a))})`;
}

export const PIE_COLORS = [
  "#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e",
  "#8b5cf6", "#3b82f6", "#ec4899", "#14b8a6", "#f97316", "#a3e635",
];
