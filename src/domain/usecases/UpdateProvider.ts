import type { IProviderRepository } from "@/repositories/interfaces/IProviderRepository";
import {
  validateProvider,
  type UpdateProviderInput,
  type Provider,
} from "@/domain/entities/Provider";

/**
 * Updates an existing streaming provider.
 * @param repository - Provider repository implementation
 * @param id - Provider UUID to update
 * @param input - Fields to update; all optional but any provided value must pass validation
 * @returns The updated Provider entity
 * @throws If provider is not found, name is empty, slug is invalid, or color is not hex
 */
export async function updateProvider(
  repository: IProviderRepository,
  id: string,
  input: UpdateProviderInput,
): Promise<Provider> {
  validateProvider(input);
  return repository.update(id, input);
}
