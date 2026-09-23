import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readAdminToken, unauthorized } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";
import { readFile, access } from "fs/promises";
import { join } from "path";

const patchSchema = z.object({ id: z.string().uuid(), comment: z.string().trim().max(3000).optional() });

const LEADS_FILE = join(process.cwd(), "leads.json");

type FileLead = {
  id: string;
  type: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  telegram?: string | null;
  comment?: string | null;
  vehicleId?: string | null;
  source?: string | null;
  savedAt: string;
};

async function getLeadsFromFile(): Promise<FileLead[]> {
  try {
    await access(LEADS_FILE);
    const data = await readFile(LEADS_FILE, "utf-8");
    return JSON.parse(data || "[]") as FileLead[];
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  const { page, perPage } = parsePagination(new URL(request.url).searchParams);

  // Prefer file-based leads when database is unavailable (matches the email fallback)
  let fileLeads: FileLead[] = [];
  let dbError = false;
  try {
    fileLeads = await getLeadsFromFile();
  } catch {
    fileLeads = [];
  }

  let dbLeads: Array<Record<string, unknown>> = [];
  let total = fileLeads.length;
  try {
    [dbLeads, total] = await Promise.all([
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage, include: { vehicle: { select: { make: true, model: true, year: true, slug: true } } } }),
      prisma.lead.count(),
    ]);
  } catch {
    dbError = true;
  }

  const leads = dbError || dbLeads.length === 0
    ? fileLeads
        .slice()
        .reverse()
        .slice((page - 1) * perPage, page * perPage)
        .map((lead) => ({
          id: lead.id,
          createdAt: lead.savedAt,
          type: lead.type,
          name: lead.name ?? "—",
          phone: lead.phone ?? null,
          email: lead.email ?? null,
          telegram: lead.telegram ?? null,
          comment: lead.comment ?? null,
          consentGiven: true,
          vehicle: lead.vehicleId ? { make: "", model: lead.vehicleId, year: 0, slug: lead.vehicleId } : null,
        }))
    : dbLeads;

  if (dbError) {
    total = fileLeads.length;
  }

  return Response.json({ success: true, data: leads, meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } });
}

export async function PATCH(request: Request) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  const parsed = patchSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Неверные данные" } }, { status: 422 });
  try { const lead = await prisma.lead.update({ where: { id: parsed.data.id }, data: parsed.data.comment === undefined ? {} : { comment: parsed.data.comment } }); return Response.json({ success: true, data: lead }); } catch { return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Заявка не найдена" } }, { status: 404 }); }
}
