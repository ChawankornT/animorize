import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createMediaRepository, createFranchiseRepository } from '@/repositories';
import { listMedia } from '@/domain/usecases/ListMedia';
import { listFranchises } from '@/domain/usecases/ListFranchises';
import { getDisplayTitle } from '@/domain/entities/Media';
import { getDisplayTitle as getFranchiseTitle } from '@/domain/entities/Franchise';
import type { MediaType, AiringStatus } from '@/domain/entities/Media';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/button-variants';
import { MediaDeleteButton } from '@/components/admin/MediaDeleteButton';

const VALID_TYPES: MediaType[] = ['anime', 'series', 'movie', 'ova', 'special'];
const VALID_STATUSES: AiringStatus[] = ['ongoing', 'finished', 'upcoming'];

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
  const [mediaList, franchises] = await Promise.all([
    listMedia(createMediaRepository(supabase), { mediaType, airingStatus }),
    listFranchises(createFranchiseRepository(supabase)),
  ]);

  const franchiseMap = new Map(franchises.map((f) => [f.id, getFranchiseTitle(f)]));

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-primary tracking-tight">Media</h1>
          <p className="mt-1 text-sm text-secondary">Manage all media entries.</p>
        </div>
        <Link href="/admin/media/new" className={buttonVariants({ size: 'sm' })}>
          Add media
        </Link>
      </div>

      {/* Filter bar — GET form, no JS needed */}
      <form method="get" action="/admin/media" className="flex items-center gap-3">
        <select
          name="type"
          defaultValue={type ?? ''}
          className="h-8 px-2 text-sm bg-page border-[0.5px] border-default rounded-input focus:outline-none focus:border-primary transition-colors duration-fast"
        >
          <option value="">All types</option>
          {VALID_TYPES.map((t) => (
            <option key={t} value={t}>
              {mediaTypeLabels[t]}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status ?? ''}
          className="h-8 px-2 text-sm bg-page border-[0.5px] border-default rounded-input focus:outline-none focus:border-primary transition-colors duration-fast"
        >
          <option value="">All statuses</option>
          <option value="ongoing">Ongoing</option>
          <option value="upcoming">Upcoming</option>
          <option value="finished">Finished</option>
        </select>
        <button
          type="submit"
          className="h-8 px-3 text-sm bg-page border-[0.5px] border-default rounded-input hover:border-strong transition-colors duration-fast"
        >
          Filter
        </button>
        {(type || status) && (
          <Link
            href="/admin/media"
            className="text-sm text-secondary hover:text-primary transition-colors duration-fast"
          >
            Clear
          </Link>
        )}
      </form>

      {mediaList.length === 0 ? (
        <div className="py-16 text-center text-secondary text-sm border-[0.5px] border-default rounded-card">
          No media found.{' '}
          <Link
            href="/admin/media/new"
            className="text-primary underline-offset-2 hover:underline"
          >
            Add the first one.
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
                  Franchise
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-default">
              {mediaList.map((m) => {
                const displayTitle = getDisplayTitle(m);
                return (
                  <tr key={m.id} className="hover:bg-surface transition-colors duration-fast">
                    <td className="px-4 py-3">
                      <span className="font-medium text-primary">{displayTitle || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{mediaTypeLabels[m.mediaType]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[m.airingStatus]} dot>
                        {m.airingStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {m.totalEpisodes > 0 ? m.totalEpisodes : '—'}
                    </td>
                    <td className="px-4 py-3 text-secondary text-xs">
                      {m.franchiseId ? (franchiseMap.get(m.franchiseId) ?? '—') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/media/${m.id}/edit`}
                          className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                        >
                          Edit
                        </Link>
                        <MediaDeleteButton id={m.id} title={displayTitle || m.id} />
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
