import { FuelType, Prisma, Transmission, VehicleCountry, VehicleStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { vehicles as fallbackVehicles, type MockVehicle } from "@/lib/mock-data";

export type PublicVehicle = MockVehicle & {
  id: string;
  slug: string;
  description?: string | null;
  engineVolume?: number | null;
  power?: number;
  fuel?: string;
  transmission?: string;
  color?: string | null;
  bodyType?: string;
  publicPrice?: number | null;
  images: string[];
  inspection?: { bodyCondition: string; engineCondition: string; mileageVerified: boolean; documentsVerified: boolean; isPublic: boolean } | null;
};

const countryLabels: Record<VehicleCountry, string> = { JAPAN: "Япония", KOREA: "Корея", CHINA: "Китай" };
const statusLabels: Record<VehicleStatus, string> = { AVAILABLE: "Доступен", RESERVED: "Зарезервирован", IN_VERIFICATION: "На проверке", VERIFIED: "Проверен", PURCHASED: "Выкуплен", IN_TRANSIT: "В пути", ARRIVED_VLADIVOSTOK: "Во Владивостоке", CUSTOMS_CLEARANCE: "Таможенное оформление", DELIVERY_RUSSIA: "Доставка по России", DELIVERED: "Выдан клиенту", SOLD: "Продан", UNAVAILABLE: "Недоступен" };
const fuelLabels: Record<FuelType, string> = { PETROL: "Бензин", DIESEL: "Дизель", HYBRID: "Гибрид", ELECTRIC: "Электро", GAS: "Газ" };
const transmissionLabels: Record<Transmission, string> = { MANUAL: "Механика", AUTOMATIC: "Автомат", CVT: "Вариатор", ROBOT: "Робот" };
const driveLabels = { FWD: "FWD", RWD: "RWD", AWD: "AWD", FOUR_WD: "4WD" } as const;

function fallback(): PublicVehicle[] { return fallbackVehicles.map((vehicle) => ({ ...vehicle, slug: vehicle.id, images: [vehicle.image], description: null, engineVolume: null, power: 0, fuel: undefined, transmission: undefined, color: null, bodyType: "", publicPrice: null, inspection: null })); }

function mapVehicle(vehicle: Prisma.VehicleGetPayload<{ include: { media: true } }>): PublicVehicle {
  const images = vehicle.media.filter((media) => media.isPublic && media.type === "PHOTO").sort((a, b) => a.sortOrder - b.sortOrder).map((media) => media.url);
  const engine = vehicle.engineVolume ? `${(vehicle.engineVolume / 1000).toFixed(1)} л · ${fuelLabels[vehicle.fuel]}` : vehicle.engine;
  return { id: vehicle.id, slug: vehicle.slug, name: `${vehicle.make} ${vehicle.model}`, country: countryLabels[vehicle.country], year: vehicle.year, mileage: `${vehicle.mileage.toLocaleString("ru-RU")} км`, engine, drive: driveLabels[vehicle.drivetrain], price: vehicle.showPricePublic && vehicle.publicPrice !== null ? `${Number(vehicle.publicPrice).toLocaleString("ru-RU")} ₽` : "Цена по запросу", status: statusLabels[vehicle.status], tag: vehicle.isFeatured ? "Выбор недели" : statusLabels[vehicle.status], image: images[0] ?? "/3b3f36aa-3ec5-4cc8-acbd-0627af41f59a.jpg", description: vehicle.description, engineVolume: vehicle.engineVolume, power: vehicle.power, fuel: fuelLabels[vehicle.fuel], transmission: transmissionLabels[vehicle.transmission], color: vehicle.color, bodyType: vehicle.bodyType, publicPrice: vehicle.publicPrice === null ? null : Number(vehicle.publicPrice), images: images.length ? images : ["/3b3f36aa-3ec5-4cc8-acbd-0627af41f59a.jpg"] };
}

export async function getPublicVehicles(filters?: { country?: string; make?: string; model?: string }) {
  if (!process.env.DATABASE_URL) return fallback();
  try {
    const country = filters?.country?.toUpperCase() as VehicleCountry | undefined;
    const items = await prisma.vehicle.findMany({ where: { isPublished: true, status: { notIn: [VehicleStatus.SOLD, VehicleStatus.UNAVAILABLE] }, ...(country && Object.values(VehicleCountry).includes(country) ? { country } : {}), ...(filters?.make ? { make: { equals: filters.make, mode: "insensitive" } } : {}), ...(filters?.model ? { model: { contains: filters.model, mode: "insensitive" } } : {}) }, include: { media: true }, orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }] });
    return items.map(mapVehicle);
  } catch { return fallback(); }
}

export async function getPublicVehicle(slug: string) {
  if (!process.env.DATABASE_URL) return fallback().find((vehicle) => vehicle.slug === slug) ?? null;
  try { const item = await prisma.vehicle.findFirst({ where: { slug, isPublished: true, status: { notIn: [VehicleStatus.SOLD, VehicleStatus.UNAVAILABLE] } }, include: { media: true, inspection: true } }); return item ? { ...mapVehicle(item), inspection: item.inspection?.isPublic ? { bodyCondition: item.inspection.bodyCondition, engineCondition: item.inspection.engineCondition, mileageVerified: item.inspection.mileageVerified, documentsVerified: item.inspection.documentsVerified, isPublic: true } : null, viewCount: item.viewCount } : null; } catch { return fallback().find((vehicle) => vehicle.slug === slug) ?? null; }
}
