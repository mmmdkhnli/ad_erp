import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import type { Customer } from "@/server/entities/Customer";
import type { ServiceCatalog } from "@/server/entities/ServiceCatalog";
import { PageHeader } from "@/components/shared/page-header";
import { QuoteEditor } from "@/components/quotes/quote-editor";

export default async function NewQuotePage() {
  await requirePermission("quotes:write");
  const ds = await getDataSource();
  const customers = await ds
    .getRepository<Customer>("Customer")
    .find({ order: { name: "ASC" } });
  const services = await ds
    .getRepository<ServiceCatalog>("ServiceCatalog")
    .find({ where: { isActive: true }, order: { name: "ASC" } });

  return (
    <div>
      <PageHeader
        title="Yeni təklif"
        description="Kalkulyator ilə sətir-sətir təklif hazırlayın"
      />
      <QuoteEditor
        customers={customers.map((c) => ({ id: c.id, name: c.name }))}
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          unit: s.unit,
          defaultPrice: s.defaultPrice,
          defaultMargin: s.defaultMargin,
        }))}
      />
    </div>
  );
}
