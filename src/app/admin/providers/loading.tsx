import { Skeleton } from '@/components/ui/Skeleton';

export default function ProvidersLoading() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton variant="title" className="w-32" />
        <Skeleton variant="text" className="w-24 h-7" />
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
    </div>
  );
}
