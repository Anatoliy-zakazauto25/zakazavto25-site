import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readAdminToken, unauthorized } from "@/lib/auth";
import { audit } from "@/lib/audit";

const patchSchema = z.record(z.string(), z.unknown());

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  const item = await prisma.vehicle.findUnique({ where: { id: (await params).id } }); if (!item) return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Автомобиль не найден" } }, { status: 404 });
  return Response.json({ success: true, data: item });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = readAdminToken(request.headers.get("authorization")); if (!token) return unauthorized();
  const body = await request.json().catch(() => null); const parsed = patchSchema.safeParse(body); if (!parsed.success) return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Неверные данные" } }, { status: 422 });
  try { const item = await prisma.vehicle.update({ where: { id: (await params).id }, data: { ...parsed.data, updatedById: token.userId } }); await audit({ userId: token.userId, action: "UPDATE", entityType: "Vehicle", entityId: item.id, request, metadata: { isPublished: item.isPublished, isFeatured: item.isFeatured } }); return Response.json({ success: true, data: item }); } catch { return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Автомобиль не найден" } }, { status: 404 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = readAdminToken(request.headers.get("authorization")); if (!token) return unauthorized();
  try { await prisma.vehicle.delete({ where: { id: (await params).id } }); await audit({ userId: token.userId, action: "DELETE", entityType: "Vehicle", entityId: (await params).id, request }); return new Response(null, { status: 204 }); } catch { return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Автомобиль не найден" } }, { status: 404 }); }
}
