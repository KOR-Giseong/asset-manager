import { DashboardSkeleton } from "@/components/skeletons/asset-skeleton";
import { PropertyDashboardSkeleton } from "@/components/skeletons/property-skeleton";

export default function Loading() {
  return (
    <DashboardSkeleton>
      <div className="mt-8">
        <PropertyDashboardSkeleton />
      </div>
    </DashboardSkeleton>
  );
}
