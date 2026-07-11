"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createStockMovement } from "@/server/actions/inventory";
import { Sheet } from "@/components/shared/sheet";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { STOCK_MOVEMENT_TYPE } from "@/lib/constants";

type OrderOpt = { id: number; number: string };
type Values = {
  type: string;
  qty: string;
  unitCost: string;
  reason: string;
  orderId: string;
};

function MovementForm({
  close,
  materialId,
  orders,
}: {
  close: () => void;
  materialId: number;
  orders: OrderOpt[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: { type: "IN", qty: "", unitCost: "", reason: "", orderId: "" },
  });
  const type = watch("type");

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await createStockMovement({ ...values, materialId: String(materialId) });
    if (res.ok) {
      close();
      router.refresh();
    } else setServerError(res.error);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tip">
          <Select {...register("type")}>
            {Object.entries(STOCK_MOVEMENT_TYPE).map(([v, { label }]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={type === "ADJUST" ? "Yeni qalıq *" : "Miqdar *"} error={errors.qty?.message}>
          <Input {...register("qty", { required: "Miqdar tələb olunur" })} type="number" step="0.001" />
        </Field>
      </div>
      {type === "IN" && (
        <Field label="Vahid maya ₼ (orta mayanı yeniləyir)">
          <Input {...register("unitCost")} type="number" step="0.01" />
        </Field>
      )}
      {type === "OUT" && orders.length > 0 && (
        <Field label="Sifariş (opsional)">
          <Select {...register("orderId")}>
            <option value="">— Ümumi məxaric —</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.number}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Səbəb / qeyd">
        <Input {...register("reason")} placeholder="Məs. alış, sifarişə sərf…" />
      </Field>
      {serverError && (
        <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{serverError}</p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={close}>
          Ləğv
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saxlanılır…" : "Yadda saxla"}
        </Button>
      </div>
    </form>
  );
}

export function MovementSheet({
  materialId,
  materialName,
  orders,
}: {
  materialId: number;
  materialName: string;
  orders: OrderOpt[];
}) {
  return (
    <Sheet
      triggerLabel="Hərəkət"
      triggerVariant="ghost"
      triggerSize="sm"
      title={`Anbar hərəkəti — ${materialName}`}
    >
      {(close) => <MovementForm close={close} materialId={materialId} orders={orders} />}
    </Sheet>
  );
}
