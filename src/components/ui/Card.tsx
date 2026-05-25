import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface';
  interactive?: boolean;
}

function CardRoot({
  variant = 'default',
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border-[0.5px] border-default p-4 px-5',
        variant === 'default' ? 'bg-page' : 'bg-surface',
        interactive && 'transition-colors duration-fast ease-out hover:border-strong cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-xl font-medium text-primary', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('text-md text-secondary leading-[1.6]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardActions({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-2 mt-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export const Card = Object.assign(CardRoot, {
  Title: CardTitle,
  Body: CardBody,
  Actions: CardActions,
});
