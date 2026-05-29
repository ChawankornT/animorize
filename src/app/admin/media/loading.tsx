import { Skeleton } from '@/components/ui/Skeleton';

export default function MediaLoading() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton variant="title" className="w-24" />
        <Skeleton variant="text" className="w-24 h-7" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="text" />
        ))}
      </div>
    </div>
  );
}
