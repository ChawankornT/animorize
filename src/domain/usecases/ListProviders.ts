import type { IProviderRepository } from "@/repositories/interfaces/IProviderRepository";
import type { Provider } from "@/domain/entities/Provider";

/**
 * Returns all streaming providers, ordered by name.
 * @param repository - Provider repository implementation
 * @returns Array of Provider entities (empty array if none exist)
 */
export async function listProviders(repository: IProviderRepository): Promise<Provider[]> {
  return repository.findAll();
}
