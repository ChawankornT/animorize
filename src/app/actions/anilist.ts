'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod/v4';
import { createClient } from '@/lib/supabase/server';
import { createMediaRepository, createSyncLogRepository } from '@/repositories';
import { fetchAnilistMedia } from '@/lib/anilist/api';
import { mapAnilistToMedia } from '@/lib/anilist/mapper';
import { importMedia } from '@/domain/usecases/ImportMedia';
import { retrySync } from '@/domain/usecases/RetrySync';
import type { CreateMediaInput } from '@/domain/entities/Media';

export type AnilistPreviewState = {
  message?: string;
  data?: CreateMediaInput & { anilistId: number };
};

export type SaveImportState = {
  message?: string;
  savedMediaId?: string;
};

export type RetrySyncState = {
  message?: string;
  success?: boolean;
};

// ─── fetchAnilistPreviewAction ────────────────────────────────────────────────

const previewSchema = z.object({
  anilistId: z.coerce.number().int().positive(),
});

export async function fetchAnilistPreviewAction(
  _prev: AnilistPreviewState,
  formData: FormData,
): Promise<AnilistPreviewState> {
  const parsed = previewSchema.safeParse({ anilistId: formData.get('anilistId') });
  if (!parsed.success) {
    return { message: 'AniList ID must be a positive integer' };
  }

  const { anilistId } = parsed.data;

  try {
    const supabase = await createClient();
    const mediaRepo = createMediaRepository(supabase);

    const existing = await mediaRepo.findByAnilistId(anilistId);
    if (existing) {
      return { message: 'Media with this AniList ID already exists' };
    }

    const response = await fetchAnilistMedia(anilistId);
    const data = mapAnilistToMedia(response);
    return { data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch from AniList';
    return { message: msg };
  }
}

// ─── saveImportAction ─────────────────────────────────────────────────────────

const saveSchema = z.object({
  anilistId: z.coerce.number().int().positive(),
  franchiseId: z.string().uuid().optional().or(z.literal('')),
  titleTh: z.string().optional().or(z.literal('')),
  synopsis: z.string().optional().or(z.literal('')),
  titleRomaji: z.string().optional().or(z.literal('')),
  titleEn: z.string().optional().or(z.literal('')),
  posterUrl: z.string().optional().or(z.literal('')),
  totalEpisodes: z.coerce.number().int().min(0).optional(),
  airingStatus: z.enum(['ongoing', 'finished', 'upcoming']).default('upcoming'),
  genres: z.string().optional(),
  seasonQuarter: z.coerce.number().int().min(1).max(4).optional(),
  seasonYear: z.coerce.number().int().min(1900).max(2100).optional(),
  airDateStart: z.string().optional().or(z.literal('')),
  airDateEnd: z.string().optional().or(z.literal('')),
  mediaType: z.enum(['anime', 'series', 'movie', 'ova', 'special']).default('anime'),
  autoSync: z.preprocess((v) => v === 'true' || v === 'on', z.boolean()).default(false),
});

export async function saveImportAction(
  _prev: SaveImportState,
  formData: FormData,
): Promise<SaveImportState> {
  const parsed = saveSchema.safeParse({
    anilistId: formData.get('anilistId'),
    franchiseId: formData.get('franchiseId') ?? '',
    titleTh: formData.get('titleTh') ?? '',
    synopsis: formData.get('synopsis') ?? '',
    titleRomaji: formData.get('titleRomaji') ?? '',
    titleEn: formData.get('titleEn') ?? '',
    posterUrl: formData.get('posterUrl') ?? '',
    totalEpisodes: formData.get('totalEpisodes') || undefined,
    airingStatus: formData.get('airingStatus') ?? 'upcoming',
    genres: formData.get('genres') ?? '',
    seasonQuarter: formData.get('seasonQuarter') || undefined,
    seasonYear: formData.get('seasonYear') || undefined,
    airDateStart: formData.get('airDateStart') ?? '',
    airDateEnd: formData.get('airDateEnd') ?? '',
    mediaType: formData.get('mediaType') ?? 'anime',
    autoSync: formData.get('autoSync'),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues.map((i) => i.message).join('; ') };
  }

  const d = parsed.data;

  try {
    const supabase = await createClient();
    const mediaRepo = createMediaRepository(supabase);
    const syncLogRepo = createSyncLogRepository(supabase);

    const input: CreateMediaInput & { anilistId: number } = {
      anilistId: d.anilistId,
      franchiseId: d.franchiseId || null,
      mediaType: d.mediaType,
      titleTh: d.titleTh || null,
      titleEn: d.titleEn || null,
      titleRomaji: d.titleRomaji || null,
      synopsis: d.synopsis || null,
      posterUrl: d.posterUrl || null,
      genres: d.genres?.split(',').map((s) => s.trim()).filter(Boolean) ?? [],
      totalEpisodes: d.totalEpisodes ?? 1,
      seasonQuarter: d.seasonQuarter ?? null,
      seasonYear: d.seasonYear ?? null,
      airDateStart: d.airDateStart || null,
      airDateEnd: d.airDateEnd || null,
      airingStatus: d.airingStatus,
      autoSync: d.autoSync,
    };

    const media = await importMedia(mediaRepo, syncLogRepo, input);
    revalidatePath('/admin/media');
    return { savedMediaId: media.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save media';
    return { message: msg };
  }
}

// ─── retrySyncAction ──────────────────────────────────────────────────────────

const retrySchema = z.object({
  mediaId: z.string().uuid(),
});

export async function retrySyncAction(
  _prev: RetrySyncState,
  formData: FormData,
): Promise<RetrySyncState> {
  const parsed = retrySchema.safeParse({ mediaId: formData.get('mediaId') });
  if (!parsed.success) {
    return { message: 'Invalid media ID' };
  }

  const { mediaId } = parsed.data;

  try {
    const supabase = await createClient();
    const mediaRepo = createMediaRepository(supabase);
    const syncLogRepo = createSyncLogRepository(supabase);

    const media = await mediaRepo.findById(mediaId);
    if (!media) {
      return { message: 'Media not found' };
    }
    if (!media.anilistId) {
      return { message: 'No AniList ID linked to this media' };
    }

    const response = await fetchAnilistMedia(media.anilistId);
    const mapped = mapAnilistToMedia(response);

    await retrySync(mediaRepo, syncLogRepo, mediaId, {
      titleRomaji: mapped.titleRomaji,
      titleEn: mapped.titleEn,
      genres: mapped.genres,
      totalEpisodes: mapped.totalEpisodes,
      seasonQuarter: mapped.seasonQuarter,
      seasonYear: mapped.seasonYear,
      airDateStart: mapped.airDateStart,
      airDateEnd: mapped.airDateEnd,
      airingStatus: mapped.airingStatus,
    });

    revalidatePath('/admin/media');
    revalidatePath('/admin/sync-logs');
    return { success: true, message: 'Sync completed' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to sync';
    return { message: msg };
  }
}
