"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getDataSource } from "../db";
import { requireUser } from "../rbac";
import { hasPermission } from "@/lib/session";
import { writeAudit } from "../audit";
import {
  serviceSchema,
  userSchema,
  companySchema,
  type ServiceFormValues,
  type UserFormValues,
  type CompanyFormValues,
} from "@/lib/schemas";
import type { ServiceCatalog } from "../entities/ServiceCatalog";
import type { User } from "../entities/User";
import type { CompanySettings } from "../entities/CompanySettings";

export type SetResult = { ok: true; id?: number } | { ok: false; error: string };

async function guard(perm: string) {
  const session = await requireUser();
  if (!hasPermission(session.permissions, perm)) {
    return {
      session: null,
      denied: { ok: false as const, error: "Bu əməliyyat üçün icazəniz yoxdur." },
    };
  }
  return { session, denied: null };
}

/* ------------- Xidmət kataloqu ------------- */

export async function createService(input: ServiceFormValues): Promise<SetResult> {
  const { session, denied } = await guard("settings:write");
  if (denied) return denied;
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  const ds = await getDataSource();
  const repo = ds.getRepository<ServiceCatalog>("ServiceCatalog");
  const saved = await repo.save(
    repo.create({
      name: parsed.data.name,
      category: parsed.data.category,
      unit: parsed.data.unit,
      defaultPrice: parsed.data.defaultPrice != null ? String(parsed.data.defaultPrice) : null,
      defaultMargin: String(parsed.data.defaultMargin),
      isActive: parsed.data.isActive,
    }),
  );
  await writeAudit(ds, { userId: session.userId, entityType: "ServiceCatalog", entityId: saved.id, action: "CREATE", changes: parsed.data });
  revalidatePath("/settings/services");
  return { ok: true, id: saved.id };
}

export async function updateService(id: number, input: ServiceFormValues): Promise<SetResult> {
  const { session, denied } = await guard("settings:write");
  if (denied) return denied;
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  const ds = await getDataSource();
  await ds.getRepository<ServiceCatalog>("ServiceCatalog").update(id, {
    name: parsed.data.name,
    category: parsed.data.category,
    unit: parsed.data.unit,
    defaultPrice: parsed.data.defaultPrice != null ? String(parsed.data.defaultPrice) : null,
    defaultMargin: String(parsed.data.defaultMargin),
    isActive: parsed.data.isActive,
  });
  await writeAudit(ds, { userId: session.userId, entityType: "ServiceCatalog", entityId: id, action: "UPDATE", changes: parsed.data });
  revalidatePath("/settings/services");
  return { ok: true, id };
}

export async function deleteService(id: number): Promise<SetResult> {
  const { session, denied } = await guard("settings:write");
  if (denied) return denied;
  const ds = await getDataSource();
  await ds.getRepository<ServiceCatalog>("ServiceCatalog").delete(id);
  await writeAudit(ds, { userId: session.userId, entityType: "ServiceCatalog", entityId: id, action: "DELETE" });
  revalidatePath("/settings/services");
  return { ok: true };
}

/* ------------- İstifadəçilər ------------- */

export async function createUser(input: UserFormValues): Promise<SetResult> {
  const { session, denied } = await guard("settings:write");
  if (denied) return denied;
  const parsed = userSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  if (!parsed.data.password) return { ok: false, error: "Yeni istifadəçi üçün parol tələb olunur." };
  const ds = await getDataSource();
  const repo = ds.getRepository<User>("User");
  const email = parsed.data.email.toLowerCase();
  const exists = await repo.findOne({ where: { email } });
  if (exists) return { ok: false, error: "Bu email artıq mövcuddur." };
  const saved = await repo.save(
    repo.create({
      name: parsed.data.name,
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      roleId: parsed.data.roleId,
      isActive: parsed.data.isActive,
    }),
  );
  await writeAudit(ds, { userId: session.userId, entityType: "User", entityId: saved.id, action: "CREATE", changes: { email, roleId: parsed.data.roleId } });
  revalidatePath("/settings/users");
  return { ok: true, id: saved.id };
}

export async function updateUser(id: number, input: UserFormValues): Promise<SetResult> {
  const { session, denied } = await guard("settings:write");
  if (denied) return denied;
  const parsed = userSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  const ds = await getDataSource();
  const repo = ds.getRepository<User>("User");
  const patch: Record<string, unknown> = {
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    roleId: parsed.data.roleId,
    isActive: parsed.data.isActive,
  };
  if (parsed.data.password) patch.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await repo.update(id, patch);
  await writeAudit(ds, { userId: session.userId, entityType: "User", entityId: id, action: "UPDATE", changes: { email: patch.email, roleId: parsed.data.roleId } });
  revalidatePath("/settings/users");
  return { ok: true, id };
}

export async function deleteUser(id: number): Promise<SetResult> {
  const { session, denied } = await guard("settings:write");
  if (denied) return denied;
  if (id === session.userId) return { ok: false, error: "Öz hesabınızı silə bilməzsiniz." };
  const ds = await getDataSource();
  await ds.getRepository<User>("User").delete(id);
  await writeAudit(ds, { userId: session.userId, entityType: "User", entityId: id, action: "DELETE" });
  revalidatePath("/settings/users");
  return { ok: true };
}

/* ------------- Şirkət ------------- */

export async function updateCompany(input: CompanyFormValues): Promise<SetResult> {
  const { session, denied } = await guard("settings:write");
  if (denied) return denied;
  const parsed = companySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  const ds = await getDataSource();
  const repo = ds.getRepository<CompanySettings>("CompanySettings");
  const existing = await repo.findOne({ where: {} });
  const data = {
    name: parsed.data.name,
    taxId: parsed.data.taxId,
    invoiceInfo: parsed.data.invoiceInfo,
    vatRate: String(parsed.data.vatRate),
  };
  if (existing) await repo.update(existing.id, data);
  else await repo.save(repo.create({ ...data, currency: "AZN" }));
  await writeAudit(ds, { userId: session.userId, entityType: "CompanySettings", entityId: existing?.id ?? 1, action: "UPDATE", changes: data });
  revalidatePath("/settings/company");
  return { ok: true };
}
