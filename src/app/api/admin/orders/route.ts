import { z } from "zod";
import { OrderStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { readAdminToken, unauthorized } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({ id: z.string().uuid(), status: z.nativeEnum(OrderStatus), comment: z.string().trim().max(2000).optional() });

export async function GET(request: Request) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  const orders = await prisma.order.findMany({ orderBy: { updatedAt: "desc" }, include: { client: { select: { name: true, phone: true, email: true } }, vehicle: { select: { make: true, model: true, year: true } } } });
  return Response.json({ success: true, data: orders });
}

export async function PATCH(request: Request) {
  const token = readAdminToken(request.headers.get("authorization")); if (!token) return unauthorized();
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Укажите статус заказа" } }, { status: 422 });
  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
      await tx.orderStatusHistory.create({ data: { orderId: order.id, status: order.status, changedById: token.userId, comment: parsed.data.comment } });
      await tx.orderTimeline.create({ data: { orderId: order.id, createdById: token.userId, type: "STATUS_CHANGE", title: `Статус: ${order.status}`, description: parsed.data.comment, isPublic: true } });
      return order;
    });
    await audit({ userId: token.userId, action: "STATUS_CHANGE", entityType: "Order", entityId: result.id, request, metadata: { status: result.status } });
    return Response.json({ success: true, data: result });
  } catch { return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Заказ не найден" } }, { status: 404 }); }
}
