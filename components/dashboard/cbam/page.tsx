// app/dashboard/cbam/page.tsx
// The public CBAM calculator already lives at /calculator (app/page.tsx).
// This page provides a dashboard-scoped entry point with context.
import Link from "next/link";

export default function CBAMPage() {
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#FAFAF8",
          margin: "0 0 4px" }}>CBAM Calculator</h1>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
          EU Carbon Border Adjustment Mechanism — embedded carbon liability calculator
        </p>
      </div>

      <div style={{ background: "#0D0D14", border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: "8px", padding: "32px", textAlign: "center", maxWidth: 480 }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>⊕</div>
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#FAFAF8",
          margin: "0 0 10px" }}>
          Open Full CBAM Calculator
        </h2>
        <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "24px",
          lineHeight: "1.6" }}>
          Calculate CBAM liability across Iron & Steel, Aluminium, Fertilisers,
          Cement, and Electricity sectors. Regulation 2023/956 · Phase-in: 2026–2034.
        </p>
        <Link href="/calculator" target="_blank" rel="noopener noreferrer" style={{
          display: "inline-block", padding: "10px 28px",
          background: "#F59E0B", borderRadius: "6px",
          color: "#000", fontSize: "14px", fontWeight: "600", textDecoration: "none",
        }}>
          Open Calculator ↗
        </Link>
        <p style={{ fontSize: "11px", color: "#4B5563", marginTop: "12px" }}>
          Opens in new tab · No registration required
        </p>
      </div>
    </div>
  );
}