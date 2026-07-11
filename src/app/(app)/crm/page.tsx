import { redirect } from "next/navigation";
import { requirePermission } from "@/server/rbac";

export default async function CrmPage() {
  await requirePermission("crm:read");
  redirect("/crm/customers");
}
