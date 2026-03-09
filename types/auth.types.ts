/**
 * CarbonIQ Platform — types/auth.types.ts
 */

export type PlatformRole =
  | "platform_superadmin"
  | "platform_admin"
  | "platform_support"
  | "consultant_lead"
  | "consultant_analyst"
  | "consultant_viewer"
  | "client_admin"
  | "client_sustainability_manager"
  | "client_data_entry"
  | "client_approver"
  | "client_viewer"
  | "verifier_lead"
  | "verifier_member"
  | "auditor_readonly";

export type PermissionAction = "create" | "read" | "update" | "delete" | "approve" | "export" | "admin";

export interface UserProfile {
  id:           string;
  email:        string;
  full_name:    string;
  avatar_url:   string | null;
  role:         PlatformRole;
  org_id:       string | null;
  org_name:     string | null;
  is_active:    boolean;
  last_login:   string | null;
  mfa_enabled:  boolean;
  created_at:   string;
}

export interface AuthSession {
  user:          UserProfile;
  access_token:  string;
  refresh_token: string;
  expires_at:    number;
}

export interface AuthState {
  user:      UserProfile | null;
  session:   AuthSession | null;
  loading:   boolean;
  error:     string | null;
  csrfToken: string | null;
}

// Permission matrix per role
export const ROLE_PERMISSIONS: Record<PlatformRole, Record<string, PermissionAction[]>> = {
  platform_superadmin:            { "*": ["create","read","update","delete","approve","export","admin"] },
  platform_admin:                 { "*": ["create","read","update","delete","approve","export"] },
  platform_support:               { "*": ["read"] },
  consultant_lead:                { ghg: ["create","read","update","delete","approve","export"], clients: ["read","update"] },
  consultant_analyst:             { ghg: ["create","read","update","export"], clients: ["read"] },
  consultant_viewer:              { ghg: ["read","export"], clients: ["read"] },
  client_admin:                   { ghg: ["create","read","update","delete","approve","export"], org: ["admin"] },
  client_sustainability_manager:  { ghg: ["create","read","update","approve","export"] },
  client_data_entry:              { ghg: ["create","read","update"] },
  client_approver:                { ghg: ["read","approve","export"] },
  client_viewer:                  { ghg: ["read"] },
  verifier_lead:                  { ghg: ["read","approve","export"], verification: ["create","read","update","approve"] },
  verifier_member:                { ghg: ["read","export"], verification: ["create","read","update"] },
  auditor_readonly:               { ghg: ["read"], verification: ["read"], audit: ["read"] },
};

export function hasPermission(
  role: PlatformRole,
  resource: string,
  action: PermissionAction
): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  const all = perms["*"];
  if (all && (all.includes(action) || all.includes("admin"))) return true;
  const specific = perms[resource];
  if (!specific) return false;
  return specific.includes(action) || specific.includes("admin");
}
