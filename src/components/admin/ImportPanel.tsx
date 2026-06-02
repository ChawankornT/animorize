"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getDisplayTitle } from "@/domain/entities/Franchise";
import type { Franchise } from "@/domain/entities/Franchise";
import {
  fetchAnilistPreviewAction,
  saveImportAction,
  type AnilistPreviewState,
  type SaveImportState,
} from "@/app/actions/anilist";
import { SEASON_LABELS, TILE_COLORS } from "@/constants/admin";

type ImportPanelProps = {
  franchises: Franchise[];
};

export function ImportPanel({ franchises }: ImportPanelProps) {
  const [previewState, previewAction, previewPending] = useActionState<
    AnilistPreviewState,
    FormData
  >(fetchAnilistPreviewAction, {});
  const [saveState, saveAction, savePending] = useActionState<SaveImportState, FormData>(
    saveImportAction,
    {},
  );

  // ── Step 3: success ────────────────────────────────────────────
  if (saveState.savedMediaId) {
    return (
      <div className="max-w-md border-[0.5px] border-default rounded-card p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          {/* Check-circle icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="shrink-0 text-success"
          >
            <circle cx="10" cy="10" r="9.25" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M6.5 10l2.5 2.5 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2 className="text-base font-medium text-primary">Imported</h2>
        </div>
        <p className="text-sm text-secondary leading-relaxed">
          The media has been added to the library. Assign providers so users can track it.
        </p>
        <div className="flex items-center gap-4 text-sm pt-1">
          <Link
            href={`/admin/media/${saveState.savedMediaId}`}
            className="font-medium text-primary underline underline-offset-2"
          >
            View media →
          </Link>
          <Link
            href={`/admin/media/${saveState.savedMediaId}`}
            className="font-medium text-primary underline underline-offset-2"
          >
            Assign providers →
          </Link>
          <Button type="button" variant="ghost" size="sm" onClick={() => window.location.reload()}>
            Import another
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 2: preview + edit ─────────────────────────────────────
  if (previewState.data) {
    const d = previewState.data;
    const seasonLabel = d.seasonQuarter ? SEASON_LABELS[d.seasonQuarter] : null;
    const tileColor = TILE_COLORS[String(d.anilistId).charCodeAt(0) % TILE_COLORS.length];

    return (
      <form action={saveAction} className="space-y-4 max-w-[700px]">
        {saveState.message && (
          <p className="text-sm text-error" role="alert">
            {saveState.message}
          </p>
        )}

        {/* Hidden round-trip fields */}
        <input type="hidden" name="anilistId" value={d.anilistId} />
        <input type="hidden" name="titleRomaji" value={d.titleRomaji ?? ""} />
        <input type="hidden" name="titleEn" value={d.titleEn ?? ""} />
        <input type="hidden" name="posterUrl" value={d.posterUrl ?? ""} />
        <input type="hidden" name="totalEpisodes" value={d.totalEpisodes ?? ""} />
        <input type="hidden" name="airingStatus" value={d.airingStatus ?? "upcoming"} />
        <input type="hidden" name="genres" value={(d.genres ?? []).join(", ")} />
        <input type="hidden" name="seasonQuarter" value={d.seasonQuarter ?? ""} />
        <input type="hidden" name="seasonYear" value={d.seasonYear ?? ""} />
        <input type="hidden" name="airDateStart" value={d.airDateStart ?? ""} />
        <input type="hidden" name="airDateEnd" value={d.airDateEnd ?? ""} />
        <input type="hidden" name="mediaType" value={d.mediaType} />

        {/* Preview card */}
        <div className="border-[0.5px] border-default rounded-card overflow-hidden">
          {/* AniList data preview */}
          <div className="flex gap-5 p-5 border-b-[0.5px] border-default bg-surface">
            {/* Mini poster tile */}
            <div
              className="shrink-0 rounded-md overflow-hidden relative flex items-end p-2.5"
              style={{ width: 84, height: 120, backgroundColor: tileColor }}
            >
              {d.posterUrl && (
                <Image
                  src={d.posterUrl}
                  alt={d.titleEn ?? d.titleRomaji ?? ""}
                  fill
                  className="object-cover"
                  sizes="84px"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
              <span className="relative z-10 text-[11px] font-medium text-white leading-snug">
                {d.titleEn ?? d.titleRomaji}
              </span>
            </div>

            {/* Metadata */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <div className="text-base font-medium text-primary leading-snug tracking-tight">
                {d.titleEn ?? d.titleRomaji}
              </div>
              {d.titleRomaji && d.titleRomaji !== d.titleEn && (
                <div className="text-sm text-secondary">{d.titleRomaji}</div>
              )}
              <div className="flex flex-wrap gap-1.5 mt-1">
                <Badge>{d.mediaType}</Badge>
                <Badge
                  variant={
                    d.airingStatus === "ongoing"
                      ? "success"
                      : d.airingStatus === "upcoming"
                        ? "warning"
                        : "default"
                  }
                  dot
                >
                  {d.airingStatus}
                </Badge>
                {d.totalEpisodes ? <Badge>{d.totalEpisodes} eps</Badge> : null}
                {seasonLabel && d.seasonYear && (
                  <Badge>
                    {seasonLabel} {d.seasonYear}
                  </Badge>
                )}
              </div>
              {(d.genres ?? []).length > 0 && (
                <p className="text-xs text-tertiary">{(d.genres ?? []).join(" · ")}</p>
              )}
              {d.synopsis && (
                <p className="text-sm text-secondary leading-relaxed line-clamp-3 mt-1">
                  {d.synopsis}
                </p>
              )}
            </div>
          </div>

          {/* Editable fields */}
          <div className="p-5 flex flex-col gap-4">
            <div className="text-[11px] font-medium text-tertiary uppercase tracking-wide">
              Customize before importing
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Thai title"
                name="titleTh"
                defaultValue=""
                placeholder="ชื่อภาษาไทย (optional)"
                autoComplete="off"
              />
              <Select label="Franchise" name="franchiseId" defaultValue="">
                <option value="">None (standalone)</option>
                {franchises.map(f => (
                  <option key={f.id} value={f.id}>
                    {getDisplayTitle(f)}
                  </option>
                ))}
              </Select>
            </div>

            <Textarea
              label="Synopsis"
              name="synopsis"
              defaultValue={d.synopsis ?? ""}
              rows={4}
              hint="Pre-filled from AniList — edit as needed"
            />

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="autoSync"
                value="true"
                defaultChecked={d.autoSync !== false}
                className="mt-0.5 size-4 rounded accent-primary"
              />
              <div>
                <span className="text-sm font-medium text-primary">Auto-sync</span>
                <p className="text-xs text-secondary mt-0.5">Sync this title with AniList daily</p>
              </div>
            </label>
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-t-[0.5px] border-default">
            <Button type="submit" disabled={savePending}>
              {savePending ? "Saving…" : "Import"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
            >
              ← Start over
            </Button>
          </div>
        </div>
      </form>
    );
  }

  // ── Step 1: enter AniList ID ────────────────────────────────────
  return (
    <div className="flex-1 flex items-start justify-center pt-20">
      <form action={previewAction} className="w-full max-w-[520px] flex flex-col gap-2.5">
        <h1 className="text-3xl font-medium text-primary tracking-tight mb-1">
          Import from AniList
        </h1>
        <p className="text-sm text-secondary mb-4">
          Paste an AniList media ID. We&apos;ll preview the data before saving anything.
        </p>

        {previewState.message && (
          <p className="text-sm text-error" role="alert">
            {previewState.message}
          </p>
        )}

        {/* ID input with prefix */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center h-10 px-3 gap-2 border-[0.5px] border-default rounded-input bg-page focus-within:border-primary transition-colors duration-fast">
            <span className="font-mono text-[11px] text-tertiary shrink-0">id</span>
            <input
              name="anilistId"
              type="number"
              min={1}
              placeholder="e.g. 154587"
              autoComplete="off"
              className="flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-tertiary"
            />
          </div>
          <Button type="submit" disabled={previewPending}>
            {previewPending ? "Fetching…" : "Fetch"}
          </Button>
        </div>

        <p className="text-xs text-tertiary">
          Find the ID in the AniList URL — anilist.co/anime/
          <strong className="text-secondary">154587</strong>
          /sousou-no-frieren
        </p>
      </form>
    </div>
  );
}
