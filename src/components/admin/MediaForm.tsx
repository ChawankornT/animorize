'use client';

import { useActionState, useState, useRef } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Media } from '@/domain/entities/Media';
import type { Franchise } from '@/domain/entities/Franchise';
import { getDisplayTitle as getFranchiseTitle } from '@/domain/entities/Franchise';
import { createMediaAction, updateMediaAction, type MediaActionState } from '@/app/actions/media';

export function MediaForm({
  media,
  franchises,
}: {
  media?: Media;
  franchises: Franchise[];
}) {
  const isEdit = !!media;
  const action = isEdit ? updateMediaAction : createMediaAction;
  const [state, formAction, pending] = useActionState<MediaActionState, FormData>(action, {});

  const initialType = media?.mediaType ?? 'anime';
  const isFixedInitially = initialType === 'movie' || initialType === 'special';

  const [mediaType, setMediaType] = useState<string>(initialType);
  const isFixedEpisodes = mediaType === 'movie' || mediaType === 'special';

  const prevEpisodesRef = useRef<string>(
    !isFixedInitially && media?.totalEpisodes ? String(media.totalEpisodes) : '',
  );
  const [totalEpisodes, setTotalEpisodes] = useState<string>(
    isFixedInitially ? '1' : (media?.totalEpisodes ? String(media.totalEpisodes) : ''),
  );

  function handleMediaTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newType = e.target.value;
    if (newType === 'movie' || newType === 'special') {
      prevEpisodesRef.current = totalEpisodes;
      setTotalEpisodes('1');
    } else {
      setTotalEpisodes(prevEpisodesRef.current);
    }
    setMediaType(newType);
  }

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {(state.rootError || state.message) && (
        <p className="text-sm text-error" role="alert">
          {state.rootError ?? state.message}
        </p>
      )}

      {isEdit && <input type="hidden" name="id" value={media.id} />}

      {/* Franchise + Type */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Franchise"
          name="franchiseId"
          defaultValue={media?.franchiseId ?? ''}
        >
          <option value="">None</option>
          {franchises.map((f) => (
            <option key={f.id} value={f.id}>
              {getFranchiseTitle(f)}
            </option>
          ))}
        </Select>

        <Select
          label="Media Type"
          name="mediaType"
          value={mediaType}
          onChange={handleMediaTypeChange}
          error={state.errors?.mediaType?.[0]}
        >
          <option value="anime">Anime</option>
          <option value="series">Series</option>
          <option value="movie">Movie</option>
          <option value="ova">OVA</option>
          <option value="special">Special</option>
        </Select>
      </div>

      {/* Titles */}
      <div className="space-y-4">
        <Input
          label="Title (Thai)"
          name="titleTh"
          defaultValue={media?.titleTh ?? ''}
          error={state.errors?.titleTh?.[0]}
          placeholder="e.g. ดาบพิฆาตอสูร"
          autoComplete="off"
        />
        <Input
          label="Title (English)"
          name="titleEn"
          defaultValue={media?.titleEn ?? ''}
          error={state.errors?.titleEn?.[0]}
          placeholder="e.g. Demon Slayer"
          autoComplete="off"
        />
        <Input
          label="Title (Romaji)"
          name="titleRomaji"
          defaultValue={media?.titleRomaji ?? ''}
          error={state.errors?.titleRomaji?.[0]}
          placeholder="e.g. Kimetsu no Yaiba"
          autoComplete="off"
        />
      </div>

      {/* Synopsis */}
      <Textarea
        label="Synopsis"
        name="synopsis"
        defaultValue={media?.synopsis ?? ''}
        error={state.errors?.synopsis?.[0]}
        placeholder="Brief description…"
        hint="Optional"
        rows={4}
      />

      {/* Poster + Genres */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Poster URL"
          name="posterUrl"
          defaultValue={media?.posterUrl ?? ''}
          error={state.errors?.posterUrl?.[0]}
          placeholder="https://…"
          hint="Optional"
          autoComplete="off"
        />
        <Input
          label="Genres"
          name="genres"
          defaultValue={media?.genres.join(', ') ?? ''}
          error={state.errors?.genres?.[0]}
          placeholder="Action, Fantasy, Drama"
          hint="Separate with commas"
          autoComplete="off"
        />
      </div>

      {/* Episodes + Season Quarter + Year */}
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Total Episodes"
          name="totalEpisodes"
          type="number"
          min={isFixedEpisodes ? 1 : 0}
          value={totalEpisodes}
          onChange={(e) => setTotalEpisodes(e.target.value)}
          disabled={isFixedEpisodes}
          error={state.errors?.totalEpisodes?.[0]}
          hint={isFixedEpisodes ? 'Fixed at 1' : 'Optional'}
        />
        <Select
          label="Season"
          name="seasonQuarter"
          defaultValue={String(media?.seasonQuarter ?? '')}
          error={state.errors?.seasonQuarter?.[0]}
        >
          <option value="">—</option>
          <option value="1">Winter (Q1)</option>
          <option value="2">Spring (Q2)</option>
          <option value="3">Summer (Q3)</option>
          <option value="4">Fall (Q4)</option>
        </Select>
        <Input
          label="Year"
          name="seasonYear"
          type="number"
          defaultValue={media?.seasonYear ?? ''}
          error={state.errors?.seasonYear?.[0]}
          placeholder="e.g. 2024"
          min={1900}
          max={2100}
        />
      </div>

      {/* Air Dates + Airing Status */}
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Air Date Start"
          name="airDateStart"
          type="date"
          defaultValue={media?.airDateStart ?? ''}
          error={state.errors?.airDateStart?.[0]}
        />
        <Input
          label="Air Date End"
          name="airDateEnd"
          type="date"
          defaultValue={media?.airDateEnd ?? ''}
          error={state.errors?.airDateEnd?.[0]}
        />
        <Select
          label="Airing Status"
          name="airingStatus"
          defaultValue={media?.airingStatus ?? 'upcoming'}
          error={state.errors?.airingStatus?.[0]}
        >
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="finished">Finished</option>
        </Select>
      </div>

      {/* Sort Order + Auto Sync */}
      <div className="grid grid-cols-2 gap-4 items-end">
        <Input
          label="Sort Order"
          name="sortOrder"
          type="number"
          defaultValue={media?.sortOrder ?? 0}
          hint="Lower = shown first"
        />
        <div className="flex flex-col gap-1.5 pb-0.5">
          <span className="text-sm font-medium text-secondary">Auto Sync</span>
          <label className="flex items-center gap-2 cursor-pointer h-9">
            <input
              type="checkbox"
              name="autoSync"
              defaultChecked={media?.autoSync ?? true}
              className="size-4 rounded accent-primary"
            />
            <span className="text-sm text-secondary">Sync from AniList automatically</span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={pending}>
          {pending
            ? isEdit
              ? 'Saving…'
              : 'Creating…'
            : isEdit
              ? 'Save changes'
              : 'Create media'}
        </Button>
        <Link
          href="/admin/media"
          className="text-sm text-secondary hover:text-primary transition-colors duration-fast"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
