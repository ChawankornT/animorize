import type { IFranchiseRepository } from '@/repositories/interfaces/IFranchiseRepository';
import { validateFranchise, type UpdateFranchiseInput, type Franchise } from '@/domain/entities/Franchise';

/**
 * Updates an existing franchise.
 * Validates that the merged result (existing + input) still has at least one title.
 * @param repository - Franchise repository implementation
 * @param id - Franchise UUID to update
 * @param input - Fields to update; partial, all optional
 * @returns The updated Franchise entity
 * @throws If franchise is not found, or if the update would leave the franchise with no titles
 */
export async function updateFranchise(
  repository: IFranchiseRepository,
  id: string,
  input: UpdateFranchiseInput,
): Promise<Franchise> {
  const existing = await repository.findById(id);
  if (!existing) throw new Error(`Franchise not found: ${id}`);

  const merged = { ...existing, ...input };
  validateFranchise(merged);

  return repository.update(id, input);
}
