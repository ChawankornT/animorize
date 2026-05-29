'use client';

import { useState, useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { removeProviderAction, type RemoveProviderState } from '@/app/actions/mediaProvider';

interface Props {
  id: string;
  mediaId: string;
  providerName: string;
}

export function RemoveProviderButton({ id, mediaId, providerName }: Props) {
  const [open, setOpen] = useState(false);

  const boundAction = removeProviderAction.bind(null, id);
  const [state, action, pending] = useActionState<RemoveProviderState, FormData>(
    boundAction,
    {},
  );

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Remove
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Remove "${providerName}"?`}
        actions={
          <form action={action} className="contents">
            <input type="hidden" name="mediaId" value={mediaId} />
            <Button variant="secondary" size="sm" type="button" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" type="submit" disabled={pending}>
              {pending ? 'Removing…' : 'Remove'}
            </Button>
          </form>
        }
      >
        <p>Remove {providerName} from this media? This cannot be undone.</p>
        {state.error && (
          <p className="mt-2 text-sm text-error" role="alert">
            {state.error}
          </p>
        )}
      </Modal>
    </>
  );
}
