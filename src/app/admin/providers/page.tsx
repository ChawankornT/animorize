import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createProviderRepository } from '@/repositories';
import { listProviders } from '@/domain/usecases/ListProviders';
import { buttonVariants } from '@/components/ui/button-variants';
import { ProviderDeleteButton } from '@/components/admin/ProviderDeleteButton';

export default async function ProvidersPage() {
  const supabase = await createClient();
  const repo = createProviderRepository(supabase);
  const providers = await listProviders(repo);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-primary tracking-tight">Providers</h1>
          <p className="mt-1 text-sm text-secondary">Manage streaming provider definitions.</p>
        </div>
        <Link href="/admin/providers/new" className={buttonVariants({ size: 'sm' })}>
          Add provider
        </Link>
      </div>

      {providers.length === 0 ? (
        <div className="py-16 text-center text-secondary text-sm border-[0.5px] border-default rounded-card">
          No providers yet.{' '}
          <Link href="/admin/providers/new" className="text-primary underline-offset-2 hover:underline">
            Add the first one.
          </Link>
        </div>
      ) : (
        <div className="border-[0.5px] border-default rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-[0.5px] border-default bg-surface">
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Provider
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Base URL
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-default">
              {providers.map((provider) => (
                <tr key={provider.id} className="hover:bg-surface transition-colors duration-fast">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-xs shrink-0 border-[0.5px] border-default"
                        style={{ backgroundColor: provider.color }}
                      />
                      <span className="font-medium text-primary">{provider.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-secondary font-mono text-xs">
                    {provider.slug}
                  </td>
                  <td className="px-4 py-3 text-secondary truncate max-w-[200px]">
                    {provider.baseUrl ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/providers/${provider.id}/edit`}
                        className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                      >
                        Edit
                      </Link>
                      <ProviderDeleteButton id={provider.id} name={provider.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
