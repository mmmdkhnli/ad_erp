import * as React from "react";
import { cn } from "@/lib/cn";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-20 w-full rounded-md border border-hairline bg-surface-sunken px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-colors focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-glow)]",
        className,
      )}
      {...props}
    />
  );
}
