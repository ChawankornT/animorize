import { describe, it, expect } from 'vitest';
import { toSyncLog, toProvider, toMedia, toFranchise, toUserMedia, toUserMediaWithMedia, fromAddToLibraryInput } from '@/repositories/supabase/mappers';
import type { Database } from '@/types/database';

type SyncLogRow = Database['public']['Tables']['sync_logs']['Row'];
type ProviderRow = Database['public']['Tables']['providers']['Row'];
type MediaRow = Database['public']['Tables']['media']['Row'];
type FranchiseRow = Database['public']['Tables']['franchises']['Row'];

function makeSyncLogRow(overrides: Partial<SyncLogRow> = {}): SyncLogRow {
  return {
    id: 'log-1',
    media_id: 'media-1',
    result: 'success',
    error_message: null,
    synced_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeMediaRow(overrides: Partial<MediaRow> = {}): MediaRow {
  return {
    id: 'media-1',
    franchise_id: null,
    anilist_id: null,
    media_type: 'anime',
    title_th: null,
    title_en: 'Test Media',
    title_romaji: null,
    synopsis: null,
    poster_url: null,
    genres: [],
    total_episodes: 12,
    season_quarter: null,
    season_year: null,
    air_date_start: null,
    air_date_end: null,
    airing_status: 'ongoing',
    auto_sync: true,
    sort_order: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('toSyncLog', () => {
  it('uses EN-first order: prefers title_en over title_romaji', () => {
    const row = {
      ...makeSyncLogRow(),
      media: { title_en: 'English', title_romaji: 'Romaji', title_th: 'TH' },
    };
    const result = toSyncLog(row);
    expect(result.mediaTitle).toBe('English');
  });

  it('falls back to title_romaji when title_en is null', () => {
    const row = {
      ...makeSyncLogRow(),
      media: { title_en: null, title_romaji: 'Romaji', title_th: 'TH' },
    };
    const result = toSyncLog(row);
    expect(result.mediaTitle).toBe('Romaji');
  });

  it('falls back to title_th when title_en and title_romaji are null', () => {
    const row = {
      ...makeSyncLogRow(),
      media: { title_en: null, title_romaji: null, title_th: 'TH' },
    };
    const result = toSyncLog(row);
    expect(result.mediaTitle).toBe('TH');
  });

  it('returns undefined mediaTitle when media join is null', () => {
    const row = { ...makeSyncLogRow(), media: null };
    const result = toSyncLog(row);
    expect(result.mediaTitle).toBeUndefined();
  });

  it('returns undefined mediaTitle when media join is absent', () => {
    const row = makeSyncLogRow();
    const result = toSyncLog(row);
    expect(result.mediaTitle).toBeUndefined();
  });

  it('maps result and errorMessage correctly', () => {
    const row = {
      ...makeSyncLogRow({ result: 'failed', error_message: 'Connection timeout' }),
      media: null,
    };
    const result = toSyncLog(row);
    expect(result.result).toBe('failed');
    expect(result.errorMessage).toBe('Connection timeout');
  });
});

describe('toProvider', () => {
  it('maps all fields from snake_case to camelCase', () => {
    const row: ProviderRow = {
      id: 'prov-1',
      name: 'Bilibili',
      slug: 'bilibili',
      color: '#FF6600',
      logo_url: 'https://example.com/logo.png',
      base_url: 'https://bilibili.com',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    const result = toProvider(row);
    expect(result).toEqual({
      id: 'prov-1',
      name: 'Bilibili',
      slug: 'bilibili',
      color: '#FF6600',
      logoUrl: 'https://example.com/logo.png',
      baseUrl: 'https://bilibili.com',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
  });
});

describe('toMedia', () => {
  it('maps all fields from snake_case to camelCase', () => {
    const row = makeMediaRow({
      franchise_id: 'fran-1',
      anilist_id: 12345,
      title_th: 'TH',
      title_romaji: 'Romaji',
      genres: ['Action', 'Drama'],
      season_quarter: 2,
      season_year: 2024,
    });
    const result = toMedia(row);
    expect(result.franchiseId).toBe('fran-1');
    expect(result.anilistId).toBe(12345);
    expect(result.titleTh).toBe('TH');
    expect(result.titleRomaji).toBe('Romaji');
    expect(result.genres).toEqual(['Action', 'Drama']);
    expect(result.seasonQuarter).toBe(2);
    expect(result.seasonYear).toBe(2024);
  });
});

describe('toFranchise', () => {
  it('maps all fields from snake_case to camelCase', () => {
    const row: FranchiseRow = {
      id: 'fran-1',
      title_th: 'TH',
      title_en: 'EN',
      title_romaji: 'Romaji',
      poster_url: null,
      synopsis: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    const result = toFranchise(row);
    expect(result.titleTh).toBe('TH');
    expect(result.titleEn).toBe('EN');
    expect(result.titleRomaji).toBe('Romaji');
  });
});

type UserMediaRow = Database['public']['Tables']['user_media']['Row'];

function makeUserMediaRow(overrides: Partial<UserMediaRow> = {}): UserMediaRow {
  return {
    id: 'um-1',
    user_id: 'user-1',
    media_id: 'media-1',
    provider_id: null,
    audio: 'sub',
    status: 'plan_to_watch',
    current_episode: 0,
    is_favorite: false,
    custom_url: null,
    started_at: null,
    completed_at: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('toUserMedia', () => {
  it('maps all fields from snake_case to camelCase', () => {
    const row = makeUserMediaRow({
      provider_id: 'prov-1',
      audio: 'dub',
      status: 'watching',
      current_episode: 5,
      is_favorite: true,
      custom_url: 'https://custom.url',
    });
    const result = toUserMedia(row);
    expect(result).toEqual({
      id: 'um-1',
      userId: 'user-1',
      mediaId: 'media-1',
      providerId: 'prov-1',
      audio: 'dub',
      status: 'watching',
      currentEpisode: 5,
      isFavorite: true,
      customUrl: 'https://custom.url',
      startedAt: null,
      completedAt: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
  });

  it('handles all nullable fields as null', () => {
    const result = toUserMedia(makeUserMediaRow());
    expect(result.providerId).toBeNull();
    expect(result.customUrl).toBeNull();
    expect(result.startedAt).toBeNull();
    expect(result.completedAt).toBeNull();
  });
});

describe('toUserMediaWithMedia', () => {
  it('resolves baseUrl from matching (provider_id, audio) in media_providers', () => {
    const row = {
      ...makeUserMediaRow({ provider_id: 'prov-1', audio: 'sub' }),
      media: {
        title_th: null,
        title_en: 'Test Anime',
        title_romaji: null,
        poster_url: 'https://poster.url',
        total_episodes: 12,
        media_type: 'anime',
        media_providers: [
          { provider_id: 'prov-1', audio: 'sub', base_url: 'https://show.url/sub' },
          { provider_id: 'prov-1', audio: 'dub', base_url: 'https://show.url/dub' },
        ],
      },
      providers: { name: 'Bilibili', color: '#FF6600' },
    };
    const result = toUserMediaWithMedia(row);
    expect(result.baseUrl).toBe('https://show.url/sub');
    expect(result.titleEn).toBe('Test Anime');
    expect(result.providerName).toBe('Bilibili');
    expect(result.providerColor).toBe('#FF6600');
    expect(result.totalEpisodes).toBe(12);
  });

  it('returns baseUrl=null when provider_id is null', () => {
    const row = {
      ...makeUserMediaRow({ provider_id: null }),
      media: {
        title_en: 'Test',
        title_th: null,
        title_romaji: null,
        poster_url: null,
        total_episodes: 1,
        media_type: 'movie',
        media_providers: [{ provider_id: 'prov-1', audio: 'sub', base_url: 'https://show.url' }],
      },
      providers: null,
    };
    const result = toUserMediaWithMedia(row);
    expect(result.baseUrl).toBeNull();
    expect(result.providerName).toBeNull();
    expect(result.providerColor).toBeNull();
  });

  it('returns baseUrl=null when no matching (provider_id, audio) entry found', () => {
    const row = {
      ...makeUserMediaRow({ provider_id: 'prov-1', audio: 'dub' }),
      media: {
        title_en: 'Test',
        title_th: null,
        title_romaji: null,
        poster_url: null,
        total_episodes: 12,
        media_type: 'anime',
        // only sub entry, user selected dub
        media_providers: [{ provider_id: 'prov-1', audio: 'sub', base_url: 'https://show.url' }],
      },
      providers: { name: 'Bilibili', color: '#FF6600' },
    };
    const result = toUserMediaWithMedia(row);
    expect(result.baseUrl).toBeNull();
  });

  it('returns baseUrl=null when media_providers is empty', () => {
    const row = {
      ...makeUserMediaRow({ provider_id: 'prov-1', audio: 'sub' }),
      media: {
        title_en: 'Test',
        title_th: null,
        title_romaji: null,
        poster_url: null,
        total_episodes: 12,
        media_type: 'anime',
        media_providers: [],
      },
      providers: { name: 'Bilibili', color: '#FF6600' },
    };
    const result = toUserMediaWithMedia(row);
    expect(result.baseUrl).toBeNull();
  });

  it('handles null media join gracefully', () => {
    const row = { ...makeUserMediaRow(), media: null, providers: null };
    const result = toUserMediaWithMedia(row);
    expect(result.titleEn).toBeNull();
    expect(result.posterUrl).toBeNull();
    expect(result.totalEpisodes).toBe(0);
    expect(result.baseUrl).toBeNull();
  });
});

describe('fromAddToLibraryInput', () => {
  it('maps required fields and applies defaults', () => {
    const result = fromAddToLibraryInput({ userId: 'user-1', mediaId: 'media-1' });
    expect(result.user_id).toBe('user-1');
    expect(result.media_id).toBe('media-1');
    expect(result.audio).toBe('sub');
    expect(result.status).toBe('plan_to_watch');
    expect(result.current_episode).toBe(0);
    expect(result.is_favorite).toBe(false);
    expect(result.provider_id).toBeNull();
    expect(result.custom_url).toBeNull();
  });

  it('maps optional fields when provided', () => {
    const result = fromAddToLibraryInput({
      userId: 'user-1',
      mediaId: 'media-1',
      providerId: 'prov-1',
      audio: 'dub',
      status: 'watching',
      customUrl: 'https://custom.url',
    });
    expect(result.provider_id).toBe('prov-1');
    expect(result.audio).toBe('dub');
    expect(result.status).toBe('watching');
    expect(result.custom_url).toBe('https://custom.url');
  });
});
