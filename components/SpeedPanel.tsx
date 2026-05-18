export default function SpeedPanel({ wpm, setWpm, compact }: { wpm: number; setWpm: (v: number) => void; compact?: boolean }) {
  const SPEED_PRESETS = [100, 150, 200, 250, 300, 400, 500, 600, 800, 1000];
  return (
    <div style={{ marginBottom: compact ? 0 : undefined }}>
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
        }}>Speed</span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          color: "#000",
          fontWeight: 500,
        }}>{wpm} wpm</span>
      </div>

      <input
        type="range"
        min={80}
        max={1000}
        step={10}
        value={wpm}
        onChange={(e) => setWpm(Number(e.target.value))}
        aria-label="Reading speed in words per minute"
        style={{ marginBottom: "0.75rem" }}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
        {SPEED_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => setWpm(preset)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.05em",
              padding: "0.25rem 0.6rem",
              background: wpm === preset ? "#000" : "#fff",
              color: wpm === preset ? "#fff" : "#525252",
              border: `1px solid ${wpm === preset ? "#000" : "#E5E5E5"}`,
              cursor: "pointer",
              transition: "background 0.1s, color 0.1s",
              borderRadius: 0,
            }}
            onMouseEnter={(e) => {
              if (wpm !== preset) {
                e.currentTarget.style.background = "#000";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#000";
              }
            }}
            onMouseLeave={(e) => {
              if (wpm !== preset) {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#525252";
                e.currentTarget.style.borderColor = "#E5E5E5";
              }
            }}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}