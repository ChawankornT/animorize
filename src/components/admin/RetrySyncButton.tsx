'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { retrySyncAction, type RetrySyncState } from '@/app/actions/anilist';

interface Props {
  mediaId: string;
  mediaTitle: string;
  label?: string;
  pendingLabel?: string;
}

export function RetrySyncButton({ mediaId, mediaTitle, label = 'Retry', pendingLabel = 'Retrying…' }: Props) {
  const [state, action, pending] = useActionState<RetrySyncState, FormData>(
    retrySyncAction,
    {},
  );

  return (
    <form action={action} className="relative inline-flex">
      <input type="hidden" name="mediaId" value={mediaId} />
      <Button type="submit" size="sm" variant="secondary" disabled={pending} aria-label={`${label} sync for ${mediaTitle}`}>
        {pending ? pendingLabel : label}
      </Button>
      {state.message && (
        <p className={`absolute top-full right-0 mt-1 text-xs whitespace-nowrap ${state.success ? 'text-success' : 'text-error'}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
