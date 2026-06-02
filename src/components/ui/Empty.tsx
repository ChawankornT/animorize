import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/Icon';

interface EmptyProps {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}

export function Empty({ icon, title, body, action, className }: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center text-center py-12 px-6 gap-3', className)}>
      <div className="size-14 rounded-card bg-surface flex items-center justify-center text-tertiary mb-2">
        <Icon as={icon} size={22} />
      </div>
      <h3 className="text-lg font-medium text-primary">{title}</h3>
      {body && (
        <p className="text-md text-secondary max-w-sm leading-body">{body}</p>
      )}
      {action}
    </div>
  );
}
