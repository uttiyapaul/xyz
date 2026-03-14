/**
 * Shared auth/store types for the client-side state layer.
 *
 * Important:
 * - The canonical role vocabulary lives in `lib/auth/roles.ts`.
 * - Database-backed permission checks remain the source of truth.
 * - The local permission matrix below is only a lightweight frontend helper for
 *   older store code that still expects a synchronous capability lookup.
 */

import type { PlatformRole } from "@/lib/auth/roles";

export type PermissionAction = "create" | "read" | "update" | "delete" | "approve" | "export" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: PlatformRole;
  org_id: string | null;
  org_name: string | null;
  is_active: boolean;
  last_login: string | null;
  mfa_enabled: boolean;
  created_at: string;
}

export interface AuthSession {
  user: UserProfile;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthState {
  user: UserProfile | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  csrfToken: string | null;
}

export const ROLE_PERMISSIONS: Partial<Record<PlatformRole, Record<string, PermissionAction[]>>> = {
  platform_superadmin: { "*": ["create", "read", "update", "delete", "approve", "export", "admin"] },
  platform_admin: { "*": ["create", "read", "update", "delete", "approve", "export"] },
  platform_support: { "*": ["read"] },
  consultant_lead: {
    ghg: ["create", "read", "update", "delete", "approve", "export"],
    clients: ["read", "update"],
  },
  consultant_analyst: {
    ghg: ["create", "read", "update", "export"],
    clients: ["read"],
  },
  consultant_viewer: {
    ghg: ["read", "export"],
    clients: ["read"],
  },
  client_superadmin: {
    ghg: ["create", "read", "update", "delete", "approve", "export"],
    org: ["admin"],
  },
  client_admin: {
    ghg: ["create", "read", "update", "delete", "approve", "export"],
    org: ["admin"],
  },
  client_it_admin: {
    integrations: ["create", "read", "update", "delete", "export"],
    org: ["read", "update"],
  },
  sustainability_head: {
    ghg: ["create", "read", "update", "approve", "export"],
    reports: ["read", "export"],
  },
  carbon_accountant: {
    ghg: ["create", "read", "update", "approve", "export"],
    factors: ["read", "update"],
  },
  data_entry_operator: {
    ghg: ["create", "read", "update"],
  },
  data_reviewer: {
    ghg: ["read", "update", "approve"],
  },
  data_approver: {
    ghg: ["read", "approve", "export"],
  },
  verifier_lead: {
    ghg: ["read", "approve", "export"],
    verification: ["create", "read", "update", "approve"],
  },
  verifier_reviewer: {
    ghg: ["read", "export"],
    verification: ["create", "read", "update"],
  },
  verifier_approver: {
    ghg: ["read", "approve", "export"],
    verification: ["read", "approve"],
  },
  platform_auditor: {
    ghg: ["read"],
    verification: ["read"],
    audit: ["read"],
  },
  executive_viewer: {
    reports: ["read", "export"],
  },
  cfo_viewer: {
    reports: ["read", "export"],
    finance: ["read", "export"],
  },
};

export function hasPermission(role: PlatformRole, resource: string, action: PermissionAction): boolean {
  const perms = ROLE_PERMISSIONS[role];

  if (!perms) {
    return false;
  }

  const all = perms["*"];

  if (all && (all.includes(action) || all.includes("admin"))) {
    return true;
  }

  const specific = perms[resource];

  if (!specific) {
    return false;
  }

  return specific.includes(action) || specific.includes("admin");
}
