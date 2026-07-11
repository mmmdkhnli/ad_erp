"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { ICONS } from "./icon";
import type { NavItem } from "@/lib/constants";

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-surface md:flex">
      <div className="flex h-14 items-center gap-2.5 border-b border-hairline px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand font-[family-name:var(--font-display)] text-sm font-bold text-white">
          A
        </div>
        <span className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-ink">
          AdErp
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
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

      {/* <div className="border-t border-hairline p-3">
        <div className="tick-rule mb-2 opacity-50" />
        <p className="px-1 text-[11px] text-ink-faint">AdErp · by <u>m.a</u></p>
      </div> */}
    </aside>
  );
}
