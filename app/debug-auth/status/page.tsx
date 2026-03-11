// app/debug-auth/status/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getUserPrimaryRole } from "@/lib/auth/role-routing";

export default function DebugAuthStatus() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      setStatus({
        hasSession: !!session,
        sessionError: error?.message,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          email_confirmed_at: session.user.email_confirmed_at,
          app_metadata: session.user.app_metadata,
          user_metadata: session.user.user_metadata,
        } : null,
        role: session?.user ? getUserPrimaryRole(session.user) : null,
      });
    }

    checkAuth();
  }, []);

  return (
    <div style={{ padding: "40px", background: "#050508", minHeight: "100vh", color: "#FAFAF8" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Auth Debug Status</h1>
      <pre style={{ 
        background: "#0D0D14", 
        padding: "20px", 
        borderRadius: "8px",
        overflow: "auto",
        fontSize: "12px",
        lineHeight: "1.6",
      }}>
        {JSON.stringify(status, null, 2)}
      </pre>
    </div>
  );
}
