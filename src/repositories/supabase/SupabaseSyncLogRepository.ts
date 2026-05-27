import type { SupabaseDb } from '@/lib/supabase/types';
import type { ISyncLogRepository } from '@/repositories/interfaces/ISyncLogRepository';
import type { SyncLog, CreateSyncLogInput } from '@/domain/entities/SyncLog';
import { toSyncLog, fromCreateSyncLogInput } from '@/repositories/supabase/mappers';

export class SupabaseSyncLogRepository implements ISyncLogRepository {
  constructor(private readonly supabase: SupabaseDb) {}

  async findAll(options?: { mediaId?: string; limit?: number }): Promise<SyncLog[]> {
    let query = this.supabase
      .from('sync_logs')
      .select('*')
      .order('synced_at', { ascending: false });

    if (options?.mediaId) query = query.eq('media_id', options.mediaId);
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list sync logs: ${error.message}`);
    return (data ?? []).map(toSyncLog);
  }

  async create(input: CreateSyncLogInput): Promise<SyncLog> {
    const { data, error } = await this.supabase
      .from('sync_logs')
      .insert(fromCreateSyncLogInput(input))
      .select()
      .single();

    if (error) throw new Error(`Failed to create sync log: ${error.message}`);
    return toSyncLog(data);
  }
}
