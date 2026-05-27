import type { Database } from '@/types/database';
import type { Provider, CreateProviderInput, UpdateProviderInput } from '@/domain/entities/Provider';
import type { Franchise, CreateFranchiseInput, UpdateFranchiseInput } from '@/domain/entities/Franchise';
import type { Media, CreateMediaInput, UpdateMediaInput } from '@/domain/entities/Media';
import type { SyncLog, CreateSyncLogInput } from '@/domain/entities/SyncLog';
import type { SystemSettings } from '@/domain/entities/SystemSettings';

type ProviderRow = Database['public']['Tables']['providers']['Row'];
type FranchiseRow = Database['public']['Tables']['franchises']['Row'];
type MediaRow = Database['public']['Tables']['media']['Row'];
type SyncLogRow = Database['public']['Tables']['sync_logs']['Row'];
type SystemSettingsRow = Database['public']['Tables']['system_settings']['Row'];

// ─── To entity (DB row → domain entity) ──────────────────────────────────────

export function toProvider(row: ProviderRow): Provider {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    color: row.color,
    logoUrl: row.logo_url,
    baseUrl: row.base_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toFranchise(row: FranchiseRow): Franchise {
  return {
    id: row.id,
    titleTh: row.title_th,
    titleEn: row.title_en,
    titleRomaji: row.title_romaji,
    posterUrl: row.poster_url,
    synopsis: row.synopsis,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toMedia(row: MediaRow): Media {
  return {
    id: row.id,
    franchiseId: row.franchise_id,
    anilistId: row.anilist_id,
    mediaType: row.media_type,
    titleTh: row.title_th,
    titleEn: row.title_en,
    titleRomaji: row.title_romaji,
    synopsis: row.synopsis,
    posterUrl: row.poster_url,
    genres: row.genres,
    totalEpisodes: row.total_episodes,
    seasonQuarter: row.season_quarter,
    seasonYear: row.season_year,
    airDateStart: row.air_date_start,
    airDateEnd: row.air_date_end,
    airingStatus: row.airing_status,
    autoSync: row.auto_sync,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toSyncLog(row: SyncLogRow): SyncLog {
  return {
    id: row.id,
    mediaId: row.media_id,
    result: row.result,
    errorMessage: row.error_message,
    syncedAt: row.synced_at,
  };
}

export function toSystemSettings(row: SystemSettingsRow): SystemSettings {
  return {
    autoSyncEnabled: row.auto_sync_enabled,
    updatedAt: row.updated_at,
  };
}

// ─── From input (domain input → DB insert/update) ────────────────────────────

export function fromCreateProviderInput(
  input: CreateProviderInput,
): Database['public']['Tables']['providers']['Insert'] {
  return {
    name: input.name,
    slug: input.slug,
    color: input.color,
    logo_url: input.logoUrl ?? null,
    base_url: input.baseUrl ?? null,
  };
}

export function fromUpdateProviderInput(
  input: UpdateProviderInput,
): Database['public']['Tables']['providers']['Update'] {
  const result: Database['public']['Tables']['providers']['Update'] = {};
  if (input.name !== undefined) result.name = input.name;
  if (input.slug !== undefined) result.slug = input.slug;
  if (input.color !== undefined) result.color = input.color;
  if (input.logoUrl !== undefined) result.logo_url = input.logoUrl;
  if (input.baseUrl !== undefined) result.base_url = input.baseUrl;
  return result;
}

export function fromCreateFranchiseInput(
  input: CreateFranchiseInput,
): Database['public']['Tables']['franchises']['Insert'] {
  return {
    title_th: input.titleTh ?? null,
    title_en: input.titleEn ?? null,
    title_romaji: input.titleRomaji ?? null,
    poster_url: input.posterUrl ?? null,
    synopsis: input.synopsis ?? null,
  };
}

export function fromUpdateFranchiseInput(
  input: UpdateFranchiseInput,
): Database['public']['Tables']['franchises']['Update'] {
  const result: Database['public']['Tables']['franchises']['Update'] = {};
  if (input.titleTh !== undefined) result.title_th = input.titleTh;
  if (input.titleEn !== undefined) result.title_en = input.titleEn;
  if (input.titleRomaji !== undefined) result.title_romaji = input.titleRomaji;
  if (input.posterUrl !== undefined) result.poster_url = input.posterUrl;
  if (input.synopsis !== undefined) result.synopsis = input.synopsis;
  return result;
}

export function fromCreateMediaInput(
  input: CreateMediaInput,
): Database['public']['Tables']['media']['Insert'] {
  return {
    franchise_id: input.franchiseId ?? null,
    anilist_id: input.anilistId ?? null,
    media_type: input.mediaType,
    title_th: input.titleTh ?? null,
    title_en: input.titleEn ?? null,
    title_romaji: input.titleRomaji ?? null,
    synopsis: input.synopsis ?? null,
    poster_url: input.posterUrl ?? null,
    genres: input.genres ?? [],
    total_episodes: input.totalEpisodes ?? 1,
    season_quarter: input.seasonQuarter ?? null,
    season_year: input.seasonYear ?? null,
    air_date_start: input.airDateStart ?? null,
    air_date_end: input.airDateEnd ?? null,
    airing_status: input.airingStatus ?? 'upcoming',
    auto_sync: input.autoSync ?? true,
    sort_order: input.sortOrder ?? 0,
  };
}

export function fromUpdateMediaInput(
  input: UpdateMediaInput,
): Database['public']['Tables']['media']['Update'] {
  const result: Database['public']['Tables']['media']['Update'] = {};
  if (input.franchiseId !== undefined) result.franchise_id = input.franchiseId;
  if (input.anilistId !== undefined) result.anilist_id = input.anilistId;
  if (input.mediaType !== undefined) result.media_type = input.mediaType;
  if (input.titleTh !== undefined) result.title_th = input.titleTh;
  if (input.titleEn !== undefined) result.title_en = input.titleEn;
  if (input.titleRomaji !== undefined) result.title_romaji = input.titleRomaji;
  if (input.synopsis !== undefined) result.synopsis = input.synopsis;
  if (input.posterUrl !== undefined) result.poster_url = input.posterUrl;
  if (input.genres !== undefined) result.genres = input.genres;
  if (input.totalEpisodes !== undefined) result.total_episodes = input.totalEpisodes;
  if (input.seasonQuarter !== undefined) result.season_quarter = input.seasonQuarter;
  if (input.seasonYear !== undefined) result.season_year = input.seasonYear;
  if (input.airDateStart !== undefined) result.air_date_start = input.airDateStart;
  if (input.airDateEnd !== undefined) result.air_date_end = input.airDateEnd;
  if (input.airingStatus !== undefined) result.airing_status = input.airingStatus;
  if (input.autoSync !== undefined) result.auto_sync = input.autoSync;
  if (input.sortOrder !== undefined) result.sort_order = input.sortOrder;
  return result;
}

export function fromCreateSyncLogInput(
  input: CreateSyncLogInput,
): Database['public']['Tables']['sync_logs']['Insert'] {
  return {
    media_id: input.mediaId,
    result: input.result,
    error_message: input.errorMessage ?? null,
  };
}
