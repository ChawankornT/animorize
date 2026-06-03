import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="p-8 space-y-6">
      <div className="space-y-1">
        <Skeleton variant="title" className="w-24" />
        <Skeleton variant="text" className="w-48" />
      </div>
      <div className="max-w-md p-5 border-[0.5px] border-default rounded-card">
        <Skeleton variant="text" className="w-32 mb-4" />
        <div className="flex gap-3">
          <Skeleton variant="circle" className="w-4 h-4 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <Skeleton variant="text" className="w-36" />
            <Skeleton variant="text" className="w-64" />
          </div>
        </div>
      </div>
    </div>
  );
}
