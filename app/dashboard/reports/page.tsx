import { EmissionReportsView } from "@/features/dashboard/reports/EmissionReportsView";

/**
 * Route entry stays intentionally thin.
 * The reporting feature owns the fiscal-year selection and live read-model mapping.
 */
export default function ReportsPage() {
  return <EmissionReportsView />;
}
