'use client';

import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'h-9 px-3 bg-page text-md text-primary rounded-input',
          'border-[0.5px] border-default placeholder:text-tertiary',
          'transition-colors duration-fast ease-out',
          'hover:border-strong',
          'focus:border-primary focus:outline-none',
          error && 'border-error hover:border-error focus:border-error',
          'disabled:opacity-50 disabled:pointer-events-none',
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-xs text-tertiary">
          {hint}
        </p>
      )}
    </div>
  );
}
