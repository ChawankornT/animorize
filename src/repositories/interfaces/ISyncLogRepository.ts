import type { SyncLog, CreateSyncLogInput } from "@/domain/entities/SyncLog";

export interface ISyncLogRepository {
  findAll(options?: { mediaId?: string; limit?: number }): Promise<SyncLog[]>;
  create(data: CreateSyncLogInput): Promise<SyncLog>;
}
