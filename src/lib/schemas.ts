import { z } from "zod";

/** Boş sətri null-a çevirən, trim edən opsional mətn. */
const optStr = z
  .string()
  .trim()
  .max(255)
  .optional()
  .transform((v) => (v && v.length ? v : null));

const optText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((v) => (v && v.length ? v : null));

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Ad ən azı 2 simvol olmalıdır").max(190),
  type: z.enum(["INDIVIDUAL", "COMPANY"]).default("COMPANY"),
  taxId: optStr,
  contactPerson: optStr,
  phone: optStr,
  email: optStr,
  address: optStr,
  note: optText,
});
export type CustomerInput = z.input<typeof customerSchema>;

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Ad ən azı 2 simvol olmalıdır").max(190),
  phone: optStr,
  email: optStr,
  source: z.enum(["REFERRAL", "WEBSITE", "CALL", "EXHIBITION", "OTHER"]).default("OTHER"),
  status: z.enum(["NEW", "CONTACTED", "QUOTED", "WON", "LOST"]).default("NEW"),
  note: optText,
});
export type LeadInput = z.input<typeof leadSchema>;

export const interactionSchema = z.object({
  type: z.enum(["CALL", "MEETING", "EMAIL"]).default("CALL"),
  summary: z.string().trim().min(2, "Qısa məlumat tələb olunur").max(2000),
  nextActionAt: optStr,
});
export type InteractionInput = z.input<typeof interactionSchema>;

/**
 * Client formların göndərdiyi düz (string-əsaslı) tiplər.
 * Server action-lar bunları qəbul edir, safeParse runtime-da narrow/validate edir.
 */
export type CustomerFormValues = {
  name: string;
  type: string;
  taxId: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  note: string;
};

export type LeadFormValues = {
  name: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  note: string;
};

export type InteractionFormValues = {
  type: string;
  summary: string;
  nextActionAt: string;
};

/* ---------------- Təkliflər ---------------- */

export const quoteItemSchema = z.object({
  serviceId: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().positive().nullable(),
  ),
  description: z.string().trim().min(1, "Sətir təsviri tələb olunur").max(255),
  qty: z.coerce.number().min(0).default(1),
  unit: z.string().default("PIECE"),
  materialCost: z.coerce.number().min(0).default(0),
  laborCost: z.coerce.number().min(0).default(0),
  transportCost: z.coerce.number().min(0).default(0),
  installCost: z.coerce.number().min(0).default(0),
  marginPct: z.coerce.number().min(0).default(0),
});

export const quoteSchema = z.object({
  customerId: z.coerce.number().int().min(1, "Müştəri seçin"),
  validUntil: optStr,
  note: optText,
  vatRate: z.coerce.number().min(0).default(18),
  items: z.array(quoteItemSchema).min(1, "Ən azı bir sətir əlavə edin"),
});

export type QuoteItemFormValues = {
  serviceId: string;
  description: string;
  qty: string;
  unit: string;
  materialCost: string;
  laborCost: string;
  transportCost: string;
  installCost: string;
  marginPct: string;
};

export type QuoteFormValues = {
  customerId: string;
  validUntil: string;
  note: string;
  vatRate: string;
  items: QuoteItemFormValues[];
};

/* ---------------- İstehsalat ---------------- */

export const productionTaskSchema = z.object({
  orderId: z.coerce.number().int().min(1, "Sifariş seçin"),
  title: z.string().trim().min(1, "Başlıq tələb olunur").max(190),
  stage: z.enum(["PENDING", "DESIGN", "PRODUCTION", "QC", "DONE"]).default("PENDING"),
  assigneeId: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().positive().nullable(),
  ),
  machine: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.string().nullable(),
  ),
  deadline: optStr,
  note: optText,
});

export type ProductionTaskFormValues = {
  orderId: string;
  title: string;
  stage: string;
  assigneeId: string;
  machine: string;
  deadline: string;
  note: string;
};

/* ---------------- Maliyyə ---------------- */

export const invoiceSchema = z.object({
  orderId: z.coerce.number().int().min(1, "Sifariş seçin"),
  total: z.coerce.number().min(0.01, "Məbləğ 0-dan böyük olmalıdır"),
  dueAt: optStr,
});

export const paymentSchema = z.object({
  invoiceId: z.coerce.number().int().min(1),
  amount: z.coerce.number().min(0.01, "Məbləğ 0-dan böyük olmalıdır"),
  method: z.enum(["CASH", "TRANSFER"]).default("TRANSFER"),
  paidAt: optStr,
  note: optText,
});

export const expenseSchema = z.object({
  orderId: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().positive().nullable(),
  ),
  category: z.enum(["MATERIAL", "LABOR", "TRANSPORT", "RENT", "OTHER"]).default("OTHER"),
  amount: z.coerce.number().min(0.01, "Məbləğ 0-dan böyük olmalıdır"),
  description: z.string().trim().min(1, "Təsvir tələb olunur").max(255),
  spentAt: optStr,
});

export type InvoiceFormValues = { orderId: string; total: string; dueAt: string };
export type PaymentFormValues = {
  invoiceId: string;
  amount: string;
  method: string;
  paidAt: string;
  note: string;
};
export type ExpenseFormValues = {
  orderId: string;
  category: string;
  amount: string;
  description: string;
  spentAt: string;
};

/* ---------------- Anbar ---------------- */

export const materialSchema = z.object({
  name: z.string().trim().min(2, "Ad ən azı 2 simvol olmalıdır").max(190),
  unit: z.enum(["M2", "METER", "PIECE", "KG", "ROLL"]).default("PIECE"),
  minQty: z.coerce.number().min(0).default(0),
  avgCost: z.coerce.number().min(0).default(0),
});

export const stockMovementSchema = z.object({
  materialId: z.coerce.number().int().min(1, "Material seçin"),
  type: z.enum(["IN", "OUT", "ADJUST"]).default("IN"),
  qty: z.coerce.number().min(0.001, "Miqdar 0-dan böyük olmalıdır"),
  unitCost: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().min(0).nullable(),
  ),
  reason: optStr,
  orderId: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().positive().nullable(),
  ),
});

export type MaterialFormValues = {
  name: string;
  unit: string;
  minQty: string;
  avgCost: string;
};
export type StockMovementFormValues = {
  materialId: string;
  type: string;
  qty: string;
  unitCost: string;
  reason: string;
  orderId: string;
};

/* ---------------- Quraşdırma ---------------- */

export const installationSchema = z.object({
  orderId: z.coerce.number().int().min(1, "Sifariş seçin"),
  type: z.enum(["MOUNT", "DISMOUNT", "SERVICE"]).default("MOUNT"),
  address: z.string().trim().min(3, "Ünvan tələb olunur").max(255),
  mapUrl: optStr,
  scheduledAt: optStr,
  teamNote: optText,
});

export type InstallationFormValues = {
  orderId: string;
  type: string;
  address: string;
  mapUrl: string;
  scheduledAt: string;
  teamNote: string;
};

/* ---------------- Parametrlər ---------------- */

const boolFrom = (v: unknown) => v === true || v === "true" || v === "1" || v === "on";

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Ad ən azı 2 simvol olmalıdır").max(190),
  category: z.enum([
    "OUTDOOR", "PRINTING", "VEHICLE", "DISPLAY", "POS", "CUTTING", "DESIGN", "INSTALLATION",
  ]),
  unit: z.enum(["M2", "METER", "PIECE", "KG", "SERVICE", "ROLL"]).default("PIECE"),
  defaultPrice: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().min(0).nullable(),
  ),
  defaultMargin: z.coerce.number().min(0).default(30),
  isActive: z.preprocess(boolFrom, z.boolean()).default(true),
});

export const userSchema = z.object({
  name: z.string().trim().min(2, "Ad ən azı 2 simvol olmalıdır").max(128),
  email: z.string().trim().min(4, "Email tələb olunur").max(190),
  roleId: z.coerce.number().int().min(1, "Rol seçin"),
  password: z
    .string()
    .optional()
    .transform((v) => (v && v.length ? v : null)),
  isActive: z.preprocess(boolFrom, z.boolean()).default(true),
});

export const companySchema = z.object({
  name: z.string().trim().min(2, "Ad tələb olunur").max(190),
  taxId: optStr,
  invoiceInfo: optText,
  vatRate: z.coerce.number().min(0).max(100).default(18),
});

export type ServiceFormValues = {
  name: string;
  category: string;
  unit: string;
  defaultPrice: string;
  defaultMargin: string;
  isActive: string;
};
export type UserFormValues = {
  name: string;
  email: string;
  roleId: string;
  password: string;
  isActive: string;
};
export type CompanyFormValues = {
  name: string;
  taxId: string;
  invoiceInfo: string;
  vatRate: string;
};
