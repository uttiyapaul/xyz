import { SkeletonPage } from "@/components/layout/SkeletonPage";

export default function AdminRBACPage() {
  return (
    <SkeletonPage 
      title="Role-Based Access Control (RBAC)" 
      description="Strict interface to adjust RBAC for platform users. Features hardcoded logical stops to prevent privilege escalation in compliance with ISO 27001, SOC 2, and DPDP."
    />
  );
}
