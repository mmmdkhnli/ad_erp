"use client";

import type { ReactNode } from "react";
import { Sheet } from "@/components/shared/sheet";
import { InteractionForm } from "./interaction-form";
import type { ButtonProps } from "@/components/ui/button";

export function InteractionSheet({
  customerId,
  triggerLabel,
  triggerVariant = "secondary",
  triggerSize = "sm",
}: {
  customerId: number;
  triggerLabel: ReactNode;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
}) {
  return (
    <Sheet
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
      triggerSize={triggerSize}
      title="Əlaqə əlavə et"
    >
      {(close) => <InteractionForm close={close} customerId={customerId} />}
    </Sheet>
  );
}
