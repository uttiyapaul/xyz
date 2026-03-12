import React from "react";

export function DashboardSkeleton() {
  return (
    <div style={{ padding: "32px", color: "#E8E6DE", fontFamily: "'DM Sans', sans-serif", width: "100%" }}>
      {/* Header Skeleton */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
        <div>
          <div style={{ height: "32px", width: "250px", background: "#1A1A24", borderRadius: "4px", marginBottom: "12px" }}></div>
          <div style={{ height: "16px", width: "400px", background: "#1A1A24", borderRadius: "4px" }}></div>
        </div>
        <div style={{ height: "36px", width: "120px", background: "#1A1A24", borderRadius: "6px" }}></div>
      </div>

      {/* KPI Cards Skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ background: "#0D0D14", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px" }}>
            <div style={{ height: "12px", width: "100px", background: "#1A1A24", borderRadius: "4px", marginBottom: "16px" }}></div>
            <div style={{ height: "40px", width: "180px", background: "#1A1A24", borderRadius: "4px", marginBottom: "12px" }}></div>
            <div style={{ height: "12px", width: "140px", background: "#1A1A24", borderRadius: "4px" }}></div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
        <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px", minHeight: "350px", display: "flex", flexDirection: "column" }}>
          <div style={{ height: "20px", width: "200px", background: "#1A1A24", borderRadius: "4px", marginBottom: "24px" }}></div>
          <div style={{ flex: 1, background: "#1A1A24", borderRadius: "4px", opacity: 0.5 }}></div>
        </div>
        <div style={{ background: "#0A0A0F", border: "1px solid #1A1A24", borderRadius: "8px", padding: "24px", minHeight: "350px", display: "flex", flexDirection: "column" }}>
          <div style={{ height: "20px", width: "150px", background: "#1A1A24", borderRadius: "4px", marginBottom: "24px" }}></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: "40px", width: "100%", background: "#1A1A24", borderRadius: "4px" }}></div>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
