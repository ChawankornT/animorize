import type { IUserMediaRepository } from "@/repositories/interfaces/IUserMediaRepository";
import type { UserMedia } from "@/domain/entities/UserMedia";

/**
 * Resets a movie/special back to unwatched state (§P4 1.5).
 * - Sets current_episode=0, status='plan_to_watch', clears started_at/completed_at
 * - Does not delete watchlogs (the watch event is historical fact)
 */
export async function unmarkWatched(
  repository: IUserMediaRepository,
  userMediaId: string,
): Promise<UserMedia> {
  return repository.unmarkWatched(userMediaId);
}
