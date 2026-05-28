'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getDisplayTitle } from '@/domain/entities/Franchise';
import type { Franchise } from '@/domain/entities/Franchise';
import {
  fetchAnilistPreviewAction,
  saveImportAction,
  type AnilistPreviewState,
  type SaveImportState,
} from '@/app/actions/anilist';

type ImportPanelProps = {
  franchises: Franchise[];
};

const SEASON_LABELS: Record<number, string> = {
  1: 'Winter',
  2: 'Spring',
  3: 'Summer',
  4: 'Fall',
};

export function ImportPanel({ franchises }: ImportPanelProps) {
  const [previewState, previewAction, previewPending] = useActionState<AnilistPreviewState, FormData>(
    fetchAnilistPreviewAction,
    {},
  );
  const [saveState, saveAction, savePending] = useActionState<SaveImportState, FormData>(
    saveImportAction,
    {},
  );

  // Step 3: success
  if (saveState.savedMediaId) {
    return (
      <div className="max-w-md space-y-4 rounded-card border-[0.5px] border-default p-6">
        <p className="text-sm font-medium text-primary">Import successful!</p>
        <p className="text-sm text-secondary">
          The media has been saved and sync log recorded.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/media/${saveState.savedMediaId}/edit`}
            className="text-sm text-primary underline-offset-2 hover:underline"
          >
            Edit media →
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-sm text-secondary hover:text-primary transition-colors duration-fast"
          >
            Import another
          </button>
        </div>
      </div>
    );
  }

  // Step 2: preview + edit
  if (previewState.data) {
    const d = previewState.data;
    const seasonLabel = d.seasonQuarter ? SEASON_LABELS[d.seasonQuarter] : null;

    return (
      <form action={saveAction} className="space-y-6 max-w-2xl">
        {saveState.message && (
          <p className="text-sm text-error" role="alert">
            {saveState.message}
          </p>
        )}

        {/* Hidden fields — read-only data that must round-trip to the server */}
        <input type="hidden" name="anilistId" value={d.anilistId} />
        <input type="hidden" name="titleRomaji" value={d.titleRomaji ?? ''} />
        <input type="hidden" name="titleEn" value={d.titleEn ?? ''} />
        <input type="hidden" name="posterUrl" value={d.posterUrl ?? ''} />
        <input type="hidden" name="totalEpisodes" value={d.totalEpisodes ?? 0} />
        <input type="hidden" name="airingStatus" value={d.airingStatus ?? 'upcoming'} />
        <input type="hidden" name="genres" value={(d.genres ?? []).join(', ')} />
        <input type="hidden" name="seasonQuarter" value={d.seasonQuarter ?? ''} />
        <input type="hidden" name="seasonYear" value={d.seasonYear ?? ''} />
        <input type="hidden" name="airDateStart" value={d.airDateStart ?? ''} />
        <input type="hidden" name="airDateEnd" value={d.airDateEnd ?? ''} />
        <input type="hidden" name="mediaType" value={d.mediaType} />
        <input type="hidden" name="autoSync" value={d.autoSync ? 'true' : 'false'} />

        {/* Poster + metadata */}
        <div className="flex gap-4">
          {d.posterUrl && (
            <Image
              src={d.posterUrl}
              alt={d.titleRomaji ?? d.titleEn ?? 'Poster'}
              width={96}
              height={136}
              className="w-24 rounded-sm object-cover shrink-0"
            />
          )}
          <div className="space-y-2 min-w-0">
            {d.titleRomaji && (
              <p className="font-medium text-primary truncate">{d.titleRomaji}</p>
            )}
            {d.titleEn && (
              <p className="text-sm text-secondary truncate">{d.titleEn}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-1">
              <Badge>{d.mediaType}</Badge>
              <Badge variant={d.airingStatus === 'ongoing' ? 'success' : d.airingStatus === 'upcoming' ? 'warning' : 'default'} dot>
                {d.airingStatus}
              </Badge>
              {d.totalEpisodes ? (
                <Badge>{d.totalEpisodes} eps</Badge>
              ) : null}
              {seasonLabel && d.seasonYear && (
                <Badge>{seasonLabel} {d.seasonYear}</Badge>
              )}
            </div>
            {(d.genres ?? []).length > 0 && (
              <p className="text-xs text-tertiary">{(d.genres ?? []).join(', ')}</p>
            )}
          </div>
        </div>

        {/* Admin-editable fields */}
        <Input
          label="Title (Thai)"
          name="titleTh"
          defaultValue=""
          placeholder="ใส่ชื่อภาษาไทย (optional)"
          autoComplete="off"
        />

        <Textarea
          label="Synopsis"
          name="synopsis"
          defaultValue={d.synopsis ?? ''}
          rows={5}
          hint="Pre-filled from AniList — edit as needed"
        />

        <Select label="Franchise" name="franchiseId" defaultValue="">
          <option value="">None</option>
          {franchises.map((f) => (
            <option key={f.id} value={f.id}>
              {getDisplayTitle(f)}
            </option>
          ))}
        </Select>

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" disabled={savePending}>
            {savePending ? 'Saving…' : 'Save media'}
          </Button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-sm text-secondary hover:text-primary transition-colors duration-fast"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // Step 1: enter AniList ID
  return (
    <form action={previewAction} className="space-y-4 max-w-md">
      {previewState.message && (
        <p className="text-sm text-error" role="alert">
          {previewState.message}
        </p>
      )}

      <Input
        label="AniList ID"
        name="anilistId"
        type="number"
        min={1}
        placeholder="e.g. 20"
        hint="Find the ID in the AniList URL: anilist.co/anime/{id}"
        autoComplete="off"
      />

      <Button type="submit" disabled={previewPending}>
        {previewPending ? 'Fetching…' : 'Fetch from AniList'}
      </Button>
    </form>
  );
}
