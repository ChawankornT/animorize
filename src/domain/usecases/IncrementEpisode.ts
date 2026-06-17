import type {
  IUserMediaRepository,
  IncrementEpisodeResult,
} from "@/repositories/interfaces/IUserMediaRepository";

/**
 * Atomically increments the episode counter via CAS RPC.
 * Business rules (enforced in DB function — documented exception §P4 1.1):
 * - CAS guard: current_episode must equal fromEpisode (stale → no-op)
 * - Auto-status: sets 'watching' (or 'completed' if at total and not ongoing)
 * - Watchlog insert is atomic with the episode update
 * @returns IncrementEpisodeResult — 'updated' with new state, or 'stale' if CAS missed
 */
export async function incrementEpisode(
  repository: IUserMediaRepository,
  userMediaId: string,
  fromEpisode: number,
): Promise<IncrementEpisodeResult> {
  return repository.incrementEpisode(userMediaId, fromEpisode);
}
