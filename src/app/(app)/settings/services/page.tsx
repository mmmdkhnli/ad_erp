import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import type { ServiceCatalog } from "@/server/entities/ServiceCatalog";
import { deleteService } from "@/server/actions/settings";
import { PageHeader } from "@/components/shared/page-header";
import { SubNav } from "@/components/shared/sub-nav";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { ServiceSheet } from "@/components/settings/service-sheet";
import { Pagination } from "@/components/shared/pagination";
import { SERVICE_CATEGORY, UNIT_LABEL, PAGE_SIZE } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

const NAV = [
  { href: "/settings/services", label: "Xidmət kataloqu" },
  { href: "/settings/users", label: "İstifadəçilər" },
  { href: "/settings/audit", label: "Audit" },
  { href: "/settings/company", label: "Şirkət" },
];

export default async function SettingsServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePermission("settings:read");
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const ds = await getDataSource();
  const [services, total] = await ds
    .getRepository<ServiceCatalog>("service_catalog")
    .findAndCount({
      order: { category: "ASC", name: "ASC" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

  const columns: Column<ServiceCatalog>[] = [
    { header: "Ad", cell: (s) => <span className="font-medium text-ink">{s.name}</span> },
    { header: "Kateqoriya", cell: (s) => SERVICE_CATEGORY[s.category] ?? s.category },
    { header: "Vahid", cell: (s) => UNIT_LABEL[s.unit] ?? s.unit },
    { header: "Qiymət", align: "right", className: "tabular", cell: (s) => (s.defaultPrice ? formatMoney(s.defaultPrice) : "—") },
    { header: "Marja", align: "right", className: "tabular", cell: (s) => `${Number(s.defaultMargin)}%` },
    {
      header: "Vəziyyət",
      cell: (s) => <StatusBadge tone={s.isActive ? "success" : "neutral"}>{s.isActive ? "Aktiv" : "Deaktiv"}</StatusBadge>,
    },
    {
      header: "",
      align: "right",
      cell: (s) => (
        <div className="flex justify-end gap-1">
          <ServiceSheet
            id={s.id}
            triggerLabel="Redaktə"
            triggerVariant="ghost"
            triggerSize="sm"
            initial={{
              name: s.name,
              category: s.category,
              unit: s.unit,
              defaultPrice: s.defaultPrice ?? "",
              defaultMargin: String(s.defaultMargin),
              isActive: s.isActive ? "true" : "false",
            }}
          />
          <ConfirmAction action={deleteService} arg={s.id} confirmText={`"${s.name}" silinsin?`} variant="ghost" size="sm">
            Sil
          </ConfirmAction>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Parametrlər"
        description="Xidmət kataloqu, istifadəçilər və şirkət"
        action={<ServiceSheet triggerLabel="+ Yeni xidmət" />}
      />
      <SubNav items={NAV} />
      <div className="mb-4 text-sm text-ink-muted">{total} xidmət</div>
      <DataTable columns={columns} rows={services} empty="Hələ xidmət yoxdur." />
      <Pagination total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
