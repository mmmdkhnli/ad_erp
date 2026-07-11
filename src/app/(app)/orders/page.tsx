import Link from "next/link";
import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import { hasPermission } from "@/lib/session";
import type { Order } from "@/server/entities/Order";
import { deleteOrder } from "@/server/actions/orders";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { Pagination } from "@/components/shared/pagination";
import { ORDER_STATUS, PAGE_SIZE } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/format";

type OrderRow = Order & { customer: { name: string } | null };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await requirePermission("orders:read");
  const canWrite = hasPermission(session.permissions, "orders:write");
  const { status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const ds = await getDataSource();
  const where = status && ORDER_STATUS[status] ? { status } : {};
  const [orders, total] = (await ds.getRepository<Order>("Order").findAndCount({
    where,
    relations: { customer: true },
    order: { createdAt: "DESC" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })) as [OrderRow[], number];

  const columns: Column<OrderRow>[] = [
    {
      header: "Nömrə",
      className: "tabular",
      cell: (o) => (
        <Link href={`/orders/${o.id}`} className="font-medium text-brand hover:underline">
          {o.number}
        </Link>
      ),
    },
    { header: "Müştəri", cell: (o) => o.customer?.name ?? "—" },
    {
      header: "Status",
      cell: (o) => {
        const s = ORDER_STATUS[o.status] ?? { label: o.status, tone: "neutral" as const };
        return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
      },
    },
    {
      header: "Deadline",
      align: "right",
      className: "tabular",
      cell: (o) => formatDate(o.deadline),
    },
    {
      header: "Məbləğ",
      align: "right",
      className: "tabular",
      cell: (o) => formatMoney(o.total),
    },
    ...(canWrite
      ? [
          {
            header: "",
            align: "right" as const,
            cell: (o: OrderRow) => (
              <ConfirmAction
                action={deleteOrder}
                arg={o.id}
                confirmText={`${o.number} silinsin?`}
                variant="ghost"
                size="sm"
              >
                Sil
              </ConfirmAction>
            ),
          },
        ]
      : []),
  ];

  const statusTabs = [
    { key: "", label: "Hamısı" },
    ...Object.entries(ORDER_STATUS).map(([key, v]) => ({ key, label: v.label })),
  ];

  return (
    <div>
      <PageHeader
        title="Sifarişlər"
        description="Təsdiqlənmiş təkliflərdən yaranan sifarişlər (job bag)"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {statusTabs.map((t) => {
          const active = (status ?? "") === t.key;
          return (
            <Link
              key={t.key || "all"}
              href={t.key ? `/orders?status=${t.key}` : "/orders"}
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
        <span className="ml-auto text-sm text-ink-muted">{total} sifariş</span>
      </div>

      <DataTable
        columns={columns}
        rows={orders}
        empty="Hələ sifariş yoxdur. Təsdiqlənmiş təklifdən sifariş yaradın."
      />
      <Pagination total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
