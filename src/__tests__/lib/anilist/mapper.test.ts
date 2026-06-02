import { describe, it, expect } from "vitest";
import { mapAnilistToMedia } from "@/lib/anilist/mapper";
import type { AnilistMediaResponse } from "@/lib/anilist/types";

function makeResponse(
  overrides: Partial<AnilistMediaResponse["data"]["Media"]> = {},
): AnilistMediaResponse {
  return {
    data: {
      Media: {
        id: 1,
        title: { romaji: "Romaji Title", english: "English Title" },
        coverImage: { large: "https://example.com/poster.jpg" },
        description: null,
        genres: [],
        episodes: 12,
        season: "SPRING",
        seasonYear: 2024,
        startDate: { year: 2024, month: 4, day: 1 },
        endDate: { year: 2024, month: 6, day: 30 },
        status: "FINISHED",
        ...overrides,
      },
    },
  };
}

describe("mapAnilistToMedia", () => {
  describe("episodes field", () => {
    it("maps episodes number to totalEpisodes", () => {
      const result = mapAnilistToMedia(makeResponse({ episodes: 24 }));
      expect(result.totalEpisodes).toBe(24);
    });

    it("maps episodes null to undefined (not 0) so ?? 1 fallback works", () => {
      const result = mapAnilistToMedia(makeResponse({ episodes: null }));
      expect(result.totalEpisodes).toBeUndefined();
    });

    it("maps episodes undefined to undefined", () => {
      const result = mapAnilistToMedia(makeResponse({ episodes: undefined }));
      expect(result.totalEpisodes).toBeUndefined();
    });
  });

  describe("status mapping", () => {
    it.each([
      ["RELEASING", "ongoing"],
      ["FINISHED", "finished"],
      ["NOT_YET_RELEASED", "upcoming"],
    ] as const)("maps AniList status %s to %s", (anilistStatus, expected) => {
      const result = mapAnilistToMedia(makeResponse({ status: anilistStatus }));
      expect(result.airingStatus).toBe(expected);
    });

    it("defaults unknown status to upcoming", () => {
      const result = mapAnilistToMedia(makeResponse({ status: "CANCELLED" }));
      expect(result.airingStatus).toBe("upcoming");
    });

    it("defaults null status to upcoming", () => {
      const result = mapAnilistToMedia(makeResponse({ status: null }));
      expect(result.airingStatus).toBe("upcoming");
    });
  });

  describe("season mapping", () => {
    it.each([
      ["WINTER", 1],
      ["SPRING", 2],
      ["SUMMER", 3],
      ["FALL", 4],
    ] as const)("maps %s to quarter %d", (season, expected) => {
      const result = mapAnilistToMedia(makeResponse({ season }));
      expect(result.seasonQuarter).toBe(expected);
    });

    it("maps null season to undefined", () => {
      const result = mapAnilistToMedia(makeResponse({ season: null }));
      expect(result.seasonQuarter).toBeUndefined();
    });
  });

  describe("description / HTML stripping", () => {
    it("strips HTML tags from description", () => {
      const result = mapAnilistToMedia(makeResponse({ description: "<p>A <b>great</b> show</p>" }));
      expect(result.synopsis).toBe("A great show");
    });

    it("maps null description to undefined", () => {
      const result = mapAnilistToMedia(makeResponse({ description: null }));
      expect(result.synopsis).toBeUndefined();
    });
  });

  describe("title mapping", () => {
    it("maps romaji and english titles", () => {
      const result = mapAnilistToMedia(
        makeResponse({ title: { romaji: "Romaji", english: "English" } }),
      );
      expect(result.titleRomaji).toBe("Romaji");
      expect(result.titleEn).toBe("English");
    });

    it("maps null english title to undefined", () => {
      const result = mapAnilistToMedia(
        makeResponse({ title: { romaji: "Romaji", english: null } }),
      );
      expect(result.titleEn).toBeUndefined();
    });
  });

  describe("date mapping", () => {
    it("formats complete start date as YYYY-MM-DD", () => {
      const result = mapAnilistToMedia(
        makeResponse({ startDate: { year: 2024, month: 4, day: 1 } }),
      );
      expect(result.airDateStart).toBe("2024-04-01");
    });

    it("returns undefined when start date is incomplete", () => {
      const result = mapAnilistToMedia(
        makeResponse({ startDate: { year: 2024, month: null, day: null } }),
      );
      expect(result.airDateStart).toBeUndefined();
    });
  });
});
