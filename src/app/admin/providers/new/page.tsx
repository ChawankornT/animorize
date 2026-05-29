import Link from 'next/link';
import { ProviderForm } from '@/components/admin/ProviderForm';

export default function NewProviderPage() {
  return (
    <div className="p-8 space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-secondary">
        <Link href="/admin" className="hover:text-primary transition-colors duration-fast">
          Admin
        </Link>
        <span className="text-tertiary">›</span>
        <Link href="/admin/providers" className="hover:text-primary transition-colors duration-fast">
          Providers
        </Link>
        <span className="text-tertiary">›</span>
        <span className="text-primary font-medium">New</span>
      </nav>

      <div>
        <h1 className="text-2xl font-medium text-primary tracking-tight">New provider</h1>
      </div>

      <ProviderForm />
    </div>
  );
}
