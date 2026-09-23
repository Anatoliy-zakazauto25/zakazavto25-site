import { z } from "zod";
import { CurrencyCode, VehicleCountry } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { readAdminToken, unauthorized } from "@/lib/auth";
import { calculateFinancials } from "@/lib/financial";
import { audit } from "@/lib/audit";

const schema = z.object({ vehiclePrice: z.coerce.number().nonnegative(), currency: z.nativeEnum(CurrencyCode), country: z.nativeEnum(VehicleCountry), shippingCost: z.coerce.number().nonnegative().default(0), customsCost: z.coerce.number().nonnegative().default(0), utilisationFee: z.coerce.number().nonnegative().default(0), brokerageCost: z.coerce.number().nonnegative().default(0), otherCosts: z.coerce.number().nonnegative().default(0), commission: z.coerce.number().nonnegative().optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = readAdminToken(request.headers.get("authorization")); if (!token) return unauthorized();
  const orderId = (await params).id; const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Проверьте параметры расчёта", details: parsed.error.flatten() } }, { status: 422 });
  const settings = await prisma.settings.findFirst({ orderBy: { updatedAt: "desc" } }); const rates = settings ? { JPY: Number(settings.jpyRate), KRW: Number(settings.krwRate), CNY: Number(settings.cnyRate) } : {};
  try { const result = calculateFinancials(parsed.data, rates, settings ? Number(settings.defaultCommission) : undefined); const order = await prisma.order.update({ where: { id: orderId }, data: { vehiclePrice: parsed.data.vehiclePrice, currency: parsed.data.currency, currencyRate: result.currencyRate, shippingCost: result.shippingCost, customsCost: result.customsCost, utilisationFee: result.utilisationFee, brokerageCost: result.brokerageCost, otherCosts: result.otherCosts, commission: result.commission, totalCost: result.totalCost } }); await audit({ userId: token.userId, action: "UPDATE_PRICING", entityType: "Order", entityId: order.id, request, metadata: { pricingPublic: false } }); return Response.json({ success: true, data: { ...result, orderId: order.id } }); } catch (error) { return Response.json({ success: false, error: { code: "CALCULATION_ERROR", message: error instanceof Error ? error.message : "Не удалось сохранить расчёт" } }, { status: 422 }); }
}
