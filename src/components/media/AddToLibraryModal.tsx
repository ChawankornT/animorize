"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { getAddToLibraryDataAction, addToLibraryAction } from "@/app/actions/userMedia";
import { getDisplayTitle } from "@/domain/entities/Media";
import { TILE_COLORS } from "@/constants/admin";
import type { Media } from "@/domain/entities/Media";
import type { Provider } from "@/domain/entities/Provider";
import type { AudioType } from "@/domain/entities/UserMedia";

const AUDIO_OPTIONS: AudioType[] = ["sub", "dub"];

const AUDIO_LABELS: Record<AudioType, string> = {
  sub: "original · sub",
  dub: "thai · dub",
};

interface AddToLibraryModalProps {
  media: Media;
  onClose: () => void;
  onAdded: (mediaId: string) => void;
}

export function AddToLibraryModal({ media, onClose, onAdded }: AddToLibraryModalProps) {
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<AudioType>("sub");
  const [customUrl, setCustomUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, show: showToast, dismiss } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { allProviders: providers, mediaProviders: assigned } =
          await getAddToLibraryDataAction(media.id);
        if (cancelled) return;
        setAllProviders(providers);
        if (assigned.length > 0) {
          setSelectedProviderId(assigned[0].providerId);
          setSelectedAudio(assigned[0].audio);
        }
      } catch {
        if (cancelled) return;
        showToast("Failed to load providers", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [media.id, showToast]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  const displayTitle = getDisplayTitle({
    titleEn: media.titleEn,
    titleRomaji: media.titleRomaji,
    titleTh: media.titleTh,
  });

  function validateUrl(value: string): boolean {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSubmit() {
    if (customUrl && !validateUrl(customUrl)) {
      setUrlError("That doesn't look like a valid URL.");
      return;
    }
    setUrlError(null);
    setSubmitting(true);

    const result = await addToLibraryAction({
      mediaId: media.id,
      providerId: selectedProviderId,
      audio: selectedAudio,
      customUrl: customUrl || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      onAdded(media.id);
    } else {
      showToast(result.message, "error");
    }
  }

  const disabled = submitting || loading;

  return (
    <>
      {/* Backdrop — bg-overlay, no blur */}
      { }
      <div
        className="fixed inset-0 z-50 bg-overlay flex items-center justify-center"
        onClick={onClose}
        onKeyDown={handleKeyDown}
      >
        {/* Modal — design: .modal */}
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "w-[min(420px,calc(100%-32px))] bg-page rounded-modal",
            "border-[0.5px] border-default p-6",
            "flex flex-col gap-4",
          )}
          onClick={e => e.stopPropagation()}
        >
          {/* Header: poster swatch + titles — design: .atl-head */}
          <div className="flex gap-3 items-start pb-3 border-b-[0.5px] border-default">
            <div
              className="relative w-11 h-15 rounded-md shrink-0 overflow-hidden"
              style={
                !media.posterUrl
                  ? {
                      background: TILE_COLORS[media.id.charCodeAt(0) % TILE_COLORS.length],
                    }
                  : undefined
              }
            >
              {media.posterUrl && (
                <Image
                  src={media.posterUrl}
                  alt={media.titleEn ?? ""}
                  fill
                  className="object-cover"
                  sizes="44px"
                />
              )}
            </div>
            <div className="flex flex-col gap-0.75 min-w-0 flex-1">
              <div className="text-xl font-medium tracking-tight leading-tight">
                {media.titleEn ?? displayTitle}
              </div>
              <div className="text-xs text-secondary leading-snug">
                {media.titleRomaji && `${media.titleRomaji} · `}
                {media.mediaType} · {media.seasonYear ?? "—"}
              </div>
              {media.titleTh && (
                <div className="text-xs text-tertiary leading-snug">{media.titleTh}</div>
              )}
            </div>
          </div>

          {/* Form — design: .atl-form, gap space-4 */}
          <div className="flex flex-col gap-4">
            {/* Provider — design: Field > Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-secondary">Provider</label>
              {loading ? (
                <div className="h-9 rounded-input bg-surface animate-pulse" />
              ) : allProviders.length === 0 ? (
                <p className="text-xs text-tertiary">No providers available</p>
              ) : (
                <select
                  value={selectedProviderId ?? ""}
                  onChange={e => setSelectedProviderId(e.target.value || null)}
                  disabled={disabled}
                  className={cn(
                    "h-9 px-3 bg-page text-md rounded-input appearance-none",
                    selectedProviderId ? "text-primary" : "text-tertiary",
                    "border-[0.5px] border-default",
                    "transition-colors duration-fast ease-out",
                    "hover:border-strong focus:border-primary focus:outline-none",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    "bg-size-[16px_16px] bg-position-[right_12px_center] bg-no-repeat",
                    "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
                  )}
                >
                  {!selectedProviderId && <option value="">Select a provider</option>}
                  {allProviders.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Audio — design: AudioSegmented, always show both sub/dub */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-secondary">Audio</label>
              <div className="flex border-[0.5px] border-default rounded-input overflow-hidden bg-page">
                {AUDIO_OPTIONS.map((audio, i) => {
                  const isOn = selectedAudio === audio;
                  return (
                    <button
                      key={audio}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedAudio(audio)}
                      className={cn(
                        "flex-1 inline-flex items-center justify-center gap-1.5",
                        "h-9 px-3 border-none cursor-pointer",
                        "text-sm font-medium",
                        "transition-[background,color] duration-fast ease-out",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        isOn
                          ? "bg-surface text-primary"
                          : "bg-transparent text-secondary hover:text-primary",
                        i > 0 && "border-l-[0.5px] border-default",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center h-5 px-2 rounded-pill text-xs font-medium border-[0.5px]",
                          isOn ? "border-transparent" : "border-default bg-page text-secondary",
                        )}
                        style={
                          isOn
                            ? {
                                background: "var(--text-primary)",
                                color: "var(--text-inverse)",
                              }
                            : undefined
                        }
                      >
                        {audio}
                      </span>
                      {AUDIO_LABELS[audio]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom URL — design: Field > TextInput + hint/error */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-secondary">Custom URL</label>
              <div
                className={cn(
                  "flex items-center gap-2 h-9 px-3 bg-page rounded-input",
                  "border-[0.5px] border-default",
                  "transition-colors duration-fast ease-out",
                  "hover:border-strong focus-within:border-primary",
                  urlError && "border-error hover:border-error focus-within:border-error",
                  disabled && "opacity-50 pointer-events-none",
                )}
              >
                <input
                  type="text"
                  value={customUrl}
                  onChange={e => {
                    setCustomUrl(e.target.value);
                    if (urlError) setUrlError(null);
                  }}
                  placeholder="https://..."
                  disabled={disabled}
                  className="flex-1 bg-transparent text-md text-primary placeholder:text-tertiary outline-none w-full"
                />
                {urlError && (
                  <span className="text-error shrink-0">
                    <Icon as={AlertCircle} size={14} />
                  </span>
                )}
              </div>
              {urlError ? (
                <p className="text-xs text-error">{urlError}</p>
              ) : (
                <p className="text-xs text-tertiary">
                  leave empty to use the provider&apos;s default link
                </p>
              )}
            </div>
          </div>

          {/* Actions — design: .modal-actions, justify-end, gap space-2, mt space-2 */}
          <div className="flex items-center justify-end gap-2 mt-2">
            <Button variant="secondary" size="md" disabled={disabled} onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" disabled={disabled} onClick={handleSubmit}>
              {submitting ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-[1.5px] border-current border-r-transparent rounded-full animate-spin shrink-0" />
                  Adding…
                </>
              ) : (
                "Add to library"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Toast portal */}
      {typeof document !== "undefined" &&
        toasts.length > 0 &&
        createPortal(
          <div className="fixed bottom-6 right-6 z-60 flex flex-col gap-2">
            {toasts.map(t => (
              <Toast
                key={t.id}
                variant={t.variant}
                title={t.title}
                description={t.description}
                onClose={() => dismiss(t.id)}
              />
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
