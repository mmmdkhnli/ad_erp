"use server";

import { revalidatePath } from "next/cache";
import type { DataSource } from "typeorm";
import { getDataSource } from "../db";
import { requireUser } from "../rbac";
import { hasPermission } from "@/lib/session";
import { writeAudit } from "../audit";
import type { Quote } from "../entities/Quote";
import type { Order } from "../entities/Order";
import type { OrderItem } from "../entities/OrderItem";

export type OrderResult =
  | { ok: true; id?: number }
  | { ok: false; error: string };

const ORDER_STATUSES = [
  "NEW",
  "IN_PROGRESS",
  "INSTALLING",
  "DELIVERED",
  "CLOSED",
  "CANCELLED",
];

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

async function nextOrderNumber(ds: DataSource): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;
  const rows = await ds
    .getRepository<Order>("orders")
    .createQueryBuilder("o")
    .withDeleted()
    .select("o.number", "number")
    .where("o.number LIKE :p", { p: `${prefix}%` })
    .getRawMany<{ number: string }>();
  let max = 0;
  for (const r of rows) {
    const seq = parseInt(r.number.split("-")[2] ?? "0", 10);
    if (seq > max) max = seq;
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

/** Təsdiqlənmiş təklifi sifarişə çevirir (E2-6). */
export async function convertQuoteToOrder(quoteId: number): Promise<OrderResult> {
  const { session, denied } = await guard("quotes:write");
  if (denied) return denied;
  const ds = await getDataSource();

  const quote = await ds
    .getRepository<Quote>("quotes")
    .findOne({ where: { id: quoteId }, relations: { items: true } });
  if (!quote) return { ok: false, error: "Təklif tapılmadı." };

  const existing = await ds
    .getRepository<Order>("orders")
    .findOne({ where: { quoteId } });
  if (existing) {
    return { ok: false, error: "Bu təklif artıq sifarişə çevrilib." };
  }

  const orderRepo = ds.getRepository<Order>("orders");
  const number = await nextOrderNumber(ds);
  const order = await orderRepo.save(
    orderRepo.create({
      number,
      quoteId,
      customerId: quote.customerId,
      status: "NEW",
      total: quote.total,
      assignedToId: session.userId,
    }),
  );

  const itemRepo = ds.getRepository<OrderItem>("order_items");
  for (const it of quote.items ?? []) {
    await itemRepo.save(
      itemRepo.create({
        orderId: order.id,
        serviceId: it.serviceId,
        description: it.description,
        qty: it.qty,
        unit: it.unit,
        lineTotal: it.lineTotal,
      }),
    );
  }

  // Təklif təsdiqlənmiş sayılır
  if (quote.status !== "APPROVED") {
    await ds.getRepository<Quote>("quotes").update(quoteId, { status: "APPROVED" });
  }

  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Order",
    entityId: order.id,
    action: "CREATE",
    changes: { number, fromQuote: quote.number },
  });

  revalidatePath("/orders");
  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath("/dashboard");
  return { ok: true, id: order.id };
}

export async function setOrderStatus(
  id: number,
  status: string,
): Promise<OrderResult> {
  const { session, denied } = await guard("orders:write");
  if (denied) return denied;
  if (!ORDER_STATUSES.includes(status)) {
    return { ok: false, error: "Yanlış status." };
  }
  const ds = await getDataSource();
  await ds.getRepository<Order>("orders").update(id, { status });
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Order",
    entityId: id,
    action: "STATUS_CHANGE",
    changes: { status },
  });
  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  revalidatePath("/dashboard");
  return { ok: true, id };
}

export async function deleteOrder(id: number): Promise<OrderResult> {
  const { session, denied } = await guard("orders:write");
  if (denied) return denied;
  const ds = await getDataSource();
  await ds.getRepository<Order>("orders").softDelete(id);
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Order",
    entityId: id,
    action: "DELETE",
  });
  revalidatePath("/orders");
  return { ok: true };
}
