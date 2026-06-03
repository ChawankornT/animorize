import type { ISystemSettingsRepository } from "@/repositories/interfaces/ISystemSettingsRepository";
import type { SystemSettings, UpdateSystemSettingsInput } from "@/domain/entities/SystemSettings";

/**
 * Updates the global system settings.
 * @param repository - SystemSettings repository implementation
 * @param input - Settings to update; autoSyncEnabled controls whether the daily sync cron runs
 * @returns Updated SystemSettings entity
 */
export async function updateSystemSettings(
  repository: ISystemSettingsRepository,
  input: UpdateSystemSettingsInput,
): Promise<SystemSettings> {
  return repository.update(input);
}
