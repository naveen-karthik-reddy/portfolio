import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import { PlayArrow, Pause, Stop, VolumeUp } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { markdownToPlainText, markdownToBlocks } from "../utils/markdownToPlainText";

const RATES = [0.75, 1, 1.25, 1.5, 2];
const AVG_WPM = 150;
const AVG_CHARS_PER_WORD = 5;
const CHUNK_MAX_WORDS = 120; // keeps remote (Google) voices within their per-request limit
const VOICE_STORAGE_KEY = "article-player-voice";

// Higher = better. Only English voices.
function scoreVoice(voice) {
  if (!voice.lang.startsWith("en")) return -1;
  let score = 0;
  if (/natural|neural|enhanced/i.test(voice.name)) score += 6;
  if (voice.name.startsWith("Google")) score += 4;
  // Modern Microsoft voices (exclude old David/Zira/Mark era)
  if (voice.name.startsWith("Microsoft") && !/\b(David|Zira|Mark|Hazel|Helen|Hedda|Helia|Katja|Stefan|Heera|Ravi)\b/i.test(voice.name)) score += 3;
  return score;
}

function voiceLabel(voice) {
  return voice.name
    .replace(/^Microsoft\s+/, "")
    .replace(/\s+Online\b.*$/, "")
    .replace(/\s+Desktop\b.*$/, "")
    .replace(/\s*\(.*?\)\s*$/, "")
    .replace(/\s*-\s*.+$/, "")
    .trim() || voice.name;
}

// Split plain text into paragraph-aligned chunks so each utterance stays small.
// This is required for remote voices (Google) which fail on long single requests.
function splitIntoChunks(text) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  const chunks = [];

  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length <= CHUNK_MAX_WORDS) {
      chunks.push(para);
    } else {
      // Long paragraph: break into word-count slices
      for (let i = 0; i < words.length; i += CHUNK_MAX_WORDS) {
        chunks.push(words.slice(i, i + CHUNK_MAX_WORDS).join(" "));
      }
    }
  }

  return chunks.filter(Boolean);
}

const ArticleAudioPlayer = forwardRef(function ArticleAudioPlayer({ markdownContent, onBlockChange }, ref) {
  const theme = useTheme();
  const [status, setStatus] = useState("idle"); // 'idle' | 'playing' | 'paused'
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState(1);
  const [timeLeft, setTimeLeft] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState(
    () => localStorage.getItem(VOICE_STORAGE_KEY) ?? ""
  );

  const charIndexRef = useRef(0);
  const charOffsetRef = useRef(0);
  const rateRef = useRef(1);
  const voiceRef = useRef(null);
  const userPausedRef = useRef(false);
  const textRef = useRef("");
  // Each startFrom call gets a new generation; stale callbacks ignore themselves.
  const generationRef = useRef(0);


  const activeBlockIdxRef = useRef(-1);

  const plainText = useMemo(() => markdownToPlainText(markdownContent), [markdownContent]);
  const blocks = useMemo(() => markdownToBlocks(markdownContent), [markdownContent]);
  const totalWords = useMemo(() => plainText.split(/\s+/).filter(Boolean).length, [plainText]);
  const estimatedMins = useMemo(() => Math.ceil(totalWords / AVG_WPM), [totalWords]);

  // Load voices (async in most browsers)
  useEffect(() => {
    function loadVoices() {
      const all = window.speechSynthesis.getVoices();
      const english = all.filter((v) => scoreVoice(v) >= 0);
      english.sort((a, b) => scoreVoice(b) - scoreVoice(a));
      if (english.length === 0) return;
      setVoices(english);
    }
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  // Sync voiceRef whenever the list or selection changes
  useEffect(() => {
    if (voices.length === 0) return;
    const saved = voices.find((v) => v.name === selectedVoiceName);
    const chosen = saved ?? voices[0];
    voiceRef.current = chosen;
    if (!saved && voices[0]) setSelectedVoiceName(voices[0].name);
  }, [voices, selectedVoiceName]);

  useEffect(() => {
    textRef.current = plainText;
    generationRef.current++;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setStatus("idle");
    setProgress(0);
    setTimeLeft("");
    charIndexRef.current = 0;
    charOffsetRef.current = 0;
    userPausedRef.current = false;
    activeBlockIdxRef.current = -1;
    onBlockChange?.(-1, null);
  }, [plainText]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); }, []);

  function startFrom(charOffset) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const gen = ++generationRef.current;
    const text = textRef.current;
    const remainingText = text.slice(charOffset);

    if (!remainingText.trim()) {
      setStatus("idle");
      setProgress(100);
      setTimeLeft("");
      return;
    }

    charOffsetRef.current = charOffset;

    // Immediately reflect the starting position
    const total = text.length;
    if (total > 0) setProgress(Math.min((charOffset / total) * 100, 100));

    const chunks = splitIntoChunks(remainingText);

    // Exact position of each chunk within remainingText
    const chunkOffsets = [];
    let searchFrom = 0;
    for (const chunk of chunks) {
      const pos = remainingText.indexOf(chunk, searchFrom);
      const offset = pos >= 0 ? pos : searchFrom;
      chunkOffsets.push(offset);
      searchFrom = offset + chunk.length;
    }

    // Block index for each chunk (pre-computed, stable)
    const chunkBlockIdxs = chunks.map((_, i) => {
      const absStart = charOffset + chunkOffsets[i];
      return blocks.findIndex((b, j) => {
        const nextStart = j + 1 < blocks.length ? blocks[j + 1].start : Infinity;
        return absStart >= b.start && absStart < nextStart;
      });
    });

    // Speak one chunk at a time — fixes Chrome's bug where onstart/onend don't
    // fire reliably when all utterances are queued at once in a loop.
    function speakChunk(idx) {
      if (generationRef.current !== gen || idx >= chunks.length) return;

      // Update highlight synchronously before speaking this chunk
      const blockIdx = chunkBlockIdxs[idx];
      if (blockIdx !== -1 && blockIdx !== activeBlockIdxRef.current) {
        activeBlockIdxRef.current = blockIdx;
        onBlockChange?.(blockIdx, blocks[blockIdx]?.text);
      }

      const utterance = new SpeechSynthesisUtterance(chunks[idx]);
      utterance.rate = rateRef.current;
      if (voiceRef.current) utterance.voice = voiceRef.current;

      utterance.onboundary = (e) => {
        if (generationRef.current !== gen || e.name !== "word") return;
        const absChar = charOffset + chunkOffsets[idx] + e.charIndex;
        charIndexRef.current = absChar;
        setProgress(total > 0 ? Math.min((absChar / total) * 100, 100) : 0);
        const charsLeft = Math.max(0, total - absChar);
        const wordsLeft = Math.ceil(charsLeft / AVG_CHARS_PER_WORD);
        const secsLeft = Math.ceil((wordsLeft / AVG_WPM) * 60 / rateRef.current);
        setTimeLeft(secsLeft < 60 ? `${secsLeft}s left` : `${Math.ceil(secsLeft / 60)} min left`);
      };

      utterance.onend = () => {
        if (generationRef.current !== gen) return;
        if (idx < chunks.length - 1) {
          speakChunk(idx + 1);
        } else {
          setStatus("idle");
          setProgress(100);
          setTimeLeft("");
          charIndexRef.current = 0;
          charOffsetRef.current = 0;
          activeBlockIdxRef.current = -1;
          onBlockChange?.(-1, null);
        }
      };

      window.speechSynthesis.speak(utterance);
    }

    // Highlight the starting block immediately, then begin speech
    const startBlockIdx = chunkBlockIdxs[0] ?? -1;
    if (startBlockIdx !== -1) {
      activeBlockIdxRef.current = startBlockIdx;
      onBlockChange?.(startBlockIdx, blocks[startBlockIdx]?.text);
    }
    speakChunk(0);
    setStatus("playing");
    userPausedRef.current = false;
  }

  useImperativeHandle(ref, () => ({
    startFromText(paragraphText) {
      if (!window.speechSynthesis) return;
      const text = textRef.current;
      if (!text) return;

      // Primary: substring search on the plain text (handles most paragraphs)
      const normalized = paragraphText.replace(/\s+/g, " ").trim();
      let charOffset = -1;
      for (let len = Math.min(80, normalized.length); len >= 15; len -= 10) {
        const i = text.indexOf(normalized.slice(0, len));
        if (i !== -1) { charOffset = i; break; }
      }

      // Fallback: normalized prefix-score match across blocks.
      // Handles paragraphs where inline code was stripped from the plain text.
      if (charOffset === -1 && blocks.length > 0) {
        const norm = (s) =>
          s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
        const needle = norm(paragraphText);
        let bestIdx = -1, bestScore = 0;
        for (let i = 0; i < blocks.length; i++) {
          const bn = norm(blocks[i].text);
          const cap = Math.min(needle.length, bn.length, 50);
          let sc = 0;
          while (sc < cap && needle[sc] === bn[sc]) sc++;
          if (sc > bestScore) { bestScore = sc; bestIdx = i; }
        }
        if (bestIdx !== -1) charOffset = blocks[bestIdx].start;
      }

      if (charOffset >= 0) startFrom(charOffset);
    },
  }));

  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  function handlePlayPause() {
    if (status === "playing") {
      userPausedRef.current = true;
      window.speechSynthesis.pause();
      setStatus("paused");
    } else if (status === "paused") {
      userPausedRef.current = false;
      window.speechSynthesis.resume();
      setStatus("playing");
    } else {
      startFrom(charIndexRef.current);
    }
  }

  function handleStop() {
    generationRef.current++;
    window.speechSynthesis.cancel();
    setStatus("idle");
    setProgress(0);
    setTimeLeft("");
    charIndexRef.current = 0;
    charOffsetRef.current = 0;
    userPausedRef.current = false;
    activeBlockIdxRef.current = -1;
    onBlockChange?.(-1, null);
  }

  function handleRateChange(e) {
    const newRate = Number(e.target.value);
    setRate(newRate);
    rateRef.current = newRate;
    if (status === "playing" || status === "paused") startFrom(charIndexRef.current);
  }

  function handleVoiceChange(e) {
    const name = e.target.value;
    setSelectedVoiceName(name);
    localStorage.setItem(VOICE_STORAGE_KEY, name);
    voiceRef.current = voices.find((v) => v.name === name) ?? null;
    if (status === "playing" || status === "paused") startFrom(charIndexRef.current);
  }

  const isActive = status !== "idle";
  const grad = `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;
  const selectSx = {
    fontSize: "0.72rem",
    height: 26,
    flexShrink: 0,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
    "& .MuiSelect-select": { py: 0, px: 1, lineHeight: "26px" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
  };

  return (
    <>
      {/* Inline player */}
      <Paper
        role="region"
        aria-label="Article audio player"
        className="no-print"
        elevation={0}
        sx={{
          px: 2,
          py: 1.25,
          mb: 4,
          border: "1px solid",
          borderColor: isActive ? "primary.main" : "divider",
          borderRadius: 2,
          transition: "border-color 0.3s",
        }}
      >
        {/* Row 1 — playback controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <VolumeUp
            sx={{
              color: isActive ? "primary.main" : "text.disabled",
              fontSize: 18,
              transition: "color 0.3s",
              flexShrink: 0,
            }}
          />

          <Tooltip
            title={status === "playing" ? "Pause" : status === "paused" ? "Resume" : "Listen to article"}
            arrow
          >
            <IconButton
              onClick={handlePlayPause}
              size="small"
              aria-label={status === "playing" ? "Pause" : "Play article"}
              sx={{
                color: "primary.main",
                border: "1px solid",
                borderColor: "primary.main",
                borderRadius: 1.5,
                p: 0.5,
                "&:hover": { bgcolor: "primary.main", color: "background.paper" },
                transition: "all 0.2s",
              }}
            >
              {status === "playing" ? <Pause sx={{ fontSize: 16 }} /> : <PlayArrow sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>

          {isActive && (
            <Tooltip title="Stop" arrow>
              <IconButton
                onClick={handleStop}
                size="small"
                aria-label="Stop"
                sx={{
                  color: "text.secondary",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  p: 0.5,
                  "&:hover": { borderColor: "text.secondary", color: "text.primary" },
                  transition: "all 0.2s",
                }}
              >
                <Stop sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}

          <Box sx={{ flex: 1, minWidth: 80 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 3,
                borderRadius: 2,
                bgcolor: "divider",
                "& .MuiLinearProgress-bar": { background: grad, borderRadius: 2 },
              }}
            />
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.72rem", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {timeLeft || (status === "idle" ? `~${estimatedMins} min` : "")}
          </Typography>

          <Select
            value={rate}
            onChange={handleRateChange}
            size="small"
            variant="outlined"
            aria-label="Playback speed"
            sx={selectSx}
          >
            {RATES.map((r) => (
              <MenuItem key={r} value={r} sx={{ fontSize: "0.8rem" }}>
                {r}×
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Row 2 — voice selector */}
        {voices.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", flexShrink: 0 }}>
              Voice
            </Typography>
            <Select
              value={selectedVoiceName}
              onChange={handleVoiceChange}
              size="small"
              variant="outlined"
              aria-label="Select voice"
              sx={{ ...selectSx, maxWidth: 260 }}
            >
              {voices.map((v) => (
                <MenuItem key={v.name} value={v.name} sx={{ fontSize: "0.8rem" }}>
                  {voiceLabel(v)}
                  {/natural|neural|enhanced/i.test(v.name) && (
                    <Box
                      component="span"
                      sx={{ ml: 0.75, fontSize: "0.65rem", color: "primary.main", fontWeight: 700 }}
                    >
                      HD
                    </Box>
                  )}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}
      </Paper>

      {/* Floating mini-player — visible when audio is active, portalled to body to escape Framer Motion transform containment */}
      {isActive && createPortal(
        <Paper
          role="region"
          aria-label="Floating audio controls"
          className="no-print"
          elevation={6}
          sx={{
            position: "fixed",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1250,
            px: 2,
            py: 1,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "primary.main",
            bgcolor: theme.palette.mode === "dark" ? "rgba(20, 20, 40, 0.95)" : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            boxShadow: theme.palette.mode === "dark"
              ? "0 4px 24px rgba(0,0,0,0.5)"
              : "0 4px 24px rgba(0,0,0,0.12)",
            maxWidth: 520,
            width: "calc(100vw - 32px)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Tooltip
              title={status === "playing" ? "Pause" : "Resume"}
              arrow
            >
              <IconButton
                onClick={handlePlayPause}
                size="small"
                aria-label={status === "playing" ? "Pause" : "Resume"}
                sx={{
                  color: "primary.main",
                  border: "1px solid",
                  borderColor: "primary.main",
                  borderRadius: 1.5,
                  p: 0.5,
                  "&:hover": { bgcolor: "primary.main", color: "background.paper" },
                  transition: "all 0.2s",
                }}
              >
                {status === "playing" ? <Pause sx={{ fontSize: 16 }} /> : <PlayArrow sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Stop" arrow>
              <IconButton
                onClick={handleStop}
                size="small"
                aria-label="Stop"
                sx={{
                  color: "text.secondary",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  p: 0.5,
                  "&:hover": { borderColor: "text.secondary", color: "text.primary" },
                  transition: "all 0.2s",
                }}
              >
                <Stop sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <Box sx={{ flex: 1, minWidth: 60 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 3,
                  borderRadius: 2,
                  bgcolor: "divider",
                  "& .MuiLinearProgress-bar": { background: grad, borderRadius: 2 },
                }}
              />
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.72rem", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {timeLeft}
            </Typography>

            <Select
              value={rate}
              onChange={handleRateChange}
              size="small"
              variant="outlined"
              aria-label="Playback speed"
              sx={selectSx}
            >
              {RATES.map((r) => (
                <MenuItem key={r} value={r} sx={{ fontSize: "0.8rem" }}>
                  {r}×
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Paper>,
        document.body
      )}
    </>
  );
});

export default ArticleAudioPlayer;
