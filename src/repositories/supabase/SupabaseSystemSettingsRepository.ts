import type { SupabaseDb } from '@/lib/supabase/types';
import type { ISystemSettingsRepository } from '@/repositories/interfaces/ISystemSettingsRepository';
import type { SystemSettings, UpdateSystemSettingsInput } from '@/domain/entities/SystemSettings';
import { toSystemSettings } from '@/repositories/supabase/mappers';

export class SupabaseSystemSettingsRepository implements ISystemSettingsRepository {
  constructor(private readonly supabase: SupabaseDb) {}

  async get(): Promise<SystemSettings> {
    const { data, error } = await this.supabase
      .from('system_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw new Error(`Failed to get system settings: ${error.message}`);
    return toSystemSettings(data);
  }

  async update(input: UpdateSystemSettingsInput): Promise<SystemSettings> {
    const { data, error } = await this.supabase
      .from('system_settings')
      .update({ auto_sync_enabled: input.autoSyncEnabled })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw new Error(`Failed to update system settings: ${error.message}`);
    return toSystemSettings(data);
  }
}
