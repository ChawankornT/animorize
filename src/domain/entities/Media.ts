import type { MediaType, AiringStatus } from "@/types/database";

export type { MediaType, AiringStatus };
export { getDisplayTitle } from "@/domain/entities/title";

export interface Media {
  id: string;
  franchiseId: string | null;
  anilistId: number | null;
  mediaType: MediaType;
  titleTh: string | null;
  titleEn: string | null;
  titleRomaji: string | null;
  synopsis: string | null;
  posterUrl: string | null;
  genres: string[];
  totalEpisodes: number;
  seasonQuarter: number | null;
  seasonYear: number | null;
  airDateStart: string | null;
  airDateEnd: string | null;
  airingStatus: AiringStatus;
  autoSync: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMediaInput {
  franchiseId?: string | null;
  anilistId?: number | null;
  mediaType: MediaType;
  titleTh?: string | null;
  titleEn?: string | null;
  titleRomaji?: string | null;
  synopsis?: string | null;
  posterUrl?: string | null;
  genres?: string[];
  totalEpisodes?: number;
  seasonQuarter?: number | null;
  seasonYear?: number | null;
  airDateStart?: string | null;
  airDateEnd?: string | null;
  airingStatus?: AiringStatus;
  autoSync?: boolean;
  sortOrder?: number;
}

export interface UpdateMediaInput {
  franchiseId?: string | null;
  anilistId?: number | null;
  mediaType?: MediaType;
  titleTh?: string | null;
  titleEn?: string | null;
  titleRomaji?: string | null;
  synopsis?: string | null;
  posterUrl?: string | null;
  genres?: string[];
  totalEpisodes?: number;
  seasonQuarter?: number | null;
  seasonYear?: number | null;
  airDateStart?: string | null;
  airDateEnd?: string | null;
  airingStatus?: AiringStatus;
  autoSync?: boolean;
  sortOrder?: number;
}

export function validateMedia(data: {
  titleTh?: string | null;
  titleEn?: string | null;
  titleRomaji?: string | null;
  mediaType?: MediaType;
  totalEpisodes?: number;
}): void {
  if (!data.titleTh && !data.titleEn && !data.titleRomaji) {
    throw new Error("Media must have at least one title (titleTh, titleEn, or titleRomaji)");
  }
  if (
    (data.mediaType === "movie" || data.mediaType === "special") &&
    data.totalEpisodes !== undefined &&
    data.totalEpisodes !== 1
  ) {
    throw new Error("Movie and special media must have exactly 1 episode");
  }
}

export function isTrackable(media: Pick<Media, "mediaType">): boolean {
  return media.mediaType !== "movie" && media.mediaType !== "special";
}
