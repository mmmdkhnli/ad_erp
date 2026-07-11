"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addPayment } from "@/server/actions/finance";
import { Sheet } from "@/components/shared/sheet";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PAYMENT_METHOD } from "@/lib/constants";

type Values = { amount: string; method: string; paidAt: string; note: string };

function PaymentForm({
  close,
  invoiceId,
  suggested,
}: {
  close: () => void;
  invoiceId: number;
  suggested: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const todayStr = new Date().toISOString().slice(0, 10);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: { amount: suggested, method: "TRANSFER", paidAt: todayStr, note: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await addPayment({ ...values, invoiceId: String(invoiceId) });
    if (res.ok) {
      close();
      router.refresh();
    } else setServerError(res.error);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Məbləğ ₼ *" error={errors.amount?.message}>
        <Input {...register("amount", { required: "Məbləğ tələb olunur" })} type="number" step="0.01" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Üsul">
          <Select {...register("method")}>
            {Object.entries(PAYMENT_METHOD).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tarix">
          <Input {...register("paidAt")} type="date" />
        </Field>
      </div>
      <Field label="Qeyd">
        <Textarea {...register("note")} />
      </Field>
      {serverError && (
        <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{serverError}</p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={close}>
          Ləğv
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saxlanılır…" : "Ödəniş əlavə et"}
        </Button>
      </div>
    </form>
  );
}

export function PaymentSheet({
  invoiceId,
  suggested,
}: {
  invoiceId: number;
  suggested: string;
}) {
  return (
    <Sheet triggerLabel="+ Ödəniş əlavə et" title="Ödəniş">
      {(close) => <PaymentForm close={close} invoiceId={invoiceId} suggested={suggested} />}
    </Sheet>
  );
}
