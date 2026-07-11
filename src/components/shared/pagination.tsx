"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/** Server-tərəf pagination üçün naviqasiya (URL ?page=, digər paramları saxlayır). */
export function Pagination({
  total,
  page,
  pageSize,
}: {
  total: number;
  page: number;
  pageSize: number;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  if (total <= 0) return null;

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  const href = (p: number) => {
    const sp = new URLSearchParams(params.toString());
    if (p <= 1) sp.delete("page");
    else sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const btn =
    "inline-flex h-8 items-center rounded-md border border-hairline bg-surface px-3 text-sm text-ink transition-colors hover:bg-surface-sunken";
  const disabled =
    "inline-flex h-8 items-center rounded-md border border-hairline px-3 text-sm text-ink-faint";

  return (
    <div className="mt-4 flex items-center justify-between gap-4 text-sm">
      <span className="tabular text-ink-muted">
        {from}–{to} / {total}
      </span>
      {pages > 1 && (
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link href={href(page - 1)} className={btn}>
              Əvvəlki
            </Link>
          ) : (
            <span className={disabled}>Əvvəlki</span>
          )}
          <span className="tabular px-1 text-ink-muted">
            {page} / {pages}
          </span>
          {page < pages ? (
            <Link href={href(page + 1)} className={btn}>
              Növbəti
            </Link>
          ) : (
            <span className={disabled}>Növbəti</span>
          )}
        </div>
      )}
    </div>
  );
}
