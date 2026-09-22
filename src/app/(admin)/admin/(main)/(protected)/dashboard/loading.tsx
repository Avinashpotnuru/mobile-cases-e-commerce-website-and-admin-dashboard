import { Skeleton } from "@/components/ui/states";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" role="status">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-md" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-60 rounded-md" />
        <Skeleton className="h-60 rounded-md" />
      </div>
      <Skeleton className="h-96 rounded-md" />
    </div>
  );
}