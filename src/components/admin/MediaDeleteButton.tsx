"use client";

import { useState, useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import type { ButtonSize } from "@/components/ui/button-variants";
import { deleteMediaAction, type DeleteActionState } from "@/app/actions/media";

export function MediaDeleteButton({
  id,
  title,
  size = "sm",
}: {
  id: string;
  title: string;
  size?: ButtonSize;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = deleteMediaAction.bind(null, id) as unknown as (
    prevState: DeleteActionState,
    formData: FormData,
  ) => Promise<DeleteActionState>;
  const [state, action, pending] = useActionState<DeleteActionState, FormData>(boundAction, {});

  return (
    <>
      <Button variant="destructive" size={size} onClick={() => setOpen(true)}>
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
        description="This action cannot be undone. All user library entries for this media will also be removed."
      />
    </>
  );
}
