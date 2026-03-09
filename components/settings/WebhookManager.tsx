"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { usePermission } from "../../lib/hooks/usePermission";
import { useAuth } from "../../context/AuthContext";

// All event types supported by your webhook_subscriptions.event_types TEXT[]
const WEBHOOK_EVENTS = [
  { value: "reading.created",         label: "New emission reading created" },
  { value: "reading.flagged",         label: "Emission reading flagged as anomaly" },
  { value: "submission.locked",       label: "Submission locked for verification" },
  { value: "anomaly.detected",        label: "AI anomaly detected" },
  { value: "verification.completed",  label: "Verification completed" },
  { value: "target.off_track",        label: "Emission target off track" },
  { value: "ef.updated",             label: "Emission factor updated" },
  { value: "document.extracted",     label: "AI document extraction complete" },
];

interface Props {
  orgId: string;
}

export function WebhookManager({ orgId }: Props) {
  const { user } = useAuth();
  const { hasPermission, isLoading } = usePermission("webhooks:manage", orgId);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [deliveryLog, setDeliveryLog] = useState<any[]>([]);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [form, setForm] = useState({
    webhook_name: "",
    endpoint_url: "",
    event_types: [] as string[],
  });

  useEffect(() => {
    if (hasPermission) { loadWebhooks(); loadDeliveryLog(); }
  }, [hasPermission, orgId]);

  async function loadWebhooks() {
    const { data } = await supabase
      .from("webhook_subscriptions")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });
    setWebhooks(data ?? []);
  }

  async function loadDeliveryLog() {
    const { data } = await supabase
      .from("webhook_delivery_log")
      .select("id, event_type, succeeded, status_code, delivered_at, attempt_number")
      .eq("organization_id", orgId)
      .order("delivered_at", { ascending: false })
      .limit(20);
    setDeliveryLog(data ?? []);
  }

  async function createWebhook() {
    if (!user || !form.webhook_name || !form.endpoint_url) return;
    if (!form.endpoint_url.startsWith("https://")) {
      alert("Endpoint URL must use HTTPS");
      return;
    }
    if (form.event_types.length === 0) {
      alert("Select at least one event type");
      return;
    }

    // Generate secure HMAC signing secret for this webhook endpoint
    const secretBytes = crypto.getRandomValues(new Uint8Array(32));
    const secret =
      "whsec_" +
      Array.from(secretBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    const { error } = await supabase.from("webhook_subscriptions").insert({
      organization_id: orgId,
      webhook_name: form.webhook_name.trim(),
      endpoint_url: form.endpoint_url.trim(),
      secret_hmac: secret,
      event_types: form.event_types,
      created_by: user.id,
    });

    if (!error) {
      setNewSecret(secret);
      setForm({ webhook_name: "", endpoint_url: "", event_types: [] });
      loadWebhooks();
    }
  }

  async function toggleWebhook(id: string, currentlyActive: boolean) {
    await supabase
      .from("webhook_subscriptions")
      .update({ is_active: !currentlyActive })
      .eq("id", id);
    loadWebhooks();
  }

  function toggleEvent(evt: string, checked: boolean) {
    setForm((f) => ({
      ...f,
      event_types: checked
        ? [...f.event_types, evt]
        : f.event_types.filter((e) => e !== evt),
    }));
  }

  if (isLoading) return <div className="p-4 text-gray-500">Loading...</div>;
  if (!hasPermission) {
    return (
      <div className="p-4 bg-gray-50 border rounded text-sm text-gray-500">
        Requires webhooks:manage permission
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Webhooks</h2>
      <p className="text-sm text-gray-500">
        Push real-time events to external systems (Slack, JIRA, SAP, custom APIs).
        All payloads are HMAC-signed using your webhook secret.
      </p>

      {/* One-time signing secret reveal */}
      {newSecret && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
          <p className="font-bold text-amber-800">⚠️ Signing secret — copy now, never shown again:</p>
          <code className="block mt-2 p-3 bg-amber-100 rounded text-sm break-all font-mono select-all">
            {newSecret}
          </code>
          <p className="text-xs text-amber-700 mt-2">
            Set this as an environment variable in your receiving server to verify
            the <code>X-GHG-Signature</code> header on incoming requests.
          </p>
          <button
            onClick={() => setNewSecret(null)}
            className="mt-2 text-sm text-amber-700 underline"
          >
            ✓ I have saved this secret
          </button>
        </div>
      )}

      {/* Create form */}
      <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
        <h3 className="font-medium">Add Webhook</h3>
        <input
          type="text"
          placeholder="Webhook name (e.g. Slack Anomaly Alerts)"
          value={form.webhook_name}
          onChange={(e) => setForm((f) => ({ ...f, webhook_name: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <input
          type="url"
          placeholder="Endpoint URL (must be https://...)"
          value={form.endpoint_url}
          onChange={(e) => setForm((f) => ({ ...f, endpoint_url: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <div>
          <label className="block text-sm font-medium mb-2">Subscribe to events:</label>
          <div className="grid grid-cols-2 gap-1">
            {WEBHOOK_EVENTS.map((evt) => (
              <label key={evt.value} className="flex items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={form.event_types.includes(evt.value)}
                  onChange={(e) => toggleEvent(evt.value, e.target.checked)}
                />
                <div>
                  <div className="font-mono text-blue-600">{evt.value}</div>
                  <div className="text-gray-500">{evt.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <button
          onClick={createWebhook}
          disabled={!form.webhook_name || !form.endpoint_url || form.event_types.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          Create Webhook
        </button>
      </div>

      {/* Webhook list */}
      <div className="space-y-2">
        {webhooks.map((wh) => (
          <div key={wh.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{wh.webhook_name}</div>
                <div className="text-xs text-gray-500 font-mono mt-0.5">{wh.endpoint_url}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Events: {(wh.event_types as string[]).join(", ")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {wh.failure_count > 0 && (
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    {wh.failure_count} failures
                  </span>
                )}
                <button
                  onClick={() => toggleWebhook(wh.id, wh.is_active)}
                  className={`text-xs px-3 py-1.5 rounded font-medium ${
                    wh.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {wh.is_active ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent delivery log */}
      {deliveryLog.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Recent Deliveries</h3>
          <div className="text-xs space-y-1">
            {deliveryLog.map((log) => (
              <div key={log.id} className="flex justify-between border-b py-1">
                <span className="font-mono text-blue-600">{log.event_type}</span>
                <span className={log.succeeded ? "text-green-600" : "text-red-600"}>
                  {log.status_code} {log.succeeded ? "✓" : "✗"}
                </span>
                <span className="text-gray-400">
                  {new Date(log.delivered_at).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}