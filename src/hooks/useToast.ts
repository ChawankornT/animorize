'use client';

import { useState, useCallback, useRef } from 'react';

type ToastVariant = 'success' | 'warning' | 'error' | 'info';

interface ToastState {
  id: number;
  title: string;
  variant: ToastVariant;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const counterRef = useRef(0);

  const show = useCallback((title: string, variant: ToastVariant = 'info', durationMs = 3000) => {
    const id = ++counterRef.current;
    setToasts(prev => [...prev, { id, title, variant }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, durationMs);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}
