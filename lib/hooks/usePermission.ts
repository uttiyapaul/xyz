"use client";

import { useEffect, useState } from "react";
import { checkPermission } from "../supabase/queries";
import { useAuth } from "../../context/AuthContext";

// All permission codes from your live platform_permissions table
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
  orgId?: string
): UsePermissionResult {
  const { isPlatformAdmin, isLoading: authLoading } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    // Platform admins bypass all permission checks
    if (isPlatformAdmin) {
      setHasPermission(true);
      setIsLoading(false);
      return;
    }

    // platform:all_orgs is consultant-only — checked via DB
    if (!orgId) {
      setHasPermission(false);
      setIsLoading(false);
      return;
    }

    checkPermission(orgId, permission)
      .then((result) => {
        setHasPermission(result);
      })
      .finally(() => setIsLoading(false));
  }, [permission, orgId, isPlatformAdmin, authLoading]);

  return { hasPermission, isLoading };
}