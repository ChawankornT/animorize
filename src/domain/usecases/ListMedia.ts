import type { IMediaRepository } from '@/repositories/interfaces/IMediaRepository';
import type { Media, MediaType, AiringStatus } from '@/domain/entities/Media';

/**
 * Returns all media entries, ordered by sort_order.
 * @param repository - Media repository implementation
 * @param options.franchiseId - Filter by franchise UUID
 * @param options.mediaType - Filter by media type (anime, series, movie, ova, special)
 * @param options.airingStatus - Filter by airing status (ongoing, finished, upcoming)
 * @returns Array of Media entities (empty array if none match)
 */
export async function listMedia(
  repository: IMediaRepository,
  options?: {
    franchiseId?: string;
    mediaType?: MediaType;
    airingStatus?: AiringStatus;
    search?: string;
  },
): Promise<Media[]> {
  return repository.findAll(options);
}
