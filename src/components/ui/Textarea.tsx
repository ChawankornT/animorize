'use client';

import { cn } from '@/lib/utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-secondary">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'px-3 py-2.5 bg-page text-md text-primary rounded-input min-h-16',
          'border-[0.5px] border-default placeholder:text-tertiary',
          'transition-colors duration-fast ease-out',
          'hover:border-strong',
          'focus:border-primary focus:outline-none',
          error && 'border-error hover:border-error focus:border-error',
          'disabled:opacity-50 disabled:pointer-events-none',
          'resize-y',
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${textareaId}-error`} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${textareaId}-hint`} className="text-xs text-tertiary">
          {hint}
        </p>
      )}
    </div>
  );
}
