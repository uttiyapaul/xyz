// app/loading.tsx
export default function GlobalLoading() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#050508",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, border: "2px solid #1A1A24",
          borderTopColor: "#F59E0B", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
        }} />
        <div style={{ fontSize: "12px", color: "#6B7280", letterSpacing: "2px" }}>
          LOADING
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}