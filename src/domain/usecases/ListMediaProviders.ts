import type { IMediaProviderRepository } from '@/repositories/interfaces/IMediaProviderRepository';
import type { MediaProvider } from '@/domain/entities/MediaProvider';

/**
 * Returns all provider assignments for a given media entry.
 * @param repository - MediaProvider repository implementation
 * @param mediaId - UUID of the media to look up
 * @returns Array of MediaProvider entities with joined provider name and color
 */
export async function listMediaProviders(
  repository: IMediaProviderRepository,
  mediaId: string,
): Promise<MediaProvider[]> {
  return repository.findByMediaId(mediaId);
}
