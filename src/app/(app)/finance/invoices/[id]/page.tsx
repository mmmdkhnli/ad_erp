import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import { hasPermission } from "@/lib/session";
import type { Invoice } from "@/server/entities/Invoice";
import type { Payment } from "@/server/entities/Payment";
import type { Order } from "@/server/entities/Order";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaymentSheet } from "@/components/finance/payment-sheet";
import { INVOICE_STATUS, PAYMENT_METHOD } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/format";

type InvoiceFull = Invoice & {
  order: (Order & { customer: { name: string } | null }) | null;
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("finance:read");
  const canWrite = hasPermission(session.permissions, "finance:write");
  const { id } = await params;
  const invoiceId = Number(id);
  if (!Number.isInteger(invoiceId)) notFound();

  const ds = await getDataSource();
  const invoice = (await ds.getRepository<Invoice>("Invoice").findOne({
    where: { id: invoiceId },
    relations: { order: { customer: true } },
  })) as InvoiceFull | null;
  if (!invoice) notFound();

  const payments = await ds
    .getRepository<Payment>("Payment")
    .find({ where: { invoiceId }, order: { paidAt: "DESC" } });

  const paid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const remaining = Math.max(0, Number(invoice.total) - paid);
  const s = INVOICE_STATUS[invoice.status] ?? { label: invoice.status, tone: "neutral" as const };

  return (
    <div>
      <Link
        href="/finance"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Fakturalar
      </Link>

      <PageHeader
        title={invoice.number}
        description={invoice.order?.customer?.name ?? "—"}
        action={
          canWrite && invoice.status !== "PAID" ? (
            <PaymentSheet invoiceId={invoice.id} suggested={remaining.toFixed(2)} />
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-lg border border-hairline bg-surface p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
            {invoice.order && (
              <Link
                href={`/orders/${invoice.order.id}`}
                className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
              >
                <Package className="h-3.5 w-3.5" /> {invoice.order.number}
              </Link>
            )}
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">Məbləğ (ƏDV-siz)</span>
              <span className="tabular text-ink">{formatMoney(invoice.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">ƏDV</span>
              <span className="tabular text-ink">{formatMoney(invoice.vatAmount)}</span>
            </div>
            <div className="my-1 border-t border-hairline" />
            <div className="flex justify-between">
              <span className="font-medium text-ink">Ümumi</span>
              <span className="tabular font-medium text-ink">{formatMoney(invoice.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Ödənilmiş</span>
              <span className="tabular text-success">{formatMoney(paid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Qalıq</span>
              <span className="tabular font-medium text-danger">{formatMoney(remaining)}</span>
            </div>
          </div>
          <div className="border-t border-hairline pt-3 text-xs text-ink-muted">
            Tarix: {formatDate(invoice.issuedAt)}
            {invoice.dueAt && <> · Son ödəmə: {formatDate(invoice.dueAt)}</>}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-base font-semibold text-ink">
            Ödənişlər
          </h2>
          {payments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-hairline bg-surface p-8 text-center text-sm text-ink-muted">
              Hələ ödəniş yoxdur.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-[11px] uppercase tracking-wider text-ink-muted">
                    <th className="px-4 py-2.5 text-left">Tarix</th>
                    <th className="px-4 py-2.5 text-left">Üsul</th>
                    <th className="px-4 py-2.5 text-left">Qeyd</th>
                    <th className="px-4 py-2.5 text-right">Məbləğ</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-hairline last:border-0">
                      <td className="tabular px-4 py-3 text-ink">{formatDate(p.paidAt)}</td>
                      <td className="px-4 py-3 text-ink">{PAYMENT_METHOD[p.method] ?? p.method}</td>
                      <td className="px-4 py-3 text-ink-muted">{p.note ?? "—"}</td>
                      <td className="tabular px-4 py-3 text-right font-medium text-ink">
                        {formatMoney(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
