"use client";

import { Sheet } from "@/components/shared/sheet";
import { ProductionTaskForm } from "./production-task-form";

export function ProductionTaskSheet({
  orders,
  users,
}: {
  orders: { id: number; number: string; customerName: string | null }[];
  users: { id: number; name: string }[];
}) {
  return (
    <Sheet triggerLabel="+ Yeni tapşırıq" title="İstehsalat tapşırığı">
      {(close) => <ProductionTaskForm close={close} orders={orders} users={users} />}
    </Sheet>
  );
}
