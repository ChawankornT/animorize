import { createClient } from '@/lib/supabase/server';
import { logoutAction } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Dashboard — Animorize',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-medium text-primary">Welcome back</h1>
        <p className="text-sm text-secondary">{user?.email}</p>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" size="sm">
            Log out
          </Button>
        </form>
      </div>
    </div>
  );
}
