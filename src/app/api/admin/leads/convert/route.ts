import { randomInt } from "node:crypto";
import { z } from "zod";
import { OrderStatus, TimelineEventType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { readAdminToken, unauthorized } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({ leadId: z.string().uuid(), vehicleId: z.string().uuid().optional() });

function orderNumber() { return `ЗА-${Date.now().toString().slice(-6)}${randomInt(10, 99)}`; }

export async function POST(request: Request) {
  const token = readAdminToken(request.headers.get("authorization")); if (!token) return unauthorized();
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Укажите заявку" } }, { status: 422 });
  const lead = await prisma.lead.findUnique({ where: { id: parsed.data.leadId } }); if (!lead) return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Заявка не найдена" } }, { status: 404 });
  const vehicleId = parsed.data.vehicleId ?? lead.vehicleId;
  const result = await prisma.$transaction(async (tx) => {
    const existingClient = await tx.client.findFirst({ where: lead.phone ? { phone: lead.phone } : lead.email ? { email: lead.email } : { name: lead.name } });
    const client = existingClient ?? await tx.client.create({ data: { name: lead.name, phone: lead.phone, email: lead.email, telegram: lead.telegram, source: lead.source, consentGiven: lead.consentGiven, consentDate: lead.consentDate } });
    const order = await tx.order.create({ data: { orderNumber: orderNumber(), clientId: client.id, vehicleId, vehicleRequest: lead.vehicleRequest ?? undefined, status: OrderStatus.NEW, source: lead.source, timeline: { create: { createdById: token.userId, type: TimelineEventType.STATUS_CHANGE, title: "Заявка принята", description: "Заявка переведена в работу", isPublic: true } } }, select: { id: true, orderNumber: true, trackingToken: true, status: true } });
    return order;
  });
  await audit({ userId: token.userId, action: "CONVERT_TO_ORDER", entityType: "Lead", entityId: lead.id, request, metadata: { orderId: result.id } });
  return Response.json({ success: true, data: { ...result, trackingUrl: `/orders/track/${result.trackingToken}` } }, { status: 201 });
}
