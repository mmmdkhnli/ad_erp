import Link from "next/link";
import { MapPin, Package, Clock } from "lucide-react";
import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import { hasPermission } from "@/lib/session";
import type { Installation } from "@/server/entities/Installation";
import type { Order } from "@/server/entities/Order";
import { deleteInstallation } from "@/server/actions/installations";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { InstallationSheet } from "@/components/installations/installation-sheet";
import { InstallationStatusActions } from "@/components/installations/installation-status-actions";
import { INSTALLATION_TYPE, INSTALLATION_STATUS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

type InstFull = Installation & {
  order: (Order & { customer: { name: string } | null }) | null;
};

function fmtDateTime(d: Date | null): string {
  if (!d) return "Vaxt təyin edilməyib";
  const date = new Date(d);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${formatDate(date)} ${hh}:${mm}`;
}

export default async function InstallationsPage() {
  const session = await requirePermission("installations:read");
  const canWrite = hasPermission(session.permissions, "installations:write");

  const ds = await getDataSource();
  const [installations, orders] = await Promise.all([
    ds.getRepository<Installation>("Installation").find({
      relations: { order: { customer: true } },
      order: { scheduledAt: "ASC", createdAt: "DESC" },
    }) as Promise<InstFull[]>,
    ds.getRepository<Order>("Order").find({ relations: { customer: true }, order: { createdAt: "DESC" }, take: 100 }),
  ]);

  return (
    <div>
      <PageHeader
        title="Quraşdırma"
        description="Montaj, demontaj və servis tapşırıqları"
        action={
          canWrite ? (
            <InstallationSheet
              orders={orders.map((o) => ({
                id: o.id,
                number: o.number,
                customerName: (o as Order & { customer: { name: string } | null }).customer?.name ?? null,
              }))}
            />
          ) : undefined
        }
      />

      {installations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-hairline bg-surface p-10 text-center text-sm text-ink-muted">
          Hələ quraşdırma tapşırığı yoxdur.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {installations.map((inst) => {
            const s =
              INSTALLATION_STATUS[inst.status] ?? { label: inst.status, tone: "neutral" as const };
            return (
              <div
                key={inst.id}
                className="flex flex-col rounded-lg border border-hairline bg-surface p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-surface-sunken px-2 py-0.5 text-xs font-medium text-ink-muted">
                    {INSTALLATION_TYPE[inst.type] ?? inst.type}
                  </span>
                  <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                </div>

                <div className="flex items-start gap-1.5 text-sm text-ink">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
                  {inst.mapUrl ? (
                    <a
                      href={inst.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline"
                    >
                      {inst.address}
                    </a>
                  ) : (
                    <span>{inst.address}</span>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
                  <Clock className="h-3.5 w-3.5" />
                  {fmtDateTime(inst.scheduledAt)}
                </div>

                {inst.order && (
                  <Link
                    href={`/orders/${inst.order.id}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-brand hover:underline"
                  >
                    <Package className="h-3.5 w-3.5" /> {inst.order.number}
                    {inst.order.customer?.name ? ` · ${inst.order.customer.name}` : ""}
                  </Link>
                )}

                {inst.teamNote && (
                  <p className="mt-2 rounded-md bg-surface-sunken p-2 text-xs text-ink-muted">
                    {inst.teamNote}
                  </p>
                )}

                {canWrite && (
                  <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
                    <InstallationStatusActions id={inst.id} status={inst.status} />
                    <ConfirmAction
                      action={deleteInstallation}
                      arg={inst.id}
                      confirmText="Quraşdırma tapşırığı silinsin?"
                      variant="ghost"
                      size="sm"
                    >
                      Sil
                    </ConfirmAction>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
