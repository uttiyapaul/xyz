import "server-only";

import { canAccessPlatformAdmin, getUserRoles, type PlatformRole } from "@/lib/auth/roles";
import { createRequestSupabaseClient } from "@/lib/supabase/server";

export interface PlatformAdminActor {
  userId: string;
  email: string | null;
  roleNames: PlatformRole[];
}

/**
 * Server-side gate for privileged admin surfaces.
 *
 * The client layout already redirects non-admin users, but server components
 * still need an authenticated actor check so service-role reads are never
 * triggered for the wrong request.
 */
export async function requirePlatformAdminActor(): Promise<PlatformAdminActor> {
  const authClient = await createRequestSupabaseClient();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) {
    throw new Error("AUTH_REQUIRED");
  }

  const roleNames = getUserRoles(user);

  if (!roleNames.some((role) => canAccessPlatformAdmin(role))) {
    throw new Error("ADMIN_ACCESS_REQUIRED");
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    roleNames,
  };
}
