import type { IUserMediaRepository } from '@/repositories/interfaces/IUserMediaRepository';
import type { UserMediaWithMedia } from '@/domain/entities/UserMedia';
import { isDashboardItem } from '@/domain/entities/UserMedia';

/**
 * Lists all media in the user's library.
 * @param repository - UserMedia repository
 * @param userId - authenticated user ID
 * @param filter - 'all' returns full library; 'dashboard' returns only watching + favorites
 */
export async function listUserLibrary(
  repository: IUserMediaRepository,
  userId: string,
  filter: 'all' | 'dashboard' = 'all',
): Promise<UserMediaWithMedia[]> {
  const all = await repository.findByUserId(userId);
  if (filter === 'dashboard') {
    return all.filter(isDashboardItem);
  }
  return all;
}
