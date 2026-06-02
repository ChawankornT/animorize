'use client';

import { cn } from '@/lib/utils/cn';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b-[0.5px] border-default', className)} role="tablist">
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          aria-selected={value === item.value}
          className={cn(
            'px-3 pt-2 pb-2.5 text-md font-medium cursor-pointer',
            'border-b-2 -mb-px bg-transparent',
            'transition-colors duration-fast ease-out',
            value === item.value
              ? 'text-primary border-primary'
              : 'text-secondary border-transparent hover:text-primary',
          )}
          onClick={() => onChange?.(item.value)}
        >
          {item.label}
          {item.count != null && (
            <span className="ml-1.5 text-[11px] text-tertiary font-normal">
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
