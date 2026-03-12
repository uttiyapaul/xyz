import { SkeletonPage } from "@/components/layout/SkeletonPage";

export default function DataUploadPage() {
  return (
    <SkeletonPage 
      title="Mass Bulk Upload" 
      description="Upload CSV or Excel spreadsheets mapped to your specific facility structures for automated processing."
    />
  );
}
