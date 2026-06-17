import { vi } from "vitest";
import type { IMediaRepository } from "@/repositories/interfaces/IMediaRepository";
import type { ISyncLogRepository } from "@/repositories/interfaces/ISyncLogRepository";
import type { IUserMediaRepository } from "@/repositories/interfaces/IUserMediaRepository";
import type { IWatchLogRepository } from "@/repositories/interfaces/IWatchLogRepository";
import type { Media, CreateMediaInput, UpdateMediaInput } from "@/domain/entities/Media";
import type { SyncLog, CreateSyncLogInput } from "@/domain/entities/SyncLog";
import type { UserMedia, UserMediaWithMedia } from "@/domain/entities/UserMedia";
import type { WatchLog } from "@/domain/entities/WatchLog";

/** Stub Media for use in mock repos. Override individual fields as needed. */
export function makeMedia(overrides: Partial<Media> = {}): Media {
  return {
    id: "media-1",
    franchiseId: null,
    anilistId: null,
    mediaType: "anime",
    titleTh: null,
    titleEn: "Test Media",
    titleRomaji: null,
    synopsis: null,
    posterUrl: null,
    genres: [],
    totalEpisodes: 12,
    seasonQuarter: null,
    seasonYear: null,
    airDateStart: null,
    airDateEnd: null,
    airingStatus: "ongoing",
    autoSync: true,
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

/** Stub SyncLog for use in mock repos. */
export function makeSyncLog(overrides: Partial<SyncLog> = {}): SyncLog {
  return {
    id: "log-1",
    mediaId: "media-1",
    result: "success",
    errorMessage: null,
    syncedAt: "2026-01-01T00:00:00Z",
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
    create: vi
      .fn()
      .mockImplementation(async (data: CreateMediaInput) =>
        makeMedia({ ...data, id: "media-new" }),
      ),
    update: vi
      .fn()
      .mockImplementation(async (_id: string, data: UpdateMediaInput) =>
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
    create: vi
      .fn()
      .mockImplementation(async (data: CreateSyncLogInput) =>
        makeSyncLog({ ...data, id: "log-new" }),
      ),
  };
}

/** Stub UserMedia for use in mock repos. Override individual fields as needed. */
export function makeUserMedia(overrides: Partial<UserMedia> = {}): UserMedia {
  return {
    id: "um-1",
    userId: "user-1",
    mediaId: "media-1",
    providerId: null,
    audio: "sub",
    status: "plan_to_watch",
    currentEpisode: 0,
    isFavorite: false,
    customUrl: null,
    startedAt: null,
    completedAt: null,
    rewatchCount: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

/** Stub WatchLog for use in mock repos. Override individual fields as needed. */
export function makeWatchLog(overrides: Partial<WatchLog> = {}): WatchLog {
  return {
    id: "wl-1",
    userId: "user-1",
    mediaId: "media-1",
    episodeNumber: 1,
    watchedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

/** Stub UserMediaWithMedia for use in mock repos. */
export function makeUserMediaWithMedia(
  overrides: Partial<UserMediaWithMedia> = {},
): UserMediaWithMedia {
  return {
    ...makeUserMedia(),
    titleTh: null,
    titleEn: "Test Media",
    titleRomaji: null,
    posterUrl: null,
    totalEpisodes: 12,
    mediaType: "anime",
    providerName: null,
    providerColor: null,
    baseUrl: null,
    ...overrides,
  };
}

/**
 * Creates a fresh IUserMediaRepository mock per test.
 * Override methods with .mockResolvedValue / .mockRejectedValue as needed.
 */
export function createMockUserMediaRepository(
  defaults: { userMedia?: UserMedia; userMediaWithMedia?: UserMediaWithMedia } = {},
): IUserMediaRepository {
  const userMedia = defaults.userMedia ?? makeUserMedia();
  const withMedia = defaults.userMediaWithMedia ?? makeUserMediaWithMedia();
  return {
    add: vi.fn().mockResolvedValue(userMedia),
    findByUserId: vi.fn().mockResolvedValue([withMedia]),
    findMediaIdsByUserId: vi.fn().mockResolvedValue([withMedia.mediaId]),
    findByUserAndMedia: vi.fn().mockResolvedValue(null),
    updateFavorite: vi
      .fn()
      .mockImplementation(async (_id: string, isFavorite: boolean) =>
        makeUserMedia({ ...userMedia, isFavorite }),
      ),
    updateStatus: vi
      .fn()
      .mockImplementation(async (_id: string, status: UserMedia["status"]) =>
        makeUserMedia({ ...userMedia, status }),
      ),
    updateProvider: vi.fn().mockResolvedValue(userMedia),
    remove: vi.fn().mockResolvedValue(undefined),
    findWithMediaByUserAndMedia: vi.fn().mockResolvedValue(withMedia),
    incrementEpisode: vi.fn().mockResolvedValue({ status: "updated", userMedia }),
    startRewatch: vi.fn().mockResolvedValue(userMedia),
    unmarkWatched: vi.fn().mockResolvedValue(userMedia),
  };
}

/**
 * Creates a fresh IWatchLogRepository mock per test.
 */
export function createMockWatchLogRepository(): IWatchLogRepository {
  return {
    findByUserAndMedia: vi.fn().mockResolvedValue([]),
  };
}
