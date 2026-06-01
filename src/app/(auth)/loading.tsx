import { Skeleton } from '@/components/ui/Skeleton';

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <Skeleton variant="title" className="mx-auto w-1/2" />
          <Skeleton variant="text" className="mx-auto w-3/4" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-9 w-full rounded-button" />
          <Skeleton className="h-9 w-full rounded-button" />
          <Skeleton className="h-8.5 w-full rounded-button" />
        </div>
      </div>
    </div>
  );
}
