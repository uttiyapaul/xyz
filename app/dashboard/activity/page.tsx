import { ActivityDataView } from "@/features/dashboard/activity/ActivityDataView";

/**
 * Route entry stays intentionally thin.
 * The activity feature owns all live data loading and interaction logic.
 */
export default function ActivityDataPage() {
  return <ActivityDataView />;
}
