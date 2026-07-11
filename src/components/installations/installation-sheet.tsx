"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createInstallation } from "@/server/actions/installations";
import { Sheet } from "@/components/shared/sheet";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { INSTALLATION_TYPE } from "@/lib/constants";

type OrderOpt = { id: number; number: string; customerName: string | null };
type Values = {
  orderId: string;
  type: string;
  address: string;
  mapUrl: string;
  scheduledAt: string;
  teamNote: string;
};

function InstallationForm({ close, orders }: { close: () => void; orders: OrderOpt[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      orderId: "",
      type: "MOUNT",
      address: "",
      mapUrl: "",
      scheduledAt: "",
      teamNote: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await createInstallation(values);
    if (res.ok) {
      close();
      router.refresh();
    } else setServerError(res.error);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Sifariş *" error={errors.orderId?.message}>
          <Select {...register("orderId", { required: "Sifariş seçin" })}>
            <option value="">— Seçin —</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.number} — {o.customerName ?? "—"}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tip">
          <Select {...register("type")}>
            {Object.entries(INSTALLATION_TYPE).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Ünvan *" error={errors.address?.message}>
        <Input {...register("address", { required: "Ünvan tələb olunur" })} placeholder="Bakı, ..." />
      </Field>
      <Field label="Xəritə linki (opsional)">
        <Input {...register("mapUrl")} placeholder="https://maps.google.com/..." />
      </Field>
      <Field label="Vaxt">
        <Input {...register("scheduledAt")} type="datetime-local" />
      </Field>
      <Field label="Komanda qeydi">
        <Textarea {...register("teamNote")} />
      </Field>
      {serverError && (
        <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{serverError}</p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={close}>
          Ləğv
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saxlanılır…" : "Yarat"}
        </Button>
      </div>
    </form>
  );
}

export function InstallationSheet({ orders }: { orders: OrderOpt[] }) {
  return (
    <Sheet triggerLabel="+ Yeni quraşdırma" title="Quraşdırma tapşırığı">
      {(close) => <InstallationForm close={close} orders={orders} />}
    </Sheet>
  );
}
