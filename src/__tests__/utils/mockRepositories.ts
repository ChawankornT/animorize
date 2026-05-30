import { vi } from 'vitest';
import type { IMediaRepository } from '@/repositories/interfaces/IMediaRepository';
import type { ISyncLogRepository } from '@/repositories/interfaces/ISyncLogRepository';
import type { Media, CreateMediaInput, UpdateMediaInput } from '@/domain/entities/Media';
import type { SyncLog, CreateSyncLogInput } from '@/domain/entities/SyncLog';

/** Stub Media for use in mock repos. Override individual fields as needed. */
export function makeMedia(overrides: Partial<Media> = {}): Media {
  return {
    id: 'media-1',
    franchiseId: null,
    anilistId: null,
    mediaType: 'anime',
    titleTh: null,
    titleEn: 'Test Media',
    titleRomaji: null,
    synopsis: null,
    posterUrl: null,
    genres: [],
    totalEpisodes: 12,
    seasonQuarter: null,
    seasonYear: null,
    airDateStart: null,
    airDateEnd: null,
    airingStatus: 'ongoing',
    autoSync: true,
    sortOrder: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

/** Stub SyncLog for use in mock repos. */
export function makeSyncLog(overrides: Partial<SyncLog> = {}): SyncLog {
  return {
    id: 'log-1',
    mediaId: 'media-1',
    result: 'success',
    errorMessage: null,
    syncedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Creates a fresh IMediaRepository mock per test.
 * Override methods with .mockResolvedValue / .mockRejectedValue as needed.
 */
export function createMockMediaRepository(defaults: { media?: Media } = {}): IMediaRepository {
  const media = defaults.media ?? makeMedia();
  return {
    findAll: vi.fn().mockResolvedValue([media]),
    findById: vi.fn().mockResolvedValue(media),
    findByAnilistId: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation(async (data: CreateMediaInput) =>
      makeMedia({ ...data, id: 'media-new' }),
    ),
    update: vi.fn().mockImplementation(async (_id: string, data: UpdateMediaInput) =>
      makeMedia({ ...media, ...data }),
    ),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Creates a fresh ISyncLogRepository mock per test.
 */
export function createMockSyncLogRepository(): ISyncLogRepository {
  return {
    findAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (data: CreateSyncLogInput) =>
      makeSyncLog({ ...data, id: 'log-new' }),
    ),
  };
}
