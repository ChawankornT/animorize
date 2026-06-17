import type { SupabaseDb } from "@/lib/supabase/types";
import type { IWatchLogRepository } from "@/repositories/interfaces/IWatchLogRepository";
import type { WatchLog } from "@/domain/entities/WatchLog";
import { toWatchLog } from "@/repositories/supabase/mappers";

export class SupabaseWatchLogRepository implements IWatchLogRepository {
  constructor(private readonly supabase: SupabaseDb) {}

  async findByUserAndMedia(userId: string, mediaId: string, limit: number): Promise<WatchLog[]> {
    const { data, error } = await this.supabase
      .from("watchlogs")
      .select("*")
      .eq("user_id", userId)
      .eq("media_id", mediaId)
      .order("watched_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch watch history: ${error.message}`);
    return (data ?? []).map(toWatchLog);
  }
}
