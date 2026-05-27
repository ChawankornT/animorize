export interface Franchise {
  id: string;
  titleTh: string | null;
  titleEn: string | null;
  titleRomaji: string | null;
  posterUrl: string | null;
  synopsis: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFranchiseInput {
  titleTh?: string | null;
  titleEn?: string | null;
  titleRomaji?: string | null;
  posterUrl?: string | null;
  synopsis?: string | null;
}

export interface UpdateFranchiseInput {
  titleTh?: string | null;
  titleEn?: string | null;
  titleRomaji?: string | null;
  posterUrl?: string | null;
  synopsis?: string | null;
}

export function validateFranchise(data: {
  titleTh?: string | null;
  titleEn?: string | null;
  titleRomaji?: string | null;
}): void {
  if (!data.titleTh && !data.titleEn && !data.titleRomaji) {
    throw new Error('Franchise must have at least one title (titleTh, titleEn, or titleRomaji)');
  }
}

export function getDisplayTitle(
  franchise: Pick<Franchise, 'titleTh' | 'titleEn' | 'titleRomaji'>,
): string {
  return franchise.titleTh ?? franchise.titleEn ?? franchise.titleRomaji ?? '';
}
