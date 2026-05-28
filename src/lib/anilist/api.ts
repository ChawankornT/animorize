import type { AnilistMediaResponse } from './types';

const ANILIST_URL = 'https://graphql.anilist.co';

const QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english }
    coverImage { large }
    description(asHtml: false)
    genres
    episodes
    season
    seasonYear
    startDate { year month day }
    endDate { year month day }
    status
  }
}
`.trim();

export async function fetchAnilistMedia(id: number): Promise<AnilistMediaResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { id } }),
      signal: controller.signal,
    });

    const json = (await res.json()) as { data?: AnilistMediaResponse['data']; errors?: { message: string }[] };

    if (json.errors?.length) {
      throw new Error(json.errors.map((e) => e.message).join('; '));
    }

    if (!json.data?.Media) {
      throw new Error(`No media found for AniList ID ${id}`);
    }

    return { data: json.data };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('AniList request timed out after 10 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
