// Legacy route prototype kept during migration out of components/page.tsx naming.
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Validation {
  id: string;
  trust_score: number;
  anomaly_score: number;
  risk_level: string;
  human_review_required: boolean;
  created_at: string;
}

export default function AIValidationPage() {
  const { orgIds } = useAuth();
  const [rows, setRows]       = useState<Validation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgIds.length === 0) return;
    supabase.from("ai_validation")
      .select("id,trust_score,anomaly_score,risk_level,human_review_required,created_at")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => { if (data) setRows(data); setLoading(false); });
  }, [orgIds]);

  const RISK_COLOR: Record<string, string> = {
    low: "#22C55E", medium: "#F59E0B", high: "#EF4444", critical: "#DC2626",
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#FAFAF8",
          margin: "0 0 4px" }}>AI Validation</h1>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
          Automated trust scoring and anomaly detection for GHG readings
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16, marginBottom: 24 }}>
        {[
          { label: "Validations Run", value: rows.length, color: "#3B82F6" },
          { label: "Needs Review", value: rows.filter(r => r.human_review_required).length, color: "#F59E0B" },
          { label: "High Risk", value: rows.filter(r => r.risk_level === "high" || r.risk_level === "critical").length, color: "#EF4444" },
        ].map(card => (
          <div key={card.label} style={{ background: "#0D0D14",
            border: "1px solid #1A1A24", borderRadius: "8px", padding: "20px" }}>
            <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "8px" }}>
              {card.label.toUpperCase()}
            </div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#0D0D14", border: "1px solid #1A1A24",
        borderRadius: "8px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6B7280",
            fontSize: "13px" }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>✦</div>
            <div style={{ color: "#6B7280", fontSize: "13px" }}>No validations yet</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#07070E" }}>
                {["DATE", "TRUST SCORE", "ANOMALY SCORE", "RISK LEVEL", "REVIEW NEEDED"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left",
                    fontSize: "10px", color: "#6B7280", fontWeight: "500" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} style={{ borderTop: "1px solid #111120" }}>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#9CA3AF" }}>
                    {new Date(r.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: "#1A1A24",
                        borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${r.trust_score}%`, height: "100%",
                          background: r.trust_score >= 70 ? "#22C55E" : r.trust_score >= 50 ? "#F59E0B" : "#EF4444",
                          borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: "12px", color: "#FAFAF8" }}>
                        {r.trust_score}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#FAFAF8" }}>
                    {r.anomaly_score}%
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: "10px", padding: "3px 8px", borderRadius: "4px",
                      color: RISK_COLOR[r.risk_level] ?? "#6B7280",
                      background: `${RISK_COLOR[r.risk_level] ?? "#6B7280"}18`,
                      fontWeight: "600",
                    }}>
                      {r.risk_level?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px",
                    color: r.human_review_required ? "#F59E0B" : "#22C55E" }}>
                    {r.human_review_required ? "⚠ Yes" : "✓ No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
