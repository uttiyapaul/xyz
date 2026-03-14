import { AccountingAnomaliesView } from "@/features/accounting/AccountingAnomaliesView";

/**
 * Thin route entry: the accounting feature owns the live anomaly workflow.
 */
export default function AccountingAnomaliesPage() {
  return <AccountingAnomaliesView />;
}
