import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { runtimeConfig } from "@/lib/config";

export type AuthPayload = { userId: string; role: string };

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: AuthPayload) {
  return jwt.sign(payload, runtimeConfig.jwtSecret, { expiresIn: "1h" });
}

export function readToken(value: string | null): AuthPayload | null {
  if (!value?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(value.slice(7), runtimeConfig.jwtSecret);
    if (typeof payload !== "object" || !payload || !("userId" in payload)) return null;
    return payload as AuthPayload;
  } catch {
    return null;
  }
}

export function readAdminToken(value: string | null) {
  const payload = readToken(value);
  return payload && ["ADMIN", "MANAGER", "SUPERVISOR"].includes(payload.role) ? payload : null;
}

export function unauthorized() {
  return Response.json(
    { success: false, error: { code: "UNAUTHORIZED", message: "Требуется авторизация" } },
    { status: 401 },
  );
}
