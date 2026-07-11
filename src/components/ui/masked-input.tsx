"use client";

import * as React from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "./input";

/**
 * RHF register ilə işləyən maskalı input.
 * `format` hər dəyişiklikdə dəyəri formatlayır (telefon, VÖEN və s.).
 */
export function MaskedInput({
  reg,
  format,
  ...props
}: {
  reg: UseFormRegisterReturn;
  format: (v: string) => string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "name">) {
  return (
    <Input
      {...reg}
      {...props}
      onChange={(e) => {
        e.target.value = format(e.target.value);
        return reg.onChange(e);
      }}
    />
  );
}
