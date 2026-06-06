"use client";

import { useActionState } from "react";
import { RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ButtonSize } from "@/components/ui/button-variants";
import { retrySyncAction, type RetrySyncState } from "@/app/actions/anilist";

const ICONS = { retry: RotateCcw, sync: RefreshCw } as const;

interface Props {
  mediaId: string;
  mediaTitle: string;
  label?: string;
  pendingLabel?: string;
  icon?: keyof typeof ICONS;
  size?: ButtonSize;
}

export function RetrySyncButton({
  mediaId,
  mediaTitle,
  label = "Retry",
  pendingLabel = "Retrying…",
  icon = "retry",
  size = "sm",
}: Props) {
  const [state, action, pending] = useActionState<RetrySyncState, FormData>(retrySyncAction, {});

  return (
    <form action={action} className="relative inline-flex">
      <input type="hidden" name="mediaId" value={mediaId} />
      <Button
        type="submit"
        size={size}
        variant="secondary"
        disabled={pending}
        aria-label={`${label} sync for ${mediaTitle}`}
      >
        {!pending && <Icon as={ICONS[icon]} size={15} />}
        {pending ? pendingLabel : label}
      </Button>
      {state.message && (
        <p
          className={`absolute top-full right-0 mt-1 text-xs whitespace-nowrap ${state.success ? "text-success" : "text-error"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
