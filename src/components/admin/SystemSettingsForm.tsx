'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import type { SystemSettings } from '@/domain/entities/SystemSettings';
import { updateSystemSettingsAction, type SystemSettingsState } from '@/app/actions/systemSettings';

interface Props {
  settings: SystemSettings;
}

export function SystemSettingsForm({ settings }: Props) {
  const [state, action, pending] = useActionState<SystemSettingsState, FormData>(
    updateSystemSettingsAction,
    {},
  );

  return (
    <form action={action} className="space-y-6">
      {state.message && (
        <p
          className={`text-sm ${state.success ? 'text-success' : 'text-error'}`}
          role="alert"
        >
          {state.message}
        </p>
      )}

      <div className="flex items-start gap-3">
        <input
          id="autoSyncEnabled"
          type="checkbox"
          name="autoSyncEnabled"
          value="true"
          defaultChecked={settings.autoSyncEnabled}
          className="mt-0.5 h-4 w-4 rounded border-default accent-primary"
        />
        <div className="space-y-0.5">
          <label htmlFor="autoSyncEnabled" className="text-sm font-medium text-primary cursor-pointer">
            Auto-sync enabled
          </label>
          <p className="text-xs text-secondary">
            When enabled, ongoing media will be synced with AniList daily.
          </p>
        </div>
      </div>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? 'Saving…' : 'Save settings'}
      </Button>
    </form>
  );
}
