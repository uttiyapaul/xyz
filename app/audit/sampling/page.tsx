import { SkeletonPage } from "@/components/layout/SkeletonPage";

export default function AuditSamplingPage() {
  return (
    <SkeletonPage 
      title="Cryptographic Data Sampling" 
      description="Generate randomized, cryptographically secured sample pools from the client's GHG inventory for ISO 14064-3 verification."
    />
  );
}
