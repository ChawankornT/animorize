"use client";

import { useState, useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { deleteProviderAction, type DeleteActionState } from "@/app/actions/provider";

export function ProviderDeleteButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = deleteProviderAction.bind(null, id) as unknown as (
    prevState: DeleteActionState,
    formData: FormData,
  ) => Promise<DeleteActionState>;
  const [state, action, pending] = useActionState<DeleteActionState, FormData>(boundAction, {});

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Icon as={Trash2} size={15} />
        Delete
      </Button>
      <DeleteConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        action={action}
        pending={pending}
        error={state.error}
        title={`Delete "${name}"?`}
        description="This action cannot be undone. Any media using this provider must be reassigned first."
      />
    </>
  );
}
