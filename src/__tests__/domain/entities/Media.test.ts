import { describe, it, expect } from 'vitest';
import { validateMedia, isTrackable } from '@/domain/entities/Media';

describe('validateMedia', () => {
  it('throws when no title is provided', () => {
    expect(() => validateMedia({})).toThrow('at least one title');
  });

  it('throws when all titles are null', () => {
    expect(() =>
      validateMedia({ titleTh: null, titleEn: null, titleRomaji: null }),
    ).toThrow('at least one title');
  });

  it('passes when only titleEn is provided', () => {
    expect(() => validateMedia({ titleEn: 'EN' })).not.toThrow();
  });

  it('passes when only titleRomaji is provided', () => {
    expect(() => validateMedia({ titleRomaji: 'Romaji' })).not.toThrow();
  });

  it('passes when only titleTh is provided', () => {
    expect(() => validateMedia({ titleTh: 'TH' })).not.toThrow();
  });

  it('throws for movie with totalEpisodes !== 1', () => {
    expect(() =>
      validateMedia({ titleEn: 'Movie', mediaType: 'movie', totalEpisodes: 12 }),
    ).toThrow('exactly 1 episode');
  });

  it('throws for special with totalEpisodes !== 1', () => {
    expect(() =>
      validateMedia({ titleEn: 'Special', mediaType: 'special', totalEpisodes: 2 }),
    ).toThrow('exactly 1 episode');
  });

  it('passes for movie with totalEpisodes = 1', () => {
    expect(() =>
      validateMedia({ titleEn: 'Movie', mediaType: 'movie', totalEpisodes: 1 }),
    ).not.toThrow();
  });

  it('passes for anime with any episode count', () => {
    expect(() =>
      validateMedia({ titleEn: 'Anime', mediaType: 'anime', totalEpisodes: 24 }),
    ).not.toThrow();
  });

  it('does not enforce episode count when totalEpisodes is undefined', () => {
    expect(() =>
      validateMedia({ titleEn: 'Movie', mediaType: 'movie' }),
    ).not.toThrow();
  });
});

describe('isTrackable', () => {
  it('returns false for movie', () => {
    expect(isTrackable({ mediaType: 'movie' })).toBe(false);
  });

  it('returns false for special', () => {
    expect(isTrackable({ mediaType: 'special' })).toBe(false);
  });

  it('returns true for anime', () => {
    expect(isTrackable({ mediaType: 'anime' })).toBe(true);
  });

  it('returns true for series', () => {
    expect(isTrackable({ mediaType: 'series' })).toBe(true);
  });

  it('returns true for ova', () => {
    expect(isTrackable({ mediaType: 'ova' })).toBe(true);
  });
});
