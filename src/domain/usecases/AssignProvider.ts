import type { IMediaProviderRepository } from "@/repositories/interfaces/IMediaProviderRepository";
import type { MediaProvider, CreateMediaProviderInput } from "@/domain/entities/MediaProvider";

/**
 * Assigns a provider to a media entry.
 * @param repository - MediaProvider repository implementation
 * @param input - Assignment data: mediaId, providerId, audio, optional baseUrl
 * @returns The created MediaProvider entity
 * @throws If the provider+audio combination already exists for this media (unique constraint)
 */
export async function assignProvider(
  repository: IMediaProviderRepository,
  input: CreateMediaProviderInput,
): Promise<MediaProvider> {
  return repository.create(input);
}
