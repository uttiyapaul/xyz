"use client";

import { useEffect, useState } from "react";
import { isFeatureEnabled } from "../../lib/supabase/queries";

interface Props {
  flagKey: string;      // must match a flag_key in your feature_flags table
  orgId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// Calls your live DB function is_feature_enabled(p_flag_key, p_org_id)
export function FeatureGate({ flagKey, orgId, fallback = null, children }: Props) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    isFeatureEnabled(flagKey, orgId).then(setEnabled);
  }, [flagKey, orgId]);

  if (enabled === null) return null; // loading silently

  return enabled ? <>{children}</> : <>{fallback}</>;
}

// Standard upgrade prompt (pass as fallback={<UpgradeBanner feature="..." />})
export function UpgradeBanner({ feature }: { feature: string }) {
  return (
    <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center bg-blue-50">
      <div className="text-2xl mb-2">🔒</div>
      <p className="text-gray-700 font-medium">{feature} requires a higher plan</p>
      <p className="text-gray-500 text-sm mt-1">
        Upgrade to Professional or Enterprise to unlock this feature
      </p>
      <button className="mt-4 bg-blue-600 text-white px-5 py-2 rounded text-sm hover:bg-blue-700">
        View Plans
      </button>
    </div>
  );
}

// ── Usage examples ──────────────────────────────────────────────────────────
//
// The flag_key values below match what's seeded in your feature_flags table:
//   "ai_document_extraction" "cbam_module" "csrd_module"
//   "scope3_cat1_supplier"   "realtime_iot_ingestion" "carbon_offset_registry"
//   "advanced_benchmarking"  "multi_site_rollup"
//
// Example:
// <FeatureGate flagKey="cbam_module" orgId={orgId} fallback={<UpgradeBanner feature="CBAM Module" />}>
//   <CBAMDashboard />
// </FeatureGate>