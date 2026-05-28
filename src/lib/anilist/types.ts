export interface AnilistTitle {
  romaji?: string | null;
  english?: string | null;
}

export interface AnilistDate {
  year?: number | null;
  month?: number | null;
  day?: number | null;
}

export interface AnilistCoverImage {
  large?: string | null;
}

export interface AnilistMedia {
  id: number;
  title: AnilistTitle;
  coverImage: AnilistCoverImage;
  description?: string | null;
  genres?: string[] | null;
  episodes?: number | null;
  season?: string | null;
  seasonYear?: number | null;
  startDate: AnilistDate;
  endDate: AnilistDate;
  status?: string | null;
}

export interface AnilistMediaResponse {
  data: {
    Media: AnilistMedia;
  };
}
