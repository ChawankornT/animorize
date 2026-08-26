"use client";

import { createPortal } from "react-dom";
import { Toast } from "@/components/ui/Toast";

interface ToastState {
  id: number;
  title: string;
  description?: string;
  variant: "success" | "warning" | "error" | "info";
}

interface ToastPortalProps {
  toasts: ToastState[];
  onDismiss: (id: number) => void;
}

/**
 * Positions toasts from `useToast` at the bottom of the viewport and portals
 * them to `document.body`. Purely a layout container — no ARIA here. Each
 * `Toast` already carries its own `role` (status/alert), so a live region on
 * this wrapper would create two competing announcements for the same node.
 */
export function ToastPortal({ toasts, onDismiss }: ToastPortalProps) {
  if (typeof document === "undefined" || toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-90 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <Toast
          key={t.id}
          variant={t.variant}
          title={t.title}
          description={t.description}
          onClose={() => onDismiss(t.id)}
          className="pointer-events-auto"
        />
      ))}
    </div>,
    document.body,
  );
}
