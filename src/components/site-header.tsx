"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Main Page" },
  { href: "/topics", label: "Topics" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:color-mix(in_srgb,var(--surface)_92%,white)] backdrop-blur supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--surface)_84%,white)]">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg font-bold">
          <Landmark className="h-5 w-5 text-[var(--accent-strong)]" />
          Senate Insight
        </Link>
        <nav className="flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--card)] p-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors",
                pathname === item.href
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--card-muted)] hover:text-[var(--foreground)]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
