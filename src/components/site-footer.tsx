export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-3 text-xs text-[var(--muted-foreground)] md:px-6">
        <span>Agent Senate</span>
        <span>Client-side static data mode</span>
      </div>
    </footer>
  );
}
