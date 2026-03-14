"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { checkPermission } from "@/lib/supabase/queries";

/**
 * Frontend permission helper for places where we still need a quick
 * role-sensitive UI toggle before a server action or RLS-backed query runs.
 *
 * Important:
 * - Platform admins still bypass client-side checks.
 * - The database function `has_permission()` remains the real source of truth.
 * - This hook now defaults to `primaryOrgId` so screens do not keep re-creating
 *   ad hoc `orgIds[0]` logic after the scope cleanup work.
 */
export type PermissionCode =
  | "data:entry"
  | "readings:write"
  | "documents:upload"
  | "documents:review"
  | "submissions:create"
  | "submissions:manage"
  | "signoff:execute"
  | "users:manage"
  | "api_keys:manage"
  | "webhooks:manage"
  | "erp:admin"
  | "reports:export"
  | "benchmarks:view"
  | "platform:all_orgs";

interface UsePermissionResult {
  hasPermission: boolean;
  isLoading: boolean;
}

export function usePermission(
  permission: PermissionCode,
  orgId?: string | null,
): UsePermissionResult {
  const { isPlatformAdmin, isLoading: authLoading, primaryOrgId } = useAuth();
  const resolvedOrgId = orgId ?? primaryOrgId;
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (authLoading) {
      return;
    }

    if (isPlatformAdmin) {
      setHasPermission(true);
      setIsLoading(false);
      return;
    }

    if (!resolvedOrgId) {
      setHasPermission(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    void checkPermission(resolvedOrgId, permission)
      .then((result) => {
        if (isMounted) {
          setHasPermission(result);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authLoading, isPlatformAdmin, permission, resolvedOrgId]);

  return { hasPermission, isLoading };
}
