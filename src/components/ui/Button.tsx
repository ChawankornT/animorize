'use client';

import { cn } from '@/lib/utils/cn';
import {
  buttonVariants,
  variantStyles,
  sizeStyles,
  type ButtonVariant,
  type ButtonSize,
} from './button-variants';

export { buttonVariants };

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

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
