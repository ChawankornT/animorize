import { describe, it, expect } from 'vitest';
import { getEffectiveUrl, isDashboardItem } from '@/domain/entities/UserMedia';
import { getDisplayTitle } from '@/domain/entities/title';

describe('getEffectiveUrl', () => {
  it('returns customUrl when both are present', () => {
    expect(getEffectiveUrl('https://custom.url/ep1', 'https://media.url')).toBe('https://custom.url/ep1');
  });

  it('returns baseUrl when customUrl is null', () => {
    expect(getEffectiveUrl(null, 'https://media.url')).toBe('https://media.url');
  });

  it('returns baseUrl when customUrl is undefined', () => {
    expect(getEffectiveUrl(undefined, 'https://media.url')).toBe('https://media.url');
  });

  it('returns null when both are null', () => {
    expect(getEffectiveUrl(null, null)).toBeNull();
  });

  it('returns null when both are undefined', () => {
    expect(getEffectiveUrl(undefined, undefined)).toBeNull();
  });

  it('returns customUrl even when baseUrl is null', () => {
    expect(getEffectiveUrl('https://custom.url', null)).toBe('https://custom.url');
  });
});

describe('isDashboardItem', () => {
  it('returns true when status is watching', () => {
    expect(isDashboardItem({ status: 'watching', isFavorite: false })).toBe(true);
  });

  it('returns true when isFavorite is true (any status)', () => {
    expect(isDashboardItem({ status: 'completed', isFavorite: true })).toBe(true);
  });

  it('returns true when both watching and favorite', () => {
    expect(isDashboardItem({ status: 'watching', isFavorite: true })).toBe(true);
  });

  it('returns false when not watching and not favorite', () => {
    expect(isDashboardItem({ status: 'plan_to_watch', isFavorite: false })).toBe(false);
  });

  it('returns false for completed + not favorite', () => {
    expect(isDashboardItem({ status: 'completed', isFavorite: false })).toBe(false);
  });

  it('returns false for on_hold + not favorite', () => {
    expect(isDashboardItem({ status: 'on_hold', isFavorite: false })).toBe(false);
  });

  it('returns false for dropped + not favorite', () => {
    expect(isDashboardItem({ status: 'dropped', isFavorite: false })).toBe(false);
  });
});

describe('getDisplayTitle (re-exported via title.ts)', () => {
  it('prefers titleEn over romaji and th', () => {
    expect(getDisplayTitle({ titleEn: 'EN', titleRomaji: 'Romaji', titleTh: 'TH' })).toBe('EN');
  });

  it('falls back to titleRomaji when titleEn is null', () => {
    expect(getDisplayTitle({ titleEn: null, titleRomaji: 'Romaji', titleTh: 'TH' })).toBe('Romaji');
  });

  it('falls back to titleTh when en and romaji are null', () => {
    expect(getDisplayTitle({ titleEn: null, titleRomaji: null, titleTh: 'TH' })).toBe('TH');
  });

  it('returns empty string when all titles are null', () => {
    expect(getDisplayTitle({ titleEn: null, titleRomaji: null, titleTh: null })).toBe('');
  });
});
