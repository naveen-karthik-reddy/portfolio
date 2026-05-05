import { useState, useRef, useCallback } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

export default function RunableCodeBlock({ code }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [editedCode, setEditedCode] = useState(code);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const timerIds = useRef([]);
  const outputRef = useRef(null);

  const stop = useCallback(() => {
    timerIds.current.forEach(({ type, id }) => {
      type === "interval" ? clearInterval(id) : clearTimeout(id);
    });
    timerIds.current = [];
    setIsRunning(false);
  }, []);

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
        // scroll output panel to bottom after state update
        requestAnimationFrame(() => {
          if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
          }
        });
        return next;
      });
    };

    const fakeConsole = {
      log: (...args) => append("log", ...args),
      warn: (...args) => append("warn", ...args),
      error: (...args) => append("error", ...args),
    };

    const customSetTimeout = (fn, delay, ...args) => {
      const id = window.setTimeout(fn, delay, ...args);
      timerIds.current.push({ type: "timeout", id });
      return id;
    };

    const customSetInterval = (fn, delay, ...args) => {
      const id = window.setInterval(fn, delay, ...args);
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
        "console",
        "setTimeout",
        "setInterval",
        "clearTimeout",
        "clearInterval",
        editedCode
      );
      fn(
        fakeConsole,
        customSetTimeout,
        customSetInterval,
        customClearTimeout,
        customClearInterval
      );
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

  const divider = theme.palette.divider;

  return (
    <Box
      sx={{
        my: 3,
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${divider}`,
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 0.75,
          bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
          borderBottom: `1px solid ${divider}`,
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
          JavaScript
        </Typography>

        <Box sx={{ display: "flex", gap: 0.75 }}>
          <Button
            size="small"
            variant="text"
            onClick={reset}
            sx={{ minWidth: 52, fontSize: "0.75rem", textTransform: "none" }}
          >
            Reset
          </Button>
          {isRunning && (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={stop}
              sx={{ minWidth: 52, fontSize: "0.75rem", textTransform: "none" }}
            >
              Stop
            </Button>
          )}
          <Button
            size="small"
            variant="contained"
            onClick={run}
            sx={{ minWidth: 52, fontSize: "0.75rem", textTransform: "none" }}
          >
            ▶ Run
          </Button>
        </Box>
      </Box>

      {/* Code area — always editable CodeMirror */}
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
        style={{
          fontSize: "0.875rem",
          fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
        }}
      />

      {/* Output panel — max height + scroll */}
      {output.length > 0 && (
        <Box
          ref={outputRef}
          sx={{
            bgcolor: isDark ? "#0d1117" : "#f0f4f8",
            borderTop: `1px solid ${divider}`,
            px: 2,
            pt: 1.5,
            pb: 2,
            fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
            fontSize: "0.8rem",
            lineHeight: 1.8,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "block",
              mb: 0.75,
              fontFamily: "inherit",
              letterSpacing: 0.5,
            }}
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
                    : isDark
                    ? "#7ee787"
                    : "#116329",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {line.text}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
