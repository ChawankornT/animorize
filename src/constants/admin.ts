import type { MediaType, AiringStatus } from '@/domain/entities/Media';

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  anime: 'Anime',
  series: 'Series',
  movie: 'Movie',
  ova: 'OVA',
  special: 'Special',
};

export const MEDIA_STATUS_VARIANT: Record<AiringStatus, 'success' | 'warning' | 'default'> = {
  ongoing: 'success',
  upcoming: 'warning',
  finished: 'default',
};

export const SEASON_LABELS: Record<number, string> = {
  1: 'Winter',
  2: 'Spring',
  3: 'Summer',
  4: 'Fall',
};

export const TILE_COLORS = [
  '#2A3D5A', '#5D2A2E', '#2D2A4A', '#3B4B2E',
  '#4A2E2E', '#3D3525', '#2E4034', '#5A2A55',
];
