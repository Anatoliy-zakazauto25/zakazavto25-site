import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readAdminToken, unauthorized } from "@/lib/auth";
import { audit } from "@/lib/audit";

const patchSchema = z.object({ managerNotes: z.string().trim().max(5000).nullable().optional(), clientNotes: z.string().trim().max(5000).nullable().optional(), trackingEnabled: z.boolean().optional(), pricingPublic: z.boolean().optional() });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  const order = await prisma.order.findUnique({ where: { id: (await params).id }, include: { client: true, vehicle: { include: { media: { where: { type: "PHOTO" }, orderBy: { sortOrder: "asc" } } } }, statusHistory: { orderBy: { changedAt: "desc" } }, timeline: { orderBy: { createdAt: "desc" } } } });
  if (!order) return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Заказ не найден" } }, { status: 404 });
  return Response.json({ success: true, data: order });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  const parsed = patchSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Неверные данные заказа" } }, { status: 422 });
  const token = readAdminToken(request.headers.get("authorization")); if (!token) return unauthorized();
  try { const order = await prisma.order.update({ where: { id: (await params).id }, data: parsed.data }); await audit({ userId: token.userId, action: "UPDATE_ORDER", entityType: "Order", entityId: order.id, request, metadata: { pricingPublic: order.pricingPublic, trackingEnabled: order.trackingEnabled } }); return Response.json({ success: true, data: order }); } catch { return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Заказ не найден" } }, { status: 404 }); }
}
