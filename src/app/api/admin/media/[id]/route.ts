import { unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { readAdminToken, unauthorized } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

async function removeFile(url: string | null) { if (!url?.startsWith("/uploads/")) return; try { await unlink(path.join(process.cwd(), "public", url.slice(1))); } catch { /* The database record is still removable if the file was already deleted. */ } }

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  const body = await request.json().catch(() => null); const sortOrder = Number(body?.sortOrder); const isPublic = body?.isPublic;
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || typeof isPublic !== "boolean") return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "sortOrder и isPublic обязательны" } }, { status: 422 });
  try { const media = await prisma.media.update({ where: { id: (await params).id }, data: { sortOrder, isPublic }, select: { id: true, url: true, thumbnailUrl: true, title: true, sortOrder: true, isPublic: true, vehicleId: true } }); await audit({ userId: readAdminToken(request.headers.get("authorization"))?.userId, action: "UPDATE_MEDIA", entityType: "Media", entityId: media.id, request, metadata: { isPublic: media.isPublic } }); return Response.json({ success: true, data: media }); } catch { return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Фото не найдено" } }, { status: 404 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  try { const media = await prisma.media.delete({ where: { id: (await params).id }, select: { url: true, thumbnailUrl: true } }); await Promise.all([removeFile(media.url), removeFile(media.thumbnailUrl)]); return new Response(null, { status: 204 }); } catch { return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Фото не найдено" } }, { status: 404 }); }
}
