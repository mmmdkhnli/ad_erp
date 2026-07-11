"use client";

import type { ReactNode, ComponentProps } from "react";
import { Sheet } from "@/components/shared/sheet";
import { CustomerForm } from "./customer-form";
import type { ButtonProps } from "@/components/ui/button";

type Initial = ComponentProps<typeof CustomerForm>["initial"];

export function CustomerSheet({
  id,
  initial,
  triggerLabel,
  triggerVariant,
  triggerSize,
}: {
  id?: number;
  initial?: Initial;
  triggerLabel: ReactNode;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
}) {
  return (
    <Sheet
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
      triggerSize={triggerSize}
      title={id ? "Müştərini redaktə et" : "Yeni müştəri"}
    >
      {(close) => <CustomerForm close={close} id={id} initial={initial} />}
    </Sheet>
  );
}
