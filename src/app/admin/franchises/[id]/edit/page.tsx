import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createFranchiseRepository } from '@/repositories';
import { getFranchise } from '@/domain/usecases/GetFranchise';
import { getDisplayTitle } from '@/domain/entities/Franchise';
import { FranchiseForm } from '@/components/admin/FranchiseForm';

export default async function EditFranchisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const repo = createFranchiseRepository(supabase);
  const franchise = await getFranchise(repo, id);

  if (!franchise) notFound();

  const displayTitle = getDisplayTitle(franchise);

  return (
    <div className="p-8 space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-secondary">
        <Link href="/admin" className="hover:text-primary transition-colors duration-fast">
          Admin
        </Link>
        <span className="text-tertiary">›</span>
        <Link href="/admin/franchises" className="hover:text-primary transition-colors duration-fast">
          Franchises
        </Link>
        <span className="text-tertiary">›</span>
        <span className="text-primary truncate max-w-[160px]">{displayTitle}</span>
        <span className="text-tertiary">›</span>
        <span className="text-primary font-medium">Edit</span>
      </nav>

      <div>
        <h1 className="text-2xl font-medium text-primary tracking-tight">
          Edit {displayTitle}
        </h1>
      </div>

      <FranchiseForm franchise={franchise} />
    </div>
  );
}
