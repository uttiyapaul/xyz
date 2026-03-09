"use client"; // Required for Next.js App Router

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

// ── Types ────────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  session: Session | null;
  orgIds: string[];            // from JWT app_metadata.org_ids (set by Edge Function)
  roles: string[];             // from JWT app_metadata.roles
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

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);

  function extractFromSession(session: Session | null): AuthState {
    if (!session) {
      return { ...defaultState, isLoading: false };
    }

    // These values were injected by set-jwt-claims Edge Function on login
    const meta = session.user.app_metadata ?? {};

    return {
      user: session.user,
      session,
      orgIds: Array.isArray(meta.org_ids) ? meta.org_ids : [],
      roles: Array.isArray(meta.roles) ? meta.roles : [],
      isPlatformAdmin: Boolean(meta.is_platform_admin),
      isConsultant: Boolean(meta.is_consultant),
      isLoading: false,
    };
  }

  useEffect(() => {
    // Load session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(extractFromSession(session));
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
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

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}