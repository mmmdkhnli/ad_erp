"use server";

import { revalidatePath } from "next/cache";
import { getDataSource } from "../db";
import { requireUser } from "../rbac";
import { hasPermission } from "@/lib/session";
import { writeAudit } from "../audit";
import { installationSchema, type InstallationFormValues } from "@/lib/schemas";
import type { Installation } from "../entities/Installation";

export type InstResult = { ok: true; id?: number } | { ok: false; error: string };

const STATUSES = ["PLANNED", "EN_ROUTE", "IN_PROGRESS", "DONE"];

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

export async function createInstallation(
  input: InstallationFormValues,
): Promise<InstResult> {
  const { session, denied } = await guard("installations:write");
  if (denied) return denied;
  const parsed = installationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const ds = await getDataSource();
  const saved = await ds.getRepository<Installation>("installations").save({
    orderId: parsed.data.orderId,
    type: parsed.data.type,
    address: parsed.data.address,
    mapUrl: parsed.data.mapUrl,
    scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
    status: "PLANNED",
    teamNote: parsed.data.teamNote,
  });
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Installation",
    entityId: saved.id,
    action: "CREATE",
    changes: { orderId: parsed.data.orderId, address: parsed.data.address },
  });
  revalidatePath("/installations");
  if (parsed.data.orderId) revalidatePath(`/orders/${parsed.data.orderId}`);
  return { ok: true, id: saved.id };
}

export async function setInstallationStatus(
  id: number,
  status: string,
): Promise<InstResult> {
  const { session, denied } = await guard("installations:write");
  if (denied) return denied;
  if (!STATUSES.includes(status)) return { ok: false, error: "Yanlış status." };
  const ds = await getDataSource();
  await ds.getRepository<Installation>("installations").update(id, { status });
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Installation",
    entityId: id,
    action: "STATUS_CHANGE",
    changes: { status },
  });
  revalidatePath("/installations");
  return { ok: true, id };
}

export async function deleteInstallation(id: number): Promise<InstResult> {
  const { session, denied } = await guard("installations:write");
  if (denied) return denied;
  const ds = await getDataSource();
  await ds.getRepository<Installation>("installations").delete(id);
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Installation",
    entityId: id,
    action: "DELETE",
  });
  revalidatePath("/installations");
  return { ok: true };
}
