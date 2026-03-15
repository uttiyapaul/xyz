import { OrganizationFacilitiesView } from "@/features/org/facilities/OrganizationFacilitiesView";

/**
 * Route entry for organization legal-entity and facility management.
 *
 * The feature workspace owns the data flow so the App Router file stays a
 * minimal entrypoint.
 */
export default function OrgFacilitiesPage() {
  return <OrganizationFacilitiesView />;
}
