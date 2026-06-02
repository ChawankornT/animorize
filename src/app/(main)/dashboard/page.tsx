import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createUserMediaRepository } from '@/repositories';
import { listUserLibrary } from '@/domain/usecases/ListUserLibrary';
import { DashboardEmpty } from '@/components/media/DashboardEmpty';
import { LibraryView } from '@/components/media/LibraryView';

export const metadata = {
  title: 'Library — Animorize',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const repo = createUserMediaRepository(supabase);
  const items = await listUserLibrary(repo, user.id, 'all');

  if (items.length === 0) {
    return <DashboardEmpty />;
  }

  const watchingCount = items.filter(i => i.status === 'watching').length;
  const favoritesCount = items.filter(i => i.isFavorite).length;

  return (
    <LibraryView
      items={items}
      allCount={items.length}
      watchingCount={watchingCount}
      favoritesCount={favoritesCount}
    />
  );
}
