import { cn } from "@/lib/utils/cn";
import { Sparkle } from "./Sparkle";

interface WordmarkProps {
  className?: string;
  size?: "sm" | "md";
}

const sizeClasses: Record<NonNullable<WordmarkProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-[17px]",
};

export function Wordmark({ className, size = "md" }: WordmarkProps) {
  return (
    <span
      className={cn(
        "font-medium tracking-[-0.02em] leading-none select-none",
        sizeClasses[size],
        className,
      )}
    >
      an
      <span className="relative inline-block">
        ı
        <Sparkle
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: "0.72em", height: "0.42em", width: "auto" }}
        />
      </span>
      morize
    </span>
  );
}
