export default function PrimaryBtn({ onClick, title, children }: { onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: "52px",
        height: "52px",
        background: "#000",
        color: "#fff",
        border: "2px solid #000",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.1s, color 0.1s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "#000"; e.currentTarget.style.color = "#fff"; }}
    >
      {children}
    </button>
  );
}