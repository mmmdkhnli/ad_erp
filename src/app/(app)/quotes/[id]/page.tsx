import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import { hasPermission } from "@/lib/session";
import type { Quote } from "@/server/entities/Quote";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { QuoteStatusActions } from "@/components/quotes/quote-status-actions";
import { convertQuoteToOrder } from "@/server/actions/orders";
import { QUOTE_STATUS, UNIT_LABEL } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/format";

type QuoteFull = Quote & { customer: { id: number; name: string } | null };

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("quotes:read");
  const canWrite = hasPermission(session.permissions, "quotes:write");
  const { id } = await params;
  const quoteId = Number(id);
  if (!Number.isInteger(quoteId)) notFound();

  const ds = await getDataSource();
  const quote = (await ds.getRepository<Quote>("Quote").findOne({
    where: { id: quoteId },
    relations: { customer: true, items: true },
  })) as QuoteFull | null;
  if (!quote) notFound();

  const s = QUOTE_STATUS[quote.status] ?? { label: quote.status, tone: "neutral" as const };

  return (
    <div>
      <Link
        href="/quotes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Təkliflər
      </Link>

      <PageHeader
        title={quote.number}
        description={quote.customer?.name ?? "—"}
        action={
          canWrite ? (
            <div className="flex items-center gap-2">
              <QuoteStatusActions id={quote.id} status={quote.status} />
              {quote.status === "APPROVED" && (
                <ConfirmAction
                  action={convertQuoteToOrder}
                  arg={quote.id}
                  title="Sifarişə çevir"
                  confirmText={`${quote.number} təklifi sifarişə çevrilsin? Sətirlər yeni sifarişə kopyalanacaq.`}
                  variant="primary"
                  size="sm"
                  confirmVariant="primary"
                  confirmLabel="Çevir"
                  redirectPrefix="/orders/"
                >
                  Sifarişə çevir
                </ConfirmAction>
              )}
              <Link href={`/quotes/${quote.id}/edit`}>
                <Button variant="secondary" size="sm">
                  Redaktə
                </Button>
              </Link>
            </div>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
        <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
        <span>Tarix: <span className="tabular text-ink">{formatDate(quote.createdAt)}</span></span>
        {quote.validUntil && (
          <span>
            Etibarlıdır: <span className="tabular text-ink">{formatDate(quote.validUntil)}</span>
          </span>
        )}
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
                    <th className="px-3 py-2.5 text-right">Material</th>
                    <th className="px-3 py-2.5 text-right">İşçilik</th>
                    <th className="px-3 py-2.5 text-right">Daşınma</th>
                    <th className="px-3 py-2.5 text-right">Quraşd.</th>
                    <th className="px-3 py-2.5 text-right">Marja</th>
                    <th className="px-4 py-2.5 text-right">Cəm</th>
                  </tr>
                </thead>
                <tbody>
                  {(quote.items ?? []).map((it) => (
                    <tr key={it.id} className="border-b border-hairline last:border-0">
                      <td className="px-4 py-3 text-ink">{it.description}</td>
                      <td className="tabular px-3 py-3 text-right text-ink-muted">
                        {Number(it.qty)} {UNIT_LABEL[it.unit] ?? it.unit}
                      </td>
                      <td className="tabular px-3 py-3 text-right">{formatMoney(it.materialCost)}</td>
                      <td className="tabular px-3 py-3 text-right">{formatMoney(it.laborCost)}</td>
                      <td className="tabular px-3 py-3 text-right">{formatMoney(it.transportCost)}</td>
                      <td className="tabular px-3 py-3 text-right">{formatMoney(it.installCost)}</td>
                      <td className="tabular px-3 py-3 text-right text-ink-muted">
                        {Number(it.marginPct)}%
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
          {quote.note && (
            <div className="mt-4 rounded-lg border border-hairline bg-surface p-4">
              <div className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                Qeyd
              </div>
              <p className="mt-1 text-sm text-ink">{quote.note}</p>
            </div>
          )}
        </div>

        {/* Yekun */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-hairline bg-surface p-5">
            <div className="tick-rule mb-3 w-20 opacity-60" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Aralıq cəm</span>
                <span className="tabular text-ink">{formatMoney(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Mənfəət (marja)</span>
                <span className="tabular text-ink">{formatMoney(quote.marginAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">ƏDV ({Number(quote.vatRate)}%)</span>
                <span className="tabular text-ink">{formatMoney(quote.vatAmount)}</span>
              </div>
              <div className="my-1 border-t border-hairline" />
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">Yekun</span>
                <span className="tabular font-[family-name:var(--font-display)] text-xl font-semibold text-brand">
                  {formatMoney(quote.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
