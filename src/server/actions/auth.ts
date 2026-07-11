"use server";

import { redirect } from "next/navigation";
import { authenticate, establishSession, clearSession } from "../auth";
import { getDataSource } from "../db";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email və parol tələb olunur." };
  }

  const session = await authenticate(email, password);
  if (!session) {
    return { error: "Email və ya parol yanlışdır." };
  }

  await establishSession(session);

  try {
    const ds = await getDataSource();
    await ds.getRepository("AuditLog").save({
      userId: session.userId,
      entityType: "User",
      entityId: String(session.userId),
      action: "LOGIN",
      changes: null,
    });
  } catch {
    // audit uğursuzluğu login-i bloklamamalıdır
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}
