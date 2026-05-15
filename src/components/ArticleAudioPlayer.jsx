import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from "react";
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
import { markdownToPlainText } from "../utils/markdownToPlainText";

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

const ArticleAudioPlayer = forwardRef(function ArticleAudioPlayer({ markdownContent }, ref) {
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

  const plainText = useMemo(() => markdownToPlainText(markdownContent), [markdownContent]);
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
  }, [plainText]);

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

    const chunks = splitIntoChunks(remainingText);

    // Build cumulative char offset for each chunk (within remainingText)
    const chunkOffsets = [];
    let acc = 0;
    for (const chunk of chunks) {
      chunkOffsets.push(acc);
      acc += chunk.length + 1; // +1 for the newline between paragraphs
    }

    chunks.forEach((chunk, idx) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = rateRef.current;
      if (voiceRef.current) utterance.voice = voiceRef.current;

      utterance.onboundary = (e) => {
        if (generationRef.current !== gen || e.name !== "word") return;
        const absChar = charOffsetRef.current + chunkOffsets[idx] + e.charIndex;
        charIndexRef.current = absChar;
        const total = text.length;
        setProgress(total > 0 ? Math.min((absChar / total) * 100, 100) : 0);
        const charsLeft = Math.max(0, total - absChar);
        const wordsLeft = Math.ceil(charsLeft / AVG_CHARS_PER_WORD);
        const secsLeft = Math.ceil((wordsLeft / AVG_WPM) * 60 / rateRef.current);
        setTimeLeft(secsLeft < 60 ? `${secsLeft}s left` : `${Math.ceil(secsLeft / 60)} min left`);
      };

      if (idx === chunks.length - 1) {
        utterance.onend = () => {
          if (generationRef.current !== gen) return;
          setStatus("idle");
          setProgress(100);
          setTimeLeft("");
          charIndexRef.current = 0;
          charOffsetRef.current = 0;
        };
      }

      window.speechSynthesis.speak(utterance);
    });

    setStatus("playing");
    userPausedRef.current = false;
  }

  useImperativeHandle(ref, () => ({
    startFromText(paragraphText) {
      if (!window.speechSynthesis) return;
      const text = textRef.current;
      if (!text) return;
      const normalized = paragraphText.replace(/\s+/g, " ").trim();
      let idx = -1;
      for (let len = Math.min(80, normalized.length); len >= 15; len -= 10) {
        idx = text.indexOf(normalized.slice(0, len));
        if (idx !== -1) break;
      }
      startFrom(Math.max(0, idx));
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
  );
});

export default ArticleAudioPlayer;
