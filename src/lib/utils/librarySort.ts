import type { UserMediaWithMedia } from '@/domain/entities/UserMedia';
import { STATUS_PRIORITY } from '@/constants/userMedia';

export function librarySort(a: UserMediaWithMedia, b: UserMediaWithMedia): number {
  const pa = STATUS_PRIORITY[a.status] ?? 99;
  const pb = STATUS_PRIORITY[b.status] ?? 99;
  if (pa !== pb) return pa - pb;
  if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
  return b.updatedAt.localeCompare(a.updatedAt);
}
