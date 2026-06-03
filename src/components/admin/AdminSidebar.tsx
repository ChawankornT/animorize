"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type NavItem = { href: string; label: string; exact?: boolean };

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/providers", label: "Providers" },
  { href: "/admin/franchises", label: "Franchises" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/import", label: "Import" },
  { href: "/admin/sync-logs", label: "Sync logs" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-48 shrink-0 border-r-[0.5px] border-default bg-page py-6 px-2">
      <p className="px-3 mb-3 text-xs font-medium text-tertiary uppercase tracking-wide">Admin</p>
      <ul className="space-y-0.5">
        {navItems.map(({ href, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center h-8 px-3 rounded-md text-sm transition-colors duration-fast ease-out",
                  isActive
                    ? "bg-surface text-primary font-medium"
                    : "text-secondary hover:text-primary hover:bg-surface",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
