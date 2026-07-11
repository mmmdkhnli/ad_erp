import Link from "next/link";
import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import type { Quote } from "@/server/entities/Quote";
import type { Order } from "@/server/entities/Order";
import type { Invoice } from "@/server/entities/Invoice";
import type { Payment } from "@/server/entities/Payment";
import type { Expense } from "@/server/entities/Expense";
import type { ProductionTask } from "@/server/entities/ProductionTask";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DistBars } from "@/components/shared/charts";
import { ExportCsv } from "@/components/shared/export-csv";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRODUCTION_STAGE } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

type OrderRow = Order & { customer: { name: string } | null };

function toKey(d: Date | string): string {
  return typeof d === "string" ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requirePermission("reports:read");
  const { from, to } = await searchParams;
  const inRange = (d: Date | string) => {
    const k = toKey(d);
    if (from && k < from) return false;
    if (to && k > to) return false;
    return true;
  };

  const ds = await getDataSource();
  const [quotes, orders, invoices, payments, expenses, prodTasks] = await Promise.all([
    ds.getRepository<Quote>("Quote").find(),
    ds.getRepository<Order>("Order").find({ relations: { customer: true } }) as Promise<OrderRow[]>,
    ds.getRepository<Invoice>("Invoice").find(),
    ds.getRepository<Payment>("Payment").find(),
    ds.getRepository<Expense>("Expense").find(),
    ds.getRepository<ProductionTask>("ProductionTask").find(),
  ]);

  const fQuotes = quotes.filter((q) => inRange(q.createdAt));
  const fOrders = orders.filter((o) => inRange(o.createdAt));
  const fInvoices = invoices.filter((i) => inRange(i.issuedAt));
  const fPayments = payments.filter((p) => inRange(p.paidAt));
  const fExpenses = expenses.filter((e) => inRange(e.spentAt));

  // Satış
  const approved = fQuotes.filter((q) => q.status === "APPROVED").length;
  const conversion = fQuotes.length ? Math.round((approved / fQuotes.length) * 100) : 0;

  // Maliyyə
  const revenue = fInvoices.reduce((s, i) => s + Number(i.total), 0);
  const collected = fPayments.reduce((s, p) => s + Number(p.amount), 0);
  const expTotal = fExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const profit = revenue - expTotal;
  const receivable = revenue - collected;

  // Rentabellik (sifariş üzrə) — sifarişin bütün faktura/xərcləri
  const invByOrder = new Map<number, number>();
  invoices.forEach((i) => invByOrder.set(i.orderId, (invByOrder.get(i.orderId) ?? 0) + Number(i.total)));
  const expByOrder = new Map<number, number>();
  expenses.forEach((e) => {
    if (e.orderId) expByOrder.set(e.orderId, (expByOrder.get(e.orderId) ?? 0) + Number(e.amount));
  });
  const profitRows = fOrders
    .map((o) => {
      const rev = invByOrder.get(o.id) ?? 0;
      const cost = expByOrder.get(o.id) ?? 0;
      const p = rev - cost;
      return { o, rev, cost, profit: p, margin: rev > 0 ? (p / rev) * 100 : 0 };
    })
    .sort((a, b) => b.profit - a.profit);

  // Top müştərilər
  const byCustomer = new Map<string, number>();
  fOrders.forEach((o) => {
    const name = o.customer?.name ?? "—";
    byCustomer.set(name, (byCustomer.get(name) ?? 0) + Number(o.total));
  });
  const topCustomers = [...byCustomer.entries()]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // İstehsalat bölgüsü
  const prodDist = Object.entries(PRODUCTION_STAGE)
    .map(([key, v]) => ({ label: v.label, tone: v.tone, value: prodTasks.filter((t) => t.stage === key).length }))
    .filter((d) => d.value > 0);

  return (
    <div>
      <PageHeader title="Hesabatlar" description="Satış, maliyyə və rentabellik analitikası" />

      {/* Tarix filtri (native GET form) */}
      <form method="get" className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-hairline bg-surface p-4">
        <div>
          <label className="mb-1 block text-xs text-ink-muted">Başlanğıc</label>
          <Input type="date" name="from" defaultValue={from ?? ""} className="w-40" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-muted">Son</label>
          <Input type="date" name="to" defaultValue={to ?? ""} className="w-40" />
        </div>
        <Button type="submit" size="sm">Filtr tətbiq et</Button>
        {(from || to) && (
          <Link href="/reports" className="text-sm text-ink-muted hover:text-ink">
            Sıfırla
          </Link>
        )}
      </form>

      {/* Xülasə */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gəlir (faktura)" value={formatMoney(revenue)} hint={`Yığılıb: ${formatMoney(collected)}`} />
        <StatCard label="Mənfəət" value={formatMoney(profit)} hint={`Xərc: ${formatMoney(expTotal)}`} />
        <StatCard label="Təklif→sifariş" value={`${conversion}%`} hint={`${fQuotes.length} təklif, ${fOrders.length} sifariş`} />
        <StatCard label="Debitor borc" value={formatMoney(receivable)} hint="Ödənilməmiş" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Rentabellik cədvəli */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-ink">
              Sifariş rentabelliyi
            </h2>
            <ExportCsv
              filename="rentabellik.csv"
              headers={["Sifariş", "Müştəri", "Gəlir", "Xərc", "Mənfəət", "Marja %"]}
              rows={profitRows.map((r) => [
                r.o.number,
                r.o.customer?.name ?? "—",
                r.rev.toFixed(2),
                r.cost.toFixed(2),
                r.profit.toFixed(2),
                r.margin.toFixed(0),
              ])}
            />
          </div>
          {profitRows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-hairline bg-surface p-8 text-center text-sm text-ink-muted">
              Seçilmiş dövrdə sifariş yoxdur.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-[11px] uppercase tracking-wider text-ink-muted">
                    <th className="px-4 py-2.5 text-left">Sifariş</th>
                    <th className="px-4 py-2.5 text-left">Müştəri</th>
                    <th className="px-3 py-2.5 text-right">Gəlir</th>
                    <th className="px-3 py-2.5 text-right">Xərc</th>
                    <th className="px-3 py-2.5 text-right">Mənfəət</th>
                    <th className="px-4 py-2.5 text-right">Marja</th>
                  </tr>
                </thead>
                <tbody>
                  {profitRows.map((r) => (
                    <tr key={r.o.id} className="border-b border-hairline last:border-0">
                      <td className="tabular px-4 py-3">
                        <Link href={`/orders/${r.o.id}`} className="font-medium text-brand hover:underline">
                          {r.o.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink">{r.o.customer?.name ?? "—"}</td>
                      <td className="tabular px-3 py-3 text-right text-ink">{formatMoney(r.rev)}</td>
                      <td className="tabular px-3 py-3 text-right text-ink-muted">{formatMoney(r.cost)}</td>
                      <td className={`tabular px-3 py-3 text-right font-medium ${r.profit >= 0 ? "text-success" : "text-danger"}`}>
                        {formatMoney(r.profit)}
                      </td>
                      <td className="tabular px-4 py-3 text-right text-ink-muted">{r.margin.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Yan panel */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-lg border border-hairline bg-surface p-5">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-ink">
              Top müştərilər
            </h2>
            {topCustomers.length ? (
              <div className="space-y-2">
                {topCustomers.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <span className="text-ink">{c.name}</span>
                    <span className="tabular text-ink-muted">{formatMoney(c.total)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Məlumat yoxdur.</p>
            )}
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-5">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-ink">
              İstehsalat bölgüsü
            </h2>
            {prodDist.length ? <DistBars data={prodDist} /> : <p className="text-sm text-ink-muted">Məlumat yoxdur.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
