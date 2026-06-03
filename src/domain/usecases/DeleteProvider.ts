import type { IProviderRepository } from "@/repositories/interfaces/IProviderRepository";

/**
 * Deletes a streaming provider by ID.
 * @param repository - Provider repository implementation
 * @param id - Provider UUID to delete
 * @throws If the DB operation fails (e.g. FK constraint from media_providers)
 */
export async function deleteProvider(repository: IProviderRepository, id: string): Promise<void> {
  return repository.delete(id);
}
