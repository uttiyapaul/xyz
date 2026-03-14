"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import {
  canAccessPlatformAdmin,
  getUserPrimaryRole,
  getUserRoles,
  isPlatformRole,
  type PlatformRole,
} from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase/client";

/**
 * Auth context normalizes Supabase session data into the shape the frontend uses.
 *
 * Why this file matters:
 * - `session.user.app_metadata` can lag behind the live JWT claims.
 * - The dashboard and sidebar need a typed role list from the token.
 * - Keeping that normalization in one place prevents every component from
 *   decoding JWT state differently.
 */

interface AuthState {
  user: User | null;
  session: Session | null;
  orgIds: string[];
  roles: PlatformRole[];
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

function decodeJwtClaims(accessToken: string): Record<string, unknown> {
  try {
    const payload = accessToken.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch (error) {
    console.error("Failed to decode JWT claims:", error);
    return {};
  }
}

function extractRoles(metaRoles: unknown, primaryRole: unknown): PlatformRole[] {
  if (Array.isArray(metaRoles)) {
    const roles = metaRoles.filter(isPlatformRole);
    if (roles.length > 0) {
      return roles;
    }
  }

  return isPlatformRole(primaryRole) ? [primaryRole] : [];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);

  function extractFromSession(session: Session | null): AuthState {
    if (!session) {
      return { ...defaultState, isLoading: false };
    }

    const jwtClaims = decodeJwtClaims(session.access_token);
    const meta = (jwtClaims.app_metadata as Record<string, unknown>) ?? {};

    const patchedUser: User = {
      ...session.user,
      app_metadata: {
        ...session.user.app_metadata,
        ...meta,
      },
    };

    const patchedMeta = patchedUser.app_metadata ?? {};
    const roles = extractRoles(patchedMeta.roles, patchedMeta.primary_role);
    const fallbackRoles = roles.length > 0 ? roles : getUserRoles(patchedUser);
    const orgIds = Array.isArray(patchedMeta.org_ids) ? (patchedMeta.org_ids as string[]) : [];

    const primaryRole = getUserPrimaryRole(patchedUser);
    const isPlatformAdmin =
      Boolean(patchedMeta.is_platform_admin) ||
      canAccessPlatformAdmin(primaryRole);
    const isConsultant =
      typeof patchedMeta.is_consultant === "boolean"
        ? (patchedMeta.is_consultant as boolean)
        : fallbackRoles.some((role) => role.startsWith("consultant_"));

    return {
      user: patchedUser,
      session,
      orgIds,
      roles: fallbackRoles,
      isPlatformAdmin,
      isConsultant,
      isLoading: false,
    };
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(extractFromSession(session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(extractFromSession(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return ctx;
}
