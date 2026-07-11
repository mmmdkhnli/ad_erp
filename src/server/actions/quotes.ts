"use server";

import { revalidatePath } from "next/cache";
import type { DataSource } from "typeorm";
import { getDataSource } from "../db";
import { requireUser } from "../rbac";
import { hasPermission } from "@/lib/session";
import { writeAudit } from "../audit";
import { z } from "zod";
import { quoteSchema, quoteItemSchema, type QuoteFormValues } from "@/lib/schemas";
import { quoteTotals, lineTotal } from "@/lib/calc";
import type { Quote } from "../entities/Quote";
import type { QuoteItem } from "../entities/QuoteItem";

type ParsedItem = z.infer<typeof quoteItemSchema>;

export type QuoteResult =
  | { ok: true; id?: number }
  | { ok: false; error: string };

const QUOTE_STATUSES = ["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"];

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

/** QUO-YYYY-NNNN növbəti nömrə (silinmişlər də nəzərə alınır). */
async function nextQuoteNumber(ds: DataSource): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `QUO-${year}-`;
  const rows = await ds
    .getRepository<Quote>("Quote")
    .createQueryBuilder("q")
    .withDeleted()
    .select("q.number", "number")
    .where("q.number LIKE :p", { p: `${prefix}%` })
    .getRawMany<{ number: string }>();
  let max = 0;
  for (const r of rows) {
    const seq = parseInt(r.number.split("-")[2] ?? "0", 10);
    if (seq > max) max = seq;
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

async function saveItems(ds: DataSource, quoteId: number, items: ParsedItem[]) {
  const repo = ds.getRepository<QuoteItem>("QuoteItem");
  for (const it of items) {
    await repo.save(
      repo.create({
        quoteId,
        serviceId: it.serviceId,
        description: it.description,
        qty: String(it.qty),
        unit: it.unit,
        materialCost: String(it.materialCost),
        laborCost: String(it.laborCost),
        transportCost: String(it.transportCost),
        installCost: String(it.installCost),
        marginPct: String(it.marginPct),
        lineTotal: String(lineTotal(it)),
      }),
    );
  }
}

export async function createQuote(input: QuoteFormValues): Promise<QuoteResult> {
  const { session, denied } = await guard("quotes:write");
  if (denied) return denied;
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const data = parsed.data;
  const totals = quoteTotals(data.items, data.vatRate);
  const ds = await getDataSource();
  const quoteRepo = ds.getRepository<Quote>("Quote");
  const number = await nextQuoteNumber(ds);
  const quote = await quoteRepo.save(
    quoteRepo.create({
      number,
      customerId: data.customerId,
      status: "DRAFT",
      version: 1,
      validUntil: data.validUntil,
      vatRate: String(data.vatRate),
      subtotal: String(totals.subtotal),
      marginAmount: String(totals.marginAmount),
      vatAmount: String(totals.vatAmount),
      total: String(totals.total),
      assignedToId: session.userId,
      note: data.note,
    }),
  );
  await saveItems(ds, quote.id, data.items);
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Quote",
    entityId: quote.id,
    action: "CREATE",
    changes: { number, total: totals.total },
  });
  revalidatePath("/quotes");
  revalidatePath("/dashboard");
  return { ok: true, id: quote.id };
}

export async function updateQuote(
  id: number,
  input: QuoteFormValues,
): Promise<QuoteResult> {
  const { session, denied } = await guard("quotes:write");
  if (denied) return denied;
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const data = parsed.data;
  const totals = quoteTotals(data.items, data.vatRate);
  const ds = await getDataSource();
  await ds.getRepository<Quote>("Quote").update(id, {
    customerId: data.customerId,
    validUntil: data.validUntil,
    vatRate: String(data.vatRate),
    subtotal: String(totals.subtotal),
    marginAmount: String(totals.marginAmount),
    vatAmount: String(totals.vatAmount),
    total: String(totals.total),
    note: data.note,
  });
  await ds.getRepository<QuoteItem>("QuoteItem").delete({ quoteId: id });
  await saveItems(ds, id, data.items);
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Quote",
    entityId: id,
    action: "UPDATE",
    changes: { total: totals.total },
  });
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
  return { ok: true, id };
}

export async function deleteQuote(id: number): Promise<QuoteResult> {
  const { session, denied } = await guard("quotes:write");
  if (denied) return denied;
  const ds = await getDataSource();
  await ds.getRepository<Quote>("Quote").softDelete(id);
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Quote",
    entityId: id,
    action: "DELETE",
  });
  revalidatePath("/quotes");
  return { ok: true };
}

export async function setQuoteStatus(
  id: number,
  status: string,
): Promise<QuoteResult> {
  const { session, denied } = await guard("quotes:write");
  if (denied) return denied;
  if (!QUOTE_STATUSES.includes(status)) {
    return { ok: false, error: "Yanlış status." };
  }
  const ds = await getDataSource();
  await ds.getRepository<Quote>("Quote").update(id, { status });
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Quote",
    entityId: id,
    action: "STATUS_CHANGE",
    changes: { status },
  });
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
  return { ok: true, id };
}
