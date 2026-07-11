import Link from "next/link";
import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import { hasPermission } from "@/lib/session";
import type { Quote } from "@/server/entities/Quote";
import { deleteQuote } from "@/server/actions/quotes";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { QUOTE_STATUS, PAGE_SIZE } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/format";

type QuoteRow = Quote & { customer: { name: string } | null };

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await requirePermission("quotes:read");
  const canWrite = hasPermission(session.permissions, "quotes:write");
  const { status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const ds = await getDataSource();
  const where = status && QUOTE_STATUS[status] ? { status } : {};
  const [quotes, total] = (await ds.getRepository<Quote>("Quote").findAndCount({
    where,
    relations: { customer: true },
    order: { createdAt: "DESC" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })) as [QuoteRow[], number];

  const columns: Column<QuoteRow>[] = [
    {
      header: "Nömrə",
      className: "tabular",
      cell: (q) => (
        <Link href={`/quotes/${q.id}`} className="font-medium text-brand hover:underline">
          {q.number}
        </Link>
      ),
    },
    { header: "Müştəri", cell: (q) => q.customer?.name ?? "—" },
    {
      header: "Status",
      cell: (q) => {
        const s = QUOTE_STATUS[q.status] ?? { label: q.status, tone: "neutral" as const };
        return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
      },
    },
    {
      header: "Məbləğ",
      align: "right",
      className: "tabular",
      cell: (q) => formatMoney(q.total),
    },
    {
      header: "Tarix",
      align: "right",
      className: "tabular",
      cell: (q) => formatDate(q.createdAt),
    },
    ...(canWrite
      ? [
          {
            header: "",
            align: "right" as const,
            cell: (q: QuoteRow) => (
              <div className="flex justify-end gap-1">
                <Link href={`/quotes/${q.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    Redaktə
                  </Button>
                </Link>
                <ConfirmAction
                  action={deleteQuote}
                  arg={q.id}
                  confirmText={`${q.number} silinsin?`}
                  variant="ghost"
                  size="sm"
                >
                  Sil
                </ConfirmAction>
              </div>
            ),
          },
        ]
      : []),
  ];

  const statusTabs = [
    { key: "", label: "Hamısı" },
    ...Object.entries(QUOTE_STATUS).map(([key, v]) => ({ key, label: v.label })),
  ];

  return (
    <div>
      <PageHeader
        title="Təkliflər"
        description="Kommersial təkliflər və qiymət kalkulyatoru"
        action={
          canWrite ? (
            <Link href="/quotes/new">
              <Button>+ Yeni təklif</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {statusTabs.map((t) => {
          const active = (status ?? "") === t.key;
          return (
            <Link
              key={t.key || "all"}
              href={t.key ? `/quotes?status=${t.key}` : "/quotes"}
              className={
                active
                  ? "rounded-md bg-brand-soft px-3 py-1 text-sm font-medium text-brand"
                  : "rounded-md px-3 py-1 text-sm text-ink-muted hover:bg-surface-sunken"
              }
            >
              {t.label}
            </Link>
          );
        })}
        <span className="ml-auto text-sm text-ink-muted">{total} təklif</span>
      </div>

      <DataTable
        columns={columns}
        rows={quotes}
        empty="Hələ təklif yoxdur. İlk təklifi yaradın."
      />
      <Pagination total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
