import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getDataSource } from "./db";
import type { User } from "./entities/User";
import {
  SESSION_COOKIE,
  signSession,
  verifySession,
  type SessionPayload,
} from "@/lib/session";

/** Cari sessiya (cookie-dən). Server-only. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/** Email + parol yoxlaması. Uğurlu olarsa sessiya məlumatı qaytarır. */
export async function authenticate(
  email: string,
  password: string,
): Promise<SessionPayload | null> {
  const ds = await getDataSource();
  const user = await ds.getRepository<User>("users").findOne({
    where: { email },
    relations: { role: true },
  });
  if (!user || !user.isActive) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role.name,
    permissions: user.role.permissions,
  };
}

export async function establishSession(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    // Yalnız HTTPS-də Secure et. HTTP-də (IP ilə) Secure cookie brauzerdə
    // saxlanmır → hər naviqasiyada login-ə atır. HTTPS qurulanda .env-də
    // COOKIE_SECURE=true təyin et.
    secure: process.env.COOKIE_SECURE === "true",
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
