// Legacy route prototype kept during migration out of components/page.tsx naming.
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", background: "#07070E",
  border: "1px solid #1A1A24", borderRadius: "6px",
  color: "#FAFAF8", fontSize: "14px", outline: "none",
};

export default function SecurityPage() {
  const [current, setCurrent]   = useState("");
  const [newPwd, setNewPwd]     = useState("");
  const [confirm, setConfirm]   = useState("");
  const [saving, setSaving]     = useState(false);
  const [message, setMessage]   = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleChangePassword() {
    setMessage(null);
    if (!current) { setMessage({ type: "error", text: "Current password is required" }); return; }
    if (newPwd.length < 8) { setMessage({ type: "error", text: "New password must be at least 8 characters" }); return; }
    if (!/[A-Z]/.test(newPwd)) { setMessage({ type: "error", text: "Must contain at least one uppercase letter" }); return; }
    if (!/[0-9]/.test(newPwd)) { setMessage({ type: "error", text: "Must contain at least one number" }); return; }
    if (newPwd !== confirm) { setMessage({ type: "error", text: "Passwords do not match" }); return; }
    if (newPwd === current) { setMessage({ type: "error", text: "New password must be different from current" }); return; }

    setSaving(true);

    // Re-authenticate to verify current password first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setSaving(false); setMessage({ type: "error", text: "Session error. Please sign in again." }); return; }

    const { error: reAuthError } = await supabase.auth.signInWithPassword({
      email: user.email, password: current,
    });

    if (reAuthError) {
      setSaving(false);
      setMessage({ type: "error", text: "Current password is incorrect" });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setSaving(false);

    if (error) { setMessage({ type: "error", text: error.message }); return; }
    setMessage({ type: "success", text: "Password updated successfully" });
    setCurrent(""); setNewPwd(""); setConfirm("");
  }

  return (
    <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Change Password */}
      <div style={{ background: "#0D0D14", border: "1px solid #1A1A24",
        borderRadius: "8px", padding: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8",
          margin: "0 0 6px" }}>Change Password</h2>
        <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 20px" }}>
          Minimum 8 characters with at least one uppercase letter and one number.
        </p>

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

        {[
          { label: "CURRENT PASSWORD", value: current, set: setCurrent },
          { label: "NEW PASSWORD",     value: newPwd,  set: setNewPwd },
          { label: "CONFIRM NEW",      value: confirm,  set: setConfirm },
        ].map(({ label, value, set }) => (
          <div key={label} style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "11px", color: "#6B7280", display: "block",
              marginBottom: "6px" }}>{label}</label>
            <input type="password" value={value} onChange={e => set(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleChangePassword()}
              disabled={saving} style={inputStyle} />
          </div>
        ))}

        <button onClick={handleChangePassword} disabled={saving} style={{
          padding: "10px 24px", background: saving ? "rgba(245,158,11,0.5)" : "#F59E0B",
          border: "none", borderRadius: "6px", color: "#000",
          fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer",
        }}>
          {saving ? "Updating…" : "Update password"}
        </button>
      </div>

      {/* MFA notice */}
      <div style={{ background: "#0D0D14", border: "1px solid #1A1A24",
        borderRadius: "8px", padding: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8",
          margin: "0 0 6px" }}>Multi-Factor Authentication</h2>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 16px", lineHeight: "1.6" }}>
          MFA adds an extra layer of security. When enabled, you&apos;ll need your phone to sign in.
          Enable TOTP-based MFA in the Supabase dashboard for your account.
        </p>
        <div style={{ padding: "10px 14px",
          background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
          borderRadius: "6px", fontSize: "12px", color: "#D97706" }}>
          ⚠ MFA enforcement for admin and consultant roles will be required in a future release.
          Enroll now to be prepared.
        </div>
      </div>
    </div>
  );
}
