import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createSyncLogRepository } from "@/repositories";
import { listSyncLogs } from "@/domain/usecases/ListSyncLogs";
import { Badge } from "@/components/ui/Badge";
import { RetrySyncButton } from "@/components/admin/RetrySyncButton";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SyncLogsPage() {
  const supabase = await createClient();
  const logs = await listSyncLogs(createSyncLogRepository(supabase), { limit: 50 });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-primary tracking-tight">Sync logs</h1>
        <p className="mt-1 text-sm text-secondary">
          Recent AniList sync history. Failed syncs can be retried individually.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="py-16 text-center text-secondary text-sm border-[0.5px] border-default rounded-card">
          No sync logs yet.{" "}
          <Link href="/admin/import" className="text-primary underline-offset-2 hover:underline">
            Import media from AniList
          </Link>{" "}
          to create the first log.
        </div>
      ) : (
        <div className="border-[0.5px] border-default rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-[0.5px] border-default bg-surface">
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Media
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Result
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Error
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Synced at
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-default">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-surface transition-colors duration-fast">
                  <td className="px-4 py-3 font-medium text-primary">
                    {log.mediaTitle || log.mediaId}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={log.result === "success" ? "success" : "error"} dot>
                      {log.result}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-secondary text-xs max-w-xs truncate">
                    {log.errorMessage ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-secondary text-xs whitespace-nowrap">
                    {formatDate(log.syncedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {log.result === "failed" && (
                      <RetrySyncButton
                        mediaId={log.mediaId}
                        mediaTitle={log.mediaTitle ?? log.mediaId}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
