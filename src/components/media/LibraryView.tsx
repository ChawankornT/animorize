"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Icon } from "@/components/ui/Icon";
import { Tabs } from "@/components/ui/Tabs";
import { MediaCard, type LibraryCardData } from "@/components/media/MediaCard";
import { FavoriteButton } from "@/components/media/FavoriteButton";
import { Sparkle } from "@/components/brand/Sparkle";
import { TILE_COLORS } from "@/constants/admin";
import { librarySort } from "@/lib/utils/librarySort";
import type { UserMediaWithMedia } from "@/domain/entities/UserMedia";

interface LibraryViewProps {
  items: UserMediaWithMedia[];
  allCount: number;
  watchingCount: number;
  favoritesCount: number;
}

function toCardData(item: UserMediaWithMedia): LibraryCardData {
  return {
    titleTh: item.titleTh,
    titleEn: item.titleEn,
    titleRomaji: item.titleRomaji,
    posterUrl: item.posterUrl,
    tileColorIndex: item.mediaId.charCodeAt(0) % TILE_COLORS.length,
    status: item.status,
    currentEpisode: item.currentEpisode,
    totalEpisodes: item.totalEpisodes,
    isFavorite: item.isFavorite,
    providerName: item.providerName,
    providerColor: item.providerColor,
  };
}

function LibraryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-4 gap-3">{children}</div>;
}

function renderCard(item: UserMediaWithMedia, showStatus: boolean) {
  return (
    <MediaCard.Library
      key={item.id}
      data={toCardData(item)}
      showStatus={showStatus}
      favoriteSlot={<FavoriteButton userMediaId={item.id} isFavorite={item.isFavorite} />}
    />
  );
}

export function LibraryView({ items, allCount, watchingCount, favoritesCount }: LibraryViewProps) {
  const [tab, setTab] = useState("all");
  const sorted = useMemo(() => [...items].sort(librarySort), [items]);
  const watching = useMemo(() => sorted.filter(i => i.status === "watching"), [sorted]);
  const favNonWatching = useMemo(
    () => sorted.filter(i => i.isFavorite && i.status !== "watching"),
    [sorted],
  );

  const tabItems = [
    { value: "all", label: "All", count: allCount },
    { value: "watching", label: "Watching", count: watchingCount },
    { value: "favorites", label: "Favorites", count: favoritesCount },
  ];

  return (
    <div className="px-8 py-6 flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium tracking-tight leading-none mb-1.5">Library</h1>
          <p className="text-sm text-tertiary">
            {watchingCount} watching · {favoritesCount} favorites · {allCount} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className={buttonVariants({ variant: "primary", size: "md" }) + " gap-2"}
          >
            <Icon as={Plus} size={16} />
            Add media
          </Link>
        </div>
      </div>

      <Tabs items={tabItems} value={tab} onChange={setTab} />

      {/* Tab content */}
      {tab === "all" && (
        <AllView
          sorted={sorted}
          watching={watching}
          favNonWatching={favNonWatching}
          allCount={allCount}
        />
      )}

      {tab === "watching" && (
        <LibraryGrid>{watching.map(item => renderCard(item, false))}</LibraryGrid>
      )}

      {tab === "favorites" && (
        <LibraryGrid>
          {sorted.filter(i => i.isFavorite).map(item => renderCard(item, true))}
        </LibraryGrid>
      )}
    </div>
  );
}

function AllView({
  sorted,
  watching,
  favNonWatching,
  allCount,
}: {
  sorted: UserMediaWithMedia[];
  watching: UserMediaWithMedia[];
  favNonWatching: UserMediaWithMedia[];
  allCount: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Currently watching */}
      {watching.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-medium tracking-[-0.01em]">Currently watching</h2>
            <span className="text-xs text-tertiary">Sorted by last watched</span>
          </div>
          <LibraryGrid>{watching.map(item => renderCard(item, false))}</LibraryGrid>
        </section>
      )}

      {/* Favorites (status ≠ watching) */}
      {favNonWatching.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-medium tracking-[-0.01em] inline-flex items-center gap-2">
              <Sparkle size={14} />
              Favorites
            </h2>
            <span className="text-xs text-tertiary">{favNonWatching.length} titles</span>
          </div>
          <LibraryGrid>{favNonWatching.map(item => renderCard(item, true))}</LibraryGrid>
        </section>
      )}

      {/* All titles */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-medium tracking-[-0.01em]">All titles</h2>
          <span className="text-xs text-tertiary">{allCount} titles</span>
        </div>
        <LibraryGrid>{sorted.map(item => renderCard(item, true))}</LibraryGrid>
      </section>
    </div>
  );
}
