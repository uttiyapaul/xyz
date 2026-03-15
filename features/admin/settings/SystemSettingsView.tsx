"use client";

import { useState, type ChangeEvent } from "react";

import styles from "@/features/admin/settings/SystemSettingsView.module.css";

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
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionSubtitle}>{subtitle}</p>
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
    <div className={styles.toggleRow}>
      <div className={styles.toggleCopy}>
        <div className={styles.toggleLabel}>{label}</div>
        <div className={styles.toggleDescription}>{description}</div>
      </div>
      <label className={styles.toggleControl}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className={styles.toggleInput}
        />
        <span className={styles.toggleTrack} aria-hidden="true" />
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
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.input}
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
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>System Settings</h1>
          <p className={styles.subtitle}>
            Exhaustive configuration shell for platform behavior.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          data-state={saved ? "saved" : "idle"}
          className={styles.saveButton}
        >
          {loading ? "Saving..." : saved ? "Selected Settings Saved" : "Save Changes"}
        </button>
      </div>

      <div className={styles.alert}>
        This remains a frontend configuration shell. Persisted settings, secret rotation, and platform-wide enforcement
        will be connected in later backend phases.
      </div>

      <div className={styles.stack}>
        <div className={styles.card}>
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

        <div className={styles.card}>
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

          <div className={styles.fieldGrid}>
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

        <div className={styles.card}>
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

        <div className={styles.card}>
          <SectionHeader
            title="External Services (SMTP Server)"
            subtitle="Configuration for transactional emails, invitations, and alerts."
          />
          <div className={styles.fieldGrid}>
            <InputRow name="smtpHost" label="SMTP Host" value={settings.smtpHost} onChange={handleChange} />
            <InputRow name="smtpPort" label="SMTP Port" value={settings.smtpPort} onChange={handleChange} />
          </div>
          <InputRow name="smtpUser" label="SMTP Username" value={settings.smtpUser} onChange={handleChange} />
          <div className={styles.secretCard}>
            <h3 className={styles.secretTitle}>SMTP password</h3>
            <p className={styles.secretValue}>********</p>
            <p className={styles.helper}>
              Secret material remains stored server-side and is intentionally not revealed in this frontend shell.
              Later phases will use an explicit secret-rotation flow instead of exposing raw credentials in settings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
