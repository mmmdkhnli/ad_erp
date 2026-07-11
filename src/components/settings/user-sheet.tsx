"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createUser, updateUser } from "@/server/actions/settings";
import { Sheet } from "@/components/shared/sheet";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button, type ButtonProps } from "@/components/ui/button";

type RoleOpt = { id: number; label: string };
type Values = {
  name: string;
  email: string;
  roleId: string;
  password: string;
  isActive: string;
};

function UserForm({
  close,
  id,
  initial,
  roles,
}: {
  close: () => void;
  id?: number;
  initial?: Partial<Values>;
  roles: RoleOpt[];
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
      email: "",
      roleId: roles[0] ? String(roles[0].id) : "",
      password: "",
      isActive: "true",
      ...initial,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = id ? await updateUser(id, values) : await createUser(values);
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
      <Field label="Email *" error={errors.email?.message}>
        <Input {...register("email", { required: "Email tələb olunur" })} type="email" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Rol">
          <Select {...register("roleId")}>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Vəziyyət">
          <Select {...register("isActive")}>
            <option value="true">Aktiv</option>
            <option value="false">Deaktiv</option>
          </Select>
        </Field>
      </div>
      <Field label={id ? "Yeni parol (boş = dəyişmə)" : "Parol *"} error={errors.password?.message}>
        <Input
          {...register("password", id ? {} : { required: "Parol tələb olunur", minLength: { value: 6, message: "Ən azı 6 simvol" } })}
          type="password"
          placeholder={id ? "••••••" : "Ən azı 6 simvol"}
        />
      </Field>
      {serverError && <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{serverError}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={close}>Ləğv</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saxlanılır…" : "Saxla"}</Button>
      </div>
    </form>
  );
}

export function UserSheet({
  id,
  initial,
  roles,
  triggerLabel,
  triggerVariant = "primary",
  triggerSize = "md",
}: {
  id?: number;
  initial?: Partial<Values>;
  roles: RoleOpt[];
  triggerLabel: string;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
}) {
  return (
    <Sheet triggerLabel={triggerLabel} triggerVariant={triggerVariant} triggerSize={triggerSize} title={id ? "İstifadəçini redaktə et" : "Yeni istifadəçi"}>
      {(close) => <UserForm close={close} id={id} initial={initial} roles={roles} />}
    </Sheet>
  );
}
