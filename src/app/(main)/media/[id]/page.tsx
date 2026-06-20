import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createMediaRepository,
  createMediaProviderRepository,
  createUserMediaRepository,
  createWatchLogRepository,
} from "@/repositories";
import { getMedia } from "@/domain/usecases/GetMedia";
import { getLibraryItem } from "@/domain/usecases/GetLibraryItem";
import { listMediaProviders } from "@/domain/usecases/ListMediaProviders";
import { getDisplayTitle } from "@/domain/entities/title";
import { MediaDetailView } from "@/components/media/MediaDetailView";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const media = await getMedia(createMediaRepository(supabase), id);

  if (!media) return { title: "Not found — Animorize" };

  const displayTitle = getDisplayTitle({
    titleEn: media.titleEn,
    titleRomaji: media.titleRomaji,
    titleTh: media.titleTh,
  });

  return { title: `${displayTitle} — Animorize` };
}

export default async function MediaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userMediaRepo = createUserMediaRepository(supabase);
  const userMedia = await getLibraryItem(userMediaRepo, user.id, id);

  if (!userMedia) {
    notFound();
  }

  const [media, providers, watchLogs] = await Promise.all([
    getMedia(createMediaRepository(supabase), id),
    listMediaProviders(createMediaProviderRepository(supabase), id),
    createWatchLogRepository(supabase).findByUserAndMedia(user.id, id, 5),
  ]);

  if (!media) {
    notFound();
  }

  return (
    <MediaDetailView
      media={media}
      userMedia={userMedia}
      providers={providers}
      watchLogs={watchLogs}
    />
  );
}
