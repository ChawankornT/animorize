import type { WatchStatus } from "@/domain/entities/UserMedia";

export const STATUS_LABEL: Record<WatchStatus, string> = {
  watching: "Watching",
  plan_to_watch: "Plan to watch",
  on_hold: "On hold",
  completed: "Completed",
  dropped: "Dropped",
};

export const STATUS_PRIORITY: Record<WatchStatus, number> = {
  watching: 0,
  plan_to_watch: 1,
  on_hold: 2,
  completed: 3,
  dropped: 4,
};
