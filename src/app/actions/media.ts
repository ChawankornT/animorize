'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { z } from 'zod/v4';
import { createClient } from '@/lib/supabase/server';
import { createMediaRepository } from '@/repositories';
import { createMedia } from '@/domain/usecases/CreateMedia';
import { updateMedia } from '@/domain/usecases/UpdateMedia';
import { deleteMedia } from '@/domain/usecases/DeleteMedia';

export type MediaActionState = {
  message?: string;
  rootError?: string;
  errors?: {
    franchiseId?: string[];
    mediaType?: string[];
    titleTh?: string[];
    titleEn?: string[];
    titleRomaji?: string[];
    synopsis?: string[];
    posterUrl?: string[];
    genres?: string[];
    totalEpisodes?: string[];
    seasonQuarter?: string[];
    seasonYear?: string[];
    airDateStart?: string[];
    airDateEnd?: string[];
    airingStatus?: string[];
  };
};

export type DeleteActionState = {
  error?: string;
};

function isValidUrl(v: string): boolean {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

const mediaSchema = z
  .object({
    franchiseId: z.string().uuid().optional().or(z.literal('')),
    mediaType: z.enum(['anime', 'series', 'movie', 'ova', 'special']),
    titleTh: z.string().optional().or(z.literal('')),
    titleEn: z.string().optional().or(z.literal('')),
    titleRomaji: z.string().optional().or(z.literal('')),
    synopsis: z.string().optional().or(z.literal('')),
    posterUrl: z.string().refine((v) => v === '' || isValidUrl(v), 'Must be a valid URL'),
    genres: z.string().optional(),
    totalEpisodes: z.coerce.number().int().min(0).optional(),
    seasonQuarter: z.coerce.number().int().min(1).max(4).optional(),
    seasonYear: z.coerce.number().int().min(1900).max(2100).optional(),
    airDateStart: z.string().optional().or(z.literal('')),
    airDateEnd: z.string().optional().or(z.literal('')),
    airingStatus: z.enum(['ongoing', 'finished', 'upcoming']).default('upcoming'),
    autoSync: z.coerce.boolean(),
    sortOrder: z.coerce.number().int().default(0),
  })
  .refine((data) => data.titleTh || data.titleEn || data.titleRomaji, {
    message: 'At least one title is required',
  });

const updateMediaSchema = mediaSchema.extend({ id: z.string().min(1) });

function parseResult(
  error: z.ZodError,
): Pick<MediaActionState, 'rootError' | 'errors'> {
  const fieldErrors: Record<string, string[]> = {};
  let rootError: string | undefined;
  for (const issue of error.issues) {
    if (issue.path.length === 0) {
      rootError = issue.message;
    } else {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
  }
  return { rootError, errors: fieldErrors as MediaActionState['errors'] };
}

function getFormInput(formData: FormData) {
  return {
    franchiseId: formData.get('franchiseId') ?? '',
    mediaType: formData.get('mediaType') ?? '',
    titleTh: formData.get('titleTh') ?? '',
    titleEn: formData.get('titleEn') ?? '',
    titleRomaji: formData.get('titleRomaji') ?? '',
    synopsis: formData.get('synopsis') ?? '',
    posterUrl: formData.get('posterUrl') ?? '',
    genres: formData.get('genres') ?? '',
    // '' → undefined so coerce.number().optional() gives undefined instead of 0
    totalEpisodes: formData.get('totalEpisodes') || undefined,
    seasonQuarter: formData.get('seasonQuarter') || undefined,
    seasonYear: formData.get('seasonYear') || undefined,
    airDateStart: formData.get('airDateStart') ?? '',
    airDateEnd: formData.get('airDateEnd') ?? '',
    airingStatus: formData.get('airingStatus') ?? 'upcoming',
    autoSync: formData.get('autoSync'),
    sortOrder: formData.get('sortOrder') ?? '0',
  };
}

function toUsecaseInput(data: z.infer<typeof mediaSchema>) {
  return {
    franchiseId: data.franchiseId || null,
    mediaType: data.mediaType,
    titleTh: data.titleTh || null,
    titleEn: data.titleEn || null,
    titleRomaji: data.titleRomaji || null,
    synopsis: data.synopsis || null,
    posterUrl: data.posterUrl || null,
    genres: data.genres?.split(',').map((s) => s.trim()).filter(Boolean) ?? [],
    totalEpisodes: data.totalEpisodes ?? 0,
    seasonQuarter: data.seasonQuarter ?? null,
    seasonYear: data.seasonYear ?? null,
    airDateStart: data.airDateStart || null,
    airDateEnd: data.airDateEnd || null,
    airingStatus: data.airingStatus,
    autoSync: data.autoSync,
    sortOrder: data.sortOrder,
  };
}

export async function createMediaAction(
  _prev: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const parsed = mediaSchema.safeParse(getFormInput(formData));
  if (!parsed.success) return parseResult(parsed.error);

  try {
    const supabase = await createClient();
    const repo = createMediaRepository(supabase);
    await createMedia(repo, toUsecaseInput(parsed.data));
    revalidatePath('/admin/media');
    redirect('/admin/media');
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const msg = err instanceof Error ? err.message : 'Failed to create media';
    return { message: msg };
  }
}

export async function updateMediaAction(
  _prev: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const parsed = updateMediaSchema.safeParse({
    id: formData.get('id') ?? '',
    ...getFormInput(formData),
  });
  if (!parsed.success) return parseResult(parsed.error);

  try {
    const supabase = await createClient();
    const repo = createMediaRepository(supabase);
    await updateMedia(repo, parsed.data.id, toUsecaseInput(parsed.data));
    revalidatePath('/admin/media');
    redirect('/admin/media');
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const msg = err instanceof Error ? err.message : 'Failed to update media';
    return { message: msg };
  }
}

// Required second param: Next.js server action bind() pattern — FormData is passed but not needed
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteMediaAction(id: string, _: FormData): Promise<DeleteActionState> {
  try {
    const supabase = await createClient();
    const repo = createMediaRepository(supabase);
    await deleteMedia(repo, id);
    revalidatePath('/admin/media');
    redirect('/admin/media');
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('foreign key') || msg.includes('violates')) {
      return { error: 'Cannot delete: this media has user entries' };
    }
    return { error: 'Failed to delete media' };
  }
}
