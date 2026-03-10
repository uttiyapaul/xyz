"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { useAuth } from "../../context/AuthContext";

// Matches public.user_sessions table columns from your schema
interface UserSession {
  id: string;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  country_code: string | null;
  city: string | null;
  login_at: string;
  last_active_at: string;
  is_active: boolean;
  mfa_verified: boolean;
  risk_score: number | null;
}

interface Props {
  orgId?: string;
}

export default function SessionManager({ orgId }: Props) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadSessions();
  }, [user?.id]);

  async function loadSessions() {
    setIsLoading(true);
    const { data } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", user?.id)
      .eq("is_active", true)
      .order("last_active_at", { ascending: false });
    setSessions(data ?? []);
    setIsLoading(false);
  }

  async function forceLogout(sessionId: string) {
    if (!user) return;

    // Update the user_sessions record (RLS policy "sessions_own" allows this)
    await supabase
      .from("user_sessions")
      .update({
        force_logged_out_at: new Date().toISOString(),
        force_logout_by: user.id,
        force_logout_reason: "User-initiated remote logout",
        is_active: false,
        logout_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    // Also call Edge Function to handle any server-side invalidation
    await supabase.functions.invoke("invalidate-session", {
      body: { session_id: sessionId },
    });

    loadSessions();
  }

  async function forceLogoutAll() {
    if (!user) return;
    if (!confirm("Sign out all other active sessions? Your current session will stay active.")) return;

    await supabase
      .from("user_sessions")
      .update({
        force_logged_out_at: new Date().toISOString(),
        force_logout_by: user.id,
        force_logout_reason: "Bulk logout by user",
        is_active: false,
        logout_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("is_active", true);

    loadSessions();
  }

  const riskColor = (score: number | null) => {
    if (score === null) return "";
    if (score < 0.3) return "text-green-600";
    if (score < 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) return <div className="p-4 text-gray-500">Loading sessions...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Active Sessions</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Devices currently signed in to your account ({sessions.length} active)
          </p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={forceLogoutAll}
            className="text-sm text-red-600 border border-red-300 px-3 py-1.5 rounded hover:bg-red-50"
          >
            Sign out all other devices
          </button>
        )}
      </div>

      <div className="space-y-2">
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center justify-between border rounded-lg p-3">
            <div className="space-y-0.5">
              <div className="font-medium text-sm">
                {s.browser ?? "Unknown browser"} on {s.os ?? "Unknown OS"}
                {s.device_type && (
                  <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {s.device_type}
                  </span>
                )}
                {s.mfa_verified && (
                  <span className="ml-2 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                    MFA ✓
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {[s.ip_address, s.city, s.country_code].filter(Boolean).join(" · ")}
              </div>
              <div className="text-xs text-gray-400">
                Last active: {new Date(s.last_active_at).toLocaleString("en-IN")}
                {s.risk_score !== null && (
                  <span className={`ml-2 ${riskColor(s.risk_score)}`}>
                    Risk score: {(s.risk_score * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => forceLogout(s.id)}
              className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">
            No active sessions found
          </div>
        )}
      </div>
    </div>
  );
}