import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { hasPermission, type SessionPayload } from "@/lib/session";

export { hasPermission };

/** Sessiya tələb edir; yoxdursa /login-ə yönləndirir. */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** İcazə tələb edir; yoxdursa dashboard-a yönləndirir. */
export async function requirePermission(needed: string): Promise<SessionPayload> {
  const session = await requireUser();
  if (!hasPermission(session.permissions, needed)) {
    redirect("/dashboard");
  }
  return session;
}
