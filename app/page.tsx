"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StatCell from "@/components/StatCell";
import SmallBtn from "@/components/SmallBtn";
import PrimaryBtn from "@/components/PrimaryBtn";
import SpeedPanel from "@/components/SpeedPanel";
import WordLimitPanel from "@/components/WordLimitPanel";

type ReaderState = "idle" | "reading" | "paused" | "done";

function highlightWord(word: string) {
  const orpIndex = Math.max(0, Math.floor(word.length * 0.3));
  return {
    before: word.slice(0, orpIndex),
    orp: word[orpIndex] || "",
    after: word.slice(orpIndex + 1),
  };
}

/* ─── Icon components ──────────────────────────────────────── */
const IconPause = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="2" width="3.5" height="12" fill="currentColor" />
    <rect x="9.5" y="2" width="3.5" height="12" fill="currentColor" />
  </svg>
);
const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 2L14 8L4 14V2Z" fill="currentColor" />
  </svg>
);
const IconRestart = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 1.5A6 6 0 101.5 7.5H0A7.5 7.5 0 107.5 0V1.5Z" fill="currentColor" />
    <path d="M7.5 0V4L10 2L7.5 0Z" fill="currentColor" />
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 10.5V13H3.5L10.42 6.08L7.92 3.58L1 10.5Z" fill="currentColor" />
    <path d="M12.71 3.29A1 1 0 0012.71 1.88L11.12 0.29A1 1 0 009.71 0.29L8.5 1.5L11 4L12.71 3.29Z" fill="currentColor" />
  </svg>
);
const IconBack = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1L1 7L7 13V9.5C10.3 9.5 12.5 10.8 14 13.5 13.3 9 10.7 5.5 7 5V1Z" fill="currentColor" />
  </svg>
);
const IconForward = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1L13 7L7 13V9.5C3.7 9.5 1.5 10.8 0 13.5.7 9 3.3 5.5 7 5V1Z" fill="currentColor" />
  </svg>
);

/* ─── Main Page ──────────────────────────────────────────────── */
export default function SpeedReader() {
  const [text, setText] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState<ReaderState>("idle");
  const [wpm, setWpm] = useState(250);
  const [wordLimit, setWordLimit] = useState<number | undefined>(undefined);
  const [wordKey, setWordKey] = useState(0);
  const [showInput, setShowInput] = useState(true);
  const [showSupport, setShowSupport] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);

  const activeWords = wordLimit ? words.slice(0, wordLimit) : words;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const progress = activeWords.length > 0 ? Math.round((currentIndex / activeWords.length) * 100) : 0;
  const estimatedTime = activeWords.length > 0 ? Math.ceil((activeWords.length - currentIndex) / wpm) : 0;

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const scheduleNext = useCallback((idx: number, wordsArr: string[], speed: number) => {
    clearTimer();
    if (idx >= wordsArr.length) { setState("done"); return; }
    const hasPunctuation = /[.,!?;:]/.test(wordsArr[idx]);
    const interval = Math.round(60000 / speed) * (hasPunctuation ? 1.4 : 1);
    timerRef.current = setTimeout(() => {
      const nextIdx = idx + 1;
      indexRef.current = nextIdx;
      setCurrentIndex(nextIdx);
      setWordKey((k) => k + 1);
      scheduleNext(nextIdx, wordsArr, speed);
    }, interval);
  }, [clearTimer]);

  const startReading = useCallback(() => {
    if (!text.trim()) return;
    const parsed = text.trim().split(/\s+/).filter(Boolean);
    const limited = wordLimit ? parsed.slice(0, wordLimit) : parsed;
    setWords(limited);
    setCurrentIndex(0);
    indexRef.current = 0;
    setWordKey(0);
    setState("reading");
    setShowInput(false);
    clearTimer();
    timerRef.current = setTimeout(() => {
      setCurrentIndex(1); indexRef.current = 1; setWordKey(1);
      scheduleNext(1, limited, wpm);
    }, Math.round(60000 / wpm));
  }, [text, wordLimit, wpm, clearTimer, scheduleNext]);

  const pauseReading = useCallback(() => { clearTimer(); setState("paused"); }, [clearTimer]);
  const resumeReading = useCallback(() => { setState("reading"); scheduleNext(indexRef.current, activeWords, wpm); }, [activeWords, wpm, scheduleNext]);

  const restartReading = useCallback(() => {
    clearTimer();
    setCurrentIndex(0); indexRef.current = 0; setWordKey(0);
    setState("reading");
    timerRef.current = setTimeout(() => {
      setCurrentIndex(1); indexRef.current = 1; setWordKey(1);
      scheduleNext(1, activeWords, wpm);
    }, Math.round(60000 / wpm));
  }, [clearTimer, activeWords, wpm, scheduleNext]);

  const goToText = useCallback(() => {
    clearTimer(); setState("idle"); setShowInput(true);
    setCurrentIndex(0); indexRef.current = 0;
  }, [clearTimer]);

  const skipWords = useCallback((delta: number) => {
    const newIdx = Math.max(0, Math.min(activeWords.length, indexRef.current + delta));
    clearTimer();
    setCurrentIndex(newIdx); indexRef.current = newIdx; setWordKey((k) => k + 1);
    if (state === "reading") scheduleNext(newIdx, activeWords, wpm);
  }, [clearTimer, activeWords, wpm, state, scheduleNext]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  useEffect(() => {
    if (state === "reading") { clearTimer(); scheduleNext(indexRef.current, activeWords, wpm); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wpm]);

  const currentWord = activeWords[currentIndex > 0 ? currentIndex - 1 : 0] || "";
  const { before, orp, after } = highlightWord(currentWord);

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fff" }}>

      {/* ─── Header ───────────────────────────────────────────── */}
      <header style={{
        borderBottom: "4px solid #000",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2.5rem",
        height: "64px",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "1.375rem",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "#000",
          }}>FlowRead</span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            color: "#525252",
            textTransform: "uppercase",
          }}>Speed Reader</span>
        </div>

        <button
          onClick={() => setShowSupport(true)}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            background: "#000",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            transition: "background 0.1s, color 0.1s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; e.currentTarget.style.outline = "2px solid #000"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#000"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.outline = "none"; }}
        >
          ☕ Support
        </button>
      </header>

      {/* ─── Body ─────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        maxWidth: "720px",
        width: "100%",
        margin: "0 auto",
        padding: "3rem 2rem",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Stats row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2.5rem",
          borderBottom: "1px solid #E5E5E5",
          paddingBottom: "1rem",
        }}>
          <div style={{ display: "flex", gap: "2rem" }}>
            <StatCell label="Words" value={wordCount.toLocaleString()} />
            <StatCell label="Chars" value={charCount.toLocaleString()} />
            {state !== "idle" && activeWords.length > 0 && (
              <StatCell label="Min left" value={`~${estimatedTime}`} />
            )}
          </div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            color: "#525252",
          }}>
            <span style={{ color: "#000", fontWeight: 600 }}>{wpm}</span> WPM
          </div>
        </div>

        {/* ─── Reader / Input toggle ────────────────────────── */}
        <AnimatePresence mode="wait">
          {!showInput && state !== "idle" ? (
            <motion.div
              key="reader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Word stage */}
              <div
                className="texture-lines"
                style={{
                  border: "2px solid #000",
                  height: "200px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  marginBottom: "0",
                  background: "#fff",
                  overflow: "hidden",
                }}
              >
                {/* vertical centre line */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "50%",
                  width: "1px",
                  background: "#E5E5E5",
                  transform: "translateX(-50%)",
                  pointerEvents: "none",
                }} />

                {/* The word */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={wordKey}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.08 }}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(2.5rem, 8vw, 4rem)",
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                      userSelect: "none",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <span style={{ color: "#525252" }}>{before}</span>
                    <span style={{
                      color: "#000",
                      borderBottom: "3px solid #000",
                    }}>{orp}</span>
                    <span style={{ color: "#000" }}>{after}</span>
                  </motion.div>
                </AnimatePresence>

                {/* Context words below */}
                <div style={{
                  position: "absolute",
                  bottom: "1rem",
                  display: "flex",
                  gap: "1rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                  color: "#C0C0C0",
                }}>
                  <span>{activeWords[currentIndex - 2] || ""}</span>
                  <span style={{ color: "#999" }}>{activeWords[currentIndex - 1] || ""}</span>
                  <span style={{ color: "#525252" }}>·</span>
                  <span style={{ color: "#999" }}>{activeWords[currentIndex] || ""}</span>
                  <span>{activeWords[currentIndex + 1] || ""}</span>
                </div>

                {/* State badge */}
                <div style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: state === "done" ? "#525252" : "#000",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}>
                  {state === "reading" && (
                    <span style={{
                      width: 6, height: 6,
                      background: "#000",
                      display: "inline-block",
                      animation: "pulse 1s ease-in-out infinite",
                    }} />
                  )}
                  {state}
                </div>

                {/* Word counter */}
                <div style={{
                  position: "absolute",
                  bottom: "1rem",
                  right: "1rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "#C0C0C0",
                }}>
                  {Math.max(currentIndex, 1)}/{activeWords.length}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: "3px", background: "#E5E5E5", marginBottom: "2rem" }}>
                <motion.div
                  style={{ height: "100%", background: "#000" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.15 }}
                />
              </div>

              {/* Controls */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                marginBottom: "2.5rem",
              }}>
                <SmallBtn onClick={goToText} title="Edit text"><IconEdit /></SmallBtn>
                <SmallBtn onClick={restartReading} title="Restart"><IconRestart /></SmallBtn>
                <SmallBtn onClick={() => skipWords(-10)} title="Back 10 words"><IconBack /></SmallBtn>

                {/* Primary play/pause */}
                {state === "reading" ? (
                  <PrimaryBtn onClick={pauseReading} title="Pause"><IconPause /></PrimaryBtn>
                ) : state === "paused" ? (
                  <PrimaryBtn onClick={resumeReading} title="Resume"><IconPlay /></PrimaryBtn>
                ) : (
                  <PrimaryBtn onClick={restartReading} title="Read again"><IconRestart /></PrimaryBtn>
                )}

                <SmallBtn onClick={() => skipWords(10)} title="Forward 10 words"><IconForward /></SmallBtn>

                {/* WPM inline nudge */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginLeft: "0.5rem" }}>
                  <SmallBtn onClick={() => setWpm(w => Math.max(80, w - 50))} title="Slower">
                    <span style={{ fontSize: "1rem", lineHeight: 1 }}>−</span>
                  </SmallBtn>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    minWidth: "4ch",
                    textAlign: "center",
                    letterSpacing: "0.05em",
                  }}>{wpm}</span>
                  <SmallBtn onClick={() => setWpm(w => Math.min(1000, w + 50))} title="Faster">
                    <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
                  </SmallBtn>
                </div>
              </div>

              {/* Speed control (compact, in reader) */}
              <SpeedPanel wpm={wpm} setWpm={setWpm} compact />
            </motion.div>

          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Hero label */}
              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#525252",
                  marginBottom: "0.5rem",
                }}>01 — Paste your text</p>
                <div style={{ width: "3rem", height: "4px", background: "#000" }} />
              </div>

              {/* Textarea */}
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste any article, chapter, or note here…"
                  rows={8}
                  style={{
                    width: "100%",
                    border: "2px solid #000",
                    padding: "1.25rem",
                    fontSize: "0.875rem",
                    lineHeight: "1.7",
                    color: "#000",
                    background: "#fff",
                    fontFamily: "var(--font-body)",
                    resize: "vertical",
                    borderRadius: 0,
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderWidth = "3px")}
                  onBlur={(e) => (e.currentTarget.style.borderWidth = "2px")}
                />
                {text && (
                  <button
                    onClick={() => setText("")}
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      width: "24px",
                      height: "24px",
                      background: "#000",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}
                  >×</button>
                )}
              </div>

              {/* Settings grid */}
              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#525252",
                  marginBottom: "1rem",
                }}>02 — Configure</p>
                <div style={{ height: "1px", background: "#E5E5E5", marginBottom: "1.5rem" }} />
              </div>

              <SpeedPanel wpm={wpm} setWpm={setWpm} />
              <div style={{ height: "1px", background: "#E5E5E5", margin: "1.5rem 0" }} />
              <WordLimitPanel wordLimit={wordLimit} setWordLimit={setWordLimit} totalWords={wordCount} />
              <div style={{ height: "4px", background: "#000", margin: "2rem 0" }} />

              {/* Start button */}
              <button
                onClick={startReading}
                disabled={!text.trim()}
                style={{
                  width: "100%",
                  padding: "1.25rem",
                  background: text.trim() ? "#000" : "#E5E5E5",
                  color: text.trim() ? "#fff" : "#C0C0C0",
                  border: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: text.trim() ? "pointer" : "not-allowed",
                  transition: "background 0.1s, color 0.1s",
                  borderRadius: 0,
                }}
                onMouseEnter={(e) => {
                  if (text.trim()) {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.color = "#000";
                    e.currentTarget.style.outline = "2px solid #000";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = text.trim() ? "#000" : "#E5E5E5";
                  e.currentTarget.style.color = text.trim() ? "#fff" : "#C0C0C0";
                  e.currentTarget.style.outline = "none";
                }}
              >
                {text.trim()
                  ? `Start Reading → ${wordLimit ? Math.min(wordCount, wordLimit) : wordCount} words`
                  : "Paste text above to begin"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── How it works (shown only on idle) ─────────────── */}
        {state === "idle" && showInput && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ marginTop: "4rem" }}
            aria-label="How FlowRead works"
          >
            <div style={{ height: "4px", background: "#000", marginBottom: "2.5rem" }} />
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#525252",
              marginBottom: "1.5rem",
            }}>How it works</div>

            {/* Inverted stats row */}
            <div
              className="texture-inverted"
              style={{
                background: "#000",
                color: "#fff",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {[
                { step: "01", title: "Paste", desc: "Drop any text — articles, chapters, emails, notes." },
                { step: "02", title: "Tune", desc: "Set your WPM speed. Optionally limit word count." },
                { step: "03", title: "Flow", desc: "Words flash one by one. Read 2–3× faster effortlessly." },
              ].map((item, i) => (
                <div
                  key={item.step}
                  style={{
                    padding: "2rem 1.5rem",
                    borderRight: i < 2 ? "1px solid #333" : "none",
                  }}
                >
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    color: "#555",
                    marginBottom: "0.75rem",
                  }}>{item.step}</div>
                  <div style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: "0.5rem",
                    letterSpacing: "-0.02em",
                  }}>{item.title}</div>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    color: "#888",
                    lineHeight: 1.6,
                  }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer style={{
        borderTop: "4px solid #000",
        padding: "1.25rem 2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "0.12em",
          color: "#525252",
          textTransform: "uppercase",
        }}>FlowRead · Free · No account needed</span>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.8rem",
          fontStyle: "italic",
          color: "#C0C0C0",
        }}>Read more. Remember more.</span>
      </footer>

      {/* ─── Support Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showSupport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => setShowSupport(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.12 }}
              style={{
                background: "#fff",
                border: "2px solid #000",
                padding: "2.5rem",
                maxWidth: "420px",
                width: "100%",
                borderRadius: 0,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.75rem",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                marginBottom: "0.25rem",
              }}>Support FlowRead</div>

              <div style={{ height: "3px", background: "#000", width: "3rem", marginBottom: "1.25rem" }} />

              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                color: "#525252",
                marginBottom: "2rem",
              }}>
                {`FlowRead is free and always will be. If it's helped you read faster, consider a small token of support.`}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <a
                  href="https://www.buymeacoffee.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.9rem 1.5rem",
                    background: "#000",
                    color: "#fff",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    transition: "background 0.1s, color 0.1s",
                    border: "2px solid #000",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#000"; e.currentTarget.style.color = "#fff"; }}
                >
                  ☕ Buy me a coffee
                </a>
                <a
                  href="https://ko-fi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.9rem 1.5rem",
                    background: "#fff",
                    color: "#000",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    transition: "background 0.1s, color 0.1s",
                    border: "2px solid #000",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#000"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}
                >
                  ❤️ Support on Ko-fi
                </a>
              </div>

              <button
                onClick={() => setShowSupport(false)}
                style={{
                  marginTop: "1.25rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#C0C0C0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </main>
  );
}
