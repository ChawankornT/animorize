import type { IMediaRepository } from "@/repositories/interfaces/IMediaRepository";

/**
 * Deletes a media entry by ID.
 * Associated watchlogs and sync_logs are deleted via ON DELETE CASCADE.
 * @param repository - Media repository implementation
 * @param id - Media UUID to delete
 */
export async function deleteMedia(repository: IMediaRepository, id: string): Promise<void> {
  return repository.delete(id);
}
