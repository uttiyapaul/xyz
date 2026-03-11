"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import { getUserPrimaryRole } from "../lib/auth/role-routing";
import type { User, Session } from "@supabase/supabase-js";

// ── Types ────────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  session: Session | null;
  orgIds: string[];
  roles: string[];
  isPlatformAdmin: boolean;
  isConsultant: boolean;
  isLoading: boolean;
}

const defaultState: AuthState = {
  user: null,
  session: null,
  orgIds: [],
  roles: [],
  isPlatformAdmin: false,
  isConsultant: false,
  isLoading: true,
};

const AuthContext = createContext<AuthState>(defaultState);

// ── JWT decoder ───────────────────────────────────────────────────────────────
// CRITICAL: session.user.app_metadata comes from the DB row and is STALE.
// The JWT access_token contains the live claims injected by the Edge Function.
// Always decode the token — never trust session.user.app_metadata directly.
function decodeJwtClaims(accessToken: string): Record<string, unknown> {
  try {
    const payload = accessToken.split(".")[1];
    // atob requires padding to be correct
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch (e) {
    console.error("❌ Failed to decode JWT:", e);
    return {};
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);

  function extractFromSession(session: Session | null): AuthState {
    if (!session) {
      return { ...defaultState, isLoading: false };
    }

    // Decode JWT to get live claims — NOT session.user.app_metadata
    const jwtClaims  = decodeJwtClaims(session.access_token);
    const meta       = (jwtClaims.app_metadata as Record<string, unknown>) ?? {};

    console.log("✅ JWT app_metadata:", meta);

    const roles: string[]  = Array.isArray(meta.roles) ? (meta.roles as string[]) : [];
    const orgIds: string[] = Array.isArray(meta.org_ids) ? (meta.org_ids as string[]) : [];

    // Build a patched user object with JWT claims so role-routing reads correctly
    const patchedUser: User = {
      ...session.user,
      app_metadata: {
        ...session.user.app_metadata,
        ...meta,   // ← JWT claims win over stale DB values
      },
    };

    const primaryRole    = getUserPrimaryRole(patchedUser);
    const isPlatformAdmin = Boolean(meta.is_platform_admin) ||
                            primaryRole === "platform_superadmin" ||
                            primaryRole === "platform_admin";
    const isConsultant   = typeof meta.is_consultant === "boolean"
                            ? (meta.is_consultant as boolean)
                            : primaryRole.startsWith("consultant_");

    return {
      user:    patchedUser,
      session,
      orgIds,
      roles,
      isPlatformAdmin,
      isConsultant,
      isLoading: false,
    };
  }

  useEffect(() => {
    // Load session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(extractFromSession(session));
    });

    // Listen for auth changes — SIGNED_IN event fires with fresh JWT after login
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔄 Auth event:", event);
        setState(extractFromSession(session));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
