"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createService, updateService } from "@/server/actions/settings";
import { Sheet } from "@/components/shared/sheet";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button, type ButtonProps } from "@/components/ui/button";
import { SERVICE_CATEGORY, UNIT_LABEL } from "@/lib/constants";

const UNITS = ["M2", "METER", "PIECE", "KG", "SERVICE", "ROLL"];
type Values = {
  name: string;
  category: string;
  unit: string;
  defaultPrice: string;
  defaultMargin: string;
  isActive: string;
};

function ServiceForm({ close, id, initial }: { close: () => void; id?: number; initial?: Partial<Values> }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      name: "",
      category: "OUTDOOR",
      unit: "PIECE",
      defaultPrice: "",
      defaultMargin: "30",
      isActive: "true",
      ...initial,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = id ? await updateService(id, values) : await createService(values);
    if (res.ok) {
      close();
      router.refresh();
    } else setServerError(res.error);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Ad *" error={errors.name?.message}>
        <Input {...register("name", { required: "Ad tələb olunur" })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Kateqoriya">
          <Select {...register("category")}>
            {Object.entries(SERVICE_CATEGORY).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </Field>
        <Field label="Vahid">
          <Select {...register("unit")}>
            {UNITS.map((u) => (
              <option key={u} value={u}>{UNIT_LABEL[u] ?? u}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Təxmini qiymət ₼">
          <Input {...register("defaultPrice")} type="number" step="0.01" />
        </Field>
        <Field label="Marja %">
          <Input {...register("defaultMargin")} type="number" step="0.1" />
        </Field>
        <Field label="Vəziyyət">
          <Select {...register("isActive")}>
            <option value="true">Aktiv</option>
            <option value="false">Deaktiv</option>
          </Select>
        </Field>
      </div>
      {serverError && <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{serverError}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={close}>Ləğv</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saxlanılır…" : "Saxla"}</Button>
      </div>
    </form>
  );
}

export function ServiceSheet({
  id,
  initial,
  triggerLabel,
  triggerVariant = "primary",
  triggerSize = "md",
}: {
  id?: number;
  initial?: Partial<Values>;
  triggerLabel: string;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
}) {
  return (
    <Sheet triggerLabel={triggerLabel} triggerVariant={triggerVariant} triggerSize={triggerSize} title={id ? "Xidməti redaktə et" : "Yeni xidmət"}>
      {(close) => <ServiceForm close={close} id={id} initial={initial} />}
    </Sheet>
  );
}
