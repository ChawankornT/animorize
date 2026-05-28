import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  createMediaRepository,
  createMediaProviderRepository,
  createProviderRepository,
  createSyncLogRepository,
} from '@/repositories';
import { getMedia } from '@/domain/usecases/GetMedia';
import { listMediaProviders } from '@/domain/usecases/ListMediaProviders';
import { listProviders } from '@/domain/usecases/ListProviders';
import { listSyncLogs } from '@/domain/usecases/ListSyncLogs';
import { getDisplayTitle } from '@/domain/entities/Media';
import type { MediaType, AiringStatus } from '@/domain/entities/Media';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/button-variants';
import { MediaDeleteButton } from '@/components/admin/MediaDeleteButton';
import { AssignProviderForm } from '@/components/admin/AssignProviderForm';
import { RemoveProviderButton } from '@/components/admin/RemoveProviderButton';

const mediaTypeLabels: Record<MediaType, string> = {
  anime: 'Anime',
  series: 'Series',
  movie: 'Movie',
  ova: 'OVA',
  special: 'Special',
};

const statusVariant: Record<AiringStatus, 'success' | 'warning' | 'default'> = {
  ongoing: 'success',
  upcoming: 'warning',
  finished: 'default',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [media, assignments, providers, syncLogs] = await Promise.all([
    getMedia(createMediaRepository(supabase), id),
    listMediaProviders(createMediaProviderRepository(supabase), id),
    listProviders(createProviderRepository(supabase)),
    listSyncLogs(createSyncLogRepository(supabase), { mediaId: id, limit: 10 }),
  ]);

  if (!media) notFound();

  const displayTitle = getDisplayTitle(media);

  return (
    <div className="p-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-secondary">
        <Link href="/admin" className="hover:text-primary transition-colors duration-fast">
          Admin
        </Link>
        <span className="text-tertiary">›</span>
        <Link href="/admin/media" className="hover:text-primary transition-colors duration-fast">
          Media
        </Link>
        <span className="text-tertiary">›</span>
        <span className="text-primary font-medium truncate max-w-64">{displayTitle || id}</span>
      </nav>

      {/* Header actions */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-medium text-primary tracking-tight">
          {displayTitle || 'Untitled'}
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/media/${id}/edit`}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            Edit
          </Link>
          <MediaDeleteButton id={id} title={displayTitle || id} />
        </div>
      </div>

      {/* Media info card */}
      <div className="flex gap-6 p-5 border-[0.5px] border-default rounded-card bg-surface">
        {media.posterUrl && (
          <div className="shrink-0 w-28 h-40 relative rounded-md overflow-hidden">
            <Image
              src={media.posterUrl}
              alt={displayTitle}
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>
        )}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge>{mediaTypeLabels[media.mediaType]}</Badge>
            <Badge variant={statusVariant[media.airingStatus]} dot>
              {media.airingStatus}
            </Badge>
            {media.anilistId && (
              <Badge variant="default">AniList #{media.anilistId}</Badge>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {media.titleTh && (
              <>
                <dt className="text-secondary">Thai title</dt>
                <dd className="text-primary">{media.titleTh}</dd>
              </>
            )}
            {media.titleEn && (
              <>
                <dt className="text-secondary">English title</dt>
                <dd className="text-primary">{media.titleEn}</dd>
              </>
            )}
            {media.titleRomaji && (
              <>
                <dt className="text-secondary">Romaji title</dt>
                <dd className="text-primary">{media.titleRomaji}</dd>
              </>
            )}
            <dt className="text-secondary">Episodes</dt>
            <dd className="text-primary">{media.totalEpisodes || '—'}</dd>
            {(media.seasonYear || media.seasonQuarter) && (
              <>
                <dt className="text-secondary">Season</dt>
                <dd className="text-primary">
                  {[
                    media.seasonQuarter ? `Q${media.seasonQuarter}` : null,
                    media.seasonYear,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </dd>
              </>
            )}
            {media.airDateStart && (
              <>
                <dt className="text-secondary">Air date</dt>
                <dd className="text-primary">
                  {formatDate(media.airDateStart)}
                  {media.airDateEnd ? ` – ${formatDate(media.airDateEnd)}` : ''}
                </dd>
              </>
            )}
            {media.genres.length > 0 && (
              <>
                <dt className="text-secondary">Genres</dt>
                <dd className="text-primary">{media.genres.join(', ')}</dd>
              </>
            )}
          </dl>

          {media.synopsis && (
            <p className="text-sm text-secondary leading-relaxed line-clamp-3">{media.synopsis}</p>
          )}
        </div>
      </div>

      {/* Providers section */}
      <section className="space-y-3">
        <h2 className="text-base font-medium text-primary">Providers</h2>

        {assignments.length === 0 ? (
          <p className="text-sm text-secondary">No providers assigned yet.</p>
        ) : (
          <div className="border-[0.5px] border-default rounded-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-[0.5px] border-default bg-surface">
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                    Provider
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                    Audio
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                    Base URL
                  </th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-default">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-surface transition-colors duration-fast">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: a.providerColor }}
                        />
                        <span className="font-medium text-primary">{a.providerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <Badge>{a.audio.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-2 text-secondary text-xs">
                      {a.baseUrl ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <RemoveProviderButton
                        id={a.id}
                        mediaId={id}
                        providerName={a.providerName}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AssignProviderForm providers={providers} mediaId={id} />
      </section>

      {/* Sync history section */}
      <section className="space-y-3">
        <h2 className="text-base font-medium text-primary">Sync history</h2>

        {syncLogs.length === 0 ? (
          <p className="text-sm text-secondary">No sync history yet.</p>
        ) : (
          <div className="border-[0.5px] border-default rounded-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-[0.5px] border-default bg-surface">
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                    Result
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                    Message
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-default">
                {syncLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2">
                      <Badge variant={log.result === 'success' ? 'success' : 'error'} dot>
                        {log.result}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-secondary text-xs">
                      {log.errorMessage ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-secondary text-xs">
                      {formatDate(log.syncedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
