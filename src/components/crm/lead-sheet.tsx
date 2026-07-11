"use client";

import type { ReactNode, ComponentProps } from "react";
import { Sheet } from "@/components/shared/sheet";
import { LeadForm } from "./lead-form";
import type { ButtonProps } from "@/components/ui/button";

type Initial = ComponentProps<typeof LeadForm>["initial"];

export function LeadSheet({
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
      title={id ? "Lead-i redaktə et" : "Yeni lead"}
    >
      {(close) => <LeadForm close={close} id={id} initial={initial} />}
    </Sheet>
  );
}
