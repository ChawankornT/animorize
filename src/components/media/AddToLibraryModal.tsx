'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { getMediaProvidersAction, addToLibraryAction } from '@/app/actions/userMedia';
import { getDisplayTitle } from '@/domain/entities/Media';
import type { Media } from '@/domain/entities/Media';
import type { MediaProvider } from '@/domain/entities/MediaProvider';
import type { AudioType } from '@/domain/entities/UserMedia';

const AUDIO_LABELS: Record<AudioType, string> = {
  sub: 'original · thai sub',
  dub: 'thai · dub',
};

interface ProviderGroup {
  providerId: string;
  providerName: string;
  providerColor: string;
  audios: AudioType[];
}

function groupProviders(providers: MediaProvider[]): ProviderGroup[] {
  const map = new Map<string, ProviderGroup>();
  for (const p of providers) {
    const existing = map.get(p.providerId);
    if (existing) {
      if (!existing.audios.includes(p.audio)) {
        existing.audios.push(p.audio);
      }
    } else {
      map.set(p.providerId, {
        providerId: p.providerId,
        providerName: p.providerName,
        providerColor: p.providerColor,
        audios: [p.audio],
      });
    }
  }
  return Array.from(map.values());
}

interface AddToLibraryModalProps {
  media: Media;
  onClose: () => void;
  onAdded: (mediaId: string) => void;
}

export function AddToLibraryModal({ media, onClose, onAdded }: AddToLibraryModalProps) {
  const [providers, setProviders] = useState<MediaProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<AudioType>('sub');
  const [customUrl, setCustomUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, show: showToast, dismiss } = useToast();

  const groups = useMemo(() => groupProviders(providers), [providers]);
  const selectedGroup = useMemo(
    () => groups.find(g => g.providerId === selectedProviderId) ?? null,
    [groups, selectedProviderId],
  );

  useEffect(() => {
    let cancelled = false;
    getMediaProvidersAction(media.id).then(result => {
      if (cancelled) return;
      setProviders(result);
      const grouped = groupProviders(result);
      if (grouped.length > 0) {
        setSelectedProviderId(grouped[0].providerId);
        setSelectedAudio(grouped[0].audios[0]);
      }
      setLoadingProviders(false);
    });
    return () => { cancelled = true; };
  }, [media.id]);

  const effectiveAudio = selectedGroup && !selectedGroup.audios.includes(selectedAudio)
    ? selectedGroup.audios[0]
    : selectedAudio;

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
      audio: effectiveAudio,
      customUrl: customUrl || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      onAdded(media.id);
    } else {
      showToast("Couldn't add to library", 'error');
    }
  }

  const disabled = submitting || loadingProviders;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-overlay flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className={cn(
            'w-[min(420px,calc(100%-32px))] bg-page rounded-modal',
            'border-[0.5px] border-default p-6',
          )}
          onClick={e => e.stopPropagation()}
        >
          {/* Header: swatch + titles */}
          <div className="flex gap-3 items-start pb-3 border-b-[0.5px] border-default mb-4">
            <div
              className="w-11 h-[60px] rounded-[6px] shrink-0"
              style={{ background: '#4A4A4A' }}
            />
            <div className="flex flex-col gap-[3px] min-w-0 flex-1">
              <h2 className="text-xl font-medium tracking-tight text-primary leading-snug">
                {media.titleEn ?? displayTitle}
              </h2>
              <p className="text-xs text-secondary leading-snug">
                {media.titleRomaji && `${media.titleRomaji} · `}
                {media.mediaType} · {media.seasonYear ?? '—'}
              </p>
              {media.titleTh && (
                <p className="text-xs text-tertiary leading-snug">{media.titleTh}</p>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            {/* Provider */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-secondary">Provider</label>
              {loadingProviders ? (
                <div className="h-9 rounded-input bg-surface animate-pulse" />
              ) : groups.length === 0 ? (
                <p className="text-xs text-tertiary">No providers assigned</p>
              ) : (
                <select
                  value={selectedProviderId ?? ''}
                  onChange={e => setSelectedProviderId(e.target.value || null)}
                  disabled={disabled}
                  className={cn(
                    'h-9 px-3 bg-page text-md text-primary rounded-input appearance-none',
                    'border-[0.5px] border-default',
                    'transition-colors duration-fast ease-out',
                    'hover:border-strong focus:border-primary focus:outline-none',
                    'disabled:opacity-50 disabled:pointer-events-none',
                    'bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat',
                    "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
                  )}
                >
                  {groups.map(g => (
                    <option key={g.providerId} value={g.providerId}>
                      {g.providerName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Audio segmented */}
            {selectedGroup && selectedGroup.audios.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-secondary">Audio</label>
                <div className="flex border-[0.5px] border-default rounded-input overflow-hidden bg-page">
                  {selectedGroup.audios.map(audio => (
                    <button
                      key={audio}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedAudio(audio)}
                      className={cn(
                        'flex-1 inline-flex items-center justify-center gap-1.5',
                        'h-9 px-3 bg-transparent border-none cursor-pointer',
                        'text-sm font-medium text-secondary',
                        'transition-colors duration-fast ease-out',
                        'hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed',
                        effectiveAudio === audio && 'bg-surface text-primary',
                        audio !== selectedGroup.audios[0] && 'border-l-[0.5px] border-default',
                      )}
                    >
                      <Badge
                        className={cn(
                          effectiveAudio === audio && 'bg-primary text-inverse border-transparent',
                        )}
                      >
                        {audio}
                      </Badge>
                      {AUDIO_LABELS[audio]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-secondary">Custom URL</label>
              <div className="relative">
                <input
                  type="text"
                  value={customUrl}
                  onChange={e => {
                    setCustomUrl(e.target.value);
                    if (urlError) setUrlError(null);
                  }}
                  placeholder="https://..."
                  disabled={disabled}
                  className={cn(
                    'w-full h-9 px-3 bg-page text-md text-primary rounded-input',
                    'border-[0.5px] border-default placeholder:text-tertiary',
                    'transition-colors duration-fast ease-out',
                    'hover:border-strong focus:border-primary focus:outline-none',
                    'disabled:opacity-50 disabled:pointer-events-none',
                    urlError && 'border-error hover:border-error focus:border-error pr-9',
                  )}
                />
                {urlError && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-error">
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

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 mt-6">
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
                'Add to library'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Toast portal */}
      {typeof document !== 'undefined' &&
        toasts.length > 0 &&
        createPortal(
          <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
            {toasts.map(t => (
              <Toast
                key={t.id}
                variant={t.variant}
                title={t.title}
                description="Already in your library."
                onClose={() => dismiss(t.id)}
              />
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
