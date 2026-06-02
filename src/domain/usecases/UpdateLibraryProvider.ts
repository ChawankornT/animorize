import type {
  IUserMediaRepository,
  UpdateProviderInput,
} from "@/repositories/interfaces/IUserMediaRepository";
import type { UserMedia } from "@/domain/entities/UserMedia";

/**
 * Updates the provider, audio, and custom URL for a user's library entry.
 * @param repository - UserMedia repository implementation
 * @param id - UUID of the user_media row
 * @param input - New provider settings (providerId, audio, customUrl)
 * @returns Updated UserMedia entity
 */
export async function updateLibraryProvider(
  repository: IUserMediaRepository,
  id: string,
  input: UpdateProviderInput,
): Promise<UserMedia> {
  return repository.updateProvider(id, input);
}
