"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className={cn(
        "w-[min(420px,calc(100%-32px))] p-0 m-auto",
        "bg-page rounded-modal border-[0.5px] border-default",
        "backdrop:bg-overlay",
        className,
      )}
    >
      <div className="p-6 text-left">
        {title && (
          <h2 className="text-xl font-medium tracking-tight text-primary mb-3">
            {title}
          </h2>
        )}
        <div className="text-sm text-secondary leading-[1.6]">{children}</div>
        {actions && (
          <div className="flex items-center justify-end gap-2 mt-4">
            {actions}
          </div>
        )}
      </div>
    </dialog>
  );
}
