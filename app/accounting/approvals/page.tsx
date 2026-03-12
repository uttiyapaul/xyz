import { SkeletonPage } from "@/components/layout/SkeletonPage";

export default function AccountingApprovalsPage() {
  return (
    <SkeletonPage 
      title="Data Approval Queue" 
      description="Stage, review, and approve incoming utility and activity data before it hits the immutable GHG ledger."
    />
  );
}
