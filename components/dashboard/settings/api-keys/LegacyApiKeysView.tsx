// Legacy route prototype kept during migration out of components/page.tsx naming.
"use client";

import { useAuth } from "@/context/AuthContext";
import ApiKeyManager from "@/components/settings/ApiKeyManager";

export default function ApiKeysPage() {
  const { user, orgIds } = useAuth();

  // orgIds comes from JWT app_metadata.org_ids (set by set-jwt-claims edge function)
  // Use the first org the user belongs to; multi-org switcher can extend this later
  const orgId = orgIds?.[0];

  if (!user) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Loading session…
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="p-4 text-sm text-red-500">
        No organisation found on your account. Contact your administrator.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <ApiKeyManager orgId={orgId} />
    </div>
  );
}
