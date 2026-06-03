import { createClient } from "@/lib/supabase/server";
import { createUserMediaRepository } from "@/repositories";
import { SearchView } from "@/components/media/SearchView";

export default async function SearchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let libraryMediaIds: string[] = [];
  if (user) {
    const repo = createUserMediaRepository(supabase);
    libraryMediaIds = await repo.findMediaIdsByUserId(user.id);
  }

  return <SearchView libraryMediaIds={libraryMediaIds} />;
}
