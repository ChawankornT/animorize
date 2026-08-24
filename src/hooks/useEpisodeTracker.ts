"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { computeStatusAfterIncrement } from "@/domain/entities/UserMedia";
import {
  incrementEpisodeAction,
  startRewatchAction,
  unmarkWatchedAction,
  type UserMediaActionResult,
} from "@/app/actions/userMedia";
import type { WatchStatus } from "@/domain/entities/UserMedia";
import type { AiringStatus } from "@/domain/entities/Media";

interface Params {
  userMediaId: string;
  currentEpisode: number;
  totalEpisodes: number;
  status: WatchStatus;
  airingStatus: AiringStatus;
}

interface TrackerState {
  episode: number;
  status: WatchStatus;
}

export function useEpisodeTracker({
  userMediaId,
  currentEpisode,
  totalEpisodes,
  status,
  airingStatus,
}: Params) {
  const [state, setState] = useOptimistic<TrackerState>({ episode: currentEpisode, status });
  const [isPending, startTransition] = useTransition();
  const { toasts, show, dismiss } = useToast();
  const router = useRouter();

  function run(action: () => Promise<UserMediaActionResult>, optimisticNext: TrackerState) {
    startTransition(async () => {
      setState(optimisticNext);
      try {
        const result = await action();
        if (result.success) {
          router.refresh();
        } else if (result.reason === "stale") {
          router.refresh();
        } else {
          show(result.message, "error");
        }
      } catch {
        show("Failed to update", "error");
      }
    });
  }

  return {
    episode: state.episode,
    status: state.status,
    isPending,
    toasts,
    dismiss,
    incrementEpisode() {
      const from = state.episode;
      const next = from + 1;
      run(() => incrementEpisodeAction(userMediaId, from), {
        episode: next,
        status: computeStatusAfterIncrement(next, totalEpisodes, airingStatus),
      });
    },
    markWatched() {
      run(() => incrementEpisodeAction(userMediaId, 0), {
        episode: 1,
        status: computeStatusAfterIncrement(1, totalEpisodes, airingStatus),
      });
    },
    startRewatch() {
      run(() => startRewatchAction(userMediaId), { episode: 0, status: "watching" });
    },
    unmarkWatched() {
      run(() => unmarkWatchedAction(userMediaId), { episode: 0, status: "plan_to_watch" });
    },
  };
}
