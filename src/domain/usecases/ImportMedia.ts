import type { IMediaRepository } from "@/repositories/interfaces/IMediaRepository";
import type { ISyncLogRepository } from "@/repositories/interfaces/ISyncLogRepository";
import type { CreateMediaInput, Media } from "@/domain/entities/Media";

/**
 * Imports a new media entry from AniList pre-mapped data.
 * Does NOT fetch from AniList — that happens in the action layer.
 *
 * @param mediaRepo - IMediaRepository
 * @param syncLogRepo - ISyncLogRepository
 * @param input - Mapped media data including anilistId
 * @returns Created Media entity
 * @throws If anilistId already exists, or if media creation fails
 *
 * Sync log behavior:
 * - Duplicate check failure: throws plain (no media exists to log against)
 * - Media create failure: throws without log (no mediaId available)
 * - Success log failure: writes failed log, then re-throws
 */
export async function importMedia(
  mediaRepo: IMediaRepository,
  syncLogRepo: ISyncLogRepository,
  input: CreateMediaInput & { anilistId: number },
): Promise<Media> {
  const existing = await mediaRepo.findByAnilistId(input.anilistId);
  if (existing) {
    throw new Error(`Media with AniList ID ${input.anilistId} already exists`);
  }

  const media = await mediaRepo.create(input);

  try {
    await syncLogRepo.create({ mediaId: media.id, result: "success" });
  } catch (logErr) {
    try {
      await syncLogRepo.create({
        mediaId: media.id,
        result: "failed",
        errorMessage: logErr instanceof Error ? logErr.message : "Failed to write success log",
      });
    } catch {
      // best-effort
    }
    throw logErr;
  }

  return media;
}
