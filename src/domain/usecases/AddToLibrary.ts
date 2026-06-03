import type { IUserMediaRepository } from "@/repositories/interfaces/IUserMediaRepository";
import type { UserMedia, AddToLibraryInput } from "@/domain/entities/UserMedia";

export class DuplicateLibraryEntryError extends Error {
  readonly code = "DUPLICATE" as const;
  constructor() {
    super("This media is already in your library");
  }
}

/**
 * Adds a media entry to the user's library.
 * Business rules:
 * - Each (user, media) pair must be unique — duplicate throws DuplicateLibraryEntryError
 * - Default status is 'plan_to_watch' if not specified
 * - currentEpisode defaults to 0, isFavorite defaults to false (enforced in mapper)
 * @throws {DuplicateLibraryEntryError} If the media is already in the user's library
 */
export async function addToLibrary(
  repository: IUserMediaRepository,
  input: AddToLibraryInput,
): Promise<UserMedia> {
  const existing = await repository.findByUserAndMedia(input.userId, input.mediaId);
  if (existing) {
    throw new DuplicateLibraryEntryError();
  }
  return repository.add(input);
}
