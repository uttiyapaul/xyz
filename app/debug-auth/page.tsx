"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getUserPrimaryRole, fetchUserRoleFromDB } from "@/lib/auth/role-routing";

export default function DebugAuthPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDebugInfo() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setDebugInfo({ error: "No session found. Please log in first." });
          setLoading(false);
          return;
        }

        const user = session.user;
        
        // Get role from metadata
        const roleFromMetadata = getUserPrimaryRole(user);
        
        // Fetch role from database
        const roleFromDB = await fetchUserRoleFromDB(user.id);

        // Try direct query to see what's in the database
        const { data: directQuery, error: directError } = await supabase
          .from("user_organization_roles")
          .select("*, platform_roles(*)")
          .eq("user_id", user.id);

        const { data: rolesTable, error: rolesError } = await supabase
          .from("platform_roles")
          .select("*")
          .limit(5);

        // Decode JWT to see what's in the token
        let jwtPayload = null;
        try {
          if (session.access_token) {
            jwtPayload = JSON.parse(atob(session.access_token.split('.')[1]));
          }
        } catch (e) {
          jwtPayload = { error: "Could not decode JWT" };
        }

        setDebugInfo({
          userId: user.id,
          email: user.email,
          emailVerified: user.email_confirmed_at,
          roleFromMetadata,
          roleFromDB,
          appMetadata: user.app_metadata,
          userMetadata: user.user_metadata,
          jwtPayload,
          directQuery,
          directError,
          rolesTable,
          rolesError,
        });
      } catch (error: any) {
        setDebugInfo({ error: error.message });
      } finally {
        setLoading(false);
      }
    }

    loadDebugInfo();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px", background: "#050508", minHeight: "100vh", color: "#FAFAF8" }}>
        <h1>Loading debug info...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", background: "#050508", minHeight: "100vh", color: "#FAFAF8" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "24px" }}>Auth Debug Info</h1>
      
      {debugInfo?.error ? (
        <div style={{ 
          padding: "16px", 
          background: "rgba(239,68,68,0.1)", 
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "8px",
          color: "#EF4444"
        }}>
          {debugInfo.error}
        </div>
      ) : (
        <div style={{ 
          background: "#0D0D14", 
          border: "1px solid #1A1A24",
          borderRadius: "12px",
          padding: "24px"
        }}>
          <h2 style={{ fontSize: "18px", marginBottom: "16px", color: "#F59E0B" }}>Session Info</h2>
          
          <div style={{ marginBottom: "16px" }}>
            <strong>User ID:</strong> {debugInfo.userId}
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <strong>Email:</strong> {debugInfo.email}
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <strong>Email Verified:</strong> {debugInfo.emailVerified ? "✅ Yes" : "❌ No"}
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <strong>Role from Metadata:</strong>{" "}
            <span style={{ color: debugInfo.roleFromMetadata === "pending_approval" ? "#F59E0B" : "#10B981" }}>
              {debugInfo.roleFromMetadata}
            </span>
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <strong>Role from Database:</strong>{" "}
            <span style={{ color: debugInfo.roleFromDB === "pending_approval" ? "#F59E0B" : "#10B981" }}>
              {debugInfo.roleFromDB}
            </span>
          </div>

          <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #1A1A24" }} />

          <h2 style={{ fontSize: "18px", marginBottom: "16px", color: "#F59E0B" }}>app_metadata</h2>
          <pre style={{ 
            background: "#07070E", 
            padding: "16px", 
            borderRadius: "6px",
            overflow: "auto",
            fontSize: "12px",
            color: "#9CA3AF"
          }}>
            {JSON.stringify(debugInfo.appMetadata, null, 2)}
          </pre>

          <h2 style={{ fontSize: "18px", marginBottom: "16px", marginTop: "24px", color: "#F59E0B" }}>user_metadata</h2>
          <pre style={{ 
            background: "#07070E", 
            padding: "16px", 
            borderRadius: "6px",
            overflow: "auto",
            fontSize: "12px",
            color: "#9CA3AF"
          }}>
            {JSON.stringify(debugInfo.userMetadata, null, 2)}
          </pre>

          <h2 style={{ fontSize: "18px", marginBottom: "16px", marginTop: "24px", color: "#F59E0B" }}>JWT Payload</h2>
          <pre style={{
            background: "#07070E",
            padding: "16px",
            borderRadius: "6px",
            overflow: "auto",
            fontSize: "12px",
            color: "#9CA3AF"
          }}>
            {JSON.stringify(debugInfo.jwtPayload, null, 2)}
          </pre>

          <h2 style={{ fontSize: "18px", marginBottom: "16px", marginTop: "24px", color: "#F59E0B" }}>Database Query Result</h2>
          <pre style={{
            background: "#07070E",
            padding: "16px",
            borderRadius: "6px",
            overflow: "auto",
            fontSize: "12px",
            color: "#9CA3AF"
          }}>
            {JSON.stringify({ data: debugInfo.directQuery, error: debugInfo.directError }, null, 2)}
          </pre>

          <h2 style={{ fontSize: "18px", marginBottom: "16px", marginTop: "24px", color: "#F59E0B" }}>Platform Roles Table (sample)</h2>
          <pre style={{
            background: "#07070E",
            padding: "16px",
            borderRadius: "6px",
            overflow: "auto",
            fontSize: "12px",
            color: "#9CA3AF"
          }}>
            {JSON.stringify({ data: debugInfo.rolesTable, error: debugInfo.rolesError }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
