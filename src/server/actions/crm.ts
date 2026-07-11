"use server";

import { revalidatePath } from "next/cache";
import { getDataSource } from "../db";
import { requireUser } from "../rbac";
import { hasPermission } from "@/lib/session";
import { writeAudit } from "../audit";
import {
  customerSchema,
  leadSchema,
  interactionSchema,
  type CustomerFormValues,
  type LeadFormValues,
  type InteractionFormValues,
} from "@/lib/schemas";
import type { Customer } from "../entities/Customer";
import type { Lead } from "../entities/Lead";

export type ActionResult =
  | { ok: true; id?: number }
  | { ok: false; error: string };

async function guard(perm: string) {
  const session = await requireUser();
  if (!hasPermission(session.permissions, perm)) {
    return { session: null, denied: { ok: false as const, error: "Bu əməliyyat üçün icazəniz yoxdur." } };
  }
  return { session, denied: null };
}

function revalidateCrm() {
  revalidatePath("/crm/customers");
  revalidatePath("/crm/leads");
  revalidatePath("/dashboard");
}

/* ---------------- Müştərilər ---------------- */

export async function createCustomer(input: CustomerFormValues): Promise<ActionResult> {
  const { session, denied } = await guard("crm:write");
  if (denied) return denied;
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const ds = await getDataSource();
  const repo = ds.getRepository<Customer>("customers");
  const saved = await repo.save(repo.create(parsed.data));
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Customer",
    entityId: saved.id,
    action: "CREATE",
    changes: parsed.data,
  });
  revalidateCrm();
  return { ok: true, id: saved.id };
}

export async function updateCustomer(id: number, input: CustomerFormValues): Promise<ActionResult> {
  const { session, denied } = await guard("crm:write");
  if (denied) return denied;
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const ds = await getDataSource();
  await ds.getRepository<Customer>("customers").update(id, parsed.data);
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Customer",
    entityId: id,
    action: "UPDATE",
    changes: parsed.data,
  });
  revalidateCrm();
  revalidatePath(`/crm/customers/${id}`);
  return { ok: true, id };
}

export async function deleteCustomer(id: number): Promise<ActionResult> {
  const { session, denied } = await guard("crm:write");
  if (denied) return denied;
  const ds = await getDataSource();
  await ds.getRepository<Customer>("customers").softDelete(id);
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Customer",
    entityId: id,
    action: "DELETE",
  });
  revalidateCrm();
  return { ok: true };
}

/* ---------------- Leadlər ---------------- */

export async function createLead(input: LeadFormValues): Promise<ActionResult> {
  const { session, denied } = await guard("crm:write");
  if (denied) return denied;
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const ds = await getDataSource();
  const repo = ds.getRepository<Lead>("leads");
  const saved = await repo.save(repo.create({ ...parsed.data, assignedToId: session.userId }));
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Lead",
    entityId: saved.id,
    action: "CREATE",
    changes: parsed.data,
  });
  revalidateCrm();
  return { ok: true, id: saved.id };
}

export async function updateLead(id: number, input: LeadFormValues): Promise<ActionResult> {
  const { session, denied } = await guard("crm:write");
  if (denied) return denied;
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const ds = await getDataSource();
  await ds.getRepository<Lead>("leads").update(id, parsed.data);
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Lead",
    entityId: id,
    action: "UPDATE",
    changes: parsed.data,
  });
  revalidateCrm();
  return { ok: true, id };
}

export async function deleteLead(id: number): Promise<ActionResult> {
  const { session, denied } = await guard("crm:write");
  if (denied) return denied;
  const ds = await getDataSource();
  await ds.getRepository<Lead>("leads").delete(id);
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Lead",
    entityId: id,
    action: "DELETE",
  });
  revalidateCrm();
  return { ok: true };
}

/** Lead-i müştəriyə çevirir: yeni müştəri yaradır, lead-i WON edir. */
export async function convertLead(id: number): Promise<ActionResult> {
  const { session, denied } = await guard("crm:write");
  if (denied) return denied;
  const ds = await getDataSource();
  const leadRepo = ds.getRepository<Lead>("leads");
  const lead = await leadRepo.findOne({ where: { id } });
  if (!lead) return { ok: false, error: "Lead tapılmadı." };
  if (lead.customerId) return { ok: false, error: "Bu lead artıq müştəriyə çevrilib." };

  const custRepo = ds.getRepository<Customer>("customers");
  const customer = await custRepo.save(
    custRepo.create({
      name: lead.name,
      type: "COMPANY",
      phone: lead.phone,
      email: lead.email,
      note: lead.note,
    }),
  );
  lead.customerId = customer.id;
  lead.status = "WON";
  await leadRepo.save(lead);

  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Lead",
    entityId: id,
    action: "CONVERT",
    changes: { customerId: customer.id },
  });
  revalidateCrm();
  return { ok: true, id: customer.id };
}

/* ---------------- Əlaqələr ---------------- */

export async function addInteraction(
  customerId: number,
  input: InteractionFormValues,
): Promise<ActionResult> {
  const { session, denied } = await guard("crm:write");
  if (denied) return denied;
  const parsed = interactionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const ds = await getDataSource();
  await ds.getRepository("interactions").save({
    customerId,
    userId: session.userId,
    type: parsed.data.type,
    summary: parsed.data.summary,
    nextActionAt: parsed.data.nextActionAt ? new Date(parsed.data.nextActionAt) : null,
  });
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Interaction",
    entityId: customerId,
    action: "CREATE",
    changes: parsed.data,
  });
  revalidatePath(`/crm/customers/${customerId}`);
  return { ok: true };
}
