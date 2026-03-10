"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { usePermission } from "../../lib/hooks/usePermission";
import { useAuth } from "../../context/AuthContext";

// Matches your live public.api_keys table columns exactly
interface ApiKey {
  id: string;
  key_name: string;
  key_prefix: string;
  scopes: string[];
  expires_at: string | null;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

// Matches the scopes stored in api_keys.scopes TEXT[]
const AVAILABLE_SCOPES = [
  { value: "data:read",        label: "Read emission data" },
  { value: "data:write",       label: "Write emission data" },
  { value: "erp:sync",         label: "ERP synchronisation" },
  { value: "webhooks:receive", label: "Receive webhooks" },
  { value: "reports:export",   label: "Export reports" },
];

interface Props {
  orgId: string;
}

export default function ApiKeyManager({ orgId }: Props) {
  const { user } = useAuth();
  const { hasPermission, isLoading } = usePermission("api_keys:manage", orgId);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyPlaintext, setNewKeyPlaintext] = useState<string | null>(null);
  const [form, setForm] = useState({
    key_name: "",
    scopes: ["data:read"] as string[],
    expires_at: "",
  });

  useEffect(() => {
    if (hasPermission) loadKeys();
  }, [hasPermission, orgId]);

  async function loadKeys() {
    const { data } = await supabase
      .from("api_keys")
      .select("id, key_name, key_prefix, scopes, expires_at, last_used_at, is_active, created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });
    setKeys(data ?? []);
  }

  async function createKey() {
    if (!user || !form.key_name.trim()) return;

    // Generate secure random key: "ghg_k_" + 64 random hex chars
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const rawKey =
      "ghg_k_" +
      Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    // prefix = first 14 chars, shown in UI forever (safe to display)
    const prefix = rawKey.slice(0, 14);

    // Hash the full key — only this is stored in the DB (key_hash column)
    const encoder = new TextEncoder();
    const buf = await crypto.subtle.digest("SHA-256", encoder.encode(rawKey));
    const keyHash = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { error } = await supabase.from("api_keys").insert({
      organization_id: orgId,
      created_by: user.id,
      key_name: form.key_name.trim(),
      key_prefix: prefix,
      key_hash: keyHash,
      scopes: form.scopes,
      expires_at: form.expires_at || null,
    });

    if (!error) {
      setNewKeyPlaintext(rawKey);
      setForm({ key_name: "", scopes: ["data:read"], expires_at: "" });
      loadKeys();
    }
  }

  async function revokeKey(keyId: string) {
    if (!user) return;
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    await supabase
      .from("api_keys")
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: user.id,
        revocation_reason: "Revoked by admin",
      })
      .eq("id", keyId);
    loadKeys();
  }

  function toggleScope(scope: string, checked: boolean) {
    setForm((f) => ({
      ...f,
      scopes: checked
        ? [...f.scopes, scope]
        : f.scopes.filter((s) => s !== scope),
    }));
  }

  if (isLoading) return <div className="p-4 text-gray-500">Loading...</div>;

  if (!hasPermission) {
    return (
      <div className="p-4 bg-gray-50 border rounded text-gray-500 text-sm">
        You do not have permission to manage API keys (requires: api_keys:manage)
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">API Keys</h2>
      <p className="text-sm text-gray-500">
        API keys authenticate external systems (ERP, IoT sensors, scripts).
        Only the key prefix is stored — copy the full key when created.
      </p>

      {/* One-time key reveal banner */}
      {newKeyPlaintext && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
          <p className="font-bold text-amber-800">
            ⚠️ Copy this key NOW — it will never be shown again:
          </p>
          <code className="block mt-2 p-3 bg-amber-100 rounded text-sm break-all font-mono select-all">
            {newKeyPlaintext}
          </code>
          <button
            onClick={() => setNewKeyPlaintext(null)}
            className="mt-3 text-sm text-amber-700 underline"
          >
            ✓ I have saved this key
          </button>
        </div>
      )}

      {/* Create form */}
      <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
        <h3 className="font-medium">Create New API Key</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Key Name</label>
          <input
            type="text"
            placeholder="e.g. SAP Production Sync"
            value={form.key_name}
            onChange={(e) => setForm((f) => ({ ...f, key_name: e.target.value }))}
            maxLength={100}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Permissions (Scopes)</label>
          <div className="space-y-1">
            {AVAILABLE_SCOPES.map((s) => (
              <label key={s.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.scopes.includes(s.value)}
                  onChange={(e) => toggleScope(s.value, e.target.checked)}
                />
                <span className="font-mono text-xs text-blue-600">{s.value}</span>
                <span className="text-gray-600">— {s.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Expiry Date (optional)
          </label>
          <input
            type="date"
            value={form.expires_at}
            onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={createKey}
          disabled={!form.key_name.trim() || form.scopes.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Key
        </button>
      </div>

      {/* Keys table */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-3 py-2 font-medium">Name</th>
            <th className="px-3 py-2 font-medium">Prefix</th>
            <th className="px-3 py-2 font-medium">Scopes</th>
            <th className="px-3 py-2 font-medium">Last Used</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr key={key.id} className="border-t">
              <td className="px-3 py-2">{key.key_name}</td>
              <td className="px-3 py-2 font-mono text-xs">{key.key_prefix}…</td>
              <td className="px-3 py-2 text-xs">{key.scopes.join(", ")}</td>
              <td className="px-3 py-2 text-xs text-gray-500">
                {key.last_used_at
                  ? new Date(key.last_used_at).toLocaleDateString("en-IN")
                  : "Never used"}
              </td>
              <td className="px-3 py-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    key.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {key.is_active ? "Active" : "Revoked"}
                </span>
              </td>
              <td className="px-3 py-2">
                {key.is_active && (
                  <button
                    onClick={() => revokeKey(key.id)}
                    className="text-red-600 text-xs hover:underline"
                  >
                    Revoke
                  </button>
                )}
              </td>
            </tr>
          ))}
          {keys.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                No API keys created yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}