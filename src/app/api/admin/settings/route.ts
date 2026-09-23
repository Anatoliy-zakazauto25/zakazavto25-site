import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readAdminToken, unauthorized } from "@/lib/auth";
import { audit } from "@/lib/audit";

const settingsSchema = z.object({
  defaultCommission: z.coerce.number().finite().nonnegative().optional(),
  currencyRates: z.object({ JPY: z.coerce.number().finite().positive().optional(), KRW: z.coerce.number().finite().positive().optional(), CNY: z.coerce.number().finite().positive().optional() }).optional(),
  companyPhone: z.string().trim().max(40).nullable().optional(), companyEmail: z.string().trim().email().nullable().optional(), companyTelegram: z.string().trim().max(100).nullable().optional(), companyAddress: z.string().trim().min(5).max(300).optional(), workingHours: z.string().trim().max(200).nullable().optional(), siteTitle: z.string().trim().min(1).max(120).optional(), siteDescription: z.string().trim().min(1).max(500).optional(),
});

function present(settings: Awaited<ReturnType<typeof prisma.settings.findFirst>>) {
  if (!settings) return null;
  return { id: settings.id, defaultCommission: Number(settings.defaultCommission), currencyRates: { JPY: Number(settings.jpyRate), KRW: Number(settings.krwRate), CNY: Number(settings.cnyRate), updatedAt: settings.updatedAt }, companyPhone: settings.companyPhone, companyEmail: settings.companyEmail, companyTelegram: settings.companyTelegram, companyAddress: settings.companyAddress, workingHours: settings.workingHours, siteTitle: settings.siteTitle, siteDescription: settings.siteDescription };
}

export async function GET(request: Request) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  const settings = await prisma.settings.findFirst({ orderBy: { updatedAt: "desc" } });
  return Response.json({ success: true, data: present(settings) });
}

export async function PATCH(request: Request) {
  const token = readAdminToken(request.headers.get("authorization")); if (!token) return unauthorized();
  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Проверьте настройки", details: parsed.error.flatten() } }, { status: 422 });
  const { currencyRates, ...data } = parsed.data;
  const current = await prisma.settings.findFirst({ orderBy: { updatedAt: "desc" } });
  if (!current) return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Настройки ещё не инициализированы" } }, { status: 404 });
  const settings = await prisma.settings.update({ where: { id: current.id }, data: { ...data, defaultCommission: data.defaultCommission ?? current.defaultCommission, companyAddress: data.companyAddress ?? current.companyAddress, siteTitle: data.siteTitle ?? current.siteTitle, siteDescription: data.siteDescription ?? current.siteDescription, jpyRate: currencyRates?.JPY ?? current.jpyRate, krwRate: currencyRates?.KRW ?? current.krwRate, cnyRate: currencyRates?.CNY ?? current.cnyRate, updatedById: token.userId } });
  await audit({ userId: token.userId, action: "UPDATE", entityType: "Settings", entityId: settings.id, request });
  return Response.json({ success: true, data: present(settings) });
}
