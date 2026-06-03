import Link from "next/link";
import { Library, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Empty } from "@/components/ui/Empty";
import { Tabs } from "@/components/ui/Tabs";

const EMPTY_TABS = [
  { value: "all", label: "All", count: 0 },
  { value: "watching", label: "Watching", count: 0 },
  { value: "favorites", label: "Favorites", count: 0 },
] as const;

export function DashboardEmpty() {
  return (
    <div className="px-8 py-6 flex flex-col gap-4">
      <div>
        <h1 className="text-4xl font-medium tracking-tight leading-none mb-1.5">Library</h1>
        <p className="text-sm text-tertiary">Nothing here yet — add your first title.</p>
      </div>

      <Tabs items={[...EMPTY_TABS]} value="all" />

      <div className="border-[0.5px] border-default rounded-card bg-page p-2 mt-4">
        <Empty
          icon={Library}
          title="Your library is empty"
          body="Search for an anime, series, or movie to add it."
          action={
            <Link
              href="/search"
              className={buttonVariants({ variant: "primary", size: "md" }) + " gap-2 mt-1"}
            >
              <Plus size={16} strokeWidth={1.5} />
              Add your first title
            </Link>
          }
        />
      </div>
    </div>
  );
}
