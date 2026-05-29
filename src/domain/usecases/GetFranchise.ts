import type { IFranchiseRepository } from '@/repositories/interfaces/IFranchiseRepository';
import type { Franchise } from '@/domain/entities/Franchise';

/**
 * Retrieves a single franchise by ID.
 * @param repository - Franchise repository implementation
 * @param id - Franchise UUID
 * @returns Franchise entity or null if not found
 */
export async function getFranchise(
  repository: IFranchiseRepository,
  id: string,
): Promise<Franchise | null> {
  return repository.findById(id);
}
