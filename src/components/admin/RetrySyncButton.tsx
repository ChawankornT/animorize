'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { retrySyncAction, type RetrySyncState } from '@/app/actions/anilist';

interface Props {
  mediaId: string;
  mediaTitle: string;
}

export function RetrySyncButton({ mediaId, mediaTitle }: Props) {
  const [state, action, pending] = useActionState<RetrySyncState, FormData>(
    retrySyncAction,
    {},
  );

  return (
    <form action={action} className="inline-flex flex-col items-end gap-1">
      <input type="hidden" name="mediaId" value={mediaId} />
      <Button type="submit" size="sm" variant="secondary" disabled={pending} aria-label={`Retry sync for ${mediaTitle}`}>
        {pending ? 'Retrying…' : 'Retry'}
      </Button>
      {state.message && (
        <p className={`text-xs ${state.success ? 'text-success' : 'text-error'}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
