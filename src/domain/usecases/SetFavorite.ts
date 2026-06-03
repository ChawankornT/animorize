import type { IUserMediaRepository } from "@/repositories/interfaces/IUserMediaRepository";
import type { UserMedia } from "@/domain/entities/UserMedia";

/** Sets the favorite flag to an explicit value (idempotent — fits optimistic UI). */
export async function setFavorite(
  repository: IUserMediaRepository,
  id: string,
  isFavorite: boolean,
): Promise<UserMedia> {
  return repository.updateFavorite(id, isFavorite);
}
