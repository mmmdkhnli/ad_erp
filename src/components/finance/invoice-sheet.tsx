"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createInvoice } from "@/server/actions/finance";
import { Sheet } from "@/components/shared/sheet";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";

type OrderOpt = { id: number; number: string; total: string; customerName: string | null };
type Values = { orderId: string; total: string; dueAt: string };

function InvoiceForm({ close, orders }: { close: () => void; orders: OrderOpt[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues: { orderId: "", total: "", dueAt: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await createInvoice(values);
    if (res.ok) {
      close();
      router.refresh();
    } else setServerError(res.error);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Sifariş *" error={errors.orderId?.message}>
        <Select
          {...register("orderId", { required: "Sifariş seçin" })}
          onChange={(e) => {
            register("orderId").onChange(e);
            const o = orders.find((x) => String(x.id) === e.target.value);
            if (o) setValue("total", o.total);
          }}
        >
          <option value="">— Seçin —</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.number} — {o.customerName ?? "—"}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Məbləğ (ƏDV daxil) ₼ *" error={errors.total?.message}>
        <Input {...register("total", { required: "Məbləğ tələb olunur" })} type="number" step="0.01" />
      </Field>
      <Field label="Ödəmə tarixi (son)">
        <Input {...register("dueAt")} type="date" />
      </Field>
      {serverError && (
        <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{serverError}</p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={close}>
          Ləğv
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saxlanılır…" : "Faktura yarat"}
        </Button>
      </div>
    </form>
  );
}

export function InvoiceSheet({
  orders,
  triggerLabel = "+ Yeni faktura",
  triggerVariant = "primary",
  triggerSize = "md",
}: {
  orders: OrderOpt[];
  triggerLabel?: string;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
}) {
  return (
    <Sheet
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
      triggerSize={triggerSize}
      title="Yeni faktura"
    >
      {(close) => <InvoiceForm close={close} orders={orders} />}
    </Sheet>
  );
}
