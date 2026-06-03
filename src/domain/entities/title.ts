/** Returns the display title using EN > Romaji > TH priority order. */
export function getDisplayTitle(titles: {
  titleEn?: string | null;
  titleRomaji?: string | null;
  titleTh?: string | null;
}): string {
  return titles.titleEn ?? titles.titleRomaji ?? titles.titleTh ?? "";
}
