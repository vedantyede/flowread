export default function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "1rem",
        fontWeight: 500,
        letterSpacing: "-0.02em",
        color: "#000",
        lineHeight: 1,
      }}>{value}</div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.6rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#C0C0C0",
        marginTop: "0.2rem",
      }}>{label}</div>
    </div>
  );
}