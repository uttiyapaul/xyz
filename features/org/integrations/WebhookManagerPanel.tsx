"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { SecretValue } from "@/components/security/SecretValue";
import styles from "@/features/org/integrations/IntegrationConsole.module.css";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/lib/hooks/usePermission";
import { supabase } from "@/lib/supabase/client";

interface WebhookSubscription {
  id: string;
  webhook_name: string;
  endpoint_url: string;
  event_types: string[];
  is_active: boolean;
  failure_count: number | null;
}

interface DeliveryLogEntry {
  id: string;
  event_type: string;
  succeeded: boolean;
  status_code: number | null;
  delivered_at: string;
  attempt_number: number | null;
}

interface PanelMessage {
  tone: "success" | "warning" | "danger" | "info";
  text: string;
}

const WEBHOOK_EVENTS = [
  { value: "reading.created", label: "New emission reading created" },
  { value: "reading.flagged", label: "Emission reading flagged as anomaly" },
  { value: "submission.locked", label: "Submission locked for verification" },
  { value: "anomaly.detected", label: "AI anomaly detected" },
  { value: "verification.completed", label: "Verification completed" },
  { value: "target.off_track", label: "Emission target off track" },
  { value: "ef.updated", label: "Emission factor updated" },
  { value: "document.extracted", label: "AI document extraction complete" },
] as const;

/**
 * Webhook configuration keeps one-time signing secrets explicit and auditable.
 * The UI makes HTTPS, scoped events, and signed delivery expectations visible
 * so integrations match the platform security contract.
 */
export function WebhookManagerPanel({ orgId }: { orgId: string }) {
  const { user } = useAuth();
  const { hasPermission, isLoading } = usePermission("webhooks:manage", orgId);

  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [deliveryLog, setDeliveryLog] = useState<DeliveryLogEntry[]>([]);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<PanelMessage | null>(null);
  const [form, setForm] = useState({
    webhookName: "",
    endpointUrl: "",
    eventTypes: [] as string[],
  });

  const loadWebhookData = useCallback(async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true);
    }

    const [webhookResponse, deliveryResponse] = await Promise.all([
      supabase
        .from("webhook_subscriptions")
        .select("id, webhook_name, endpoint_url, event_types, is_active, failure_count")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false }),
      supabase
        .from("webhook_delivery_log")
        .select("id, event_type, succeeded, status_code, delivered_at, attempt_number")
        .eq("organization_id", orgId)
        .order("delivered_at", { ascending: false })
        .limit(20),
    ]);

    if (webhookResponse.error || deliveryResponse.error) {
      setMessage({
        tone: "danger",
        text: "Webhook data could not be loaded. Refresh the page or try again shortly.",
      });
      setWebhooks([]);
      setDeliveryLog([]);
      setLoading(false);
      return;
    }

    setWebhooks((webhookResponse.data ?? []) as WebhookSubscription[]);
    setDeliveryLog((deliveryResponse.data ?? []) as DeliveryLogEntry[]);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    if (hasPermission) {
      queueMicrotask(() => {
        void loadWebhookData(false);
      });
    }
  }, [hasPermission, loadWebhookData]);

  const enabledWebhooks = useMemo(() => webhooks.filter((webhook) => webhook.is_active).length, [webhooks]);

  function toggleEvent(eventType: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      eventTypes: checked
        ? [...current.eventTypes, eventType]
        : current.eventTypes.filter((value) => value !== eventType),
    }));
  }

  async function createWebhook() {
    if (!user || !form.webhookName.trim() || !form.endpointUrl.trim()) {
      setMessage({
        tone: "warning",
        text: "Provide a webhook name and HTTPS endpoint before creating a subscription.",
      });
      return;
    }

    if (!form.endpointUrl.startsWith("https://")) {
      setMessage({
        tone: "warning",
        text: "Webhook endpoints must use HTTPS so signatures and payloads stay protected in transit.",
      });
      return;
    }

    if (form.eventTypes.length === 0) {
      setMessage({
        tone: "warning",
        text: "Select at least one event type to keep the integration scope explicit.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    const secretBytes = crypto.getRandomValues(new Uint8Array(32));
    const secret = `whsec_${Array.from(secretBytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")}`;

    const { error } = await supabase.from("webhook_subscriptions").insert({
      organization_id: orgId,
      webhook_name: form.webhookName.trim(),
      endpoint_url: form.endpointUrl.trim(),
      secret_hmac: secret,
      event_types: form.eventTypes,
      created_by: user.id,
    });

    if (error) {
      setSaving(false);
      setMessage({
        tone: "danger",
        text: "The webhook could not be created. Verify the endpoint and try again.",
      });
      return;
    }

    setSaving(false);
    setMessage({
      tone: "success",
      text: "Webhook created. Reveal and store the signing secret before closing the banner.",
    });
    setNewSecret(secret);
    setForm({ webhookName: "", endpointUrl: "", eventTypes: [] });
    await loadWebhookData();
  }

  async function toggleWebhook(id: string, currentlyActive: boolean) {
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("webhook_subscriptions")
      .update({ is_active: !currentlyActive })
      .eq("id", id);

    if (error) {
      setSaving(false);
      setMessage({
        tone: "danger",
        text: "Webhook status could not be updated. Try again in a moment.",
      });
      return;
    }

    setSaving(false);
    setMessage({
      tone: "success",
      text: currentlyActive ? "Webhook disabled." : "Webhook enabled.",
    });
    await loadWebhookData();
  }

  if (isLoading || (hasPermission && loading)) {
    return <div className={styles.alert} data-tone="info">Loading webhook delivery posture...</div>;
  }

  if (!hasPermission) {
    return (
      <div className={styles.alert} data-tone="warning">
        Webhook configuration is restricted to roles with `webhooks:manage` permission in this organization.
      </div>
    );
  }

  return (
    <section className={styles.manager}>
      <div className={styles.managerHeader}>
        <div>
          <h2 className={styles.managerHeading}>Webhooks</h2>
          <p className={styles.managerText}>
            Deliver signed events to external systems. Secrets are displayed once and endpoints must use HTTPS.
          </p>
        </div>
        <span className={styles.badge}>{enabledWebhooks} enabled hooks</span>
      </div>

      {message ? (
        <div className={styles.alert} data-tone={message.tone}>
          {message.text}
        </div>
      ) : null}

      {newSecret ? (
        <SecretValue
          title="One-time signing secret"
          description="Use this HMAC secret on the receiving server to verify the `X-GHG-Signature` header."
          secretValue={newSecret}
          helperText="Payload signatures should be validated server-side before processing any webhook event."
          acknowledgeLabel="I stored this secret"
          onAcknowledge={() => setNewSecret(null)}
        />
      ) : null}

      <div className={styles.card}>
        <div>
          <h3 className={styles.cardTitle}>Create webhook</h3>
          <p className={styles.cardDescription}>
            Keep subscriptions narrow. Event selection and endpoint hygiene are part of the platform&apos;s integration
            security posture.
          </p>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="webhook-name">
              Webhook name
            </label>
            <input
              id="webhook-name"
              type="text"
              value={form.webhookName}
              onChange={(event) => setForm((current) => ({ ...current, webhookName: event.target.value }))}
              className={styles.input}
              placeholder="Slack anomaly alerts"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="webhook-endpoint">
              Endpoint URL
            </label>
            <input
              id="webhook-endpoint"
              type="url"
              value={form.endpointUrl}
              onChange={(event) => setForm((current) => ({ ...current, endpointUrl: event.target.value }))}
              className={styles.input}
              placeholder="https://example.com/hooks/anomalies"
            />
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Event subscriptions</span>
            <div className={styles.checkboxGrid}>
              {WEBHOOK_EVENTS.map((eventType) => (
                <label key={eventType.value} className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={form.eventTypes.includes(eventType.value)}
                    onChange={(event) => toggleEvent(eventType.value, event.target.checked)}
                  />
                  <div>
                    <div className={styles.codeLabel}>{eventType.value}</div>
                    <div className={styles.smallText}>{eventType.label}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => void createWebhook()}
            disabled={saving || !form.webhookName.trim() || !form.endpointUrl.trim() || form.eventTypes.length === 0}
            className={`${styles.button} ${styles.primaryButton}`.trim()}
          >
            {saving ? "Creating..." : "Create webhook"}
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div>
          <h3 className={styles.cardTitle}>Configured endpoints</h3>
          <p className={styles.cardDescription}>
            Delivery health stays visible here so failed endpoints can be disabled quickly without losing audit trace.
          </p>
        </div>

        {webhooks.length === 0 ? (
          <div className={styles.emptyState}>No webhooks have been configured for this organization yet.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeaderCell}>Name</th>
                  <th className={styles.tableHeaderCell}>Endpoint</th>
                  <th className={styles.tableHeaderCell}>Events</th>
                  <th className={styles.tableHeaderCell}>Status</th>
                  <th className={styles.tableHeaderCell}>Action</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map((webhook) => (
                  <tr key={webhook.id}>
                    <td className={styles.tableCell}>{webhook.webhook_name}</td>
                    <td className={`${styles.tableCell} ${styles.monoText}`}>{webhook.endpoint_url}</td>
                    <td className={styles.tableCell}>
                      <div className={styles.tagList}>
                        {webhook.event_types.map((eventType) => (
                          <span key={eventType} className={styles.tag}>
                            {eventType}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.tagList}>
                        <span className={`${styles.badge} ${webhook.is_active ? styles.statusActive : styles.statusInactive}`.trim()}>
                          {webhook.is_active ? "Enabled" : "Disabled"}
                        </span>
                        {(webhook.failure_count ?? 0) > 0 ? (
                          <span className={styles.tag}>{webhook.failure_count} failures</span>
                        ) : null}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <button
                        type="button"
                        onClick={() => void toggleWebhook(webhook.id, webhook.is_active)}
                        disabled={saving}
                        className={`${styles.button} ${styles.secondaryButton}`.trim()}
                      >
                        {webhook.is_active ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deliveryLog.length > 0 ? (
        <div className={styles.card}>
          <div>
            <h3 className={styles.cardTitle}>Recent deliveries</h3>
            <p className={styles.cardDescription}>
              Recent attempts help the integration team spot failing subscriptions before alerts drift unnoticed.
            </p>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeaderCell}>Event</th>
                  <th className={styles.tableHeaderCell}>Attempt</th>
                  <th className={styles.tableHeaderCell}>Status</th>
                  <th className={styles.tableHeaderCell}>Delivered</th>
                </tr>
              </thead>
              <tbody>
                {deliveryLog.map((log) => (
                  <tr key={log.id}>
                    <td className={`${styles.tableCell} ${styles.monoText}`}>{log.event_type}</td>
                    <td className={styles.tableCell}>{log.attempt_number ?? 1}</td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${log.succeeded ? styles.statusActive : styles.statusInactive}`.trim()}>
                        {log.status_code ?? "n/a"} {log.succeeded ? "Success" : "Failed"}
                      </span>
                    </td>
                    <td className={styles.tableCell}>{new Date(log.delivered_at).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
