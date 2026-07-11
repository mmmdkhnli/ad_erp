import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import { hasPermission } from "@/lib/session";
import type { Expense } from "@/server/entities/Expense";
import type { Order } from "@/server/entities/Order";
import { deleteExpense } from "@/server/actions/finance";
import { PageHeader } from "@/components/shared/page-header";
import { SubNav } from "@/components/shared/sub-nav";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { ExpenseSheet } from "@/components/finance/expense-sheet";
import { Pagination } from "@/components/shared/pagination";
import { EXPENSE_CATEGORY, PAGE_SIZE } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/format";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requirePermission("finance:read");
  const canWrite = hasPermission(session.permissions, "finance:write");
  const page = Math.max(1, Number((await searchParams).page) || 1);

  const ds = await getDataSource();
  const expenseRepo = ds.getRepository<Expense>("Expense");
  const [[expenses, count], sumRow, orders] = await Promise.all([
    expenseRepo.findAndCount({
      order: { spentAt: "DESC" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    expenseRepo.createQueryBuilder("e").select("COALESCE(SUM(e.amount),0)", "s").getRawOne<{ s: string }>(),
    ds.getRepository<Order>("Order").find({ relations: { customer: true }, order: { createdAt: "DESC" }, take: 100 }),
  ]);

  const total = Number(sumRow?.s ?? 0);
  const orderMap = new Map(orders.map((o) => [o.id, o.number]));

  const columns: Column<Expense>[] = [
    { header: "Təsvir", cell: (e) => <span className="text-ink">{e.description}</span> },
    { header: "Kateqoriya", cell: (e) => EXPENSE_CATEGORY[e.category] ?? e.category },
    {
      header: "Sifariş",
      className: "tabular",
      cell: (e) => (e.orderId ? orderMap.get(e.orderId) ?? "—" : "Ümumi"),
    },
    { header: "Məbləğ", align: "right", className: "tabular", cell: (e) => formatMoney(e.amount) },
    { header: "Tarix", align: "right", className: "tabular", cell: (e) => formatDate(e.spentAt) },
    ...(canWrite
      ? [
          {
            header: "",
            align: "right" as const,
            cell: (e: Expense) => (
              <ConfirmAction
                action={deleteExpense}
                arg={e.id}
                confirmText="Xərc silinsin?"
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
            <ExpenseSheet
              orders={orders.map((o) => ({
                id: o.id,
                number: o.number,
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

      <div className="mb-4 flex justify-end">
        <span className="text-sm text-ink-muted">
          Ümumi xərc: <span className="tabular font-medium text-ink">{formatMoney(total)}</span>
        </span>
      </div>

      <DataTable columns={columns} rows={expenses} empty="Hələ xərc yoxdur." />
      <Pagination total={count} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
