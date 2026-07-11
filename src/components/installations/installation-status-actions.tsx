"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setInstallationStatus } from "@/server/actions/installations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast";

const NEXT: Record<string, { to: string; label: string }> = {
  PLANNED: { to: "EN_ROUTE", label: "Yola çıx" },
  EN_ROUTE: { to: "IN_PROGRESS", label: "Başla" },
  IN_PROGRESS: { to: "DONE", label: "Tamamla" },
};

export function InstallationStatusActions({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const next = NEXT[status];
  if (!next) return null;

  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await setInstallationStatus(id, next.to);
          if (res.ok) router.refresh();
          else toast({ type: "error", message: res.error ?? "Xəta baş verdi." });
        })
      }
    >
      {next.label}
    </Button>
  );
}
