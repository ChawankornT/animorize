import Link from "next/link";
import { FranchiseForm } from "@/components/admin/FranchiseForm";

export default function NewFranchisePage() {
  return (
    <div className="p-8 space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-secondary">
        <Link href="/admin" className="hover:text-primary transition-colors duration-fast">
          Admin
        </Link>
        <span className="text-tertiary">›</span>
        <Link
          href="/admin/franchises"
          className="hover:text-primary transition-colors duration-fast"
        >
          Franchises
        </Link>
        <span className="text-tertiary">›</span>
        <span className="text-primary font-medium">New</span>
      </nav>

      <div>
        <h1 className="text-2xl font-medium text-primary tracking-tight">New franchise</h1>
      </div>

      <FranchiseForm />
    </div>
  );
}
