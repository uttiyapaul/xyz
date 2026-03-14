"use client";

import { useState, type ChangeEvent } from "react";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

/**
 * Account settings are still user-scoped and Supabase-auth backed.
 * This view owns the profile and password update UX so the route file can
 * remain a thin entry while future account preferences grow here.
 */

interface FlashMessage {
  type: "success" | "error";
  text: string;
}

export function AccountSettingsView() {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<FlashMessage | null>(null);

  function handleProfileChange(event: ChangeEvent<HTMLInputElement>) {
    setProfile((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPasswordForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function saveProfile() {
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: profile.fullName },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully." });
    }

    setLoading(false);
  }

  async function updatePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Password changed successfully." });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: "32px", color: "#FAFAF8", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Account Settings</h1>
        <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>
          Manage your personal profile and security preferences.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: "16px",
            marginBottom: "24px",
            borderRadius: "8px",
            fontSize: "14px",
            background:
              message.type === "success" ? "rgba(48,209,88,0.1)" : "rgba(255,59,48,0.1)",
            color: message.type === "success" ? "#30D158" : "#FF3B30",
            border: `1px solid ${
              message.type === "success"
                ? "rgba(48,209,88,0.2)"
                : "rgba(255,59,48,0.2)"
            }`,
          }}
        >
          {message.text}
        </div>
      )}

      <div
        style={{
          background: "#0A1628",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>
          Profile Information
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#9CA3AF", marginBottom: "8px" }}>
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={profile.fullName}
            onChange={handleProfileChange}
            style={{
              width: "100%",
              height: "44px",
              padding: "0 16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              color: "#FAFAF8",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#9CA3AF", marginBottom: "8px" }}>
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={profile.email}
            disabled
            style={{
              width: "100%",
              height: "44px",
              padding: "0 16px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              color: "#6B7280",
              fontSize: "14px",
              outline: "none",
              cursor: "not-allowed",
            }}
          />
          <p style={{ fontSize: "11px", color: "#6B7280", marginTop: "6px" }}>
            Email changes require verification and must be done through support.
          </p>
        </div>

        <button
          onClick={saveProfile}
          disabled={loading}
          style={{
            height: "44px",
            padding: "0 24px",
            background: "linear-gradient(135deg, #00D4FF 0%, #0066FF 100%)",
            border: "none",
            borderRadius: "8px",
            color: "#FFF",
            fontSize: "14px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>

      <div
        style={{
          background: "#0A1628",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>
          Change Password
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#9CA3AF", marginBottom: "8px" }}>
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            placeholder="At least 6 characters"
            style={{
              width: "100%",
              height: "44px",
              padding: "0 16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              color: "#FAFAF8",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#9CA3AF", marginBottom: "8px" }}>
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            style={{
              width: "100%",
              height: "44px",
              padding: "0 16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              color: "#FAFAF8",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        <button
          onClick={updatePassword}
          disabled={loading}
          style={{
            height: "44px",
            padding: "0 24px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "8px",
            color: "#FAFAF8",
            fontSize: "14px",
            fontWeight: "500",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}
