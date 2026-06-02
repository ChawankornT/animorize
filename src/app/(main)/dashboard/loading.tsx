import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="px-8 py-6 flex flex-col gap-4">
      {/* Page header skeleton */}
      <div>
        <Skeleton variant="title" className="w-40 h-9 mb-2" />
        <Skeleton variant="text" className="w-64" />
      </div>

      {/* Tabs skeleton */}
      <Skeleton variant="text" className="w-72 h-10" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton variant="card" className="aspect-16/10 h-auto" />
            <Skeleton variant="title" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
