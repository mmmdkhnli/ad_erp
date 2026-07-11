"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { setTaskStage } from "@/server/actions/production";
import { useToast } from "@/components/shared/toast";
import {
  PRODUCTION_STAGE,
  PRODUCTION_STAGE_ORDER,
  MACHINE_LABEL,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";

export type KanbanTask = {
  id: number;
  title: string;
  stage: string;
  orderNumber: string | null;
  customerName: string | null;
  assigneeName: string | null;
  machine: string | null;
  deadline: string | null;
};

function TaskCard({
  task,
  canWrite,
  today,
  onDragStart,
}: {
  task: KanbanTask;
  canWrite: boolean;
  today: string;
  onDragStart: () => void;
}) {
  const overdue = task.deadline && task.deadline < today && task.stage !== "DONE";
  return (
    <div
      draggable={canWrite}
      onDragStart={onDragStart}
      className={cn(
        "rounded-md border border-hairline bg-surface p-3",
        canWrite && "cursor-grab active:cursor-grabbing",
      )}
      style={{ boxShadow: "0 1px 2px rgba(16,25,40,.06)" }}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="tabular text-[11px] text-ink-muted">
          {task.orderNumber ?? "—"}
        </span>
        {task.machine && (
          <span className="rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] text-ink-muted">
            {MACHINE_LABEL[task.machine] ?? task.machine}
          </span>
        )}
      </div>
      <div className="text-sm font-medium leading-snug text-ink">{task.title}</div>
      {task.customerName && (
        <div className="mt-0.5 text-xs text-ink-muted">{task.customerName}</div>
      )}
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-ink-muted">{task.assigneeName ?? "Təyin edilməyib"}</span>
        {task.deadline && (
          <span className={overdue ? "font-medium text-danger" : "tabular text-ink-muted"}>
            {formatDate(task.deadline)}
          </span>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({
  initial,
  canWrite,
}: {
  initial: KanbanTask[];
  canWrite: boolean;
}) {
  const [tasks, setTasks] = useState(initial);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [, start] = useTransition();

  useEffect(() => setTasks(initial), [initial]);

  const move = (id: number, stage: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, stage } : t)));
    start(async () => {
      const res = await setTaskStage(id, stage);
      if (!res.ok) {
        toast({ type: "error", message: res.error ?? "Xəta baş verdi." });
        router.refresh();
      }
    });
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {PRODUCTION_STAGE_ORDER.map((stage) => {
        const col = tasks.filter((t) => t.stage === stage);
        const info = PRODUCTION_STAGE[stage];
        return (
          <div
            key={stage}
            onDragOver={
              canWrite
                ? (e) => {
                    e.preventDefault();
                    setOverStage(stage);
                  }
                : undefined
            }
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={
              canWrite
                ? (e) => {
                    e.preventDefault();
                    if (dragId != null) move(dragId, stage);
                    setDragId(null);
                    setOverStage(null);
                  }
                : undefined
            }
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-lg border",
              overStage === stage ? "border-brand bg-brand-soft/30" : "border-hairline bg-surface-sunken/40",
            )}
          >
            <div className="flex items-center justify-between border-b border-hairline px-3 py-2">
              <span className="text-sm font-medium text-ink">{info.label}</span>
              <span className="rounded-full bg-surface px-1.5 text-xs text-ink-muted">
                {col.length}
              </span>
            </div>
            <div className="flex min-h-28 flex-1 flex-col gap-2 p-2">
              {col.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  canWrite={canWrite}
                  today={today}
                  onDragStart={() => setDragId(t.id)}
                />
              ))}
              {col.length === 0 && (
                <div className="py-6 text-center text-xs text-ink-faint">—</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
