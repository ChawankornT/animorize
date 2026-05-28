import { createClient } from '@/lib/supabase/server';
import { createSystemSettingsRepository } from '@/repositories';
import { getSystemSettings } from '@/domain/usecases/GetSystemSettings';
import { SystemSettingsForm } from '@/components/admin/SystemSettingsForm';

export default async function SettingsPage() {
  const supabase = await createClient();
  const settings = await getSystemSettings(createSystemSettingsRepository(supabase));

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-primary tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-secondary">Global system configuration.</p>
      </div>

      <div className="max-w-md p-5 border-[0.5px] border-default rounded-card bg-surface">
        <h2 className="text-sm font-medium text-primary mb-4">Sync</h2>
        <SystemSettingsForm settings={settings} />
      </div>
    </div>
  );
}
