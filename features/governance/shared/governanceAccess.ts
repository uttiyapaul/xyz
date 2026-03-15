import "server-only";

import { canAccessPlatformAdmin, getUserRoles, type PlatformRole } from "@/lib/auth/roles";
import { createRequestSupabaseClient } from "@/lib/supabase/server";

export interface GovernanceActor {
  userId: string;
  email: string | null;
  roleNames: PlatformRole[];
}

/**
 * Server-side gate for governance workspaces.
 *
 * Why this exists:
 * - DPO and grievance roles need live, server-rendered workspaces without
 *   exposing service-role reads to unauthenticated or unrelated users.
 * - Platform control roles are still allowed to inspect these pages during
 *   audits and operational investigations.
 */
export async function requireGovernanceActor(
  allowedRoles: readonly PlatformRole[],
): Promise<GovernanceActor> {
  const authClient = await createRequestSupabaseClient();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) {
    throw new Error("AUTH_REQUIRED");
  }

  const roleNames = getUserRoles(user);
  const hasGovernanceAccess =
    roleNames.some((role) => allowedRoles.includes(role)) ||
    roleNames.some((role) => canAccessPlatformAdmin(role));

  if (!hasGovernanceAccess) {
    throw new Error("GOVERNANCE_ACCESS_REQUIRED");
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    roleNames,
  };
}
