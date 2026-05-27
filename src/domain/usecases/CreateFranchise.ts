import type { IFranchiseRepository } from '@/repositories/interfaces/IFranchiseRepository';
import { validateFranchise, type CreateFranchiseInput, type Franchise } from '@/domain/entities/Franchise';

/**
 * Creates a new franchise (series grouping container).
 * @param repository - Franchise repository implementation
 * @param input - Franchise data; at least one of titleTh, titleEn, or titleRomaji is required
 * @returns The created Franchise entity
 * @throws If no title is provided
 */
export async function createFranchise(
  repository: IFranchiseRepository,
  input: CreateFranchiseInput,
): Promise<Franchise> {
  validateFranchise(input);
  return repository.create(input);
}
