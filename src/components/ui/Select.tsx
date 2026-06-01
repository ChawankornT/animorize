'use client';

import { cn } from '@/lib/utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function Select({
  label,
  hint,
  error,
  className,
  id,
  children,
  ...props
}: SelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-secondary">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'h-9 px-3 bg-page text-md text-primary rounded-input appearance-none',
          'border-[0.5px] border-default',
          'transition-colors duration-fast ease-out',
          'hover:border-strong',
          'focus:border-primary focus:outline-none',
          error && 'border-error hover:border-error focus:border-error',
          'disabled:opacity-50 disabled:pointer-events-none',
          'bg-size-[16px_16px] bg-position-[right_12px_center] bg-no-repeat',
          "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${selectId}-hint`} className="text-xs text-tertiary">
          {hint}
        </p>
      )}
    </div>
  );
}
