import { EmissionFactorsView } from "@/features/accounting/EmissionFactorsView";

/**
 * Thin route entry: the accounting feature owns live factor coverage behavior.
 */
export default function AccountingFactorsPage() {
  return <EmissionFactorsView />;
}
