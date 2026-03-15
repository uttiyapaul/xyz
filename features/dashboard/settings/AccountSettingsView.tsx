"use client";

import { useState, type ChangeEvent } from "react";

import styles from "@/features/dashboard/settings/AccountSettingsView.module.css";
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
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState<FlashMessage | null>(null);

  function handleProfileChange(event: ChangeEvent<HTMLInputElement>) {
    setProfile((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPasswordForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function saveProfile() {
    setProfileSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: profile.fullName },
    });

    if (error) {
      setMessage({
        type: "error",
        text: "Profile details could not be updated. Refresh the page and try again, or contact support if the issue persists.",
      });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully." });
    }

    setProfileSaving(false);
  }

  async function updatePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (passwordForm.newPassword.length < 12) {
      setMessage({ type: "error", text: "Password must be at least 12 characters long." });
      return;
    }

    setPasswordSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });

    if (error) {
      setMessage({
        type: "error",
        text: "Password update failed. Re-enter your new password and try again. If it keeps failing, sign out and back in before retrying.",
      });
    } else {
      setMessage({ type: "success", text: "Password changed successfully." });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    }

    setPasswordSaving(false);
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Account Settings</h1>
        <p className={styles.subtitle}>
          Manage your personal profile and security preferences.
        </p>
      </header>

      {message && (
        <div className={styles.alert} data-tone={message.type}>
          {message.text}
        </div>
      )}

      <div className={styles.stack}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Profile Information</h2>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="account-full-name">
              Full Name
            </label>
            <input
              id="account-full-name"
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleProfileChange}
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="account-email">
              Email Address
            </label>
            <input
              id="account-email"
              type="email"
              name="email"
              value={profile.email}
              disabled
              className={styles.input}
            />
            <p className={styles.helper}>Email changes require verification and must be done through support.</p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => void saveProfile()}
              disabled={profileSaving}
              className={`${styles.button} ${styles.primaryButton}`.trim()}
            >
              {profileSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Change Password</h2>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="account-new-password">
              New Password
            </label>
            <input
              id="account-new-password"
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="At least 12 characters"
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="account-confirm-password">
              Confirm New Password
            </label>
            <input
              id="account-confirm-password"
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className={styles.input}
            />
            <p className={styles.helper}>
              Use a unique passphrase. If this account relies on SSO, support may ask you to update credentials through your identity provider instead.
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => void updatePassword()}
              disabled={passwordSaving}
              className={`${styles.button} ${styles.secondaryButton}`.trim()}
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
