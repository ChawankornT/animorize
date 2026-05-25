'use client';

import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-inverse hover:bg-[#2A2A2A] dark:hover:bg-[#E5E4DE]',
  secondary:
    'bg-page text-primary border-[0.5px] border-strong hover:border-focus hover:bg-surface',
  ghost:
    'bg-transparent text-primary hover:bg-surface',
  destructive:
    'bg-page text-error border-[0.5px] border-strong hover:border-error',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-sm gap-1.5',
  md: 'h-[34px] px-3.5 text-md gap-2',
  lg: 'h-[42px] px-[18px] text-lg gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-button font-medium',
        'transition-colors duration-fast ease-out cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}
