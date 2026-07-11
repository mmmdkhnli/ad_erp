"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Sağdan açılan panel (create/edit formaları üçün).
 * children render-prop-dur: close funksiyası ötürülür.
 */
export function Sheet({
  triggerLabel,
  triggerVariant = "primary",
  triggerSize = "md",
  triggerClassName,
  title,
  description,
  children,
}: {
  triggerLabel: ReactNode;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  triggerClassName?: string;
  title: string;
  description?: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]"
            onClick={close}
            aria-hidden
          />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-surface text-left shadow-xl">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-hairline px-5">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-ink">
                  {title}
                </h2>
                {description && (
                  <p className="text-xs text-ink-muted">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Bağla"
                className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children(close)}</div>
          </div>
        </div>
      )}
    </>
  );
}
