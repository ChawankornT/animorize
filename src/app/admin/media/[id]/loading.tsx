import { Skeleton } from "@/components/ui/Skeleton";

export default function MediaDetailLoading() {
  return (
    <div className="p-8 space-y-6">
      <Skeleton variant="text" className="w-48" />
      <div className="flex items-center justify-between">
        <Skeleton variant="title" className="w-56" />
        <div className="flex gap-2">
          <Skeleton variant="text" className="w-16 h-7" />
          <Skeleton variant="text" className="w-16 h-7" />
        </div>
      </div>
      <div className="flex gap-6 p-5 border-[0.5px] border-default rounded-card">
        <Skeleton variant="card" className="w-28 h-40 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <Skeleton variant="text" className="w-16 h-5" />
            <Skeleton variant="text" className="w-16 h-5" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="text" />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" className="w-24 h-5" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
    </div>
  );
}
