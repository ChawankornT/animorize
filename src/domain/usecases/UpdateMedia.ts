import type { IMediaRepository } from "@/repositories/interfaces/IMediaRepository";
import { validateMedia, type UpdateMediaInput, type Media } from "@/domain/entities/Media";

/**
 * Updates an existing media entry.
 * Business rules enforced:
 * - Merged result (existing + input) must still have at least one title
 * - If mediaType is changed to or remains movie/special, totalEpisodes is forced to 1
 * @param repository - Media repository implementation
 * @param id - Media UUID to update
 * @param input - Fields to update; all optional
 * @returns The updated Media entity
 * @throws If media is not found, or if the update would leave media with no titles
 */
export async function updateMedia(
  repository: IMediaRepository,
  id: string,
  input: UpdateMediaInput,
): Promise<Media> {
  const existing = await repository.findById(id);
  if (!existing) throw new Error(`Media not found: ${id}`);

  const effectiveType = input.mediaType ?? existing.mediaType;
  const normalizedInput: UpdateMediaInput =
    effectiveType === "movie" || effectiveType === "special"
      ? { ...input, totalEpisodes: 1 }
      : input;

  const merged = { ...existing, ...normalizedInput };
  validateMedia(merged);

  return repository.update(id, normalizedInput);
}
