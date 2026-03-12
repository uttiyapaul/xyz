import { SkeletonPage } from "@/components/layout/SkeletonPage";

export default function AdminFeaturesPage() {
  return (
    <SkeletonPage 
      title="Global Configuration & Flags" 
      description="Toggle experimental features globally across tenants and manage core system-wide environmental variables."
    />
  );
}
