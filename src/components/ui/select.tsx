import * as React from "react";
import { cn } from "@/lib/cn";

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded-md border border-hairline bg-surface-sunken px-3 text-sm text-ink transition-colors focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-glow)]",
        className,
      )}
      {...props}
    />
  );
}
