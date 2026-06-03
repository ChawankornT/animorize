import type { SystemSettings, UpdateSystemSettingsInput } from "@/domain/entities/SystemSettings";

export interface ISystemSettingsRepository {
  get(): Promise<SystemSettings>;
  update(data: UpdateSystemSettingsInput): Promise<SystemSettings>;
}
