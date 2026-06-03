import { Wordmark } from "@/components/brand/Wordmark";

export function Footer() {
  return (
    <footer className="border-t-[0.5px] border-default px-6 py-6 text-center">
      <div className="flex items-center justify-center gap-2 text-xs text-tertiary">
        <Wordmark size="sm" className="text-tertiary" />
        <span>© 2026</span>
      </div>
    </footer>
  );
}
