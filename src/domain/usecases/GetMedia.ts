import type { IMediaRepository } from "@/repositories/interfaces/IMediaRepository";
import type { Media } from "@/domain/entities/Media";

/**
 * Retrieves a single media entry by ID.
 * @param repository - Media repository implementation
 * @param id - Media UUID
 * @returns Media entity or null if not found
 */
export async function getMedia(repository: IMediaRepository, id: string): Promise<Media | null> {
  return repository.findById(id);
}
