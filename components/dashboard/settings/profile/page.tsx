// app/dashboard/settings/profile/page.tsx
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { getCsrfHeaders } from "@/core/security/csrf";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", background: "#07070E",
  border: "1px solid #1A1A24", borderRadius: "6px",
  color: "#FAFAF8", fontSize: "14px", outline: "none",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving]     = useState(false);
  const [message, setMessage]   = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName((user.user_metadata?.full_name as string) ?? "");
    }
  }, [user]);

  async function handleSave() {
    if (!fullName.trim()) { setMessage({ type: "error", text: "Full name is required" }); return; }
    setSaving(true); setMessage(null);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim() },
    });

    setSaving(false);
    setMessage(error
      ? { type: "error", text: error.message }
      : { type: "success", text: "Profile updated successfully" }
    );
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ background: "#0D0D14", border: "1px solid #1A1A24",
        borderRadius: "8px", padding: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8",
          margin: "0 0 20px" }}>Profile Information</h2>

        {message && (
          <div style={{
            padding: "10px 14px", marginBottom: "16px",
            background: message.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
            borderRadius: "6px", fontSize: "13px",
            color: message.type === "success" ? "#22C55E" : "#EF4444",
          }}>
            {message.text}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "11px", color: "#6B7280", display: "block",
            marginBottom: "6px" }}>FULL NAME</label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()}
            disabled={saving} style={inputStyle} />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "11px", color: "#6B7280", display: "block",
            marginBottom: "6px" }}>EMAIL ADDRESS</label>
          <input type="email" value={user?.email ?? ""} disabled
            style={{ ...inputStyle, color: "#6B7280", cursor: "not-allowed" }} />
          <p style={{ fontSize: "11px", color: "#4B5563", marginTop: "4px" }}>
            Contact support to change your email address.
          </p>
        </div>

        <button onClick={handleSave} disabled={saving} style={{
          padding: "10px 24px", background: saving ? "rgba(245,158,11,0.5)" : "#F59E0B",
          border: "none", borderRadius: "6px", color: "#000",
          fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer",
        }}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}