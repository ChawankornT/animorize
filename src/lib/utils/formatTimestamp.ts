const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

/**
 * Formats a date string as a short relative/absolute timestamp.
 * - < 1 min → "just now"
 * - < 1 hour → "Nm ago"
 * - < 24 hours → "Nh ago"
 * - < 7 days → "Nd ago"
 * - otherwise → "1 Jan 2026" (en-GB day-month-year)
 */
export function formatTimestamp(dateStr: string, now: Date = new Date()): string {
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();

  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < DAY * 7) return `${Math.floor(diff / DAY)}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
