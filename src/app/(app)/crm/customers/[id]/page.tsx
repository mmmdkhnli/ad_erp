import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import { hasPermission } from "@/lib/session";
import type { Customer } from "@/server/entities/Customer";
import type { Interaction } from "@/server/entities/Interaction";
import { PageHeader } from "@/components/shared/page-header";
import { CustomerSheet } from "@/components/crm/customer-sheet";
import { InteractionSheet } from "@/components/crm/interaction-sheet";
import { CUSTOMER_TYPE, INTERACTION_TYPE } from "@/lib/constants";
import { formatDate } from "@/lib/format";

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-ink">{value}</div>
    </div>
  );
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("crm:read");
  const canWrite = hasPermission(session.permissions, "crm:write");
  const { id } = await params;
  const customerId = Number(id);
  if (!Number.isInteger(customerId)) notFound();

  const ds = await getDataSource();
  const customer = await ds
    .getRepository<Customer>("Customer")
    .findOne({ where: { id: customerId } });
  if (!customer) notFound();

  const interactions = await ds
    .getRepository<Interaction>("Interaction")
    .find({ where: { customerId }, order: { createdAt: "DESC" }, take: 50 });

  return (
    <div>
      <Link
        href="/crm/customers"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Müştərilər
      </Link>

      <PageHeader
        title={customer.name}
        description={CUSTOMER_TYPE[customer.type] ?? customer.type}
        action={
          canWrite ? (
            <CustomerSheet
              id={customer.id}
              triggerLabel="Redaktə"
              triggerVariant="secondary"
              initial={{
                name: customer.name,
                type: customer.type as "INDIVIDUAL" | "COMPANY",
                taxId: customer.taxId ?? "",
                contactPerson: customer.contactPerson ?? "",
                phone: customer.phone ?? "",
                email: customer.email ?? "",
                address: customer.address ?? "",
                note: customer.note ?? "",
              }}
            />
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Məlumat */}
        <div className="rounded-lg border border-hairline bg-surface p-5 lg:col-span-1">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-ink">
            Məlumat
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Info label="VÖEN" value={customer.taxId ?? "—"} />
            <Info label="Telefon" value={customer.phone ?? "—"} />
            <Info label="Əlaqə şəxsi" value={customer.contactPerson ?? "—"} />
            <Info label="Email" value={customer.email ?? "—"} />
            <div className="col-span-2">
              <Info label="Ünvan" value={customer.address ?? "—"} />
            </div>
            {customer.note && (
              <div className="col-span-2">
                <Info label="Qeyd" value={customer.note} />
              </div>
            )}
          </div>
        </div>

        {/* Əlaqələr */}
        <div className="rounded-lg border border-hairline bg-surface p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-ink">
              Əlaqə tarixçəsi
            </h2>
            {canWrite && (
              <InteractionSheet customerId={customer.id} triggerLabel="+ Əlaqə əlavə et" />
            )}
          </div>

          {interactions.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">
              Hələ əlaqə qeydi yoxdur.
            </p>
          ) : (
            <ul className="space-y-3">
              {interactions.map((it) => (
                <li
                  key={it.id}
                  className="border-l-2 border-brand-soft pl-4"
                >
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <span className="font-medium text-ink">
                      {INTERACTION_TYPE[it.type] ?? it.type}
                    </span>
                    <span>·</span>
                    <span className="tabular">{formatDate(it.createdAt)}</span>
                    {it.nextActionAt && (
                      <>
                        <span>·</span>
                        <span className="text-warning">
                          Növbəti: {formatDate(it.nextActionAt)}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink">{it.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
