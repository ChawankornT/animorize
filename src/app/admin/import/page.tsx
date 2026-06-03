import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createFranchiseRepository } from "@/repositories";
import { listFranchises } from "@/domain/usecases/ListFranchises";
import { ImportPanel } from "@/components/admin/ImportPanel";

export default async function ImportPage() {
  const supabase = await createClient();
  const franchises = await listFranchises(createFranchiseRepository(supabase));

  return (
    <div className="flex flex-col p-8 gap-6 min-h-full">
      <nav className="flex items-center gap-1.5 text-sm text-secondary shrink-0">
        <Link href="/admin" className="hover:text-primary transition-colors duration-fast">
          Admin
        </Link>
        <span className="text-tertiary">›</span>
        <span className="text-primary font-medium">Import</span>
      </nav>

      <ImportPanel franchises={franchises} />
    </div>
  );
}
