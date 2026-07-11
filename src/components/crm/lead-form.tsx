"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createLead, updateLead } from "@/server/actions/crm";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MaskedInput } from "@/components/ui/masked-input";
import { LEAD_SOURCE, LEAD_STATUS } from "@/lib/constants";
import { formatAzPhone } from "@/lib/mask";

type Values = {
  name: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  note: string;
};

export function LeadForm({
  close,
  id,
  initial,
}: {
  close: () => void;
  id?: number;
  initial?: Partial<Values>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      source: "OTHER",
      status: "NEW",
      note: "",
      ...initial,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = id ? await updateLead(id, values) : await createLead(values);
    if (res.ok) {
      close();
      router.refresh();
    } else {
      setServerError(res.error);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Ad *" error={errors.name?.message}>
        <Input
          {...register("name", { required: "Ad tələb olunur" })}
          placeholder="Lead adı / şirkət"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefon">
          <MaskedInput
            reg={register("phone")}
            format={formatAzPhone}
            inputMode="tel"
            placeholder="+994 50 123 45 67"
          />
        </Field>
        <Field label="Email">
          <Input {...register("email")} type="email" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mənbə">
          <Select {...register("source")}>
            {Object.entries(LEAD_SOURCE).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select {...register("status")}>
            {Object.entries(LEAD_STATUS).map(([v, { label }]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </Select>
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
          {isSubmitting ? "Saxlanılır…" : "Saxla"}
        </Button>
      </div>
    </form>
  );
}
