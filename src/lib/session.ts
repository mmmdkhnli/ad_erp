import { SignJWT, jwtVerify } from "jose";

/** Edge-təhlükəsiz sessiya köməkçiləri (jose). DB/bcrypt YOX — middleware-də də işləyir. */

export const SESSION_COOKIE = "aderp_session";

export type SessionPayload = {
  userId: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
};

function key(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET təyin edilməyib (.env)");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key());
    return {
      userId: Number(payload.userId),
      name: String(payload.name),
      email: String(payload.email),
      role: String(payload.role),
      permissions: (payload.permissions as string[]) ?? [],
    };
  } catch {
    return null;
  }
}

/** İcazə yoxlaması: "*" hər şeyə, "module:*" modul daxilində hər şeyə icazə verir. */
export function hasPermission(permissions: string[], needed: string): boolean {
  if (!permissions || permissions.length === 0) return false;
  if (permissions.includes("*")) return true;
  if (permissions.includes(needed)) return true;
  const mod = needed.split(":")[0];
  return permissions.includes(`${mod}:*`);
}
