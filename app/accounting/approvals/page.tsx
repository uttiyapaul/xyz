import { AccountingApprovalsView } from "@/features/accounting/AccountingApprovalsView";

/**
 * Thin route entry: the accounting feature owns live queue behavior, SoD notes,
 * and scope-aware data access.
 */
export default function AccountingApprovalsPage() {
  return <AccountingApprovalsView />;
}
