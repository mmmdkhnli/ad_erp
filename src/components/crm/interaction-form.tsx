"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addInteraction } from "@/server/actions/crm";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { INTERACTION_TYPE } from "@/lib/constants";

type Values = { type: string; summary: string; nextActionAt: string };

export function InteractionForm({
  close,
  customerId,
}: {
  close: () => void;
  customerId: number;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: { type: "CALL", summary: "", nextActionAt: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await addInteraction(customerId, values);
    if (res.ok) {
      close();
      router.refresh();
    } else {
      setServerError(res.error);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Tip">
        <Select {...register("type")}>
          {Object.entries(INTERACTION_TYPE).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Qısa məlumat *" error={errors.summary?.message}>
        <Textarea
          {...register("summary", { required: "Məlumat tələb olunur" })}
          placeholder="Nə danışıldı, nəticə, razılaşma…"
        />
      </Field>
      <Field label="Növbəti addım tarixi">
        <Input {...register("nextActionAt")} type="date" />
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
          {isSubmitting ? "Saxlanılır…" : "Əlavə et"}
        </Button>
      </div>
    </form>
  );
}
