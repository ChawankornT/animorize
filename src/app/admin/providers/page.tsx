import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createProviderRepository } from '@/repositories';
import { listProviders } from '@/domain/usecases/ListProviders';
import { buttonVariants } from '@/components/ui/button-variants';
import { ProviderDeleteButton } from '@/components/admin/ProviderDeleteButton';

export default async function ProvidersPage() {
  const supabase = await createClient();
  const providers = await listProviders(createProviderRepository(supabase));

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-primary tracking-tight">Providers</h1>
          <p className="mt-1 text-sm text-secondary">
            {providers.length} provider{providers.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <Link href="/admin/providers/new" className={buttonVariants({ size: 'sm' })}>
          Add provider
        </Link>
      </div>

      {providers.length === 0 ? (
        <div className="py-16 text-center text-secondary text-sm border-[0.5px] border-default rounded-card">
          No providers yet.{' '}
          <Link
            href="/admin/providers/new"
            className="text-primary underline-offset-2 hover:underline"
          >
            Add the first one.
          </Link>
        </div>
      ) : (
        <div className="border-[0.5px] border-default rounded-card overflow-hidden">
          {providers.map((provider, i) => (
            <div
              key={provider.id}
              className={`flex items-center gap-4 px-4 py-3.5 transition-colors duration-fast hover:bg-surface${i < providers.length - 1 ? ' border-b-[0.5px] border-default' : ''}`}
            >
              {/* Color chip */}
              <div
                className="w-9 h-9 rounded-lg shrink-0 border-[0.5px] border-black/[0.08]"
                style={{ backgroundColor: provider.color }}
              />

              {/* Name + meta */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-sm font-medium text-primary">{provider.name}</span>
                <div className="flex items-center gap-3 text-xs text-tertiary">
                  <span className="font-mono">{provider.slug}</span>
                  {provider.baseUrl && (
                    <span className="truncate max-w-[240px]">
                      {provider.baseUrl.replace('https://', '')}
                    </span>
                  )}
                  <span className="font-mono">{provider.color}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/providers/${provider.id}/edit`}
                  className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                >
                  Edit
                </Link>
                <ProviderDeleteButton id={provider.id} name={provider.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
