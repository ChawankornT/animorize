"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  action: (formData: FormData) => void;
  pending: boolean;
  error?: string;
  title: string;
  description: string;
  submitLabel?: string;
  submitPendingLabel?: string;
}

export function DeleteConfirmModal({
  open,
  onClose,
  action,
  pending,
  error,
  title,
  description,
  submitLabel = "Delete",
  submitPendingLabel = "Deleting…",
}: DeleteConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <form action={action} className="contents">
          <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" type="submit" disabled={pending}>
            {pending ? submitPendingLabel : submitLabel}
          </Button>
        </form>
      }
    >
      <p>{description}</p>
      {error && (
        <p className="mt-2 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  );
}
