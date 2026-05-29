'use client';

import { useState, useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { deleteMediaAction, type DeleteActionState } from '@/app/actions/media';

export function MediaDeleteButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = deleteMediaAction.bind(null, id) as unknown as (
    prevState: DeleteActionState,
    formData: FormData,
  ) => Promise<DeleteActionState>;
  const [state, action, pending] = useActionState<DeleteActionState, FormData>(boundAction, {});

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <DeleteConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        action={action}
        pending={pending}
        error={state.error}
        title={`Delete "${title}"?`}
        description="This action cannot be undone. All user library entries for this media will also be removed."
      />
    </>
  );
}
