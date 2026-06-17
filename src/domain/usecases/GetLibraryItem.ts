import type { IUserMediaRepository } from "@/repositories/interfaces/IUserMediaRepository";
import type { UserMediaWithMedia } from "@/domain/entities/UserMedia";

/**
 * Fetches a single library item with its media details (title, poster, provider, etc.).
 * Used by the detail page to render progress controls.
 * @returns UserMediaWithMedia or null if not in the user's library
 */
export async function getLibraryItem(
  repository: IUserMediaRepository,
  userId: string,
  mediaId: string,
): Promise<UserMediaWithMedia | null> {
  return repository.findWithMediaByUserAndMedia(userId, mediaId);
}
