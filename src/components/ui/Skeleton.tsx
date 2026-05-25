import { cn } from '@/lib/utils/cn';

type SkeletonVariant = 'text' | 'title' | 'circle' | 'card';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-3 w-full rounded-sm',
  title: 'h-[18px] w-3/4 rounded-sm',
  circle: 'size-10 rounded-full',
  card: 'h-32 w-full rounded-card',
};

export function Skeleton({
  variant = 'text',
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-skeleton',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
