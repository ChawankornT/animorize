import type { ISyncLogRepository } from '@/repositories/interfaces/ISyncLogRepository';
import type { SyncLog } from '@/domain/entities/SyncLog';

/**
 * Returns sync log entries, ordered by most recent first.
 * @param repository - SyncLog repository implementation
 * @param options.mediaId - Filter to a specific media entry
 * @param options.limit - Maximum number of results to return
 * @returns Array of SyncLog entities (includes mediaTitle from JOIN when available)
 */
export async function listSyncLogs(
  repository: ISyncLogRepository,
  options?: { mediaId?: string; limit?: number },
): Promise<SyncLog[]> {
  return repository.findAll(options);
}
