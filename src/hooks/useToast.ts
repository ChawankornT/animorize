"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type ToastVariant = "success" | "warning" | "error" | "info";

interface ToastState {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const counterRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const show = useCallback(
    (
      title: string,
      variant: ToastVariant = "info",
      options?: { description?: string; durationMs?: number },
    ) => {
      const id = ++counterRef.current;
      setToasts(prev => [...prev, { id, title, description: options?.description, variant }]);
      const timer = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
        timersRef.current.delete(id);
      }, options?.durationMs ?? 3000);
      timersRef.current.set(id, timer);
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  return { toasts, show, dismiss };
}
