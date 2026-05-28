import type { IMediaProviderRepository } from '@/repositories/interfaces/IMediaProviderRepository';

/**
 * Removes a provider assignment from a media entry.
 * @param repository - MediaProvider repository implementation
 * @param id - UUID of the media_providers row to delete
 */
export async function removeProvider(
  repository: IMediaProviderRepository,
  id: string,
): Promise<void> {
  return repository.delete(id);
}
