"use client";

import { useState, type ChangeEvent } from "react";

/**
 * This screen is currently a configuration shell, not a live persistence layer.
 * We keep it in a feature module so the eventual backend wiring can happen here
 * without bloating the route file or confusing the route tree.
 */

interface SystemSettingsState {
  maintenanceMode: boolean;
  requireMFA: boolean;
  sessionTimeout: string;
  passwordExpiry: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  samlEnabled: boolean;
  aiAnomalyDetection: boolean;
  strictComplianceMode: boolean;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        marginBottom: "20px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "12px",
      }}
    >
      <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FAFAF8", margin: "0 0 4px" }}>
        {title}
      </h2>
      <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function ToggleRow({
  name,
  label,
  description,
  checked,
  onChange,
}: {
  name: keyof SystemSettingsState;
  label: string;
  description: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
    >
      <div>
        <div style={{ fontSize: "14px", fontWeight: "500", color: "#FAFAF8" }}>{label}</div>
        <div style={{ fontSize: "12px", color: "#6B7280" }}>{description}</div>
      </div>
      <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", position: "relative" }}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          style={{ position: "absolute", opacity: 0 }}
        />
        <div
          style={{
            width: "44px",
            height: "24px",
            background: checked ? "#00D4FF" : "rgba(255,255,255,0.1)",
            borderRadius: "999px",
            position: "relative",
            transition: "all 0.3s",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "2px",
              left: checked ? "22px" : "2px",
              width: "20px",
              height: "20px",
              background: "#FFF",
              borderRadius: "50%",
              transition: "all 0.3s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
          />
        </div>
      </label>
    </div>
  );
}

function InputRow({
  name,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  name: keyof SystemSettingsState;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontSize: "12px", color: "#9CA3AF", marginBottom: "8px" }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
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
          transition: "border-color 200ms",
        }}
      />
    </div>
  );
}

export function SystemSettingsView() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<SystemSettingsState>({
    maintenanceMode: false,
    requireMFA: true,
    sessionTimeout: "15",
    passwordExpiry: "90",
    smtpHost: "smtp.sendgrid.net",
    smtpPort: "587",
    smtpUser: "apikey",
    samlEnabled: false,
    aiAnomalyDetection: true,
    strictComplianceMode: true,
  });

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const value =
      event.target.type === "checkbox"
        ? (event.target as HTMLInputElement).checked
        : event.target.value;

    setSettings((prev) => ({ ...prev, [event.target.name]: value }));
  }

  function handleSave() {
    setLoading(true);

    // This remains a mocked save until backend-backed system settings exist.
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  }

  return (
    <div style={{ padding: "32px", color: "#FAFAF8", maxWidth: "800px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>System Settings</h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>
            Exhaustive configuration shell for platform behavior.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            padding: "0 24px",
            height: "44px",
            background: saved
              ? "#30D158"
              : "linear-gradient(135deg, #00D4FF 0%, #0066FF 100%)",
            border: "none",
            borderRadius: "8px",
            color: "#FFF",
            fontSize: "14px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 4px 16px rgba(0,212,255,0.25)",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Saving..." : saved ? "Selected Settings Saved" : "Save Changes"}
        </button>
      </div>

      <div
        style={{
          background: "#0A1628",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <SectionHeader
          title="Global Platform State"
          subtitle="Control overall accessibility and maintenance flags."
        />
        <ToggleRow
          name="maintenanceMode"
          label="Maintenance Mode"
          description="Block all non-admin logins and show a maintenance page."
          checked={settings.maintenanceMode}
          onChange={handleChange}
        />
      </div>

      <div
        style={{
          background: "#0A1628",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <SectionHeader
          title="Security & Authentication"
          subtitle="Platform-wide security defaults and enforcements."
        />
        <ToggleRow
          name="requireMFA"
          label="Enforce MFA Globally"
          description="Require Multi-Factor Authentication for all superadmins and client admins."
          checked={settings.requireMFA}
          onChange={handleChange}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <InputRow
            name="sessionTimeout"
            label="Session Timeout (Minutes)"
            type="number"
            value={settings.sessionTimeout}
            onChange={handleChange}
          />
          <InputRow
            name="passwordExpiry"
            label="Password Expiry (Days)"
            type="number"
            value={settings.passwordExpiry}
            onChange={handleChange}
          />
        </div>

        <ToggleRow
          name="samlEnabled"
          label="Enable SAML / SSO"
          description="Allow enterprise clients to connect their Identity Providers."
          checked={settings.samlEnabled}
          onChange={handleChange}
        />
      </div>

      <div
        style={{
          background: "#0A1628",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <SectionHeader
          title="AI & Compliance Constraints"
          subtitle="Configure automated anomaly detection and reporting strictness."
        />
        <ToggleRow
          name="aiAnomalyDetection"
          label="AI Anomaly Detection Models"
          description="Automatically flag irregular emission readings using historical context."
          checked={settings.aiAnomalyDetection}
          onChange={handleChange}
        />
        <ToggleRow
          name="strictComplianceMode"
          label="Strict Compliance Mode"
          description="Enforce 100% data completeness before generating regulatory reports (CBAM/ISO 14064)."
          checked={settings.strictComplianceMode}
          onChange={handleChange}
        />
      </div>

      <div
        style={{
          background: "#0A1628",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <SectionHeader
          title="External Services (SMTP Server)"
          subtitle="Configuration for transactional emails, invitations, and alerts."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <InputRow name="smtpHost" label="SMTP Host" value={settings.smtpHost} onChange={handleChange} />
          <InputRow name="smtpPort" label="SMTP Port" value={settings.smtpPort} onChange={handleChange} />
        </div>
        <InputRow name="smtpUser" label="SMTP Username" value={settings.smtpUser} onChange={handleChange} />
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#9CA3AF", marginBottom: "8px" }}>
            SMTP Password
          </label>
          <input
            type="password"
            value="********"
            readOnly
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
        </div>
      </div>
    </div>
  );
}
