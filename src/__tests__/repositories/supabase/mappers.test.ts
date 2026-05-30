import { describe, it, expect } from 'vitest';
import { toSyncLog, toProvider, toMedia, toFranchise } from '@/repositories/supabase/mappers';
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
