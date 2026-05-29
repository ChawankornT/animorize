import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createMediaRepository } from '@/repositories';
import { listMedia } from '@/domain/usecases/ListMedia';
import { getDisplayTitle } from '@/domain/entities/Media';
import type { MediaType, AiringStatus } from '@/domain/entities/Media';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/button-variants';
import { MediaDeleteButton } from '@/components/admin/MediaDeleteButton';
import {
  MEDIA_TYPE_LABELS,
  MEDIA_STATUS_VARIANT,
  SEASON_LABELS,
  TILE_COLORS,
} from '@/constants/admin';

const VALID_TYPES: MediaType[] = ['anime', 'series', 'movie', 'ova', 'special'];
const VALID_STATUSES: AiringStatus[] = ['ongoing', 'finished', 'upcoming'];

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  const { type, status } = await searchParams;
  const mediaType = VALID_TYPES.includes(type as MediaType) ? (type as MediaType) : undefined;
  const airingStatus = VALID_STATUSES.includes(status as AiringStatus)
    ? (status as AiringStatus)
    : undefined;

  const supabase = await createClient();
  const mediaList = await listMedia(createMediaRepository(supabase), { mediaType, airingStatus });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-primary tracking-tight">Media</h1>
          <p className="mt-1 text-sm text-secondary">{mediaList.length} entries</p>
        </div>
        <Link href="/admin/import" className={buttonVariants({ size: 'sm' })}>
          Import media
        </Link>
      </div>

      {/* Filter bar */}
      <form method="get" action="/admin/media" className="flex items-center gap-2">
        <div className="flex items-center h-8 px-2 gap-1.5 border-[0.5px] border-default rounded-input bg-page">
          <span className="font-mono text-[10px] text-tertiary">type</span>
          <select
            name="type"
            defaultValue={type ?? ''}
            className="bg-transparent text-sm text-primary outline-none"
          >
            <option value="">All types</option>
            {VALID_TYPES.map((t) => (
              <option key={t} value={t}>
                {MEDIA_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center h-8 px-2 gap-1.5 border-[0.5px] border-default rounded-input bg-page">
          <span className="font-mono text-[10px] text-tertiary">status</span>
          <select
            name="status"
            defaultValue={status ?? ''}
            className="bg-transparent text-sm text-primary outline-none"
          >
            <option value="">All statuses</option>
            <option value="ongoing">Ongoing</option>
            <option value="upcoming">Upcoming</option>
            <option value="finished">Finished</option>
          </select>
        </div>
        {(type || status) && (
          <Link
            href="/admin/media"
            className="h-8 px-3 flex items-center text-sm text-secondary border-[0.5px] border-default rounded-input hover:text-primary transition-colors duration-fast"
          >
            Clear
          </Link>
        )}
      </form>

      {mediaList.length === 0 ? (
        <div className="py-16 text-center text-secondary text-sm border-[0.5px] border-default rounded-card">
          No media found.{' '}
          <Link href="/admin/import" className="text-primary underline-offset-2 hover:underline">
            Import from AniList.
          </Link>
        </div>
      ) : (
        <div className="border-[0.5px] border-default rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-[0.5px] border-default bg-surface">
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Eps
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Season
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Auto-sync
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-default">
              {mediaList.map((m, i) => {
                const primaryTitle = getDisplayTitle(m) || '—';
                const secondaryTitle =
                  m.titleRomaji && m.titleRomaji !== m.titleEn ? m.titleRomaji : null;
                const tertiaryTitle = m.titleTh || null;
                const tileColor = TILE_COLORS[i % TILE_COLORS.length];
                const seasonStr =
                  m.seasonYear && m.seasonQuarter
                    ? `${SEASON_LABELS[m.seasonQuarter]} ${m.seasonYear}`
                    : m.seasonYear
                      ? String(m.seasonYear)
                      : null;

                return (
                  <tr
                    key={m.id}
                    className="hover:bg-surface transition-colors duration-fast"
                  >
                    {/* Title cell — swatch + multi-line */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="shrink-0 rounded-sm"
                          style={{
                            width: 22,
                            height: 30,
                            backgroundColor: tileColor,
                          }}
                        />
                        <div>
                          <div className="font-medium text-primary">{primaryTitle}</div>
                          {secondaryTitle && (
                            <div className="text-xs text-tertiary">{secondaryTitle}</div>
                          )}
                          {tertiaryTitle && tertiaryTitle !== primaryTitle && (
                            <div className="text-xs text-tertiary">{tertiaryTitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{MEDIA_TYPE_LABELS[m.mediaType]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={MEDIA_STATUS_VARIANT[m.airingStatus]} dot>
                        {m.airingStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-secondary font-mono text-xs">
                      {m.totalEpisodes > 0 ? m.totalEpisodes : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-secondary">
                      {seasonStr ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {m.autoSync ? (
                        <Badge variant="info" dot>On</Badge>
                      ) : (
                        <Badge>Off</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/media/${m.id}`}
                          className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                        >
                          View
                        </Link>
                        <MediaDeleteButton
                          id={m.id}
                          title={primaryTitle}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
