interface SparkleProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Sparkle({ className, style }: SparkleProps) {
  return (
    <svg
      viewBox="0 0 100 160"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path
        d="M 50 0 C 50 60, 55 75, 100 80 C 55 85, 50 100, 50 160 C 50 100, 45 85, 0 80 C 45 75, 50 60, 50 0 Z"
        fill="#D4537E"
      />
    </svg>
  );
}
