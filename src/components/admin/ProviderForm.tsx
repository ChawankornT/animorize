'use client';

import { useState, useActionState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { Provider } from '@/domain/entities/Provider';
import {
  createProviderAction,
  updateProviderAction,
  type ProviderActionState,
} from '@/app/actions/provider';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProviderForm({ provider }: { provider?: Provider }) {
  const isEdit = !!provider;
  const action = isEdit ? updateProviderAction : createProviderAction;
  const [state, formAction, pending] = useActionState<ProviderActionState, FormData>(
    action,
    {},
  );

  const [slug, setSlug] = useState(provider?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [color, setColor] = useState(provider?.color ?? '#000000');

  const colorIsValid = /^#[0-9A-Fa-f]{6}$/.test(color);

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {state.message && (
        <p className="text-sm text-error" role="alert">
          {state.message}
        </p>
      )}

      {isEdit && <input type="hidden" name="id" value={provider.id} />}

      <Input
        label="Name"
        name="name"
        defaultValue={provider?.name}
        error={state.errors?.name?.[0]}
        placeholder="e.g. Crunchyroll"
        autoComplete="off"
        required
        onChange={(e) => {
          if (!slugTouched) {
            setSlug(slugify(e.target.value));
          }
        }}
      />

      <Input
        label="Slug"
        name="slug"
        value={slug}
        error={state.errors?.slug?.[0]}
        placeholder="e.g. crunchyroll"
        hint="Lowercase letters, numbers, hyphens only. Auto-filled from name."
        autoComplete="off"
        required
        onChange={(e) => {
          setSlug(e.target.value);
          setSlugTouched(true);
        }}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="color" className="text-[13px] font-medium text-secondary">
          Color
        </label>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-xs shrink-0 border-[0.5px] border-default"
            style={{ backgroundColor: colorIsValid ? color : 'transparent' }}
          />
          <input
            id="color"
            name="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#FF5733"
            className={cn(
              'flex-1 h-9 px-3 bg-page text-md text-primary rounded-input',
              'border-[0.5px] border-default placeholder:text-tertiary',
              'transition-colors duration-fast ease-out hover:border-strong',
              'focus:border-primary focus:outline-none',
              state.errors?.color && 'border-error hover:border-error focus:border-error',
            )}
            aria-invalid={state.errors?.color ? true : undefined}
            aria-describedby={state.errors?.color ? 'color-error' : undefined}
            autoComplete="off"
          />
        </div>
        {state.errors?.color?.[0] && (
          <p id="color-error" className="text-xs text-error" role="alert">
            {state.errors.color[0]}
          </p>
        )}
      </div>

      <Input
        label="Logo URL"
        name="logoUrl"
        defaultValue={provider?.logoUrl ?? ''}
        error={state.errors?.logoUrl?.[0]}
        placeholder="https://example.com/logo.svg"
        hint="Optional"
        autoComplete="off"
      />

      <Input
        label="Base URL"
        name="baseUrl"
        defaultValue={provider?.baseUrl ?? ''}
        error={state.errors?.baseUrl?.[0]}
        placeholder="https://example.com"
        hint="Optional"
        autoComplete="off"
      />

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={pending}>
          {pending
            ? isEdit
              ? 'Saving…'
              : 'Creating…'
            : isEdit
              ? 'Save changes'
              : 'Create provider'}
        </Button>
        <a
          href="/admin/providers"
          className="text-sm text-secondary hover:text-primary transition-colors duration-fast"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
