import Link from "next/link";
import { Like } from "typeorm";
import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import { hasPermission } from "@/lib/session";
import type { Customer } from "@/server/entities/Customer";
import { deleteCustomer } from "@/server/actions/crm";
import { PageHeader } from "@/components/shared/page-header";
import { SubNav } from "@/components/shared/sub-nav";
import { TableSearch } from "@/components/shared/table-search";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { CustomerSheet } from "@/components/crm/customer-sheet";
import { Pagination } from "@/components/shared/pagination";
import { CUSTOMER_TYPE, PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await requirePermission("crm:read");
  const canWrite = hasPermission(session.permissions, "crm:write");
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const ds = await getDataSource();
  const repo = ds.getRepository<Customer>("customers");
  const where = q
    ? [
        { name: Like(`%${q}%`) },
        { phone: Like(`%${q}%`) },
        { email: Like(`%${q}%`) },
      ]
    : {};
  const [customers, total] = await repo.findAndCount({
    where,
    order: { createdAt: "DESC" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const columns: Column<Customer>[] = [
    {
      header: "Ad",
      cell: (c) => (
        <Link
          href={`/crm/customers/${c.id}`}
          className="font-medium text-brand hover:underline"
        >
          {c.name}
        </Link>
      ),
    },
    { header: "Tip", cell: (c) => CUSTOMER_TYPE[c.type] ?? c.type },
    {
      header: "Telefon",
      className: "tabular",
      cell: (c) => c.phone ?? "—",
    },
    { header: "Email", cell: (c) => c.email ?? "—" },
    {
      header: "Yaradılıb",
      align: "right",
      className: "tabular",
      cell: (c) => formatDate(c.createdAt),
    },
    ...(canWrite
      ? [
          {
            header: "",
            align: "right" as const,
            cell: (c: Customer) => (
              <div className="flex justify-end gap-1">
                <CustomerSheet
                  id={c.id}
                  triggerLabel="Redaktə"
                  triggerVariant="ghost"
                  triggerSize="sm"
                  initial={{
                    name: c.name,
                    type: c.type as "INDIVIDUAL" | "COMPANY",
                    taxId: c.taxId ?? "",
                    contactPerson: c.contactPerson ?? "",
                    phone: c.phone ?? "",
                    email: c.email ?? "",
                    address: c.address ?? "",
                    note: c.note ?? "",
                  }}
                />
                <ConfirmAction
                  action={deleteCustomer}
                  arg={c.id}
                  confirmText={`"${c.name}" silinsin?`}
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
        action={
          canWrite ? (
            <CustomerSheet triggerLabel="+ Yeni müştəri" />
          ) : undefined
        }
      />
      <SubNav
        items={[
          { href: "/crm/customers", label: "Müştərilər" },
          { href: "/crm/leads", label: "Leadlər" },
        ]}
      />
      <div className="mb-4 flex items-center justify-between gap-3">
        <TableSearch placeholder="Ad, telefon və ya email…" />
        <span className="text-sm text-ink-muted">{total} müştəri</span>
      </div>
      <DataTable
        columns={columns}
        rows={customers}
        empty="Hələ müştəri yoxdur. İlk müştərini əlavə edin."
      />
      <Pagination total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
