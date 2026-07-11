"use server";

import { revalidatePath } from "next/cache";
import type { DataSource } from "typeorm";
import { getDataSource } from "../db";
import { requireUser } from "../rbac";
import { hasPermission } from "@/lib/session";
import { writeAudit } from "../audit";
import { round2 } from "@/lib/calc";
import {
  invoiceSchema,
  paymentSchema,
  expenseSchema,
  type InvoiceFormValues,
  type PaymentFormValues,
  type ExpenseFormValues,
} from "@/lib/schemas";
import type { Invoice } from "../entities/Invoice";
import type { Payment } from "../entities/Payment";
import type { Expense } from "../entities/Expense";

export type FinResult = { ok: true; id?: number } | { ok: false; error: string };

function today(): string {
  return new Date().toISOString().slice(0, 10);
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

async function nextInvoiceNumber(ds: DataSource): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const rows = await ds
    .getRepository<Invoice>("invoices")
    .createQueryBuilder("i")
    .select("i.number", "number")
    .where("i.number LIKE :p", { p: `${prefix}%` })
    .getRawMany<{ number: string }>();
  let max = 0;
  for (const r of rows) {
    const seq = parseInt(r.number.split("-")[2] ?? "0", 10);
    if (seq > max) max = seq;
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

/** Faktura statusunu ödənişlərə görə yeniləyir. */
async function recomputeInvoiceStatus(ds: DataSource, invoiceId: number) {
  const invoiceRepo = ds.getRepository<Invoice>("invoices");
  const invoice = await invoiceRepo.findOne({ where: { id: invoiceId } });
  if (!invoice) return;
  const { sum } = (await ds
    .getRepository<Payment>("payments")
    .createQueryBuilder("p")
    .select("COALESCE(SUM(p.amount),0)", "sum")
    .where("p.invoiceId = :id", { id: invoiceId })
    .getRawOne<{ sum: string }>()) ?? { sum: "0" };
  const paid = round2(Number(sum));
  const total = round2(Number(invoice.total));
  const status = paid >= total && total > 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";
  await invoiceRepo.update(invoiceId, { status });
}

export async function createInvoice(input: InvoiceFormValues): Promise<FinResult> {
  const { session, denied } = await guard("finance:write");
  if (denied) return denied;
  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const { orderId, total, dueAt } = parsed.data;
  const vatAmount = round2((total * 18) / 118); // ƏDV brutto məbləğdən ayrılır
  const amount = round2(total - vatAmount);
  const ds = await getDataSource();
  const repo = ds.getRepository<Invoice>("invoices");
  const number = await nextInvoiceNumber(ds);
  const saved = await repo.save(
    repo.create({
      number,
      orderId,
      amount: String(amount),
      vatAmount: String(vatAmount),
      total: String(total),
      status: "UNPAID",
      issuedAt: today(),
      dueAt: dueAt,
    }),
  );
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Invoice",
    entityId: saved.id,
    action: "CREATE",
    changes: { number, total },
  });
  revalidatePath("/finance");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/dashboard");
  return { ok: true, id: saved.id };
}

export async function addPayment(input: PaymentFormValues): Promise<FinResult> {
  const { session, denied } = await guard("finance:write");
  if (denied) return denied;
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const ds = await getDataSource();
  await ds.getRepository<Payment>("payments").save({
    invoiceId: parsed.data.invoiceId,
    amount: String(parsed.data.amount),
    method: parsed.data.method,
    paidAt: parsed.data.paidAt ?? today(),
    note: parsed.data.note,
  });
  await recomputeInvoiceStatus(ds, parsed.data.invoiceId);
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Payment",
    entityId: parsed.data.invoiceId,
    action: "CREATE",
    changes: { amount: parsed.data.amount, method: parsed.data.method },
  });
  revalidatePath("/finance");
  revalidatePath(`/finance/invoices/${parsed.data.invoiceId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteInvoice(id: number): Promise<FinResult> {
  const { session, denied } = await guard("finance:write");
  if (denied) return denied;
  const ds = await getDataSource();
  await ds.getRepository<Payment>("payments").delete({ invoiceId: id });
  await ds.getRepository<Invoice>("invoices").delete(id);
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Invoice",
    entityId: id,
    action: "DELETE",
  });
  revalidatePath("/finance");
  return { ok: true };
}

export async function createExpense(input: ExpenseFormValues): Promise<FinResult> {
  const { session, denied } = await guard("finance:write");
  if (denied) return denied;
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Yanlış məlumat." };
  }
  const ds = await getDataSource();
  const saved = await ds.getRepository<Expense>("expenses").save({
    orderId: parsed.data.orderId,
    category: parsed.data.category,
    amount: String(parsed.data.amount),
    description: parsed.data.description,
    spentAt: parsed.data.spentAt ?? today(),
    createdById: session.userId,
  });
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Expense",
    entityId: saved.id,
    action: "CREATE",
    changes: { amount: parsed.data.amount, category: parsed.data.category },
  });
  revalidatePath("/finance/expenses");
  revalidatePath("/dashboard");
  if (parsed.data.orderId) revalidatePath(`/orders/${parsed.data.orderId}`);
  return { ok: true, id: saved.id };
}

export async function deleteExpense(id: number): Promise<FinResult> {
  const { session, denied } = await guard("finance:write");
  if (denied) return denied;
  const ds = await getDataSource();
  await ds.getRepository<Expense>("expenses").delete(id);
  await writeAudit(ds, {
    userId: session.userId,
    entityType: "Expense",
    entityId: id,
    action: "DELETE",
  });
  revalidatePath("/finance/expenses");
  return { ok: true };
}
