import { useState, useMemo, useCallback } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TableSortLabel,
  TextField, InputAdornment, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  Divider, Chip, Skeleton,
} from "@mui/material";
import {
  Search, Add, FileDownload, Delete,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { derive, deriveAll, fmt, fmtCur, solidPaperBg } from "../utils";

/* ── Cap category helper ── */
function capInfo(marketCap, isDark) {
  if (marketCap == null) return null;
  if (marketCap >= 6e9) return { label: "Large", sx: { bgcolor: isDark ? "rgba(59,130,246,0.18)" : "rgba(59,130,246,0.10)", color: "#3b82f6" } };
  if (marketCap >= 1.8e9) return { label: "Mid", sx: { bgcolor: isDark ? "rgba(139,92,246,0.18)" : "rgba(139,92,246,0.10)", color: "#8b5cf6" } };
  return { label: "Small", sx: { bgcolor: isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.10)", color: "#f59e0b" } };
}

/* ── Stock name cell with company name + cap badge ── */
function StockNameCell({ instrument, dd, onCommit }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const start = () => { setDraft(instrument); setEditing(true); };
  const commit = () => {
    setEditing(false);
    const val = draft.trim();
    if (val) onCommit(val);
  };
  const cancel = () => setEditing(false);

  const companyName = dd?.loading ? null : (dd?.companyName ?? null);
  const cap = dd?.loading ? null : capInfo(dd?.marketCap ?? null, isDark);

  if (editing) {
    return (
      <TableCell align="left" sx={{ p: "4px 6px" }}>
        <TextField
          size="small"
          value={draft}
          onChange={e => setDraft(e.target.value.toUpperCase())}
          onBlur={commit}
          onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
          autoFocus
          sx={{ width: 140 }}
          inputProps={{ style: { textAlign: "left", padding: "4px 8px", fontSize: "0.8rem" } }}
        />
      </TableCell>
    );
  }

  return (
    <TableCell
      align="left"
      onClick={start}
      sx={{ cursor: "text", "&:hover": { bgcolor: "action.hover" }, "&:hover .edit-dot": { opacity: 1 }, position: "relative" }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", lineHeight: 1.3 }}>{instrument}</Typography>
      {dd?.loading ? (
        <Skeleton width={90} height={12} sx={{ mt: 0.3 }} />
      ) : (
        <>
          {companyName && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: "0.7rem", lineHeight: 1.3, mt: 0.2 }}>
              {companyName}
            </Typography>
          )}
          {cap && (
            <Chip label={cap.label} size="small" sx={{ height: 16, fontSize: "0.62rem", fontWeight: 700, mt: 0.3, ...cap.sx }} />
          )}
        </>
      )}
      <Box
        className="edit-dot"
        component="span"
        sx={{ position: "absolute", top: 4, right: 4, width: 4, height: 4, borderRadius: "50%", bgcolor: "primary.main", opacity: 0, transition: "opacity 0.15s" }}
      />
    </TableCell>
  );
}

/* ── Inline-editable table cell ── */
function EditableCell({ display, raw, onCommit, numeric = true, align = "right", bold = false, colored }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const start = () => { setDraft(String(raw ?? display)); setEditing(true); };
  const commit = () => {
    setEditing(false);
    const val = numeric ? (parseFloat(String(draft).replace(/,/g, "")) || 0) : draft.trim();
    onCommit(val);
  };
  const cancel = () => setEditing(false);

  if (editing) {
    return (
      <TableCell align={align} sx={{ p: "4px 6px" }}>
        <TextField
          size="small"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
          autoFocus
          sx={{ width: 100 }}
          inputProps={{ style: { textAlign: align, padding: "4px 8px", fontSize: "0.8rem" } }}
        />
      </TableCell>
    );
  }

  return (
    <TableCell
      align={align}
      onClick={start}
      sx={{
        fontSize: "0.8rem",
        fontWeight: bold ? 700 : 400,
        cursor: "text",
        color: colored === undefined ? undefined : colored >= 0 ? "success.main" : "error.main",
        position: "relative",
        "&:hover": { bgcolor: "action.hover" },
        "&:hover .edit-dot": { opacity: 1 },
      }}
    >
      {display}
      <Box
        className="edit-dot"
        component="span"
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          width: 4,
          height: 4,
          borderRadius: "50%",
          bgcolor: "primary.main",
          opacity: 0,
          transition: "opacity 0.15s",
        }}
      />
    </TableCell>
  );
}

/* ── Read-only derived cell ── */
function DerivedCell({ value, align = "right", colored }) {
  return (
    <TableCell
      align={align}
      sx={{
        fontSize: "0.8rem",
        fontWeight: colored !== undefined ? 600 : 400,
        color: colored === undefined ? undefined : colored >= 0 ? "success.main" : "error.main",
      }}
    >
      {value}
    </TableCell>
  );
}

const COLS = [
  { id: "instrument", label: "Stock", numeric: false, align: "left" },
  { id: "qty", label: "Qty", numeric: true },
  { id: "avgCost", label: "Avg Cost", numeric: true },
  { id: "ltp", label: "LTP", numeric: true },
  { id: "invested", label: "Invested", numeric: true },
  { id: "curVal", label: "Cur. Val", numeric: true },
  { id: "pl", label: "P&L", numeric: true },
  { id: "netChg", label: "Net %", numeric: true },
  { id: "dayChg", label: "Day %", numeric: true },
];

export default function Holdings({ holdings, setHoldings, dividendData }) {
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("curVal");
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow] = useState({ instrument: "", qty: "", avgCost: "", ltp: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const derived = useMemo(() => deriveAll(holdings), [holdings]);

  const update = useCallback((id, field, value) => {
    setHoldings(prev => prev.map(h => h._id === id ? { ...h, [field]: value } : h));
  }, [setHoldings]);

  const handleSort = (col) => {
    if (orderBy === col) setOrder(o => o === "asc" ? "desc" : "asc");
    else { setOrderBy(col); setOrder("desc"); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...derived]
      .filter(h => h.instrument.toLowerCase().includes(q))
      .sort((a, b) => {
        if (orderBy === "instrument") return order === "asc" ? a.instrument.localeCompare(b.instrument) : b.instrument.localeCompare(a.instrument);
        return order === "asc" ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
      });
  }, [derived, search, order, orderBy]);

  const addHolding = () => {
    if (!newRow.instrument.trim()) return;
    const maxId = holdings.length ? Math.max(...holdings.map(h => h._id)) : 0;
    setHoldings(prev => [...prev, {
      _id: maxId + 1,
      instrument: newRow.instrument.toUpperCase().trim(),
      qty: parseFloat(newRow.qty) || 0,
      avgCost: parseFloat(newRow.avgCost) || 0,
      ltp: parseFloat(newRow.ltp) || 0,
      dayChg: 0,
    }]);
    setNewRow({ instrument: "", qty: "", avgCost: "", ltp: "" });
    setShowAdd(false);
  };

  const confirmDelete = () => {
    if (deleteTarget === null) return;
    setHoldings(prev => prev.filter(h => h._id !== deleteTarget));
    setDeleteTarget(null);
  };

  const exportCSV = () => {
    const rows = deriveAll(holdings);
    const header = '"Instrument","Qty.","Avg. cost","LTP","Invested","Cur. val","P&L","Net chg.","Day chg."';
    const lines = rows.map(h =>
      `"${h.instrument}",${h.qty},${h.avgCost.toFixed(2)},${h.ltp.toFixed(2)},${h.invested.toFixed(2)},${h.curVal.toFixed(2)},${h.pl.toFixed(2)},${h.netChg.toFixed(2)},${h.dayChg}`
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "holdings_modified.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalInvested = derived.reduce((s, h) => s + h.invested, 0);
  const totalCurVal = derived.reduce((s, h) => s + h.curVal, 0);
  const totalPL = totalCurVal - totalInvested;

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 1, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search stock…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: "text.secondary" }} /></InputAdornment> }}
          sx={{ width: 200 }}
        />
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Click any cell to edit
          </Typography>
          <Button size="small" startIcon={<Add />} onClick={() => setShowAdd(true)} variant="outlined" sx={{ fontWeight: 600 }}>
            Add
          </Button>
          <Button size="small" startIcon={<FileDownload />} onClick={exportCSV} variant="outlined" sx={{ fontWeight: 600 }}>
            Export
          </Button>
        </Box>
      </Box>

      {/* Summary strip */}
      <Box sx={{ display: "flex", gap: 3, mb: 2, px: 1, flexWrap: "wrap" }}>
        <Typography variant="body2" color="text.secondary">
          Invested <strong>{fmtCur(totalInvested)}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Value <strong>{fmtCur(totalCurVal)}</strong>
        </Typography>
        <Typography variant="body2" sx={{ color: totalPL >= 0 ? "success.main" : "error.main", fontWeight: 600 }}>
          P&L {totalPL >= 0 ? "+" : ""}{fmtCur(totalPL)} ({totalInvested > 0 ? ((totalPL / totalInvested) * 100).toFixed(2) : "0.00"}%)
        </Typography>
      </Box>

      {/* Table */}
      <Paper sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 480 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {COLS.map(col => (
                  <TableCell
                    key={col.id}
                    align={col.align ?? "right"}
                    sx={{ fontWeight: 700, fontSize: "0.73rem", letterSpacing: "0.07em", bgcolor: t => solidPaperBg(t), color: "text.secondary", whiteSpace: "nowrap", borderBottom: "2px solid", borderBottomColor: "divider" }}
                  >
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "desc"}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell sx={{ bgcolor: t => solidPaperBg(t), width: 40, borderBottom: "2px solid", borderBottomColor: "divider" }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(row => (
                <TableRow key={row._id} hover>
                  <StockNameCell
                    instrument={row.instrument}
                    dd={dividendData?.[row.instrument]}
                    onCommit={v => update(row._id, "instrument", v)}
                  />
                  <EditableCell display={fmt(row.qty)} raw={row.qty}
                    onCommit={v => update(row._id, "qty", v)} />
                  <EditableCell display={`₹${fmt(row.avgCost)}`} raw={row.avgCost}
                    onCommit={v => update(row._id, "avgCost", v)} />
                  <EditableCell display={`₹${fmt(row.ltp)}`} raw={row.ltp}
                    onCommit={v => update(row._id, "ltp", v)} />
                  <DerivedCell value={`₹${fmt(row.invested)}`} />
                  <DerivedCell value={`₹${fmt(row.curVal)}`} />
                  <DerivedCell value={`${row.pl >= 0 ? "+" : ""}₹${fmt(row.pl)}`} colored={row.pl} />
                  <DerivedCell value={`${row.netChg >= 0 ? "+" : ""}${fmt(row.netChg)}%`} colored={row.netChg} />
                  <DerivedCell value={`${row.dayChg >= 0 ? "+" : ""}${fmt(row.dayChg)}%`} colored={row.dayChg} />
                  <TableCell align="right" sx={{ pr: 0.5 }}>
                    <Tooltip title="Delete" arrow>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(row._id)}
                        sx={{ color: "error.main", opacity: 0.4, "&:hover": { opacity: 1 } }}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add dialog */}
      <Dialog open={showAdd} onClose={() => setShowAdd(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Holding</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Symbol" value={newRow.instrument}
              onChange={e => setNewRow(p => ({ ...p, instrument: e.target.value.toUpperCase() }))}
              size="small" placeholder="e.g. HDFCBANK" autoFocus />
            <TextField label="Quantity" type="number" value={newRow.qty}
              onChange={e => setNewRow(p => ({ ...p, qty: e.target.value }))}
              size="small" />
            <TextField label="Avg. Cost (₹)" type="number" value={newRow.avgCost}
              onChange={e => setNewRow(p => ({ ...p, avgCost: e.target.value }))}
              size="small" />
            <TextField label="LTP (₹)" type="number" value={newRow.ltp}
              onChange={e => setNewRow(p => ({ ...p, ltp: e.target.value }))}
              size="small" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button onClick={addHolding} variant="contained" sx={{ fontWeight: 700 }}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Remove holding?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will remove the holding from your current session.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error" sx={{ fontWeight: 700 }}>Remove</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
