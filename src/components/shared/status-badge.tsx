import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/constants";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-neutral-soft text-neutral",
  brand: "bg-brand-soft text-brand",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  accent2: "bg-accent2-soft text-accent2",
};

/** Kəsilmiş-künc status çipi (imza elementi). */
export function StatusBadge({
  tone,
  children,
}: {
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium",
        TONE_CLASS[tone],
      )}
      style={{
        clipPath:
          "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)",
      }}
    >
      {children}
    </span>
  );
}
