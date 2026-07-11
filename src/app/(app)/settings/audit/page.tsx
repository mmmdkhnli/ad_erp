import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import type { AuditLog } from "@/server/entities/AuditLog";
import type { User } from "@/server/entities/User";
import { PageHeader } from "@/components/shared/page-header";
import { SubNav } from "@/components/shared/sub-nav";
import { Pagination } from "@/components/shared/pagination";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/format";

const NAV = [
  { href: "/settings/services", label: "Xidmət kataloqu" },
  { href: "/settings/users", label: "İstifadəçilər" },
  { href: "/settings/audit", label: "Audit" },
  { href: "/settings/company", label: "Şirkət" },
];

const ACTION_LABEL: Record<string, string> = {
  CREATE: "Yaratma",
  UPDATE: "Redaktə",
  DELETE: "Silmə",
  STATUS_CHANGE: "Status dəyişikliyi",
  STAGE_CHANGE: "Mərhələ dəyişikliyi",
  CONVERT: "Çevirmə",
  LOGIN: "Giriş",
  IN: "Mədaxil",
  OUT: "Məxaric",
  ADJUST: "Düzəliş",
};

function timeOf(d: Date): string {
  const x = new Date(d);
  const hh = String(x.getHours()).padStart(2, "0");
  const mm = String(x.getMinutes()).padStart(2, "0");
  return `${formatDate(x)} ${hh}:${mm}`;
}

export default async function SettingsAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePermission("settings:read");
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const ds = await getDataSource();
  const [[logs, total], users] = await Promise.all([
    ds.getRepository<AuditLog>("audit_logs").findAndCount({
      order: { createdAt: "DESC" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    ds.getRepository<User>("users").find(),
  ]);
  const userMap = new Map(users.map((u) => [u.id, u.name]));

  return (
    <div>
      <PageHeader title="Parametrlər" description="Sistem əməliyyatlarının audit jurnalı" />
      <SubNav items={NAV} />

      {logs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-hairline bg-surface p-8 text-center text-sm text-ink-muted">
          Audit qeydi yoxdur.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-[11px] uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-2.5 text-left">Vaxt</th>
                  <th className="px-4 py-2.5 text-left">İstifadəçi</th>
                  <th className="px-4 py-2.5 text-left">Əməliyyat</th>
                  <th className="px-4 py-2.5 text-left">Obyekt</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-hairline last:border-0">
                    <td className="tabular px-4 py-2.5 text-ink-muted">{timeOf(l.createdAt)}</td>
                    <td className="px-4 py-2.5 text-ink">{l.userId ? userMap.get(l.userId) ?? `#${l.userId}` : "—"}</td>
                    <td className="px-4 py-2.5 text-ink">{ACTION_LABEL[l.action] ?? l.action}</td>
                    <td className="px-4 py-2.5 text-ink-muted">
                      {l.entityType}
                      {l.entityId ? ` #${l.entityId}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination total={total} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
