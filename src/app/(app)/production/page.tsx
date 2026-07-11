import { requirePermission } from "@/server/rbac";
import { getDataSource } from "@/server/db";
import { hasPermission } from "@/lib/session";
import type { ProductionTask } from "@/server/entities/ProductionTask";
import type { Order } from "@/server/entities/Order";
import type { User } from "@/server/entities/User";
import { PageHeader } from "@/components/shared/page-header";
import { KanbanBoard, type KanbanTask } from "@/components/production/kanban-board";
import { ProductionTaskSheet } from "@/components/production/production-task-sheet";

type TaskFull = ProductionTask & {
  order: (Order & { customer: { name: string } | null }) | null;
  assignee: { name: string } | null;
};

export default async function ProductionPage() {
  const session = await requirePermission("production:read");
  const canWrite = hasPermission(session.permissions, "production:write");

  const ds = await getDataSource();
  const tasks = (await ds.getRepository<ProductionTask>("ProductionTask").find({
    relations: { order: { customer: true }, assignee: true },
    order: { position: "ASC", createdAt: "ASC" },
  })) as TaskFull[];

  const initial: KanbanTask[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    stage: t.stage,
    orderNumber: t.order?.number ?? null,
    customerName: t.order?.customer?.name ?? null,
    assigneeName: t.assignee?.name ?? null,
    machine: t.machine,
    deadline: t.deadline,
  }));

  const [orders, users] = await Promise.all([
    ds.getRepository<Order>("Order").find({
      relations: { customer: true },
      order: { createdAt: "DESC" },
      take: 100,
    }),
    ds.getRepository<User>("User").find({ where: { isActive: true }, order: { name: "ASC" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="İstehsalat"
        description="İstehsalat tapşırıqları — sürükləyərək mərhələni dəyişin"
        action={
          canWrite ? (
            <ProductionTaskSheet
              orders={orders.map((o) => ({
                id: o.id,
                number: o.number,
                customerName: (o as Order & { customer: { name: string } | null }).customer?.name ?? null,
              }))}
              users={users.map((u) => ({ id: u.id, name: u.name }))}
            />
          ) : undefined
        }
      />
      <KanbanBoard initial={initial} canWrite={canWrite} />
    </div>
  );
}
