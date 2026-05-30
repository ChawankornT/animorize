import type { IUserMediaRepository } from '@/repositories/interfaces/IUserMediaRepository';

/**
 * Removes a media entry from the user's library.
 * @param repository - UserMedia repository
 * @param id - user_media.id to remove
 */
export async function removeFromLibrary(
  repository: IUserMediaRepository,
  id: string,
): Promise<void> {
  return repository.remove(id);
}
