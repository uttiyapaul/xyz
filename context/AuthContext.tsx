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
import { getPatchedUserFromSession } from "@/lib/auth/sessionClaims";
import { buildSessionScope } from "@/lib/auth/sessionScope";
import { supabase } from "@/lib/supabase/client";

/**
 * Auth context normalizes Supabase session data into the shape the frontend uses.
 *
 * Why this file matters:
 * - `session.user.app_metadata` can lag behind the live JWT claims.
 * - The dashboard and sidebar need a typed role list from the token.
 * - Live views need normalized org/site/legal-entity scope without manually
 *   reaching for `orgIds[0]` in every component.
 * - Keeping that normalization in one place prevents every component from
 *   decoding JWT state differently.
 */

interface AuthState {
  user: User | null;
  session: Session | null;
  orgIds: string[];
  primaryOrgId: string | null;
  siteScopeIds: string[];
  legalEntityScopeIds: string[];
  roles: PlatformRole[];
  isPlatformAdmin: boolean;
  isConsultant: boolean;
  isLoading: boolean;
}

const defaultState: AuthState = {
  user: null,
  session: null,
  orgIds: [],
  primaryOrgId: null,
  siteScopeIds: [],
  legalEntityScopeIds: [],
  roles: [],
  isPlatformAdmin: false,
  isConsultant: false,
  isLoading: true,
};

const AuthContext = createContext<AuthState>(defaultState);

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

    const patchedUser: User = getPatchedUserFromSession(session);
    const patchedMeta = patchedUser.app_metadata ?? {};
    const sessionScope = buildSessionScope(patchedMeta);
    const roles = extractRoles(patchedMeta.roles, patchedMeta.primary_role);
    const fallbackRoles = roles.length > 0 ? roles : getUserRoles(patchedUser);

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
      orgIds: sessionScope.orgIds,
      primaryOrgId: sessionScope.primaryOrgId,
      siteScopeIds: sessionScope.siteScopeIds,
      legalEntityScopeIds: sessionScope.legalEntityScopeIds,
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
