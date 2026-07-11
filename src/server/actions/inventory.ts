"use server";

import { revalidatePath } from "next/cache";
import { getDataSource } from "../db";
import { requireUser } from "../rbac";
import { hasPermission } from "@/lib/session";
import { writeAudit } from "../audit";
import {
  materialSchema,
  stockMovementSchema,
  type MaterialFormValues,
  type StockMovementFormValues,
} from "@/lib/schemas";
import type { Material } from "../entities/Material";
import type { StockMovement } from "../entities/StockMovement";

export type InvResult = { ok: true; id?: number } | { ok: false; error: string };

function round3(n: number): number {
  return Math.round((n + Number.EPSILON) * 1000) / 1000;
}
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

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

export async function createMaterial(input: MaterialFormValues): Promise<InvResult> {
  const { session, denied } = await guard("inventory:write");
  if (denied) return denied;
  const parsed = materialSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const ds = await getDataSource();
  const repo = ds.getRepository<Material>("Material");
  const saved = await repo.save(
    repo.create({
      name: parsed.data.name,
      unit: parsed.data.unit,
      minQty: String(parsed.data.minQty),
      avgCost: String(parsed.data.avgCost),
      stockQty: "0",
      isActive: true,
    }),
  );
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Material",
    entityId: saved.id,
    action: "CREATE",
    changes: parsed.data,
  });
  revalidatePath("/inventory");
  return { ok: true, id: saved.id };
}

export async function updateMaterial(
  id: number,
  input: MaterialFormValues,
): Promise<InvResult> {
  const { session, denied } = await guard("inventory:write");
  if (denied) return denied;
  const parsed = materialSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const ds = await getDataSource();
  await ds.getRepository<Material>("Material").update(id, {
    name: parsed.data.name,
    unit: parsed.data.unit,
    minQty: String(parsed.data.minQty),
    avgCost: String(parsed.data.avgCost),
  });
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Material",
    entityId: id,
    action: "UPDATE",
    changes: parsed.data,
  });
  revalidatePath("/inventory");
  return { ok: true, id };
}

export async function deleteMaterial(id: number): Promise<InvResult> {
  const { session, denied } = await guard("inventory:write");
  if (denied) return denied;
  const ds = await getDataSource();
  await ds.getRepository<StockMovement>("StockMovement").delete({ materialId: id });
  await ds.getRepository<Material>("Material").delete(id);
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Material",
    entityId: id,
    action: "DELETE",
  });
  revalidatePath("/inventory");
  return { ok: true };
}

/** Anbar hərəkəti — material qalığını (və IN üçün orta mayanı) yeniləyir. */
export async function createStockMovement(
  input: StockMovementFormValues,
): Promise<InvResult> {
  const { session, denied } = await guard("inventory:write");
  if (denied) return denied;
  const parsed = stockMovementSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const { materialId, type, qty, unitCost, reason, orderId } = parsed.data;
  const ds = await getDataSource();
  const matRepo = ds.getRepository<Material>("Material");
  const material = await matRepo.findOne({ where: { id: materialId } });
  if (!material) return { ok: false, error: "Material tapılmadı." };

  const oldQty = Number(material.stockQty);
  const oldAvg = Number(material.avgCost);
  let newQty = oldQty;
  let newAvg = oldAvg;

  if (type === "IN") {
    newQty = round3(oldQty + qty);
    if (unitCost != null && newQty > 0) {
      newAvg = round2((oldQty * oldAvg + qty * unitCost) / newQty);
    }
  } else if (type === "OUT") {
    newQty = round3(oldQty - qty);
  } else {
    // ADJUST — mütləq qalıq
    newQty = round3(qty);
  }

  await ds.getRepository<StockMovement>("StockMovement").save({
    materialId,
    type,
    qty: String(qty),
    unitCost: unitCost != null ? String(unitCost) : null,
    reason: reason,
    orderId: orderId,
    createdById: session.userId,
  });
  await matRepo.update(materialId, {
    stockQty: String(newQty),
    avgCost: String(newAvg),
  });
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "StockMovement",
    entityId: materialId,
    action: type,
    changes: { qty, from: oldQty, to: newQty },
  });
  revalidatePath("/inventory");
  if (orderId) revalidatePath(`/orders/${orderId}`);
  return { ok: true };
}
