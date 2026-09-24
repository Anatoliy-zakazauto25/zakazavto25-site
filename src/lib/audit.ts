import { prisma } from "@/lib/prisma";

export async function audit(input: { userId?: string; action: string; entityType: string; entityId?: string; request?: Request; metadata?: Record<string, string | number | boolean | null> }) {
  try { await prisma.auditLog.create({ data: { userId: input.userId, action: input.action, entityType: input.entityType, entityId: input.entityId, ipAddress: input.request?.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? input.request?.headers.get("x-real-ip") ?? undefined, metadata: input.metadata } }); } catch (error) { console.error("audit_log_failed", error); }
}
