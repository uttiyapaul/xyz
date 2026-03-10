// app/not-found.tsx
// Rule FE-001: MANDATORY custom 404.
// Must NOT reveal: route paths, stack traces, framework version, or whether route exists.
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#050508",
      fontFamily: "system-ui, -apple-system, sans-serif", padding: "40px",
    }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        {/* Logo mark */}
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px", fontSize: "28px",
        }}>
          ◈
        </div>

        <div style={{ fontSize: "72px", fontWeight: "700", color: "#1A1A24",
          lineHeight: 1, marginBottom: "16px", letterSpacing: "-4px" }}>
          404
        </div>

        <h1 style={{ fontSize: "20px", color: "#FAFAF8", fontWeight: "600",
          marginBottom: "12px", margin: "0 0 12px" }}>
          Page not found
        </h1>

        <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: "1.6",
          marginBottom: "32px" }}>
          The page you requested does not exist or you don&apos;t have permission to access it.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{
            padding: "10px 20px", background: "#F59E0B",
            borderRadius: "6px", color: "#000", fontSize: "14px",
            fontWeight: "600", textDecoration: "none",
          }}>
            Go to Dashboard
          </Link>
          <Link href="/auth/login" style={{
            padding: "10px 20px", background: "transparent",
            border: "1px solid #1A1A24", borderRadius: "6px",
            color: "#9CA3AF", fontSize: "14px", textDecoration: "none",
          }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}