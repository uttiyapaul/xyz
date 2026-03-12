import { SkeletonPage } from "@/components/layout/SkeletonPage";

export default function AdminHealthPage() {
  return (
    <SkeletonPage 
      title="System Health & Metrics" 
      description="Real-time monitoring of database load, API uptime, job queues, and critical platform infrastructure."
    />
  );
}
