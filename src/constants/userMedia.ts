import type { WatchStatus } from '@/domain/entities/UserMedia';

export const STATUS_LABEL: Record<WatchStatus, string> = {
  watching:      'Watching',
  plan_to_watch: 'Plan to watch',
  on_hold:       'On hold',
  completed:     'Completed',
  dropped:       'Dropped',
};
