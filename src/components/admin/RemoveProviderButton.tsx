"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { removeProviderAction, type RemoveProviderState } from "@/app/actions/mediaProvider";

interface Props {
  id: string;
  mediaId: string;
  providerName: string;
}

export function RemoveProviderButton({ id, mediaId, providerName }: Props) {
  const [open, setOpen] = useState(false);

  const boundAction = removeProviderAction.bind(null, id);
  const [state, wrappedAction, pending] = useActionState<RemoveProviderState, FormData>(
    boundAction,
    {},
  );

  function actionWithMediaId(formData: FormData) {
    formData.set("mediaId", mediaId);
    wrappedAction(formData);
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Remove
      </Button>
      <DeleteConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        action={actionWithMediaId}
        pending={pending}
        error={state.error}
        title={`Remove "${providerName}"?`}
        description={`Remove ${providerName} from this media? This action cannot be undone.`}
        submitLabel="Remove"
        submitPendingLabel="Removing…"
      />
    </>
  );
}
