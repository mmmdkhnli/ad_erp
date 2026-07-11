import { notFound } from "next/navigation";
import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import type { Quote } from "@/server/entities/Quote";
import type { Customer } from "@/server/entities/Customer";
import type { ServiceCatalog } from "@/server/entities/ServiceCatalog";
import { PageHeader } from "@/components/shared/page-header";
import { QuoteEditor } from "@/components/quotes/quote-editor";
import type { QuoteFormValues } from "@/lib/schemas";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("quotes:write");
  const { id } = await params;
  const quoteId = Number(id);
  if (!Number.isInteger(quoteId)) notFound();

  const ds = await getDataSource();
  const quote = await ds
    .getRepository<Quote>("quotes")
    .findOne({ where: { id: quoteId }, relations: { items: true } });
  if (!quote) notFound();

  const [customers, services] = await Promise.all([
    ds.getRepository<Customer>("customers").find({ order: { name: "ASC" } }),
    ds
      .getRepository<ServiceCatalog>("service_catalog")
      .find({ where: { isActive: true }, order: { name: "ASC" } }),
  ]);

  const initial: QuoteFormValues = {
    customerId: String(quote.customerId),
    validUntil: quote.validUntil ?? "",
    note: quote.note ?? "",
    vatRate: String(quote.vatRate),
    items: (quote.items ?? []).map((it) => ({
      serviceId: it.serviceId ? String(it.serviceId) : "",
      description: it.description,
      qty: String(it.qty),
      unit: it.unit,
      materialCost: String(it.materialCost),
      laborCost: String(it.laborCost),
      transportCost: String(it.transportCost),
      installCost: String(it.installCost),
      marginPct: String(it.marginPct),
    })),
  };

  return (
    <div>
      <PageHeader
        title={`Təklifi redaktə et — ${quote.number}`}
        description="Sətirləri və qiymətləri yeniləyin"
      />
      <QuoteEditor
        id={quote.id}
        initial={initial}
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
