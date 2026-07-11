import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import { hasPermission } from "@/lib/session";
import type { Order } from "@/server/entities/Order";
import type { Quote } from "@/server/entities/Quote";
import type { Invoice } from "@/server/entities/Invoice";
import type { Expense } from "@/server/entities/Expense";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { OrderStatusActions } from "@/components/orders/order-status-actions";
import { InvoiceSheet } from "@/components/finance/invoice-sheet";
import { ORDER_STATUS, INVOICE_STATUS, UNIT_LABEL } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/format";

type OrderFull = Order & { customer: { id: number; name: string } | null };

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-ink">{value}</div>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("orders:read");
  const canWrite = hasPermission(session.permissions, "orders:write");
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const ds = await getDataSource();
  const order = (await ds.getRepository<Order>("Order").findOne({
    where: { id: orderId },
    relations: { customer: true, items: true },
  })) as OrderFull | null;
  if (!order) notFound();

  const quote = order.quoteId
    ? await ds
        .getRepository<Quote>("Quote")
        .findOne({ where: { id: order.quoteId }, withDeleted: true })
    : null;

  const [invoices, expenses] = await Promise.all([
    ds.getRepository<Invoice>("Invoice").find({ where: { orderId }, order: { createdAt: "DESC" } }),
    ds.getRepository<Expense>("Expense").find({ where: { orderId } }),
  ]);
  const revenue = invoices.reduce((a, i) => a + Number(i.total), 0);
  const cost = expenses.reduce((a, e) => a + Number(e.amount), 0);
  const profit = revenue - cost;
  const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;
  const canWriteFinance = hasPermission(session.permissions, "finance:write");

  const s = ORDER_STATUS[order.status] ?? { label: order.status, tone: "neutral" as const };

  return (
    <div>
      <Link
        href="/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Sifarişlər
      </Link>

      <PageHeader
        title={order.number}
        description={order.customer?.name ?? "—"}
        action={canWrite ? <OrderStatusActions id={order.id} status={order.status} /> : undefined}
      />

      {/* İş axını mərhələləri (status zolağı) */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {["NEW", "IN_PROGRESS", "INSTALLING", "DELIVERED", "CLOSED"].map((st, i, arr) => {
          const active = order.status === st;
          const done = arr.indexOf(order.status) > i;
          const info = ORDER_STATUS[st];
          return (
            <div key={st} className="flex items-center gap-2">
              <span
                className={
                  active
                    ? "rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-white"
                    : done
                      ? "rounded-md bg-success-soft px-2.5 py-1 text-xs font-medium text-success"
                      : "rounded-md bg-surface-sunken px-2.5 py-1 text-xs text-ink-muted"
                }
              >
                {info.label}
              </span>
              {i < arr.length - 1 && <span className="text-ink-faint">›</span>}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sətirlər */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-[11px] uppercase tracking-wider text-ink-muted">
                    <th className="px-4 py-2.5 text-left">Təsvir</th>
                    <th className="px-3 py-2.5 text-right">Say</th>
                    <th className="px-4 py-2.5 text-right">Məbləğ</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items ?? []).map((it) => (
                    <tr key={it.id} className="border-b border-hairline last:border-0">
                      <td className="px-4 py-3 text-ink">{it.description}</td>
                      <td className="tabular px-3 py-3 text-right text-ink-muted">
                        {Number(it.qty)} {UNIT_LABEL[it.unit] ?? it.unit}
                      </td>
                      <td className="tabular px-4 py-3 text-right font-medium text-ink">
                        {formatMoney(it.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Maliyyə və rentabellik */}
          <div className="mt-4 rounded-lg border border-hairline bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-ink">
                Maliyyə və rentabellik
              </h2>
              {canWriteFinance && (
                <InvoiceSheet
                  orders={[
                    {
                      id: order.id,
                      number: order.number,
                      total: order.total,
                      customerName: order.customer?.name ?? null,
                    },
                  ]}
                  triggerLabel="+ Faktura yarat"
                  triggerVariant="secondary"
                  triggerSize="sm"
                />
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-surface-sunken p-3">
                <div className="text-[11px] uppercase tracking-wider text-ink-muted">
                  Gəlir (faktura)
                </div>
                <div className="tabular mt-1 text-lg font-semibold text-ink">
                  {formatMoney(revenue)}
                </div>
              </div>
              <div className="rounded-md bg-surface-sunken p-3">
                <div className="text-[11px] uppercase tracking-wider text-ink-muted">Xərc</div>
                <div className="tabular mt-1 text-lg font-semibold text-ink">
                  {formatMoney(cost)}
                </div>
              </div>
              <div className="rounded-md bg-surface-sunken p-3">
                <div className="text-[11px] uppercase tracking-wider text-ink-muted">
                  Mənfəət ({marginPct.toFixed(0)}%)
                </div>
                <div
                  className={`tabular mt-1 text-lg font-semibold ${
                    profit >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {formatMoney(profit)}
                </div>
              </div>
            </div>
            {invoices.length > 0 && (
              <div className="mt-4 space-y-2">
                {invoices.map((inv) => {
                  const st =
                    INVOICE_STATUS[inv.status] ?? { label: inv.status, tone: "neutral" as const };
                  return (
                    <Link
                      key={inv.id}
                      href={`/finance/invoices/${inv.id}`}
                      className="flex items-center justify-between rounded-md border border-hairline px-3 py-2 text-sm hover:bg-surface-sunken"
                    >
                      <span className="tabular font-medium text-brand">{inv.number}</span>
                      <span className="flex items-center gap-3">
                        <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                        <span className="tabular text-ink">{formatMoney(inv.total)}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Məlumat */}
        <div className="lg:col-span-1">
          <div className="space-y-4 rounded-lg border border-hairline bg-surface p-5">
            <div className="tick-rule w-20 opacity-60" />
            <Info label="Status" value={<StatusBadge tone={s.tone}>{s.label}</StatusBadge>} />
            <Info label="Deadline" value={formatDate(order.deadline)} />
            <Info label="Yaradılıb" value={formatDate(order.createdAt)} />
            {quote && (
              <Info
                label="Mənbə təklif"
                value={
                  <Link
                    href={`/quotes/${quote.id}`}
                    className="inline-flex items-center gap-1 text-brand hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" /> {quote.number}
                  </Link>
                }
              />
            )}
            <div className="border-t border-hairline pt-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">Ümumi məbləğ</span>
                <span className="tabular font-[family-name:var(--font-display)] text-xl font-semibold text-brand">
                  {formatMoney(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
