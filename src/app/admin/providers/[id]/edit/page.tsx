import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createProviderRepository } from '@/repositories';
import { getProvider } from '@/domain/usecases/GetProvider';
import { ProviderForm } from '@/components/admin/ProviderForm';

export default async function EditProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const repo = createProviderRepository(supabase);
  const provider = await getProvider(repo, id);

  if (!provider) notFound();

  return (
    <div className="p-8 space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-secondary">
        <Link href="/admin" className="hover:text-primary transition-colors duration-fast">
          Admin
        </Link>
        <span className="text-tertiary">›</span>
        <Link href="/admin/providers" className="hover:text-primary transition-colors duration-fast">
          Providers
        </Link>
        <span className="text-tertiary">›</span>
        <span className="text-primary truncate max-w-[160px]">{provider.name}</span>
        <span className="text-tertiary">›</span>
        <span className="text-primary font-medium">Edit</span>
      </nav>

      <div>
        <h1 className="text-2xl font-medium text-primary tracking-tight">
          Edit {provider.name}
        </h1>
      </div>

      <ProviderForm provider={provider} />
    </div>
  );
}
