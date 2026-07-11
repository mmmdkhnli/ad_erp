"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setQuoteStatus } from "@/server/actions/quotes";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast";

export function QuoteStatusActions({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  const change = (s: string) =>
    start(async () => {
      const res = await setQuoteStatus(id, s);
      if (res.ok) router.refresh();
      else toast({ type: "error", message: res.error ?? "Xəta baş verdi." });
    });

  return (
    <div className="flex flex-wrap gap-2">
      {status === "DRAFT" && (
        <Button size="sm" disabled={pending} onClick={() => change("SENT")}>
          Göndər
        </Button>
      )}
      {status === "SENT" && (
        <>
          <Button size="sm" disabled={pending} onClick={() => change("APPROVED")}>
            Təsdiqlə
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={pending}
            onClick={() => change("REJECTED")}
          >
            Rədd et
          </Button>
        </>
      )}
      {(status === "REJECTED" || status === "EXPIRED") && (
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => change("DRAFT")}
        >
          Qaralamaya qaytar
        </Button>
      )}
    </div>
  );
}
