import type { IProviderRepository } from "@/repositories/interfaces/IProviderRepository";
import type { Provider } from "@/domain/entities/Provider";

/**
 * Retrieves a single provider by ID.
 * @param repository - Provider repository implementation
 * @param id - Provider UUID
 * @returns Provider entity or null if not found
 */
export async function getProvider(
  repository: IProviderRepository,
  id: string,
): Promise<Provider | null> {
  return repository.findById(id);
}
