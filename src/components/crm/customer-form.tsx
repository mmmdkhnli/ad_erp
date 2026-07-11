"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCustomer, updateCustomer } from "@/server/actions/crm";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MaskedInput } from "@/components/ui/masked-input";
import { CUSTOMER_TYPE } from "@/lib/constants";
import { formatAzPhone, formatTaxId } from "@/lib/mask";

type Values = {
  name: string;
  type: "INDIVIDUAL" | "COMPANY";
  taxId: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  note: string;
};

export function CustomerForm({
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
      type: "COMPANY",
      taxId: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      note: "",
      ...initial,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = id ? await updateCustomer(id, values) : await createCustomer(values);
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
          {...register("name", {
            required: "Ad tələb olunur",
            minLength: { value: 2, message: "Ən azı 2 simvol" },
          })}
          placeholder="Müştəri adı"
        />
      </Field>
      <Field label="Tip">
        <Select {...register("type")}>
          {Object.entries(CUSTOMER_TYPE).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="VÖEN">
          <MaskedInput
            reg={register("taxId")}
            format={formatTaxId}
            inputMode="numeric"
            placeholder="1234567890"
          />
        </Field>
        <Field label="Telefon">
          <MaskedInput
            reg={register("phone")}
            format={formatAzPhone}
            inputMode="tel"
            placeholder="+994 50 123 45 67"
          />
        </Field>
      </div>
      <Field label="Əlaqə şəxsi">
        <Input {...register("contactPerson")} />
      </Field>
      <Field label="Email">
        <Input {...register("email")} type="email" placeholder="info@example.az" />
      </Field>
      <Field label="Ünvan">
        <Input {...register("address")} />
      </Field>
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
