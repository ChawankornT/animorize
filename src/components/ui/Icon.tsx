import { type LucideIcon } from "lucide-react";

export function Icon({ as: Ico, size = 16 }: { as: LucideIcon; size?: number }) {
  return <Ico size={size} strokeWidth={1.5} />;
}
