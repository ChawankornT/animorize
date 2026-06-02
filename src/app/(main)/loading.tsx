import { Skeleton } from "@/components/ui/Skeleton";

export default function MainLoading() {
  return (
    <div className="p-8 space-y-6">
      <Skeleton variant="title" className="w-48" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    </div>
  );
}
