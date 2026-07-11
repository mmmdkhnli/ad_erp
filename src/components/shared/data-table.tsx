import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Column<T> = {
  header: string;
  align?: "left" | "right" | "center";
  className?: string;
  cell: (row: T) => ReactNode;
};

function alignCls(a?: "left" | "right" | "center") {
  return a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";
}

/** SSR cədvəl (dizayn sistemi): hairline sətir ayırıcı, mono rəqəm sütunları. */
export function DataTable<T>({
  columns,
  rows,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: ReactNode;
}) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-hairline bg-surface p-10 text-center text-sm text-ink-muted">
        {empty ?? "Məlumat yoxdur."}
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline">
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={cn(
                    "whitespace-nowrap px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-muted",
                    alignCls(c.align),
                    c.className,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-hairline transition-colors last:border-0 hover:bg-surface-sunken"
              >
                {columns.map((c, ci) => (
                  <td
                    key={ci}
                    className={cn("px-4 py-3 text-ink", alignCls(c.align), c.className)}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
