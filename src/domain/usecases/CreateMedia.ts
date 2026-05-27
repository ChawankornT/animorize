import type { IMediaRepository } from '@/repositories/interfaces/IMediaRepository';
import { validateMedia, type CreateMediaInput, type Media } from '@/domain/entities/Media';

/**
 * Creates a new media entry.
 * Business rules enforced:
 * - At least one title (titleTh, titleEn, or titleRomaji) is required
 * - movie and special media always have totalEpisodes = 1 (enforced automatically)
 * @param repository - Media repository implementation
 * @param input - Media data; mediaType is required, at least one title is required
 * @returns The created Media entity
 * @throws If no title is provided
 */
export async function createMedia(
  repository: IMediaRepository,
  input: CreateMediaInput,
): Promise<Media> {
  const normalizedInput: CreateMediaInput =
    input.mediaType === 'movie' || input.mediaType === 'special'
      ? { ...input, totalEpisodes: 1 }
      : input;

  validateMedia(normalizedInput);
  return repository.create(normalizedInput);
}
