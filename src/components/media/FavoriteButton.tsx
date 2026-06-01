'use client';

import { useOptimistic, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Star } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { Sparkle } from '@/components/brand/Sparkle';
import { Toast } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { toggleFavoriteAction } from '@/app/actions/userMedia';

interface FavoriteButtonProps {
  userMediaId: string;
  isFavorite: boolean;
}

export function FavoriteButton({ userMediaId, isFavorite }: FavoriteButtonProps) {
  const [optimisticFav, setOptimisticFav] = useOptimistic(isFavorite);
  const [isPending, startTransition] = useTransition();
  const { toasts, show, dismiss } = useToast();
  const shouldReduceMotion = useReducedMotion();

  function handleToggle() {
    const next = !optimisticFav;
    startTransition(async () => {
      setOptimisticFav(next);
      const result = await toggleFavoriteAction(userMediaId, next);
      if (!result.success) {
        show(result.message, 'error');
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

  return (
    <>
      <button
        aria-label={optimisticFav ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={optimisticFav}
        disabled={isPending}
        onClick={handleToggle}
        className="flex items-center justify-center w-full h-full disabled:cursor-not-allowed"
        style={{ color: '#fff' }}
      >
        {optimisticFav ? (
          <motion.span
            key="sparkle"
            initial={sparkleInitial}
            animate={sparkleAnimate}
            className="flex items-center justify-center"
          >
            <Sparkle size={13} />
          </motion.span>
        ) : (
          <Icon as={Star} size={14} />
        )}
      </button>

      {toasts.length > 0 && createPortal(
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex flex-col gap-2 pointer-events-none"
          aria-live="polite"
        >
          {toasts.map(t => (
            <Toast
              key={t.id}
              variant={t.variant}
              title={t.title}
              onClose={() => dismiss(t.id)}
              className="pointer-events-auto"
            />
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}
