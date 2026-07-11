"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createProductionTask } from "@/server/actions/production";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PRODUCTION_STAGE, MACHINE_LABEL } from "@/lib/constants";

type Values = {
  orderId: string;
  title: string;
  stage: string;
  assigneeId: string;
  machine: string;
  deadline: string;
  note: string;
};

export function ProductionTaskForm({
  close,
  orders,
  users,
}: {
  close: () => void;
  orders: { id: number; number: string; customerName: string | null }[];
  users: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      orderId: "",
      title: "",
      stage: "PENDING",
      assigneeId: "",
      machine: "",
      deadline: "",
      note: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await createProductionTask(values);
    if (res.ok) {
      close();
      router.refresh();
    } else {
      setServerError(res.error);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
      <Field label="Başlıq *" error={errors.title?.message}>
        <Input
          {...register("title", { required: "Başlıq tələb olunur" })}
          placeholder="Məs. Qabarıq hərflərin kəsimi"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mərhələ">
          <Select {...register("stage")}>
            {Object.entries(PRODUCTION_STAGE).map(([v, { label }]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Dəzgah">
          <Select {...register("machine")}>
            <option value="">—</option>
            {Object.entries(MACHINE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Məsul">
          <Select {...register("assigneeId")}>
            <option value="">— Təyin edilməyib —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Deadline">
          <Input {...register("deadline")} type="date" />
        </Field>
      </div>
      <Field label="Qeyd">
        <Textarea {...register("note")} />
      </Field>

      {serverError && (
        <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          {serverError}
        </p>
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
