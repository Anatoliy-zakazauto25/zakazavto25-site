import { prisma } from "@/lib/prisma";
import { generateToken, verifyPassword } from "@/lib/auth";
import { rateLimit, requestIp, tooManyRequests } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { internalApiError } from "@/lib/api-error";

export async function POST(request: Request) {
  const limit = rateLimit(`login:${requestIp(request)}`, 5, 15 * 60 * 1000); if (!limit.allowed) return tooManyRequests(limit.retryAfter);
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Введите email и пароль" } }, { status: 422 });
  }

  // Fallback admin login via environment variables (for deployments without a working database)
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
    const fallbackUser = { id: "admin-fallback", email: adminEmail, name: "Администратор", role: "ADMIN" };
    return Response.json({ success: true, data: { token: generateToken({ userId: fallbackUser.id, role: fallbackUser.role }), user: fallbackUser } });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
      return Response.json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Неверный email или пароль" } }, { status: 401 });
    }
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await audit({ userId: user.id, action: "LOGIN", entityType: "User", entityId: user.id, request });
    return Response.json({ success: true, data: { token: generateToken({ userId: user.id, role: user.role }), user: { id: user.id, email: user.email, name: user.name, role: user.role } } });
  } catch (error) { return internalApiError("login_failed", error); }
}
