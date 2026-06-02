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
    const items = await repo.findByUserId(user.id);
    libraryMediaIds = items.map(item => item.mediaId);
  }

  return <SearchView libraryMediaIds={libraryMediaIds} />;
}
