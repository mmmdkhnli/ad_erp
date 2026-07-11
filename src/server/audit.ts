import type { DataSource } from "typeorm";

/** Kritik mutasiyaları AuditLog-a yazır. Uğursuzluq əsas əməliyyatı bloklamır. */
export async function writeAudit(
  ds: DataSource,
  entry: {
    userId?: number | null;
    entityType: string;
    entityId?: string | number | null;
    action: string;
    changes?: unknown;
  },
): Promise<void> {
  try {
    await ds.getRepository("AuditLog").save({
      userId: entry.userId ?? null,
      entityType: entry.entityType,
      entityId: entry.entityId != null ? String(entry.entityId) : null,
      action: entry.action,
      changes: entry.changes ?? null,
    });
  } catch {
    // audit səssiz keçir
  }
}
