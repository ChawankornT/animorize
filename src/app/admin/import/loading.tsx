import { Skeleton } from '@/components/ui/Skeleton';

export default function ImportLoading() {
  return (
    <div className="p-8 space-y-6">
      <Skeleton variant="title" className="w-32" />
      <div className="space-y-4 max-w-md">
        <Skeleton variant="text" className="w-full h-9" />
        <Skeleton variant="text" className="w-24 h-9" />
      </div>
    </div>
  );
}
