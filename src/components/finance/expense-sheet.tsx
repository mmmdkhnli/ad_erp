"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createExpense } from "@/server/actions/finance";
import { Sheet } from "@/components/shared/sheet";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EXPENSE_CATEGORY } from "@/lib/constants";

type OrderOpt = { id: number; number: string; customerName: string | null };
type Values = {
  orderId: string;
  category: string;
  amount: string;
  description: string;
  spentAt: string;
};

function ExpenseForm({ close, orders }: { close: () => void; orders: OrderOpt[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const todayStr = new Date().toISOString().slice(0, 10);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      orderId: "",
      category: "MATERIAL",
      amount: "",
      description: "",
      spentAt: todayStr,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await createExpense(values);
    if (res.ok) {
      close();
      router.refresh();
    } else setServerError(res.error);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Kateqoriya">
          <Select {...register("category")}>
            {Object.entries(EXPENSE_CATEGORY).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Məbləğ ₼ *" error={errors.amount?.message}>
          <Input {...register("amount", { required: "Məbləğ tələb olunur" })} type="number" step="0.01" />
        </Field>
      </div>
      <Field label="Təsvir *" error={errors.description?.message}>
        <Input {...register("description", { required: "Təsvir tələb olunur" })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Sifariş (opsional)">
          <Select {...register("orderId")}>
            <option value="">— Ümumi xərc —</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.number} — {o.customerName ?? "—"}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tarix">
          <Input {...register("spentAt")} type="date" />
        </Field>
      </div>
      {serverError && (
        <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{serverError}</p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={close}>
          Ləğv
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saxlanılır…" : "Xərc əlavə et"}
        </Button>
      </div>
    </form>
  );
}

export function ExpenseSheet({ orders }: { orders: OrderOpt[] }) {
  return (
    <Sheet triggerLabel="+ Yeni xərc" title="Xərc">
      {(close) => <ExpenseForm close={close} orders={orders} />}
    </Sheet>
  );
}
