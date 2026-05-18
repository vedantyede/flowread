export default function WordLimitPanel({
  wordLimit, setWordLimit, totalWords,
}: { wordLimit: number | undefined; setWordLimit: (v: number | undefined) => void; totalWords: number }) {
  const WORD_LIMIT_PRESETS = [
    { label: "∞", value: undefined },
    { label: "50", value: 50 },
    { label: "100", value: 100 },
    { label: "250", value: 250 },
    { label: "500", value: 500 },
  ];
  return (
    <div>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "0.75rem",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#525252",
        }}>Word Limit</span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          color: "#000",
          fontWeight: 500,
        }}>
          {wordLimit ? `${Math.min(wordLimit, totalWords)} of ${totalWords}` : `All ${totalWords || "—"}`}
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
        {WORD_LIMIT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setWordLimit(preset.value)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.08em",
              padding: "0.25rem 0.75rem",
              background: wordLimit === preset.value ? "#000" : "#fff",
              color: wordLimit === preset.value ? "#fff" : "#525252",
              border: `1px solid ${wordLimit === preset.value ? "#000" : "#E5E5E5"}`,
              cursor: "pointer",
              transition: "background 0.1s, color 0.1s",
              borderRadius: 0,
            }}
            onMouseEnter={(e) => {
              if (wordLimit !== preset.value) {
                e.currentTarget.style.background = "#000";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#000";
              }
            }}
            onMouseLeave={(e) => {
              if (wordLimit !== preset.value) {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#525252";
                e.currentTarget.style.borderColor = "#E5E5E5";
              }
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
