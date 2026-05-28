import { Skeleton } from '@/components/ui/Skeleton';

export default function SyncLogsLoading() {
  return (
    <div className="p-8 space-y-6">
      <div className="space-y-1">
        <Skeleton variant="title" className="w-32" />
        <Skeleton variant="text" className="w-64" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="text" />
        ))}
      </div>
    </div>
  );
}
