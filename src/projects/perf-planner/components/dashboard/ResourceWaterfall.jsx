import { Fragment, useRef, useState, useCallback, useEffect } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";


// ── Phase colour palette (Chrome DevTools exact) ─────────────────────
const PHASE = {
  stall:    { color: "#aaaaaa", label: "Queueing / Stalled"  },
  dns:      { color: "#009d57", label: "DNS Lookup"          },
  tcp:      { color: "#e58d1a", label: "Initial Connection"  },
  ssl:      { color: "#9b52b5", label: "SSL/TLS"             },
  request:  { color: "#1a6c5e", label: "Request Sent"        },
  ttfb:     { color: "#c0c0c0", label: "Waiting (TTFB)"      },
  download: { color: null,      label: "Content Download"    },
  parse:    { color: "#06b6d4", label: "Parse / Compile"     },
  eval:     { color: "#d946ef", label: "Script Evaluation"   },
};

const TYPE_DL_COLOR = {
  html:  "#3b82f6",
  js:    "#ef4444",
  css:   "#f59e0b",
  font:  "#c084fc",
  image: "#22c55e",
  video: "#38bdf8",
  other: "#94a3b8",
};

const TYPE_SHORT = { html:"DOC", js:"JS", css:"CSS", font:"FONT", image:"IMG", video:"VID", other:"—" };

const PHASE_ORDER = ["stall","dns","tcp","ssl","request","ttfb","download","parse","eval"];

// Returns the ruler tick interval (ms) for a given visible time range.
// Targets ~6-10 ticks regardless of zoom level.
function tickInterval(visibleMs) {
  if (visibleMs <=   60) return    5;
  if (visibleMs <=  150) return   10;
  if (visibleMs <=  300) return   25;
  if (visibleMs <=  600) return   50;
  if (visibleMs <= 1500) return  100;
  if (visibleMs <= 4000) return  250;
  if (visibleMs <= 8000) return  500;
  if (visibleMs <=18000) return 1000;
  if (visibleMs <=45000) return 2000;
  if (visibleMs <=90000) return 5000;
  return 10000;
}

function fmt(ms) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}

function fmtTick(ms) {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  return Number.isInteger(s) ? `${s}s` : `${s.toFixed(s < 10 ? 1 : 0)}s`;
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function buildSegments(row, viewStart, visibleMs) {
  const phases = [
    { key: "stall",    durationMs: row.stallMs    ?? 0 },
    { key: "dns",      durationMs: row.dnsMs      ?? 0 },
    { key: "tcp",      durationMs: row.tcpMs      ?? 0 },
    { key: "ssl",      durationMs: row.sslMs      ?? 0 },
    { key: "request",  durationMs: row.requestMs  ?? 0 },
    { key: "ttfb",     durationMs: row.ttfbMs     ?? 0 },
    { key: "download", durationMs: row.downloadMs ?? 0 },
    { key: "parse",    durationMs: row.parseMs    ?? 0 },
    { key: "eval",     durationMs: row.evalMs     ?? 0 },
  ];

  const dlColor = TYPE_DL_COLOR[row.type] ?? "#94a3b8";
  let cursor = row.startMs;
  const segments = [];

  for (const p of phases) {
    if (p.durationMs <= 0) { cursor += p.durationMs; continue; }
    const segStart = cursor;
    const segEnd   = cursor + p.durationMs;
    cursor = segEnd;

    const leftPct  = clamp(((segStart - viewStart) / visibleMs) * 100, -1, 101);
    const rightPct = clamp(((segEnd   - viewStart) / visibleMs) * 100, -1, 101);
    const widthPct = rightPct - leftPct;
    if (widthPct <= 0) continue;

    const color = p.key === "download" ? dlColor : PHASE[p.key].color;
    segments.push({ key: p.key, leftPct, widthPct, color, durationMs: p.durationMs });
  }
  return segments;
}

const NAME_W = 130;
const ROW_H  = 28;

export default function ResourceWaterfall({ rows, fcpMs, lcpMs, totalMs }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  // ── Zoom / pan state ────────────────────────────────────────────
  const [zoom,       setZoom]       = useState(1);
  const [viewStart,  setViewStart]  = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Zoom in to show first ~10 s on first render; subsequent data changes keep current zoom/pan.
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (hasInitialized.current || !totalMs) return;
    hasInitialized.current = true;
    setZoom(Math.max(1, totalMs / 10000));
    setViewStart(0);
  }, [totalMs]);

  const visibleMs = totalMs / zoom;
  const viewEnd   = viewStart + visibleMs;

  // ── Refs ─────────────────────────────────────────────────────────
  const timelineRef = useRef(null);
  // Stores { startX, startViewStart, timelineWidth } while a drag is in progress.
  // timelineWidth is cached at mousedown to avoid getBoundingClientRect on every move.
  const dragRef = useRef(null);
  const rafRef  = useRef(null);

  // Keep a stable ref to the current pan state for use inside event listeners
  const panState = useRef({ zoom, viewStart, visibleMs, totalMs });
  useEffect(() => { panState.current = { zoom, viewStart, visibleMs, totalMs }; },
    [zoom, viewStart, visibleMs, totalMs]);

  // ── Scroll-to-zoom handler ───────────────────────────────────────
  const handleWheel = useCallback((e) => {
    const el = timelineRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const timelineLeft = rect.left + NAME_W;
    if (e.clientX < timelineLeft) return;

    const { zoom: z, viewStart: vs, visibleMs: vis, totalMs: tot } = panState.current;
    const rulerH    = 30 + (z > 1 ? 26 : 0);
    const overRuler = (e.clientY - rect.top) < rulerH;
    if (!overRuler && !e.ctrlKey && !e.metaKey) return;

    e.preventDefault();

    const timelineWidth = rect.width - NAME_W;
    if (timelineWidth <= 0) return;
    const mouseXPct = clamp((e.clientX - timelineLeft) / timelineWidth, 0, 1);
    const mouseMs   = vs + mouseXPct * vis;

    const factor  = e.deltaY < 0 ? 1.25 : 1 / 1.25;
    const newZoom = clamp(z * factor, 1, 80);
    const newVis  = tot / newZoom;
    let newStart  = mouseMs - mouseXPct * newVis;
    newStart      = clamp(newStart, 0, tot - newVis);

    setZoom(newZoom);
    setViewStart(newStart);
  }, []);

  // ── Drag-to-pan handlers ─────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    const el = timelineRef.current;
    if (!el) return;
    if (panState.current.zoom <= 1) return;
    const rect = el.getBoundingClientRect();
    if (e.clientX < rect.left + NAME_W) return;
    dragRef.current = {
      startX: e.clientX,
      startViewStart: panState.current.viewStart,
      timelineWidth: rect.width - NAME_W,
    };
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    const { startX, startViewStart, timelineWidth } = dragRef.current;
    if (timelineWidth <= 0) return;
    const { visibleMs: vis, totalMs: tot } = panState.current;
    const deltaMs  = -(e.clientX - startX) / timelineWidth * vis;
    const newStart = clamp(startViewStart + deltaMs, 0, tot - vis);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setViewStart(newStart);
      rafRef.current = null;
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  // ── Touch-to-pan handlers ────────────────────────────────────────
  const handleTouchStart = useCallback((e) => {
    const el = timelineRef.current;
    if (!el) return;
    if (panState.current.zoom <= 1) return;
    const touch = e.touches[0];
    const rect = el.getBoundingClientRect();
    if (touch.clientX < rect.left + NAME_W) return;
    dragRef.current = {
      startX: touch.clientX,
      startViewStart: panState.current.viewStart,
      timelineWidth: rect.width - NAME_W,
    };
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!dragRef.current) return;
    const { startX, startViewStart, timelineWidth } = dragRef.current;
    if (timelineWidth <= 0) return;
    const { visibleMs: vis, totalMs: tot } = panState.current;
    const touch = e.touches[0];
    const deltaMs  = -(touch.clientX - startX) / timelineWidth * vis;
    const newStart = clamp(startViewStart + deltaMs, 0, tot - vis);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setViewStart(newStart);
      rafRef.current = null;
    });
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  // ── Attach all event listeners ───────────────────────────────────
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;

    el.addEventListener("wheel",      handleWheel,      { passive: false });
    el.addEventListener("mousedown",  handleMouseDown,  { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true  });
    el.addEventListener("touchmove",  handleTouchMove,  { passive: false });
    el.addEventListener("touchend",   handleTouchEnd,   { passive: true  });

    // mousemove / mouseup must be on document so dragging outside the element still works
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup",   handleMouseUp);

    return () => {
      el.removeEventListener("wheel",      handleWheel);
      el.removeEventListener("mousedown",  handleMouseDown);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove",  handleTouchMove);
      el.removeEventListener("touchend",   handleTouchEnd);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup",   handleMouseUp);
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp,
      handleTouchStart, handleTouchMove, handleTouchEnd]);

  if (!rows?.length || totalMs <= 0) return null;

  // ── Ruler ticks in current view ──────────────────────────────────
  const interval = tickInterval(visibleMs);
  const firstTick = Math.ceil(viewStart / interval) * interval;
  const ticks = [];
  for (let t = firstTick; t <= viewEnd; t += interval) ticks.push(t);
  if (viewStart > 0 || ticks[0] > viewStart) ticks.unshift(Math.round(viewStart));

  function pctInView(ms) {
    return clamp(((ms - viewStart) / visibleMs) * 100, 0, 100);
  }

  // ── Cursor ───────────────────────────────────────────────────────
  const timelineCursor = isDragging ? "grabbing" : zoom > 1 ? "grab" : "crosshair";

  // ── Palette ──────────────────────────────────────────────────────
  const bgMain   = isDark ? "#0d0d1a" : "#ffffff";
  const bgStripe = isDark ? "#07070f" : "#f5f7fa";
  const border   = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.09)";
  const gridLine = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const hoverBg  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const altBg    = isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.015)";
  const tooltipBg = isDark ? "#1e1e2e" : "#ffffff";

  // Grid lines as CSS background — one declaration covers every row's timeline cell,
  // replacing the previous per-row ticks.map that created N_rows × N_ticks Box elements.
  const gridCss = ticks.map((t) => {
    const p = pctInView(t);
    return `linear-gradient(90deg,transparent calc(${p}% - 0.5px),${gridLine} calc(${p}% - 0.5px),${gridLine} calc(${p}% + 0.5px),transparent calc(${p}% + 0.5px))`;
  }).join(",") || "none";

  // ── Pan progress bar (shown when zoomed) ─────────────────────────
  const panBarLeft  = (viewStart / totalMs) * 100;
  const panBarWidth = (visibleMs  / totalMs) * 100;

  return (
    <Box ref={timelineRef} sx={{
      border: `1px solid ${border}`,
      borderRadius: 2,
      overflow: "hidden",
      bgcolor: bgMain,
      userSelect: "none",
    }}>

      {/* ── Zoom indicator ────────────────────────────────────────── */}
      {zoom > 1 && (
        <Box sx={{
          px: 1.5, py: 0.4,
          bgcolor: isDark ? alpha("#6366f1", 0.12) : alpha("#6366f1", 0.07),
          borderBottom: `1px solid ${border}`,
          display: "flex", alignItems: "center", gap: 1,
        }}>
          <Typography sx={{ fontSize: "0.58rem", color: "primary.main", fontWeight: 700 }}>
            {fmtTick(Math.round(viewStart))} – {fmtTick(Math.round(viewEnd))}
          </Typography>
          <Typography sx={{ fontSize: "0.56rem", color: "text.disabled" }}>
            · {zoom.toFixed(1)}× — scroll ruler to zoom · drag to pan · Ctrl+scroll rows to zoom
          </Typography>
        </Box>
      )}

      {/* ── Ruler row ─────────────────────────────────────────────── */}
      <Box sx={{
        display: "flex",
        height: 28,
        bgcolor: bgStripe,
        borderBottom: `1px solid ${border}`,
      }}>
        {/* Name header */}
        <Box sx={{
          width: NAME_W, flexShrink: 0,
          display: "flex", alignItems: "center", pl: 1.5,
          borderRight: `1px solid ${border}`,
        }}>
          <Typography sx={{ fontSize: "0.57rem", fontWeight: 700, color: "text.disabled", letterSpacing: "0.07em", textTransform: "uppercase" }}>
            Resource
          </Typography>
        </Box>

        {/* Timeline ruler */}
        <Box sx={{ flex: 1, position: "relative", overflow: "hidden", cursor: timelineCursor, backgroundImage: gridCss }}>
          {ticks.map((t) => (
            <Box key={t} sx={{
              position: "absolute",
              left: `${pctInView(t)}%`,
              bottom: "2px",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}>
              <Typography sx={{ fontSize: "0.5rem", color: "text.disabled", whiteSpace: "nowrap", lineHeight: 1 }}>
                {fmtTick(t)}
              </Typography>
            </Box>
          ))}

          {/* FCP pill in ruler */}
          {fcpMs >= viewStart && fcpMs <= viewEnd && (
            <Tooltip title={`First Contentful Paint · ${fmt(fcpMs)}`} arrow
              componentsProps={{ tooltip: { sx: { bgcolor: tooltipBg, color: "text.primary", border: `1px solid ${border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.35)", "& .MuiTooltip-arrow": { color: tooltipBg } } } }}>
              <Box sx={{
                position: "absolute",
                left: `${pctInView(fcpMs)}%`, top: "50%",
                transform: "translate(-50%, -50%)",
                px: 0.7, py: 0.15, borderRadius: 0.75,
                bgcolor: alpha("#0cce6b", isDark ? 0.2 : 0.12),
                border: `1px solid ${alpha("#0cce6b", 0.5)}`,
                color: "#0cce6b",
                fontSize: "0.52rem", fontWeight: 800, whiteSpace: "nowrap",
                cursor: "default", zIndex: 4,
              }}>FCP</Box>
            </Tooltip>
          )}

          {/* LCP pill in ruler */}
          {lcpMs >= viewStart && lcpMs <= viewEnd && (
            <Tooltip title={`Largest Contentful Paint · ${fmt(lcpMs)}`} arrow
              componentsProps={{ tooltip: { sx: { bgcolor: tooltipBg, color: "text.primary", border: `1px solid ${border}`, boxShadow: "0 4px 16px rgba(0,0,0,0.35)", "& .MuiTooltip-arrow": { color: tooltipBg } } } }}>
              <Box sx={{
                position: "absolute",
                left: `${pctInView(lcpMs)}%`, top: "50%",
                transform: "translate(-50%, -50%)",
                px: 0.7, py: 0.15, borderRadius: 0.75,
                bgcolor: alpha("#ffa400", isDark ? 0.2 : 0.12),
                border: `1px solid ${alpha("#ffa400", 0.5)}`,
                color: "#ffa400",
                fontSize: "0.52rem", fontWeight: 800, whiteSpace: "nowrap",
                cursor: "default", zIndex: 4,
              }}>LCP</Box>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* ── Resource rows ─────────────────────────────────────────── */}
      <Box sx={{ maxHeight: 420, overflowY: "auto", bgcolor: bgMain }}>
        {rows.map((row, idx) => {
          const segments  = buildSegments(row, viewStart, visibleMs);
          const isLcp     = row.phase === "lcp";
          const isBlocking = row.phase === "blocking";
          const isDimmed  = row.phase === "deferred" || row.phase === "lazy";
          const typeColor = TYPE_DL_COLOR[row.type] ?? "#94a3b8";

          const tooltipRows = [
            { label: "Type",         value: `${TYPE_SHORT[row.type] ?? row.type} · ${row.loading}`, dot: null },
            ...(row.protocol        ? [{ label: "Protocol",     value: row.protocol.toUpperCase(),  dot: null }] : []),
            ...(row.entity          ? [{ label: "Entity",       value: row.entity,                  dot: null }] : []),
            { label: "Start",        value: fmt(row.startMs),                                        dot: null },
            ...(row.stallMs   > 0   ? [{ label: "Stalled",      value: fmt(row.stallMs),   dot: PHASE.stall.color   }] : []),
            ...(row.dnsMs     > 0   ? [{ label: "DNS",          value: fmt(row.dnsMs),     dot: PHASE.dns.color     }] : []),
            ...(row.tcpMs     > 0   ? [{ label: "Initial Conn", value: fmt(row.tcpMs),     dot: PHASE.tcp.color     }] : []),
            ...(row.sslMs     > 0   ? [{ label: "SSL/TLS",      value: fmt(row.sslMs),     dot: PHASE.ssl.color     }] : []),
            ...(row.requestMs > 0   ? [{ label: "Request Sent", value: fmt(row.requestMs), dot: PHASE.request.color }] : []),
            ...(row.ttfbMs    > 0   ? [{ label: "Waiting",      value: fmt(row.ttfbMs),    dot: PHASE.ttfb.color    }] : []),
            { label: "Download",     value: fmt(row.downloadMs ?? 0),                                dot: typeColor },
            ...(row.parseMs   > 0   ? [{ label: "Parse/Compile",    value: fmt(row.parseMs), dot: PHASE.parse.color }] : []),
            ...(row.evalMs    > 0   ? [{ label: "Script Eval",      value: fmt(row.evalMs),  dot: PHASE.eval.color  }] : []),
            { label: "Total",        value: fmt(row.endMs - row.startMs),                            dot: null },
            { label: "Finish",       value: fmt(row.endMs),                                          dot: null },
          ];

          const tooltipContent = (
            <Box sx={{ lineHeight: 1.85, fontSize: "0.66rem" }}>
              <Typography sx={{ fontWeight: 700, color: typeColor, fontSize: "0.72rem", mb: 0.5, display: "block" }}>
                {row.name}
                {isLcp && <span style={{ color: "#ffa400", marginLeft: 4 }}>★ LCP</span>}
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 1.5, rowGap: 0.2 }}>
                {tooltipRows.map(({ label, value, dot }) => (
                  <Fragment key={label}>
                    <Box component="span" sx={{ color: "text.disabled", fontSize: "0.6rem", display: "flex", alignItems: "center", gap: 0.5 }}>
                      {dot && <Box component="span" sx={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", bgcolor: dot, flexShrink: 0 }} />}
                      {label}
                    </Box>
                    <Box component="span" sx={{ fontWeight: 700 }}>{value}</Box>
                  </Fragment>
                ))}
              </Box>
            </Box>
          );

          return (
            <Box
              key={row.id}
              sx={{
                display: "flex", height: ROW_H,
                bgcolor: isLcp ? alpha("#ffa400", isDark ? 0.06 : 0.03) : idx % 2 === 0 ? altBg : "transparent",
                borderBottom: `1px solid ${border}`,
                "&:last-child": { borderBottom: 0 },
                "&:hover": { bgcolor: hoverBg },
                transition: "background 0.08s",
              }}
            >
              {/* Name column */}
              <Box sx={{
                width: NAME_W, flexShrink: 0,
                display: "flex", alignItems: "center", gap: 0.75,
                px: 1, pl: 1.25,
                borderRight: `1px solid ${border}`,
                overflow: "hidden",
              }}>
                <Box sx={{
                  flexShrink: 0, height: 16, minWidth: 28, px: 0.5,
                  borderRadius: "3px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  bgcolor: alpha(typeColor, isDark ? 0.22 : 0.14),
                  color: typeColor,
                  fontSize: "0.5rem", fontWeight: 800, letterSpacing: "0.03em",
                }}>
                  {TYPE_SHORT[row.type] ?? "—"}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{
                    fontSize: "0.62rem",
                    fontWeight: isBlocking || isLcp ? 700 : 500,
                    color: isDimmed ? "text.disabled" : "text.primary",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    lineHeight: 1.25, display: "block",
                  }}>
                    {row.name}
                    {isLcp && <span style={{ color: "#ffa400", marginLeft: 3, fontSize: "0.6rem" }}>★</span>}
                  </Typography>
                  <Typography sx={{
                    fontSize: "0.49rem", fontWeight: 700, letterSpacing: "0.05em",
                    color: isLcp ? "#ffa400" : isBlocking ? "#ef4444" : "text.disabled",
                    lineHeight: 1, textTransform: "uppercase",
                  }}>
                    {row.phase}
                  </Typography>
                </Box>
              </Box>

              {/* Timeline */}
              <Box sx={{ flex: 1, position: "relative", cursor: timelineCursor, overflow: "hidden", backgroundImage: gridCss }}>

                {/* FCP line */}
                {fcpMs >= viewStart && fcpMs <= viewEnd && (
                  <Box sx={{
                    position: "absolute", left: `${pctInView(fcpMs)}%`,
                    top: 0, bottom: 0, width: 2,
                    bgcolor: alpha("#0cce6b", 0.5), pointerEvents: "none", zIndex: 2,
                  }} />
                )}

                {/* LCP line */}
                {lcpMs >= viewStart && lcpMs <= viewEnd && (
                  <Box sx={{
                    position: "absolute", left: `${pctInView(lcpMs)}%`,
                    top: 0, bottom: 0, width: 2,
                    bgcolor: alpha("#ffa400", 0.5), pointerEvents: "none", zIndex: 2,
                  }} />
                )}

                {/* Phase segments */}
                {segments.map((seg, si) => (
                  <Box
                    key={seg.key}
                    sx={{
                      position: "absolute",
                      left:   `${seg.leftPct}%`,
                      width:  `${seg.widthPct}%`,
                      top:    seg.key === "request" ? "40%"
                            : ["stall","dns","tcp","ssl"].includes(seg.key) ? "32%"
                            : "18%",
                      bottom: seg.key === "request" ? "40%"
                            : ["stall","dns","tcp","ssl"].includes(seg.key) ? "32%"
                            : "18%",
                      bgcolor: seg.key === "stall" ? "transparent" : seg.color,
                      backgroundImage: seg.key === "stall"
                        ? "repeating-linear-gradient(45deg,#aaaaaa,#aaaaaa 2px,transparent 2px,transparent 6px)"
                        : "none",
                      borderRadius: si === 0 && segments.length === 1
                        ? "3px"
                        : si === 0
                        ? "3px 0 0 3px"
                        : si === segments.length - 1
                        ? "0 3px 3px 0"
                        : 0,
                      minWidth: 2,
                      zIndex: 3,
                      opacity: isDimmed ? 0.6 : 1,
                      boxShadow: isLcp && seg.key === "download"
                        ? `0 0 6px ${alpha("#ffa400", 0.5)}`
                        : isBlocking && seg.key === "download"
                        ? `0 0 5px ${alpha(seg.color, 0.4)}`
                        : "none",
                      pointerEvents: "none",
                    }}
                  />
                ))}

                {/* Transparent tooltip hit-area spanning only the bar region */}
                {segments.length > 0 && (
                  <Tooltip title={tooltipContent} arrow placement="top" enterDelay={120}
                    componentsProps={{ tooltip: { sx: { bgcolor: tooltipBg, color: "text.primary", border: `1px solid ${border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", p: "10px 14px", "& .MuiTooltip-arrow": { color: tooltipBg } } } }}>
                    <Box sx={{
                      position: "absolute",
                      left:  `${segments[0].leftPct}%`,
                      width: `${Math.max(
                        segments[segments.length - 1].leftPct +
                        segments[segments.length - 1].widthPct -
                        segments[0].leftPct, 2
                      )}%`,
                      top: "10%", bottom: "10%",
                      zIndex: 4,
                    }} />
                  </Tooltip>
                )}

                {/* End-time label */}
                {(() => {
                  const endPct = pctInView(row.endMs);
                  if (endPct < 96 && endPct > 4) return (
                    <Typography sx={{
                      position: "absolute",
                      left: `${Math.min(endPct + 0.8, 93)}%`,
                      top: "50%", transform: "translateY(-50%)",
                      fontSize: "0.5rem", color: "text.disabled",
                      whiteSpace: "nowrap", zIndex: 5, pointerEvents: "none",
                    }}>
                      {fmt(row.endMs)}
                    </Typography>
                  );
                  return null;
                })()}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* ── Pan progress bar (visible when zoomed) ────────────────── */}
      {zoom > 1 && (
        <Box sx={{
          mx: `${NAME_W}px`,
          height: 4,
          bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          borderRadius: 2,
          position: "relative",
          overflow: "hidden",
          mb: 0.5,
          mt: 0.25,
        }}>
          <Box sx={{
            position: "absolute",
            left:  `${panBarLeft}%`,
            width: `${panBarWidth}%`,
            top: 0, bottom: 0,
            bgcolor: alpha("#6366f1", 0.55),
            borderRadius: 2,
            transition: isDragging ? "none" : "left 0.12s ease",
          }} />
        </Box>
      )}

      {/* ── Legend + summary ──────────────────────────────────────── */}
      <Box sx={{
        display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.75,
        px: 1.75, py: 0.85,
        borderTop: `1px solid ${border}`,
        bgcolor: bgStripe,
      }}>
        {PHASE_ORDER.map((k) => (
          <Box key={k} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {k === "stall" ? (
              <Box sx={{
                width: 14, height: 7, borderRadius: "2px",
                backgroundImage: "repeating-linear-gradient(45deg,#aaaaaa,#aaaaaa 2px,transparent 2px,transparent 6px)",
              }} />
            ) : (
              <Box sx={{
                width:  ["ttfb","download"].includes(k) ? 14 : k === "request" ? 4 : 3,
                height: ["ttfb","download"].includes(k) ? 7  : 14,
                bgcolor: k === "download" ? TYPE_DL_COLOR.js : PHASE[k].color,
                borderRadius: "2px",
              }} />
            )}
            <Typography sx={{ fontSize: "0.57rem", color: "text.disabled" }}>{PHASE[k].label}</Typography>
          </Box>
        ))}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 2, height: 14, bgcolor: "#0cce6b", borderRadius: "2px" }} />
          <Typography sx={{ fontSize: "0.57rem", fontWeight: 700, color: "#0cce6b" }}>FCP {fmt(fcpMs)}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 2, height: 14, bgcolor: "#ffa400", borderRadius: "2px" }} />
          <Typography sx={{ fontSize: "0.57rem", fontWeight: 700, color: "#ffa400" }}>LCP {fmt(lcpMs)}</Typography>
        </Box>
        <Typography sx={{ fontSize: "0.57rem", color: "text.disabled", ml: "auto" }}>
          {rows.length} requests · {fmt(totalMs)} · scroll ruler to zoom · drag to pan
        </Typography>
      </Box>
    </Box>
  );
}
