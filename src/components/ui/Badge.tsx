import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'count';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-page text-primary border-[0.5px] border-default',
  success:
    'bg-success-bg text-success border-transparent',
  warning:
    'bg-warning-bg text-warning border-transparent',
  error:
    'bg-error-bg text-error border-transparent',
  info:
    'bg-info-bg text-info border-transparent',
  count:
    'bg-primary text-inverse border-transparent h-[18px]',
};

export function Badge({
  variant = 'default',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 h-5 px-2 rounded-pill',
        'text-xs font-medium whitespace-nowrap',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className="size-1.5 rounded-full bg-current shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
