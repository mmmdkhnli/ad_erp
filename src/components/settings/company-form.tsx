"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateCompany } from "@/server/actions/settings";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MaskedInput } from "@/components/ui/masked-input";
import { formatTaxId } from "@/lib/mask";

type Values = { name: string; taxId: string; invoiceInfo: string; vatRate: string };

export function CompanyForm({ initial }: { initial: Values }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues: initial });

  const onSubmit = handleSubmit(async (values) => {
    setMsg(null);
    const res = await updateCompany(values);
    if (res.ok) {
      setMsg({ ok: true, text: "Yadda saxlanıldı." });
      router.refresh();
    } else setMsg({ ok: false, text: res.error });
  });

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <Field label="Şirkət adı *" error={errors.name?.message}>
        <Input {...register("name", { required: "Ad tələb olunur" })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="VÖEN">
          <MaskedInput reg={register("taxId")} format={formatTaxId} inputMode="numeric" placeholder="1234567890" />
        </Field>
        <Field label="ƏDV dərəcəsi (%)">
          <Input {...register("vatRate")} type="number" step="0.1" />
        </Field>
      </div>
      <Field label="Faktura rekvizitləri">
        <Textarea {...register("invoiceInfo")} placeholder="Bank, hesab nömrəsi, ünvan…" />
      </Field>
      {msg && (
        <p className={`rounded-md px-3 py-2 text-sm ${msg.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
          {msg.text}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saxlanılır…" : "Yadda saxla"}
      </Button>
    </form>
  );
}
