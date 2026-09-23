import { z } from "zod";
import { readAdminToken, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateFinancials } from "@/lib/financial";
import { CurrencyCode, VehicleCountry } from "@/generated/prisma/client";

const schema = z.object({
  vehiclePrice: z.coerce.number().nonnegative(), currency: z.nativeEnum(CurrencyCode), country: z.nativeEnum(VehicleCountry),
  shippingCost: z.coerce.number().nonnegative().optional(), customsCost: z.coerce.number().nonnegative().optional(), utilisationFee: z.coerce.number().nonnegative().optional(), brokerageCost: z.coerce.number().nonnegative().optional(), otherCosts: z.coerce.number().nonnegative().optional(), commission: z.coerce.number().nonnegative().optional(),
});

export async function POST(request: Request) {
  if (!readAdminToken(request.headers.get("authorization"))) return unauthorized();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Проверьте финансовые параметры", details: parsed.error.flatten() } }, { status: 422 });
  try {
    const settings = await prisma.settings.findFirst({ orderBy: { updatedAt: "desc" } });
    const rates = settings ? { JPY: Number(settings.jpyRate), KRW: Number(settings.krwRate), CNY: Number(settings.cnyRate) } : {};
    const result = calculateFinancials(parsed.data, rates, settings ? Number(settings.defaultCommission) : undefined);
    return Response.json({ success: true, data: result });
  } catch (error) { return Response.json({ success: false, error: { code: "CALCULATION_ERROR", message: error instanceof Error ? error.message : "Не удалось выполнить расчёт" } }, { status: 422 }); }
}
