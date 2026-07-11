import { AlertTriangle } from "lucide-react";
import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import { hasPermission } from "@/lib/session";
import type { Material } from "@/server/entities/Material";
import type { StockMovement } from "@/server/entities/StockMovement";
import type { Order } from "@/server/entities/Order";
import { deleteMaterial } from "@/server/actions/inventory";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { MaterialSheet } from "@/components/inventory/material-sheet";
import { MovementSheet } from "@/components/inventory/movement-sheet";
import { Pagination } from "@/components/shared/pagination";
import { UNIT_LABEL, STOCK_MOVEMENT_TYPE, PAGE_SIZE } from "@/lib/constants";
import { formatMoney, formatDate, formatNumber } from "@/lib/format";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requirePermission("inventory:read");
  const canWrite = hasPermission(session.permissions, "inventory:write");
  const page = Math.max(1, Number((await searchParams).page) || 1);

  const ds = await getDataSource();
  const matRepo = ds.getRepository<Material>("materials");
  const [[materials, total], allMats, movements, orders] = await Promise.all([
    matRepo.findAndCount({ order: { name: "ASC" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    matRepo.find(),
    ds.getRepository<StockMovement>("stock_movements").find({ order: { createdAt: "DESC" }, take: 12 }),
    ds.getRepository<Order>("orders").find({ order: { createdAt: "DESC" }, take: 100 }),
  ]);

  const lowStock = allMats.filter(
    (m) => Number(m.minQty) > 0 && Number(m.stockQty) < Number(m.minQty),
  );
  const materialMap = new Map(allMats.map((m) => [m.id, m]));
  const orderOpts = orders.map((o) => ({ id: o.id, number: o.number }));

  const columns: Column<Material>[] = [
    { header: "Material", cell: (m) => <span className="font-medium text-ink">{m.name}</span> },
    { header: "Vahid", cell: (m) => UNIT_LABEL[m.unit] ?? m.unit },
    {
      header: "Qalıq",
      align: "right",
      className: "tabular",
      cell: (m) => {
        const low = Number(m.minQty) > 0 && Number(m.stockQty) < Number(m.minQty);
        return (
          <span className={low ? "font-medium text-danger" : "text-ink"}>
            {formatNumber(m.stockQty)}
          </span>
        );
      },
    },
    { header: "Min.", align: "right", className: "tabular", cell: (m) => formatNumber(m.minQty) },
    { header: "Orta maya", align: "right", className: "tabular", cell: (m) => formatMoney(m.avgCost) },
    {
      header: "Dəyər",
      align: "right",
      className: "tabular",
      cell: (m) => formatMoney(Number(m.stockQty) * Number(m.avgCost)),
    },
    ...(canWrite
      ? [
          {
            header: "",
            align: "right" as const,
            cell: (m: Material) => (
              <div className="flex justify-end gap-1">
                <MovementSheet materialId={m.id} materialName={m.name} orders={orderOpts} />
                <MaterialSheet
                  id={m.id}
                  triggerLabel="Redaktə"
                  triggerVariant="ghost"
                  triggerSize="sm"
                  initial={{
                    name: m.name,
                    unit: m.unit,
                    minQty: String(m.minQty),
                    avgCost: String(m.avgCost),
                  }}
                />
                <ConfirmAction
                  action={deleteMaterial}
                  arg={m.id}
                  confirmText={`"${m.name}" silinsin?`}
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

  return (
    <div>
      <PageHeader
        title="Anbar"
        description="Material qalığı və hərəkətləri"
        action={canWrite ? <MaterialSheet triggerLabel="+ Yeni material" /> : undefined}
      />

      {lowStock.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <span className="font-medium">{lowStock.length}</span> material minimum həddən aşağıdır:{" "}
            {lowStock.map((m) => m.name).join(", ")}
          </span>
        </div>
      )}

      <DataTable columns={columns} rows={materials} empty="Hələ material yoxdur." />
      <Pagination total={total} page={page} pageSize={PAGE_SIZE} />

      {/* Son hərəkətlər */}
      <div className="mt-8">
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-base font-semibold text-ink">
          Son hərəkətlər
        </h2>
        {movements.length === 0 ? (
          <div className="rounded-lg border border-dashed border-hairline bg-surface p-8 text-center text-sm text-ink-muted">
            Hələ hərəkət yoxdur.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-[11px] uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-2.5 text-left">Material</th>
                  <th className="px-4 py-2.5 text-left">Tip</th>
                  <th className="px-4 py-2.5 text-left">Səbəb</th>
                  <th className="px-4 py-2.5 text-right">Miqdar</th>
                  <th className="px-4 py-2.5 text-right">Tarix</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((mv) => {
                  const t = STOCK_MOVEMENT_TYPE[mv.type] ?? { label: mv.type, tone: "neutral" as const };
                  const mat = materialMap.get(mv.materialId);
                  return (
                    <tr key={mv.id} className="border-b border-hairline last:border-0">
                      <td className="px-4 py-3 text-ink">{mat?.name ?? `#${mv.materialId}`}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={t.tone}>{t.label}</StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{mv.reason ?? "—"}</td>
                      <td className="tabular px-4 py-3 text-right text-ink">
                        {formatNumber(mv.qty)} {mat ? UNIT_LABEL[mat.unit] ?? mat.unit : ""}
                      </td>
                      <td className="tabular px-4 py-3 text-right text-ink-muted">
                        {formatDate(mv.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
