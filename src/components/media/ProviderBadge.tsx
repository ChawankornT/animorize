interface ProviderBadgeProps {
  name: string;
  color: string;
}

export function ProviderBadge({ name, color }: ProviderBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="shrink-0 rounded-[2px]"
        style={{ width: 8, height: 8, background: color }}
        aria-hidden="true"
      />
      <span className="text-xs text-tertiary whitespace-nowrap">{name}</span>
    </span>
  );
}
