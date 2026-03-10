// app/dashboard/loading.tsx
export default function DashboardLoading() {
  const shimmer: React.CSSProperties = {
    background: "linear-gradient(90deg, #0D0D14 25%, #111120 50%, #0D0D14 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
    borderRadius: "6px",
  };
  return (
    <div>
      <style>{`@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }`}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ ...shimmer, height: 90, border: "1px solid #1A1A24" }} />
        ))}
      </div>
      <div style={{ ...shimmer, height: 320, border: "1px solid #1A1A24", marginBottom: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ ...shimmer, height: 200, border: "1px solid #1A1A24" }} />
        <div style={{ ...shimmer, height: 200, border: "1px solid #1A1A24" }} />
      </div>
    </div>
  );
}