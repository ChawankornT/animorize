interface SparkleProps {
  className?: string;
  style?: React.CSSProperties;
  /** Width in px. Height is derived automatically (ratio 1.6:1 from viewBox 100×160). */
  size?: number;
}

export function Sparkle({ className, style, size }: SparkleProps) {
  const sizeStyle: React.CSSProperties = size !== undefined
    ? { width: size, height: size * 1.6 }
    : {};
  return (
    <svg
      viewBox="0 0 100 160"
      aria-hidden="true"
      className={className}
      style={{ ...sizeStyle, ...style }}
    >
      <path
        d="M 50 0 C 50 60, 55 75, 100 80 C 55 85, 50 100, 50 160 C 50 100, 45 85, 0 80 C 45 75, 50 60, 50 0 Z"
        fill="#D4537E"
      />
    </svg>
  );
}
