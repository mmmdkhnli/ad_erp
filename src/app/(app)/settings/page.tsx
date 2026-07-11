import { redirect } from "next/navigation";
import { requirePermission } from "@/server/rbac";

export default async function SettingsPage() {
  await requirePermission("settings:read");
  redirect("/settings/services");
}
