import type { IFranchiseRepository } from "@/repositories/interfaces/IFranchiseRepository";

/**
 * Deletes a franchise by ID.
 * Media that belongs to this franchise will have their franchise_id set to NULL (ON DELETE SET NULL).
 * @param repository - Franchise repository implementation
 * @param id - Franchise UUID to delete
 */
export async function deleteFranchise(repository: IFranchiseRepository, id: string): Promise<void> {
  return repository.delete(id);
}
