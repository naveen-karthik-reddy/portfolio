'use client';
import { useState, useRef, useCallback, useEffect } from "react";
import { Box, Button, IconButton, Typography, Paper } from "@mui/material";
import { Close, Terminal } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

export default function CodeEditorPanel({ code, lang, onClose }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const grad = `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;
  const divider = theme.palette.divider;

  const [editedCode, setEditedCode] = useState(code);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  // outputHeightPx: null = not yet initialized (will be set to 20% of panel on mount)
  const [outputHeightPx, setOutputHeightPx] = useState(null);

  const timerIds = useRef([]);
  const outputRef = useRef(null);
  const panelRef = useRef(null);
  const prevCodeRef = useRef(code);

  // Initialize output height to 20% of panel height on mount
  useEffect(() => {
    if (panelRef.current) {
      const h = panelRef.current.clientHeight;
      setOutputHeightPx(Math.max(80, Math.floor(h * 0.2)));
    }
  }, []);

  const stop = useCallback(() => {
    timerIds.current.forEach(({ type, id }) => {
      type === "interval" ? clearInterval(id) : clearTimeout(id);
    });
    timerIds.current = [];
    setIsRunning(false);
  }, []);

  // Reset when a different code block is opened
  useEffect(() => {
    if (prevCodeRef.current !== code) {
      prevCodeRef.current = code;
      stop();
      setEditedCode(code);
      setOutput([]);
    }
  }, [code, stop]);

  const run = useCallback(() => {
    stop();
    setOutput([]);
    setIsRunning(true);

    const append = (type, ...args) => {
      const text = args
        .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
        .join(" ");
      setOutput((prev) => {
        const next = [...prev, { type, text }];
        requestAnimationFrame(() => {
          if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
        });
        return next;
      });
    };

    const fakeConsole = {
      log: (...args) => append("log", ...args),
      warn: (...args) => append("warn", ...args),
      error: (...args) => append("error", ...args),
    };

    const customSetTimeout = (fn, delay, ...rest) => {
      const id = window.setTimeout(fn, delay, ...rest);
      timerIds.current.push({ type: "timeout", id });
      return id;
    };

    const customSetInterval = (fn, delay, ...rest) => {
      const id = window.setInterval(fn, delay, ...rest);
      timerIds.current.push({ type: "interval", id });
      return id;
    };

    const customClearTimeout = (id) => {
      window.clearTimeout(id);
      timerIds.current = timerIds.current.filter((t) => t.id !== id);
    };

    const customClearInterval = (id) => {
      window.clearInterval(id);
      timerIds.current = timerIds.current.filter((t) => t.id !== id);
    };

    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(
        "console", "setTimeout", "setInterval", "clearTimeout", "clearInterval",
        editedCode
      );
      fn(fakeConsole, customSetTimeout, customSetInterval, customClearTimeout, customClearInterval);
    } catch (e) {
      append("error", e.message);
      setIsRunning(false);
    }
  }, [editedCode, stop]);

  const reset = useCallback(() => {
    stop();
    setEditedCode(code);
    setOutput([]);
  }, [code, stop]);

  // Drag handler for resizing the output panel
  const handleOutputDividerMouseDown = useCallback((e) => {
    e.preventDefault();
    document.body.style.userSelect = "none";
    const panel = panelRef.current;

    const onMove = (ev) => {
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      const fromBottom = rect.bottom - ev.clientY;
      const maxH = (rect.height - 88) * 0.65;
      setOutputHeightPx(Math.max(60, Math.min(maxH, fromBottom)));
    };

    const onUp = () => {
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  return (
    <Paper
      ref={panelRef}
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderLeft: `1px solid ${divider}`,
        borderRadius: 0,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 0.75,
          borderBottom: `1px solid ${divider}`,
          bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Terminal sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.1em",
              background: grad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            EDITOR
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary", padding: "4px" }}>
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Language label + action buttons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 0.75,
          bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
          borderBottom: `1px solid ${divider}`,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
            color: "text.secondary",
            letterSpacing: 0.5,
          }}
        >
          {lang || "javascript"}
        </Typography>

        <Box sx={{ display: "flex", gap: 0.75 }}>
          <Button size="small" variant="text" onClick={reset} sx={{ minWidth: 52, fontSize: "0.75rem", textTransform: "none" }}>
            Reset
          </Button>
          {isRunning && (
            <Button size="small" variant="outlined" color="warning" onClick={stop} sx={{ minWidth: 52, fontSize: "0.75rem", textTransform: "none" }}>
              Stop
            </Button>
          )}
          <Button size="small" variant="contained" onClick={run} sx={{ minWidth: 52, fontSize: "0.75rem", textTransform: "none" }}>
            ▶ Run
          </Button>
        </Box>
      </Box>

      {/* CodeMirror editor — fills remaining space above the output panel */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <CodeMirror
          value={editedCode}
          onChange={setEditedCode}
          extensions={[javascript()]}
          theme={isDark ? "dark" : "light"}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            syntaxHighlighting: true,
            autocompletion: true,
            closeBrackets: true,
          }}
          height="100%"
          style={{
            fontSize: "0.875rem",
            fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
            height: "100%",
          }}
        />
      </Box>

      {/* Drag handle — resizes output panel height */}
      <Box
        onMouseDown={handleOutputDividerMouseDown}
        sx={{
          height: 5,
          flexShrink: 0,
          cursor: "row-resize",
          bgcolor: "divider",
          transition: "background-color 0.15s",
          "&:hover": { bgcolor: "primary.main" },
        }}
      />

      {/* Output panel — always visible, height controlled by drag */}
      <Box
        ref={outputRef}
        sx={{
          height: outputHeightPx ?? "20%",
          flexShrink: 0,
          bgcolor: isDark ? "#0d1117" : "#f0f4f8",
          borderTop: `1px solid ${divider}`,
          px: 2,
          pt: 1.5,
          pb: 2,
          fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
          fontSize: "0.8rem",
          lineHeight: 1.8,
          overflowY: "auto",
        }}
      >
        {output.length === 0 ? (
          <Typography
            variant="caption"
            sx={{ color: "text.disabled", display: "block", fontFamily: "inherit", letterSpacing: 0.5 }}
          >
            // Output appears here after you run the code
          </Typography>
        ) : (
          <>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mb: 0.75, fontFamily: "inherit", letterSpacing: 0.5 }}
            >
              Output
            </Typography>
            {output.map((line, i) => (
              <Box
                key={i}
                sx={{
                  color:
                    line.type === "error"
                      ? "error.main"
                      : line.type === "warn"
                      ? "warning.main"
                      : isDark ? "#7ee787" : "#116329",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {line.text}
              </Box>
            ))}
          </>
        )}
      </Box>
    </Paper>
  );
}
