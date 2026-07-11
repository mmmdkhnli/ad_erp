import { requireUser } from "@/server/rbac";
import { hasPermission } from "@/lib/session";
import { NAV } from "@/lib/constants";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { ToastProvider } from "@/components/shared/toast";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const items = NAV.filter((n) => hasPermission(user.permissions, n.perm));

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar items={items} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar user={user} items={items} />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
