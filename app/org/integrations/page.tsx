import { OrgIntegrationsView } from "@/features/org/integrations/OrgIntegrationsView";

/**
 * Thin route entry so the integrations workspace can evolve without leaving
 * route logic mixed into old placeholder content.
 */
export default function OrgIntegrationsPage() {
  return <OrgIntegrationsView />;
}
