import "server-only";

import { canAccessPlatformAdmin, getUserRoles, type PlatformRole } from "@/lib/auth/roles";
import { createRequestSupabaseClient } from "@/lib/supabase/server";

export interface PlatformStaffActor {
  userId: string;
  email: string | null;
  roleNames: PlatformRole[];
}

/**
 * Server-side actor gate for the non-admin platform workspaces.
 *
 * Why this helper exists:
 * - These routes read live platform-wide data with a service-role client.
 * - The request still needs a real authenticated actor before those reads run.
 * - Platform control roles may inspect these views, but regular app users must
 *   never reach them through a stale client-side redirect alone.
 */
export async function requirePlatformStaffActor(
  allowedRoles: readonly PlatformRole[],
): Promise<PlatformStaffActor> {
  const authClient = await createRequestSupabaseClient();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) {
    throw new Error("AUTH_REQUIRED");
  }

  const roleNames = getUserRoles(user);

  if (!roleNames.some((role) => canAccessPlatformAdmin(role) || allowedRoles.includes(role))) {
    throw new Error("PLATFORM_WORKSPACE_ACCESS_REQUIRED");
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    roleNames,
  };
}
