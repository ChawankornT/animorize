import type { IFranchiseRepository } from '@/repositories/interfaces/IFranchiseRepository';
import type { Franchise } from '@/domain/entities/Franchise';

/**
 * Returns all franchises, ordered by title_en.
 * @param repository - Franchise repository implementation
 * @param options.search - Optional search term; matches against titleTh, titleEn, or titleRomaji (case-insensitive)
 * @returns Array of Franchise entities (empty array if none exist)
 */
export async function listFranchises(
  repository: IFranchiseRepository,
  options?: { search?: string },
): Promise<Franchise[]> {
  return repository.findAll(options);
}
