import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createMediaRepository, createFranchiseRepository } from "@/repositories";
import { getMedia } from "@/domain/usecases/GetMedia";
import { listFranchises } from "@/domain/usecases/ListFranchises";
import { getDisplayTitle } from "@/domain/entities/Media";
import { MediaForm } from "@/components/admin/MediaForm";

export default async function EditMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [media, franchises] = await Promise.all([
    getMedia(createMediaRepository(supabase), id),
    listFranchises(createFranchiseRepository(supabase)),
  ]);

  if (!media) notFound();

  const displayTitle = getDisplayTitle(media);

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
        <span className="text-secondary truncate max-w-48">{displayTitle || id}</span>
        <span className="text-tertiary">›</span>
        <span className="text-primary font-medium">Edit</span>
      </nav>

      <h1 className="text-2xl font-medium text-primary tracking-tight">
        Edit{displayTitle ? `: ${displayTitle}` : ""}
      </h1>

      <MediaForm media={media} franchises={franchises} />
    </div>
  );
}
