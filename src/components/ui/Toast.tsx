"use client";

import { cn } from "@/lib/utils/cn";

type ToastVariant = "success" | "warning" | "error" | "info";

interface ToastProps {
  variant?: ToastVariant;
  title: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

const iconConfig: Record<ToastVariant, { paths: string[]; color: string }> = {
  success: {
    paths: ["M22 11.08V12a10 10 0 1 1-5.93-9.14", "M9 11l3 3L22 4"],
    color: "text-success",
  },
  warning: {
    paths: [
      "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z",
      "M12 9v4",
      "M12 17h.01",
    ],
    color: "text-warning",
  },
  error: {
    paths: [
      "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z",
      "M15 9l-6 6",
      "M9 9l6 6",
    ],
    color: "text-error",
  },
  info: {
    paths: [
      "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z",
      "M12 16v-4",
      "M12 8h.01",
    ],
    color: "text-info",
  },
};

export function Toast({ variant = "info", title, description, onClose, className }: ToastProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 min-w-70 max-w-90",
        "bg-page rounded-card border-[0.5px] border-default",
        "p-3 px-3.5",
        className,
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("mt-0.5 shrink-0", iconConfig[variant].color)}
        aria-hidden="true"
      >
        {iconConfig[variant].paths.map(d => (
          <path key={d} d={d} />
        ))}
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-md font-medium text-primary">{title}</p>
        {description && <p className="text-sm text-secondary mt-0.5">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-0.5 text-tertiary hover:text-primary transition-colors duration-fast ease-out cursor-pointer"
          aria-label="Dismiss"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
