import type { IProviderRepository } from "@/repositories/interfaces/IProviderRepository";
import {
  validateProvider,
  type CreateProviderInput,
  type Provider,
} from "@/domain/entities/Provider";

/**
 * Creates a new streaming provider.
 * @param repository - Provider repository implementation
 * @param input - Provider data; name and slug are required, color must be hex (#rrggbb)
 * @returns The created Provider entity
 * @throws If name is empty, slug contains invalid characters, or color is not a valid hex color
 */
export async function createProvider(
  repository: IProviderRepository,
  input: CreateProviderInput,
): Promise<Provider> {
  validateProvider(input);
  return repository.create(input);
}
