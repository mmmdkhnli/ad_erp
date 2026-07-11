import { Like } from "typeorm";
import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import { hasPermission } from "@/lib/session";
import type { Lead } from "@/server/entities/Lead";
import { deleteLead, convertLead } from "@/server/actions/crm";
import { PageHeader } from "@/components/shared/page-header";
import { SubNav } from "@/components/shared/sub-nav";
import { TableSearch } from "@/components/shared/table-search";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { LeadSheet } from "@/components/crm/lead-sheet";
import { Pagination } from "@/components/shared/pagination";
import { LEAD_SOURCE, LEAD_STATUS, PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await requirePermission("crm:read");
  const canWrite = hasPermission(session.permissions, "crm:write");
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const ds = await getDataSource();
  const repo = ds.getRepository<Lead>("leads");
  const where = q
    ? [{ name: Like(`%${q}%`) }, { phone: Like(`%${q}%`) }]
    : {};
  const [leads, total] = await repo.findAndCount({
    where,
    order: { createdAt: "DESC" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const columns: Column<Lead>[] = [
    { header: "Ad", cell: (l) => <span className="font-medium text-ink">{l.name}</span> },
    { header: "Mənbə", cell: (l) => LEAD_SOURCE[l.source] ?? l.source },
    {
      header: "Status",
      cell: (l) => {
        const s = LEAD_STATUS[l.status] ?? { label: l.status, tone: "neutral" as const };
        return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
      },
    },
    { header: "Telefon", className: "tabular", cell: (l) => l.phone ?? "—" },
    {
      header: "Yaradılıb",
      align: "right",
      className: "tabular",
      cell: (l) => formatDate(l.createdAt),
    },
    ...(canWrite
      ? [
          {
            header: "",
            align: "right" as const,
            cell: (l: Lead) => (
              <div className="flex justify-end gap-1">
                <LeadSheet
                  id={l.id}
                  triggerLabel="Redaktə"
                  triggerVariant="ghost"
                  triggerSize="sm"
                  initial={{
                    name: l.name,
                    phone: l.phone ?? "",
                    email: l.email ?? "",
                    source: l.source,
                    status: l.status,
                    note: l.note ?? "",
                  }}
                />
                {!l.customerId && (
                  <ConfirmAction
                    action={convertLead}
                    arg={l.id}
                    title="Müştəriyə çevir"
                    confirmText={`"${l.name}" müştəriyə çevrilsin? Yeni müştəri kartı yaradılacaq.`}
                    variant="secondary"
                    size="sm"
                    confirmVariant="primary"
                    confirmLabel="Çevir"
                    redirectPrefix="/crm/customers/"
                  >
                    Müştəriyə çevir
                  </ConfirmAction>
                )}
                <ConfirmAction
                  action={deleteLead}
                  arg={l.id}
                  confirmText={`"${l.name}" silinsin?`}
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
        title="CRM"
        description="Müştərilər, leadlər və əlaqələr"
        action={canWrite ? <LeadSheet triggerLabel="+ Yeni lead" /> : undefined}
      />
      <SubNav
        items={[
          { href: "/crm/customers", label: "Müştərilər" },
          { href: "/crm/leads", label: "Leadlər" },
        ]}
      />
      <div className="mb-4 flex items-center justify-between gap-3">
        <TableSearch placeholder="Ad və ya telefon…" />
        <span className="text-sm text-ink-muted">{total} lead</span>
      </div>
      <DataTable
        columns={columns}
        rows={leads}
        empty="Hələ lead yoxdur. İlk lead-i əlavə edin."
      />
      <Pagination total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
