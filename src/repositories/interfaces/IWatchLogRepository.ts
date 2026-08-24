import type { WatchLog } from "@/domain/entities/WatchLog";

export interface IWatchLogRepository {
  findByUserAndMedia(userId: string, mediaId: string, limit: number): Promise<WatchLog[]>;
}
