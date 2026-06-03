import type { AnilistMediaResponse } from "./types";
import type { CreateMediaInput } from "@/domain/entities/Media";

const SEASON_MAP: Record<string, number> = {
  WINTER: 1,
  SPRING: 2,
  SUMMER: 3,
  FALL: 4,
};

const STATUS_MAP: Record<string, "ongoing" | "finished" | "upcoming"> = {
  RELEASING: "ongoing",
  FINISHED: "finished",
  NOT_YET_RELEASED: "upcoming",
};

function toDateString(
  year?: number | null,
  month?: number | null,
  day?: number | null,
): string | undefined {
  if (!year || !month || !day) return undefined;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

export function mapAnilistToMedia(
  response: AnilistMediaResponse,
): CreateMediaInput & { anilistId: number } {
  const m = response.data.Media;

  return {
    anilistId: m.id,
    mediaType: "anime",
    titleRomaji: m.title.romaji ?? undefined,
    titleEn: m.title.english ?? undefined,
    posterUrl: m.coverImage.large ?? undefined,
    synopsis: m.description ? stripHtml(m.description) : undefined,
    genres: m.genres ?? [],
    totalEpisodes: m.episodes ?? undefined,
    seasonQuarter: m.season ? (SEASON_MAP[m.season] ?? undefined) : undefined,
    seasonYear: m.seasonYear ?? undefined,
    airDateStart: toDateString(m.startDate.year, m.startDate.month, m.startDate.day),
    airDateEnd: toDateString(m.endDate.year, m.endDate.month, m.endDate.day),
    airingStatus: m.status ? (STATUS_MAP[m.status] ?? "upcoming") : "upcoming",
    autoSync: true,
  };
}
