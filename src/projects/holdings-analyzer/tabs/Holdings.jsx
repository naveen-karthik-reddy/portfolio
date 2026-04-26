import { useState, useMemo, useCallback } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TableSortLabel,
  TextField, InputAdornment, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  Divider,
} from "@mui/material";
import {
  Search, Add, FileDownload, Delete, Edit,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { derive, deriveAll, fmt, fmtCur } from "../utils";

/* ── Inline-editable table cell ── */
function EditableCell({ display, raw, onCommit, numeric = true, align = "right", bold = false, colored }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const theme = useTheme();

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

export default function Holdings({ holdings, setHoldings }) {
  const theme = useTheme();
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

  // Summary totals
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
      <Paper sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <TableContainer sx={{ maxHeight: 480 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {COLS.map(col => (
                  <TableCell
                    key={col.id}
                    align={col.align ?? "right"}
                    sx={{ fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.06em", bgcolor: "background.paper", whiteSpace: "nowrap" }}
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
                <TableCell sx={{ bgcolor: "background.paper", width: 40 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(row => (
                <TableRow key={row._id} hover>
                  <EditableCell display={row.instrument} raw={row.instrument} numeric={false} align="left" bold
                    onCommit={v => update(row._id, "instrument", v)} />
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
