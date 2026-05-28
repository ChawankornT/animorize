import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createFranchiseRepository } from '@/repositories';
import { listFranchises } from '@/domain/usecases/ListFranchises';
import { ImportPanel } from '@/components/admin/ImportPanel';

export default async function ImportPage() {
  const supabase = await createClient();
  const franchises = await listFranchises(createFranchiseRepository(supabase));

  return (
    <div className="p-8 space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-secondary">
        <Link href="/admin" className="hover:text-primary transition-colors duration-fast">
          Admin
        </Link>
        <span className="text-tertiary">›</span>
        <span className="text-primary font-medium">Import</span>
      </nav>

      <div>
        <h1 className="text-2xl font-medium text-primary tracking-tight">Import from AniList</h1>
        <p className="mt-1 text-sm text-secondary">
          Enter an AniList media ID to fetch, preview, and save.
        </p>
      </div>

      <ImportPanel franchises={franchises} />
    </div>
  );
}
