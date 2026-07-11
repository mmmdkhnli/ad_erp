import Link from "next/link";
import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import { hasPermission } from "@/lib/session";
import type { Invoice } from "@/server/entities/Invoice";
import type { Payment } from "@/server/entities/Payment";
import type { Expense } from "@/server/entities/Expense";
import type { Order } from "@/server/entities/Order";
import { deleteInvoice } from "@/server/actions/finance";
import { PageHeader } from "@/components/shared/page-header";
import { SubNav } from "@/components/shared/sub-nav";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { InvoiceSheet } from "@/components/finance/invoice-sheet";
import { Pagination } from "@/components/shared/pagination";
import { INVOICE_STATUS, PAGE_SIZE } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/format";

type InvoiceRow = Invoice & {
  order: (Order & { customer: { name: string } | null }) | null;
};

async function sumOf(ds: Awaited<ReturnType<typeof getDataSource>>, entity: string, col: string) {
  const row = await ds
    .getRepository(entity)
    .createQueryBuilder("t")
    .select(`COALESCE(SUM(t.${col}),0)`, "s")
    .getRawOne<{ s: string }>();
  return Number(row?.s ?? 0);
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requirePermission("finance:read");
  const canWrite = hasPermission(session.permissions, "finance:write");
  const page = Math.max(1, Number((await searchParams).page) || 1);

  const ds = await getDataSource();
  const [[invoices, total], totalInvoiced, totalPaid, totalExpenses, orders] = await Promise.all([
    ds.getRepository<Invoice>("invoices").findAndCount({
      relations: { order: { customer: true } },
      order: { createdAt: "DESC" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }) as Promise<[InvoiceRow[], number]>,
    sumOf(ds, "invoices", "total"),
    sumOf(ds, "payments", "amount"),
    sumOf(ds, "expenses", "amount"),
    ds.getRepository<Order>("orders").find({ relations: { customer: true }, order: { createdAt: "DESC" }, take: 100 }),
  ]);

  const receivable = totalInvoiced - totalPaid;
  const profit = totalInvoiced - totalExpenses;

  const columns: Column<InvoiceRow>[] = [
    {
      header: "Nömrə",
      className: "tabular",
      cell: (inv) => (
        <Link href={`/finance/invoices/${inv.id}`} className="font-medium text-brand hover:underline">
          {inv.number}
        </Link>
      ),
    },
    { header: "Sifariş", className: "tabular", cell: (inv) => inv.order?.number ?? "—" },
    { header: "Müştəri", cell: (inv) => inv.order?.customer?.name ?? "—" },
    {
      header: "Status",
      cell: (inv) => {
        const s = INVOICE_STATUS[inv.status] ?? { label: inv.status, tone: "neutral" as const };
        return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
      },
    },
    { header: "Məbləğ", align: "right", className: "tabular", cell: (inv) => formatMoney(inv.total) },
    { header: "Tarix", align: "right", className: "tabular", cell: (inv) => formatDate(inv.issuedAt) },
    ...(canWrite
      ? [
          {
            header: "",
            align: "right" as const,
            cell: (inv: InvoiceRow) => (
              <ConfirmAction
                action={deleteInvoice}
                arg={inv.id}
                confirmText={`${inv.number} silinsin?`}
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

  return (
    <div>
      <PageHeader
        title="Maliyyə"
        description="Fakturalar, ödənişlər, xərclər və rentabellik"
        action={
          canWrite ? (
            <InvoiceSheet
              orders={orders.map((o) => ({
                id: o.id,
                number: o.number,
                total: o.total,
                customerName: (o as Order & { customer: { name: string } | null }).customer?.name ?? null,
              }))}
            />
          ) : undefined
        }
      />

      <SubNav
        items={[
          { href: "/finance", label: "Fakturalar" },
          { href: "/finance/expenses", label: "Xərclər" },
        ]}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ümumi faktura" value={formatMoney(totalInvoiced)} />
        <StatCard label="Ödənilmiş" value={formatMoney(totalPaid)} hint="Daxil olan" />
        <StatCard label="Borc (debitor)" value={formatMoney(receivable)} hint="Ödənilməmiş" />
        <StatCard label="Mənfəət" value={formatMoney(profit)} hint={`Xərc: ${formatMoney(totalExpenses)}`} />
      </div>

      <DataTable
        columns={columns}
        rows={invoices}
        empty="Hələ faktura yoxdur. Sifarişdən faktura yaradın."
      />
      <Pagination total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
