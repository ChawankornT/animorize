import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  createSyncLogRepository,
  createMediaRepository,
  createProviderRepository,
} from "@/repositories";
import { listSyncLogs } from "@/domain/usecases/ListSyncLogs";
import { listMedia } from "@/domain/usecases/ListMedia";
import { listProviders } from "@/domain/usecases/ListProviders";
import { CheckCircle2, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Icon } from "@/components/ui/Icon";
import { RetrySyncButton } from "@/components/admin/RetrySyncButton";

function formatSyncTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return isToday
    ? `today, ${time}`
    : `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}, ${time}`;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [syncLogs, mediaList, providers] = await Promise.all([
    listSyncLogs(createSyncLogRepository(supabase), { limit: 50 }),
    listMedia(createMediaRepository(supabase)),
    listProviders(createProviderRepository(supabase)),
  ]);

  const failedSyncs = syncLogs.filter(l => l.result === "failed");
  const lastSync = syncLogs[0] ?? null;

  const subtitle = [
    `${mediaList.length} media`,
    `${providers.length} providers`,
    lastSync ? `last sync ${formatSyncTime(lastSync.syncedAt)}` : "no syncs yet",
  ].join(" · ");

  return (
    <div className="p-8 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-primary tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-secondary">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/sync-logs"
            className={buttonVariants({ variant: "secondary", size: "md" })}
          >
            <Icon as={Clock} size={15} />
            Sync logs
          </Link>
          <Link href="/admin/import" className={buttonVariants({ size: "md" })}>
            <Icon as={Plus} size={15} />
            Import media
          </Link>
        </div>
      </div>

      {/* Attention panel / all-clear */}
      {failedSyncs.length > 0 ? (
        <div className="border-[0.5px] border-default rounded-card overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 bg-surface border-b-[0.5px] border-default">
            <span className="text-sm font-medium text-primary">Needs attention</span>
            <span className="text-sm text-tertiary">
              {failedSyncs.length} item{failedSyncs.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Failed syncs sub-group */}
          <div>
            <div className="px-4 py-2 bg-surface border-b-[0.5px] border-default">
              <span className="text-[11px] font-medium text-tertiary uppercase tracking-wide">
                {failedSyncs.length} failed sync{failedSyncs.length !== 1 ? "s" : ""}
              </span>
            </div>
            {failedSyncs.map(log => (
              <div
                key={log.id}
                className="flex items-center gap-3 px-4 py-3 border-b-[0.5px] border-default last:border-0"
              >
                <Badge variant="error" dot>
                  Failed
                </Badge>
                <span className="text-sm font-medium text-primary min-w-45 max-w-55 truncate">
                  {log.mediaTitle ?? log.mediaId}
                </span>
                <span className="flex-1 text-xs text-secondary truncate">
                  {log.errorMessage ?? "—"}
                </span>
                <span className="text-xs text-tertiary whitespace-nowrap">
                  {formatSyncTime(log.syncedAt)}
                </span>
                <RetrySyncButton mediaId={log.mediaId} mediaTitle={log.mediaTitle ?? log.mediaId} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-[0.5px] border-default rounded-card bg-success-bg text-success text-sm">
          <Icon as={CheckCircle2} size={16} />
          <span>
            Everything is up to date.{" "}
            {lastSync
              ? "Next auto-sync scheduled for tomorrow at 03:00am."
              : "No syncs run yet — import media from AniList to get started."}
          </span>
        </div>
      )}
    </div>
  );
}
