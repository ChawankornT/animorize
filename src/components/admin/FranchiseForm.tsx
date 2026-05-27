'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import type { Franchise } from '@/domain/entities/Franchise';
import {
  createFranchiseAction,
  updateFranchiseAction,
  type FranchiseActionState,
} from '@/app/actions/franchise';

export function FranchiseForm({ franchise }: { franchise?: Franchise }) {
  const isEdit = !!franchise;
  const action = isEdit ? updateFranchiseAction : createFranchiseAction;
  const [state, formAction, pending] = useActionState<FranchiseActionState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {(state.rootError || state.message) && (
        <p className="text-sm text-error" role="alert">
          {state.rootError ?? state.message}
        </p>
      )}

      {isEdit && <input type="hidden" name="id" value={franchise.id} />}

      <Input
        label="Title (Thai)"
        name="titleTh"
        defaultValue={franchise?.titleTh ?? ''}
        error={state.errors?.titleTh?.[0]}
        placeholder="e.g. คิเมสึ โนะ ยาอิบะ"
        autoComplete="off"
      />

      <Input
        label="Title (English)"
        name="titleEn"
        defaultValue={franchise?.titleEn ?? ''}
        error={state.errors?.titleEn?.[0]}
        placeholder="e.g. Demon Slayer"
        autoComplete="off"
      />

      <Input
        label="Title (Romaji)"
        name="titleRomaji"
        defaultValue={franchise?.titleRomaji ?? ''}
        error={state.errors?.titleRomaji?.[0]}
        placeholder="e.g. Kimetsu no Yaiba"
        autoComplete="off"
      />

      <Input
        label="Poster URL"
        name="posterUrl"
        defaultValue={franchise?.posterUrl ?? ''}
        error={state.errors?.posterUrl?.[0]}
        placeholder="https://example.com/poster.jpg"
        hint="Optional"
        autoComplete="off"
      />

      <Textarea
        label="Synopsis"
        name="synopsis"
        defaultValue={franchise?.synopsis ?? ''}
        error={state.errors?.synopsis?.[0]}
        placeholder="Brief description…"
        hint="Optional"
        rows={4}
      />

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={pending}>
          {pending
            ? isEdit
              ? 'Saving…'
              : 'Creating…'
            : isEdit
              ? 'Save changes'
              : 'Create franchise'}
        </Button>
        <a
          href="/admin/franchises"
          className="text-sm text-secondary hover:text-primary transition-colors duration-fast"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
