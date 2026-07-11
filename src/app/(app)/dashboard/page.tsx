import Link from "next/link";
import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import type { Order } from "@/server/entities/Order";
import type { Invoice } from "@/server/entities/Invoice";
import type { Payment } from "@/server/entities/Payment";
import type { Quote } from "@/server/entities/Quote";
import type { ProductionTask } from "@/server/entities/ProductionTask";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { MiniBars, DistBars } from "@/components/shared/charts";
import { ORDER_STATUS } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/format";

const AZ_MONTH = [
  "Yan", "Fev", "Mar", "Apr", "May", "İyn",
  "İyl", "Avq", "Sen", "Okt", "Noy", "Dek",
];

type OrderRow = Order & { customer: { name: string } | null };

export default async function DashboardPage() {
  const user = await requirePermission("dashboard:read");
  const ds = await getDataSource();

  const [orders, invoices, payments, pendingQuotes, productionLoad] = await Promise.all([
    ds.getRepository<Order>("Order").find({
      relations: { customer: true },
      order: { createdAt: "DESC" },
      take: 200,
    }) as Promise<OrderRow[]>,
    ds.getRepository<Invoice>("Invoice").find(),
    ds.getRepository<Payment>("Payment").find(),
    ds.getRepository<Quote>("Quote").count({ where: { status: "SENT" } }),
    ds
      .getRepository<ProductionTask>("ProductionTask")
      .createQueryBuilder("t")
      .where("t.stage != :done", { done: "DONE" })
      .getCount(),
  ]);

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const monthKey = today.slice(0, 7);

  const activeOrders = orders.filter((o) =>
    ["NEW", "IN_PROGRESS", "INSTALLING"].includes(o.status),
  ).length;
  const overdue = orders.filter(
    (o) =>
      o.deadline &&
      o.deadline < today &&
      !["DELIVERED", "CLOSED", "CANCELLED"].includes(o.status),
  ).length;

  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.total), 0);
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const receivable = totalInvoiced - totalPaid;
  const monthRevenue = payments
    .filter((p) => p.paidAt.slice(0, 7) === monthKey)
    .reduce((s, p) => s + Number(p.amount), 0);

  // Son 6 ay daxilolma
  const months: { key: string; label: string }[] = [];
  for (let k = 5; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: AZ_MONTH[d.getMonth()],
    });
  }
  const revenueBars = months.map((m) => ({
    label: m.label,
    value: payments
      .filter((p) => p.paidAt.slice(0, 7) === m.key)
      .reduce((s, p) => s + Number(p.amount), 0),
  }));

  // Status bölgüsü
  const statusDist = Object.entries(ORDER_STATUS)
    .map(([key, v]) => ({
      label: v.label,
      tone: v.tone,
      value: orders.filter((o) => o.status === key).length,
    }))
    .filter((d) => d.value > 0);

  const recentOrders = orders.slice(0, 5);
  const deadlines = orders
    .filter(
      (o) => o.deadline && !["DELIVERED", "CLOSED", "CANCELLED"].includes(o.status),
    )
    .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`Xoş gəldiniz, ${user.name.split(" ")[0]}`}
        description="Sistemin ümumi vəziyyəti"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Aktiv sifarişlər" value={String(activeOrders)} hint="İcrada olan" />
        <StatCard label="Bu ay daxilolma" value={formatMoney(monthRevenue)} hint="Ödənişlər" />
        <StatCard label="Gözləyən təkliflər" value={String(pendingQuotes)} hint="Göndərilib" />
        <StatCard
          label="Gecikən sifarişlər"
          value={String(overdue)}
          hint={overdue > 0 ? "Diqqət tələb edir" : "Yoxdur"}
        />
        <StatCard label="İstehsalat yükü" value={String(productionLoad)} hint="Aktiv tapşırıq" />
        <StatCard label="Debitor borc" value={formatMoney(receivable)} hint="Ödənilməmiş" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-surface p-5 lg:col-span-2">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-ink">
            Aylıq daxilolma (son 6 ay)
          </h2>
          <MiniBars data={revenueBars} format={formatMoney} />
        </div>
        <div className="rounded-lg border border-hairline bg-surface p-5">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-ink">
            Sifariş statusları
          </h2>
          {statusDist.length ? (
            <DistBars data={statusDist} />
          ) : (
            <p className="text-sm text-ink-muted">Məlumat yoxdur.</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-surface p-5">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-base font-semibold text-ink">
            Son sifarişlər
          </h2>
          {recentOrders.length ? (
            <div className="space-y-1">
              {recentOrders.map((o) => {
                const s = ORDER_STATUS[o.status] ?? { label: o.status, tone: "neutral" as const };
                return (
                  <Link
                    key={o.id}
                    href={`/orders/${o.id}`}
                    className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-surface-sunken"
                  >
                    <span className="flex items-center gap-2">
                      <span className="tabular font-medium text-brand">{o.number}</span>
                      <span className="text-ink-muted">{o.customer?.name ?? "—"}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                      <span className="tabular text-ink">{formatMoney(o.total)}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">Hələ sifariş yoxdur.</p>
          )}
        </div>

        <div className="rounded-lg border border-hairline bg-surface p-5">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-base font-semibold text-ink">
            Yaxınlaşan deadline-lar
          </h2>
          {deadlines.length ? (
            <div className="space-y-1">
              {deadlines.map((o) => {
                const late = o.deadline! < today;
                return (
                  <Link
                    key={o.id}
                    href={`/orders/${o.id}`}
                    className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-surface-sunken"
                  >
                    <span className="flex items-center gap-2">
                      <span className="tabular font-medium text-brand">{o.number}</span>
                      <span className="text-ink-muted">{o.customer?.name ?? "—"}</span>
                    </span>
                    <span className={late ? "tabular font-medium text-danger" : "tabular text-ink-muted"}>
                      {formatDate(o.deadline)}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">Yaxınlaşan deadline yoxdur.</p>
          )}
        </div>
      </div>
    </div>
  );
}
