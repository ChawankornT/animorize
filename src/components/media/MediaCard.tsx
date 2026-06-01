import Image from 'next/image';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProviderBadge } from '@/components/media/ProviderBadge';
import { getDisplayTitle } from '@/domain/entities/UserMedia';
import { TILE_COLORS } from '@/constants/admin';
import { STATUS_LABEL } from '@/constants/userMedia';
import type { WatchStatus } from '@/domain/entities/UserMedia';

// ── StatusPill ────────────────────────────────────────────────────

type StatusVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

const STATUS_VARIANT: Record<WatchStatus, StatusVariant> = {
  watching:      'success',
  completed:     'info',
  on_hold:       'warning',
  dropped:       'error',
  plan_to_watch: 'default',
};

function StatusPill({ status }: { status: WatchStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} dot>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

// ── Progress bar ──────────────────────────────────────────────────

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div className="h-[3px] rounded-pill bg-surface-2 overflow-hidden">
      <div
        className="h-full rounded-[inherit] bg-primary transition-[width] duration-slow ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Shared poster area ────────────────────────────────────────────

interface PosterProps {
  posterUrl: string | null;
  titleEn: string | null;
  tileColorIndex: number;
}

function Poster({ posterUrl, titleEn, tileColorIndex }: PosterProps) {
  const tileColor = TILE_COLORS[tileColorIndex % TILE_COLORS.length];
  return (
    <div
      className="relative aspect-[16/10] flex items-end p-3 overflow-hidden"
      style={!posterUrl ? { background: tileColor } : undefined}
    >
      {posterUrl && (
        <Image
          src={posterUrl}
          alt={titleEn ?? ''}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
      <span className="relative z-[2] text-[14px] font-medium leading-snug tracking-[-0.01em] text-white line-clamp-2">
        {titleEn}
      </span>
    </div>
  );
}

// ── Library variant ───────────────────────────────────────────────

export interface LibraryCardData {
  titleTh: string | null;
  titleEn: string | null;
  titleRomaji: string | null;
  posterUrl: string | null;
  tileColorIndex?: number;
  status: WatchStatus;
  currentEpisode: number;
  totalEpisodes: number;
  isFavorite: boolean;
  providerName: string | null;
  providerColor: string | null;
}

interface LibraryCardProps {
  data: LibraryCardData;
  showStatus?: boolean;
  /** Slot for the interactive FavoriteButton — rendered inside the fav circle */
  favoriteSlot?: React.ReactNode;
}

function LibraryCard({ data, showStatus = false, favoriteSlot }: LibraryCardProps) {
  const {
    titleTh, titleEn, titleRomaji, posterUrl,
    tileColorIndex = 0, status, currentEpisode, totalEpisodes,
    providerName, providerColor,
  } = data;

  const displayTitle = getDisplayTitle({ titleEn, titleRomaji, titleTh });
  const isPlan      = status === 'plan_to_watch';
  const showEp      = status === 'watching' || status === 'on_hold';
  const showProgress = !isPlan;

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-card overflow-hidden',
        'border-[0.5px] border-default bg-page',
        'transition-colors duration-fast ease-out hover:border-strong',
        status === 'dropped' && 'opacity-[0.78]',
      )}
    >
      {/* Fav button slot */}
      <div className="absolute top-2 right-2 z-[3] w-[26px] h-[26px] rounded-pill flex items-center justify-center bg-black/55">
        {favoriteSlot}
      </div>

      <Poster
        posterUrl={posterUrl}
        titleEn={titleEn}
        tileColorIndex={tileColorIndex}
      />

      <div className="flex flex-col gap-1.5 px-3 pt-2.5 pb-3">
        <span className="text-md font-medium truncate tracking-[-0.005em]">
          {displayTitle}
        </span>

        <div className="flex items-center flex-wrap gap-2">
          {providerName && providerColor && (
            <ProviderBadge name={providerName} color={providerColor} />
          )}
          {showStatus && <StatusPill status={status} />}
          {showEp && (
            <span className="text-[11px] text-tertiary tabular-nums whitespace-nowrap">
              ep <span className="text-primary font-medium">{currentEpisode}</span> of {totalEpisodes}
            </span>
          )}
        </div>

        {showProgress && (
          <ProgressBar value={currentEpisode} total={totalEpisodes} />
        )}
      </div>
    </div>
  );
}

// ── Search variant ────────────────────────────────────────────────

export interface SearchCardData {
  titleTh: string | null;
  titleEn: string | null;
  titleRomaji: string | null;
  posterUrl: string | null;
  tileColorIndex?: number;
  mediaType: string;
  seasonYear: number | null;
}

interface SearchCardProps {
  data: SearchCardData;
  onAdd?: () => void;
}

function SearchCard({ data, onAdd }: SearchCardProps) {
  const { titleTh, titleEn, titleRomaji, posterUrl, tileColorIndex = 0, mediaType, seasonYear } = data;
  const displayTitle = getDisplayTitle({ titleEn, titleRomaji, titleTh });

  return (
    <div
      className={cn(
        'flex flex-col rounded-card overflow-hidden',
        'border-[0.5px] border-default bg-page',
        'transition-colors duration-fast ease-out hover:border-strong',
      )}
    >
      <Poster
        posterUrl={posterUrl}
        titleEn={titleEn}
        tileColorIndex={tileColorIndex}
      />

      <div className="flex flex-col gap-1.5 px-3 pt-2.5 pb-3">
        <span className="text-md font-medium truncate tracking-[-0.005em]">
          {displayTitle}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-tertiary">
            {mediaType}{seasonYear ? ` · ${seasonYear}` : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-[22px] px-2 text-[11px] ml-auto"
            onClick={onAdd}
          >
            <Icon as={Plus} size={12} />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Exports ───────────────────────────────────────────────────────

export const MediaCard = {
  Library: LibraryCard,
  Search:  SearchCard,
};

export { StatusPill, ProgressBar };
