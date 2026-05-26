import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { logoutAction } from '@/app/(auth)/actions';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Wordmark } from '@/components/brand/Wordmark';

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="h-14 bg-page border-b-[0.5px] border-default px-6 flex items-center">
      <div className="flex w-full items-center justify-between">
        <Link href={user ? '/dashboard' : '/'} className="shrink-0">
          <Wordmark />
        </Link>

        {user && (
          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-md text-secondary hover:text-primary transition-colors duration-fast ease-out rounded-button hover:bg-surface"
            >
              Dashboard
            </Link>
            <Link
              href="/search"
              className="px-3 py-1.5 text-md text-secondary hover:text-primary transition-colors duration-fast ease-out rounded-button hover:bg-surface"
            >
              Search
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <div className="size-7 rounded-pill bg-surface border-[0.5px] border-default flex items-center justify-center text-xs font-medium text-primary">
                {user.email?.charAt(0).toLowerCase()}
              </div>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Log in
              </Link>
              <Link href="/signup" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
