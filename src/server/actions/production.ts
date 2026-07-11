"use server";

import { revalidatePath } from "next/cache";
import { getDataSource } from "../db";
import { requireUser } from "../rbac";
import { hasPermission } from "@/lib/session";
import { writeAudit } from "../audit";
import { productionTaskSchema, type ProductionTaskFormValues } from "@/lib/schemas";
import type { ProductionTask } from "../entities/ProductionTask";

export type ProdResult = { ok: true; id?: number } | { ok: false; error: string };

const STAGES = ["PENDING", "DESIGN", "PRODUCTION", "QC", "DONE"];

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

export async function createProductionTask(
  input: ProductionTaskFormValues,
): Promise<ProdResult> {
  const { session, denied } = await guard("production:write");
  if (denied) return denied;
  const parsed = productionTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const ds = await getDataSource();
  const repo = ds.getRepository<ProductionTask>("ProductionTask");
  const saved = await repo.save(repo.create(parsed.data));
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "ProductionTask",
    entityId: saved.id,
    action: "CREATE",
    changes: { title: parsed.data.title, orderId: parsed.data.orderId },
  });
  revalidatePath("/production");
  revalidatePath("/dashboard");
  return { ok: true, id: saved.id };
}

export async function setTaskStage(id: number, stage: string): Promise<ProdResult> {
  const { session, denied } = await guard("production:write");
  if (denied) return denied;
  if (!STAGES.includes(stage)) return { ok: false, error: "Yanlış mərhələ." };
  const ds = await getDataSource();
  await ds.getRepository<ProductionTask>("ProductionTask").update(id, { stage });
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "ProductionTask",
    entityId: id,
    action: "STAGE_CHANGE",
    changes: { stage },
  });
  revalidatePath("/production");
  return { ok: true, id };
}

export async function deleteProductionTask(id: number): Promise<ProdResult> {
  const { session, denied } = await guard("production:write");
  if (denied) return denied;
  const ds = await getDataSource();
  await ds.getRepository<ProductionTask>("ProductionTask").delete(id);
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "ProductionTask",
    entityId: id,
    action: "DELETE",
  });
  revalidatePath("/production");
  return { ok: true };
}
