import type { ISystemSettingsRepository } from "@/repositories/interfaces/ISystemSettingsRepository";
import type { SystemSettings } from "@/domain/entities/SystemSettings";

/**
 * Returns the global system settings (singleton row, id = 1).
 * @param repository - SystemSettings repository implementation
 * @returns SystemSettings entity
 * @throws If the settings row is missing (should not happen — seeded in migration)
 */
export async function getSystemSettings(
  repository: ISystemSettingsRepository,
): Promise<SystemSettings> {
  return repository.get();
}
