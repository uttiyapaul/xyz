"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { SecretValue } from "@/components/security/SecretValue";
import styles from "@/features/org/integrations/IntegrationConsole.module.css";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/lib/hooks/usePermission";
import { supabase } from "@/lib/supabase/client";

interface ApiKeyRecord {
  id: string;
  key_name: string;
  key_prefix: string;
  scopes: string[];
  expires_at: string | null;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface PanelMessage {
  tone: "success" | "warning" | "danger" | "info";
  text: string;
}

const AVAILABLE_SCOPES = [
  { value: "data:read", label: "Read emission data" },
  { value: "data:write", label: "Write emission data" },
  { value: "erp:sync", label: "ERP synchronisation" },
  { value: "webhooks:receive", label: "Receive webhook payloads" },
  { value: "reports:export", label: "Export reporting outputs" },
] as const;

/**
 * API key management is scoped to the active organization and keeps secrets in
 * a one-time reveal flow so the UI does not normalize unsafe credential handling.
 */
export function ApiKeyManagerPanel({ orgId }: { orgId: string }) {
  const { user } = useAuth();
  const { hasPermission, isLoading } = usePermission("api_keys:manage", orgId);

  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [newKeyPlaintext, setNewKeyPlaintext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revokeCandidateId, setRevokeCandidateId] = useState<string | null>(null);
  const [message, setMessage] = useState<PanelMessage | null>(null);
  const [form, setForm] = useState({
    keyName: "",
    scopes: ["data:read"] as string[],
    expiresAt: "",
  });

  const loadKeys = useCallback(async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true);
    }

    const { data, error } = await supabase
      .from("api_keys")
      .select("id, key_name, key_prefix, scopes, expires_at, last_used_at, is_active, created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage({
        tone: "danger",
        text: "API keys could not be loaded right now. Refresh the page or try again shortly.",
      });
      setKeys([]);
      setLoading(false);
      return;
    }

    setKeys((data ?? []) as ApiKeyRecord[]);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    if (hasPermission) {
      queueMicrotask(() => {
        void loadKeys(false);
      });
    }
  }, [hasPermission, loadKeys]);

  const activeKeys = useMemo(() => keys.filter((key) => key.is_active).length, [keys]);

  function toggleScope(scopeValue: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      scopes: checked ? [...current.scopes, scopeValue] : current.scopes.filter((scope) => scope !== scopeValue),
    }));
  }

  async function createKey() {
    if (!user || !form.keyName.trim() || form.scopes.length === 0) {
      setMessage({
        tone: "warning",
        text: "Add a key name and at least one scope before generating a new credential.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const rawKey = `ghg_k_${Array.from(randomBytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")}`;
    const prefix = rawKey.slice(0, 14);

    const encoder = new TextEncoder();
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(rawKey));
    const keyHash = Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    const { error } = await supabase.from("api_keys").insert({
      organization_id: orgId,
      created_by: user.id,
      key_name: form.keyName.trim(),
      key_prefix: prefix,
      key_hash: keyHash,
      scopes: form.scopes,
      expires_at: form.expiresAt || null,
    });

    if (error) {
      setSaving(false);
      setMessage({
        tone: "danger",
        text: "The API key could not be created. Verify the details and try again.",
      });
      return;
    }

    setSaving(false);
    setMessage({
      tone: "success",
      text: "API key created. Reveal it, store it securely, and close the banner once saved.",
    });
    setNewKeyPlaintext(rawKey);
    setForm({ keyName: "", scopes: ["data:read"], expiresAt: "" });
    await loadKeys();
  }

  async function revokeKey(keyId: string) {
    if (!user) {
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("api_keys")
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: user.id,
        revocation_reason: "Revoked by integration administrator",
      })
      .eq("id", keyId);

    if (error) {
      setSaving(false);
      setMessage({
        tone: "danger",
        text: "The API key could not be revoked. Try again in a moment.",
      });
      return;
    }

    setSaving(false);
    setRevokeCandidateId(null);
    setMessage({
      tone: "success",
      text: "API key revoked. Connected systems using it should be updated immediately.",
    });
    await loadKeys();
  }

  if (isLoading || (hasPermission && loading)) {
    return <div className={styles.alert} data-tone="info">Loading API credential posture...</div>;
  }

  if (!hasPermission) {
    return (
      <div className={styles.alert} data-tone="warning">
        API key management is restricted to roles with `api_keys:manage` permission inside this organization.
      </div>
    );
  }

  return (
    <section className={styles.manager}>
      <div className={styles.managerHeader}>
        <div>
          <h2 className={styles.managerHeading}>API Keys</h2>
          <p className={styles.managerText}>
            External systems authenticate with hashed API keys. The full plaintext value is shown only once.
          </p>
        </div>
        <span className={styles.badge}>{activeKeys} active keys</span>
      </div>

      {message ? (
        <div className={styles.alert} data-tone={message.tone}>
          {message.text}
        </div>
      ) : null}

      {newKeyPlaintext ? (
        <SecretValue
          title="One-time API key reveal"
          description="Reveal the generated key only long enough to copy it into your secure vault or target integration."
          secretValue={newKeyPlaintext}
          helperText="Only the prefix and SHA-256 hash are stored after this step. The full key is never shown again."
          acknowledgeLabel="I stored this key"
          onAcknowledge={() => setNewKeyPlaintext(null)}
        />
      ) : null}

      <div className={styles.card}>
        <div>
          <h3 className={styles.cardTitle}>Create new API key</h3>
          <p className={styles.cardDescription}>
            Scope keys to the minimum access required. Avoid broad write scopes unless the integration truly needs them.
          </p>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="api-key-name">
              Key name
            </label>
            <input
              id="api-key-name"
              type="text"
              value={form.keyName}
              onChange={(event) => setForm((current) => ({ ...current, keyName: event.target.value }))}
              className={styles.input}
              placeholder="SAP production sync"
              maxLength={100}
            />
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Scopes</span>
            <div className={styles.checkboxGrid}>
              {AVAILABLE_SCOPES.map((scope) => (
                <label key={scope.value} className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={form.scopes.includes(scope.value)}
                    onChange={(event) => toggleScope(scope.value, event.target.checked)}
                  />
                  <div>
                    <div className={styles.codeLabel}>{scope.value}</div>
                    <div className={styles.smallText}>{scope.label}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="api-key-expiry">
              Expiry date
            </label>
            <input
              id="api-key-expiry"
              type="date"
              value={form.expiresAt}
              onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
              className={styles.dateInput}
            />
            <div className={styles.smallText}>Leave empty only if the integration has a separate rotation schedule.</div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => void createKey()}
            disabled={saving || !form.keyName.trim() || form.scopes.length === 0}
            className={`${styles.button} ${styles.primaryButton}`.trim()}
          >
            {saving ? "Generating..." : "Generate API key"}
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div>
          <h3 className={styles.cardTitle}>Existing keys</h3>
          <p className={styles.cardDescription}>
            Prefixes remain visible for inventory and incident response, while revoked keys stay in the table for audit
            continuity.
          </p>
        </div>

        {keys.length === 0 ? (
          <div className={styles.emptyState}>No API keys have been created for this organization yet.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeaderCell}>Name</th>
                  <th className={styles.tableHeaderCell}>Prefix</th>
                  <th className={styles.tableHeaderCell}>Scopes</th>
                  <th className={styles.tableHeaderCell}>Last used</th>
                  <th className={styles.tableHeaderCell}>Status</th>
                  <th className={styles.tableHeaderCell}>Action</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id}>
                    <td className={styles.tableCell}>{key.key_name}</td>
                    <td className={`${styles.tableCell} ${styles.monoText}`}>{key.key_prefix}...</td>
                    <td className={styles.tableCell}>
                      <div className={styles.tagList}>
                        {key.scopes.map((scope) => (
                          <span key={scope} className={styles.tag}>
                            {scope}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString("en-IN") : "Never used"}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${key.is_active ? styles.statusActive : styles.statusInactive}`.trim()}>
                        {key.is_active ? "Active" : "Revoked"}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      {key.is_active ? (
                        revokeCandidateId === key.id ? (
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={`${styles.button} ${styles.dangerButton}`.trim()}
                              onClick={() => void revokeKey(key.id)}
                              disabled={saving}
                            >
                              Confirm revoke
                            </button>
                            <button
                              type="button"
                              className={`${styles.button} ${styles.secondaryButton}`.trim()}
                              onClick={() => setRevokeCandidateId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={`${styles.button} ${styles.dangerButton}`.trim()}
                            onClick={() => setRevokeCandidateId(key.id)}
                          >
                            Revoke
                          </button>
                        )
                      ) : (
                        <span className={styles.smallText}>Credential closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
