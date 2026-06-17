import type { IUserMediaRepository } from "@/repositories/interfaces/IUserMediaRepository";
import type { UserMedia } from "@/domain/entities/UserMedia";

/**
 * Restarts a media from episode 0 for rewatching.
 * Business rules (§P4 1.4):
 * - Only valid from completed, dropped, or on_hold status
 * - Resets current_episode to 0, status to 'watching', started_at to now
 * - Increments rewatch_count by 1
 * - Does not touch existing watchlogs
 * @returns Updated UserMedia, or null if status guard missed (wrong source status or double-fire)
 */
export async function startRewatch(
  repository: IUserMediaRepository,
  userMediaId: string,
): Promise<UserMedia | null> {
  return repository.startRewatch(userMediaId);
}
