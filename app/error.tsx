// app/error.tsx
"use client";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to monitoring in production (Sentry, Datadog, etc.)
    if (process.env.NODE_ENV === "development") {
      console.error("[GlobalError]", error);
    }
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#050508",
      fontFamily: "system-ui, -apple-system, sans-serif", padding: "40px",
    }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠</div>
        <h1 style={{ fontSize: "20px", color: "#EF4444", fontWeight: "700",
          marginBottom: "12px" }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "32px",
          lineHeight: "1.6" }}>
          An unexpected error occurred. Our team has been notified.
          {process.env.NODE_ENV === "development" && (
            <span style={{ display: "block", marginTop: "8px", color: "#F59E0B",
              fontSize: "12px", fontFamily: "monospace" }}>
              {error.message}
            </span>
          )}
        </p>
        <button onClick={reset} style={{
          padding: "10px 24px", background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.3)", borderRadius: "6px",
          color: "#F59E0B", fontSize: "14px", cursor: "pointer",
        }}>
          Try again
        </button>
      </div>
    </div>
  );
}