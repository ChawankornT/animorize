"use client";

import { useOptimistic, useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Star } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Sparkle } from "@/components/brand/Sparkle";
import { ToastPortal } from "@/components/ui/ToastPortal";
import { useToast } from "@/hooks/useToast";
import { toggleFavoriteAction } from "@/app/actions/userMedia";

interface FavoriteButtonProps {
  userMediaId: string;
  isFavorite: boolean;
  /** "icon" = circular icon-only (MediaCard overlay, default). "inline" = full-width labeled ghost button (tracker card). */
  variant?: "icon" | "inline";
}

export function FavoriteButton({ userMediaId, isFavorite, variant = "icon" }: FavoriteButtonProps) {
  const [optimisticFav, setOptimisticFav] = useOptimistic(isFavorite);
  const [isPending, startTransition] = useTransition();
  const { toasts, show, dismiss } = useToast();
  const shouldReduceMotion = useReducedMotion();

  function handleToggle() {
    const next = !optimisticFav;
    startTransition(async () => {
      try {
        setOptimisticFav(next);
        const result = await toggleFavoriteAction(userMediaId, next);
        if (!result.success) {
          show(result.message, "error");
        }
      } catch {
        show("Failed to update favorite", "error");
      }
    });
  }

  const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

  const sparkleInitial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.3, rotate: -30 };

  const sparkleAnimate = shouldReduceMotion
    ? { opacity: 1 as number, transition: { duration: 0.12 } }
    : {
        opacity: 1 as number,
        scale: [0.3, 1.05, 1],
        rotate: [-30, 0],
        transition: {
          duration: 1.1,
          ease: easeOut,
          scale: { times: [0, 0.7, 1], ease: easeOut },
        },
      };

  const sparkle = (
    <motion.span
      key="sparkle"
      initial={sparkleInitial}
      animate={sparkleAnimate}
      className="flex items-center justify-center"
    >
      <Sparkle size={13} />
    </motion.span>
  );

  return (
    <>
      {variant === "inline" ? (
        <Button
          variant="ghost"
          size="md"
          className="w-full"
          aria-label={optimisticFav ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={optimisticFav}
          disabled={isPending}
          onClick={handleToggle}
        >
          {optimisticFav ? (
            <>{sparkle} Favorited</>
          ) : (
            <>
              <Icon as={Star} size={16} /> Favorite
            </>
          )}
        </Button>
      ) : (
        <button
          aria-label={optimisticFav ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={optimisticFav}
          disabled={isPending}
          onClick={handleToggle}
          className="flex items-center justify-center w-full h-full disabled:cursor-not-allowed"
          style={{ color: "#fff" }}
        >
          {optimisticFav ? sparkle : <Icon as={Star} size={14} />}
        </button>
      )}

      <ToastPortal toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
