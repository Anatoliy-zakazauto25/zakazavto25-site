import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readAdminToken, unauthorized } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";

const patchSchema = z.object({ id: z.string().uuid(), comment: z.string().trim().max(3000).optional() });

export async function GET(request: Request) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  const { page, perPage } = parsePagination(new URL(request.url).searchParams);
  const [leads, total] = await Promise.all([prisma.lead.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage, include: { vehicle: { select: { make: true, model: true, year: true, slug: true } } } }), prisma.lead.count()]);
  return Response.json({ success: true, data: leads, meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } });
}

export async function PATCH(request: Request) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  const parsed = patchSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Неверные данные" } }, { status: 422 });
  try { const lead = await prisma.lead.update({ where: { id: parsed.data.id }, data: parsed.data.comment === undefined ? {} : { comment: parsed.data.comment } }); return Response.json({ success: true, data: lead }); } catch { return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Заявка не найдена" } }, { status: 404 }); }
}
