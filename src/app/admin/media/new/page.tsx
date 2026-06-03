import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createFranchiseRepository } from "@/repositories";
import { listFranchises } from "@/domain/usecases/ListFranchises";
import { MediaForm } from "@/components/admin/MediaForm";

export default async function NewMediaPage() {
  const supabase = await createClient();
  const franchises = await listFranchises(createFranchiseRepository(supabase));

  return (
    <div className="p-8 space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-secondary">
        <Link href="/admin" className="hover:text-primary transition-colors duration-fast">
          Admin
        </Link>
        <span className="text-tertiary">›</span>
        <Link href="/admin/media" className="hover:text-primary transition-colors duration-fast">
          Media
        </Link>
        <span className="text-tertiary">›</span>
        <span className="text-primary font-medium">New</span>
      </nav>

      <h1 className="text-2xl font-medium text-primary tracking-tight">New media</h1>

      <MediaForm franchises={franchises} />
    </div>
  );
}
