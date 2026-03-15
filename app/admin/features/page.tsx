import { AdminFeaturesView } from "@/features/admin/features/AdminFeaturesView";

export const dynamic = "force-dynamic";

/**
 * Thin route entry for global feature and security posture.
 */
export default function AdminFeaturesPage() {
  return <AdminFeaturesView />;
}
