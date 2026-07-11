"use client";

import {
  useForm,
  useFieldArray,
  useWatch,
  type Control,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { createQuote, updateQuote } from "@/server/actions/quotes";
import { quoteTotals, lineTotal, type LineCosts } from "@/lib/calc";
import { formatMoney } from "@/lib/format";
import { UNIT_LABEL } from "@/lib/constants";
import type { QuoteFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";

type Svc = {
  id: number;
  name: string;
  unit: string;
  defaultPrice: string | null;
  defaultMargin: string;
};
type Cust = { id: number; name: string };

function num(v: string | undefined): number {
  const n = parseFloat(v ?? "");
  return Number.isFinite(n) ? n : 0;
}

function toCosts(i: QuoteFormValues["items"][number]): LineCosts {
  return {
    materialCost: num(i.materialCost),
    laborCost: num(i.laborCost),
    transportCost: num(i.transportCost),
    installCost: num(i.installCost),
    marginPct: num(i.marginPct),
  };
}

function emptyItem(): QuoteFormValues["items"][number] {
  return {
    serviceId: "",
    description: "",
    qty: "1",
    unit: "PIECE",
    materialCost: "",
    laborCost: "",
    transportCost: "",
    installCost: "",
    marginPct: "30",
  };
}

/** Sətir cəmini canlı göstərir (useWatch ilə). */
function LineTotal({ control, index }: { control: Control<QuoteFormValues>; index: number }) {
  const item = useWatch({ control, name: `items.${index}` });
  const value = item ? lineTotal(toCosts(item)) : 0;
  return <span className="tabular font-medium text-ink">{formatMoney(value)}</span>;
}

/** Yekun panel (canlı). */
function Totals({ control }: { control: Control<QuoteFormValues> }) {
  const items = useWatch({ control, name: "items" }) ?? [];
  const vatRate = num(useWatch({ control, name: "vatRate" }));
  const t = quoteTotals(items.map(toCosts), vatRate);
  return (
    <div className="space-y-1.5 text-sm">
      <Row label="Xərc (marjasız)" value={formatMoney(t.costTotal)} muted />
      <Row label="Mənfəət (marja)" value={formatMoney(t.marginAmount)} muted />
      <Row label="Aralıq cəm" value={formatMoney(t.subtotal)} />
      <Row label={`ƏDV (${vatRate}%)`} value={formatMoney(t.vatAmount)} muted />
      <div className="my-1 border-t border-hairline" />
      <Row label="Yekun" value={formatMoney(t.total)} strong />
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-ink-muted" : "text-ink"}>{label}</span>
      <span
        className={
          strong
            ? "tabular font-[family-name:var(--font-display)] text-lg font-semibold text-brand"
            : "tabular text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function QuoteEditor({
  customers,
  services,
  id,
  initial,
}: {
  customers: Cust[];
  services: Svc[];
  id?: number;
  initial?: QuoteFormValues;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<QuoteFormValues>({
    defaultValues:
      initial ?? {
        customerId: "",
        validUntil: "",
        note: "",
        vatRate: "18",
        items: [emptyItem()],
      },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = id ? await updateQuote(id, values) : await createQuote(values);
    if (res.ok) {
      router.push(res.id ? `/quotes/${res.id}` : "/quotes");
      router.refresh();
    } else {
      setServerError(res.error);
    }
  });

  const applyService = (index: number, serviceId: string) => {
    const svc = services.find((s) => String(s.id) === serviceId);
    if (!svc) return;
    setValue(`items.${index}.description`, svc.name);
    setValue(`items.${index}.unit`, svc.unit);
    setValue(`items.${index}.marginPct`, svc.defaultMargin);
    if (svc.defaultPrice) setValue(`items.${index}.materialCost`, svc.defaultPrice);
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Başlıq */}
        <div className="rounded-lg border border-hairline bg-surface p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Müştəri *">
              <Select {...register("customerId")} defaultValue={initial?.customerId ?? ""}>
                <option value="">— Seçin —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Etibarlıdır (tarix)">
              <Input {...register("validUntil")} type="date" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Qeyd">
              <Textarea {...register("note")} placeholder="Təklif haqqında qeyd…" />
            </Field>
          </div>
        </div>

        {/* Sətirlər */}
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-hairline bg-surface p-4">
              <div className="mb-3 flex items-start gap-2">
                <div className="flex-1">
                  <Select
                    {...register(`items.${index}.serviceId`)}
                    onChange={(e) => {
                      register(`items.${index}.serviceId`).onChange(e);
                      applyService(index, e.target.value);
                    }}
                  >
                    <option value="">— Xidmət seçin (kataloqdan) —</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <button
                  type="button"
                  onClick={() => (fields.length > 1 ? remove(index) : null)}
                  aria-label="Sətri sil"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-40"
                  disabled={fields.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <Input
                {...register(`items.${index}.description`)}
                placeholder="Sətir təsviri"
                className="mb-3"
              />

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                <NumCell label="Say" reg={register(`items.${index}.qty`)} step="0.001" />
                <div>
                  <label className="mb-1 block text-[11px] text-ink-muted">Vahid</label>
                  <Select {...register(`items.${index}.unit`)} className="h-8 text-[13px]">
                    {Object.entries(UNIT_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </div>
                <NumCell label="Material ₼" reg={register(`items.${index}.materialCost`)} />
                <NumCell label="İşçilik ₼" reg={register(`items.${index}.laborCost`)} />
                <NumCell label="Daşınma ₼" reg={register(`items.${index}.transportCost`)} />
                <NumCell label="Quraşdırma ₼" reg={register(`items.${index}.installCost`)} />
              </div>
              <div className="mt-2 grid grid-cols-2 items-end gap-2 sm:grid-cols-3 lg:grid-cols-6">
                <NumCell label="Marja %" reg={register(`items.${index}.marginPct`)} />
                <div className="col-span-1 lg:col-span-4" />
                <div className="text-right">
                  <div className="mb-1 text-[11px] text-ink-muted">Sətir cəmi</div>
                  <LineTotal control={control} index={index} />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={() => append(emptyItem())}
          >
            <Plus className="h-4 w-4" /> Sətir əlavə et
          </Button>
        </div>
      </div>

      {/* Yekun (sağ panel) */}
      <div className="lg:col-span-1">
        <div className="sticky top-4 space-y-4 rounded-lg border border-hairline bg-surface p-5">
          <div className="tick-rule w-20 opacity-60" />
          <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-ink">
            Yekun
          </h2>

          <div className="flex items-center justify-between gap-2">
            <label className="text-sm text-ink-muted">ƏDV dərəcəsi (%)</label>
            <input
              {...register("vatRate")}
              type="number"
              step="0.1"
              className="tabular h-8 w-20 rounded-md border border-hairline bg-surface-sunken px-2 text-right text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-glow)]"
            />
          </div>

          <Totals control={control} />

          {serverError && (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
              {serverError}
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saxlanılır…" : id ? "Yenilə" : "Təklifi yarat"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => router.push("/quotes")}
            >
              Ləğv
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function NumCell({
  label,
  reg,
  step = "0.01",
}: {
  label: string;
  reg: UseFormRegisterReturn;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] text-ink-muted">{label}</label>
      <input
        {...reg}
        type="number"
        step={step}
        placeholder="0"
        className="tabular h-8 w-full rounded-md border border-hairline bg-surface-sunken px-2 text-right text-[13px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-glow)]"
      />
    </div>
  );
}
