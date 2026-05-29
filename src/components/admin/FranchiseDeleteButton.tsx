'use client';

import { useState, useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  deleteFranchiseAction,
  type DeleteActionState,
} from '@/app/actions/franchise';

export function FranchiseDeleteButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = deleteFranchiseAction.bind(null, id) as unknown as (
    prevState: DeleteActionState,
    formData: FormData,
  ) => Promise<DeleteActionState>;
  const [state, action, pending] = useActionState<DeleteActionState, FormData>(
    boundAction,
    {},
  );

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
        description="This action cannot be undone. Media in this franchise will have their franchise cleared."
      />
    </>
  );
}
