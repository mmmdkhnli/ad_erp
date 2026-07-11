"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "./toast";

/**
 * Təsdiqli əməliyyat düyməsi — native confirm/alert əvəzinə modal dialog + toast.
 * `action` server action referansıdır, `arg` isə id.
 */
export function ConfirmAction({
  children,
  confirmText,
  title = "Təsdiq",
  action,
  arg,
  variant = "ghost",
  size = "sm",
  confirmLabel = "Təsdiqlə",
  confirmVariant = "danger",
  successMessage,
  redirectPrefix,
}: {
  children: ReactNode;
  confirmText: string;
  title?: string;
  action: (arg: number) => Promise<{ ok: boolean; id?: number; error?: string }>;
  arg: number;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  confirmLabel?: string;
  confirmVariant?: ButtonProps["variant"];
  successMessage?: string;
  redirectPrefix?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const run = () =>
    start(async () => {
      const res = await action(arg);
      if (res.ok) {
        setOpen(false);
        if (successMessage) toast({ type: "success", message: successMessage });
        if (redirectPrefix && res.id) router.push(`${redirectPrefix}${res.id}`);
        else router.refresh();
      } else {
        toast({ type: "error", message: res.error ?? "Xəta baş verdi." });
      }
    });

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        {children}
      </Button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
            onClick={() => !pending && setOpen(false)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-sm rounded-lg border border-hairline bg-surface p-5 text-left shadow-xl">
            <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-ink">
              {title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{confirmText}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" size="sm" disabled={pending} onClick={() => setOpen(false)}>
                Ləğv
              </Button>
              <Button variant={confirmVariant} size="sm" disabled={pending} onClick={run}>
                {pending ? "…" : confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
