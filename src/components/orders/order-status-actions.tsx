"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setOrderStatus } from "@/server/actions/orders";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast";

const NEXT: Record<string, { to: string; label: string }> = {
  NEW: { to: "IN_PROGRESS", label: "İcraya başla" },
  IN_PROGRESS: { to: "INSTALLING", label: "Quraşdırmaya keçir" },
  INSTALLING: { to: "DELIVERED", label: "Təhvil ver" },
  DELIVERED: { to: "CLOSED", label: "Bağla" },
};

export function OrderStatusActions({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  const change = (s: string) =>
    start(async () => {
      const res = await setOrderStatus(id, s);
      if (res.ok) router.refresh();
      else toast({ type: "error", message: res.error ?? "Xəta baş verdi." });
    });

  const next = NEXT[status];
  const canCancel = status !== "CLOSED" && status !== "CANCELLED";

  return (
    <div className="flex flex-wrap gap-2">
      {next && (
        <Button size="sm" disabled={pending} onClick={() => change(next.to)}>
          {next.label}
        </Button>
      )}
      {canCancel && (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => change("CANCELLED")}
        >
          Ləğv et
        </Button>
      )}
    </div>
  );
}
