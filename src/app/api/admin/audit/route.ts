import { prisma } from "@/lib/prisma";
import { readAdminToken, unauthorized } from "@/lib/auth";
import { sanitizeAuditMetadata } from "@/lib/audit-contract";
import { parseAuditQuery } from "@/lib/audit-query";

export async function GET(request: Request) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  const { page, perPage, entityType, action } = parseAuditQuery(new URL(request.url).searchParams);
  const where = { ...(entityType ? { entityType } : {}), ...(action ? { action } : {}) };
  const [items, total] = await Promise.all([prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage, include: { user: { select: { email: true, name: true, role: true } } } }), prisma.auditLog.count({ where })]);
  return Response.json({ success: true, data: items.map((item) => ({ ...item, metadata: sanitizeAuditMetadata(item.metadata) })), meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } });
}
