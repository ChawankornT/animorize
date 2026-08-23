import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { EpisodeTracker } from "@/components/media/EpisodeTracker";
import { ProviderBadge } from "@/components/media/ProviderBadge";
import { FavoriteButton } from "@/components/media/FavoriteButton";
import { buttonVariants } from "@/components/ui/button-variants";
import { getDisplayTitle } from "@/domain/entities/title";
import { isTrackable } from "@/domain/entities/Media";
import { TILE_COLORS } from "@/constants/admin";
import { MEDIA_TYPE_LABELS, SEASON_LABELS } from "@/constants/admin";
import { formatTimestamp } from "@/lib/utils/formatTimestamp";
import type { Media } from "@/domain/entities/Media";
import type { UserMediaWithMedia } from "@/domain/entities/UserMedia";
import type { MediaProvider } from "@/domain/entities/MediaProvider";
import type { WatchLog } from "@/domain/entities/WatchLog";

const AUDIO_LABELS: Record<string, string> = {
  sub: "original · sub",
  dub: "thai · dub",
};

interface MediaDetailViewProps {
  media: Media;
  userMedia: UserMediaWithMedia;
  providers: MediaProvider[];
  watchLogs: WatchLog[];
}

export function MediaDetailView({ media, userMedia, providers, watchLogs }: MediaDetailViewProps) {
  const displayTitle = getDisplayTitle({
    titleEn: media.titleEn,
    titleRomaji: media.titleRomaji,
    titleTh: media.titleTh,
  });
  const isMovie = !isTrackable(media);
  const tileColorIndex = media.id.charCodeAt(0) % TILE_COLORS.length;

  return (
    <div className="px-8 py-6 flex flex-col gap-6">
      {/* 2.1 Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        <Link href="/dashboard" className="text-tertiary hover:text-primary transition-colors">
          Library
        </Link>
        <Icon as={ChevronRight} size={12} />
        <span className="text-primary font-medium truncate max-w-80">{displayTitle}</span>
      </nav>

      {/* Main layout: poster aside + content */}
      <div className="flex gap-8">
        {/* Left aside: poster + tracking summary */}
        <div className="shrink-0 w-64 flex flex-col gap-4">
          <DetailPoster
            posterUrl={media.posterUrl}
            titleEn={media.titleEn}
            tileColorIndex={tileColorIndex}
          />

          <EpisodeTracker
            userMediaId={userMedia.id}
            currentEpisode={userMedia.currentEpisode}
            totalEpisodes={media.totalEpisodes}
            status={userMedia.status}
            isMovie={isMovie}
            airingStatus={media.airingStatus}
          />

          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded-pill flex items-center justify-center bg-black/55">
              <FavoriteButton userMediaId={userMedia.id} isFavorite={userMedia.isFavorite} />
            </div>
            <span className="text-xs text-tertiary">
              {userMedia.isFavorite ? "Favorited" : "Add to favorites"}
            </span>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* 2.4 Titles + meta */}
          <div className="flex flex-col gap-3">
            {media.titleEn && (
              <h1 className="text-3xl font-medium tracking-tight leading-tight">{media.titleEn}</h1>
            )}
            {media.titleRomaji && (
              <p className="text-lg text-secondary leading-snug">{media.titleRomaji}</p>
            )}
            {media.titleTh && <p className="text-md text-tertiary leading-snug">{media.titleTh}</p>}

            <div className="flex items-center flex-wrap gap-2 mt-1">
              <Badge>{MEDIA_TYPE_LABELS[media.mediaType]}</Badge>
              {media.seasonQuarter && media.seasonYear && (
                <Badge>
                  {SEASON_LABELS[media.seasonQuarter]} {media.seasonYear}
                </Badge>
              )}
              {!isMovie && <Badge>{media.totalEpisodes} episodes</Badge>}
              {media.airingStatus === "ongoing" ? (
                <Badge variant="success" dot>
                  Airing now
                </Badge>
              ) : (
                <Badge>Finished airing</Badge>
              )}
              {media.genres.map(genre => (
                <Badge key={genre}>{genre}</Badge>
              ))}
            </div>
          </div>

          {/* 2.5 Synopsis */}
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">Synopsis</h2>
            <p className="text-sm text-secondary leading-relaxed whitespace-pre-line">
              {media.synopsis ?? "No synopsis available."}
            </p>
          </section>

          {/* 2.6 Provider table */}
          <ProviderTable
            providers={providers}
            currentProviderId={userMedia.providerId}
            currentAudio={userMedia.audio}
          />

          {/* 2.7 Watch history */}
          <WatchHistory watchLogs={watchLogs} isMovie={isMovie} />
        </div>
      </div>
    </div>
  );
}

// ── Detail Poster ────────────────────────────────────────────────

interface DetailPosterProps {
  posterUrl: string | null;
  titleEn: string | null;
  tileColorIndex: number;
}

function DetailPoster({ posterUrl, titleEn, tileColorIndex }: DetailPosterProps) {
  const tileColor = TILE_COLORS[tileColorIndex % TILE_COLORS.length];

  return (
    <div
      className="relative aspect-3/4 rounded-card overflow-hidden"
      style={!posterUrl ? { background: tileColor } : undefined}
    >
      {posterUrl && (
        <Image
          src={posterUrl}
          alt={titleEn ?? ""}
          fill
          className="object-cover"
          sizes="256px"
          quality={90}
          priority
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-linear-to-t from-black/55 to-transparent pointer-events-none" />
    </div>
  );
}

// ── Provider Table ──────────────────────────────────────────────

interface ProviderTableProps {
  providers: MediaProvider[];
  currentProviderId: string | null;
  currentAudio: string;
}

function ProviderTable({ providers, currentProviderId, currentAudio }: ProviderTableProps) {
  if (providers.length === 0) {
    return (
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Where to watch</h2>
        <p className="text-sm text-tertiary">No providers assigned yet.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-medium">Where to watch</h2>
        <p className="text-xs text-tertiary mt-0.5">
          {providers.length} provider{providers.length !== 1 ? "s" : ""} &middot; sub &amp; dub
          support varies
        </p>
      </div>

      <div className="border-[0.5px] border-default rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-default bg-surface text-tertiary text-xs">
              <th className="text-left px-4 py-2.5 font-medium">Provider</th>
              <th className="text-left px-4 py-2.5 font-medium">Audio</th>
              <th className="text-left px-4 py-2.5 font-medium">Link</th>
              <th className="text-right px-4 py-2.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {providers.map(p => {
              const isCurrent =
                currentProviderId != null &&
                p.providerId === currentProviderId &&
                p.audio === currentAudio;

              return (
                <tr key={p.id} className="border-b border-default last:border-0">
                  <td className="px-4 py-3">
                    <ProviderBadge name={p.providerName} color={p.providerColor} />
                  </td>
                  <td className="px-4 py-3 text-xs text-secondary">
                    {AUDIO_LABELS[p.audio] ?? p.audio}
                  </td>
                  <td className="px-4 py-3">
                    {p.baseUrl ? (
                      <a
                        href={p.baseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-tertiary hover:text-primary transition-colors truncate max-w-48"
                      >
                        <Icon as={ExternalLink} size={14} />
                        <span className="truncate">{p.baseUrl}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-tertiary">&mdash;</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isCurrent ? (
                      <Badge variant="success" dot>
                        Tracking on this
                      </Badge>
                    ) : (
                      // Provider switching = deferred; render read-only ghost button
                      <button
                        disabled
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "opacity-50 cursor-not-allowed",
                        )}
                      >
                        Switch to
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Watch History ────────────────────────────────────────────────

interface WatchHistoryProps {
  watchLogs: WatchLog[];
  isMovie: boolean;
}

function WatchHistory({ watchLogs, isMovie }: WatchHistoryProps) {
  const sub = isMovie
    ? watchLogs.length > 0
      ? `last ${watchLogs.length} watch${watchLogs.length === 1 ? "" : "es"}`
      : ""
    : `last ${Math.min(watchLogs.length, 5)} episodes`;

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-medium">Watch history</h2>
        {sub && <p className="text-xs text-tertiary mt-0.5">{sub}</p>}
      </div>

      {watchLogs.length === 0 ? (
        <p className="text-sm text-tertiary">No watches logged yet.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {watchLogs.map(log => (
            <div
              key={log.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface transition-colors"
            >
              <span className="text-sm text-primary">
                {isMovie ? "Full film" : `ep ${log.episodeNumber}`}
              </span>
              <span className="text-xs text-tertiary tabular-nums">
                {formatTimestamp(log.watchedAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
