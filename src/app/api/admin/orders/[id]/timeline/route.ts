import { z } from "zod";
import { TimelineEventType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { readAdminToken, unauthorized } from "@/lib/auth";
import { audit } from "@/lib/audit";

const schema = z.object({ title: z.string().trim().min(2).max(200), description: z.string().trim().max(3000).optional(), type: z.nativeEnum(TimelineEventType).default(TimelineEventType.NOTE_ADDED), isPublic: z.boolean().default(false) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = readAdminToken(request.headers.get("authorization")); if (!token) return unauthorized();
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Укажите заголовок события" } }, { status: 422 });
  try { const event = await prisma.orderTimeline.create({ data: { orderId: (await params).id, createdById: token.userId, ...parsed.data } }); await audit({ userId: token.userId, action: "ADD_TIMELINE", entityType: "Order", entityId: event.orderId, request, metadata: { isPublic: event.isPublic } }); return Response.json({ success: true, data: event }, { status: 201 }); } catch { return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Заказ не найден" } }, { status: 404 }); }
}
