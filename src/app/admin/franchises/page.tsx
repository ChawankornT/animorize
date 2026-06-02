import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createFranchiseRepository } from "@/repositories";
import { listFranchises } from "@/domain/usecases/ListFranchises";
import { getDisplayTitle } from "@/domain/entities/Franchise";
import { buttonVariants } from "@/components/ui/button-variants";
import { FranchiseDeleteButton } from "@/components/admin/FranchiseDeleteButton";

export default async function FranchisesPage() {
  const supabase = await createClient();
  const repo = createFranchiseRepository(supabase);
  const franchises = await listFranchises(repo);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-primary tracking-tight">Franchises</h1>
          <p className="mt-1 text-sm text-secondary">
            Manage franchise groupings for media series.
          </p>
        </div>
        <Link href="/admin/franchises/new" className={buttonVariants({ size: "sm" })}>
          Add franchise
        </Link>
      </div>

      {franchises.length === 0 ? (
        <div className="py-16 text-center text-secondary text-sm border-[0.5px] border-default rounded-card">
          No franchises yet.{" "}
          <Link
            href="/admin/franchises/new"
            className="text-primary underline-offset-2 hover:underline"
          >
            Add the first one.
          </Link>
        </div>
      ) : (
        <div className="border-[0.5px] border-default rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-[0.5px] border-default bg-surface">
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Franchise
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wide">
                  Created
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-default">
              {franchises.map(franchise => {
                const primaryTitle = getDisplayTitle(franchise);
                const subParts = [franchise.titleRomaji, franchise.titleTh].filter(
                  (t): t is string => !!t && t !== primaryTitle,
                );
                const subTitle = subParts.join(" · ");
                return (
                  <tr
                    key={franchise.id}
                    className="hover:bg-surface transition-colors duration-fast"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-primary">{primaryTitle}</div>
                      {subTitle && <div className="text-xs text-tertiary mt-0.5">{subTitle}</div>}
                    </td>
                    <td className="px-4 py-3 text-secondary text-xs">
                      {new Date(franchise.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/franchises/${franchise.id}/edit`}
                          className={buttonVariants({ variant: "secondary", size: "sm" })}
                        >
                          Edit
                        </Link>
                        <FranchiseDeleteButton id={franchise.id} title={primaryTitle} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
