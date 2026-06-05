"use client";

import { useState, useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { deleteFranchiseAction, type DeleteActionState } from "@/app/actions/franchise";

export function FranchiseDeleteButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = deleteFranchiseAction.bind(null, id) as unknown as (
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
        title={`Delete "${title}"?`}
        description="This action cannot be undone. Media in this franchise will have their franchise cleared."
      />
    </>
  );
}
