"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { RotateCcw, CheckCircle2, Check, MoreHorizontal } from "lucide-react";
import { useEpisodeTracker } from "@/hooks/useEpisodeTracker";
import { StatusPill, ProgressBar } from "@/components/media/MediaCard";
import { FavoriteButton } from "@/components/media/FavoriteButton";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import type { WatchStatus } from "@/domain/entities/UserMedia";
import type { AiringStatus } from "@/domain/entities/Media";

interface EpisodeTrackerProps {
  userMediaId: string;
  currentEpisode: number;
  totalEpisodes: number;
  status: WatchStatus;
  isMovie: boolean;
  airingStatus: AiringStatus;
  isFavorite: boolean;
}

export function EpisodeTracker({
  userMediaId,
  currentEpisode,
  totalEpisodes,
  status,
  isMovie,
  airingStatus,
  isFavorite,
}: EpisodeTrackerProps) {
  const t = useEpisodeTracker({ userMediaId, currentEpisode, totalEpisodes, status, airingStatus });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const More = (
    <Button variant="ghost" size="md" disabled aria-label="More options">
      <Icon as={MoreHorizontal} size={16} />
    </Button>
  );

  const rewatchCopy = isMovie
    ? { title: "Watch again?", body: "Logs another watch. Your history stays.", cta: "Watch again" }
    : {
        title: "Start over from episode 1?",
        body: "Your watch history stays — progress resets to the start.",
        cta: "Rewatch",
      };

  return (
    <>
      <div className="flex flex-col gap-3 p-3 border-[0.5px] border-default rounded-card bg-page">
        {isMovie ? (
          <MovieTracker t={t} More={More} onRewatch={() => setConfirmOpen(true)} />
        ) : (
          <SeriesTracker
            t={t}
            totalEpisodes={totalEpisodes}
            airingStatus={airingStatus}
            More={More}
            onRewatch={() => setConfirmOpen(true)}
          />
        )}
        <FavoriteButton variant="inline" userMediaId={userMediaId} isFavorite={isFavorite} />
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={rewatchCopy.title}
        actions={
          <>
            <Button variant="ghost" size="md" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setConfirmOpen(false);
                t.startRewatch();
              }}
            >
              <Icon as={RotateCcw} size={15} /> {rewatchCopy.cta}
            </Button>
          </>
        }
      >
        {rewatchCopy.body}
      </Modal>

      {typeof document !== "undefined" &&
        t.toasts.length > 0 &&
        createPortal(
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-90 flex flex-col gap-2 pointer-events-none"
            aria-live="polite"
          >
            {t.toasts.map(toast => (
              <Toast
                key={toast.id}
                variant={toast.variant}
                title={toast.title}
                onClose={() => t.dismiss(toast.id)}
                className="pointer-events-auto"
              />
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

// ── Movie tracker ──────────────────────────────────────────────

interface MovieTrackerProps {
  t: ReturnType<typeof useEpisodeTracker>;
  More: React.ReactNode;
  onRewatch: () => void;
}

function MovieTracker({ t, More, onRewatch }: MovieTrackerProps) {
  const watched = t.status === "completed";

  return (
    <>
      <div className="flex items-center justify-between">
        <StatusPill status={t.status} />
        {watched && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary tabular-nums">
            <Icon as={CheckCircle2} size={15} /> Watched
          </span>
        )}
      </div>

      {watched ? (
        <>
          <div className="flex gap-1.5">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              disabled={t.isPending}
              onClick={onRewatch}
            >
              <Icon as={RotateCcw} size={15} /> Watch again
            </Button>
            {More}
          </div>
          <button
            className="self-start text-xs text-tertiary hover:text-secondary transition-colors pt-0.5"
            disabled={t.isPending}
            onClick={t.unmarkWatched}
          >
            Unmark as watched
          </button>
        </>
      ) : (
        <div className="flex gap-1.5">
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            disabled={t.isPending}
            onClick={t.markWatched}
          >
            <Icon as={Check} size={15} /> Mark as watched
          </Button>
          {More}
        </div>
      )}
    </>
  );
}

// ── Series tracker ─────────────────────────────────────────────

interface SeriesTrackerProps {
  t: ReturnType<typeof useEpisodeTracker>;
  totalEpisodes: number;
  airingStatus: AiringStatus;
  More: React.ReactNode;
  onRewatch: () => void;
}

function SeriesTracker({ t, totalEpisodes, airingStatus, More, onRewatch }: SeriesTrackerProps) {
  const isCompleted = t.status === "completed";
  const isInterrupted = t.status === "dropped" || t.status === "on_hold";
  const canIncrement = t.episode < totalEpisodes;
  const canRewatch = isCompleted || isInterrupted;
  const isCaughtUp =
    totalEpisodes > 0 &&
    t.episode >= totalEpisodes &&
    airingStatus === "ongoing" &&
    t.status === "watching";

  return (
    <>
      <div className="flex items-center justify-between">
        <StatusPill status={t.status} />
        <span className="text-sm text-secondary tabular-nums">
          ep <b className="text-primary font-medium">{t.episode}</b> of {totalEpisodes}
        </span>
      </div>

      <ProgressBar value={t.episode} total={totalEpisodes} />

      {canRewatch && canIncrement ? (
        // ① interrupted mid-way: +1 + rewatch
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              disabled={t.isPending}
              onClick={t.incrementEpisode}
            >
              +1 episode
            </Button>
            {More}
          </div>
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            disabled={t.isPending}
            onClick={onRewatch}
          >
            <Icon as={RotateCcw} size={15} /> Rewatch
          </Button>
        </div>
      ) : canRewatch ? (
        // ② completed or interrupted at cap: rewatch only
        <div className="flex gap-1.5">
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            disabled={t.isPending}
            onClick={onRewatch}
          >
            <Icon as={RotateCcw} size={15} /> Rewatch
          </Button>
          {More}
        </div>
      ) : canIncrement ? (
        // ③ watching / plan_to_watch mid-way: +1 only
        <div className="flex gap-1.5">
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            disabled={t.isPending}
            onClick={t.incrementEpisode}
          >
            +1 episode
          </Button>
          {More}
        </div>
      ) : isCaughtUp ? (
        // ④ ongoing caught up
        <div className="flex items-center justify-between">
          <span className="text-sm text-tertiary">Caught up — waiting for new episodes</span>
          {More}
        </div>
      ) : (
        // ⑤ all episodes watched (e.g. ongoing→finished while watching)
        <div className="flex items-center justify-between">
          <span className="text-sm text-tertiary">All episodes watched</span>
          {More}
        </div>
      )}
    </>
  );
}
