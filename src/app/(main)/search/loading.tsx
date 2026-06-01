import { Skeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col items-center gap-3 pt-12">
        <Skeleton variant="title" className="w-80" />
        <Skeleton variant="text" className="w-64" />
        <Skeleton variant="text" className="w-full max-w-180 h-14" />
      </div>
    </div>
  );
}
