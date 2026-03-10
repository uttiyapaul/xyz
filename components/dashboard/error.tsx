// app/dashboard/error.tsx
"use client";
import { useEffect } from "react";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      padding: "80px 24px", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: "32px" }}>⚠</div>
      <h2 style={{ color: "#EF4444", fontSize: "18px", fontWeight: "600",
        margin: 0 }}>Error loading this page</h2>
      <p style={{ color: "#6B7280", fontSize: "13px", textAlign: "center", maxWidth: 380 }}>
        {process.env.NODE_ENV === "development" ? error.message : "Something went wrong. Try again or contact support."}
      </p>
      <button onClick={reset} style={{
        padding: "8px 20px", background: "rgba(245,158,11,0.1)",
        border: "1px solid rgba(245,158,11,0.3)", borderRadius: "6px",
        color: "#F59E0B", cursor: "pointer", fontSize: "13px",
      }}>
        Retry
      </button>
    </div>
  );
}