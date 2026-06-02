"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { MediaCard } from "@/components/media/MediaCard";
import { AddToLibraryModal } from "@/components/media/AddToLibraryModal";
import { searchMediaAction } from "@/app/actions/userMedia";
import type { Media } from "@/domain/entities/Media";
import { cn } from "@/lib/utils/cn";

function useDebounce(value: string, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

interface SearchViewProps {
  libraryMediaIds: string[];
}

export function SearchView({ libraryMediaIds }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [modalMedia, setModalMedia] = useState<Media | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const debouncedQuery = useDebounce(query, 300);

  const librarySet = useMemo(
    () => new Set([...libraryMediaIds, ...addedIds]),
    [libraryMediaIds, addedIds],
  );

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["search-media", debouncedQuery],
    queryFn: () => searchMediaAction(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const hasQuery = debouncedQuery.length >= 2;
  const showResults = hasQuery && results.length > 0;

  const handleAdd = useCallback((media: Media) => {
    setModalMedia(media);
  }, []);

  const handleAdded = useCallback((mediaId: string) => {
    setAddedIds(prev => new Set(prev).add(mediaId));
    setModalMedia(null);
  }, []);

  return (
    <div className="flex flex-col items-center px-6 py-8">
      {/* Search stage */}
      <div className="w-full max-w-180 flex flex-col items-center text-center gap-3 pt-12 mb-8">
        <h1 className="text-4xl font-medium tracking-tight leading-[1.1]">
          Find an anime, series, or movie.
        </h1>
        <p className="text-md text-secondary max-w-115 mb-4">
          Search by Thai, English, or romaji title.
        </p>

        <div className="relative w-full text-left">
          <div
            className={cn(
              "flex items-center gap-3 h-14 px-4.5 bg-page rounded-xl",
              "border-[0.5px] border-default",
              "transition-colors duration-fast ease-out",
              "focus-within:border-primary",
            )}
          >
            <span className="text-tertiary shrink-0">
              <Icon as={Search} size={18} />
            </span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="frieren, kimetsu, jujutsu…"
              className="flex-1 bg-transparent text-lg font-medium tracking-[-0.01em] text-primary placeholder:text-tertiary outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-tertiary hover:text-primary transition-colors duration-fast cursor-pointer"
              >
                <Icon as={X} size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {hasQuery && (
        <div className="w-full max-w-240">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-secondary">
              {isFetching ? (
                "Searching…"
              ) : (
                <>
                  <b>{results.length}</b> matches for{" "}
                  <span className="text-primary font-medium">&ldquo;{debouncedQuery}&rdquo;</span>
                </>
              )}
            </span>
          </div>

          {showResults && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {results.map(media => {
                const inLibrary = librarySet.has(media.id);
                return (
                  <MediaCard.Search
                    key={media.id}
                    data={{
                      titleTh: media.titleTh,
                      titleEn: media.titleEn,
                      titleRomaji: media.titleRomaji,
                      posterUrl: media.posterUrl,
                      mediaType: media.mediaType,
                      seasonYear: media.seasonYear,
                    }}
                    onAdd={inLibrary ? undefined : () => handleAdd(media)}
                  />
                );
              })}
            </div>
          )}

          {hasQuery && !isFetching && results.length === 0 && (
            <div className="text-center py-16">
              <p className="text-md text-secondary">No results found. Try a different title.</p>
            </div>
          )}
        </div>
      )}

      {/* Add to library modal */}
      {modalMedia && (
        <AddToLibraryModal
          media={modalMedia}
          onClose={() => setModalMedia(null)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}
