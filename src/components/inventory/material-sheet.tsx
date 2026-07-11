"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createMaterial, updateMaterial } from "@/server/actions/inventory";
import { Sheet } from "@/components/shared/sheet";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button, type ButtonProps } from "@/components/ui/button";
import { UNIT_LABEL } from "@/lib/constants";

const MATERIAL_UNITS = ["M2", "METER", "PIECE", "KG", "ROLL"];
type Values = { name: string; unit: string; minQty: string; avgCost: string };

function MaterialForm({
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
    defaultValues: { name: "", unit: "PIECE", minQty: "0", avgCost: "0", ...initial },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = id ? await updateMaterial(id, values) : await createMaterial(values);
    if (res.ok) {
      close();
      router.refresh();
    } else setServerError(res.error);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Ad *" error={errors.name?.message}>
        <Input {...register("name", { required: "Ad tələb olunur" })} placeholder="Məs. Vinil (mat)" />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Vahid">
          <Select {...register("unit")}>
            {MATERIAL_UNITS.map((u) => (
              <option key={u} value={u}>
                {UNIT_LABEL[u] ?? u}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Min. həd">
          <Input {...register("minQty")} type="number" step="0.001" />
        </Field>
        <Field label="Orta maya ₼">
          <Input {...register("avgCost")} type="number" step="0.01" />
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
          {isSubmitting ? "Saxlanılır…" : "Saxla"}
        </Button>
      </div>
    </form>
  );
}

export function MaterialSheet({
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
    <Sheet
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
      triggerSize={triggerSize}
      title={id ? "Materialı redaktə et" : "Yeni material"}
    >
      {(close) => <MaterialForm close={close} id={id} initial={initial} />}
    </Sheet>
  );
}
