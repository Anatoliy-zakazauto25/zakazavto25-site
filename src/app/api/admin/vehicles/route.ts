import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readAdminToken, unauthorized } from "@/lib/auth";
import { CurrencyCode, Drivetrain, FuelType, Transmission, VehicleCountry, VehicleStatus } from "@/generated/prisma/client";
import { audit } from "@/lib/audit";
import { parsePagination } from "@/lib/pagination";

const vehicleSchema = z.object({
  make: z.string().trim().min(1), model: z.string().trim().min(1), generation: z.string().trim().optional(),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  country: z.nativeEnum(VehicleCountry), mileage: z.coerce.number().int().min(0), engine: z.string().trim().min(1),
  engineVolume: z.coerce.number().int().positive().optional(), power: z.coerce.number().int().min(0),
  transmission: z.nativeEnum(Transmission), drivetrain: z.nativeEnum(Drivetrain), fuel: z.nativeEnum(FuelType),
  bodyType: z.string().trim().min(1), color: z.string().trim().optional(), vin: z.string().trim().optional(), trim: z.string().trim().optional(),
  vehiclePrice: z.coerce.number().nonnegative(), vehiclePriceCurrency: z.nativeEnum(CurrencyCode),
  shippingCost: z.coerce.number().nonnegative().optional(), customsCost: z.coerce.number().nonnegative().optional(), utilisationFee: z.coerce.number().nonnegative().optional(), brokerageCost: z.coerce.number().nonnegative().optional(), otherCosts: z.coerce.number().nonnegative().optional(), commission: z.coerce.number().nonnegative(), totalCost: z.coerce.number().nonnegative(),
  showPricePublic: z.boolean().default(false), publicPrice: z.coerce.number().nonnegative().optional(), status: z.nativeEnum(VehicleStatus).default(VehicleStatus.AVAILABLE), description: z.string().trim().optional(), internalNotes: z.string().trim().optional(), isPublished: z.boolean().default(false), isFeatured: z.boolean().default(false), slug: z.string().trim().min(3).regex(/^[a-z0-9-]+$/), metaTitle: z.string().trim().optional(), metaDescription: z.string().trim().optional(),
});

function access(request: Request) { return readAdminToken(request.headers.get("authorization")); }
function serialize<T extends Record<string, unknown>>(item: T) { return Object.fromEntries(Object.entries(item).map(([key, value]) => [key, typeof value === "object" && value && "toFixed" in value ? Number(value) : value])); }

export async function GET(request: Request) {
  const token = access(request); if (!token) return unauthorized();
  const { searchParams } = new URL(request.url); const { page, perPage } = parsePagination(searchParams); const search = searchParams.get("search")?.trim().slice(0, 100);
  const where = search ? { OR: [{ make: { contains: search, mode: "insensitive" as const } }, { model: { contains: search, mode: "insensitive" as const } }] } : {};
  const [items, total] = await Promise.all([prisma.vehicle.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (page - 1) * perPage, take: perPage }), prisma.vehicle.count({ where })]);
  return Response.json({ success: true, data: items.map((item) => serialize(item)), meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } });
}

export async function POST(request: Request) {
  const token = access(request); if (!token) return unauthorized();
  const parsed = vehicleSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Проверьте поля автомобиля", details: parsed.error.flatten() } }, { status: 422 });
  const data = parsed.data; const existing = await prisma.vehicle.findUnique({ where: { slug: data.slug } }); if (existing) return Response.json({ success: false, error: { code: "CONFLICT", message: "Такой slug уже существует" } }, { status: 409 });
  const item = await prisma.vehicle.create({ data: { ...data, createdById: token.userId, updatedById: token.userId } });
  await audit({ userId: token.userId, action: "CREATE", entityType: "Vehicle", entityId: item.id, request, metadata: { isPublished: item.isPublished, isFeatured: item.isFeatured } });
  return Response.json({ success: true, data: serialize(item) }, { status: 201 });
}
