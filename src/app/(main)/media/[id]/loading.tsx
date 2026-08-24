import { Skeleton } from "@/components/ui/Skeleton";

export default function MediaDetailLoading() {
  return (
    <div className="px-8 py-6 flex flex-col gap-6">
      {/* Breadcrumb skeleton */}
      <Skeleton variant="text" className="w-48 h-4" />

      <div className="flex gap-8">
        {/* Poster aside */}
        <div className="shrink-0 w-64 flex flex-col gap-4">
          <Skeleton variant="card" className="aspect-3/4 h-auto" />
          <div className="flex flex-col gap-2">
            <Skeleton variant="text" className="w-20" />
            <Skeleton variant="text" className="w-full" />
            <Skeleton variant="text" className="w-24" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Skeleton variant="title" className="w-80 h-8" />
            <Skeleton variant="text" className="w-60" />
            <Skeleton variant="text" className="w-40" />
            <div className="flex gap-2 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="text" className="w-16 h-5 rounded-pill" />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Skeleton variant="title" className="w-24" />
            <Skeleton variant="text" className="w-full" />
            <Skeleton variant="text" className="w-full" />
            <Skeleton variant="text" className="w-3/4" />
          </div>

          <div className="flex flex-col gap-3">
            <Skeleton variant="title" className="w-32" />
            <Skeleton variant="card" className="h-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
