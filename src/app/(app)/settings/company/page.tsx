import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import type { CompanySettings } from "@/server/entities/CompanySettings";
import { PageHeader } from "@/components/shared/page-header";
import { SubNav } from "@/components/shared/sub-nav";
import { CompanyForm } from "@/components/settings/company-form";

const NAV = [
  { href: "/settings/services", label: "Xidmət kataloqu" },
  { href: "/settings/users", label: "İstifadəçilər" },
  { href: "/settings/audit", label: "Audit" },
  { href: "/settings/company", label: "Şirkət" },
];

export default async function SettingsCompanyPage() {
  await requirePermission("settings:read");
  const ds = await getDataSource();
  const company = await ds.getRepository<CompanySettings>("company_settings").findOne({ where: {} });

  return (
    <div>
      <PageHeader title="Parametrlər" description="Şirkət məlumatı və faktura rekvizitləri" />
      <SubNav items={NAV} />
      <div className="rounded-lg border border-hairline bg-surface p-6">
        <CompanyForm
          initial={{
            name: company?.name ?? "AdErp",
            taxId: company?.taxId ?? "",
            invoiceInfo: company?.invoiceInfo ?? "",
            vatRate: String(company?.vatRate ?? 18),
          }}
        />
      </div>
    </div>
  );
}
