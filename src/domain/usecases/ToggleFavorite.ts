import type { IUserMediaRepository } from '@/repositories/interfaces/IUserMediaRepository';
import type { UserMedia } from '@/domain/entities/UserMedia';

/**
 * Toggles the favorite flag of a user media entry.
 * @param repository - UserMedia repository
 * @param id - user_media.id
 * @param currentIsFavorite - current value to invert
 */
export async function toggleFavorite(
  repository: IUserMediaRepository,
  id: string,
  currentIsFavorite: boolean,
): Promise<UserMedia> {
  return repository.updateFavorite(id, !currentIsFavorite);
}
