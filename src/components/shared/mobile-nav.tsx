"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ICONS } from "./icon";
import type { NavItem } from "@/lib/constants";

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menyu"
        className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="relative z-10 flex h-full w-64 flex-col bg-surface shadow-xl">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-hairline px-5">
              <span className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand font-[family-name:var(--font-display)] text-sm font-bold text-white">
                  A
                </span>
                <span className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-ink">
                  AdErp
                </span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Bağla"
                className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
              {items.map((item) => {
                const Icon = ICONS[item.icon];
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-brand-soft font-medium text-brand"
                        : "text-ink-muted hover:bg-surface-sunken hover:text-ink",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
                    )}
                    {Icon && <Icon className="h-[18px] w-[18px]" strokeWidth={2} />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
