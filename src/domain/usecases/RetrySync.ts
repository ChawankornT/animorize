import type { IMediaRepository } from '@/repositories/interfaces/IMediaRepository';
import type { ISyncLogRepository } from '@/repositories/interfaces/ISyncLogRepository';
import type { UpdateMediaInput, Media } from '@/domain/entities/Media';

/** Fields admin-managed — never overwritten by sync. */
const PROTECTED: (keyof UpdateMediaInput)[] = ['titleTh', 'synopsis', 'posterUrl'];

/**
 * Retries sync for a media entry using pre-mapped AniList data.
 * Does NOT fetch from AniList — that happens in the action layer.
 *
 * @param mediaRepo - IMediaRepository
 * @param syncLogRepo - ISyncLogRepository
 * @param mediaId - ID of the media to update
 * @param updateInput - Mapped update data from AniList (protected fields are stripped)
 * @returns Updated Media entity
 * @throws If update fails (after writing failed sync_log)
 */
export async function retrySync(
  mediaRepo: IMediaRepository,
  syncLogRepo: ISyncLogRepository,
  mediaId: string,
  updateInput: Partial<UpdateMediaInput>,
): Promise<Media> {
  const safeInput = { ...updateInput };
  for (const field of PROTECTED) {
    delete safeInput[field];
  }

  try {
    const media = await mediaRepo.update(mediaId, safeInput);
    await syncLogRepo.create({ mediaId, result: 'success' });
    return media;
  } catch (err) {
    try {
      await syncLogRepo.create({
        mediaId,
        result: 'failed',
        errorMessage: err instanceof Error ? err.message : 'Sync failed',
      });
    } catch {
      // best-effort
    }
    throw err;
  }
}
