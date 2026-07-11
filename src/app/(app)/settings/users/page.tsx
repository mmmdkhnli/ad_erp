import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import type { User } from "@/server/entities/User";
import type { Role } from "@/server/entities/Role";
import { deleteUser } from "@/server/actions/settings";
import { PageHeader } from "@/components/shared/page-header";
import { SubNav } from "@/components/shared/sub-nav";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { UserSheet } from "@/components/settings/user-sheet";
import { Pagination } from "@/components/shared/pagination";
import { PAGE_SIZE } from "@/lib/constants";

const NAV = [
  { href: "/settings/services", label: "Xidmət kataloqu" },
  { href: "/settings/users", label: "İstifadəçilər" },
  { href: "/settings/audit", label: "Audit" },
  { href: "/settings/company", label: "Şirkət" },
];

type UserRow = User & { role: { label: string } };

export default async function SettingsUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePermission("settings:read");
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const ds = await getDataSource();
  const [[users, total], roles] = await Promise.all([
    ds.getRepository<User>("User").findAndCount({
      order: { name: "ASC" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }) as Promise<[UserRow[], number]>,
    ds.getRepository<Role>("Role").find({ order: { name: "ASC" } }),
  ]);
  const roleOpts = roles.map((r) => ({ id: r.id, label: r.label }));

  const columns: Column<UserRow>[] = [
    { header: "Ad", cell: (u) => <span className="font-medium text-ink">{u.name}</span> },
    { header: "Email", className: "tabular", cell: (u) => u.email },
    { header: "Rol", cell: (u) => u.role?.label ?? "—" },
    {
      header: "Vəziyyət",
      cell: (u) => <StatusBadge tone={u.isActive ? "success" : "neutral"}>{u.isActive ? "Aktiv" : "Deaktiv"}</StatusBadge>,
    },
    {
      header: "",
      align: "right",
      cell: (u) => (
        <div className="flex justify-end gap-1">
          <UserSheet
            id={u.id}
            roles={roleOpts}
            triggerLabel="Redaktə"
            triggerVariant="ghost"
            triggerSize="sm"
            initial={{
              name: u.name,
              email: u.email,
              roleId: String(u.roleId),
              password: "",
              isActive: u.isActive ? "true" : "false",
            }}
          />
          <ConfirmAction action={deleteUser} arg={u.id} confirmText={`"${u.name}" silinsin?`} variant="ghost" size="sm">
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
        action={<UserSheet roles={roleOpts} triggerLabel="+ Yeni istifadəçi" />}
      />
      <SubNav items={NAV} />
      <div className="mb-4 text-sm text-ink-muted">{total} istifadəçi</div>
      <DataTable columns={columns} rows={users} empty="İstifadəçi yoxdur." />
      <Pagination total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
