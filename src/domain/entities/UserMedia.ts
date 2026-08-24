import type { AudioType, WatchStatus } from "@/types/enums";
import type { AiringStatus } from "@/domain/entities/Media";
import { getDisplayTitle } from "@/domain/entities/title";

export type { AudioType, WatchStatus };

export interface UserMedia {
  id: string;
  userId: string;
  mediaId: string;
  providerId: string | null;
  audio: AudioType;
  status: WatchStatus;
  currentEpisode: number;
  isFavorite: boolean;
  customUrl: string | null;
  startedAt: string | null;
  completedAt: string | null;
  rewatchCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserMediaWithMedia extends UserMedia {
  titleTh: string | null;
  titleEn: string | null;
  titleRomaji: string | null;
  posterUrl: string | null;
  totalEpisodes: number;
  mediaType: string;
  providerName: string | null;
  providerColor: string | null;
  /**
   * URL resolution model (3 layers):
   *   providers.base_url      — provider homepage (e.g. bilibili.com)
   *   media_providers.base_url — link to this show on the provider (admin-managed; may come from import)
   *   user_media.custom_url   — user override (e.g. a specific episode or alternate link)
   *
   * Effective URL = custom_url ?? media_providers.base_url
   * Keyed by (media_id, provider_id, audio) so sub/dub can have separate links.
   */
  baseUrl: string | null;
}

export interface AddToLibraryInput {
  userId: string;
  mediaId: string;
  providerId?: string | null;
  audio?: AudioType;
  status?: WatchStatus;
  customUrl?: string | null;
}

export { getDisplayTitle };

/**
 * Returns the effective URL for watching.
 * custom_url (user override) takes precedence over media_providers.base_url (admin-managed show link).
 * @param customUrl - user_media.custom_url
 * @param baseUrl   - media_providers.base_url (keyed by provider + audio)
 */
export function getEffectiveUrl(
  customUrl: string | null | undefined,
  baseUrl: string | null | undefined,
): string | null {
  return customUrl ?? baseUrl ?? null;
}

/**
 * Returns true if this item qualifies as a highlight (watching OR favorite).
 * Used by `listUserLibrary('dashboard')` filter — note: `/dashboard` page uses 'all' + sections instead.
 */
export function isDashboardItem(userMedia: Pick<UserMedia, "status" | "isFavorite">): boolean {
  return userMedia.status === "watching" || userMedia.isFavorite;
}

/**
 * Client-side mirror of the completion guard in increment_episode RPC (schema/14 — SQL = source of truth).
 * Used for optimistic status calculation on +1 / mark watched.
 * ⚠️ If the SQL guard changes, update this function to match.
 */
export function computeStatusAfterIncrement(
  nextEpisode: number,
  totalEpisodes: number,
  airingStatus: AiringStatus,
): WatchStatus {
  if (nextEpisode >= totalEpisodes && airingStatus !== "ongoing") return "completed";
  return "watching";
}
